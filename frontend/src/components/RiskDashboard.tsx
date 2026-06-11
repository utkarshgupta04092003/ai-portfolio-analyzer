interface Props {
  data: {
    volatility: number;
    max_drawdown: number;
    var_95: number;
    cvar_95: number;
  };
}

export default function RiskDashboard({ data }: Props) {
  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

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
          Risk Dashboard
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Comprehensive risk analysis and drawdown metrics.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Volatility (Ann.)
          </h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#f87171" }}>
            {formatPercent(data.volatility)}
          </p>
        </div>

        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Max Drawdown
          </h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#fbbf24" }}>
            {formatPercent(data.max_drawdown)}
          </p>
        </div>

        <div
          style={{
            background: "var(--glass-bg)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Value at Risk (95%)
          </h3>
          <p
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {formatPercent(data.var_95)}
          </p>
        </div>

        <div
          style={{
            background: "var(--glass-bg)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid var(--glass-border)",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Expected Shortfall (CVaR)
          </h3>
          <p
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {formatPercent(data.cvar_95)}
          </p>
        </div>
      </div>
    </div>
  );
}
