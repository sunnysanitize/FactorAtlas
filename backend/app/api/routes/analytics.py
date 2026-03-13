"""Analytics and quant routes."""

import uuid

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.analytics import (
    CorrelationMatrixResponse,
    HistoryResponse,
    OverviewResponse,
    RiskResponse,
    ThemeExposureResponse,
)
from app.services.market_data_service import (
    fetch_benchmark_history,
    fetch_current_price,
    fetch_multiple_histories,
)
from app.services.portfolio_service import get_portfolio
from app.services.quant_service import (
    compute_annualized_volatility,
    compute_beta,
    compute_concentration_metrics,
    compute_correlation_matrix,
    compute_cumulative_returns,
    compute_cvar_95,
    compute_daily_returns,
    compute_max_drawdown,
    compute_portfolio_returns,
    compute_risk_contribution,
    compute_rolling_beta,
    compute_rolling_sharpe,
    compute_rolling_volatility,
    compute_sharpe_ratio,
    compute_var_95,
)
from app.services.theme_service import get_sector_exposure, get_theme_exposure
from app.utils.cache import analytics_cache

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["analytics"])


def _analytics_cache_key(portfolio) -> str:
    latest_holding_update = max(
        (h.updated_at.isoformat() for h in portfolio.holdings),
        default="no-holdings",
    )
    return f"analytics:{portfolio.id}:{portfolio.updated_at.isoformat()}:{latest_holding_update}:{len(portfolio.holdings)}"


def _build_analytics(portfolio_id: uuid.UUID, db: Session):
    """Shared analytics computation used by overview, risk, and history endpoints."""
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = portfolio.holdings
    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")

    cache_key = _analytics_cache_key(portfolio)
    cached = analytics_cache.get(cache_key)
    if cached is not None:
        return cached

    tickers = [h.ticker for h in holdings]

    # Fetch current prices
    current_prices = {}
    for t in tickers:
        price = fetch_current_price(t)
        if price is not None:
            current_prices[t] = price

    # Compute market values and weights
    market_values = {}
    for h in holdings:
        price = current_prices.get(h.ticker, h.average_cost)
        market_values[h.ticker] = h.shares * price

    total_value = sum(market_values.values())
    weights = {t: v / total_value for t, v in market_values.items()} if total_value > 0 else {}

    # Fetch price histories
    histories = fetch_multiple_histories(tickers)
    benchmark_hist = fetch_benchmark_history()

    # Compute daily returns for each ticker
    ticker_returns = {}
    for t, df in histories.items():
        if not df.empty:
            series = pd.Series(df["AdjClose"].values, index=pd.to_datetime(df["Date"]))
            ticker_returns[t] = compute_daily_returns(series)

    # Benchmark returns
    bench_returns = pd.Series(dtype=float)
    if not benchmark_hist.empty:
        bench_series = pd.Series(
            benchmark_hist["AdjClose"].values,
            index=pd.to_datetime(benchmark_hist["Date"]),
        )
        bench_returns = compute_daily_returns(bench_series)

    # Portfolio returns
    port_returns = compute_portfolio_returns(weights, ticker_returns)
    cum_returns = compute_cumulative_returns(port_returns)

    # Metrics
    volatility = compute_annualized_volatility(port_returns)
    beta = compute_beta(port_returns, bench_returns)
    sharpe = compute_sharpe_ratio(port_returns)
    max_dd = compute_max_drawdown(cum_returns)
    var_95 = compute_var_95(port_returns)
    cvar_95 = compute_cvar_95(port_returns)
    concentration = compute_concentration_metrics(weights)

    analytics = {
        "portfolio": portfolio,
        "holdings": holdings,
        "tickers": tickers,
        "current_prices": current_prices,
        "market_values": market_values,
        "total_value": total_value,
        "weights": weights,
        "ticker_returns": ticker_returns,
        "bench_returns": bench_returns,
        "port_returns": port_returns,
        "cum_returns": cum_returns,
        "volatility": volatility,
        "beta": beta,
        "sharpe": sharpe,
        "max_dd": max_dd,
        "var_95": var_95,
        "cvar_95": cvar_95,
        "concentration": concentration,
    }
    analytics_cache.set(cache_key, analytics)
    return analytics


@router.get("/overview", response_model=OverviewResponse)
def get_overview(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    a = _build_analytics(portfolio_id, db)

    # Build holdings analytics
    holdings_analytics = []
    for h in a["holdings"]:
        price = a["current_prices"].get(h.ticker, h.average_cost)
        mv = a["market_values"].get(h.ticker, 0)
        cost_basis = h.shares * h.average_cost
        gl = mv - cost_basis
        gl_pct = gl / cost_basis if cost_basis > 0 else 0

        daily_ret = None
        tr = a["ticker_returns"].get(h.ticker)
        if tr is not None and not tr.empty:
            daily_ret = float(tr.iloc[-1])

        holdings_analytics.append({
            "ticker": h.ticker,
            "company_name": h.company_name,
            "shares": h.shares,
            "average_cost": h.average_cost,
            "current_price": price,
            "market_value": round(mv, 2),
            "weight": round(a["weights"].get(h.ticker, 0), 4),
            "unrealized_gain_loss": round(gl, 2),
            "unrealized_gain_loss_pct": round(gl_pct, 4),
            "daily_return": daily_ret,
            "sector": h.sector,
            "primary_theme": h.primary_theme,
            "beta": None,
            "volatility_contribution": None,
        })

    # Portfolio value series
    if not a["cum_returns"].empty:
        portfolio_value_series = [
            {"date": str(d.date() if hasattr(d, 'date') else d), "value": round(float(a["total_value"] * (1 + v)), 2)}
            for d, v in a["cum_returns"].items()
        ]
        cum_return_series = [
            {"date": str(d.date() if hasattr(d, 'date') else d), "value": round(float(v), 6)}
            for d, v in a["cum_returns"].items()
        ]
    else:
        portfolio_value_series = []
        cum_return_series = []

    # Sector and theme allocation
    sector_alloc = get_sector_exposure(a["holdings"], a["weights"])
    theme_alloc = get_theme_exposure(a["holdings"], a["weights"])

    # Top sector/theme
    top_sector = sector_alloc[0]["name"] if sector_alloc else None
    top_theme = theme_alloc[0]["name"] if theme_alloc else None
    top_holding = max(a["weights"], key=a["weights"].get) if a["weights"] else None

    daily_ret = float(a["port_returns"].iloc[-1]) if not a["port_returns"].empty else None
    cum_ret = float(a["cum_returns"].iloc[-1]) if not a["cum_returns"].empty else None

    return OverviewResponse(
        total_value=round(a["total_value"], 2),
        daily_return=daily_ret,
        cumulative_return=cum_ret,
        annualized_volatility=a["volatility"],
        beta=a["beta"],
        sharpe_ratio=a["sharpe"],
        max_drawdown=a["max_dd"],
        var_95=a["var_95"],
        holdings_count=len(a["holdings"]),
        top_holding=top_holding,
        top_sector=top_sector,
        top_theme=top_theme,
        concentration=a["concentration"],
        holdings=holdings_analytics,
        portfolio_value_series=portfolio_value_series[-252:],
        cumulative_return_series=cum_return_series[-252:],
        sector_allocation=sector_alloc,
        theme_allocation=theme_alloc,
    )


@router.get("/risk", response_model=RiskResponse)
def get_risk(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    a = _build_analytics(portfolio_id, db)

    risk_contributors = compute_risk_contribution(a["weights"], a["ticker_returns"])
    rolling_vol = compute_rolling_volatility(a["port_returns"])
    rolling_b = compute_rolling_beta(a["port_returns"], a["bench_returns"])
    rolling_s = compute_rolling_sharpe(a["port_returns"])

    return RiskResponse(
        annualized_volatility=a["volatility"],
        beta=a["beta"],
        sharpe_ratio=a["sharpe"],
        max_drawdown=a["max_dd"],
        var_95=a["var_95"],
        cvar_95=a["cvar_95"],
        concentration=a["concentration"],
        risk_contributors=risk_contributors,
        rolling_volatility=rolling_vol[-252:],
        rolling_beta=rolling_b[-252:],
        rolling_sharpe=rolling_s[-252:],
    )


@router.get("/correlations", response_model=CorrelationMatrixResponse)
def get_correlations(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    a = _build_analytics(portfolio_id, db)
    tickers, matrix = compute_correlation_matrix(a["ticker_returns"])
    return CorrelationMatrixResponse(tickers=tickers, matrix=matrix)


@router.get("/themes", response_model=ThemeExposureResponse)
def get_themes(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    a = _build_analytics(portfolio_id, db)
    sector_exp = get_sector_exposure(a["holdings"], a["weights"])
    theme_exp = get_theme_exposure(a["holdings"], a["weights"])
    return ThemeExposureResponse(sector_exposure=sector_exp, theme_exposure=theme_exp)


@router.get("/history", response_model=HistoryResponse)
def get_history(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    a = _build_analytics(portfolio_id, db)

    value_series = []
    daily_series = []
    cum_series = []

    if not a["cum_returns"].empty:
        for d, v in a["cum_returns"].items():
            date_str = str(d.date() if hasattr(d, 'date') else d)
            value_series.append({"date": date_str, "value": round(float(a["total_value"] * (1 + v)), 2)})
            cum_series.append({"date": date_str, "value": round(float(v), 6)})

    if not a["port_returns"].empty:
        for d, v in a["port_returns"].items():
            daily_series.append({"date": str(d.date() if hasattr(d, 'date') else d), "value": round(float(v), 6)})

    return HistoryResponse(
        portfolio_value=value_series[-504:],
        daily_returns=daily_series[-504:],
        cumulative_returns=cum_series[-504:],
    )
