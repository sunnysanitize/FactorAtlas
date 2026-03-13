import Link from "next/link";

export function TopNav() {
  return (
    <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold tracking-wider text-foreground">
        AGORA
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
