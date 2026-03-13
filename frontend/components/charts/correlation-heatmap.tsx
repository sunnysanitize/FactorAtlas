"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { Network } from "lucide-react";

function getColor(value: number): string {
  if (value >= 0.8) return "#1d4ed8";
  if (value >= 0.6) return "#3b82f6";
  if (value >= 0.4) return "#60a5fa";
  if (value >= 0.2) return "#93c5fd";
  if (value >= 0) return "#1f2937";
  if (value >= -0.2) return "#374151";
  if (value >= -0.4) return "#f87171";
  if (value >= -0.6) return "#ef4444";
  return "#dc2626";
}

export function CorrelationHeatmap({
  tickers,
  matrix,
}: {
  tickers: string[];
  matrix: number[][];
}) {
  if (!tickers.length || !matrix.length) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Correlation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No correlation data yet"
            description="Add holdings with enough market history to compute correlations."
            icon={<Network className="h-10 w-10" />}
          />
        </CardContent>
      </Card>
    );
  }

  if (tickers.length === 1) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Correlation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Need at least two holdings"
            description="Correlations only become meaningful when the portfolio has multiple stocks."
            icon={<Network className="h-10 w-10" />}
          />
        </CardContent>
      </Card>
    );
  }

  const cellSize = Math.min(48, Math.max(28, 500 / tickers.length));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Correlation Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="inline-block">
          {/* Header row */}
          <div className="flex" style={{ marginLeft: cellSize + 4 }}>
            {tickers.map((t) => (
              <div
                key={t}
                className="text-xs text-muted-foreground text-center overflow-hidden"
                style={{ width: cellSize, transform: "rotate(-45deg)", transformOrigin: "bottom left", height: cellSize }}
              >
                {t}
              </div>
            ))}
          </div>
          {/* Matrix rows */}
          {matrix.map((row, i) => (
            <div key={tickers[i]} className="flex items-center">
              <div
                className="text-xs text-muted-foreground text-right pr-1 shrink-0"
                style={{ width: cellSize }}
              >
                {tickers[i]}
              </div>
              {row.map((val, j) => (
                <div
                  key={j}
                  title={`${tickers[i]} / ${tickers[j]}: ${val.toFixed(3)}`}
                  className="border border-background cursor-pointer flex items-center justify-center text-[10px] font-medium text-white"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getColor(val),
                    opacity: 0.9,
                  }}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <span>-1</span>
            <div className="flex">
              {["#dc2626", "#ef4444", "#f87171", "#374151", "#1f2937", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"].map(
                (c) => (
                  <div key={c} className="w-5 h-3" style={{ backgroundColor: c }} />
                )
              )}
            </div>
            <span>+1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
