# Evaluation Plan

As an AI-powered system handling financial data, rigorous evaluation of the Agent is required to ensure reliability, accuracy, and user trust.

## 1. Core Evaluation Metrics

### Intent Routing Accuracy
- **Goal**: >95%
- **Measurement**: Test a golden dataset of 100 user queries mapped to the expected tool (e.g., "Am I diversified?" -> `diversification_tool`).

### Numerical Grounding
- **Goal**: 100%
- **Measurement**: Ensure that any numerical value mentioned by the Agent in its text response exactly matches the JSON output from the Tool. Regex extract numbers and compare.

### Hallucination Rate
- **Goal**: 0%
- **Measurement**: If a user asks about a metric not supported by the tools, the Agent must gracefully decline. Test with out-of-domain financial queries (e.g., "What is the implied volatility of AAPL options?").

### Canvas Selection Accuracy
- **Goal**: >95%
- **Measurement**: Ensure the `canvas_type` emitted aligns with the intent and tool executed.

## 2. Evaluation Framework

We will build an internal evaluation script:
`python -m backend.evaluations.run_eval`

This script will:
1. Load a deterministic test portfolio.
2. Iterate through a JSONL file of test queries.
3. Capture the LangGraph state trace.
4. Compare output against expected outcomes.
5. Save an `EvaluationRun` record to MongoDB.

## 3. Human-in-the-Loop
During MVP beta testing, all user feedback (thumbs up/down) will be logged to the `ChatSession` model to continuously fine-tune the PromptManager logic.
