"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { EventTable } from "@/components/tables/event-table";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getEvents } from "@/lib/api/events";
import type { NewsEvent } from "@/lib/types/api";
import { Newspaper } from "lucide-react";

export default function EventsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
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

  usePolling(() => load(events.length > 0), { enabled: Boolean(portfolioId) });

  if (loading) return <LoadingState message="Fetching events..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Event Intelligence" />
        <EmptyState
          title="No events found"
          description="Events will appear when a news API key is configured and articles are available for your holdings."
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
      />
      <EventTable events={events} />
    </div>
  );
}
