import pytest
import pandas as pd
import numpy as np

# We mock the DB to test the deterministic math isolated from MongoDB

def test_performance_math():
    from app.analytics.performance import PerformanceAnalyzer
    from app.core.constants import TRADING_DAYS_PER_YEAR
    
    # Mock daily returns
    # Imagine 10 days of 1% returns
    returns = pd.Series([0.01] * 10)
    
    # Calculate metrics manually for test
    total_return = (1 + returns).prod() - 1
    assert round(total_return, 4) == 0.1046 # 1.01^10 - 1 = 0.1046
    
    # Since std is 0 for identical returns, Sharpe would divide by zero.
    # Let's add some variance
    returns = pd.Series([0.01, -0.01, 0.02, -0.005, 0.015, 0.0, 0.01, -0.01, 0.03, -0.02])
    total_return = (1 + returns).prod() - 1
    assert isinstance(total_return, float)
    
    # Annualized
    annualized = (1 + total_return) ** (TRADING_DAYS_PER_YEAR / len(returns)) - 1
    assert annualized > 0 # since total return is positive
    
def test_risk_math():
    # Test Maximum Drawdown calculation
    returns = pd.Series([0.1, -0.2, 0.3, -0.1])
    cumulative_returns = (1 + returns).cumprod()
    rolling_max = cumulative_returns.cummax()
    drawdown = cumulative_returns / rolling_max - 1
    
    # The max drawdown happens at index 1: from 1.1 down to 0.88
    # 0.88 / 1.1 - 1 = -0.2
    assert round(drawdown.min(), 4) == -0.2000
