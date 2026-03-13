import { post } from "./client";
import type { CopilotRequest, CopilotResponse } from "@/lib/types/api";

export function askCopilot(
  portfolioId: string,
  question: string,
  contextType: string = "general"
): Promise<CopilotResponse> {
  return post<CopilotResponse>(`/portfolios/${portfolioId}/copilot`, {
    question,
    context_type: contextType,
  } as CopilotRequest);
}
