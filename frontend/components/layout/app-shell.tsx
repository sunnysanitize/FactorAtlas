import { Sidebar } from "./sidebar";

export function AppShell({
  portfolioId,
  children,
}: {
  portfolioId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar portfolioId={portfolioId} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
