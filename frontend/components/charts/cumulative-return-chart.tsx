"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRID_COLOR, TEXT_COLOR, TOOLTIP_BG, POSITIVE_COLOR, NEGATIVE_COLOR } from "@/lib/utils/chart";
import { formatPercent, formatDateShort } from "@/lib/utils/format";

export function CumulativeReturnChart({
  data,
}: {
  data: { date: string; value: number }[];
}) {
  if (!data.length) return null;

  const lastValue = data[data.length - 1]?.value ?? 0;
  const color = lastValue >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Cumulative Return</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
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
              tickFormatter={(v) => formatPercent(v, 1)}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              labelStyle={{ color: TEXT_COLOR }}
              formatter={(value) => [formatPercent(Number(value)), "Return"]}
              labelFormatter={(label) => formatDateShort(String(label))}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#returnGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
