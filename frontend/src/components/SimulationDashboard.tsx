interface Props {
  data: {
    projected_return: number;
    projected_risk: number;
    error?: string;
  };
}

export default function SimulationDashboard({ data }: Props) {
  if (data.error) {
    return (
      <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>
        <h2>Simulation Error</h2>
        <p style={{ color: "#ef4444" }}>{data.error}</p>
      </div>
    );
  }

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
          Simulation Results
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Projected outcomes based on your hypothetical portfolio changes.
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
            background: "rgba(16, 185, 129, 0.1)",
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Projected Return (Ann.)
          </h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#10b981" }}>
            {data.projected_return !== undefined
              ? formatPercent(data.projected_return)
              : "N/A"}
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
            Projected Risk (Vol.)
          </h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#fbbf24" }}>
            {data.projected_risk !== undefined
              ? formatPercent(data.projected_risk)
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
