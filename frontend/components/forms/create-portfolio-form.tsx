"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPortfolio } from "@/lib/api/portfolio";

export function CreatePortfolioForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      const portfolio = await createPortfolio(name.trim());
      router.push(`/portfolio/${portfolio.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Create Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Portfolio name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !name.trim()} className="w-full">
            {loading ? "Creating..." : "Create Portfolio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
