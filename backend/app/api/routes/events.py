"""News/event routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.schemas.events import EventsListResponse
from app.services.news_service import get_portfolio_events, ingest_events
from app.services.portfolio_service import get_portfolio

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["events"])


@router.get("/events", response_model=EventsListResponse)
def get_events(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    tickers = [h.ticker for h in portfolio.holdings]

    events = get_portfolio_events(db, tickers)
    return EventsListResponse(events=events, total=len(events))


@router.post("/events/refresh", response_model=EventsListResponse)
def refresh_events(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    portfolio = get_portfolio(db, portfolio_id)
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
