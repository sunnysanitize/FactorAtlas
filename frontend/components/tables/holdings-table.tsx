"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { HoldingAnalytics } from "@/lib/types/api";
import { cn } from "@/lib/utils";

type SortKey = keyof HoldingAnalytics;

interface SortHeaderProps {
  label: string;
  field: SortKey;
  onToggle: (field: SortKey) => void;
}

function SortHeader({ label, field, onToggle }: SortHeaderProps) {
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => onToggle(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </th>
  );
}

export function HoldingsTable({ holdings }: { holdings: HoldingAnalytics[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  let filtered = holdings;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (h) =>
        h.ticker.toLowerCase().includes(q) ||
        (h.company_name && h.company_name.toLowerCase().includes(q)) ||
        (h.sector && h.sector.toLowerCase().includes(q))
    );
  }
  filtered = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
          <Input
            placeholder="Search tickers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 h-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <SortHeader label="Ticker" field="ticker" onToggle={toggleSort} />
              <SortHeader label="Shares" field="shares" onToggle={toggleSort} />
              <SortHeader label="Avg Cost" field="average_cost" onToggle={toggleSort} />
              <SortHeader label="Price" field="current_price" onToggle={toggleSort} />
              <SortHeader label="Value" field="market_value" onToggle={toggleSort} />
              <SortHeader label="Weight" field="weight" onToggle={toggleSort} />
              <SortHeader label="P&L" field="unrealized_gain_loss" onToggle={toggleSort} />
              <SortHeader label="Daily" field="daily_return" onToggle={toggleSort} />
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Sector</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.ticker} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                <td className="px-3 py-2.5">
                  <div>
                    <span className="font-medium text-foreground">{h.ticker}</span>
                    {h.company_name && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{h.company_name}</p>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-foreground">{h.shares.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-foreground">{formatCurrency(h.average_cost)}</td>
                <td className="px-3 py-2.5 text-foreground">{formatCurrency(h.current_price)}</td>
                <td className="px-3 py-2.5 text-foreground">{formatCurrency(h.market_value)}</td>
                <td className="px-3 py-2.5 text-foreground">{formatPercent(h.weight)}</td>
                <td className="px-3 py-2.5">
                  <span className={cn(h.unrealized_gain_loss >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {formatCurrency(h.unrealized_gain_loss)} ({formatPercent(h.unrealized_gain_loss_pct)})
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {h.daily_return != null && (
                    <span className={cn(h.daily_return >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatPercent(h.daily_return)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {h.sector && <Badge variant="outline" className="text-xs">{h.sector}</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
