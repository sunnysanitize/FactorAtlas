"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { KpiCard } from "@/components/cards/kpi-card";
import { SectionHeader } from "@/components/cards/section-header";
import { RiskContributionChart } from "@/components/charts/risk-contribution-chart";
import { CorrelationHeatmap } from "@/components/charts/correlation-heatmap";
import { RollingMetricsChart } from "@/components/charts/rolling-metrics-chart";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getCachedOverview, getCorrelations, getRisk } from "@/lib/api/analytics";
import { formatPercent, formatNumber } from "@/lib/utils/format";
import type { RiskResponse, CorrelationMatrix } from "@/lib/types/api";

export default function RiskPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const cachedOverview = getCachedOverview(portfolioId);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationMatrix | null>(null);
  const [loading, setLoading] = useState(!cachedOverview);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const [riskData, corrData] = await Promise.all([
        getRisk(portfolioId),
        getCorrelations(portfolioId),
      ]);
      setRisk(riskData);
      setCorrelations(corrData);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load risk data");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  usePolling(() => load(risk !== null), { enabled: Boolean(portfolioId), runOnMount: true });

  if (loading) return <LoadingState message="Computing risk analytics..." rows={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!risk) return null;

  return (
    <div className="space-y-6">
      <SectionHeader title="Risk Analytics" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Volatility" value={formatPercent(risk.annualized_volatility)} />
        <KpiCard label="Beta" value={risk.beta != null ? formatNumber(risk.beta) : "—"} />
        <KpiCard label="Sharpe" value={risk.sharpe_ratio != null ? formatNumber(risk.sharpe_ratio) : "—"} />
        <KpiCard label="Max Drawdown" value={formatPercent(risk.max_drawdown)} />
        <KpiCard label="VaR (95%)" value={formatPercent(risk.var_95)} />
        <KpiCard label="CVaR (95%)" value={formatPercent(risk.cvar_95)} />
      </div>

      {risk.concentration && (
        <div className="grid grid-cols-3 gap-3">
          <KpiCard label="Top Holding Weight" value={formatPercent(risk.concentration.top_holding_weight)} />
          <KpiCard label="Top 3 Combined" value={formatPercent(risk.concentration.top_3_combined_weight)} />
          <KpiCard label="HHI" value={formatNumber(risk.concentration.herfindahl_index, 4)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskContributionChart data={risk.risk_contributors} />
        {correlations && (
          <CorrelationHeatmap tickers={correlations.tickers} matrix={correlations.matrix} />
        )}
      </div>

      <RollingMetricsChart
        volatility={risk.rolling_volatility}
        beta={risk.rolling_beta}
        sharpe={risk.rolling_sharpe}
      />
    </div>
  );
}
