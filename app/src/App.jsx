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

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
