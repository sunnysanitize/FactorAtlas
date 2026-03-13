"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { invalidatePortfolioAnalytics } from "@/lib/api/analytics";
import { deleteHolding, updateHolding } from "@/lib/api/portfolio";
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

interface HoldingsTableProps {
  holdings: HoldingAnalytics[];
  portfolioId?: string;
  onChanged?: () => void;
}

export function HoldingsTable({ holdings, portfolioId, onChanged }: HoldingsTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingHolding, setEditingHolding] = useState<HoldingAnalytics | null>(null);
  const [editTicker, setEditTicker] = useState("");
  const [editShares, setEditShares] = useState("");
  const [editAverageCost, setEditAverageCost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tableError, setTableError] = useState("");

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

  const startEdit = (holding: HoldingAnalytics) => {
    setEditingHolding(holding);
    setEditTicker(holding.ticker);
    setEditShares(String(holding.shares));
    setEditAverageCost(String(holding.average_cost));
    setTableError("");
  };

  const handleEditSave = async () => {
    if (!portfolioId || !editingHolding) return;
    if (!editTicker.trim() || Number(editShares) <= 0 || Number(editAverageCost) <= 0) {
      setTableError("Enter a ticker, positive shares, and positive average cost.");
      return;
    }

    setSubmitting(true);
    setTableError("");
    try {
      await updateHolding(portfolioId, editingHolding.id, {
        ticker: editTicker.trim().toUpperCase(),
        shares: Number(editShares),
        average_cost: Number(editAverageCost),
      });
      invalidatePortfolioAnalytics(portfolioId);
      setEditingHolding(null);
      onChanged?.();
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to update holding");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (holding: HoldingAnalytics) => {
    if (!portfolioId) return;
    const confirmed = window.confirm(`Delete ${holding.ticker} from this portfolio?`);
    if (!confirmed) return;

    setSubmitting(true);
    setTableError("");
    try {
      await deleteHolding(portfolioId, holding.id);
      invalidatePortfolioAnalytics(portfolioId);
      onChanged?.();
    } catch (err) {
      setTableError(err instanceof Error ? err.message : "Failed to delete holding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
          <Input
            placeholder="Search tickers, companies, sectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 h-8 text-xs"
          />
        </div>
        {tableError && <p className="text-xs text-destructive">{tableError}</p>}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <SortHeader label="Ticker" field="ticker" onToggle={toggleSort} />
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Market</th>
              <SortHeader label="Shares" field="shares" onToggle={toggleSort} />
              <SortHeader label="Avg Cost" field="average_cost" onToggle={toggleSort} />
              <SortHeader label="Price" field="current_price" onToggle={toggleSort} />
              <SortHeader label="Value" field="market_value" onToggle={toggleSort} />
              <SortHeader label="Weight" field="weight" onToggle={toggleSort} />
              <SortHeader label="P&L" field="unrealized_gain_loss" onToggle={toggleSort} />
              <SortHeader label="Daily" field="daily_return" onToggle={toggleSort} />
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Sector</th>
              {portfolioId && <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>}
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
                <td className="px-3 py-2.5">
                  {h.market && (
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        {h.market === "Canada" ? "CA" : h.market === "United States" ? "US" : h.market}
                      </Badge>
                      {(h.exchange || h.currency) && (
                        <p className="text-[11px] text-muted-foreground">
                          {[h.exchange, h.currency].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>
                  )}
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
                {portfolioId && (
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="icon-xs" variant="outline" onClick={() => startEdit(h)} disabled={submitting}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" size="icon-xs" variant="outline" onClick={() => handleDelete(h)} disabled={submitting}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
      <Dialog open={Boolean(editingHolding)} onOpenChange={(open) => !open && setEditingHolding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Holding</DialogTitle>
            <DialogDescription>Update the ticker, share count, or average cost.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Ticker</label>
              <Input value={editTicker} onChange={(e) => setEditTicker(e.target.value.toUpperCase())} disabled={submitting} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Shares</label>
              <Input type="number" step="any" value={editShares} onChange={(e) => setEditShares(e.target.value)} disabled={submitting} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Average Cost</label>
              <Input type="number" step="any" value={editAverageCost} onChange={(e) => setEditAverageCost(e.target.value)} disabled={submitting} />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button type="button" onClick={handleEditSave} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
