export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
  "#a855f7", // purple
];

export const POSITIVE_COLOR = "#10b981";
export const NEGATIVE_COLOR = "#ef4444";
export const NEUTRAL_COLOR = "#6b7280";
export const GRID_COLOR = "#1f2937";
export const TEXT_COLOR = "#9ca3af";
export const TOOLTIP_BG = "#111827";

export function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export const NODE_COLORS: Record<string, string> = {
  holding: "#3b82f6",
  sector: "#10b981",
  theme: "#f59e0b",
  macro_factor: "#ef4444",
  event: "#8b5cf6",
};

export const commonChartProps = {
  style: { fontSize: 12 },
};
