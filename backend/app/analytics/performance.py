import pandas as pd
import numpy as np
from app.db.client import prisma
from app.core.constants import TRADING_DAYS_PER_YEAR, RISK_FREE_RATE_DEFAULT

class PerformanceAnalyzer:
    @staticmethod
    async def get_portfolio_returns(portfolio_id: str) -> pd.DataFrame:
        portfolio = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not portfolio or not portfolio.holdings:
            return pd.DataFrame()

        holdings = portfolio.holdings
        total_qty = sum(h.quantity for h in holdings)
        
        weights = {}
        for h in holdings:
            if h.weight is not None:
                weights[h.symbol] = h.weight
            else:
                weights[h.symbol] = h.quantity / total_qty if total_qty > 0 else 0

        symbols = list(weights.keys())
        
        prices = await prisma.historicalprice.find_many(
            where={"symbol": {"in": symbols}},
            order={"date": "asc"}
        )
        
        if not prices:
            return pd.DataFrame()
            
        df = pd.DataFrame([{"date": p.date, "symbol": p.symbol, "close": p.close} for p in prices])
        df = df.pivot(index="date", columns="symbol", values="close")
        df.ffill(inplace=True)
        
        daily_returns = df.pct_change().dropna()
        port_returns = daily_returns.dot(pd.Series(weights))
        return port_returns

    @staticmethod
    async def calculate_metrics(portfolio_id: str):
        port_returns = await PerformanceAnalyzer.get_portfolio_returns(portfolio_id)
        if port_returns.empty:
            return {"error": "Not enough data to calculate performance"}
            
        total_return = (1 + port_returns).prod() - 1
        annualized_return = (1 + total_return) ** (TRADING_DAYS_PER_YEAR / len(port_returns)) - 1
        
        excess_returns = port_returns - (RISK_FREE_RATE_DEFAULT / TRADING_DAYS_PER_YEAR)
        sharpe_ratio = np.sqrt(TRADING_DAYS_PER_YEAR) * excess_returns.mean() / excess_returns.std()
        
        return {
            "total_return": float(total_return),
            "annualized_return": float(annualized_return),
            "sharpe_ratio": float(sharpe_ratio)
        }
