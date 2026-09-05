import { GameProvider, useGameState } from "./state/GameContext";
import Landing from "./screens/Landing";
import Explainer from "./screens/Explainer";
import MarkScreen from "./screens/MarkScreen";
import Results from "./screens/Results";
import AnswerSummary from "./screens/AnswerSummary";
import Collections from "./screens/Collections";

function Router() {
  const { screen } = useGameState();
  switch (screen) {
    case "explainer":
      return <Explainer />;
    case "mark":
      return <MarkScreen />;
    case "results":
      return <Results />;
    case "summary":
      return <AnswerSummary />;
    case "collections":
      return <Collections />;
    case "landing":
    default:
      return <Landing />;
  }
}

function ResetDemoButton() {
  const handleReset = () => {
    try {
      window.localStorage.removeItem("pastmark:profile");
      window.localStorage.removeItem("pastmark:session");
    } catch {
      // storage unavailable — nothing to clear
    }
    window.location.reload();
  };

  return (
    <button type="button" className="pm-reset-demo" onClick={handleReset} title="Clear today's progress and streak, start over">
      ↺ Reset demo
    </button>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Router />
      <ResetDemoButton />
    </GameProvider>
  );
}
