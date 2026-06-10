# AI-Powered Portfolio Analyzer MVP

This document outlines the implementation plan for the AI-Powered Portfolio Analyzer. 

## Goal Description

Build a production-quality MVP for an AI-powered Portfolio Analyzer that allows users to:
1. Upload a portfolio via CSV or Excel and store holdings in MongoDB.
2. Fetch market and company data from external APIs.
3. Compute portfolio analytics using deterministic Python code.
4. Ask questions in natural language through an AI chat interface.
5. View a dynamic canvas/dashboard that changes based on conversation context.
6. Run portfolio simulations and what-if analysis.

The architecture will strictly adhere to the separation of concerns, ensuring the LLM acts ONLY as an intent detector, tool orchestrator, and insight generator, while all mathematical operations and financial calculations are executed by deterministic Python tools.

## Proposed Architecture Overview

- **Frontend**: Next.js 15, TypeScript, Modular CSS, Recharts, Zustand, TanStack Query.
- **Backend**: Python, FastAPI, LangGraph, LangChain, OpenAI, Prisma ORM, Pandas, NumPy, SciPy.
- **Database**: MongoDB.
- **Infrastructure**: Docker, Docker Compose.

The top-level structure will be strictly limited to:
- `/frontend`
- `/backend`
- `/docs`
- `README.md`

## Open Questions

> [!WARNING]
> Please review and clarify the following before we proceed to execution:
> 1. **Data Providers**: For the `MarketDataProvider` abstract base class, we need to implement YahooFinance, AlphaVantage, and a FutureProvider. Do you have API keys ready for AlphaVantage, or should we mock this for the initial MVP?
> 2. **Authentication**: Is there a requirement for user authentication (e.g., OAuth, JWT) in the MVP, or should we assume a single-tenant/local setup for now?
> 3. **Prisma with Python**: Prisma Python client is available but less common than SQLAlchemy. Confirming that we should use `prisma` for the Python backend with MongoDB.

## Proposed Phased Implementation

### Phase 1: System Design & Documentation
We will begin by creating detailed markdown documents in the `/docs` directory covering PRD, TRD, Architecture, Database Schema, API Spec, Agent Design, Tool Design, Data Collection, Implementation Plan, Evaluation Plan, and Tasks.

### Phase 2: Database Design
Set up MongoDB with Prisma. Design collections for Users, Portfolios, Holdings, MarketData, HistoricalPrices, CompanyMetadata, Benchmarks, ChatSessions, Messages, Simulations, AnalyticsSnapshots, and EvaluationRuns.

### Phase 3: Configuration Layer
Create the configuration layer in `backend/app/config/` using Pydantic Settings to load everything from `.env`.

### Phase 4: Data Collection Layer
Implement the `MarketDataProvider` abstract base class and services (YahooFinanceProvider, AlphaVantageProvider) to isolate external API calls.

### Phase 5: Portfolio Upload Flow
Implement CSV/Excel upload, validation, parsing, normalization, and saving logic.

### Phase 6: Data Enrichment Pipeline
Build the pipeline to fetch and cache company names, sectors, market caps, historical prices, and benchmarks after holdings are saved.

### Phase 7: Analytics Engine
Create deterministic analyzers for Performance, Risk, Diversification, Correlation, and Simulation using Pandas/NumPy.

### Phase 8: Tool Layer
Create LangChain tools (`performance_tool`, `risk_tool`, etc.) that interface with the Analytics Engine.

### Phase 9: Agent Architecture
Implement the LangGraph agent with State, Router, Tool Executor, and Response Generator.

### Phase 10: OpenAI Integration
Create `LLMFactory`, `ModelProvider`, and `PromptManager` for centralized prompt management and structured tool calling.

### Phase 11: API Design
Implement FastAPI routes under `/api/v1/` for uploads, retrieval, analytics, chat, simulation, and evaluations.

### Phase 12: Frontend Architecture
Set up Next.js 15 structure with Layout, Chat Interface, Dynamic Canvas, and Dashboard components using Modular CSS.

### Phase 13: Dynamic Canvas
Implement the frontend logic to render dynamic dashboards (Performance, Risk, Correlation, Sector, etc.) based on the backend's `canvas_type` payload.

### Phase 14: Evaluations
Create the evaluation framework to test intent routing, numerical grounding, hallucination rate, etc., storing results in MongoDB.

### Phase 15: Testing
Write Pytest tests for backend and Component/E2E tests for frontend.

## User Review Required

> [!IMPORTANT]
> Please review the 15-phase implementation plan and provide your approval to begin Phase 1 (Documentation and System Design). Once approved, I will generate all the required architectural documents in the `/docs` folder.
