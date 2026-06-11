from abc import ABC, abstractmethod
from typing import Dict, Any, List

class MarketDataProvider(ABC):
    @abstractmethod
    def get_historical_prices(self, symbol: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_company_profile(self, symbol: str) -> Dict[str, Any]:
        pass
