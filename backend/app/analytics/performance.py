import pandas as pd
import numpy as np
from app.db.client import prisma
from app.core.constants import TRADING_DAYS_PER_YEAR, RISK_FREE_RATE_DEFAULT

class PerformanceAnalyzer:
    @staticmethod
    async def get_portfolio_returns(portfolio_id: str) -> pd.DataFrame:
        portfolio = await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )
        if not portfolio or not portfolio.holdings:
            return pd.DataFrame()

        holdings = portfolio.holdings
        total_qty = sum(h.quantity for h in holdings)
        
        weights = {}
        for h in holdings:
            if h.weight is not None:
                weights[h.symbol] = h.weight
            else:
                weights[h.symbol] = h.quantity / total_qty if total_qty > 0 else 0

        symbols = list(weights.keys())
        
        prices = await prisma.historicalprice.find_many(
            where={"symbol": {"in": symbols}},
            order={"date": "asc"}
        )
        
        if not prices:
            return pd.DataFrame()
            
        df = pd.DataFrame([{"date": p.date, "symbol": p.symbol, "close": p.close} for p in prices])
        df = df.pivot(index="date", columns="symbol", values="close")
        df.ffill(inplace=True)
        
        daily_returns = df.pct_change().dropna()
        
        # Align weights with available data to prevent "matrices are not aligned" error
        series_weights = pd.Series(weights).reindex(daily_returns.columns).fillna(0)
        if series_weights.sum() > 0:
            series_weights = series_weights / series_weights.sum()
            
        port_returns = daily_returns.dot(series_weights)
        return port_returns

    @staticmethod
    async def calculate_metrics(portfolio_id: str):
        port_returns = await PerformanceAnalyzer.get_portfolio_returns(portfolio_id)
        if port_returns.empty:
            return {"error": "Not enough data to calculate performance"}
            
        total_return = (1 + port_returns).prod() - 1
        annualized_return = (1 + total_return) ** (TRADING_DAYS_PER_YEAR / len(port_returns)) - 1
        
        excess_returns = port_returns - (RISK_FREE_RATE_DEFAULT / TRADING_DAYS_PER_YEAR)
        std_dev = excess_returns.std()
        sharpe_ratio = np.sqrt(TRADING_DAYS_PER_YEAR) * excess_returns.mean() / std_dev if std_dev > 0 else 0.0
        
        # Benchmark calculations using Nifty 50 (^NSEI)
        benchmark_symbol = "^NSEI"
        dates_index = port_returns.index
        
        # Ensure benchmark data is in DB, otherwise fetch it on the fly
        bench_count = await prisma.historicalprice.count(where={"symbol": benchmark_symbol})
        if bench_count == 0:
            try:
                from app.services.enrichment_service import EnrichmentService
                enrichment_svc = EnrichmentService()
                await enrichment_svc._enrich_symbol(benchmark_symbol)
            except Exception as e:
                print(f"Failed to fetch benchmark data on the fly: {e}")
                
        prices = await prisma.historicalprice.find_many(
            where={
                "symbol": benchmark_symbol,
                "date": {
                    "gte": dates_index.min().to_pydatetime(),
                    "lte": dates_index.max().to_pydatetime()
                }
            },
            order={"date": "asc"}
        )
        
        benchmark_total_return = 0.0
        benchmark_annualized_return = 0.0
        alpha = 0.0
        beta = 1.0
        
        if prices:
            bench_df = pd.DataFrame([{"date": p.date, "close": p.close} for p in prices])
            bench_df.set_index("date", inplace=True)
            bench_df = bench_df.reindex(dates_index).ffill().bfill()
            
            bench_returns = bench_df["close"].pct_change().dropna()
            
            # Align indices
            aligned_df = pd.concat([port_returns, bench_returns], axis=1).dropna()
            aligned_df.columns = ["port", "bench"]
            
            if not aligned_df.empty:
                benchmark_total_return = (1 + aligned_df["bench"]).prod() - 1
                benchmark_annualized_return = (1 + benchmark_total_return) ** (TRADING_DAYS_PER_YEAR / len(aligned_df)) - 1
                
                # Beta = Cov(Port, Bench) / Var(Bench)
                covariance = aligned_df["port"].cov(aligned_df["bench"])
                variance = aligned_df["bench"].var()
                if variance > 0:
                    beta = covariance / variance
                else:
                    beta = 1.0
                    
                # Jensen's Alpha = Port Excess Return - Beta * Bench Excess Return
                alpha = (annualized_return - RISK_FREE_RATE_DEFAULT) - beta * (benchmark_annualized_return - RISK_FREE_RATE_DEFAULT)
                
        return {
            "total_return": float(total_return),
            "annualized_return": float(annualized_return),
            "sharpe_ratio": float(sharpe_ratio),
            "benchmark_total_return": float(benchmark_total_return),
            "benchmark_annualized_return": float(benchmark_annualized_return),
            "alpha": float(alpha),
            "beta": float(beta)
        }
