import { get, post } from "./client";
import type { ScenarioRunRequest, ScenarioRunResponse } from "@/lib/types/api";

export function runScenario(
  portfolioId: string,
  request: ScenarioRunRequest
): Promise<ScenarioRunResponse> {
  return post<ScenarioRunResponse>(`/portfolios/${portfolioId}/scenarios/run`, request);
}

export function listScenarios(portfolioId: string): Promise<{ scenarios: ScenarioRunResponse[] }> {
  return get<{ scenarios: ScenarioRunResponse[] }>(`/portfolios/${portfolioId}/scenarios`);
}

export function getPredefinedScenarios(): Promise<ScenarioRunRequest[]> {
  return get<ScenarioRunRequest[]>("/portfolios/00000000-0000-0000-0000-000000000000/scenarios/predefined");
}
