"""News and event ingestion service."""

import logging
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.event_holding_relevance import EventHoldingRelevance
from app.models.news_event import NewsEvent
from app.utils.cache import events_cache

logger = logging.getLogger(__name__)

EVENT_CATEGORIES = [
    "earnings", "macro", "regulation", "product_launch", "guidance",
    "analyst_action", "supply_chain", "geopolitics", "rates_and_inflation",
]


def classify_event(title: str, summary: str | None) -> str:
    """Simple keyword-based event classification."""
    text = f"{title} {summary or ''}".lower()

    if any(w in text for w in ["earnings", "revenue", "profit", "quarterly", "q1", "q2", "q3", "q4"]):
        return "earnings"
    if any(w in text for w in ["fed", "interest rate", "inflation", "cpi", "pce", "treasury"]):
        return "rates_and_inflation"
    if any(w in text for w in ["regulation", "sec", "antitrust", "ban", "compliance"]):
        return "regulation"
    if any(w in text for w in ["launch", "release", "new product", "unveil"]):
        return "product_launch"
    if any(w in text for w in ["guidance", "outlook", "forecast", "raised", "lowered"]):
        return "guidance"
    if any(w in text for w in ["upgrade", "downgrade", "analyst", "price target", "rating"]):
        return "analyst_action"
    if any(w in text for w in ["supply chain", "shortage", "chip", "semiconductor"]):
        return "supply_chain"
    if any(w in text for w in ["war", "sanction", "tariff", "geopolit", "china", "trade"]):
        return "geopolitics"
    if any(w in text for w in ["gdp", "jobs", "unemployment", "macro", "recession"]):
        return "macro"

    return "macro"


def fetch_finnhub_news(tickers: list[str]) -> list[dict]:
    """Fetch news from Finnhub for given tickers."""
    if not settings.ENABLE_EXTERNAL_NEWS_FETCH:
        logger.info("External news fetch disabled, skipping Finnhub fetch")
        return []

    if not settings.FINNHUB_API_KEY or settings.FINNHUB_API_KEY == "your-finnhub-api-key":
        logger.info("Finnhub API key not configured, skipping news fetch")
        return []

    articles = []
    seen_urls: set[str] = set()

    for ticker in tickers[:10]:  # limit to avoid rate limits
        try:
            resp = httpx.get(
                "https://finnhub.io/api/v1/company-news",
                params={
                    "symbol": ticker,
                    "from": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "to": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    "token": settings.FINNHUB_API_KEY,
                },
                timeout=10,
            )
            resp.raise_for_status()
            for item in resp.json()[:5]:
                url = item.get("url", "")
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                articles.append({
                    "title": item.get("headline", ""),
                    "source": item.get("source", ""),
                    "published_at": datetime.fromtimestamp(
                        item.get("datetime", 0), tz=timezone.utc
                    ),
                    "summary": item.get("summary", ""),
                    "url": url,
                    "related_ticker": ticker,
                })
        except Exception as e:
            logger.warning(f"Finnhub news fetch failed for {ticker}: {e}")

    return articles


def ingest_events(
    db: Session,
    tickers: list[str],
) -> list[NewsEvent]:
    """Fetch, deduplicate, classify, and store news events."""
    raw_articles = fetch_finnhub_news(tickers)
    if not raw_articles:
        return []

    events = []
    for article in raw_articles:
        # Check for duplicate by URL
        existing = None
        if article["url"]:
            existing = db.query(NewsEvent).filter(NewsEvent.url == article["url"]).first()
        if existing:
            continue

        category = classify_event(article["title"], article["summary"])

        event = NewsEvent(
            title=article["title"],
            source=article["source"],
            published_at=article["published_at"],
            summary=article["summary"],
            url=article["url"],
            event_category=category,
        )
        db.add(event)
        db.flush()

        # Add relevance link to the related ticker
        relevance = EventHoldingRelevance(
            event_id=event.id,
            ticker=article["related_ticker"],
            relevance_score=0.8,
            explanation=f"Directly mentioned in {article['source']} article about {article['related_ticker']}.",
        )
        db.add(relevance)
        events.append(event)

    db.commit()
    events_cache.clear()
    return events


def get_portfolio_events(
    db: Session,
    tickers: list[str],
    limit: int = 50,
) -> list[dict]:
    """Get events relevant to portfolio tickers, ranked by relevance."""
    if not tickers:
        return []

    cache_key = f"events:{','.join(sorted(tickers))}:{limit}"
    cached = events_cache.get(cache_key)
    if cached is not None:
        return cached

    relevances = (
        db.query(EventHoldingRelevance)
        .filter(EventHoldingRelevance.ticker.in_(tickers))
        .order_by(EventHoldingRelevance.relevance_score.desc())
        .limit(limit * 2)
        .all()
    )

    event_ids = list({r.event_id for r in relevances})
    if not event_ids:
        return []

    events = db.query(NewsEvent).filter(NewsEvent.id.in_(event_ids)).all()
    event_map = {e.id: e for e in events}

    # Group relevances by event
    event_relevances: dict[uuid.UUID, list] = {}
    for r in relevances:
        event_relevances.setdefault(r.event_id, []).append({
            "ticker": r.ticker,
            "relevance_score": r.relevance_score,
            "explanation": r.explanation,
        })

    results = []
    for event_id, rels in event_relevances.items():
        event = event_map.get(event_id)
        if not event:
            continue
        max_score = max(r["relevance_score"] for r in rels)
        results.append({
            "id": str(event.id),
            "title": event.title,
            "source": event.source,
            "published_at": event.published_at.isoformat() if event.published_at else None,
            "summary": event.summary,
            "url": event.url,
            "event_category": event.event_category,
            "affected_holdings": rels,
            "max_relevance": max_score,
        })

    results.sort(key=lambda x: x["max_relevance"], reverse=True)
    final_results = results[:limit]
    events_cache.set(cache_key, final_results)
    return final_results
