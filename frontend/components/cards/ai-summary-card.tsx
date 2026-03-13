"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function AiSummaryCard({
  answer,
  confidence,
  sourceMetrics,
  loading,
}: {
  answer: string;
  confidence?: string;
  sourceMetrics?: Record<string, unknown> | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Generating analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            AI Analysis
          </CardTitle>
          {confidence && (
            <Badge variant="outline" className="text-xs">
              {confidence} confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{answer}</p>
        {sourceMetrics && Object.keys(sourceMetrics).length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Source metrics</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sourceMetrics).map(
                ([key, val]) =>
                  val != null && (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {typeof val === "number" ? val.toFixed(4) : String(val)}
                    </Badge>
                  )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
