"""Curated factor and ETF constituent data for the first Phase 4 slice."""

FACTOR_LABELS: dict[str, str] = {
    "market_beta": "Market Beta",
    "growth": "Growth Tilt",
    "value": "Value Tilt",
    "momentum": "Momentum",
    "quality": "Quality",
    "rates": "Rate Sensitivity",
    "ai_capex": "AI Capex",
    "semiconductor_cycle": "Semiconductor Cycle",
}

HOLDING_FACTOR_SCORES: dict[str, dict[str, float]] = {
    "AAPL": {"market_beta": 0.75, "growth": 0.7, "quality": 0.8, "momentum": 0.65},
    "MSFT": {"market_beta": 0.8, "growth": 0.8, "quality": 0.9, "ai_capex": 0.8},
    "NVDA": {"market_beta": 0.95, "growth": 1.0, "momentum": 0.95, "ai_capex": 1.0, "semiconductor_cycle": 1.0},
    "AMD": {"market_beta": 0.9, "growth": 0.85, "momentum": 0.75, "semiconductor_cycle": 0.9},
    "AVGO": {"market_beta": 0.82, "growth": 0.68, "quality": 0.72, "ai_capex": 0.7, "semiconductor_cycle": 0.8},
    "GOOGL": {"market_beta": 0.82, "growth": 0.84, "quality": 0.78, "ai_capex": 0.68},
    "GOOG": {"market_beta": 0.82, "growth": 0.84, "quality": 0.78, "ai_capex": 0.68},
    "AMZN": {"market_beta": 0.88, "growth": 0.9, "quality": 0.55, "rates": 0.45},
    "META": {"market_beta": 0.9, "growth": 0.85, "momentum": 0.82, "ai_capex": 0.62},
    "TSLA": {"market_beta": 1.0, "growth": 0.96, "momentum": 0.74, "rates": 0.62},
    "PLTR": {"market_beta": 0.92, "growth": 0.88, "momentum": 0.8, "ai_capex": 0.7},
    "SNOW": {"market_beta": 0.9, "growth": 0.86, "rates": 0.58},
    "SHOP": {"market_beta": 0.87, "growth": 0.88, "rates": 0.52},
    "JPM": {"market_beta": 0.7, "value": 0.7, "quality": 0.65, "rates": -0.45},
    "BAC": {"market_beta": 0.72, "value": 0.75, "rates": -0.4},
    "V": {"market_beta": 0.68, "quality": 0.72, "growth": 0.35},
    "MA": {"market_beta": 0.7, "quality": 0.74, "growth": 0.38},
    "BRK.B": {"market_beta": 0.62, "value": 0.68, "quality": 0.76},
    "LLY": {"market_beta": 0.55, "growth": 0.65, "quality": 0.8},
    "XOM": {"market_beta": 0.72, "value": 0.52, "quality": 0.58},
    "CVX": {"market_beta": 0.7, "value": 0.5, "quality": 0.6},
    "QQQ": {"market_beta": 0.9, "growth": 0.92, "momentum": 0.75, "ai_capex": 0.7},
    "SPY": {"market_beta": 1.0},
    "VOO": {"market_beta": 1.0},
    "VTI": {"market_beta": 0.95, "growth": 0.55, "value": 0.45},
    "IWM": {"market_beta": 0.85, "value": 0.55, "size": 1.0},
}

SECTOR_FACTOR_BIASES: dict[str, dict[str, float]] = {
    "Technology": {"growth": 0.75, "momentum": 0.5, "rates": 0.35},
    "Communication Services": {"growth": 0.55, "momentum": 0.35},
    "Financials": {"value": 0.65, "rates": -0.35},
    "Healthcare": {"quality": 0.5, "growth": 0.35},
    "Consumer Discretionary": {"growth": 0.45, "rates": 0.25},
    "Consumer Staples": {"quality": 0.42, "value": 0.25},
    "Energy": {"value": 0.45},
    "Industrials": {"quality": 0.28, "market_beta": 0.12},
    "Utilities": {"rates": -0.5, "quality": 0.2},
    "Real Estate": {"rates": -0.6, "value": 0.25},
    "Materials": {"value": 0.2, "market_beta": 0.1},
}

THEME_FACTOR_BIASES: dict[str, dict[str, float]] = {
    "AI Infrastructure": {"ai_capex": 0.95, "growth": 0.45},
    "Semiconductors": {"semiconductor_cycle": 1.0, "growth": 0.3},
    "Cloud": {"growth": 0.35, "rates": 0.2},
    "Cybersecurity": {"growth": 0.22, "quality": 0.18},
    "Fintech": {"growth": 0.15, "rates": -0.15},
}

ETF_CONSTITUENTS: dict[str, list[dict[str, object]]] = {
    "QQQ": [
        {"ticker": "MSFT", "weight": 0.086, "company_name": "Microsoft", "sector": "Technology", "themes": ["Big Tech", "Cloud", "AI Infrastructure"]},
        {"ticker": "AAPL", "weight": 0.082, "company_name": "Apple", "sector": "Technology", "themes": ["Big Tech", "Consumer Electronics"]},
        {"ticker": "NVDA", "weight": 0.078, "company_name": "NVIDIA", "sector": "Technology", "themes": ["AI Infrastructure", "Semiconductors"]},
        {"ticker": "AMZN", "weight": 0.055, "company_name": "Amazon", "sector": "Consumer Discretionary", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "META", "weight": 0.04, "company_name": "Meta", "sector": "Technology", "themes": ["Big Tech", "AI Infrastructure"]},
        {"ticker": "AVGO", "weight": 0.038, "company_name": "Broadcom", "sector": "Technology", "themes": ["Semiconductors", "AI Infrastructure"]},
        {"ticker": "GOOGL", "weight": 0.029, "company_name": "Alphabet", "sector": "Technology", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "COST", "weight": 0.025, "company_name": "Costco", "sector": "Consumer Staples", "themes": ["Retail"]},
    ],
    "SPY": [
        {"ticker": "AAPL", "weight": 0.07, "company_name": "Apple", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "MSFT", "weight": 0.068, "company_name": "Microsoft", "sector": "Technology", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "NVDA", "weight": 0.06, "company_name": "NVIDIA", "sector": "Technology", "themes": ["AI Infrastructure", "Semiconductors"]},
        {"ticker": "AMZN", "weight": 0.038, "company_name": "Amazon", "sector": "Consumer Discretionary", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "META", "weight": 0.025, "company_name": "Meta", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "BRK.B", "weight": 0.018, "company_name": "Berkshire Hathaway", "sector": "Financials", "themes": ["Insurance"]},
        {"ticker": "GOOGL", "weight": 0.017, "company_name": "Alphabet", "sector": "Technology", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "LLY", "weight": 0.015, "company_name": "Eli Lilly", "sector": "Healthcare", "themes": ["Pharma", "GLP-1"]},
    ],
    "VOO": [
        {"ticker": "AAPL", "weight": 0.07, "company_name": "Apple", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "MSFT", "weight": 0.068, "company_name": "Microsoft", "sector": "Technology", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "NVDA", "weight": 0.06, "company_name": "NVIDIA", "sector": "Technology", "themes": ["AI Infrastructure", "Semiconductors"]},
        {"ticker": "AMZN", "weight": 0.038, "company_name": "Amazon", "sector": "Consumer Discretionary", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "META", "weight": 0.025, "company_name": "Meta", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "BRK.B", "weight": 0.018, "company_name": "Berkshire Hathaway", "sector": "Financials", "themes": ["Insurance"]},
    ],
    "VTI": [
        {"ticker": "AAPL", "weight": 0.059, "company_name": "Apple", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "MSFT", "weight": 0.056, "company_name": "Microsoft", "sector": "Technology", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "NVDA", "weight": 0.05, "company_name": "NVIDIA", "sector": "Technology", "themes": ["AI Infrastructure", "Semiconductors"]},
        {"ticker": "AMZN", "weight": 0.031, "company_name": "Amazon", "sector": "Consumer Discretionary", "themes": ["Big Tech", "Cloud"]},
        {"ticker": "META", "weight": 0.021, "company_name": "Meta", "sector": "Technology", "themes": ["Big Tech"]},
        {"ticker": "BRK.B", "weight": 0.016, "company_name": "Berkshire Hathaway", "sector": "Financials", "themes": ["Insurance"]},
        {"ticker": "AVGO", "weight": 0.014, "company_name": "Broadcom", "sector": "Technology", "themes": ["Semiconductors"]},
        {"ticker": "JPM", "weight": 0.011, "company_name": "JPMorgan", "sector": "Financials", "themes": ["Banking"]},
    ],
}
