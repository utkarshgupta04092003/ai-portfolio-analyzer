import pytest
from app.db.repositories import UserRepository, PortfolioRepository, HoldingRepository
from prisma import Prisma

@pytest.fixture(scope="module")
async def prisma_client():
    prisma = Prisma()
    await prisma.connect()
    yield prisma
    # Cleanup for testing
    await prisma.holding.delete_many()
    await prisma.portfolio.delete_many()
    await prisma.user.delete_many()
    await prisma.disconnect()

@pytest.mark.asyncio
async def test_user_creation(prisma_client):
    email = "test@example.com"
    user = await UserRepository.create_user(email)
    assert user is not None
    assert user.email == email

@pytest.mark.asyncio
async def test_portfolio_creation(prisma_client):
    user = await UserRepository.get_user_by_email("test@example.com")
    portfolio = await PortfolioRepository.create_portfolio(user.id, "My Tech Portfolio")
    assert portfolio is not None
    assert portfolio.name == "My Tech Portfolio"
    assert portfolio.userId == user.id

@pytest.mark.asyncio
async def test_holding_creation(prisma_client):
    user = await UserRepository.get_user_by_email("test@example.com")
    portfolios = await PortfolioRepository.get_user_portfolios(user.id)
    portfolio = portfolios[0]
    
    holding = await HoldingRepository.create_holding(portfolio.id, "AAPL", 10.0, 0.5)
    assert holding is not None
    assert holding.symbol == "AAPL"
    assert holding.quantity == 10.0
