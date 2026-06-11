from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Portfolio Analyzer"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "mongodb://localhost:27017/portfolio_analyzer"
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
