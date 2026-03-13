import { get } from "./client";
import { post } from "./client";
import type { EventsListResponse } from "@/lib/types/api";

export function getEvents(portfolioId: string): Promise<EventsListResponse> {
  return get<EventsListResponse>(`/portfolios/${portfolioId}/events`);
}

export function refreshEvents(portfolioId: string): Promise<EventsListResponse> {
  return post<EventsListResponse>(`/portfolios/${portfolioId}/events/refresh`);
}
