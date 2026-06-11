import {
  BarChart3,
  Info,
  Layers,
  PieChart,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

interface Props {
  data: any;
  activeCanvas?: string;
  onSelectPrompt?: (prompt: string) => void;
}

export default function GeneralDashboard({
  data,
  activeCanvas,
  onSelectPrompt,
}: Props) {
  // 1. Check if the payload is empty or not provided
  const isEmpty =
    !data || (typeof data === "object" && Object.keys(data).length === 0);

  if (isEmpty) {
    // Show a beautiful onboarding/overview dashboard explaining the available analyses
    const features = [
      {
        icon: <BarChart3 size={24} style={{ color: "#3b82f6" }} />,
        title: "Performance Analysis",
        desc: "Calculate total returns, annualized returns, and Sharpe ratios.",
        prompt: "Show me the performance of my portfolio.",
      },
      {
        icon: <ShieldAlert size={24} style={{ color: "#ef4444" }} />,
        title: "Risk Assessment",
        desc: "Evaluate volatility, maximum drawdown, and Value at Risk (VaR).",
        prompt: "What is the risk profile of my portfolio?",
      },
      {
        icon: <PieChart size={24} style={{ color: "#10b981" }} />,
        title: "Diversification Analysis",
        desc: "Check portfolio exposure across sectors and concentration risk.",
        prompt: "How diversified is my portfolio?",
      },
      {
        icon: <Info size={24} style={{ color: "#06b6d4" }} />,
        title: "Company Fundamentals",
        desc: "Review P/E ratios, company names, dividend yields, and beta.",
        prompt: "What are the fundamentals of my portfolio holdings?",
      },
      {
        icon: <Layers size={24} style={{ color: "#a855f7" }} />,
        title: "Correlation Analysis",
        desc: "Examine how closely your stock holdings move together to identify overlaps.",
        prompt: "What is the correlation matrix of my holdings?",
      },
      {
        icon: <TrendingUp size={24} style={{ color: "#f97316" }} />,
        title: "Benchmark Comparison",
        desc: "Compare your portfolio's returns, alpha, and beta against the Nifty 50 index benchmark.",
        prompt: "Compare my portfolio performance against Nifty 50.",
      },
    ];

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Portfolio Summary
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Ask the AI assistant to run one of these advanced analyses on your
            uploaded portfolio.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            flex: 1,
          }}
        >
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="glass-panel onboarding-card"
              onClick={() => onSelectPrompt && onSelectPrompt(feat.prompt)}
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {feat.icon}
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {feat.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {feat.desc}
                </p>
              </div>
              <div
                style={{
                  marginTop: "0.75rem",
                  borderTop: "1px solid var(--glass-border)",
                  paddingTop: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--accent-hover)",
                    fontFamily: "monospace",
                  }}
                >
                  Try asking: "{feat.prompt}"
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Parse payload if it's formatted as nested objects, e.g. { "portfolio_fundamentals": { "AAPL": {...} } }
  let displayData = data;
  let subTitle = "General insights and data.";
  let title =
    activeCanvas && activeCanvas !== "default"
      ? activeCanvas.replace(/([A-Z])/g, " $1").trim()
      : "Analysis Results";

  if (typeof data === "object") {
    // If it is wrapped in an outer object, e.g., { "portfolio_fundamentals": { ... } }
    const keys = Object.keys(data);
    if (keys.length === 1 && typeof data[keys[0]] === "object") {
      displayData = data[keys[0]];
      title = keys[0]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  // Helper formatting functions
  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "number") {
      if (val > 1e9) return `${(val / 1e9).toFixed(2)}B`;
      if (val > 1e6) return `${(val / 1e6).toFixed(2)}M`;
      if (val % 1 !== 0) return val.toFixed(2);
      return val.toString();
    }
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  // 3. Render Table if it's an object of objects (e.g. holdings fundamentals)
  const isObjectOfObjects =
    typeof displayData === "object" &&
    displayData !== null &&
    Object.values(displayData).every(
      (v) => typeof v === "object" && v !== null && !Array.isArray(v),
    );

  if (isObjectOfObjects) {
    const rowKeys = Object.keys(displayData);
    const firstRowVal = displayData[rowKeys[0]];
    const colKeys = Object.keys(firstRowVal);

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Interactive fundamentals overview.
          </p>
        </div>

        <div
          className="glass-panel"
          style={{ flex: 1, overflowX: "auto", padding: "1rem" }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--glass-border)" }}>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Symbol
                </th>
                {colKeys.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "0.75rem 1rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {col.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((rowKey, rowIdx) => (
                <tr
                  key={rowKey}
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    background:
                      rowIdx % 2 === 0
                        ? "rgba(255,255,255,0.01)"
                        : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontWeight: 600,
                      color: "var(--accent-hover)",
                    }}
                  >
                    {rowKey}
                  </td>
                  {colKeys.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: "0.75rem 1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatValue(displayData[rowKey][col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 4. Render Table if it's an array of objects
  const isArrayOfObjects =
    Array.isArray(displayData) &&
    displayData.length > 0 &&
    displayData.every((item) => typeof item === "object" && item !== null);

  if (isArrayOfObjects) {
    const colKeys = Object.keys(displayData[0]);

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{subTitle}</p>
        </div>

        <div
          className="glass-panel"
          style={{ flex: 1, overflowX: "auto", padding: "1rem" }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--glass-border)" }}>
                {colKeys.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "0.75rem 1rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {col.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((row: any, rowIdx: number) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    background:
                      rowIdx % 2 === 0
                        ? "rgba(255,255,255,0.01)"
                        : "transparent",
                  }}
                >
                  {colKeys.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: "0.75rem 1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 5. Render Grid of Metric Cards if it's a simple key-value object
  const isSimpleObject =
    typeof displayData === "object" &&
    displayData !== null &&
    !Array.isArray(displayData);

  if (isSimpleObject) {
    const keys = Object.keys(displayData);

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{subTitle}</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {keys.map((key) => (
            <div
              key={key}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                }}
              >
                {key.replace(/_/g, " ")}
              </span>
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {formatValue(displayData[key])}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Generic Fallback
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>{subTitle}</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: "1.5rem" }}>
        <p style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
          {String(displayData)}
        </p>
      </div>
    </div>
  );
}
