"""Quantitative finance engine. All numeric calculations happen here — never in the AI layer."""

import logging

import numpy as np
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

TRADING_DAYS = 252


def compute_daily_returns(prices: pd.Series) -> pd.Series:
    """Compute daily percentage returns from a price series."""
    return prices.pct_change().dropna()


def compute_portfolio_returns(
    holdings_weights: dict[str, float],
    ticker_returns: dict[str, pd.Series],
) -> pd.Series:
    """Compute weighted portfolio daily returns.

    Args:
        holdings_weights: {ticker: portfolio_weight}
        ticker_returns: {ticker: daily_return_series}
    """
    aligned = pd.DataFrame(ticker_returns)
    aligned = aligned.dropna(how="all")
    aligned = aligned.fillna(0.0)

    weights = pd.Series(holdings_weights)
    common_tickers = list(set(aligned.columns) & set(weights.index))
    if not common_tickers:
        return pd.Series(dtype=float)

    aligned = aligned[common_tickers]
    w = weights[common_tickers]
    w = w / w.sum()  # renormalize

    portfolio_returns = aligned.dot(w)
    return portfolio_returns


def compute_cumulative_returns(daily_returns: pd.Series) -> pd.Series:
    """Compute cumulative return series from daily returns."""
    return (1 + daily_returns).cumprod() - 1


def compute_annualized_volatility(daily_returns: pd.Series) -> float | None:
    """Annualized volatility = std(daily_returns) * sqrt(252)."""
    if daily_returns.empty or len(daily_returns) < 2:
        return None
    return float(daily_returns.std() * np.sqrt(TRADING_DAYS))


def compute_beta(
    portfolio_returns: pd.Series,
    benchmark_returns: pd.Series,
) -> float | None:
    """Beta = cov(port, bench) / var(bench)."""
    aligned = pd.DataFrame({"port": portfolio_returns, "bench": benchmark_returns}).dropna()
    if len(aligned) < 10:
        return None
    cov = aligned["port"].cov(aligned["bench"])
    var = aligned["bench"].var()
    if var == 0:
        return None
    return float(cov / var)


def compute_sharpe_ratio(
    daily_returns: pd.Series,
    risk_free_rate: float | None = None,
) -> float | None:
    """Sharpe = (annualized_return - risk_free_rate) / annualized_volatility."""
    if daily_returns.empty or len(daily_returns) < 10:
        return None
    rfr = risk_free_rate if risk_free_rate is not None else settings.RISK_FREE_RATE
    ann_return = float(daily_returns.mean() * TRADING_DAYS)
    ann_vol = compute_annualized_volatility(daily_returns)
    if ann_vol is None or ann_vol == 0:
        return None
    return float((ann_return - rfr) / ann_vol)


def compute_max_drawdown(cumulative_returns: pd.Series) -> float | None:
    """Max drawdown from cumulative return series."""
    if cumulative_returns.empty:
        return None
    wealth = 1 + cumulative_returns
    running_max = wealth.cummax()
    drawdowns = (wealth - running_max) / running_max
    return float(drawdowns.min())


def compute_var_95(daily_returns: pd.Series) -> float | None:
    """Historical 1-day VaR at 95% confidence (5th percentile)."""
    if daily_returns.empty or len(daily_returns) < 20:
        return None
    return float(daily_returns.quantile(0.05))


def compute_cvar_95(daily_returns: pd.Series) -> float | None:
    """Conditional VaR (Expected Shortfall) at 95%."""
    if daily_returns.empty or len(daily_returns) < 20:
        return None
    var = daily_returns.quantile(0.05)
    tail = daily_returns[daily_returns <= var]
    if tail.empty:
        return None
    return float(tail.mean())


def compute_concentration_metrics(weights: dict[str, float]) -> dict:
    """Compute concentration metrics from portfolio weights."""
    if not weights:
        return {"top_holding_weight": 0, "top_3_combined_weight": 0, "herfindahl_index": 0}

    sorted_weights = sorted(weights.values(), reverse=True)
    hhi = sum(w ** 2 for w in sorted_weights)

    return {
        "top_holding_weight": sorted_weights[0] if sorted_weights else 0,
        "top_3_combined_weight": sum(sorted_weights[:3]),
        "herfindahl_index": hhi,
    }


def compute_correlation_matrix(ticker_returns: dict[str, pd.Series]) -> tuple[list[str], list[list[float]]]:
    """Compute pairwise correlation matrix of daily returns."""
    df = pd.DataFrame(ticker_returns).dropna()
    if df.empty or len(df.columns) < 2:
        tickers = list(ticker_returns.keys())
        n = len(tickers)
        return tickers, [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]

    corr = df.corr()
    tickers = list(corr.columns)
    matrix = corr.values.tolist()
    # Replace NaN with 0
    matrix = [[0.0 if np.isnan(v) else round(v, 4) for v in row] for row in matrix]
    return tickers, matrix


def compute_risk_contribution(
    weights: dict[str, float],
    ticker_returns: dict[str, pd.Series],
) -> list[dict]:
    """Approximate risk contribution: weight * individual volatility.

    For a more advanced version, use covariance-adjusted marginal contribution.
    """
    contributions = []
    for ticker, weight in weights.items():
        returns = ticker_returns.get(ticker)
        if returns is None or returns.empty:
            vol = 0.0
        else:
            vol = float(returns.std() * np.sqrt(TRADING_DAYS))
        contributions.append({
            "ticker": ticker,
            "weight": weight,
            "volatility": vol,
            "contribution": weight * vol,
        })

    total = sum(c["contribution"] for c in contributions)
    if total > 0:
        for c in contributions:
            c["contribution"] = c["contribution"] / total

    contributions.sort(key=lambda x: x["contribution"], reverse=True)
    return contributions


def compute_rolling_volatility(
    daily_returns: pd.Series,
    window: int = 30,
) -> list[dict]:
    """Rolling annualized volatility."""
    if daily_returns.empty or len(daily_returns) < window:
        return []
    rolling = daily_returns.rolling(window=window).std() * np.sqrt(TRADING_DAYS)
    rolling = rolling.dropna()
    return [
        {"date": str(date), "value": round(float(val), 6)}
        for date, val in rolling.items()
    ]


def compute_rolling_beta(
    portfolio_returns: pd.Series,
    benchmark_returns: pd.Series,
    window: int = 60,
) -> list[dict]:
    """Rolling beta vs benchmark."""
    aligned = pd.DataFrame({"port": portfolio_returns, "bench": benchmark_returns}).dropna()
    if len(aligned) < window:
        return []

    results = []
    for i in range(window, len(aligned)):
        chunk = aligned.iloc[i - window : i]
        cov = chunk["port"].cov(chunk["bench"])
        var = chunk["bench"].var()
        beta = cov / var if var != 0 else 0
        results.append({"date": str(chunk.index[-1]), "value": round(float(beta), 4)})
    return results


def compute_rolling_sharpe(
    daily_returns: pd.Series,
    window: int = 60,
    risk_free_rate: float | None = None,
) -> list[dict]:
    """Rolling Sharpe ratio."""
    rfr = risk_free_rate if risk_free_rate is not None else settings.RISK_FREE_RATE
    daily_rfr = rfr / TRADING_DAYS

    if daily_returns.empty or len(daily_returns) < window:
        return []

    results = []
    for i in range(window, len(daily_returns)):
        chunk = daily_returns.iloc[i - window : i]
        excess = chunk - daily_rfr
        mean_excess = excess.mean() * TRADING_DAYS
        vol = chunk.std() * np.sqrt(TRADING_DAYS)
        sharpe = mean_excess / vol if vol != 0 else 0
        results.append({"date": str(chunk.index[-1]), "value": round(float(sharpe), 4)})
    return results
