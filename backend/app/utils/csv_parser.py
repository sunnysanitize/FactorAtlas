import csv
import io

from app.schemas.portfolio import HoldingCreate


def parse_csv(content: str | bytes) -> tuple[list[HoldingCreate], list[str]]:
    """Parse CSV content into HoldingCreate objects. Returns (holdings, errors)."""
    if isinstance(content, bytes):
        content = content.decode("utf-8")

    holdings: list[HoldingCreate] = []
    errors: list[str] = []

    reader = csv.DictReader(io.StringIO(content))

    required = {"ticker", "shares", "average_cost"}
    if reader.fieldnames is None:
        return [], ["CSV has no headers"]

    headers = {h.strip().lower() for h in reader.fieldnames}
    missing = required - headers
    if missing:
        return [], [f"Missing required columns: {', '.join(sorted(missing))}"]

    seen_tickers: dict[str, int] = {}

    for i, row in enumerate(reader, start=2):
        try:
            normalized = {k.strip().lower(): v.strip() for k, v in row.items() if v}
            ticker = normalized.get("ticker", "").upper()
            if not ticker:
                errors.append(f"Row {i}: missing ticker")
                continue

            shares = float(normalized.get("shares", 0))
            average_cost = float(normalized.get("average_cost", 0))

            if shares <= 0:
                errors.append(f"Row {i}: shares must be positive")
                continue
            if average_cost <= 0:
                errors.append(f"Row {i}: average_cost must be positive")
                continue

            holding = HoldingCreate(
                ticker=ticker,
                shares=shares,
                average_cost=average_cost,
                company_name=normalized.get("company_name"),
                sector=normalized.get("sector"),
            )

            if ticker in seen_tickers:
                idx = seen_tickers[ticker]
                existing = holdings[idx]
                total_shares = existing.shares + holding.shares
                weighted_cost = (
                    (existing.shares * existing.average_cost)
                    + (holding.shares * holding.average_cost)
                ) / total_shares
                holdings[idx] = HoldingCreate(
                    ticker=ticker,
                    shares=total_shares,
                    average_cost=round(weighted_cost, 4),
                    company_name=holding.company_name or existing.company_name,
                    sector=holding.sector or existing.sector,
                )
            else:
                seen_tickers[ticker] = len(holdings)
                holdings.append(holding)

        except (ValueError, KeyError) as e:
            errors.append(f"Row {i}: {e}")

    return holdings, errors
