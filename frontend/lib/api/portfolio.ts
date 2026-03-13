import { get, post, postForm } from "./client";
import type { Portfolio, PortfolioSummary, Holding, CSVUploadResponse } from "@/lib/types/api";

export function listPortfolios(): Promise<PortfolioSummary[]> {
  return get<PortfolioSummary[]>("/portfolios");
}

export function getPortfolio(id: string): Promise<Portfolio> {
  return get<Portfolio>(`/portfolios/${id}`);
}

export function createPortfolio(name: string, userEmail?: string): Promise<Portfolio> {
  return post<Portfolio>("/portfolios", { name, user_email: userEmail });
}

export function addHoldings(
  portfolioId: string,
  holdings: { ticker: string; shares: number; average_cost: number }[]
): Promise<Holding[]> {
  return post<Holding[]>(`/portfolios/${portfolioId}/holdings`, holdings);
}

export function uploadCSV(portfolioId: string, file: File): Promise<CSVUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return postForm<CSVUploadResponse>(`/portfolios/${portfolioId}/upload-csv`, formData);
}
