"""Theme and exposure engine."""

from app.models.holding import Holding
from app.services.theme_data import TICKER_SECTORS, TICKER_THEMES


def get_sector_exposure(holdings: list[Holding], weights: dict[str, float]) -> list[dict]:
    """Compute portfolio weight by sector."""
    sector_weights: dict[str, float] = {}
    sector_holdings: dict[str, list[str]] = {}

    for h in holdings:
        sector = h.sector or TICKER_SECTORS.get(h.ticker, "Unknown")
        w = weights.get(h.ticker, 0)
        sector_weights[sector] = sector_weights.get(sector, 0) + w
        sector_holdings.setdefault(sector, []).append(h.ticker)

    result = [
        {"name": sector, "weight": round(w, 4), "holdings": sector_holdings.get(sector, [])}
        for sector, w in sorted(sector_weights.items(), key=lambda x: -x[1])
    ]
    return result


def get_theme_exposure(holdings: list[Holding], weights: dict[str, float]) -> list[dict]:
    """Compute portfolio weight by theme."""
    theme_weights: dict[str, float] = {}
    theme_holdings: dict[str, list[str]] = {}

    for h in holdings:
        themes = TICKER_THEMES.get(h.ticker, [])
        if not themes and h.primary_theme:
            themes = [h.primary_theme]
        if not themes:
            themes = ["Other"]

        w = weights.get(h.ticker, 0)
        share = w / len(themes) if themes else 0

        for theme in themes:
            theme_weights[theme] = theme_weights.get(theme, 0) + share
            if h.ticker not in theme_holdings.get(theme, []):
                theme_holdings.setdefault(theme, []).append(h.ticker)

    result = [
        {"name": theme, "weight": round(w, 4), "holdings": theme_holdings.get(theme, [])}
        for theme, w in sorted(theme_weights.items(), key=lambda x: -x[1])
    ]
    return result
