from langchain_openai import ChatOpenAI
from app.core.config import settings
from app.core.feature_flags import feature_flags

class LLMFactory:
    @staticmethod
    def get_llm(model_name: str = "gpt-5.2", temperature: float = 0.0):
        if not feature_flags.is_enabled("ENABLE_CHAT_AGENT"):
            raise ValueError("Chat Agent is disabled via feature flags")
            
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY
        )
