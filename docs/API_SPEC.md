# API Specification

The backend exposes a RESTful API built with FastAPI under the `/api/v1` prefix. All endpoints are documented automatically via OpenAPI (Swagger).

## 1. Portfolios
`POST /api/v1/portfolios/upload`
- **Description**: Upload a portfolio CSV or Excel file.
- **Request**: `multipart/form-data` with file.
- **Response**: `{ "portfolio_id": "...", "status": "processing" }`

`GET /api/v1/portfolios/{portfolio_id}`
- **Description**: Retrieve normalized portfolio holdings and metadata.
- **Response**: `{ "id": "...", "holdings": [...] }`

## 2. Analytics
`GET /api/v1/analytics/{portfolio_id}/summary`
- **Description**: High-level summary of the portfolio.
- **Response**: `{ "total_value": 100000, "positions": 15, "top_sector": "Technology" }`

`POST /api/v1/analytics/{portfolio_id}/simulation`
- **Description**: Run a deterministic mutation analysis.
- **Request**: `{ "mutations": [{"symbol": "AAPL", "weight_change": -0.05}] }`
- **Response**: `{ "projected_return": 0.08, "projected_risk": 0.12 }`

## 3. Chat (Agent Interface)
`POST /api/v1/chat/message`
- **Description**: Send a message to the LangGraph agent.
- **Request**: `{ "session_id": "...", "portfolio_id": "..." (optional), "message": "Show me my risk" }`
  - Note: If `portfolio_id` is `"None"`, `"null"`, `"undefined"`, `""`, or is an invalid MongoDB ObjectId, the endpoint will filter it and fall back to the user's latest uploaded portfolio.
- **Response**: 
  ```json
  {
    "answer": "Your portfolio has a high volatility of 18%, primarily driven by concentration in Tech.",
    "canvas_type": "RiskDashboard",
    "canvas_payload": {
      "volatility": 0.18,
      "max_drawdown": -0.22,
      "var_95": 0.03
    }
  }
  ```

`GET /api/v1/chat/sessions`
- **Description**: Retrieve all chat sessions for the authenticated user, ordered by creation date descending.
- **Response**:
  ```json
  [
    {
      "id": "60c72b2f9b1d8e001c34a2e5",
      "title": "Portfolio diversification analysis",
      "createdAt": "2026-06-11T13:00:00Z"
    }
  ]
  ```

`GET /api/v1/chat/sessions/{session_id}/messages`
- **Description**: Retrieve all historical messages and dynamic canvas states for a given session.
- **Response**:
  ```json
  [
    {
      "role": "user",
      "content": "Show me my risk"
    },
    {
      "role": "ai",
      "content": "Here are your risk metrics...",
      "canvasType": "RiskDashboard",
      "canvasPayload": {
        "volatility": 0.152,
        "max_drawdown": -0.221,
        "var_95": -0.024,
        "cvar_95": -0.031
      }
    }
  ]
  ```

## 4. System
`GET /api/v1/health`
- **Description**: Health check for the API and Database connectivity.

## 5. Middleware & Error Handling
- All endpoints use a global exception handler to return standardized HTTP 400/500 JSON error objects.
- Pydantic models validate all incoming requests.
