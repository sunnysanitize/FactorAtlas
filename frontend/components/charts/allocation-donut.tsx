"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS, TOOLTIP_BG } from "@/lib/utils/chart";
import { formatPercent } from "@/lib/utils/format";

export function AllocationDonut({
  data,
  title,
}: {
  data: { name: string; weight: number }[];
  title: string;
}) {
  if (!data.length) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.weight }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: "1px solid #374151", borderRadius: 6 }}
              formatter={(value) => formatPercent(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
          {data.slice(0, 8).map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">
                {item.name} ({formatPercent(item.weight, 1)})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
