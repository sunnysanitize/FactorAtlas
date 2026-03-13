"""Phase 4 factor intelligence and ETF look-through services."""

from collections import defaultdict

from app.models.holding import Holding
from app.services.factor_data import (
    ETF_CONSTITUENTS,
    FACTOR_LABELS,
    HOLDING_FACTOR_SCORES,
    SECTOR_FACTOR_BIASES,
    THEME_FACTOR_BIASES,
)
from app.services.theme_data import TICKER_THEMES


def _holding_factor_map(holding: Holding) -> dict[str, float]:
    scores = defaultdict(float)
    ticker = holding.ticker.upper()

    for factor, value in HOLDING_FACTOR_SCORES.get(ticker, {}).items():
        scores[factor] += value

    if holding.sector:
        for factor, value in SECTOR_FACTOR_BIASES.get(holding.sector, {}).items():
            scores[factor] += value

    themes = ([holding.primary_theme] if holding.primary_theme else []) + TICKER_THEMES.get(ticker, [])
    seen = set()
    for theme in themes:
        if not theme or theme in seen:
            continue
        seen.add(theme)
        for factor, value in THEME_FACTOR_BIASES.get(theme, {}).items():
            scores[factor] += value

    return {factor: min(value, 1.5) for factor, value in scores.items() if value > 0}


def compute_factor_intelligence(holdings: list[Holding], weights: dict[str, float]) -> dict:
    if not holdings:
        return {
            "summary": [],
            "holdings": [],
            "alerts": [],
            "stability": [],
        }

    portfolio_scores = defaultdict(float)
    holding_rows = []
    for holding in holdings:
        exposures = _holding_factor_map(holding)
        weight = weights.get(holding.ticker, 0.0)
        top_factors = sorted(exposures.items(), key=lambda item: item[1], reverse=True)[:3]
        holding_rows.append({
            "ticker": holding.ticker,
            "weight": round(weight, 4),
            "top_factors": [
                {"factor_key": factor, "label": FACTOR_LABELS.get(factor, factor.replace("_", " ").title()), "score": round(score, 3)}
                for factor, score in top_factors
            ],
        })
        for factor, score in exposures.items():
            portfolio_scores[factor] += weight * score

    summary = []
    for factor, raw_exposure in sorted(portfolio_scores.items(), key=lambda item: item[1], reverse=True):
        normalized = min(raw_exposure, 1.0)
        summary.append({
            "factor_key": factor,
            "label": FACTOR_LABELS.get(factor, factor.replace("_", " ").title()),
            "exposure": round(normalized, 4),
            "intensity": (
                "high" if normalized >= 0.55 else "medium" if normalized >= 0.3 else "low"
            ),
        })

    alerts = []
    if summary:
        if summary[0]["exposure"] >= 0.55:
            alerts.append(f"Portfolio is heavily driven by {summary[0]['label'].lower()}.")
        if len(summary) > 1 and summary[0]["exposure"] - summary[1]["exposure"] >= 0.25:
            alerts.append(f"{summary[0]['label']} dominates the hidden exposure stack.")
        rates = next((item for item in summary if item["factor_key"] == "rates"), None)
        if rates and rates["exposure"] >= 0.35:
            alerts.append("Rate sensitivity is meaningful despite surface diversification.")

    stability = [
        {
            "factor_key": item["factor_key"],
            "label": item["label"],
            "stability_score": round(max(0.25, 1 - item["exposure"] * 0.55), 4),
        }
        for item in summary[:5]
    ]

    return {
        "summary": summary,
        "holdings": holding_rows,
        "alerts": alerts,
        "stability": stability,
    }


def compute_lookthrough_exposure(holdings: list[Holding], weights: dict[str, float]) -> dict:
    underlying = defaultdict(lambda: {"direct_weight": 0.0, "indirect_weight": 0.0, "company_name": None, "sector": None, "themes": set()})
    overlap = []

    for holding in holdings:
        ticker = holding.ticker.upper()
        weight = weights.get(holding.ticker, 0.0)
        constituents = ETF_CONSTITUENTS.get(ticker)
        if constituents:
            for constituent in constituents:
                constituent_ticker = str(constituent["ticker"])
                indirect_weight = weight * float(constituent["weight"])
                row = underlying[constituent_ticker]
                row["indirect_weight"] += indirect_weight
                row["company_name"] = constituent.get("company_name") or row["company_name"]
                row["sector"] = constituent.get("sector") or row["sector"]
                row["themes"].update(constituent.get("themes", []))
        else:
            row = underlying[ticker]
            row["direct_weight"] += weight
            row["company_name"] = holding.company_name or row["company_name"]
            row["sector"] = holding.sector or row["sector"]
            row["themes"].update(TICKER_THEMES.get(ticker, []))

    names = []
    sector_totals = defaultdict(float)
    theme_totals = defaultdict(float)
    for ticker, row in underlying.items():
        total_weight = row["direct_weight"] + row["indirect_weight"]
        names.append({
            "ticker": ticker,
            "company_name": row["company_name"] or ticker,
            "direct_weight": round(row["direct_weight"], 4),
            "indirect_weight": round(row["indirect_weight"], 4),
            "total_weight": round(total_weight, 4),
            "sector": row["sector"],
            "themes": sorted(theme for theme in row["themes"] if theme),
        })
        if row["sector"]:
            sector_totals[row["sector"]] += total_weight
        for theme in row["themes"]:
            theme_totals[theme] += total_weight
        if row["direct_weight"] > 0 and row["indirect_weight"] > 0:
            overlap.append({
                "ticker": ticker,
                "direct_weight": round(row["direct_weight"], 4),
                "indirect_weight": round(row["indirect_weight"], 4),
                "overlap_score": round(row["direct_weight"] + row["indirect_weight"], 4),
            })

    names.sort(key=lambda item: item["total_weight"], reverse=True)
    overlap.sort(key=lambda item: item["overlap_score"], reverse=True)

    return {
        "top_underlyings": names[:12],
        "sector_concentration": [
            {"name": sector, "weight": round(weight, 4)}
            for sector, weight in sorted(sector_totals.items(), key=lambda item: item[1], reverse=True)[:8]
        ],
        "theme_concentration": [
            {"name": theme, "weight": round(weight, 4)}
            for theme, weight in sorted(theme_totals.items(), key=lambda item: item[1], reverse=True)[:8]
        ],
        "overlap": overlap[:10],
        "redundancy_score": round(sum(item["overlap_score"] for item in overlap), 4),
    }
