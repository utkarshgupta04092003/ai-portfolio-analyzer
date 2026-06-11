import React from "react";

interface Props {
  data: {
    correlation_matrix: Record<string, Record<string, number>>;
  };
}

export default function CorrelationDashboard({ data }: Props) {
  const matrix = data.correlation_matrix || {};
  const symbols = Object.keys(matrix);

  if (symbols.length === 0) {
    return <div>No correlation data available.</div>;
  }

  // Helper to interpolate color based on correlation [-1, 1]
  const getColor = (val: number) => {
    if (val === 1) return "rgba(59, 130, 246, 0.8)"; // Self correlation
    if (val > 0.7) return "rgba(16, 185, 129, 0.6)"; // Strong positive (Green)
    if (val > 0.3) return "rgba(16, 185, 129, 0.3)"; // Weak positive
    if (val > -0.3) return "rgba(148, 163, 184, 0.1)"; // Neutral
    if (val > -0.7) return "rgba(239, 68, 68, 0.3)"; // Weak negative (Red)
    return "rgba(239, 68, 68, 0.6)"; // Strong negative
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
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
          Asset Correlation Matrix
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Heatmap showing how your assets move relative to each other.
        </p>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div
          style={{
            display: "inline-grid",
            gridTemplateColumns: `auto repeat(${symbols.length}, minmax(60px, 1fr))`,
          }}
        >
          {/* Header Row */}
          <div
            style={{
              padding: "0.5rem",
              borderBottom: "1px solid var(--glass-border)",
              borderRight: "1px solid var(--glass-border)",
            }}
          ></div>
          {symbols.map((sym) => (
            <div
              key={`header-${sym}`}
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontWeight: 600,
                borderBottom: "1px solid var(--glass-border)",
                color: "var(--text-secondary)",
              }}
            >
              {sym}
            </div>
          ))}

          {/* Matrix Rows */}
          {symbols.map((rowSym) => (
            <React.Fragment key={`row-${rowSym}`}>
              {/* Row Header */}
              <div
                style={{
                  padding: "0.5rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  borderRight: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }}
              >
                {rowSym}
              </div>

              {/* Cells */}
              {symbols.map((colSym) => {
                const val = matrix[rowSym][colSym] || 0;
                return (
                  <div
                    key={`cell-${rowSym}-${colSym}`}
                    style={{
                      background: getColor(val),
                      padding: "1rem 0.5rem",
                      textAlign: "center",
                      color: val === 1 ? "#fff" : "var(--text-primary)",
                      fontWeight: val === 1 ? 700 : 400,
                      border: "1px solid rgba(255,255,255,0.05)",
                      margin: "2px",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      transition: "transform 0.2s",
                    }}
                    title={`${rowSym} vs ${colSym}: ${val.toFixed(3)}`}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
