"""AI copilot routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.ai import CopilotRequest, CopilotResponse
from app.services.ai_service import ask_copilot
from app.services.market_data_service import fetch_current_price
from app.services.portfolio_service import get_portfolio_for_user
from app.services.theme_service import get_sector_exposure, get_theme_exposure

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["ai"])


@router.post("/copilot", response_model=CopilotResponse)
def copilot_route(
    portfolio_id: uuid.UUID,
    request: CopilotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = portfolio.holdings
    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")

    # Build basic overview for context
    tickers = [h.ticker for h in holdings]
    current_prices = {}
    for t in tickers:
        p = fetch_current_price(t)
        if p is not None:
            current_prices[t] = p

    market_values = {h.ticker: h.shares * current_prices.get(h.ticker, h.average_cost) for h in holdings}
    total_value = sum(market_values.values())
    weights = {t: v / total_value for t, v in market_values.items()} if total_value > 0 else {}

    overview = {
        "total_value": total_value,
        "holdings_count": len(holdings),
        "daily_return": 0,
        "cumulative_return": 0,
        "top_holding": max(weights, key=weights.get) if weights else None,
    }

    sector_exp = get_sector_exposure(holdings, weights)
    theme_exp = get_theme_exposure(holdings, weights)
    overview["top_sector"] = sector_exp[0]["name"] if sector_exp else None
    overview["top_theme"] = theme_exp[0]["name"] if theme_exp else None

    themes = {
        "sector_exposure": sector_exp,
        "theme_exposure": theme_exp,
    }

    result = ask_copilot(
        question=request.question,
        context_type=request.context_type,
        overview=overview,
        themes=themes,
    )

    return CopilotResponse(**result)
