"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRID_COLOR, TEXT_COLOR, TOOLTIP_BG } from "@/lib/utils/chart";
import { formatPercent } from "@/lib/utils/format";

export function SectorBarChart({
  data,
  title = "Sector Allocation",
}: {
  data: { name: string; weight: number }[];
  title?: string;
}) {
  if (!data.length) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
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
              dataKey="name"
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              formatter={(value) => [formatPercent(Number(value)), "Weight"]}
            />
            <Bar dataKey="weight" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
