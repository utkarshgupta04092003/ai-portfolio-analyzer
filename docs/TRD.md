# Technical Requirements Document (TRD)

## 1. Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Modular CSS (Strictly NO Tailwind)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Visualization**: Recharts

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Agent Orchestration**: LangGraph, LangChain
- **LLM Provider**: OpenAI API (GPT-4o, GPT-5 ready)
- **Analytics Engine**: Pandas, NumPy, SciPy
- **ORM**: Prisma Python Client

### Database & Infrastructure
- **Database**: MongoDB (Document store suitable for flexible financial data schema)
- **Containerization**: Docker, Docker Compose

## 2. Architecture Principles
- **Clean Architecture**: Strict separation between API, Domain, and Data layers.
- **Domain-Driven Design (DDD)**: Bounded contexts for Portfolio, Analytics, MarketData, and Chat.
- **SOLID & DRY**: Interfaces for external integrations, single responsibility per module.
- **Configuration Driven**: All settings driven by environment variables (`Pydantic Settings`).
- **No LLM Math**: LLMs must NEVER compute financial metrics. They only orchestrate and synthesize.
- **No Direct DB Access in Tools**: Agent tools must call internal services, which in turn use repositories.

## 3. System Constraints
- The backend must expose a strict REST/OpenAPI standard interface under `/api/v1/`.
- Frontend must not perform complex analytics; it is strictly a presentation and state management layer.
- All file uploads must be parsed and sanitized before writing to the database.

## 4. Development & CI/CD Guidelines
- **Type Safety**: Strict MyPy typing for Python. Strict TypeScript compiler options.
- **Testing**: Pytest for backend unit/integration tests. Jest/React Testing Library for frontend. E2E tests for the critical path.
- **Linting**: Ruff (Python), ESLint (TypeScript).
