import asyncio
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.client import prisma
from app.services.portfolio_service import PortfolioService
from app.services.enrichment_service import EnrichmentService
from app.agent.graph import agent_executor
from langchain_core.messages import HumanMessage
from fastapi import UploadFile
from io import BytesIO

async def test_flow():
    print("Connecting to DB...")
    await prisma.connect()
    
    try:
        from app.db.repositories import UserRepository
        user = await UserRepository.get_user_by_email("test_flow@example.com")
        if not user:
            user = await UserRepository.create_user("test_flow@example.com")
            
        csv_content = b"symbol,quantity,weight,costbasis\nRELIANCE,10,0.5,2000\nTCS,5,0.5,3000\n"
        file = UploadFile(filename="test.csv", file=BytesIO(csv_content))
        
        print("1. Uploading Portfolio...")
        upload_res = await PortfolioService.process_upload(user.id, file, "Test Flow Portfolio")
        portfolio_id = upload_res["portfolio_id"]
        print(f"   Success: {portfolio_id}")
        
        print("2. Running Enrichment Service...")
        enrichment_svc = EnrichmentService()
        await enrichment_svc.enrich_portfolio(portfolio_id)
        print("   Enrichment finished.")
        
        print("3. Checking DB for Data...")
        prices = await prisma.historicalprice.find_many(where={"symbol": {"in": ["RELIANCE.NS", "TCS.NS"]}}, take=5)
        print(f"   Found {len(prices)} historical prices (sample)")
        
        snapshots = await prisma.analyticssnapshot.find_many(where={"portfolioId": portfolio_id})
        print(f"   Found {len(snapshots)} snapshots")
        for s in snapshots:
            print(f"     - {s.metricsType}")
            
        print("4. Testing Agent Response...")
        initial_state = {
            "messages": [HumanMessage(content="What is the overall performance of my portfolio?")],
            "portfolio_id": portfolio_id,
            "canvas_type": "PortfolioSummary",
            "canvas_payload": {}
        }
        
        final_state = await agent_executor.ainvoke(initial_state)
        messages = final_state.get("messages", [])
        print(f"   Agent Answer: {messages[-1].content}")
        print(f"   Canvas: {final_state.get('canvas_type')}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(test_flow())
