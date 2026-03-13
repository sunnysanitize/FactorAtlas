"""News/event routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.events import EventPropagationResponse, EventsListResponse
from app.services.event_propagation_service import build_event_propagation
from app.services.market_data_service import fetch_current_price
from app.services.news_service import get_portfolio_events, ingest_events
from app.services.portfolio_service import get_portfolio_for_user

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["events"])


@router.get("/events", response_model=EventsListResponse)
def get_events(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    tickers = [h.ticker for h in portfolio.holdings]

    events = get_portfolio_events(db, tickers)
    return EventsListResponse(events=events, total=len(events))


@router.post("/events/refresh", response_model=EventsListResponse)
def refresh_events(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if not settings.ENABLE_EXTERNAL_NEWS_FETCH:
        raise HTTPException(status_code=403, detail="External news refresh is disabled by configuration")

    tickers = [h.ticker for h in portfolio.holdings]

    try:
        ingest_events(db, tickers)
    except Exception:
        pass

    events = get_portfolio_events(db, tickers)
    return EventsListResponse(events=events, total=len(events))


@router.get("/events/propagation", response_model=EventPropagationResponse)
def get_event_propagation(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    tickers = [h.ticker for h in portfolio.holdings]
    events = get_portfolio_events(db, tickers)

    current_prices = {}
    for holding in portfolio.holdings:
        price = fetch_current_price(holding.ticker)
        current_prices[holding.ticker] = price if price is not None else holding.average_cost

    market_values = {holding.ticker: holding.shares * current_prices[holding.ticker] for holding in portfolio.holdings}
    total_value = sum(market_values.values())
    weights = {ticker: value / total_value for ticker, value in market_values.items()} if total_value > 0 else {}

    return EventPropagationResponse(events=build_event_propagation(events, portfolio.holdings, weights))
