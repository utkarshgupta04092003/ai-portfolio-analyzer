import pandas as pd
import numpy as np
from app.analytics.performance import PerformanceAnalyzer
from app.core.constants import TRADING_DAYS_PER_YEAR

class RiskAnalyzer:
    @staticmethod
    async def calculate_metrics(portfolio_id: str):
        port_returns = await PerformanceAnalyzer.get_portfolio_returns(portfolio_id)
        if port_returns.empty:
            return {"error": "Not enough data to calculate risk"}

        volatility = port_returns.std() * np.sqrt(TRADING_DAYS_PER_YEAR)
        
        cumulative_returns = (1 + port_returns).cumprod()
        rolling_max = cumulative_returns.cummax()
        drawdown = cumulative_returns / rolling_max - 1
        max_drawdown = drawdown.min()
        
        var_95 = np.percentile(port_returns, 5)
        cvar_95 = port_returns[port_returns <= var_95].mean()
        
        return {
            "volatility": float(volatility),
            "max_drawdown": float(max_drawdown),
            "var_95": float(var_95),
            "cvar_95": float(cvar_95)
        }
