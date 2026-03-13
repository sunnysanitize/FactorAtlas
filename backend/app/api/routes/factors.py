"""Factor intelligence and look-through routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.factors import FactorExposureResponse, LookthroughResponse
from app.services.factor_service import compute_factor_intelligence, compute_lookthrough_exposure
from app.services.market_data_service import fetch_current_price
from app.services.portfolio_service import get_portfolio_for_user

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["factors"])


def _build_weights(portfolio) -> dict[str, float]:
    current_prices = {}
    for holding in portfolio.holdings:
        price = fetch_current_price(holding.ticker)
        current_prices[holding.ticker] = price if price is not None else holding.average_cost

    market_values = {
        holding.ticker: holding.shares * current_prices.get(holding.ticker, holding.average_cost)
        for holding in portfolio.holdings
    }
    total_value = sum(market_values.values())
    if total_value <= 0:
        return {}
    return {ticker: value / total_value for ticker, value in market_values.items()}


@router.get("/factors", response_model=FactorExposureResponse)
def get_factors(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if not portfolio.holdings:
        return FactorExposureResponse(summary=[], holdings=[], alerts=[], stability=[])

    weights = _build_weights(portfolio)
    return FactorExposureResponse(**compute_factor_intelligence(portfolio.holdings, weights))


@router.get("/lookthrough", response_model=LookthroughResponse)
def get_lookthrough(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if not portfolio.holdings:
        return LookthroughResponse(
            top_underlyings=[],
            sector_concentration=[],
            theme_concentration=[],
            overlap=[],
            redundancy_score=0,
        )

    weights = _build_weights(portfolio)
    return LookthroughResponse(**compute_lookthrough_exposure(portfolio.holdings, weights))
