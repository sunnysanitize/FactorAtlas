"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { KpiCard } from "@/components/cards/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { EmptyState } from "@/components/states/empty-state";
import { usePolling } from "@/lib/hooks/use-polling";
import { getFactors, getLookthrough } from "@/lib/api/factors";
import { formatPercent } from "@/lib/utils/format";
import type { FactorExposureResponse, LookthroughResponse } from "@/lib/types/api";
import { Layers3 } from "lucide-react";

export default function FactorsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [factors, setFactors] = useState<FactorExposureResponse | null>(null);
  const [lookthrough, setLookthrough] = useState<LookthroughResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (background = false) => {
    if (!background) {
      setLoading(true);
      setError("");
    }
    try {
      const [factorData, lookthroughData] = await Promise.all([
        getFactors(portfolioId),
        getLookthrough(portfolioId),
      ]);
      setFactors(factorData);
      setLookthrough(lookthroughData);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load factor intelligence");
      }
    } finally {
      if (!background) {
        setLoading(false);
      }
    }
  };

  usePolling(() => load(Boolean(factors)), { enabled: Boolean(portfolioId) });

  if (loading) return <LoadingState message="Computing hidden exposure intelligence..." rows={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!factors || !lookthrough) return null;

  if (factors.summary.length === 0 && lookthrough.top_underlyings.length === 0) {
    return (
      <EmptyState
        title="No hidden exposure data yet"
        description="Add holdings to compute factor intelligence and ETF look-through exposure."
        icon={<Layers3 className="h-12 w-12" />}
      />
    );
  }

  const topFactors = factors.summary.slice(0, 4);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Factors & Look-Through"
        description="Hidden drivers, ETF decomposition, and overlap after wrapper expansion"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topFactors.map((factor) => (
          <KpiCard
            key={factor.factor_key}
            label={factor.label}
            value={formatPercent(factor.exposure)}
            subtitle={`${factor.intensity} intensity`}
          />
        ))}
      </div>

      {factors.alerts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factor Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {factors.alerts.map((alert) => (
              <p key={alert} className="text-sm text-foreground">{alert}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factor Exposure Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {factors.summary.map((factor) => (
              <div key={factor.factor_key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{factor.label}</span>
                  <span className="text-muted-foreground">{formatPercent(factor.exposure)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(factor.exposure * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factor Stability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {factors.stability.map((item) => (
              <div key={item.factor_key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <Badge variant="outline">{formatPercent(item.stability_score)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Per-Holding Factor Linkage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {factors.holdings.map((holding) => (
              <div key={holding.ticker} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{holding.ticker}</span>
                  <span className="text-xs text-muted-foreground">{formatPercent(holding.weight)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {holding.top_factors.map((factor) => (
                    <Badge key={factor.factor_key} variant="secondary">
                      {factor.label}: {formatPercent(factor.score)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">True Underlying Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lookthrough.top_underlyings.map((item) => (
              <div key={item.ticker} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.ticker}</p>
                    <p className="text-xs text-muted-foreground">{item.company_name}</p>
                  </div>
                  <Badge variant="outline">{formatPercent(item.total_weight)}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Direct {formatPercent(item.direct_weight)}</span>
                  <span>Indirect {formatPercent(item.indirect_weight)}</span>
                  {item.sector && <span>{item.sector}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Look-Through Sectors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lookthrough.sector_concentration.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{formatPercent(item.weight)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Look-Through Themes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lookthrough.theme_concentration.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{formatPercent(item.weight)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overlap & Redundancy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Redundancy Score</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{formatPercent(lookthrough.redundancy_score)}</p>
            </div>
            {lookthrough.overlap.map((item) => (
              <div key={item.ticker} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.ticker}</span>
                <span className="text-muted-foreground">{formatPercent(item.overlap_score)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
