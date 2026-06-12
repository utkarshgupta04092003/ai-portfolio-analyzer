# Backend Function Input/Output Reference

This document maps out the exhaustive list of data processing, enrichment, analytics, and agent functions in the backend. It details their required inputs, the exact data structures they output, and any database mutations or manipulations they perform.

---

## 1. Services Layer (`app.services`)

### `PortfolioService.process_upload`
Handles the parsing of CSV/Excel files and bulk inserts into the database.
* **Input**: 
  - `user_id` (str): The MongoDB ObjectId of the user.
  - `file` (UploadFile): The raw CSV or Excel file uploaded via the endpoint.
  - `name` (str): The name assigned to the portfolio.
* **Database / Side Effects**:
  - Drops rows containing `NaN` symbols or quantities using Pandas.
  - Creates a new `Portfolio` record in MongoDB.
  - Creates multiple `Holding` records in MongoDB for the parsed CSV rows.
* **Output Format**:
```json
{
  "portfolio_id": "6a2a344d16a49a0062ab3a28",
  "message": "Successfully processed 2 holdings."
}
```

### `EnrichmentService.enrich_portfolio`
Background task that orchestrates data fetching and snapshot generation.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Fetches Company Metadata and Historical Prices for all holdings via `YahooFinanceProvider`.
  - Upserts `CompanyMetadata` records into MongoDB.
  - Performs a lightning-fast bulk insert of `HistoricalPrice` records into MongoDB (deletes old records first).
  - Automatically triggers `_generate_snapshots` to calculate and store performance, risk, diversification, and fundamental snapshots in the database.
* **Output Format**: `None`

---

## 2. Data Providers (`app.data_providers`)

### `YahooFinanceProvider.get_company_profile`
Fetches fundamental data and metadata for a specific ticker.
* **Input**: 
  - `symbol` (str): The stock ticker (e.g., `RELIANCE`).
* **Database / Side Effects**: 
  - None (Read-only from Yahoo Finance API). Data formatting manipulation (extracts and filters dict keys).
* **Output Format**:
```json
{
  "name": "RELIANCE INDUSTRIES LTD",
  "sector": "Energy",
  "industry": "Oil & Gas Refining & Marketing",
  "marketCap": 17087451889664,
  "trailingPE": 21.16,
  "forwardPE": 17.52,
  "dividendYield": 0.48,
  "beta": 0.182
}
```

### `YahooFinanceProvider.get_historical_prices`
Fetches daily pricing data.
* **Input**: 
  - `symbol` (str): The stock ticker.
  - `start_date` (str): Format `YYYY-MM-DD`.
  - `end_date` (str): Format `YYYY-MM-DD`.
* **Database / Side Effects**: 
  - None (Read-only from Yahoo Finance API). Converts Pandas DataFrame rows into standard Python dictionaries.
* **Output Format**:
```json
[
  {
    "date": "2023-06-12",
    "close": 2917.18,
    "volume": 12345678
  }
]
```

---

## 3. Analytics Engines (`app.analytics`)

### `PerformanceAnalyzer.calculate_metrics`
Calculates cumulative returns, annualized performance, and relative performance metrics against the **Nifty 50** (`^NSEI`) benchmark.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB. 
  - Merges and pivots pricing data using Pandas to align dates, and mathematically computes daily returns.
  - Fetches or triggers enrichment for benchmark close prices, then computes Beta (CAPM) and Jensen's Alpha.
* **Output Format**:
```json
{
  "total_return": 0.245,                  // Cumulative return
  "annualized_return": 0.081,             // Annualized return
  "sharpe_ratio": 1.45,                   // Sharpe ratio against default risk-free rate
  "benchmark_total_return": 0.182,        // Cumulative return of benchmark index
  "benchmark_annualized_return": 0.062,   // Annualized return of benchmark index
  "alpha": 0.023,                         // Jensen's Alpha (excess performance)
  "beta": 1.05                            // CAPM Beta (systematic market risk coefficient)
}
```

### `RiskAnalyzer.calculate_metrics`
Calculates risk metrics based on daily covariance and variance.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB.
  - Manipulates data via Pandas to calculate annualized volatility, maximum historical drawdown, Value at Risk, and Conditional Value at Risk.
* **Output Format**:
```json
{
  "volatility": 0.152,         // Annualized volatility (standard deviation of daily returns)
  "max_drawdown": -0.221,      // Max historical drawdown from peak to trough
  "var_95": -0.024,            // 95% Daily Value at Risk
  "cvar_95": -0.031            // 95% Daily Conditional Value at Risk (Expected Shortfall)
}
```

### `DiversificationAnalyzer.analyze_sectors`
Calculates portfolio concentration and sector allocation weights.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `CompanyMetadata` from MongoDB.
  - Aggregates weights grouped by sectors.
* **Output Format**:
```json
{
  "concentration_score": 0.65,  // Herfindahl-Hirschman Index based on sector exposure
  "sectors": [
    { "name": "Technology", "weight": 0.45 },
    { "name": "Energy", "weight": 0.30 },
    { "name": "Financials", "weight": 0.25 }
  ]
}
```

### `FundamentalsAnalyzer.get_portfolio_fundamentals`
Compiles live fundamentals for all holdings within the portfolio.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` from MongoDB.
  - Makes live network requests to Yahoo Finance API to fetch current fundamentals for all holdings.
* **Output Format**:
```json
{
  "portfolio_fundamentals": {
    "RELIANCE": {
      "name": "RELIANCE INDUSTRIES LTD",
      "sector": "Energy",
      "marketCap": 17087451889664,
      "trailingPE": 21.16,
      "forwardPE": 17.52,
      "dividendYield": 0.48,
      "beta": 0.182
    }
  }
}
```

### `CorrelationAnalyzer.calculate_correlation_matrix`
Calculates the historical correlation matrix between all assets in a portfolio.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB.
  - Forward-fills missing data and pivots arrays using Pandas to execute a `.corr()` matrix calculation.
* **Output Format**:
```json
{
  "correlation_matrix": {
    "RELIANCE": {
      "RELIANCE": 1.0,
      "TCS": 0.32
    },
    "TCS": {
      "RELIANCE": 0.32,
      "TCS": 1.0
    }
  }
}
```

### `SimulationAnalyzer.run_mutation`
Simulates a what-if scenario projecting returns if weights are shifted or new assets are added.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
  - `mutations` (list): A list of hypothetical weight changes `[{"symbol": "TCS", "weight_change": 0.1}]`.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB.
  - Merges historical prices of current and newly simulated assets, adjusting historical daily returns by normalized hypothetical weights.
* **Output Format**:
```json
{
  "projected_return": 0.105,   // Annualized 10.5% projected return
  "projected_risk": 0.16       // Projected volatility 16%
}
```

### `historical_tool` (Historical Timeline)
Fetches historical close price arrays for all symbols in the active portfolio.
* **Input**:
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
  - `start_date` (str, optional): Start date YYYY-MM-DD.
  - `end_date` (str, optional): End date YYYY-MM-DD.
* **Output Format**:
```json
{
  "historical_data": [
    {
      "date": "2026-06-10",
      "RELIANCE.NS": 2900.5,
      "TCS.NS": 3450.2
    },
    {
      "date": "2026-06-11",
      "RELIANCE.NS": 2915.2,
      "TCS.NS": 3462.8
    }
  ]
}
```

---

## 4. LangGraph Agent Layer (`app.agent`)

### `router_node(state: AgentState)`
Determines if a tool should be executed based on the user request.
* **Input**: 
  - `state` (AgentState): Contains the sequence of conversation messages.
* **Database / Side Effects**:
  - Passes conversation history to OpenAI LLM bound with tools (`llm.bind_tools(tools)`).
* **Output Format**: Returns the state dict with the AI response message containing any requested tool calls.

### `tool_node(state: AgentState)`
Executes the tool requested by the routing LLM.
* **Input**: 
  - `state` (AgentState): Contains the active portfolio id and the tool request message.
* **Database / Side Effects**:
  - Automatically executes the corresponding LangChain Tool.
  - Resolves output and maps it to a canvas dashboard type (`canvas_type`) and canvas payload (`canvas_payload`).
* **Output Format**: Returns the state dict with a `ToolMessage` appended to `messages`, and updates `canvas_type` and `canvas_payload`.

### `response_node(state: AgentState)`
Synthesizes the natural language response using the tool output.
* **Input**: 
  - `state` (AgentState): Contains the conversation history and tool execution response.
* **Database / Side Effects**:
  - Queries the OpenAI LLM with a system prompt instructing it to explain the tool output without performing math.
* **Output Format**: Returns the state dict with the final conversational `AIMessage` response.
