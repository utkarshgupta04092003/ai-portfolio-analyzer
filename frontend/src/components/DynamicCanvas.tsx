import { useAppStore } from "@/store";
import CorrelationDashboard from "./CorrelationDashboard";
import GeneralDashboard from "./GeneralDashboard";
import PerformanceDashboard from "./PerformanceDashboard";
import RiskDashboard from "./RiskDashboard";
import SectorExposureDashboard from "./SectorExposureDashboard";
import SimulationDashboard from "./SimulationDashboard";

export default function DynamicCanvas() {
  const { activeCanvas, canvasPayload } = useAppStore();

  if (!canvasPayload) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
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
    default:
      return (
        <GeneralDashboard data={canvasPayload} activeCanvas={activeCanvas} />
      );
  }
}
