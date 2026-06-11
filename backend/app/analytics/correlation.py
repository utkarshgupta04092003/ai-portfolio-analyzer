import pandas as pd
from app.analytics.performance import PerformanceAnalyzer
from app.db.client import prisma

class CorrelationAnalyzer:
    @staticmethod
    async def calculate_correlation_matrix(portfolio_id: str):
        p_obj = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not p_obj or not p_obj.holdings:
            return {"error": "Portfolio has no holdings"}
            
        symbols = [h.symbol for h in p_obj.holdings]
        
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
        corr_matrix = daily_returns.corr()
        
        result = {}
        for col in corr_matrix.columns:
            result[col] = corr_matrix[col].to_dict()
            
        return {"correlation_matrix": result}
