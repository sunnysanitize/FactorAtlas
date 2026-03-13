"""AI explanation layer using Gemini. Never invents numbers — only interprets structured analytics."""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


def _get_model():
    if not HAS_GENAI:
        return None
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-api-key":
        return None
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-2.0-flash")


def _has_openrouter() -> bool:
    return bool(
        settings.OPENROUTER_API_KEY
        and settings.OPENROUTER_API_KEY != "your-openrouter-api-key"
        and settings.OPENROUTER_MODEL
    )


def _call_openrouter(prompt: str) -> str | None:
    if not _has_openrouter():
        return None

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {"role": "user", "content": prompt},
            ],
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        return None

    message = choices[0].get("message") or {}
    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text_parts = [
            part.get("text", "")
            for part in content
            if isinstance(part, dict) and part.get("type") == "text"
        ]
        return "".join(text_parts) or None
    return None


SYSTEM_PROMPT = """You are a portfolio intelligence analyst for the FactorAtlas platform.

RULES:
- You MUST only interpret the supplied analytics data. Never invent numbers.
- Do not claim uncertainty as certainty.
- Prefer concise, decision-focused language.
- Mention when evidence is weak or incomplete.
- Format your response in clear, readable paragraphs.
- Use specific numbers from the data provided.
- If you cannot answer a question from the supplied data, say so explicitly.
"""


def build_context(
    overview: dict | None = None,
    risk: dict | None = None,
    themes: dict | None = None,
    events: list[dict] | None = None,
    scenario: dict | None = None,
) -> str:
    """Build structured context payload for the AI prompt."""
    parts = []

    if overview:
        parts.append(f"""PORTFOLIO OVERVIEW:
- Total Value: ${overview.get('total_value', 0):,.2f}
- Holdings Count: {overview.get('holdings_count', 0)}
- Daily Return: {overview.get('daily_return', 0):.2%}
- Cumulative Return: {overview.get('cumulative_return', 0):.2%}
- Top Holding: {overview.get('top_holding', 'N/A')}
- Top Sector: {overview.get('top_sector', 'N/A')}
- Top Theme: {overview.get('top_theme', 'N/A')}""")

    if risk:
        parts.append(f"""RISK METRICS:
- Annualized Volatility: {risk.get('annualized_volatility', 0):.2%}
- Beta vs SPY: {risk.get('beta', 0):.2f}
- Sharpe Ratio: {risk.get('sharpe_ratio', 0):.2f}
- Max Drawdown: {risk.get('max_drawdown', 0):.2%}
- VaR (95%): {risk.get('var_95', 0):.2%}""")

        if risk.get("concentration"):
            c = risk["concentration"]
            parts.append(f"""CONCENTRATION:
- Top Holding Weight: {c.get('top_holding_weight', 0):.1%}
- Top 3 Combined: {c.get('top_3_combined_weight', 0):.1%}
- HHI: {c.get('herfindahl_index', 0):.4f}""")

    if themes:
        sector_lines = ", ".join(
            f"{s['name']} ({s['weight']:.1%})"
            for s in (themes.get("sector_exposure") or [])[:5]
        )
        theme_lines = ", ".join(
            f"{t['name']} ({t['weight']:.1%})"
            for t in (themes.get("theme_exposure") or [])[:5]
        )
        parts.append(f"SECTOR EXPOSURE: {sector_lines}")
        parts.append(f"THEME EXPOSURE: {theme_lines}")

    if events:
        event_lines = "\n".join(
            f"- [{e.get('event_category', '')}] {e.get('title', '')} "
            f"(affects: {', '.join(a['ticker'] for a in e.get('affected_holdings', [])[:3])})"
            for e in events[:5]
        )
        parts.append(f"RECENT EVENTS:\n{event_lines}")

    if scenario:
        parts.append(f"""SCENARIO RESULT:
- Total Impact: ${scenario.get('total_impact', 0):,.2f} ({scenario.get('total_impact_pct', 0):.2%})""")

    return "\n\n".join(parts)


def ask_copilot(
    question: str,
    context_type: str = "general",
    overview: dict | None = None,
    risk: dict | None = None,
    themes: dict | None = None,
    events: list[dict] | None = None,
    scenario: dict | None = None,
) -> dict:
    """Send a grounded question to the configured AI provider and return the response."""
    provider = settings.AI_PROVIDER.lower().strip()
    model = _get_model() if provider == "gemini" else None

    context = build_context(overview, risk, themes, events, scenario)

    if not context:
        return {
            "answer": "Insufficient portfolio data to generate analysis. Please ensure the portfolio has holdings and market data has been fetched.",
            "source_metrics": None,
            "confidence": "low",
        }

    prompt = f"""{SYSTEM_PROMPT}

CONTEXT TYPE: {context_type}

{context}

USER QUESTION: {question}

Provide a clear, analytical response based ONLY on the data above."""

    try:
        response_text: str | None
        if provider == "openrouter":
            response_text = _call_openrouter(prompt)
        elif provider == "gemini":
            if model is None:
                return _fallback_response(question, context_type, overview, risk, themes)
            response = model.generate_content(prompt)
            response_text = response.text
        else:
            return _fallback_response(question, context_type, overview, risk, themes)

        if not response_text:
            return _fallback_response(question, context_type, overview, risk, themes)

        return {
            "answer": response_text,
            "source_metrics": {
                "total_value": overview.get("total_value") if overview else None,
                "volatility": risk.get("annualized_volatility") if risk else None,
                "beta": risk.get("beta") if risk else None,
                "sharpe": risk.get("sharpe_ratio") if risk else None,
            },
            "confidence": "high",
        }
    except Exception as e:
        logger.error("AI provider error (%s): %s", provider, e)
        return _fallback_response(question, context_type, overview, risk, themes)


def _fallback_response(
    question: str,
    context_type: str,
    overview: dict | None,
    risk: dict | None,
    themes: dict | None,
) -> dict:
    """Generate a basic analytical response without AI when Gemini is unavailable."""
    parts = []

    if overview:
        tv = overview.get("total_value", 0)
        cr = overview.get("cumulative_return", 0)
        hc = overview.get("holdings_count", 0)
        parts.append(
            f"Your portfolio is valued at ${tv:,.2f} with {hc} holdings "
            f"and a cumulative return of {cr:.2%}."
        )

    if risk:
        vol = risk.get("annualized_volatility", 0)
        beta = risk.get("beta", 0)
        sharpe = risk.get("sharpe_ratio", 0)
        mdd = risk.get("max_drawdown", 0)
        parts.append(
            f"Risk profile: volatility {vol:.2%}, beta {beta:.2f}, "
            f"Sharpe {sharpe:.2f}, max drawdown {mdd:.2%}."
        )

        if risk.get("concentration"):
            c = risk["concentration"]
            top = c.get("top_holding_weight", 0)
            top3 = c.get("top_3_combined_weight", 0)
            if top > 0.25:
                parts.append(
                    f"Warning: high concentration — top holding is {top:.1%} of the portfolio, "
                    f"top 3 are {top3:.1%}."
                )

    if themes:
        top_themes = themes.get("theme_exposure", [])[:3]
        if top_themes:
            theme_str = ", ".join(f"{t['name']} ({t['weight']:.1%})" for t in top_themes)
            parts.append(f"Top themes: {theme_str}.")

    answer = " ".join(parts) if parts else "Portfolio data is still loading. Please try again shortly."

    return {
        "answer": answer,
        "source_metrics": {
            "total_value": overview.get("total_value") if overview else None,
            "volatility": risk.get("annualized_volatility") if risk else None,
        },
        "confidence": "medium",
    }
