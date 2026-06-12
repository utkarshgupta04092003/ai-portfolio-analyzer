from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.services.portfolio_service import PortfolioService
from app.db.repositories import PortfolioRepository

router = APIRouter()

@router.post("/upload")
async def upload_portfolio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str = Form(...)
):
    from app.db.repositories import UserRepository
    from app.services.enrichment_service import EnrichmentService
    
    user = await UserRepository.get_user_by_email("user@example.com")
    if not user:
        user = await UserRepository.create_user("user@example.com")
        
    result = await PortfolioService.process_upload(user.id, file, name)
    
    # Trigger background enrichment
    enrichment_svc = EnrichmentService()
    # Background tasks need sync or async functions, asyncio.create_task could also be used directly
    import asyncio
    asyncio.create_task(enrichment_svc.enrich_portfolio(result["portfolio_id"]))
    
    return result

@router.get("/active")
async def get_active_portfolio():
    from app.db.repositories import UserRepository
    from app.db.client import prisma
    user = await UserRepository.get_user_by_email("user@example.com")
    if not user:
        return {"portfolio_id": None, "name": None}
        
    portfolio = await prisma.portfolio.find_first(
        where={"userId": user.id},
        order={"createdAt": "desc"}
    )
    
    if not portfolio:
        return {"portfolio_id": None, "name": None}
        
    return {"portfolio_id": portfolio.id, "name": portfolio.name}


@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str):
    portfolio = await PortfolioRepository.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    return portfolio
