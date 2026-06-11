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
Calculates cumulative returns and annualized performance.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB. 
  - Merges and pivots pricing data using Pandas to align dates, and mathematically computes daily returns.
* **Output Format**:
```json
{
  "totalReturn": 0.245,        // 24.5% cumulative return
  "annualizedReturn": 0.081,   // 8.1% annualized return
  "totalValue": 150000.50      // Current portfolio value
}
```

### `RiskAnalyzer.calculate_metrics`
Calculates risk metrics based on daily covariance and variance.
* **Input**: 
  - `portfolio_id` (str): The MongoDB ObjectId of the portfolio.
* **Database / Side Effects**:
  - Reads `Holding` and `HistoricalPrice` from MongoDB.
  - Manipulates data via Pandas to calculate annualized covariance and historical peaks (for max drawdown).
* **Output Format**:
```json
{
  "volatility": 0.152,         // 15.2% annualized volatility
  "maxDrawdown": 0.221,        // 22.1% max historical drawdown
  "sharpeRatio": 1.45,         // Risk-adjusted return
  "var95": 0.024               // 95% Value at Risk (daily)
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
  "concentrationScore": 0.65,  // Herfindahl-Hirschman Index
  "sectorAllocation": {
    "Technology": 0.45,        // 45% weight
    "Energy": 0.30,            // 30% weight
    "Financials": 0.25         // 25% weight
  }
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

---

## 4. LangGraph Agent Layer (`app.agent`)

### `router_node(state: AgentState)`
Analyzes the user's chat message to determine the required AI tools and the UI canvas needed.
* **Input**: 
  - `state` (Dict): LangGraph internal state dictionary `{"messages": [HumanMessage]}`.
* **Database / Side Effects**:
  - Uses OpenAI LLM structured parsing.
  - Updates the `state` with determined `canvas_type` (e.g., `PortfolioSummary`) and any required tools to execute.
* **Output Format**: Returns mutated `state` dict.

### `tool_node(state: AgentState)`
Executes backend tools requested by the LLM (like `performance_tool` or `simulation_tool`).
* **Input**: 
  - `state` (Dict): LangGraph internal state dictionary containing tool invocation requests.
* **Database / Side Effects**:
  - Reads cached `AnalyticsSnapshot` from MongoDB directly via the `app.tools` wrappers to prevent re-calculating expensive math.
* **Output Format**: Returns mutated `state` dict with JSON strings of tool responses appended to `messages`.

### `response_node(state: AgentState)`
Generates the final conversational reply and standardizes the canvas payload for the frontend.
* **Input**: 
  - `state` (Dict): LangGraph internal state dictionary with all completed tool context.
* **Database / Side Effects**:
  - Invokes OpenAI LLM to generate the final conversational response `AIMessage`.
  - Serializes tool outputs into `canvas_payload`.
* **Output Format**: Returns mutated `state` dict containing final `messages` and `canvas_payload`.
