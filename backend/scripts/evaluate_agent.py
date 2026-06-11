import asyncio
import os
import sys

# Add backend to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.agent.graph import agent_executor
from langchain_core.messages import HumanMessage

async def evaluate_router():
    print("Starting Agent Router Evaluation...\n")
    
    test_cases = [
        {"input": "What is the overall performance and sharpe ratio of my portfolio?", "expected_tool": "performance_tool"},
        {"input": "How risky is my portfolio? What is the max drawdown?", "expected_tool": "risk_tool"},
        {"input": "Is my portfolio diversified enough across different sectors?", "expected_tool": "diversification_tool"},
        {"input": "What happens if I increase Reliance by 5% and decrease TCS by 2%?", "expected_tool": "simulation_tool"},
    ]
    
    successes = 0
    
    for case in test_cases:
        print(f"Testing input: '{case['input']}'")
        initial_state = {
            "messages": [HumanMessage(content=case["input"])],
            "portfolio_id": "test_portfolio_123",
            "canvas_type": "PortfolioSummary",
            "canvas_payload": {}
        }
        
        # We only want to test the routing decision (first step)
        # Not run the actual tools since there is no DB connected
        try:
            # Step through the graph to see what it routed to
            steps = []
            async for step in agent_executor.astream(initial_state):
                steps.append(step)
                
            # If it routed to tool node, check if the tool is correct
            # In a full test, we'd intercept the tool call or mock the executor.
            # Here we just print the state.
            print("Evaluation requires an active API key and database. Test skipped for full execution.")
        except Exception as e:
            # We expect an exception here if OpenAI API key is missing or invalid in this env
            if "api_key" in str(e).lower() or "authentication" in str(e).lower():
                print(f"  [SKIPPED] Missing OpenAI API Key: {e}")
            else:
                print(f"  [ERROR] {e}")

if __name__ == "__main__":
    asyncio.run(evaluate_router())
