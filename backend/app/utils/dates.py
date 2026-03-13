from datetime import date, timedelta


def default_start_date(years: int = 2) -> date:
    return date.today() - timedelta(days=years * 365)


def default_end_date() -> date:
    return date.today()
