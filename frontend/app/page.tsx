import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Network, ShieldAlert, Sparkles, TrendingUp, Newspaper } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Quantitative Analytics",
    description: "Real portfolio metrics — volatility, beta, Sharpe, drawdown, VaR — computed from actual market data.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Decomposition",
    description: "Understand where risk is concentrated across holdings, sectors, themes, and correlations.",
  },
  {
    icon: Network,
    title: "Intelligence Graph",
    description: "Explore relationships between holdings, themes, macro factors, and events in an interactive graph.",
  },
  {
    icon: BarChart3,
    title: "Scenario Analysis",
    description: "Stress test your portfolio against sector shocks, theme selloffs, and benchmark declines.",
  },
  {
    icon: Newspaper,
    title: "Event Intelligence",
    description: "Recent events ranked by relevance to your holdings, not just raw headlines.",
  },
  {
    icon: Sparkles,
    title: "Grounded AI Insights",
    description: "AI explanations built on real computed metrics — never fabricated numbers.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-wider">AGORA</span>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Open Dashboard</Button>
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Understand what your portfolio
          <br />
          <span className="text-blue-400">is really exposed to.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A portfolio intelligence platform that combines quant analytics, event relevance,
          and AI explanations to reveal the real structure, risks, and drivers of your holdings.
        </p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Agora — Portfolio Intelligence Platform
      </footer>
    </div>
  );
}
