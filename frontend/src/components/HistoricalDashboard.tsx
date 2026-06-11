import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: {
    historical_data: Array<{
      date: string;
      [symbol: string]: any;
    }>;
  };
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

export default function HistoricalDashboard({ data }: Props) {
  const chartData = data?.historical_data || [];

  if (chartData.length === 0) {
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
          <h2>Historical Price Trends</h2>
          <p style={{ marginTop: "1rem" }}>
            No historical price data found for the selected range.
          </p>
        </div>
      </div>
    );
  }

  // Extract symbols (all keys in the first data point except "date")
  const symbols = Object.keys(chartData[0]).filter((key) => key !== "date");

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
          Historical Price Trends
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Historical daily closing prices for your holdings in Indian Rupees
          (₹).
        </p>
      </div>

      <div style={{ flex: 1, minHeight: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--glass-border)"
              vertical={false}
            />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis
              stroke="var(--text-secondary)"
              domain={["auto", "auto"]}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--bg-dark)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [
                `₹${value.toFixed(2)}`,
                "Close Price",
              ]}
            />
            <Legend verticalAlign="bottom" height={36} />
            {symbols.map((sym, index) => (
              <Line
                key={sym}
                type="monotone"
                dataKey={sym}
                stroke={COLORS[index % COLORS.length]}
                dot={false}
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
