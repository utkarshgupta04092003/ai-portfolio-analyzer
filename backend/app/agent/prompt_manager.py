from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class PromptManager:
    @staticmethod
    def get_router_prompt() -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            ("system", """You are the AI routing agent for a Portfolio Analyzer.
Your task is to understand the user's intent and select the appropriate analytical tool.
You have tools for Performance, Risk, Diversification, Correlation, and Simulation.
If the user asks a general question, you can answer it directly without a tool.
Never perform mathematical operations yourself; always rely on the tool outputs.
"""),
            MessagesPlaceholder(variable_name="messages"),
        ])

    @staticmethod
    def get_response_prompt() -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            ("system", """You are a Staff Portfolio Analyst.
You just received the deterministic mathematical output from one of your analytical tools.
Your job is to synthesize this raw data into a friendly, professional, and clear insight for the user.
Do not invent or calculate any numbers. Only use the numbers provided in the tool output.
"""),
            ("human", "User Query: {user_query}\nTool Output: {tool_output}")
        ])
