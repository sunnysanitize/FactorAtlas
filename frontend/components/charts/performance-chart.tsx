"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRID_COLOR, TEXT_COLOR, TOOLTIP_BG } from "@/lib/utils/chart";
import { formatCompactCurrency, formatDateShort } from "@/lib/utils/format";

export function PerformanceChart({
  data,
  title = "Portfolio Value",
}: {
  data: { date: string; value: number }[];
  title?: string;
}) {
  if (!data.length) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickFormatter={formatDateShort}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: TEXT_COLOR, fontSize: 11 }}
              tickFormatter={(v) => formatCompactCurrency(v)}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              labelStyle={{ color: TEXT_COLOR }}
              itemStyle={{ color: "#3b82f6" }}
              formatter={(value) => [formatCompactCurrency(Number(value)), "Value"]}
              labelFormatter={(label) => formatDateShort(String(label))}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#valueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
