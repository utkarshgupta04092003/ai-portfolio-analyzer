import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.data_providers.yahoo import YahooFinanceProvider
from datetime import datetime, timedelta

def test_yahoo_finance():
    provider = YahooFinanceProvider()
    symbol = "RELIANCE"  # Using an Indian stock as an example
    
    print(f"--- Testing Company Profile & Fundamentals for {symbol} ---")
    try:
        profile = provider.get_company_profile(symbol)
        print("✅ Profile fetched successfully!")
        for key, value in profile.items():
            print(f"  {key}: {value}")
    except Exception as e:
        print(f"❌ Error fetching profile: {e}")
        
    print(f"\n--- Testing Historical Prices for {symbol} (Last 7 Days) ---")
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        prices = provider.get_historical_prices(
            symbol, 
            start_date.strftime('%Y-%m-%d'), 
            end_date.strftime('%Y-%m-%d')
        )
        print(f"✅ Historical prices fetched successfully! Retrieved {len(prices)} days of data.")
        
        # Print just the first few for brevity
        for price in prices:
            print(f"  Date: {price['date']} | Close: {price['close']:.2f} | Volume: {price['volume']}")
            
    except Exception as e:
        print(f"❌ Error fetching prices: {e}")

if __name__ == "__main__":
    test_yahoo_finance()
