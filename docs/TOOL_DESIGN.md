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
- **Service Called**: `SimulationAnalyzer.run_mutation()`
- **Output Schema**: Projected return and risk metrics based on the mutation.

### `fundamentals_tool`
- **Input**: `portfolio_id`
- **Service Called**: `FundamentalsAnalyzer.get_portfolio_fundamentals()`
- **Output Schema**: 
  ```json
  {
    "portfolio_fundamentals": {
      "SYMBOL": {
        "name": string,
        "sector": string,
        "marketCap": float,
        "trailingPE": float,
        "forwardPE": float,
        "dividendYield": float,
        "beta": float
      }
    }
  }
  ```

### `calculator_tool`
- **Input**: `expression` (arithmetic expression containing numbers, `+`, `-`, `*`, `/`, `%`, `(`, `)`)
- **Service Called**: Safely evaluates the expression using sanitized local code.
- **Output Schema**:
  ```json
  {
    "expression": string,
    "result": float
  }
  ```

### `historical_tool`
- **Input**: `portfolio_id`, `start_date` (optional YYYY-MM-DD), `end_date` (optional YYYY-MM-DD)
- **Service Called**: Queries historical close prices for portfolio holdings.
- **Output Schema**:
  ```json
  {
    "historical_data": [
      {
        "date": "YYYY-MM-DD",
        "SYMBOL_1": float,
        "SYMBOL_2": float
      }
    ]
  }
  ```

## 3. Tool Error Handling
If an exception occurs within a service (e.g., missing data, invalid math), the tool catches the exception and returns a structured error object `{"error": "description"}`, which the Agent uses to inform the user.

