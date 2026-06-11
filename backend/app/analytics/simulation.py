import pandas as pd
import numpy as np
from app.db.client import prisma
from app.core.constants import TRADING_DAYS_PER_YEAR

class SimulationAnalyzer:
    @staticmethod
    async def run_mutation(portfolio_id: str, mutations: list):
        p_obj = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not p_obj or not p_obj.holdings:
            return {"error": "Portfolio not found"}
            
        symbols = list(set([h.symbol for h in p_obj.holdings] + [m["symbol"] for m in mutations]))
        
        prices = await prisma.historicalprice.find_many(
            where={"symbol": {"in": symbols}},
            order={"date": "asc"}
        )
        
        if not prices:
            return {"error": "Not enough data"}
            
        df = pd.DataFrame([{"date": p.date, "symbol": p.symbol, "close": p.close} for p in prices])
        df = df.pivot(index="date", columns="symbol", values="close")
        df.ffill(inplace=True)
        daily_returns = df.pct_change().dropna()
        
        total_qty = sum(h.quantity for h in p_obj.holdings)
        weights = {h.symbol: (h.weight if h.weight is not None else (h.quantity / total_qty)) for h in p_obj.holdings}
        
        for m in mutations:
            sym = m["symbol"]
            change = m["weight_change"]
            weights[sym] = weights.get(sym, 0) + change
            
        total_w = sum(weights.values())
        if total_w > 0:
            weights = {k: v / total_w for k, v in weights.items()}
            
        for k in weights.keys():
            if k not in daily_returns.columns:
                weights[k] = 0.0
                
        port_returns = daily_returns.dot(pd.Series(weights).reindex(daily_returns.columns, fill_value=0))
        
        total_return = (1 + port_returns).prod() - 1
        annualized_return = (1 + total_return) ** (TRADING_DAYS_PER_YEAR / len(port_returns)) - 1
        volatility = port_returns.std() * np.sqrt(TRADING_DAYS_PER_YEAR)
        
        return {
            "projected_return": float(annualized_return),
            "projected_risk": float(volatility)
        }
