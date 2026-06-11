from app.db.client import prisma
import asyncio

class FundamentalsAnalyzer:
    @staticmethod
    async def get_portfolio_fundamentals(portfolio_id: str):
        portfolio = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not portfolio or not portfolio.holdings:
            return {"error": "Portfolio has no holdings"}

        symbols = [h.symbol for h in portfolio.holdings]
        
        # We will fetch live fundamentals from yfinance
        from app.data_providers.yahoo import YahooFinanceProvider
        provider = YahooFinanceProvider()
        
        fundamentals = {}
        for symbol in symbols:
            # This fetches the rich company profile including PE, Beta, etc.
            profile = provider.get_company_profile(symbol)
            fundamentals[symbol] = {
                "name": profile.get("name"),
                "sector": profile.get("sector"),
                "marketCap": profile.get("marketCap"),
                "trailingPE": profile.get("trailingPE"),
                "forwardPE": profile.get("forwardPE"),
                "dividendYield": profile.get("dividendYield"),
                "beta": profile.get("beta")
            }
            
        return {
            "portfolio_fundamentals": fundamentals
        }
