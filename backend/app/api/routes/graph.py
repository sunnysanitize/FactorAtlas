"""Graph relationship routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.graph import GraphResponse
from app.services.graph_service import build_graph
from app.services.market_data_service import fetch_current_price, fetch_multiple_histories
from app.services.news_service import get_portfolio_events
from app.services.portfolio_service import get_portfolio
from app.services.quant_service import compute_correlation_matrix, compute_daily_returns
import pandas as pd

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["graph"])


@router.get("/graph", response_model=GraphResponse)
def get_graph(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = portfolio.holdings
    if not holdings:
        return GraphResponse(nodes=[], edges=[])

    tickers = [h.ticker for h in holdings]

    # Compute weights
    current_prices = {}
    for t in tickers:
        p = fetch_current_price(t)
        if p is not None:
            current_prices[t] = p

    market_values = {h.ticker: h.shares * current_prices.get(h.ticker, h.average_cost) for h in holdings}
    total_value = sum(market_values.values())
    weights = {t: v / total_value for t, v in market_values.items()} if total_value > 0 else {}

    # Compute correlations
    histories = fetch_multiple_histories(tickers)
    ticker_returns = {}
    for t, df in histories.items():
        if not df.empty:
            series = pd.Series(df["AdjClose"].values, index=pd.to_datetime(df["Date"]))
            ticker_returns[t] = compute_daily_returns(series)

    corr = compute_correlation_matrix(ticker_returns) if ticker_returns else None

    # Get events
    events = get_portfolio_events(db, tickers, limit=10)

    graph = build_graph(holdings, weights, corr, events)
    return GraphResponse(**graph)
