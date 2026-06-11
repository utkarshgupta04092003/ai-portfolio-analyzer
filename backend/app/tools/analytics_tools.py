from langchain_core.tools import tool
from pydantic import BaseModel, Field
import json
import asyncio
from app.analytics.performance import PerformanceAnalyzer
from app.analytics.risk import RiskAnalyzer
from app.analytics.diversification import DiversificationAnalyzer
from app.analytics.correlation import CorrelationAnalyzer
from app.analytics.simulation import SimulationAnalyzer
from app.analytics.fundamentals import FundamentalsAnalyzer

class PortfolioInput(BaseModel):
    portfolio_id: str = Field(..., description="The ID of the portfolio to analyze.")

@tool("performance_tool", args_schema=PortfolioInput, return_direct=False)
async def performance_tool(portfolio_id: str) -> str:
    """Calculates deterministic performance metrics like total return, annualized return, and Sharpe ratio."""
    result = await PerformanceAnalyzer.calculate_metrics(portfolio_id)
    return json.dumps(result)

@tool("risk_tool", args_schema=PortfolioInput, return_direct=False)
async def risk_tool(portfolio_id: str) -> str:
    """Calculates deterministic risk metrics like volatility, maximum drawdown, and VaR."""
    result = await RiskAnalyzer.calculate_metrics(portfolio_id)
    return json.dumps(result)

@tool("diversification_tool", args_schema=PortfolioInput, return_direct=False)
async def diversification_tool(portfolio_id: str) -> str:
    """Analyzes sector exposure and portfolio concentration."""
    result = await DiversificationAnalyzer.analyze_sectors(portfolio_id)
    return json.dumps(result)

@tool("correlation_tool", args_schema=PortfolioInput, return_direct=False)
async def correlation_tool(portfolio_id: str) -> str:
    """Calculates the correlation matrix of portfolio holdings."""
    result = await CorrelationAnalyzer.calculate_correlation_matrix(portfolio_id)
    return json.dumps(result)

class SimulationInput(BaseModel):
    portfolio_id: str = Field(..., description="The ID of the portfolio to simulate.")
    mutations: list[dict] = Field(..., description="List of dicts with 'symbol' and 'weight_change'")

@tool("simulation_tool", args_schema=SimulationInput, return_direct=False)
async def simulation_tool(portfolio_id: str, mutations: list[dict]) -> str:
    """Runs a what-if simulation to reweigh the portfolio."""
    result = await SimulationAnalyzer.run_mutation(portfolio_id, mutations)
    return json.dumps(result)

@tool("fundamentals_tool", args_schema=PortfolioInput, return_direct=False)
async def fundamentals_tool(portfolio_id: str) -> str:
    """Fetches fundamental data for the companies in the portfolio, including company names, sectors, and P/E ratios."""
    result = await FundamentalsAnalyzer.get_portfolio_fundamentals(portfolio_id)
    return json.dumps(result)

class CalculatorInput(BaseModel):
    expression: str = Field(..., description="The mathematical expression to evaluate, e.g., '100 * (1 + 0.15)**5' or '3400 + 4500'.")

@tool("calculator_tool", args_schema=CalculatorInput, return_direct=False)
async def calculator_tool(expression: str) -> str:
    """Evaluates basic mathematical/arithmetic expressions. ALWAYS use this tool whenever you need to perform any arithmetic calculations."""
    try:
        import re
        # Allow only safe characters for arithmetic evaluation
        sanitized = re.sub(r'[^0-9\+\-\*\/\%\(\)\.\s]', '', expression)
        # Safely evaluate with no builtins allowed
        res = eval(sanitized, {"__builtins__": None}, {})
        return json.dumps({"expression": expression, "result": float(res)})
    except Exception as e:
        return json.dumps({"error": f"Failed to evaluate expression: {str(e)}"})

class HistoricalInput(BaseModel):
    portfolio_id: str = Field(..., description="The ID of the portfolio to fetch historical data for.")
    start_date: str | None = Field(None, description="Start date in YYYY-MM-DD format (optional, defaults to 1 year ago).")
    end_date: str | None = Field(None, description="End date in YYYY-MM-DD format (optional, defaults to today).")

@tool("historical_tool", args_schema=HistoricalInput, return_direct=False)
async def historical_tool(portfolio_id: str, start_date: str | None = None, end_date: str | None = None) -> str:
    """Fetches historical close prices for all holdings in the portfolio from start_date to end_date. Both are optional and default to 1 year ago and today, respectively."""
    from datetime import datetime, timedelta
    from app.db.client import prisma

    try:
        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        else:
            end_dt = datetime.now()
            
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        else:
            start_dt = end_dt - timedelta(days=365)
    except ValueError:
        return json.dumps({"error": "Dates must be in YYYY-MM-DD format"})

    # Validate portfolio_id as valid 24-character hex MongoDB ObjectId
    if not portfolio_id or len(portfolio_id) != 24 or not all(c in '0123456789abcdefABCDEF' for c in portfolio_id):
        return json.dumps({"error": f"Invalid portfolio ID format: {portfolio_id}"})

    portfolio = await prisma.portfolio.find_unique(
        where={"id": portfolio_id},
        include={"holdings": True}
    )
    if not portfolio or not portfolio.holdings:
        return json.dumps({"error": "Portfolio has no holdings or does not exist"})
        
    symbols = [h.symbol for h in portfolio.holdings]
    if not symbols:
        return json.dumps({"historical_data": []})

    prices = await prisma.historicalprice.find_many(
        where={
            "symbol": {"in": symbols},
            "date": {
                "gte": start_dt,
                "lte": end_dt
            }
        },
        order={"date": "asc"}
    )

    date_map = {}
    for p in prices:
        dt_str = p.date.strftime("%Y-%m-%d")
        if dt_str not in date_map:
            date_map[dt_str] = {"date": dt_str}
        date_map[dt_str][p.symbol] = p.close

    return json.dumps({"historical_data": list(date_map.values())})

def get_all_tools():
    return [performance_tool, risk_tool, diversification_tool, correlation_tool, simulation_tool, fundamentals_tool, calculator_tool, historical_tool]
