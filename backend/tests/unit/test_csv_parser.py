"""Unit tests for CSV parser."""

from app.utils.csv_parser import parse_csv


def test_valid_csv():
    csv_content = "ticker,shares,average_cost\nAAPL,10,150.00\nMSFT,5,300.00\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 2
    assert len(errors) == 0
    assert holdings[0].ticker == "AAPL"
    assert holdings[1].ticker == "MSFT"


def test_duplicate_merge():
    csv_content = "ticker,shares,average_cost\nAAPL,10,150.00\nAAPL,5,180.00\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 1
    assert holdings[0].shares == 15
    # Weighted average: (10*150 + 5*180) / 15 = 2400/15 = 160
    assert abs(holdings[0].average_cost - 160.0) < 0.01


def test_missing_columns():
    csv_content = "ticker,shares\nAAPL,10\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 0
    assert len(errors) > 0
    assert "average_cost" in errors[0].lower()


def test_invalid_shares():
    csv_content = "ticker,shares,average_cost\nAAPL,-5,150.00\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 0
    assert len(errors) > 0


def test_ticker_normalization():
    csv_content = "ticker,shares,average_cost\naapl,10,150.00\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 1
    assert holdings[0].ticker == "AAPL"


def test_empty_csv():
    csv_content = ""
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 0


def test_bytes_input():
    csv_content = b"ticker,shares,average_cost\nAAPL,10,150.00\n"
    holdings, errors = parse_csv(csv_content)
    assert len(holdings) == 1
