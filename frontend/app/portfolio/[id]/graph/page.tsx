"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { RelationshipGraph } from "@/components/graph/relationship-graph";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getGraph } from "@/lib/api/graph";
import type { GraphResponse } from "@/lib/types/api";
import { Network } from "lucide-react";

export default function GraphPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getGraph(portfolioId);
      setGraph(data);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load graph");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  usePolling(() => load(graph !== null), { enabled: Boolean(portfolioId) });

  if (loading) return <LoadingState message="Building intelligence graph..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!graph || graph.nodes.length === 0) {
    return <EmptyState title="No graph data" description="Add holdings to generate the intelligence graph." icon={<Network className="h-12 w-12" />} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Intelligence Graph"
        description="Explore relationships between holdings, sectors, themes, and events"
      />
      <RelationshipGraph data={graph} />
    </div>
  );
}
