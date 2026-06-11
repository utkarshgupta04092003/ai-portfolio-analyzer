import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
    benchmark_total_return?: number;
    benchmark_annualized_return?: number;
    alpha?: number;
    beta?: number;
  };
}

export default function PerformanceDashboard({ data }: Props) {
  // Format data for Recharts
  const chartData = [
    {
      name: "Total Return",
      Portfolio: Number((data.total_return * 100).toFixed(2)),
      Benchmark:
        data.benchmark_total_return !== undefined
          ? Number((data.benchmark_total_return * 100).toFixed(2))
          : 0,
    },
    {
      name: "Annualized Return",
      Portfolio: Number((data.annualized_return * 100).toFixed(2)),
      Benchmark:
        data.benchmark_annualized_return !== undefined
          ? Number((data.benchmark_annualized_return * 100).toFixed(2))
          : 0,
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
          Portfolio performance compared against the **Nifty 50** index
          benchmark.
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {/* Sharpe Ratio Card */}
        <div
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            padding: "1.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.15)",
            flex: 1,
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            Sharpe Ratio
          </h3>
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "var(--accent-primary)",
              marginTop: "0.25rem",
            }}
          >
            {data.sharpe_ratio?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Jensen's Alpha Card */}
        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            padding: "1.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            flex: 1,
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            Jensen's Alpha (α)
          </h3>
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#10b981",
              marginTop: "0.25rem",
            }}
          >
            {data.alpha !== undefined
              ? `${(data.alpha * 100).toFixed(2)}%`
              : "0.00%"}
          </p>
        </div>

        {/* CAPM Beta Card */}
        <div
          style={{
            background: "rgba(139, 92, 246, 0.08)",
            padding: "1.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(139, 92, 246, 0.15)",
            flex: 1,
          }}
        >
          <h3
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            CAPM Beta (β)
          </h3>
          <p
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#8b5cf6",
              marginTop: "0.25rem",
            }}
          >
            {data.beta !== undefined ? data.beta.toFixed(2) : "1.00"}
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
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="Portfolio"
              fill="var(--accent-primary)"
              radius={[6, 6, 0, 0]}
            />
            <Bar dataKey="Benchmark" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
