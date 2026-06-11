import sys
import os
import asyncio
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from app.agent.graph import agent_executor
from langchain_core.messages import HumanMessage
from app.db.client import prisma

async def test_agent():
    load_dotenv()
    print("Connecting to Prisma...")
    await prisma.connect()
    
    try:
        # We need a valid portfolio ID from DB for tools to work
        # Just grab the first one
        portfolio = await prisma.portfolio.find_first()
        if not portfolio:
            print("No portfolios in DB. Please run test_flow.py first to create one.")
            return
            
        portfolio_id = portfolio.id
        print(f"Testing Agent Flow against Portfolio: {portfolio_id}")
        
        initial_state = {
            "messages": [HumanMessage(content="How diversified is my portfolio? Are there any sector concentration risks?")],
            "portfolio_id": portfolio_id,
            "canvas_type": "PortfolioSummary",
            "canvas_payload": {}
        }
        
        print("\n--- Sending request to Agent ---")
        final_state = await agent_executor.ainvoke(initial_state)
        
        print("\n--- Agent Execution Complete ---")
        for i, msg in enumerate(final_state.get("messages", [])):
            print(f"Message {i} Type: {type(msg).__name__}")
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                print(f"   => TOOL CALLS: {msg.tool_calls}")
            print(f"   => Content: {msg.content}")
            
        print("\n--- Final Canvas Type ---")
        print(final_state.get("canvas_type"))
        
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(test_agent())
