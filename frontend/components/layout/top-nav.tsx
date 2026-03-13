"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold tracking-wider text-foreground">
        FACTORATLAS
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>Log Out</Button>
          </>
        ) : (
          <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Log In
          </Link>
        )}
      </nav>
    </header>
  );
}
