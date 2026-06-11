import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SectorData {
  name: string;
  weight: number;
}

interface Props {
  data: {
    concentration_score: number;
    sectors: SectorData[];
  };
}

const COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

export default function SectorExposureDashboard({ data }: Props) {
  // Format data for Recharts Pie
  const chartData =
    data.sectors?.map((s) => ({
      name: s.name,
      value: Number((s.weight * 100).toFixed(2)),
    })) || [];

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
          Sector Exposure
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Visualize the diversification footprint of your portfolio.
        </p>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.2)",
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
            Concentration Score (HHI)
          </h3>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#10b981" }}>
            {data.concentration_score?.toFixed(3) || "0.000"}
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              marginTop: "0.5rem",
            }}
          >
            {data.concentration_score > 0.25
              ? "Highly Concentrated"
              : data.concentration_score > 0.15
                ? "Moderately Concentrated"
                : "Well Diversified"}
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-dark)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}%`, "Weight"]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
