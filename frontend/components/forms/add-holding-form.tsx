"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invalidatePortfolioAnalytics } from "@/lib/api/analytics";
import { addHoldings } from "@/lib/api/portfolio";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";

type ListingMarket = "us" | "ca";

interface HoldingDraft {
  id: number;
  ticker: string;
  market: ListingMarket;
  shares: string;
  averageCost: string;
}

function createDraft(id: number): HoldingDraft {
  return { id, ticker: "", market: "us", shares: "", averageCost: "" };
}

function normalizeTickerForMarket(ticker: string, market: ListingMarket): string {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return normalized;

  if (market === "ca" && !normalized.includes(".")) {
    return `${normalized}.TO`;
  }

  return normalized;
}

export function AddHoldingForm({
  portfolioId,
  onSuccess,
}: {
  portfolioId: string;
  onSuccess?: () => void;
}) {
  const [rows, setRows] = useState<HoldingDraft[]>([createDraft(1)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [nextId, setNextId] = useState(2);

  const updateRow = (id: number, field: keyof Omit<HoldingDraft, "id">, value: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setError("");
    setSuccessMessage("");
  };

  const addRow = () => {
    setRows((current) => [...current, createDraft(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeRow = (id: number) => {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== id)));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const populatedRows = rows.filter(
      (row) => row.ticker.trim() || row.shares.trim() || row.averageCost.trim()
    );

    if (!populatedRows.length) {
      setError("Enter at least one ticker, share count, and average cost.");
      return;
    }

    for (const row of populatedRows) {
      if (!row.ticker.trim() || !row.shares || !row.averageCost) {
        setError("Each stock row needs a ticker, share count, and average cost.");
        return;
      }
      if (Number(row.shares) <= 0 || Number(row.averageCost) <= 0) {
        setError("Shares and average cost must both be greater than zero.");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await addHoldings(
        portfolioId,
        populatedRows.map((row) => ({
          ticker: normalizeTickerForMarket(row.ticker, row.market),
          shares: parseFloat(row.shares),
          average_cost: parseFloat(row.averageCost),
        }))
      );
      invalidatePortfolioAnalytics(portfolioId);
      const addedTickers = populatedRows.map((row) => normalizeTickerForMarket(row.ticker, row.market));
      setRows([createDraft(nextId)]);
      setNextId((current) => current + 1);
      setSuccessMessage(
        addedTickers.length === 1
          ? `${addedTickers[0]} added to the portfolio.`
          : `${addedTickers.length} stocks added to the portfolio.`
      );
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add holding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Add Holding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Add one or more stocks. Choose the listing market for each row. Existing tickers are merged automatically.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-border/60 p-3">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px_120px_140px] xl:items-end">
                <div>
                  <label className="text-xs text-muted-foreground">
                    {index === 0 ? "Ticker" : `Ticker ${index + 1}`}
                  </label>
                  <Input
                    placeholder={row.market === "ca" ? "TD or TD.TO" : "AAPL"}
                    value={row.ticker}
                    onChange={(e) => updateRow(row.id, "ticker", e.target.value.toUpperCase())}
                    className="h-9 text-sm"
                    disabled={loading}
                  />
                  {row.market === "ca" && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Canadian tickers default to `.TO` unless you enter a suffix like `.V` yourself.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Market</label>
                  <Select
                    value={row.market}
                    onValueChange={(value) => updateRow(row.id, "market", value as ListingMarket)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Shares</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="10"
                    value={row.shares}
                    onChange={(e) => updateRow(row.id, "shares", e.target.value)}
                    className="h-9 text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Avg Cost</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="150.00"
                    value={row.averageCost}
                    onChange={(e) => updateRow(row.id, "averageCost", e.target.value)}
                    className="h-9 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" disabled={loading} className="h-9" onClick={() => removeRow(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                {index === rows.length - 1 && (
                  <Button type="button" size="sm" variant="outline" disabled={loading} className="h-9" onClick={addRow}>
                    <Plus className="h-4 w-4 mr-1" />
                    Row
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="submit" size="sm" disabled={loading} className="h-9 min-w-32">
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "Adding..." : "Add Stocks"}
          </Button>
        </form>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        {successMessage && (
          <div className="flex items-center gap-2 text-xs text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
