import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class HoldingCreate(BaseModel):
    ticker: str
    shares: float
    average_cost: float
    company_name: str | None = None
    sector: str | None = None
    primary_theme: str | None = None

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("shares")
    @classmethod
    def shares_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("shares must be positive")
        return v

    @field_validator("average_cost")
    @classmethod
    def cost_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("average_cost must be positive")
        return v


class HoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    portfolio_id: uuid.UUID
    ticker: str
    company_name: str | None
    shares: float
    average_cost: float
    sector: str | None
    primary_theme: str | None
    created_at: datetime
    updated_at: datetime


class PortfolioCreate(BaseModel):
    name: str
    user_email: str | None = None


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime
    holdings: list[HoldingResponse] = []


class PortfolioSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    created_at: datetime
    holding_count: int = 0


class CSVUploadResponse(BaseModel):
    holdings_added: int
    holdings_merged: int
    errors: list[str] = []
