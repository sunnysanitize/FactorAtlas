"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { EventTable } from "@/components/tables/event-table";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { getCachedEvents, getEvents, refreshEvents } from "@/lib/api/events";
import type { NewsEvent } from "@/lib/types/api";
import { Newspaper, RefreshCw } from "lucide-react";

export default function EventsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const cachedEvents = getCachedEvents(portfolioId);
  const [events, setEvents] = useState<NewsEvent[]>(cachedEvents?.events ?? []);
  const [loading, setLoading] = useState(!cachedEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getEvents(portfolioId);
      setEvents(data.events);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const data = await refreshEvents(portfolioId);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh events");
    } finally {
      setRefreshing(false);
    }
  };

  const loadOnMount = useEffectEvent(() => {
    void load(Boolean(cachedEvents));
  });

  useEffect(() => {
    loadOnMount();
  }, [portfolioId]);

  if (loading) return <LoadingState message="Fetching events..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Event Intelligence"
          actions={
            <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing}>
              <RefreshCw className="h-4 w-4 mr-1" />
              {refreshing ? "Refreshing..." : "Refresh News"}
            </Button>
          }
        />
        <EmptyState
          title="No events found"
          description="News is no longer fetched automatically. Use Refresh News only when you want to spend free-tier news requests."
          icon={<Newspaper className="h-12 w-12" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Event Intelligence"
        description="Recent events ranked by relevance to your portfolio"
        actions={
          <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {refreshing ? "Refreshing..." : "Refresh News"}
          </Button>
        }
      />
      <EventTable events={events} />
    </div>
  );
}
