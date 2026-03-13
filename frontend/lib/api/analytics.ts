import { get } from "./client";
import type {
  OverviewResponse,
  RiskResponse,
  CorrelationMatrix,
  ThemeExposureResponse,
  HistoryResponse,
} from "@/lib/types/api";

export function getOverview(portfolioId: string): Promise<OverviewResponse> {
  return get<OverviewResponse>(`/portfolios/${portfolioId}/overview`);
}

export function getRisk(portfolioId: string): Promise<RiskResponse> {
  return get<RiskResponse>(`/portfolios/${portfolioId}/risk`);
}

export function getCorrelations(portfolioId: string): Promise<CorrelationMatrix> {
  return get<CorrelationMatrix>(`/portfolios/${portfolioId}/correlations`);
}

export function getThemes(portfolioId: string): Promise<ThemeExposureResponse> {
  return get<ThemeExposureResponse>(`/portfolios/${portfolioId}/themes`);
}

export function getHistory(portfolioId: string): Promise<HistoryResponse> {
  return get<HistoryResponse>(`/portfolios/${portfolioId}/history`);
}
