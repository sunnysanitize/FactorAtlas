"""Market data service using yfinance for MVP."""

import logging
from datetime import date

import pandas as pd
import yfinance as yf

from app.utils.cache import metadata_cache, price_cache
from app.utils.dates import default_end_date, default_start_date

logger = logging.getLogger(__name__)

CANADIAN_SUFFIXES = (".TO", ".V", ".CN", ".NE")
US_EXCHANGES = {"NMS", "NGM", "NYQ", "ASE", "PCX", "BTS", "NASDAQ", "NYSE", "AMEX"}
CANADIAN_EXCHANGES = {"TOR", "TSX", "TSXV", "CVE", "CNQ", "NEO"}


def fetch_ticker_metadata(ticker: str) -> dict:
    """Fetch company name, sector, and other metadata for a ticker."""
    cache_key = f"meta:{ticker}"
    cached = metadata_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        t = yf.Ticker(ticker)
        info = t.info or {}
        result = {
            "company_name": info.get("longName") or info.get("shortName") or ticker,
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "currency": info.get("currency", "USD"),
            "exchange": info.get("exchange"),
        }
        metadata_cache.set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Failed to fetch metadata for {ticker}: {e}")
        return {"company_name": ticker, "sector": None, "industry": None, "currency": "USD", "exchange": None}


def fetch_current_price(ticker: str) -> float | None:
    """Fetch the latest price for a ticker."""
    cache_key = f"price:{ticker}"
    cached = price_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="5d")
        if hist.empty:
            return None
        price = float(hist["Close"].iloc[-1])
        price_cache.set(cache_key, price)
        return price
    except Exception as e:
        logger.warning(f"Failed to fetch price for {ticker}: {e}")
        return None


def fetch_price_history(
    ticker: str,
    start_date: date | None = None,
    end_date: date | None = None,
) -> pd.DataFrame:
    """Fetch historical adjusted close prices. Returns DataFrame with columns: Date, AdjClose."""
    start = start_date or default_start_date()
    end = end_date or default_end_date()
    cache_key = f"hist:{ticker}:{start}:{end}"
    cached = price_cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        t = yf.Ticker(ticker)
        hist = t.history(start=str(start), end=str(end), auto_adjust=False)
        if hist.empty:
            logger.warning(f"No history returned for {ticker}")
            return pd.DataFrame(columns=["Date", "AdjClose"])

        df = hist.reset_index()[["Date", "Adj Close"]].copy()
        df.columns = ["Date", "AdjClose"]
        df["Date"] = pd.to_datetime(df["Date"]).dt.date
        df = df.dropna(subset=["AdjClose"])
        df = df.sort_values("Date").reset_index(drop=True)
        price_cache.set(cache_key, df)
        return df
    except Exception as e:
        logger.warning(f"Failed to fetch history for {ticker}: {e}")
        return pd.DataFrame(columns=["Date", "AdjClose"])


def fetch_benchmark_history(
    start_date: date | None = None,
    end_date: date | None = None,
) -> pd.DataFrame:
    """Fetch SPY benchmark history."""
    return fetch_price_history("SPY", start_date, end_date)


def fetch_multiple_histories(
    tickers: list[str],
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict[str, pd.DataFrame]:
    """Fetch price history for multiple tickers."""
    result = {}
    for ticker in tickers:
        df = fetch_price_history(ticker, start_date, end_date)
        if not df.empty:
            result[ticker] = df
    return result


def classify_listing_market(ticker: str, metadata: dict | None = None) -> dict[str, str | None]:
    """Infer a human-readable listing market from ticker suffix and cached metadata."""
    normalized = ticker.upper()
    exchange = (metadata or {}).get("exchange")
    currency = (metadata or {}).get("currency")

    if normalized.endswith(CANADIAN_SUFFIXES) or exchange in CANADIAN_EXCHANGES or currency == "CAD":
        return {"market": "Canada", "exchange": exchange or "TSX/TSXV", "currency": currency or "CAD"}

    if exchange in US_EXCHANGES or currency == "USD" or "." not in normalized:
        return {"market": "United States", "exchange": exchange or "NASDAQ/NYSE", "currency": currency or "USD"}

    return {"market": exchange or "International", "exchange": exchange, "currency": currency}
