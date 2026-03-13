from pydantic import BaseModel


class HoldingAnalytics(BaseModel):
    id: str
    ticker: str
    company_name: str | None
    market: str | None
    exchange: str | None
    currency: str | None
    shares: float
    average_cost: float
    current_price: float
    market_value: float
    weight: float
    unrealized_gain_loss: float
    unrealized_gain_loss_pct: float
    daily_return: float | None
    sector: str | None
    primary_theme: str | None
    beta: float | None
    volatility_contribution: float | None


class ConcentrationMetrics(BaseModel):
    top_holding_weight: float
    top_3_combined_weight: float
    herfindahl_index: float


class OverviewResponse(BaseModel):
    total_value: float
    daily_return: float | None
    cumulative_return: float | None
    annualized_volatility: float | None
    beta: float | None
    sharpe_ratio: float | None
    max_drawdown: float | None
    var_95: float | None
    holdings_count: int
    top_holding: str | None
    top_sector: str | None
    top_theme: str | None
    concentration: ConcentrationMetrics | None
    holdings: list[HoldingAnalytics]
    portfolio_value_series: list[dict]
    cumulative_return_series: list[dict]
    sector_allocation: list[dict]
    theme_allocation: list[dict]


class RiskContributor(BaseModel):
    ticker: str
    contribution: float
    weight: float
    volatility: float


class RiskResponse(BaseModel):
    annualized_volatility: float | None
    beta: float | None
    sharpe_ratio: float | None
    max_drawdown: float | None
    var_95: float | None
    cvar_95: float | None
    concentration: ConcentrationMetrics | None
    risk_contributors: list[RiskContributor]
    rolling_volatility: list[dict]
    rolling_beta: list[dict]
    rolling_sharpe: list[dict]


class CorrelationMatrixResponse(BaseModel):
    tickers: list[str]
    matrix: list[list[float]]


class ThemeExposureItem(BaseModel):
    name: str
    weight: float
    holdings: list[str]


class ThemeExposureResponse(BaseModel):
    sector_exposure: list[ThemeExposureItem]
    theme_exposure: list[ThemeExposureItem]


class HistoryPoint(BaseModel):
    date: str
    value: float


class HistoryResponse(BaseModel):
    portfolio_value: list[HistoryPoint]
    daily_returns: list[HistoryPoint]
    cumulative_returns: list[HistoryPoint]


class PricePoint(BaseModel):
    ticker: str
    date: str
    adjusted_close: float


class PricesResponse(BaseModel):
    prices: list[PricePoint]
