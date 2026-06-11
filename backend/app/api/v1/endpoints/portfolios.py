from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.portfolio_service import PortfolioService
from app.db.repositories import PortfolioRepository

router = APIRouter()

@router.post("/upload")
async def upload_portfolio(
    file: UploadFile = File(...),
    name: str = Form(...)
):
    from app.db.repositories import UserRepository
    user = await UserRepository.get_user_by_email("user@example.com")
    if not user:
        user = await UserRepository.create_user("user@example.com")
        
    result = await PortfolioService.process_upload(user.id, file, name)
    return result

@router.get("/{portfolio_id}")
async def get_portfolio(portfolio_id: str):
    portfolio = await PortfolioRepository.get_portfolio(portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
        
    return portfolio
