"""Portfolio management routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.user import User
from app.services.news_service import ingest_events
from app.schemas.portfolio import (
    CSVUploadResponse,
    HoldingCreate,
    HoldingResponse,
    HoldingUpdate,
    PortfolioCreate,
    PortfolioResponse,
    PortfolioSummaryResponse,
)
from app.services.portfolio_service import (
    add_holdings,
    create_portfolio_for_user,
    delete_holding,
    get_portfolio_for_user,
    get_portfolios_for_user,
    update_holding,
)
from app.utils.csv_parser import parse_csv

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


def _ingest_events_for_tickers(db: Session, tickers: list[str]) -> None:
    if not settings.ENABLE_EXTERNAL_NEWS_FETCH:
        return

    unique_tickers = list(dict.fromkeys(ticker for ticker in tickers if ticker))
    if not unique_tickers:
        return

    try:
        ingest_events(db, unique_tickers)
    except Exception:
        # Event ingestion is best-effort and should never block portfolio mutations.
        pass


@router.post("", response_model=PortfolioResponse)
def create_portfolio_route(
    data: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = create_portfolio_for_user(db, current_user, data)
    return portfolio


@router.get("", response_model=list[PortfolioSummaryResponse])
def list_portfolios_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolios = get_portfolios_for_user(db, current_user)
    result = []
    for p in portfolios:
        result.append(PortfolioSummaryResponse(
            id=p.id,
            name=p.name,
            created_at=p.created_at,
            holding_count=len(p.holdings),
        ))
    return result


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio_route(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.post("/{portfolio_id}/holdings", response_model=list[HoldingResponse])
def add_holdings_route(
    portfolio_id: uuid.UUID,
    holdings: list[HoldingCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    existing_tickers = {holding.ticker for holding in portfolio.holdings}
    add_holdings(db, portfolio_id, holdings)
    db.refresh(portfolio)
    new_tickers = [
        holding.ticker
        for holding in holdings
        if holding.ticker not in existing_tickers
    ]
    _ingest_events_for_tickers(db, new_tickers)
    return portfolio.holdings


@router.put("/{portfolio_id}/holdings/{holding_id}", response_model=HoldingResponse)
def update_holding_route(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    data: HoldingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holding = update_holding(db, portfolio_id, holding_id, HoldingCreate(**data.model_dump()))
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    return holding


@router.delete("/{portfolio_id}/holdings/{holding_id}", status_code=204)
def delete_holding_route(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    deleted = delete_holding(db, portfolio_id, holding_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Holding not found")
    return Response(status_code=204)


@router.post("/{portfolio_id}/upload-csv", response_model=CSVUploadResponse)
async def upload_csv_route(
    portfolio_id: uuid.UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    holdings, errors = parse_csv(content)

    if not holdings and errors:
        raise HTTPException(status_code=400, detail=f"CSV parsing failed: {'; '.join(errors)}")

    existing_tickers = {holding.ticker for holding in portfolio.holdings}
    added, merged = add_holdings(db, portfolio_id, holdings)
    new_tickers = [
        holding.ticker
        for holding in holdings
        if holding.ticker not in existing_tickers
    ]
    _ingest_events_for_tickers(db, new_tickers)

    return CSVUploadResponse(
        holdings_added=added,
        holdings_merged=merged,
        errors=errors,
    )
