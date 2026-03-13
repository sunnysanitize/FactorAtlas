"""Scenario analysis routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.scenarios import ScenarioRunRequest, ScenarioRunResponse, ScenarioListResponse
from app.services.market_data_service import fetch_current_price
from app.services.portfolio_service import get_portfolio_for_user
from app.services.scenario_service import (
    PREDEFINED_SCENARIOS,
    get_scenarios,
    run_scenario,
    save_scenario,
)

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["scenarios"])


@router.post("/scenarios/run", response_model=ScenarioRunResponse)
def run_scenario_route(
    portfolio_id: uuid.UUID,
    request: ScenarioRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    holdings = portfolio.holdings
    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")

    current_prices = {}
    for h in holdings:
        price = fetch_current_price(h.ticker)
        if price is not None:
            current_prices[h.ticker] = price
        else:
            current_prices[h.ticker] = h.average_cost

    shocks = [s.model_dump() for s in request.shocks]
    results = run_scenario(holdings, current_prices, shocks)

    scenario = save_scenario(
        db, portfolio_id, request.name, request.scenario_type, shocks, results,
    )

    return ScenarioRunResponse(
        id=scenario.id,
        name=request.name,
        scenario_type=request.scenario_type,
        total_impact=results["total_impact"],
        total_impact_pct=results["total_impact_pct"],
        holding_impacts=results["holding_impacts"],
        sector_impacts=results["sector_impacts"],
        theme_impacts=results["theme_impacts"],
        created_at=scenario.created_at,
    )


@router.get("/scenarios", response_model=ScenarioListResponse)
def list_scenarios(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    portfolio = get_portfolio_for_user(db, portfolio_id, current_user)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    scenarios = get_scenarios(db, portfolio_id)
    results = []
    for s in scenarios:
        r = s.results_json or {}
        results.append(ScenarioRunResponse(
            id=s.id,
            name=s.name,
            scenario_type=s.scenario_type,
            total_impact=r.get("total_impact", 0),
            total_impact_pct=r.get("total_impact_pct", 0),
            holding_impacts=r.get("holding_impacts", []),
            sector_impacts=r.get("sector_impacts", []),
            theme_impacts=r.get("theme_impacts", []),
            created_at=s.created_at,
        ))
    return ScenarioListResponse(scenarios=results)


@router.get("/scenarios/predefined")
def get_predefined_scenarios():
    return PREDEFINED_SCENARIOS
