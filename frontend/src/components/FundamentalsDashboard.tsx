interface FundamentalData {
  name: string | null;
  sector: string | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  dividendYield: number | null;
  beta: number | null;
}

interface Props {
  data: {
    portfolio_fundamentals: {
      [symbol: string]: FundamentalData;
    };
  };
}

export default function FundamentalsDashboard({ data }: Props) {
  const fundamentals = data?.portfolio_fundamentals || {};
  const symbols = Object.keys(fundamentals);

  if (symbols.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <h2>Company Fundamentals</h2>
          <p style={{ marginTop: "1rem" }}>No fundamental data available.</p>
        </div>
      </div>
    );
  }

  // Format Large Currency (INR standard Crores/Lakhs or standard B/M)
  const formatMarketCap = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    // Convert to Crores if large enough, or use Billions
    if (num >= 1e7) {
      return `₹${(num / 1e7).toFixed(2)} Cr`;
    }
    if (num >= 1e5) {
      return `₹${(num / 1e5).toFixed(2)} Lk`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatPE = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    return num.toFixed(2);
  };

  const formatYield = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatBeta = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    return num.toFixed(2);
  };

  // Beta badge styling helper
  const getBetaStyle = (beta: number | null) => {
    if (beta === null) return {};
    if (beta > 1.2) {
      return {
        color: "#ef4444",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      };
    }
    if (beta < 0.8) {
      return {
        color: "#10b981",
        background: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
      };
    }
    return {
      color: "#3b82f6",
      background: "rgba(59, 130, 246, 0.1)",
      border: "1px solid rgba(59, 130, 246, 0.2)",
    };
  };

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
          Company Fundamentals
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Key financial metrics and stock characteristics of your holdings.
        </p>
      </div>

      <div
        className="glass-panel"
        style={{ flex: 1, overflowX: "auto", padding: "1.5rem" }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "0.95rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "2px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              <th style={{ padding: "1rem 0.75rem", fontWeight: 600 }}>
                Symbol
              </th>
              <th style={{ padding: "1rem 0.75rem", fontWeight: 600 }}>
                Company Name
              </th>
              <th style={{ padding: "1rem 0.75rem", fontWeight: 600 }}>
                Sector
              </th>
              <th
                style={{
                  padding: "1rem 0.75rem",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Market Cap
              </th>
              <th
                style={{
                  padding: "1rem 0.75rem",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Trailing P/E
              </th>
              <th
                style={{
                  padding: "1rem 0.75rem",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Forward P/E
              </th>
              <th
                style={{
                  padding: "1rem 0.75rem",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Div. Yield
              </th>
              <th
                style={{
                  padding: "1rem 0.75rem",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Beta
              </th>
            </tr>
          </thead>
          <tbody>
            {symbols.map((sym, idx) => {
              const item = fundamentals[sym];
              const betaStyle = getBetaStyle(item.beta);
              return (
                <tr
                  key={sym}
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    background:
                      idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      fontWeight: 700,
                      color: "var(--accent-hover)",
                    }}
                  >
                    {sym}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      color: "var(--text-primary)",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name || "-"}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.sector ? (
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--glass-border)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.sector}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      textAlign: "right",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatMarketCap(item.marketCap)}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      textAlign: "right",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatPE(item.trailingPE)}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      textAlign: "right",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatPE(item.forwardPE)}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      textAlign: "right",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatYield(item.dividendYield)}
                  </td>
                  <td
                    style={{
                      padding: "1rem 0.75rem",
                      textAlign: "center",
                    }}
                  >
                    {item.beta !== null ? (
                      <span
                        style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          display: "inline-block",
                          minWidth: "45px",
                          ...betaStyle,
                        }}
                      >
                        {formatBeta(item.beta)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
