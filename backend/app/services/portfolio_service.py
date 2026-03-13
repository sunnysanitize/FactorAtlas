"""Portfolio management service."""

import logging
import uuid

from sqlalchemy.orm import Session

from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.models.user import User
from app.schemas.portfolio import HoldingCreate, PortfolioCreate
from app.services.market_data_service import fetch_ticker_metadata
from app.services.theme_data import TICKER_SECTORS, TICKER_THEMES

logger = logging.getLogger(__name__)

DEFAULT_USER_EMAIL = "demo@factoratlas.dev"


def get_or_create_user(db: Session, email: str | None = None) -> User:
    """Get or create a user by email."""
    email = email or DEFAULT_USER_EMAIL
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def create_portfolio(db: Session, data: PortfolioCreate) -> Portfolio:
    """Create a new portfolio."""
    user = get_or_create_user(db, data.user_email)
    portfolio = Portfolio(user_id=user.id, name=data.name)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def create_portfolio_for_user(db: Session, user: User, data: PortfolioCreate) -> Portfolio:
    portfolio = Portfolio(user_id=user.id, name=data.name)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def get_portfolios(db: Session) -> list[Portfolio]:
    """List all portfolios."""
    return db.query(Portfolio).order_by(Portfolio.created_at.desc()).all()


def get_portfolios_for_user(db: Session, user: User) -> list[Portfolio]:
    return (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user.id)
        .order_by(Portfolio.created_at.desc())
        .all()
    )


def get_portfolio(db: Session, portfolio_id: uuid.UUID) -> Portfolio | None:
    """Get a portfolio by ID."""
    return db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()


def get_portfolio_for_user(db: Session, portfolio_id: uuid.UUID, user: User) -> Portfolio | None:
    return (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user.id)
        .first()
    )


def enrich_holding(holding: HoldingCreate) -> HoldingCreate:
    """Enrich a holding with metadata from curated maps and yfinance."""
    ticker = holding.ticker.upper()

    sector = holding.sector or TICKER_SECTORS.get(ticker)
    theme = holding.primary_theme
    if not theme:
        themes = TICKER_THEMES.get(ticker, [])
        theme = themes[0] if themes else None

    company_name = holding.company_name
    if not company_name or not sector:
        try:
            meta = fetch_ticker_metadata(ticker)
            if not company_name:
                company_name = meta.get("company_name", ticker)
            if not sector:
                sector = meta.get("sector")
        except Exception:
            if not company_name:
                company_name = ticker

    return HoldingCreate(
        ticker=ticker,
        shares=holding.shares,
        average_cost=holding.average_cost,
        company_name=company_name,
        sector=sector,
        primary_theme=theme,
    )


def add_holdings(
    db: Session,
    portfolio_id: uuid.UUID,
    holdings_data: list[HoldingCreate],
) -> tuple[int, int]:
    """Add holdings to a portfolio, merging duplicates. Returns (added, merged)."""
    existing = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
    existing_map = {h.ticker: h for h in existing}

    added = 0
    merged = 0

    for h in holdings_data:
        enriched = enrich_holding(h)
        ticker = enriched.ticker

        if ticker in existing_map:
            # merge: combine shares, weighted average cost
            existing_h = existing_map[ticker]
            total_shares = existing_h.shares + enriched.shares
            weighted_cost = (
                (existing_h.shares * existing_h.average_cost)
                + (enriched.shares * enriched.average_cost)
            ) / total_shares
            existing_h.shares = total_shares
            existing_h.average_cost = round(weighted_cost, 4)
            if enriched.company_name and not existing_h.company_name:
                existing_h.company_name = enriched.company_name
            if enriched.sector and not existing_h.sector:
                existing_h.sector = enriched.sector
            if enriched.primary_theme and not existing_h.primary_theme:
                existing_h.primary_theme = enriched.primary_theme
            merged += 1
        else:
            new_holding = Holding(
                portfolio_id=portfolio_id,
                ticker=ticker,
                company_name=enriched.company_name,
                shares=enriched.shares,
                average_cost=enriched.average_cost,
                sector=enriched.sector,
                primary_theme=enriched.primary_theme,
            )
            db.add(new_holding)
            existing_map[ticker] = new_holding
            added += 1

    db.commit()
    return added, merged


def update_holding(
    db: Session,
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    data: HoldingCreate,
) -> Holding | None:
    holding = (
        db.query(Holding)
        .filter(Holding.portfolio_id == portfolio_id, Holding.id == holding_id)
        .first()
    )
    if not holding:
        return None

    enriched = enrich_holding(data)
    holding.ticker = enriched.ticker
    holding.shares = enriched.shares
    holding.average_cost = enriched.average_cost
    holding.company_name = enriched.company_name
    holding.sector = enriched.sector
    holding.primary_theme = enriched.primary_theme
    db.commit()
    db.refresh(holding)
    return holding


def delete_holding(db: Session, portfolio_id: uuid.UUID, holding_id: uuid.UUID) -> bool:
    holding = (
        db.query(Holding)
        .filter(Holding.portfolio_id == portfolio_id, Holding.id == holding_id)
        .first()
    )
    if not holding:
        return False

    db.delete(holding)
    db.commit()
    return True
