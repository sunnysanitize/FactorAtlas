import { get } from "./client";
import type { EventsListResponse } from "@/lib/types/api";

export function getEvents(portfolioId: string): Promise<EventsListResponse> {
  return get<EventsListResponse>(`/portfolios/${portfolioId}/events`);
}
