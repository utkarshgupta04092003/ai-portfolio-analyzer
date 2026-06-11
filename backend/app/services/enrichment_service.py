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
        print("Inside enrich portfolio", portfolio)
        if not portfolio or not portfolio.holdings:
            return

        symbols = list(set([h.symbol for h in portfolio.holdings]))
        
        results = []
        for symbol in symbols:
            res = await self._enrich_symbol(symbol)
            results.append(res)
        print("Enrichment symbol results:", results)
        
        # Once data is fetched, automatically generate snapshots!
        await self._generate_snapshots(portfolio_id)
        
    async def _generate_snapshots(self, portfolio_id: str):
        from app.analytics.performance import PerformanceAnalyzer
        from app.analytics.risk import RiskAnalyzer
        from app.analytics.diversification import DiversificationAnalyzer
        from app.analytics.fundamentals import FundamentalsAnalyzer
        import json

        # Calculate metrics
        perf_metrics = await PerformanceAnalyzer.calculate_metrics(portfolio_id)
        risk_metrics = await RiskAnalyzer.calculate_metrics(portfolio_id)
        div_metrics = await DiversificationAnalyzer.analyze_sectors(portfolio_id)
        fund_metrics = await FundamentalsAnalyzer.get_portfolio_fundamentals(portfolio_id)
        
        # Delete existing snapshots for this portfolio to avoid duplicates on re-enrichment
        await prisma.analyticssnapshot.delete_many(
            where={"portfolioId": portfolio_id}
        )
        
        snapshots_data = []
        if "error" not in perf_metrics:
            snapshots_data.append({
                "portfolioId": portfolio_id,
                "metricsType": "performance",
                "metricsData": json.dumps(perf_metrics)
            })
            
        if "error" not in risk_metrics:
            snapshots_data.append({
                "portfolioId": portfolio_id,
                "metricsType": "risk",
                "metricsData": json.dumps(risk_metrics)
            })
            
        if "error" not in div_metrics:
            snapshots_data.append({
                "portfolioId": portfolio_id,
                "metricsType": "diversification",
                "metricsData": json.dumps(div_metrics)
            })
            
        if "error" not in fund_metrics:
            snapshots_data.append({
                "portfolioId": portfolio_id,
                "metricsType": "fundamentals",
                "metricsData": json.dumps(fund_metrics)
            })
            
        if snapshots_data:
            # Single lightning-fast DB call for all snapshots
            await prisma.analyticssnapshot.create_many(data=snapshots_data)
        
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
        
        # Delete old prices to allow fast bulk insert
        await prisma.historicalprice.delete_many(where={"symbol": symbol})
        
        data_to_insert = []
        for price in prices:
            try:
                date_obj = datetime.strptime(price["date"], '%Y-%m-%d')
                date_iso = date_obj.replace(tzinfo=timezone.utc)
                data_to_insert.append({
                    "symbol": symbol,
                    "date": date_iso,
                    "close": price["close"],
                    "volume": price["volume"]
                })
            except Exception as e:
                print(f"Error parsing date for {symbol} on {price['date']}: {e}")
                
        # Lightning fast bulk insert
        await prisma.historicalprice.create_many(data=data_to_insert)
