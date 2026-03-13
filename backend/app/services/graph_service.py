"""Relationship graph engine."""

import logging

from app.models.holding import Holding
from app.services.theme_data import TICKER_SECTORS, TICKER_THEMES

logger = logging.getLogger(__name__)

CORRELATION_THRESHOLD = 0.6


def build_graph(
    holdings: list[Holding],
    weights: dict[str, float],
    correlation_matrix: tuple[list[str], list[list[float]]] | None = None,
    events: list[dict] | None = None,
) -> dict:
    """Build the portfolio relationship graph.

    Returns:
        {"nodes": [...], "edges": [...]}
    """
    nodes = []
    edges = []
    node_ids: set[str] = set()

    # Holding nodes
    for h in holdings:
        w = weights.get(h.ticker, 0)
        nodes.append({
            "id": h.ticker,
            "label": h.ticker,
            "type": "holding",
            "size": max(8, w * 100),
            "metadata": {
                "company_name": h.company_name,
                "sector": h.sector,
                "weight": round(w, 4),
            },
        })
        node_ids.add(h.ticker)

    # Sector nodes and edges
    sectors_seen: set[str] = set()
    for h in holdings:
        sector = h.sector or TICKER_SECTORS.get(h.ticker, "Unknown")
        if sector not in sectors_seen:
            nodes.append({
                "id": f"sector:{sector}",
                "label": sector,
                "type": "sector",
                "size": 20,
            })
            node_ids.add(f"sector:{sector}")
            sectors_seen.add(sector)

        edges.append({
            "source": h.ticker,
            "target": f"sector:{sector}",
            "type": "belongs_to_sector",
            "weight": 1.0,
            "explanation": f"{h.ticker} belongs to the {sector} sector.",
        })

    # Theme nodes and edges
    themes_seen: set[str] = set()
    for h in holdings:
        themes = TICKER_THEMES.get(h.ticker, [])
        if not themes and h.primary_theme:
            themes = [h.primary_theme]
        for theme in themes:
            if theme not in themes_seen:
                nodes.append({
                    "id": f"theme:{theme}",
                    "label": theme,
                    "type": "theme",
                    "size": 16,
                })
                node_ids.add(f"theme:{theme}")
                themes_seen.add(theme)

            edges.append({
                "source": h.ticker,
                "target": f"theme:{theme}",
                "type": "belongs_to_theme",
                "weight": 1.0,
                "explanation": f"{h.ticker} is classified under the {theme} theme.",
            })

    # Correlation edges (holding-to-holding)
    if correlation_matrix:
        tickers, matrix = correlation_matrix
        for i in range(len(tickers)):
            for j in range(i + 1, len(tickers)):
                corr = matrix[i][j]
                if abs(corr) >= CORRELATION_THRESHOLD:
                    edges.append({
                        "source": tickers[i],
                        "target": tickers[j],
                        "type": "correlated_with",
                        "weight": round(abs(corr), 4),
                        "explanation": (
                            f"{tickers[i]} and {tickers[j]} have a "
                            f"{'positive' if corr > 0 else 'negative'} "
                            f"correlation of {corr:.2f}."
                        ),
                    })

    # Event nodes and edges
    if events:
        for event in events[:20]:
            event_id = f"event:{event['id']}"
            if event_id not in node_ids:
                nodes.append({
                    "id": event_id,
                    "label": event["title"][:50],
                    "type": "event",
                    "size": 12,
                    "metadata": {
                        "category": event.get("event_category"),
                        "source": event.get("source"),
                    },
                })
                node_ids.add(event_id)

            for affected in event.get("affected_holdings", []):
                if affected["ticker"] in node_ids:
                    edges.append({
                        "source": event_id,
                        "target": affected["ticker"],
                        "type": "impacted_by_event",
                        "weight": affected.get("relevance_score", 0.5),
                        "explanation": affected.get("explanation", ""),
                    })

    # Macro factor nodes
    macro_factors = {
        "Interest Rates": ["Financials", "Real Estate"],
        "Oil Prices": ["Energy"],
        "USD Strength": ["Big Tech", "E-Commerce"],
        "AI Capex Cycle": ["AI Infrastructure", "Semiconductors", "Cloud"],
        "Consumer Spending": ["Consumer Discretionary", "Retail", "Travel"],
    }

    for factor, related_themes in macro_factors.items():
        connected_themes = [t for t in related_themes if t in themes_seen]
        if connected_themes:
            factor_id = f"macro:{factor}"
            nodes.append({
                "id": factor_id,
                "label": factor,
                "type": "macro_factor",
                "size": 14,
            })
            for theme in connected_themes:
                edges.append({
                    "source": factor_id,
                    "target": f"theme:{theme}",
                    "type": "linked_to_macro",
                    "weight": 0.7,
                    "explanation": f"{factor} is a key macro driver for the {theme} theme.",
                })

    return {"nodes": nodes, "edges": edges}
