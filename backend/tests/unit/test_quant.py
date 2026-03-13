"""Unit tests for quant engine calculations."""

import numpy as np
import pandas as pd
import pytest

from app.services.quant_service import (
    compute_annualized_volatility,
    compute_beta,
    compute_concentration_metrics,
    compute_cumulative_returns,
    compute_daily_returns,
    compute_max_drawdown,
    compute_portfolio_returns,
    compute_sharpe_ratio,
    compute_var_95,
)


@pytest.fixture
def sample_prices():
    dates = pd.date_range("2023-01-01", periods=252, freq="B")
    np.random.seed(42)
    prices = 100 * np.exp(np.cumsum(np.random.normal(0.0003, 0.01, 252)))
    return pd.Series(prices, index=dates)


@pytest.fixture
def sample_returns(sample_prices):
    return compute_daily_returns(sample_prices)


def test_daily_returns_length(sample_prices):
    returns = compute_daily_returns(sample_prices)
    assert len(returns) == len(sample_prices) - 1


def test_daily_returns_no_nan(sample_returns):
    assert not sample_returns.isna().any()


def test_annualized_volatility_positive(sample_returns):
    vol = compute_annualized_volatility(sample_returns)
    assert vol is not None
    assert vol > 0


def test_annualized_volatility_empty():
    assert compute_annualized_volatility(pd.Series(dtype=float)) is None


def test_beta_self_is_one():
    dates = pd.date_range("2023-01-01", periods=100, freq="B")
    returns = pd.Series(np.random.normal(0, 0.01, 100), index=dates)
    beta = compute_beta(returns, returns)
    assert beta is not None
    assert abs(beta - 1.0) < 0.001


def test_sharpe_ratio_computable(sample_returns):
    sharpe = compute_sharpe_ratio(sample_returns, risk_free_rate=0.05)
    assert sharpe is not None
    assert isinstance(sharpe, float)


def test_max_drawdown_negative_or_zero():
    cum = pd.Series([0.0, 0.05, 0.10, 0.03, -0.02, 0.01])
    dd = compute_max_drawdown(cum)
    assert dd is not None
    assert dd <= 0


def test_var_95_is_negative():
    dates = pd.date_range("2023-01-01", periods=100, freq="B")
    returns = pd.Series(np.random.normal(-0.001, 0.02, 100), index=dates)
    var = compute_var_95(returns)
    assert var is not None
    assert var < 0


def test_concentration_metrics():
    weights = {"AAPL": 0.4, "MSFT": 0.3, "GOOGL": 0.2, "AMZN": 0.1}
    metrics = compute_concentration_metrics(weights)
    assert metrics["top_holding_weight"] == 0.4
    assert metrics["top_3_combined_weight"] == 0.9
    assert metrics["herfindahl_index"] > 0


def test_portfolio_returns():
    dates = pd.date_range("2023-01-01", periods=10, freq="B")
    weights = {"A": 0.6, "B": 0.4}
    returns = {
        "A": pd.Series([0.01] * 10, index=dates),
        "B": pd.Series([0.02] * 10, index=dates),
    }
    port_ret = compute_portfolio_returns(weights, returns)
    assert len(port_ret) == 10
    expected = 0.01 * 0.6 + 0.02 * 0.4
    assert abs(port_ret.iloc[0] - expected) < 0.0001


def test_cumulative_returns():
    daily = pd.Series([0.01, 0.02, -0.01, 0.005])
    cum = compute_cumulative_returns(daily)
    assert len(cum) == 4
    # Manually: (1.01)(1.02)(0.99)(1.005) - 1
    expected = (1.01 * 1.02 * 0.99 * 1.005) - 1
    assert abs(cum.iloc[-1] - expected) < 0.0001
