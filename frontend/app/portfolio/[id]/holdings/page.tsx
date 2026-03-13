"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { HoldingsTable } from "@/components/tables/holdings-table";
import { AddHoldingForm } from "@/components/forms/add-holding-form";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getOverview } from "@/lib/api/analytics";
import type { HoldingAnalytics } from "@/lib/types/api";

export default function HoldingsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [holdings, setHoldings] = useState<HoldingAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getOverview(portfolioId);
      setHoldings(data.holdings);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load holdings");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  usePolling(() => load(holdings.length > 0), { enabled: Boolean(portfolioId) });

  if (loading) return <LoadingState message="Loading holdings..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Holdings" description={`${holdings.length} positions`} />
      <AddHoldingForm portfolioId={portfolioId} onSuccess={load} />
      <HoldingsTable holdings={holdings} />
    </div>
  );
}
