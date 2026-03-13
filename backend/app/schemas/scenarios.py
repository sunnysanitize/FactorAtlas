import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScenarioShock(BaseModel):
    target_type: str  # "benchmark", "sector", "theme", "ticker", "custom"
    target_name: str  # e.g. "SPY", "Technology", "AI infrastructure", "NVDA"
    shock_pct: float  # e.g. -0.10 for -10%


class ScenarioRunRequest(BaseModel):
    name: str
    scenario_type: str  # "predefined" or "custom"
    shocks: list[ScenarioShock]


class HoldingImpact(BaseModel):
    ticker: str
    current_value: float
    shocked_value: float
    impact: float
    impact_pct: float


class SectorImpact(BaseModel):
    sector: str
    impact: float
    impact_pct: float


class ThemeImpact(BaseModel):
    theme: str
    impact: float
    impact_pct: float


class ScenarioRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    scenario_type: str
    total_impact: float
    total_impact_pct: float
    holding_impacts: list[HoldingImpact]
    sector_impacts: list[SectorImpact]
    theme_impacts: list[ThemeImpact]
    created_at: datetime


class ScenarioListResponse(BaseModel):
    scenarios: list[ScenarioRunResponse]
