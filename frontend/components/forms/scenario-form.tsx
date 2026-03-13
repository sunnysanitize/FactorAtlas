"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runScenario } from "@/lib/api/scenarios";
import type { ScenarioRunResponse } from "@/lib/types/api";

export function ScenarioForm({
  portfolioId,
  onResult,
}: {
  portfolioId: string;
  onResult: (result: ScenarioRunResponse) => void;
}) {
  const [name, setName] = useState("");
  const [targetType, setTargetType] = useState("sector");
  const [targetName, setTargetName] = useState("");
  const [shockPct, setShockPct] = useState("-10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetName || !shockPct) return;

    setLoading(true);
    setError("");
    try {
      const result = await runScenario(portfolioId, {
        name,
        scenario_type: "custom",
        shocks: [
          {
            target_type: targetType,
            target_name: targetName,
            shock_pct: parseFloat(shockPct) / 100,
          },
        ],
      });
      onResult(result);
      setName("");
      setTargetName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scenario failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Custom Scenario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Scenario name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <Select value={targetType} onValueChange={(v) => v && setTargetType(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="benchmark">Benchmark</SelectItem>
                <SelectItem value="sector">Sector</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="ticker">Ticker</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target name" value={targetName} onChange={(e) => setTargetName(e.target.value)} className="h-8 text-xs" />
            <Input type="number" placeholder="Shock %" value={shockPct} onChange={(e) => setShockPct(e.target.value)} className="h-8 text-xs" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            {loading ? "Running..." : "Run Scenario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
