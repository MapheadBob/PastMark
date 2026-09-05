import Masthead from "../components/Masthead";
import { useGameDispatch, useGameState } from "../state/GameContext";

export default function Collections() {
  const { profile } = useGameState();
  const dispatch = useGameDispatch();

  return (
    <div className="pm-app">
      <Masthead />
      <div className="pm-collections">
        <h1 className="pm-collections__title">Collections</h1>
        <p className="pm-collections__lead">Every Subject you've discovered, grouped by the Collections it belongs to.</p>
        <div className="pm-collections__grid">
          {Object.entries(profile.collections).map(([name, { discovered, total }]) => (
            <div key={name} className="pm-card pm-collections__card">
              <span className="pm-mono-label">{name.toUpperCase()}</span>
              <div className="pm-collection-row__track" style={{ marginTop: 8 }}>
                <div className="pm-collection-row__fill" style={{ width: `${(discovered / total) * 100}%` }} />
              </div>
              <span className="pm-mono-label" style={{ letterSpacing: 0 }}>{discovered} / {total} discovered</span>
            </div>
          ))}
        </div>
        <button type="button" className="pm-btn pm-btn--ghost" onClick={() => dispatch({ type: "GO_TO", screen: "landing" })}>
          Back to today
        </button>
      </div>
    </div>
  );
}
