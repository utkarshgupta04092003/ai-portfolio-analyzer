from typing import Dict, Any, List
from app.data_providers.base import MarketDataProvider
import yfinance as yf

class YahooFinanceProvider(MarketDataProvider):
    def _normalize_symbol(self, symbol: str) -> str:
        # Append .NS for Indian Stock Market if not present
        if not symbol.endswith('.NS') and not symbol.endswith('.BO'):
            return f"{symbol}.NS"
        return symbol

    def get_historical_prices(self, symbol: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        norm_symbol = self._normalize_symbol(symbol)
        ticker = yf.Ticker(norm_symbol)
        df = ticker.history(start=start_date, end=end_date)
        
        prices = []
        for index, row in df.iterrows():
            prices.append({
                "date": index.strftime('%Y-%m-%d'),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        return prices

    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        norm_symbol = self._normalize_symbol(symbol)
        ticker = yf.Ticker(norm_symbol)
        info = ticker.info
        
        return {
            "name": info.get("shortName", symbol),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "marketCap": info.get("marketCap", 0)
        }
