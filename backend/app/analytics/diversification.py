import pandas as pd
from app.db.client import prisma

class DiversificationAnalyzer:
    @staticmethod
    async def analyze_sectors(portfolio_id: str):
        portfolio = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not portfolio or not portfolio.holdings:
            return {"error": "Portfolio has no holdings"}

        symbols = [h.symbol for h in portfolio.holdings]
        
        metadata = await prisma.companymetadata.find_many(
            where={"symbol": {"in": symbols}}
        )
        
        meta_dict = {m.symbol: m for m in metadata}
        
        sector_exposure = {}
        total_weight = 0
        
        for h in portfolio.holdings:
            weight = h.weight or h.quantity
            total_weight += weight
            
            m = meta_dict.get(h.symbol)
            sector = m.sector if m and m.sector else "Unknown"
            
            sector_exposure[sector] = sector_exposure.get(sector, 0) + weight
            
        for k in sector_exposure:
            sector_exposure[k] = sector_exposure[k] / total_weight if total_weight > 0 else 0
            
        concentration_score = sum(w**2 for w in sector_exposure.values())
        
        return {
            "concentration_score": float(concentration_score),
            "sectors": [{"name": k, "weight": float(v)} for k, v in sector_exposure.items()]
        }
