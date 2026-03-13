"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRID_COLOR, TEXT_COLOR, TOOLTIP_BG } from "@/lib/utils/chart";
import { formatPercent } from "@/lib/utils/format";
import type { RiskContributor } from "@/lib/types/api";

export function RiskContributionChart({ data }: { data: RiskContributor[] }) {
  if (!data.length) return null;

  const chartData = data.slice(0, 15).map((d) => ({
    ticker: d.ticker,
    contribution: d.contribution,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Risk Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 32)}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickFormatter={(v) => formatPercent(v, 0)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="ticker"
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              formatter={(value) => [formatPercent(Number(value)), "Contribution"]}
            />
            <Bar dataKey="contribution" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
