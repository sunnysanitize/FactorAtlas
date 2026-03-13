"""Portfolio management routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.portfolio import (
    CSVUploadResponse,
    HoldingCreate,
    HoldingResponse,
    PortfolioCreate,
    PortfolioResponse,
    PortfolioSummaryResponse,
)
from app.services.portfolio_service import (
    add_holdings,
    create_portfolio,
    get_portfolio,
    get_portfolios,
)
from app.utils.csv_parser import parse_csv

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.post("", response_model=PortfolioResponse)
def create_portfolio_route(data: PortfolioCreate, db: Session = Depends(get_db)):
    portfolio = create_portfolio(db, data)
    return portfolio


@router.get("", response_model=list[PortfolioSummaryResponse])
def list_portfolios_route(db: Session = Depends(get_db)):
    portfolios = get_portfolios(db)
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
def get_portfolio_route(portfolio_id: uuid.UUID, db: Session = Depends(get_db)):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.post("/{portfolio_id}/holdings", response_model=list[HoldingResponse])
def add_holdings_route(
    portfolio_id: uuid.UUID,
    holdings: list[HoldingCreate],
    db: Session = Depends(get_db),
):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    add_holdings(db, portfolio_id, holdings)
    db.refresh(portfolio)
    return portfolio.holdings


@router.post("/{portfolio_id}/upload-csv", response_model=CSVUploadResponse)
async def upload_csv_route(
    portfolio_id: uuid.UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
):
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    holdings, errors = parse_csv(content)

    if not holdings and errors:
        raise HTTPException(status_code=400, detail=f"CSV parsing failed: {'; '.join(errors)}")

    added, merged = add_holdings(db, portfolio_id, holdings)

    return CSVUploadResponse(
        holdings_added=added,
        holdings_merged=merged,
        errors=errors,
    )
