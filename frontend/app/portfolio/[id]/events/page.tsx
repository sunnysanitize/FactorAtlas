"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { EventTable } from "@/components/tables/event-table";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedEvents, getEventPropagation, getEvents, refreshEvents } from "@/lib/api/events";
import type { EventPropagationItem, NewsEvent } from "@/lib/types/api";
import { Newspaper, RefreshCw } from "lucide-react";

export default function EventsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const cachedEvents = getCachedEvents(portfolioId);
  const [events, setEvents] = useState<NewsEvent[]>(cachedEvents?.events ?? []);
  const [propagation, setPropagation] = useState<EventPropagationItem[]>([]);
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
      const propagationData = await getEventPropagation(portfolioId);
      setPropagation(propagationData.events);
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
      const propagationData = await getEventPropagation(portfolioId);
      setPropagation(propagationData.events);
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
      {propagation.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Causal Propagation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {propagation.slice(0, 5).map((item) => (
              <div key={item.event_id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.direct_count} direct, {item.indirect_count} indirect pathways
                    </p>
                  </div>
                  <Badge variant="outline">Blast radius {item.blast_radius_score.toFixed(2)}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {item.pathways.slice(0, 4).map((pathway, index) => (
                    <div key={`${item.event_id}-${index}`} className="rounded-md bg-muted/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-foreground">
                          {pathway.holding} via {pathway.via.join(" -> ")}
                        </span>
                        <Badge variant="secondary">{pathway.path_type}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{pathway.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
