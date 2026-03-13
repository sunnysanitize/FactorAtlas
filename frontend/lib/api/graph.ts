import { get } from "./client";
import type { GraphResponse } from "@/lib/types/api";

export function getGraph(portfolioId: string): Promise<GraphResponse> {
  return get<GraphResponse>(`/portfolios/${portfolioId}/graph`);
}
