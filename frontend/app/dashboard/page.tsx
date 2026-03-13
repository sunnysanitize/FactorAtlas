"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "@/components/layout/top-nav";
import { CreatePortfolioForm } from "@/components/forms/create-portfolio-form";
import { LoadingState } from "@/components/states/loading-state";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { listPortfolios } from "@/lib/api/portfolio";
import { formatDate } from "@/lib/utils/format";
import type { PortfolioSummary } from "@/lib/types/api";
import { Briefcase, Plus } from "lucide-react";

export default function DashboardPage() {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Portfolios</h1>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-1" />
            New Portfolio
          </Button>
        </div>

        {showCreate && (
          <div className="mb-6">
            <CreatePortfolioForm />
          </div>
        )}

        {loading && <LoadingState message="Loading portfolios..." />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && portfolios.length === 0 && (
          <EmptyState
            title="No portfolios yet"
            description="Create your first portfolio to get started with analytics."
            icon={<Briefcase className="h-12 w-12" />}
          />
        )}

        <div className="grid gap-3">
          {portfolios.map((p) => (
            <Link key={p.id} href={`/portfolio/${p.id}`}>
              <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Created {formatDate(p.created_at)}</p>
                  </div>
                  <Badge variant="secondary">{p.holding_count} holdings</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
