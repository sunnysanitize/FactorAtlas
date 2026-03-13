"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader } from "@/components/cards/section-header";
import { ScenarioForm } from "@/components/forms/scenario-form";
import { ScenarioResultsTable } from "@/components/tables/scenario-results-table";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { runScenario, listScenarios } from "@/lib/api/scenarios";
import { usePolling } from "@/lib/hooks/use-polling";
import type { ScenarioRunResponse } from "@/lib/types/api";

const PREDEFINED = [
  { name: "SPY Down 10%", shocks: [{ target_type: "benchmark", target_name: "SPY", shock_pct: -0.10 }] },
  { name: "Tech Selloff (-8%)", shocks: [{ target_type: "sector", target_name: "Technology", shock_pct: -0.08 }] },
  { name: "Semiconductors -12%", shocks: [{ target_type: "theme", target_name: "Semiconductors", shock_pct: -0.12 }] },
  { name: "AI Infra Selloff (-15%)", shocks: [{ target_type: "theme", target_name: "AI Infrastructure", shock_pct: -0.15 }] },
  { name: "Energy Rally (+10%)", shocks: [{ target_type: "sector", target_name: "Energy", shock_pct: 0.10 }] },
];

export default function ScenariosPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  const [results, setResults] = useState<ScenarioRunResponse[]>([]);
  const [runningIdx, setRunningIdx] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async (background = false) => {
    if (!background) {
      setHistoryLoading(true);
    }

    try {
      const data = await listScenarios(portfolioId);
      setResults(data.scenarios);
    } catch (err) {
      if (!background) {
        setError(err instanceof Error ? err.message : "Failed to load scenarios");
      }
    } finally {
      if (!background) {
        setHistoryLoading(false);
      }
    }
  };

  usePolling(() => loadHistory(results.length > 0), { enabled: Boolean(portfolioId) });

  const handlePredefined = async (index: number) => {
    const scenario = PREDEFINED[index];
    setRunningIdx(index);
    setError("");
    try {
      const result = await runScenario(portfolioId, {
        name: scenario.name,
        scenario_type: "predefined",
        shocks: scenario.shocks,
      });
      setResults((prev) => [result, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario failed");
    } finally {
      setRunningIdx(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Scenario Analysis" description="Stress test your portfolio" />

      {/* Predefined scenarios */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Predefined Scenarios</p>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED.map((s, i) => (
              <Button
                key={s.name}
                variant="outline"
                size="sm"
                disabled={runningIdx !== null}
                onClick={() => handlePredefined(i)}
              >
                {runningIdx === i ? "Running..." : s.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom scenario */}
      <ScenarioForm
        portfolioId={portfolioId}
        onResult={(r) => setResults((prev) => [r, ...prev])}
      />

      {error && <ErrorState message={error} />}

      {/* Results */}
      {historyLoading && <LoadingState message="Loading scenario history..." rows={2} />}
      {results.map((r) => (
        <ScenarioResultsTable key={r.id} scenario={r} />
      ))}
    </div>
  );
}
