import { get } from "./client";
import type {
  OverviewResponse,
  RiskResponse,
  CorrelationMatrix,
  ThemeExposureResponse,
  HistoryResponse,
} from "@/lib/types/api";

const analyticsCache = new Map<string, unknown>();

function getCacheKey(portfolioId: string, resource: string): string {
  return `${portfolioId}:${resource}`;
}

export function getOverview(portfolioId: string): Promise<OverviewResponse> {
  return get<OverviewResponse>(`/portfolios/${portfolioId}/overview`).then((response) => {
    analyticsCache.set(getCacheKey(portfolioId, "overview"), response);
    return response;
  });
}

export function getRisk(portfolioId: string): Promise<RiskResponse> {
  return get<RiskResponse>(`/portfolios/${portfolioId}/risk`).then((response) => {
    analyticsCache.set(getCacheKey(portfolioId, "risk"), response);
    return response;
  });
}

export function getCorrelations(portfolioId: string): Promise<CorrelationMatrix> {
  return get<CorrelationMatrix>(`/portfolios/${portfolioId}/correlations`).then((response) => {
    analyticsCache.set(getCacheKey(portfolioId, "correlations"), response);
    return response;
  });
}

export function getThemes(portfolioId: string): Promise<ThemeExposureResponse> {
  return get<ThemeExposureResponse>(`/portfolios/${portfolioId}/themes`).then((response) => {
    analyticsCache.set(getCacheKey(portfolioId, "themes"), response);
    return response;
  });
}

export function getHistory(portfolioId: string): Promise<HistoryResponse> {
  return get<HistoryResponse>(`/portfolios/${portfolioId}/history`).then((response) => {
    analyticsCache.set(getCacheKey(portfolioId, "history"), response);
    return response;
  });
}

export function getCachedOverview(portfolioId: string): OverviewResponse | null {
  return (analyticsCache.get(getCacheKey(portfolioId, "overview")) as OverviewResponse | undefined) ?? null;
}

export function invalidatePortfolioAnalytics(portfolioId: string): void {
  for (const resource of ["overview", "risk", "correlations", "themes", "history"]) {
    analyticsCache.delete(getCacheKey(portfolioId, resource));
  }
}
