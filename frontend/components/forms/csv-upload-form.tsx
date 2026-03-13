"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { uploadCSV } from "@/lib/api/portfolio";
import type { CSVUploadResponse } from "@/lib/types/api";

export function CsvUploadForm({
  portfolioId,
  onSuccess,
}: {
  portfolioId: string;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CSVUploadResponse | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.name.endsWith(".csv")) {
      setFile(f);
      setError("");
      setResult(null);
    } else {
      setError("Please upload a .csv file");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await uploadCSV(portfolioId, file);
      setResult(res);
      setFile(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">CSV Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-500/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag & drop a CSV file, or{" "}
            <label className="text-blue-400 cursor-pointer hover:underline">
              browse
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Required columns: ticker, shares, average_cost</p>
        </div>

        {file && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-foreground">{file.name}</span>
            <Button size="sm" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Upload complete</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{result.holdings_added} added</Badge>
              <Badge variant="secondary">{result.holdings_merged} merged</Badge>
            </div>
            {result.errors.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {result.errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
