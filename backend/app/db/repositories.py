from typing import List, Optional
from prisma.models import User, Portfolio, Holding
from app.db.client import prisma

class UserRepository:
    @staticmethod
    async def create_user(email: str, name: str = None) -> User:
        return await prisma.user.create(
            data={"email": email, "name": name}
        )

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        return await prisma.user.find_unique(where={"email": email})

class PortfolioRepository:
    @staticmethod
    async def create_portfolio(user_id: str, name: str) -> Portfolio:
        return await prisma.portfolio.create(
            data={
                "name": name,
                "userId": user_id
            }
        )
        
    @staticmethod
    async def get_portfolio(portfolio_id: str) -> Optional[Portfolio]:
        return await prisma.portfolio.find_unique(
            where={"id": portfolio_id},
            include={"holdings": True}
        )

class HoldingRepository:
    @staticmethod
    async def bulk_create_holdings(holdings_data: List[dict]) -> int:
        return await prisma.holding.create_many(
            data=holdings_data
        )
