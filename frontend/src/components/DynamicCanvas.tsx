import { useAppStore } from "@/store";
import CorrelationDashboard from "./CorrelationDashboard";
import FundamentalsDashboard from "./FundamentalsDashboard";
import GeneralDashboard from "./GeneralDashboard";
import HistoricalDashboard from "./HistoricalDashboard";
import PerformanceDashboard from "./PerformanceDashboard";
import RiskDashboard from "./RiskDashboard";
import SectorExposureDashboard from "./SectorExposureDashboard";
import SimulationDashboard from "./SimulationDashboard";

interface Props {
  onSelectPrompt?: (prompt: string) => void;
}

export default function DynamicCanvas({ onSelectPrompt }: Props) {
  const { activeCanvas, canvasPayload } = useAppStore();

  if (!canvasPayload) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "var(--text-primary)",
          }}
        >
          {activeCanvas || "Analysis"}
        </h2>
        <p>
          No data available yet. Please ask the AI a question to generate
          insights.
        </p>
      </div>
    );
  }

  // Factory logic to render the appropriate canvas
  switch (activeCanvas) {
    case "PerformanceDashboard":
      return <PerformanceDashboard data={canvasPayload} />;
    case "RiskDashboard":
      return <RiskDashboard data={canvasPayload} />;
    case "SectorExposure":
      return <SectorExposureDashboard data={canvasPayload} />;
    case "CorrelationMatrix":
      return <CorrelationDashboard data={canvasPayload} />;
    case "SimulationResults":
      return <SimulationDashboard data={canvasPayload} />;
    case "HistoricalDashboard":
      return <HistoricalDashboard data={canvasPayload} />;
    case "FundamentalsDashboard":
      return <FundamentalsDashboard data={canvasPayload} />;
    default:
      return (
        <GeneralDashboard
          data={canvasPayload}
          activeCanvas={activeCanvas}
          onSelectPrompt={onSelectPrompt}
        />
      );
  }
}
