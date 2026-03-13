"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getColor(value: number): string {
  if (value >= 0.8) return "#0f766e";
  if (value >= 0.6) return "#0d9488";
  if (value >= 0.4) return "#14b8a6";
  if (value >= 0.2) return "#5eead4";
  return "#1f2937";
}

export function OverlapHeatmap({
  labels,
  matrix,
}: {
  labels: string[];
  matrix: number[][];
}) {
  if (!labels.length || !matrix.length) return null;

  const cellSize = Math.min(52, Math.max(30, 520 / labels.length));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Wrapper Overlap Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex" style={{ marginLeft: cellSize + 8 }}>
            {labels.map((label) => (
              <div
                key={label}
                className="text-xs text-muted-foreground text-center overflow-hidden"
                style={{ width: cellSize, transform: "rotate(-45deg)", transformOrigin: "bottom left", height: cellSize }}
              >
                {label}
              </div>
            ))}
          </div>
          {matrix.map((row, rowIndex) => (
            <div key={labels[rowIndex]} className="flex items-center">
              <div className="text-xs text-muted-foreground text-right pr-2 shrink-0" style={{ width: cellSize }}>
                {labels[rowIndex]}
              </div>
              {row.map((value, columnIndex) => (
                <div
                  key={`${rowIndex}-${columnIndex}`}
                  title={`${labels[rowIndex]} / ${labels[columnIndex]} overlap: ${value.toFixed(3)}`}
                  className="border border-background flex items-center justify-center text-[10px] font-medium text-white"
                  style={{ width: cellSize, height: cellSize, backgroundColor: getColor(value), opacity: 0.92 }}
                >
                  {value.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
