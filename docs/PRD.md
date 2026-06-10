# Product Requirements Document (PRD)

## 1. Product Overview
The AI-powered Portfolio Analyzer is a comprehensive web platform that empowers users to upload investment portfolios, automatically enrich them with real-time market data, compute sophisticated deterministic analytics, and query their portfolio using an intelligent, conversational AI interface. 

The core philosophy is strict separation of concerns: AI is used exclusively for intent routing and insight generation, while all financial calculations are strictly deterministic.

## 2. Target Audience
- Retail Investors seeking deep portfolio insights without complex spreadsheets.
- Financial Advisors needing a quick visual and conversational tool to analyze client portfolios.
- Quantitative Hobbyists wanting to run simulations and what-if scenarios.

## 3. Core Features
- **Portfolio Ingestion**: Upload portfolios via CSV/Excel, parsing symbols, quantities, and weights.
- **Data Enrichment**: Automatic background fetching of company metadata, market caps, and historical prices.
- **Deterministic Analytics**: High-performance, reproducible calculation of Performance (Alpha, Sharpe), Risk (Volatility, Max Drawdown, VaR), Diversification, and Correlation.
- **Conversational Interface**: Ask questions like "How exposed am I to the tech sector?" and receive grounded, calculated answers.
- **Dynamic Canvas**: A flexible dashboard area that automatically updates to show relevant charts (e.g., Correlation Matrix, Sector Exposure) based on the current chat context.
- **Simulations**: Run "what-if" scenarios (e.g., "What if I replaced AAPL with MSFT?") to see the impact on risk/return metrics.

## 4. User Flows
1. **Onboarding & Upload**: User lands on the dashboard, uploads a CSV -> System normalizes symbols, saves to DB -> System triggers data enrichment pipeline.
2. **Analysis & Canvas**: User views the initial Portfolio Summary canvas -> System displays high-level stats calculated deterministically.
3. **Chat Interaction**: User asks "Show me my risk metrics" -> LLM Agent detects intent -> Agent invokes Risk Tool -> Tool runs Python analytics -> Agent summarizes insights -> Frontend dynamically loads Risk Dashboard canvas.
4. **Simulation**: User asks "What if market drops 10%?" -> LLM Agent detects simulation intent -> Agent invokes Simulation Tool -> Tool calculates deterministic mutation -> Canvas updates with Simulation Results.

## 5. Non-Functional Requirements
- **Accuracy**: 100% deterministic financial calculations. Zero hallucination tolerance on numbers.
- **Performance**: Analytics execution < 2 seconds. UI rendering at 60 FPS.
- **Security**: No hardcoded secrets. Proper data sanitization on file uploads.
- **Scalability**: Stateless backend services capable of horizontal scaling.
