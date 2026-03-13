"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { ScenarioRunResponse } from "@/lib/types/api";

export function ScenarioResultsTable({ scenario }: { scenario: ScenarioRunResponse }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">{scenario.name}</CardTitle>
          <div
            className={cn(
              "text-lg font-semibold",
              scenario.total_impact >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {formatCurrency(scenario.total_impact)} ({formatPercent(scenario.total_impact_pct)})
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Ticker</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Current</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Shocked</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Impact</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Impact %</th>
            </tr>
          </thead>
          <tbody>
            {scenario.holding_impacts.map((h) => (
              <tr key={h.ticker} className="border-b border-border/50">
                <td className="px-4 py-2 font-medium text-foreground">{h.ticker}</td>
                <td className="px-4 py-2 text-right text-foreground">{formatCurrency(h.current_value)}</td>
                <td className="px-4 py-2 text-right text-foreground">{formatCurrency(h.shocked_value)}</td>
                <td className={cn("px-4 py-2 text-right", h.impact >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {formatCurrency(h.impact)}
                </td>
                <td className={cn("px-4 py-2 text-right", h.impact_pct >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {formatPercent(h.impact_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
