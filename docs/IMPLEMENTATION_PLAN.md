# Implementation Plan

The project is structured into 15 distinct phases to ensure separation of concerns and progressive delivery.

## Phase 1 - System Design (Current)
- Generate architecture documents, schemas, and plans.

## Phase 2 - Database Design
- Initialize MongoDB.
- Setup Prisma schema (`schema.prisma`).
- Generate client and test basic CRUD operations via Repositories.

## Phase 3 - Configuration Layer
- Setup Pydantic `Settings` for `.env` management.
- Define feature flags and global constants.

## Phase 4 - Data Collection Layer
- Implement `MarketDataProvider` interfaces.
- Build `YahooFinanceProvider` (using yfinance).
- Build `MarketDataService` with basic caching checks.

## Phase 5 - Portfolio Upload Flow
- Create FastAPI routes for CSV/Excel upload.
- Implement parsing and validation using Pandas.
- Store `Portfolio` and `Holding` models in the DB.

## Phase 6 - Data Enrichment Pipeline
- Implement background task to loop over newly uploaded holdings.
- Fetch and persist `CompanyMetadata` and `HistoricalPrice`.

## Phase 7 - Analytics Engine
- Build deterministic classes: `PerformanceAnalyzer`, `RiskAnalyzer`, `DiversificationAnalyzer`.
- Ensure all math is isolated in Python using NumPy/Pandas.

## Phase 8 - Tool Layer
- Wrap the Analytics engine into LangChain tools (`@tool`).
- Define exact Pydantic input schemas and JSON output schemas.

## Phase 9 - Agent Architecture
- Scaffold LangGraph `StateGraph`.
- Implement `Intent Router`, `Tool Executor`, and `Response Generator` nodes.

## Phase 10 - OpenAI Integration
- Create `LLMFactory` and configure GPT-4o.
- Setup the `PromptManager`.

## Phase 11 - API Design
- Wire up the Chat endpoint, bridging FastAPI requests to the LangGraph executor.

## Phase 12 - Frontend Architecture
- Scaffold Next.js 15 project.
- Implement basic layout, Sidebar, and Zustand stores.

## Phase 13 - Dynamic Canvas
- Implement Recharts components for Risk, Performance, and Sector Exposure.
- Implement the factory logic to render based on `canvas_type`.

## Phase 14 - Evaluations
- Build a Python script to run automated queries against the Agent.
- Measure intent routing accuracy and hallucination rate.

## Phase 15 - Testing
- Write Pytest integration tests for backend.
- Write frontend component tests.
