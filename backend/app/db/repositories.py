from typing import List, Optional
from prisma.models import User, Portfolio, Holding
from app.db.client import prisma

class UserRepository:
    @staticmethod
    async def create_user(email: str) -> User:
        return await prisma.user.create(
            data={"email": email}
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
        count = 0
        print(holdings_data)
        for h in holdings_data:
            # Remove None values to avoid Prisma errors on optional fields
            clean_data = {k: v for k, v in h.items() if v is not None}
            await prisma.holding.create(data=clean_data)
            count += 1
        return count
