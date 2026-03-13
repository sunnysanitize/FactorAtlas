"""First-pass causal event propagation for Phase 4."""

from collections import defaultdict

from app.models.holding import Holding
from app.services.theme_data import TICKER_THEMES

MACRO_THEME_MAP: dict[str, list[str]] = {
    "Interest Rates": ["Cloud", "Fintech", "Real Estate", "Growth"],
    "AI Capex Cycle": ["AI Infrastructure", "Semiconductors", "Cloud"],
    "Consumer Spending": ["Retail", "Travel", "E-Commerce", "Consumer Electronics"],
    "Energy Prices": ["Oil & Gas", "Industrials", "Travel"],
}

EVENT_MACRO_MAP: dict[str, list[str]] = {
    "earnings": ["Consumer Spending"],
    "macro": ["Interest Rates", "Consumer Spending"],
    "rates_and_inflation": ["Interest Rates"],
    "supply_chain": ["AI Capex Cycle", "Energy Prices"],
    "guidance": ["Consumer Spending"],
    "product_launch": ["AI Capex Cycle"],
}


def build_event_propagation(events: list[dict], holdings: list[Holding], weights: dict[str, float]) -> list[dict]:
    theme_to_holdings: dict[str, list[dict]] = defaultdict(list)
    for holding in holdings:
        themes = TICKER_THEMES.get(holding.ticker, []) or ([holding.primary_theme] if holding.primary_theme else [])
        for theme in themes:
            if theme:
                theme_to_holdings[theme].append({"ticker": holding.ticker, "weight": weights.get(holding.ticker, 0.0)})

    propagation = []
    for event in events:
        category = event.get("event_category") or "macro"
        direct_paths = [
            {
                "path_type": "direct",
                "holding": affected["ticker"],
                "via": ["Direct mention"],
                "impact_score": round(float(affected.get("relevance_score", 0.5)), 4),
                "explanation": affected.get("explanation") or "Directly referenced by the event.",
            }
            for affected in event.get("affected_holdings", [])
        ]

        indirect_paths = []
        direct_holdings = {path["holding"] for path in direct_paths}
        for macro_factor in EVENT_MACRO_MAP.get(category, []):
            for theme in MACRO_THEME_MAP.get(macro_factor, []):
                for linked in theme_to_holdings.get(theme, []):
                    if linked["ticker"] in direct_holdings:
                        continue
                    impact_score = round(min(1.0, 0.3 + linked["weight"] * 1.5), 4)
                    indirect_paths.append({
                        "path_type": "indirect",
                        "holding": linked["ticker"],
                        "via": [macro_factor, theme],
                        "impact_score": impact_score,
                        "explanation": f"{event['title']} may propagate through {macro_factor.lower()} into the {theme} theme.",
                    })

        all_paths = sorted(direct_paths + indirect_paths, key=lambda item: item["impact_score"], reverse=True)
        propagation.append({
            "event_id": event["id"],
            "title": event["title"],
            "event_category": category,
            "direct_count": len(direct_paths),
            "indirect_count": len(indirect_paths),
            "blast_radius_score": round(sum(path["impact_score"] for path in all_paths[:5]), 4),
            "pathways": all_paths[:8],
        })

    propagation.sort(key=lambda item: item["blast_radius_score"], reverse=True)
    return propagation
