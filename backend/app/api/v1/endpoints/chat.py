from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from app.agent.graph import agent_executor
from app.db.client import prisma
from prisma import Json
import hashlib

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    portfolio_id: str | None = None
    message: str

class ChatResponse(BaseModel):
    answer: str
    canvas_type: str | None = "PortfolioSummary"
    canvas_payload: dict | None = None

def to_object_id(s: str) -> str:
    if len(s) == 24 and all(c in '0123456789abcdefABCDEF' for c in s):
        return s
    return hashlib.md5(s.encode()).hexdigest()[:24]

@router.get("/sessions", response_model=list[dict])
async def get_sessions():
    from app.db.repositories import UserRepository
    user = await UserRepository.get_user_by_email("user@example.com")
    if not user:
        user = await UserRepository.create_user("user@example.com")
        
    sessions = await prisma.chatsession.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"}
    )
    return [
        {
            "id": s.id,
            "title": s.title or "New Chat",
            "createdAt": s.createdAt.isoformat()
        }
        for s in sessions
    ]

@router.get("/sessions/{session_id}/messages", response_model=list[dict])
async def get_session_messages(session_id: str):
    target_id = to_object_id(session_id)
    messages = await prisma.message.find_many(
        where={"sessionId": target_id},
        order={"createdAt": "asc"}
    )
    return [
        {
            "role": m.role,
            "content": m.content,
            "canvasType": m.canvasType,
            "canvasPayload": m.canvasPayload
        }
        for m in messages
    ]

def is_valid_object_id(s: str | None) -> bool:
    if not s:
        return False
    return len(s) == 24 and all(c in '0123456789abcdefABCDEF' for c in s)

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    target_session_id = to_object_id(request.session_id)
    
    # Ensure user exists
    from app.db.repositories import UserRepository
    user = await UserRepository.get_user_by_email("user@example.com")
    if not user:
        user = await UserRepository.create_user("user@example.com")
        
    # Resolve portfolio_id
    portfolio_id = request.portfolio_id
    
    # Clean and validate portfolio_id format
    if portfolio_id and (portfolio_id.lower() in ("none", "null", "undefined", "") or not is_valid_object_id(portfolio_id)):
        portfolio_id = None
        
    # Verify existence of the portfolio in the DB
    if portfolio_id:
        exists = await prisma.portfolio.find_unique(where={"id": portfolio_id})
        if not exists:
            portfolio_id = None
            
    # Fallback to user's latest portfolio if no active portfolio is set
    if not portfolio_id:
        portfolio = await prisma.portfolio.find_first(
            where={"userId": user.id},
            order={"createdAt": "desc"}
        )
        if not portfolio:
            raise HTTPException(status_code=400, detail="No active portfolio found. Please upload a portfolio first.")
        portfolio_id = portfolio.id

    # Ensure session exists
    session = await prisma.chatsession.find_unique(where={"id": target_session_id})
    if not session:
        # Create session
        title = request.message[:30] + "..." if len(request.message) > 30 else request.message
        session = await prisma.chatsession.create(
            data={
                "id": target_session_id,
                "userId": user.id,
                "title": title
            }
        )
        
    # Save Human Message
    await prisma.message.create(
        data={
            "session": {
                "connect": {"id": target_session_id}
            },
            "role": "user",
            "content": request.message
        }
    )
    
    # Load previous conversation history from database to feed into agent memory!
    past_db_messages = await prisma.message.find_many(
        where={"sessionId": target_session_id},
        order={"createdAt": "asc"}
    )
    
    # Build state messages list
    messages = []
    for m in past_db_messages:
        if m.role == "user":
            messages.append(HumanMessage(content=m.content))
        elif m.role == "ai" or m.role == "assistant":
            messages.append(AIMessage(content=m.content))
            
    initial_state = {
        "messages": messages,
        "portfolio_id": portfolio_id,
        "canvas_type": "PortfolioSummary",
        "canvas_payload": {}
    }
    
    try:
        final_state = await agent_executor.ainvoke(initial_state)
        
        messages_out = final_state.get("messages", [])
        if not messages_out:
            raise HTTPException(status_code=500, detail="No response generated.")
        
        answer = messages_out[-1].content
        canvas_type = final_state.get("canvas_type", "PortfolioSummary")
        canvas_payload = final_state.get("canvas_payload", {})
        
        # Save AI Message
        await prisma.message.create(
            data={
                "session": {
                    "connect": {"id": target_session_id}
                },
                "role": "ai",
                "content": answer,
                "canvasType": canvas_type,
                "canvasPayload": Json(canvas_payload) if canvas_payload is not None else None
            }
        )
        
        return ChatResponse(
            answer=answer,
            canvas_type=canvas_type,
            canvas_payload=canvas_payload
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
