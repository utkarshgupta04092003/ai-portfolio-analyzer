from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.client import prisma
from app.api.v1.endpoints import portfolios, chat

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolios.router, prefix=f"{settings.API_V1_STR}/portfolios", tags=["Portfolios"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat Agent"])

@app.on_event("startup")
async def startup() -> None:
    await prisma.connect()
    print("Prisma connected")

@app.on_event("shutdown")
async def shutdown() -> None:
    if prisma.is_connected():
        await prisma.disconnect()
    print("Prisma disconnected")

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "db_connected": prisma.is_connected()
    }

@app.get("/test", tags=["System"])
async def test() -> dict:
    users = await prisma.user.find_many()
    portfolios = await prisma.portfolio.find_many(include={"holdings": True, "snapshots": True})
    return {
        "user": users,
        "portfolio": portfolios
    }
        
    