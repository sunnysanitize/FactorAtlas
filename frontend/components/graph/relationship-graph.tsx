"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NODE_COLORS } from "@/lib/utils/chart";
import type { GraphResponse, GraphNode, GraphEdge } from "@/lib/types/api";

interface ForceGraphMethods {
  zoomToFit: (duration?: number, padding?: number) => void;
}

export function RelationshipGraph({ data }: { data: GraphResponse }) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [ForceGraph, setForceGraph] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const graphRef = useRef<ForceGraphMethods>(null);

  useEffect(() => {
    import("react-force-graph-2d").then((mod) => setForceGraph(() => mod.default));
  }, []);

  const filteredNodes = filterType === "all" ? data.nodes : data.nodes.filter((n) => n.type === filterType);
  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = data.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  const graphData = {
    nodes: filteredNodes.map((n) => ({ ...n, color: NODE_COLORS[n.type] || "#6b7280", val: n.size })),
    links: filteredEdges.map((e) => ({ ...e })),
  };

  const handleNodeClick = useCallback(
    (node: Record<string, unknown>) => {
      const found = data.nodes.find((n) => n.id === node.id);
      setSelectedNode(found || null);
    },
    [data.nodes]
  );

  const nodeTypes = [...new Set(data.nodes.map((n) => n.type))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card className="lg:col-span-3 bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Intelligence Graph</CardTitle>
            <Select value={filterType} onValueChange={(v) => v && setFilterType(v)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {nodeTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: 500 }} className="bg-background/50 rounded-b-lg">
            {ForceGraph && (
              <ForceGraph
                ref={graphRef}
                graphData={graphData}
                nodeLabel={(node: Record<string, unknown>) => node.label as string}
                nodeColor={(node: Record<string, unknown>) => node.color as string}
                nodeVal={(node: Record<string, unknown>) => (node.val as number) || 10}
                linkColor={() => "#374151"}
                linkWidth={(link: Record<string, unknown>) => Math.max(1, ((link.weight as number) || 0.5) * 2)}
                onNodeClick={handleNodeClick}
                backgroundColor="transparent"
                width={800}
                height={500}
              />
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-3 border-t border-border">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {type.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail panel */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Node Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <p className="text-lg font-semibold text-foreground">{selectedNode.label}</p>
                <Badge variant="outline" className="text-xs mt-1" style={{ borderColor: NODE_COLORS[selectedNode.type] }}>
                  {selectedNode.type.replace(/_/g, " ")}
                </Badge>
              </div>
              {selectedNode.metadata && (
                <div className="space-y-1">
                  {Object.entries(selectedNode.metadata).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="text-foreground">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Connected edges</p>
                {data.edges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .slice(0, 10)
                  .map((e, i) => (
                    <div key={i} className="text-xs text-muted-foreground py-0.5">
                      {e.type.replace(/_/g, " ")} → {e.source === selectedNode.id ? e.target : e.source}
                      {e.explanation && <p className="text-xs italic mt-0.5">{e.explanation}</p>}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Click a node to see details</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
