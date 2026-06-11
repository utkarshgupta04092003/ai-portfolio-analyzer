import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    total_return: number;
    annualized_return: number;
    sharpe_ratio: number;
  };
}

export default function PerformanceDashboard({ data }: Props) {
  // Format data for Recharts
  const chartData = [
    {
      name: "Total Return",
      value: Number((data.total_return * 100).toFixed(2)),
    },
    {
      name: "Annualized",
      value: Number((data.annualized_return * 100).toFixed(2)),
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
          Performance Dashboard
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Deterministic metrics powered by historical price data.
        </p>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
        <div
          style={{
            background: "rgba(59, 130, 246, 0.1)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            flex: 1,
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              textTransform: "uppercase",
            }}
          >
            Sharpe Ratio
          </h3>
          <p
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--accent-primary)",
            }}
          >
            {data.sharpe_ratio?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--glass-border)"
              vertical={false}
            />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis
              stroke="var(--text-secondary)"
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-dark)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}%`, "Return"]}
            />
            <Bar
              dataKey="value"
              fill="var(--accent-primary)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
