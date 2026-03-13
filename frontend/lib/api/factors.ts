import { get } from "./client";
import type { FactorExposureResponse, LookthroughResponse } from "@/lib/types/api";

export function getFactors(portfolioId: string): Promise<FactorExposureResponse> {
  return get<FactorExposureResponse>(`/portfolios/${portfolioId}/factors`);
}

export function getLookthrough(portfolioId: string): Promise<LookthroughResponse> {
  return get<LookthroughResponse>(`/portfolios/${portfolioId}/lookthrough`);
}
