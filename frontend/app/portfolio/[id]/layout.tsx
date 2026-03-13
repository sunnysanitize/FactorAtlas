import { AppShell } from "@/components/layout/app-shell";

export default async function PortfolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppShell portfolioId={id}>{children}</AppShell>;
}
