"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { NewsEvent } from "@/lib/types/api";

const categoryColors: Record<string, string> = {
  earnings: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  macro: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  regulation: "bg-red-500/10 text-red-400 border-red-500/20",
  product_launch: "bg-green-500/10 text-green-400 border-green-500/20",
  guidance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  analyst_action: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  supply_chain: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  geopolitics: "bg-red-500/10 text-red-400 border-red-500/20",
  rates_and_inflation: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export function EventTable({ events }: { events: NewsEvent[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Events ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className="p-4 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {event.event_category && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColors[event.event_category] || ""}`}
                      >
                        {event.event_category.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {event.source && (
                      <span className="text-xs text-muted-foreground">{event.source}</span>
                    )}
                    {event.published_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.published_at)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-foreground">
                    {event.url ? (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {event.title}
                      </a>
                    ) : (
                      event.title
                    )}
                  </h4>
                  {event.summary && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.summary}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 shrink-0">
                  {event.affected_holdings.map((ah) => (
                    <Badge key={ah.ticker} variant="secondary" className="text-xs">
                      {ah.ticker}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
