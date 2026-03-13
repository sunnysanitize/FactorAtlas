"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Table2,
  ShieldAlert,
  Network,
  FlaskConical,
  Newspaper,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Holdings", href: "/holdings", icon: Table2 },
  { label: "Risk", href: "/risk", icon: ShieldAlert },
  { label: "Graph", href: "/graph", icon: Network },
  { label: "Scenarios", href: "/scenarios", icon: FlaskConical },
  { label: "Events", href: "/events", icon: Newspaper },
  { label: "Copilot", href: "/copilot", icon: MessageSquare },
];

export function Sidebar({ portfolioId }: { portfolioId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const basePath = `/portfolio/${portfolioId}`;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-foreground">
            AGORA
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href || (item.href !== "" && pathname.startsWith(href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
