export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
}

export interface PortfolioSummary {
  id: string;
  name: string;
  created_at: string;
  holding_count: number;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  ticker: string;
  company_name: string | null;
  shares: number;
  average_cost: number;
  sector: string | null;
  primary_theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface HoldingAnalytics {
  id: string;
  ticker: string;
  company_name: string | null;
  market: string | null;
  exchange: string | null;
  currency: string | null;
  shares: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  weight: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_pct: number;
  daily_return: number | null;
  sector: string | null;
  primary_theme: string | null;
  beta: number | null;
  volatility_contribution: number | null;
}

export interface ConcentrationMetrics {
  top_holding_weight: number;
  top_3_combined_weight: number;
  herfindahl_index: number;
}

export interface OverviewResponse {
  total_value: number;
  daily_return: number | null;
  cumulative_return: number | null;
  annualized_volatility: number | null;
  beta: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  var_95: number | null;
  holdings_count: number;
  top_holding: string | null;
  top_sector: string | null;
  top_theme: string | null;
  concentration: ConcentrationMetrics | null;
  holdings: HoldingAnalytics[];
  portfolio_value_series: { date: string; value: number }[];
  cumulative_return_series: { date: string; value: number }[];
  sector_allocation: ThemeExposureItem[];
  theme_allocation: ThemeExposureItem[];
}

export interface RiskContributor {
  ticker: string;
  contribution: number;
  weight: number;
  volatility: number;
}

export interface RiskResponse {
  annualized_volatility: number | null;
  beta: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  var_95: number | null;
  cvar_95: number | null;
  concentration: ConcentrationMetrics | null;
  risk_contributors: RiskContributor[];
  rolling_volatility: { date: string; value: number }[];
  rolling_beta: { date: string; value: number }[];
  rolling_sharpe: { date: string; value: number }[];
}

export interface CorrelationMatrix {
  tickers: string[];
  matrix: number[][];
}

export interface ThemeExposureItem {
  name: string;
  weight: number;
  holdings: string[];
}

export interface ThemeExposureResponse {
  sector_exposure: ThemeExposureItem[];
  theme_exposure: ThemeExposureItem[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  explanation: string | null;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EventRelevance {
  ticker: string;
  relevance_score: number;
  explanation: string | null;
}

export interface NewsEvent {
  id: string;
  title: string;
  source: string | null;
  published_at: string | null;
  summary: string | null;
  url: string | null;
  event_category: string | null;
  affected_holdings: EventRelevance[];
}

export interface EventsListResponse {
  events: NewsEvent[];
  total: number;
}

export interface ScenarioShock {
  target_type: string;
  target_name: string;
  shock_pct: number;
}

export interface ScenarioRunRequest {
  name: string;
  scenario_type: string;
  shocks: ScenarioShock[];
}

export interface HoldingImpact {
  ticker: string;
  current_value: number;
  shocked_value: number;
  impact: number;
  impact_pct: number;
}

export interface SectorImpact {
  sector: string;
  impact: number;
  impact_pct: number;
}

export interface ThemeImpact {
  theme: string;
  impact: number;
  impact_pct: number;
}

export interface ScenarioRunResponse {
  id: string;
  name: string;
  scenario_type: string;
  total_impact: number;
  total_impact_pct: number;
  holding_impacts: HoldingImpact[];
  sector_impacts: SectorImpact[];
  theme_impacts: ThemeImpact[];
  created_at: string;
}

export interface CopilotRequest {
  question: string;
  context_type?: string;
}

export interface CopilotResponse {
  answer: string;
  source_metrics: Record<string, unknown> | null;
  confidence: string;
}

export interface HistoryResponse {
  portfolio_value: { date: string; value: number }[];
  daily_returns: { date: string; value: number }[];
  cumulative_returns: { date: string; value: number }[];
}

export interface CSVUploadResponse {
  holdings_added: number;
  holdings_merged: number;
  errors: string[];
}
