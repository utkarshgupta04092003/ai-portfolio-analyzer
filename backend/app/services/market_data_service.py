from typing import Dict, Any
from datetime import datetime, timezone
from app.db.client import prisma
from app.data_providers.base import MarketDataProvider
from app.data_providers.yahoo import YahooFinanceProvider

class MarketDataService:
    def __init__(self, provider: MarketDataProvider = None):
        self.provider = provider or YahooFinanceProvider()

    async def get_company_metadata(self, symbol: str) -> Dict[str, Any]:
        metadata = await prisma.companymetadata.find_unique(where={"symbol": symbol})
        
        if metadata:
            return {
                "name": metadata.name,
                "sector": metadata.sector,
                "industry": metadata.industry,
                "marketCap": metadata.marketCap
            }
            
        profile = self.provider.get_company_profile(symbol)
        
        await prisma.companymetadata.upsert(
            where={"symbol": symbol},
            data={
                "create": {
                    "symbol": symbol,
                    "name": profile.get("name", symbol),
                    "sector": profile.get("sector"),
                    "industry": profile.get("industry"),
                    "marketCap": profile.get("marketCap")
                },
                "update": {
                    "name": profile.get("name", symbol),
                    "sector": profile.get("sector"),
                    "industry": profile.get("industry"),
                    "marketCap": profile.get("marketCap"),
                    "lastUpdated": datetime.now(timezone.utc)
                }
            }
        )
        
        return profile
