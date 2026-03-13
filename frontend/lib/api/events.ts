import { get } from "./client";
import { post } from "./client";
import type { EventsListResponse } from "@/lib/types/api";

const eventsCache = new Map<string, EventsListResponse>();

export function getEvents(portfolioId: string): Promise<EventsListResponse> {
  return get<EventsListResponse>(`/portfolios/${portfolioId}/events`).then((response) => {
    eventsCache.set(portfolioId, response);
    return response;
  });
}

export function refreshEvents(portfolioId: string): Promise<EventsListResponse> {
  return post<EventsListResponse>(`/portfolios/${portfolioId}/events/refresh`).then((response) => {
    eventsCache.set(portfolioId, response);
    return response;
  });
}

export function getCachedEvents(portfolioId: string): EventsListResponse | null {
  return eventsCache.get(portfolioId) ?? null;
}
