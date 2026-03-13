import { ReactNode } from "react";

export interface KpiCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
}

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
