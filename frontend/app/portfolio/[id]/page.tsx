"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { KpiCard } from "@/components/cards/kpi-card";
import { SectionHeader } from "@/components/cards/section-header";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { CumulativeReturnChart } from "@/components/charts/cumulative-return-chart";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { AddHoldingForm } from "@/components/forms/add-holding-form";
import { CsvUploadForm } from "@/components/forms/csv-upload-form";
import { HoldingsTable } from "@/components/tables/holdings-table";
import { AiSummaryCard } from "@/components/cards/ai-summary-card";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getCachedOverview, getOverview } from "@/lib/api/analytics";
import { askCopilot } from "@/lib/api/copilot";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import type { OverviewResponse, CopilotResponse } from "@/lib/types/api";
import { BarChart3, Sparkles } from "lucide-react";

const aiSummaryCache = new Map<string, CopilotResponse>();

export default function PortfolioOverviewPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const cachedOverview = getCachedOverview(portfolioId);
  const [overview, setOverview] = useState<OverviewResponse | null>(cachedOverview);
  const [aiSummary, setAiSummary] = useState<CopilotResponse | null>(aiSummaryCache.get(portfolioId) ?? null);
  const [loading, setLoading] = useState(!cachedOverview);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await getOverview(portfolioId);
      setOverview(data);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load overview");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  usePolling(() => load(overview !== null), { enabled: Boolean(portfolioId), runOnMount: !cachedOverview });

  if (loading) return <LoadingState message="Computing portfolio analytics..." rows={6} />;
  if (error) {
    if (error.includes("no holdings")) {
      return (
        <div className="space-y-6">
          <SectionHeader title="Portfolio Overview" description="Add holdings to get started" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddHoldingForm portfolioId={portfolioId} onSuccess={load} />
            <CsvUploadForm portfolioId={portfolioId} onSuccess={load} />
          </div>
          <EmptyState
            title="No holdings yet"
            description="Add holdings manually or upload a CSV to see portfolio analytics."
            icon={<BarChart3 className="h-12 w-12" />}
          />
        </div>
      );
    }
    return <ErrorState message={error} onRetry={load} />;
  }
  if (!overview) return null;

  const o = overview;
  const dailyTrend = (o.daily_return ?? 0) >= 0 ? "up" : "down";
  const cumTrend = (o.cumulative_return ?? 0) >= 0 ? "up" : "down";
  const usHoldingsCount = o.holdings.filter((holding) => holding.market === "United States").length;
  const canadianHoldingsCount = o.holdings.filter((holding) => holding.market === "Canada").length;
  const intlHoldingsCount = o.holdings.filter(
    (holding) => holding.market && !["United States", "Canada"].includes(holding.market)
  ).length;

  const generateAiSummary = async () => {
    setAiLoading(true);
    try {
      const ai = await askCopilot(
        portfolioId,
        "Give me a brief portfolio summary and highlight any key risks or concentrations.",
        "general"
      );
      aiSummaryCache.set(portfolioId, ai);
      setAiSummary(ai);
    } catch {
      // Non-blocking
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Portfolio Overview" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="Total Value" value={formatCurrency(o.total_value)} />
        <KpiCard label="Daily Return" value={formatPercent(o.daily_return)} trend={dailyTrend} change={formatPercent(o.daily_return)} />
        <KpiCard label="Cumul. Return" value={formatPercent(o.cumulative_return)} trend={cumTrend} change={formatPercent(o.cumulative_return)} />
        <KpiCard label="Volatility" value={formatPercent(o.annualized_volatility)} />
        <KpiCard label="Beta" value={o.beta != null ? formatNumber(o.beta) : "—"} />
        <KpiCard label="Sharpe" value={o.sharpe_ratio != null ? formatNumber(o.sharpe_ratio) : "—"} />
        <KpiCard label="Max Drawdown" value={formatPercent(o.max_drawdown)} trend="down" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerformanceChart data={o.portfolio_value_series} />
        <CumulativeReturnChart data={o.cumulative_return_series} />
      </div>

      {/* Allocations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AllocationDonut
          data={o.holdings.map((h) => ({ name: h.ticker, weight: h.weight }))}
          title="Holdings Allocation"
        />
        <AllocationDonut data={o.sector_allocation} title="Sector Allocation" />
        <AllocationDonut data={o.theme_allocation} title="Theme Allocation" />
      </div>

      {/* AI Summary */}
      {aiSummary || aiLoading ? (
        <AiSummaryCard
          answer={aiSummary?.answer || ""}
          confidence={aiSummary?.confidence}
          sourceMetrics={aiSummary?.source_metrics}
          loading={aiLoading}
        />
      ) : (
        <EmptyState
          title="AI summary is manual"
          description="No automatic AI calls are made from the overview. Generate a summary only when you want to use the free-tier AI request."
          icon={<Sparkles className="h-12 w-12" />}
          action={
            <Button size="sm" onClick={generateAiSummary}>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate Summary
            </Button>
          }
        />
      )}

      {/* Add holdings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AddHoldingForm portfolioId={portfolioId} onSuccess={load} />
        <CsvUploadForm portfolioId={portfolioId} onSuccess={load} />
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Current Holdings"
          description={`${
            canadianHoldingsCount ? `${canadianHoldingsCount} Canadian` : "0 Canadian"
          }, ${usHoldingsCount} U.S.${intlHoldingsCount ? `, ${intlHoldingsCount} other` : ""}`}
        />
        <HoldingsTable holdings={o.holdings} portfolioId={portfolioId} onChanged={load} />
      </div>
    </div>
  );
}
