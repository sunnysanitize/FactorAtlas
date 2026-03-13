export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  sector?: string;
  theme?: string;
  search?: string;
}

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "2Y" | "ALL";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sourceMetrics?: Record<string, unknown> | null;
}
