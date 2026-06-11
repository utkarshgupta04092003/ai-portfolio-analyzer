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

def get_all_tools():
    return [performance_tool, risk_tool, diversification_tool, correlation_tool, simulation_tool, fundamentals_tool]
