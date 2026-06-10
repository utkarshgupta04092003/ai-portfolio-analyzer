# Data Collection Architecture

Data collection is critical for deterministic analytics. The system requires Company Metadata and Historical Prices.

## 1. Strategy Pattern Implementation

We use the Strategy pattern to allow swapping data providers without changing business logic.

```python
from abc import ABC, abstractmethod

class MarketDataProvider(ABC):
    @abstractmethod
    def get_company_profile(self, symbol: str) -> dict:
        pass
        
    @abstractmethod
    def get_historical_prices(self, symbol: str, start_date: str, end_date: str) -> list[dict]:
        pass
```

## 2. Providers
- **YahooFinanceProvider**: Uses `yfinance` to fetch basic profiles and EOD pricing. Good for MVP and broad market coverage.
- **AlphaVantageProvider**: Uses the AlphaVantage API for more robust factor data and sector information.
- **MockProvider**: Used strictly for testing to prevent API rate limits.

## 3. Data Enrichment Pipeline
When a portfolio is uploaded, a background task (Celery or FastAPI BackgroundTasks) is triggered:
1. Extract unique symbols from the portfolio.
2. Check `CompanyMetadata` in DB.
3. If missing or stale (e.g., > 30 days old), call `MarketDataProvider.get_company_profile()`.
4. Update `CompanyMetadata`.
5. Check `HistoricalPrice` for the required window (e.g., 3 years back).
6. If missing, call `MarketDataProvider.get_historical_prices()`.
7. Bulk insert into `HistoricalPrice`.

## 4. Caching and Rate Limiting
- **Caching**: Historical prices are immutable for past dates. They are permanently cached in MongoDB.
- **Rate Limiting**: To respect API limits (especially AlphaVantage), the pipeline uses exponential backoff and batching.

## 5. MarketDataService
All internal systems (Analytics, Agents) call `MarketDataService`. They NEVER interact with the providers or external APIs directly. The Service abstracts the checking of DB vs Provider.
