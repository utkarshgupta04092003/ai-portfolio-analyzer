# Tool Design

Tools bridge the gap between the LLM and the deterministic Python analytics engine. They are implemented as LangChain `BaseTool` or `@tool` decorated functions.

## 1. Principles
- **No Math in Tools**: Tools merely extract parameters from the LLM, call a `Service` class, and return the result.
- **No DB Access**: Tools do not query the database directly. They pass `portfolio_id` to services.
- **Structured Output**: Tools return JSON, never strings, to ensure the Response Generator has deterministic data to build the canvas payload.

## 2. Implemented Tools

### `performance_tool`
- **Input**: `portfolio_id`
- **Service Called**: `AnalyticsService.calculate_performance()`
- **Output Schema**: 
  ```json
  {
    "total_return": float,
    "annualized_return": float,
    "alpha": float,
    "sharpe_ratio": float,
    "benchmark_return": float
  }
  ```

### `risk_tool`
- **Input**: `portfolio_id`
- **Service Called**: `RiskService.calculate_risk()`
- **Output Schema**:
  ```json
  {
    "volatility": float,
    "max_drawdown": float,
    "var_95": float,
    "cvar_95": float
  }
  ```

### `diversification_tool`
- **Input**: `portfolio_id`
- **Service Called**: `DiversificationService.analyze_sectors()`
- **Output Schema**:
  ```json
  {
    "concentration_score": float,
    "sectors": [{"name": "Tech", "weight": 0.4}],
    "asset_allocation": [{"type": "Equity", "weight": 1.0}]
  }
  ```

### `correlation_tool`
- **Input**: `portfolio_id`
- **Service Called**: `AnalyticsService.calculate_correlation_matrix()`
- **Output Schema**: Matrix of pairwise correlations between holdings.

### `simulation_tool`
- **Input**: `portfolio_id`, `mutations` (list of symbol and weight changes)
- **Service Called**: `SimulationService.run_mutation()`
- **Output Schema**: Projected return and risk metrics based on the mutation.

## 3. Tool Error Handling
If an exception occurs within a service (e.g., missing data, invalid math), the tool catches the exception and returns a structured error object `{"error": "description"}`, which the Agent uses to inform the user.
