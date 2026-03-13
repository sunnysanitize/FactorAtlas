from pydantic import BaseModel


class FactorExposureItem(BaseModel):
    factor_key: str
    label: str
    exposure: float
    intensity: str


class HoldingFactorItem(BaseModel):
    factor_key: str
    label: str
    score: float


class HoldingFactorExposure(BaseModel):
    ticker: str
    weight: float
    top_factors: list[HoldingFactorItem]


class FactorStabilityItem(BaseModel):
    factor_key: str
    label: str
    stability_score: float


class FactorExposureResponse(BaseModel):
    summary: list[FactorExposureItem]
    holdings: list[HoldingFactorExposure]
    alerts: list[str]
    stability: list[FactorStabilityItem]


class LookthroughUnderlying(BaseModel):
    ticker: str
    company_name: str
    direct_weight: float
    indirect_weight: float
    total_weight: float
    sector: str | None
    themes: list[str]


class ConcentrationItem(BaseModel):
    name: str
    weight: float


class OverlapItem(BaseModel):
    ticker: str
    direct_weight: float
    indirect_weight: float
    overlap_score: float


class LookthroughResponse(BaseModel):
    top_underlyings: list[LookthroughUnderlying]
    sector_concentration: list[ConcentrationItem]
    theme_concentration: list[ConcentrationItem]
    overlap: list[OverlapItem]
    redundancy_score: float
