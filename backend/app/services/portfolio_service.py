from fastapi import UploadFile
import pandas as pd
from io import BytesIO
from typing import Dict, Any
from app.db.repositories import PortfolioRepository, HoldingRepository

class PortfolioService:
    @staticmethod
    async def process_upload(user_id: str, file: UploadFile, name: str) -> Dict[str, Any]:
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(content))
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(BytesIO(content))
        else:
            raise ValueError("Unsupported file format. Please upload CSV or Excel.")
            
        df.columns = df.columns.str.lower().str.strip()
        
        if 'symbol' not in df.columns or 'quantity' not in df.columns:
            raise ValueError("File must contain 'symbol' and 'quantity' columns.")
            
        # Drop rows where symbol or quantity is missing/NaN to avoid database errors
        df.dropna(subset=['symbol', 'quantity'], inplace=True)
            
        portfolio = await PortfolioRepository.create_portfolio(user_id, name)
        
        holdings_data = []
        for _, row in df.iterrows():
            holdings_data.append({
                "portfolioId": portfolio.id,
                "symbol": str(row['symbol']).strip().upper(),
                "quantity": float(row['quantity']),
                "weight": float(row['weight']) if 'weight' in df.columns and not pd.isna(row['weight']) else None,
                "costBasis": float(row['costbasis']) if 'costbasis' in df.columns and not pd.isna(row['costbasis']) else None,
            })
            
        await HoldingRepository.bulk_create_holdings(holdings_data)
        
        return {
            "portfolio_id": portfolio.id,
            "message": f"Successfully processed {len(holdings_data)} holdings."
        }
