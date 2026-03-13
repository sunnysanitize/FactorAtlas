"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addHoldings } from "@/lib/api/portfolio";
import { Plus } from "lucide-react";

export function AddHoldingForm({
  portfolioId,
  onSuccess,
}: {
  portfolioId: string;
  onSuccess?: () => void;
}) {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !shares || !avgCost) return;

    setLoading(true);
    setError("");
    try {
      await addHoldings(portfolioId, [
        { ticker: ticker.trim().toUpperCase(), shares: parseFloat(shares), average_cost: parseFloat(avgCost) },
      ]);
      setTicker("");
      setShares("");
      setAvgCost("");
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
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Ticker</label>
            <Input
              placeholder="AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="h-8 text-sm"
              disabled={loading}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-muted-foreground">Shares</label>
            <Input
              type="number"
              step="any"
              placeholder="10"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="h-8 text-sm"
              disabled={loading}
            />
          </div>
          <div className="w-28">
            <label className="text-xs text-muted-foreground">Avg Cost</label>
            <Input
              type="number"
              step="any"
              placeholder="150.00"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              className="h-8 text-sm"
              disabled={loading}
            />
          </div>
          <Button type="submit" size="sm" disabled={loading} className="h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
