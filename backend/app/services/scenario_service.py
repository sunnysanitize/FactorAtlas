"""Scenario analysis engine."""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.holding import Holding
from app.models.scenario import Scenario
from app.services.theme_data import TICKER_SECTORS, TICKER_THEMES

logger = logging.getLogger(__name__)


PREDEFINED_SCENARIOS = [
    {
        "name": "SPY Down 10%",
        "scenario_type": "predefined",
        "shocks": [{"target_type": "benchmark", "target_name": "SPY", "shock_pct": -0.10}],
    },
    {
        "name": "Tech Selloff (-8%)",
        "scenario_type": "predefined",
        "shocks": [{"target_type": "sector", "target_name": "Technology", "shock_pct": -0.08}],
    },
    {
        "name": "Semiconductors Down 12%",
        "scenario_type": "predefined",
        "shocks": [{"target_type": "theme", "target_name": "Semiconductors", "shock_pct": -0.12}],
    },
    {
        "name": "AI Infrastructure Selloff (-15%)",
        "scenario_type": "predefined",
        "shocks": [{"target_type": "theme", "target_name": "AI Infrastructure", "shock_pct": -0.15}],
    },
    {
        "name": "Energy Rally (+10%)",
        "scenario_type": "predefined",
        "shocks": [{"target_type": "sector", "target_name": "Energy", "shock_pct": 0.10}],
    },
    {
        "name": "Rate Shock",
        "scenario_type": "predefined",
        "shocks": [
            {"target_type": "sector", "target_name": "Technology", "shock_pct": -0.05},
            {"target_type": "sector", "target_name": "Real Estate", "shock_pct": -0.08},
            {"target_type": "sector", "target_name": "Financials", "shock_pct": 0.03},
        ],
    },
]


def get_holding_shock(
    holding: Holding,
    shock: dict,
    current_prices: dict[str, float],
    beta_map: dict[str, float] | None = None,
) -> float:
    """Determine the shock percentage for a single holding based on a shock definition."""
    target_type = shock["target_type"]
    target_name = shock["target_name"]
    shock_pct = shock["shock_pct"]

    ticker = holding.ticker
    sector = holding.sector or TICKER_SECTORS.get(ticker, "Unknown")
    themes = TICKER_THEMES.get(ticker, [])
    if not themes and holding.primary_theme:
        themes = [holding.primary_theme]

    if target_type == "benchmark":
        # Apply via beta
        beta = (beta_map or {}).get(ticker, 1.0)
        return shock_pct * beta

    elif target_type == "sector":
        if sector == target_name:
            return shock_pct
        return 0.0

    elif target_type == "theme":
        if target_name in themes:
            return shock_pct
        return 0.0

    elif target_type == "ticker":
        if ticker == target_name:
            return shock_pct
        return 0.0

    elif target_type == "custom":
        # Custom: apply to all holdings
        return shock_pct

    return 0.0


def run_scenario(
    holdings: list[Holding],
    current_prices: dict[str, float],
    shocks: list[dict],
    beta_map: dict[str, float] | None = None,
) -> dict:
    """Run a scenario and compute impacts."""
    holding_impacts = []
    sector_impacts_map: dict[str, float] = {}
    theme_impacts_map: dict[str, float] = {}
    total_current = 0.0
    total_impact = 0.0

    for h in holdings:
        price = current_prices.get(h.ticker, h.average_cost)
        current_value = h.shares * price
        total_current += current_value

        combined_shock = 0.0
        for shock in shocks:
            combined_shock += get_holding_shock(h, shock, current_prices, beta_map)

        # Cap combined shock
        combined_shock = max(-1.0, min(1.0, combined_shock))
        impact = current_value * combined_shock
        shocked_value = current_value + impact
        total_impact += impact

        holding_impacts.append({
            "ticker": h.ticker,
            "current_value": round(current_value, 2),
            "shocked_value": round(shocked_value, 2),
            "impact": round(impact, 2),
            "impact_pct": round(combined_shock, 4),
        })

        sector = h.sector or TICKER_SECTORS.get(h.ticker, "Unknown")
        sector_impacts_map[sector] = sector_impacts_map.get(sector, 0) + impact

        themes = TICKER_THEMES.get(h.ticker, [])
        if not themes and h.primary_theme:
            themes = [h.primary_theme]
        for theme in themes:
            theme_impacts_map[theme] = theme_impacts_map.get(theme, 0) + impact

    total_impact_pct = total_impact / total_current if total_current > 0 else 0

    sector_impacts = [
        {"sector": s, "impact": round(v, 2), "impact_pct": round(v / total_current, 4) if total_current > 0 else 0}
        for s, v in sorted(sector_impacts_map.items(), key=lambda x: x[1])
    ]
    theme_impacts = [
        {"theme": t, "impact": round(v, 2), "impact_pct": round(v / total_current, 4) if total_current > 0 else 0}
        for t, v in sorted(theme_impacts_map.items(), key=lambda x: x[1])
    ]

    return {
        "total_impact": round(total_impact, 2),
        "total_impact_pct": round(total_impact_pct, 4),
        "holding_impacts": sorted(holding_impacts, key=lambda x: x["impact"]),
        "sector_impacts": sector_impacts,
        "theme_impacts": theme_impacts,
    }


def save_scenario(
    db: Session,
    portfolio_id: uuid.UUID,
    name: str,
    scenario_type: str,
    parameters: list[dict],
    results: dict,
) -> Scenario:
    """Persist a scenario run."""
    scenario = Scenario(
        portfolio_id=portfolio_id,
        name=name,
        scenario_type=scenario_type,
        parameters_json=parameters,
        results_json=results,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario


def get_scenarios(db: Session, portfolio_id: uuid.UUID) -> list[Scenario]:
    """Get saved scenarios for a portfolio."""
    return (
        db.query(Scenario)
        .filter(Scenario.portfolio_id == portfolio_id)
        .order_by(Scenario.created_at.desc())
        .all()
    )
