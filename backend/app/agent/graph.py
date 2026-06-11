from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
import json

from app.agent.llm_factory import LLMFactory
from app.agent.prompt_manager import PromptManager
from app.tools.analytics_tools import get_all_tools

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    portfolio_id: str
    canvas_type: str
    canvas_payload: dict

# Initialize tools
tools = get_all_tools()

# Initialize LLM with tool binding
llm = LLMFactory.get_llm(temperature=0)
llm_with_tools = llm.bind_tools(tools)

# Create a map for fast lookup
tool_map = {t.name: t for t in tools}

async def router_node(state: AgentState):
    """Determines if a tool should be called."""
    messages = state["messages"]
    prompt = PromptManager.get_router_prompt()
    chain = prompt | llm_with_tools
    response = await chain.ainvoke({
        "messages": messages, 
        "portfolio_id": state.get("portfolio_id", "unknown")
    })
    return {"messages": [response]}

async def tool_node(state: AgentState):
    """Executes the selected tool."""
    last_message = state["messages"][-1]
    
    # We only execute the first tool call for simplicity in MVP
    tool_call = last_message.tool_calls[0]
    
    # We must inject the portfolio_id automatically if not provided by LLM
    if "portfolio_id" not in tool_call["args"]:
        tool_call["args"]["portfolio_id"] = state["portfolio_id"]
        
    tool_func = tool_map.get(tool_call["name"])
    if not tool_func:
        response = json.dumps({"error": "Tool not found"})
    else:
        response = await tool_func.ainvoke(tool_call["args"])
    
    # Extract canvas type based on tool called
    canvas_map = {
        "performance_tool": "PerformanceDashboard",
        "risk_tool": "RiskDashboard",
        "diversification_tool": "SectorExposure",
        "correlation_tool": "CorrelationMatrix",
        "simulation_tool": "SimulationResults",
        "fundamentals_tool": "FundamentalsDashboard",
        "historical_tool": "HistoricalDashboard"
    }
    
    canvas_type = canvas_map.get(tool_call["name"], "PortfolioSummary")
    
    try:
        canvas_payload = json.loads(response)
    except:
        canvas_payload = {"raw": response}
    
    tool_message = ToolMessage(
        content=str(response), name=tool_call["name"], tool_call_id=tool_call["id"]
    )
    
    return {
        "messages": [tool_message],
        "canvas_type": canvas_type,
        "canvas_payload": canvas_payload
    }

async def response_node(state: AgentState):
    """Generates the final natural language response."""
    # Find the tool message
    tool_msg = next((m for m in reversed(state["messages"]) if isinstance(m, ToolMessage)), None)
    human_msg = next((m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)), None)
    
    if not tool_msg or not human_msg:
        return {"messages": []}
        
    prompt = PromptManager.get_response_prompt()
    chain = prompt | llm
    
    response = await chain.ainvoke({
        "user_query": human_msg.content,
        "tool_output": tool_msg.content
    })
    
    return {"messages": [response]}

def should_continue(state: AgentState):
    """Routing logic."""
    last_message = state["messages"][-1]
    if "tool_calls" in last_message.additional_kwargs or hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "continue"
    return "end"

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("tool", tool_node)
    workflow.add_node("response", response_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        should_continue,
        {
            "continue": "tool",
            "end": END
        }
    )
    
    workflow.add_edge("tool", "response")
    workflow.add_edge("response", END)
    
    return workflow.compile()

# The compiled agent graph
agent_executor = build_graph()
