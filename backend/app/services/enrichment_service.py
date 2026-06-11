import asyncio
from datetime import datetime, timedelta, timezone
from app.db.client import prisma
from app.services.market_data_service import MarketDataService

class EnrichmentService:
    def __init__(self):
        self.market_data_service = MarketDataService()

    async def enrich_portfolio(self, portfolio_id: str):
        portfolio = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not portfolio or not portfolio.holdings:
            return

        symbols = list(set([h.symbol for h in portfolio.holdings]))
        
        tasks = [self._enrich_symbol(symbol) for symbol in symbols]
        await asyncio.gather(*tasks, return_exceptions=True)
        
    async def _enrich_symbol(self, symbol: str):
        await self.market_data_service.get_company_metadata(symbol)
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * 3)
        
        provider = self.market_data_service.provider
        prices = provider.get_historical_prices(
            symbol, 
            start_date.strftime('%Y-%m-%d'), 
            end_date.strftime('%Y-%m-%d')
        )
        
        for price in prices:
            try:
                date_obj = datetime.strptime(price["date"], '%Y-%m-%d')
                date_iso = date_obj.replace(tzinfo=timezone.utc)
                
                await prisma.historicalprice.upsert(
                    where={
                        "symbol_date": {
                            "symbol": symbol,
                            "date": date_iso
                        }
                    },
                    data={
                        "create": {
                            "symbol": symbol,
                            "date": date_iso,
                            "close": price["close"],
                            "volume": price["volume"]
                        },
                        "update": {
                            "close": price["close"],
                            "volume": price["volume"]
                        }
                    }
                )
            except Exception as e:
                print(f"Error upserting price for {symbol} on {price['date']}: {e}")
