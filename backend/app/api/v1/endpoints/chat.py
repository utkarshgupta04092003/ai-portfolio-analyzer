from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.agent.graph import agent_executor

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    portfolio_id: str
    message: str

class ChatResponse(BaseModel):
    answer: str
    canvas_type: str | None = "PortfolioSummary"
    canvas_payload: dict | None = None

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "portfolio_id": request.portfolio_id,
        "canvas_type": "PortfolioSummary",
        "canvas_payload": {}
    }
    
    try:
        final_state = await agent_executor.ainvoke(initial_state)
        
        messages = final_state.get("messages", [])
        if not messages:
            raise HTTPException(status_code=500, detail="No response generated.")
            
        answer = messages[-1].content
        canvas_type = final_state.get("canvas_type", "PortfolioSummary")
        canvas_payload = final_state.get("canvas_payload", {})
        
        return ChatResponse(
            answer=answer,
            canvas_type=canvas_type,
            canvas_payload=canvas_payload
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
