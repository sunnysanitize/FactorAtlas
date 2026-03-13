"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRID_COLOR, TEXT_COLOR, TOOLTIP_BG } from "@/lib/utils/chart";
import { formatDateShort } from "@/lib/utils/format";

export function RollingMetricsChart({
  volatility,
  beta,
  sharpe,
}: {
  volatility: { date: string; value: number }[];
  beta: { date: string; value: number }[];
  sharpe: { date: string; value: number }[];
}) {
  // Merge all into a single dataset keyed by date
  const dateMap: Record<string, { date: string; volatility?: number; beta?: number; sharpe?: number }> = {};

  for (const d of volatility) {
    dateMap[d.date] = { ...dateMap[d.date], date: d.date, volatility: d.value };
  }
  for (const d of beta) {
    dateMap[d.date] = { ...dateMap[d.date], date: d.date, beta: d.value };
  }
  for (const d of sharpe) {
    dateMap[d.date] = { ...dateMap[d.date], date: d.date, sharpe: d.value };
  }

  const data = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  if (!data.length) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Rolling Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickFormatter={formatDateShort}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fill: TEXT_COLOR, fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              labelStyle={{ color: TEXT_COLOR }}
              labelFormatter={(label) => formatDateShort(String(label))}
            />
            <Legend wrapperStyle={{ color: TEXT_COLOR, fontSize: 12 }} />
            {volatility.length > 0 && (
              <Line type="monotone" dataKey="volatility" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
            )}
            {beta.length > 0 && (
              <Line type="monotone" dataKey="beta" stroke="#10b981" strokeWidth={1.5} dot={false} />
            )}
            {sharpe.length > 0 && (
              <Line type="monotone" dataKey="sharpe" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
