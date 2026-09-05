import { markMeta } from "../data/subjectPack";
import { tierToColor } from "../components/ResultSquares";
import { useGameDispatch, useGameState } from "../state/GameContext";

const WHAT_IT_ASKED = {
  pin: "Where the city stood",
  when: "When the name changed",
  know: "Its name today",
  see: "Its landmark",
  era: "Its era",
  succession: "What came after",
  match: "Rulers and their deeds",
};

function accuracyLine(mark) {
  if (mark.key === "pin") return `${mark.distanceKm} km · ${mark.accuracy}%`;
  if (mark.key === "when") return `${mark.yearsOff} years · ${mark.accuracy}%`;
  if (mark.key === "match") return `${mark.correctPairs} of ${mark.totalPairs} pairs · ${mark.accuracy}%`;
  return mark.accuracy === 100 ? `correct · 100%` : `missed · 0%`;
}

export default function AnswerSummary() {
  const { profile } = useGameState();
  const dispatch = useGameDispatch();
  const result = profile.lastResult;
  if (!result) {
    dispatch({ type: "GO_TO", screen: "landing" });
    return null;
  }

  return (
    <div className="pm-app pm-summary">
      <div className="pm-summary__top">
        <div>
          <div className="pm-summary__title">Answer summary</div>
          <span className="pm-mono-label" style={{ letterSpacing: 0, textTransform: "none" }}>
            {result.theme} · Daily {result.dailyNumber} · {Math.floor(result.durationSeconds / 60)} min {result.durationSeconds % 60} s
          </span>
        </div>
        <span className="pm-summary__score">{result.totalScore.toLocaleString()}</span>
      </div>

      <div className="pm-summary__body">
        <div className="pm-summary__stats">
          <div className="pm-card pm-side-card">
            <span className="pm-mono-label">PIN MISS</span>
            <span className="pm-results__stat-num">{result.marks[0]?.distanceKm ?? "—"} km</span>
          </div>
          <div className="pm-card pm-side-card">
            <span className="pm-mono-label">YEARS OFF · WHEN</span>
            <span className="pm-results__stat-num">{result.marks[1]?.yearsOff ?? "—"} years</span>
          </div>
          <div className="pm-card pm-side-card">
            <span className="pm-mono-label">SPEED BONUS EARNED</span>
            <span className="pm-results__stat-num">+{result.speedTotal.toLocaleString()}</span>
          </div>
          <div className="pm-card pm-side-card">
            <span className="pm-mono-label">ACCURACY BY MARK</span>
            <div className="pm-summary__accuracy-list">
              {result.marks.map((m) => (
                <div key={m.key} className="pm-summary__accuracy-row">
                  <span>{markMeta[m.key].title}</span>
                  <span style={{ color: `var(--${tierToColor(m.accuracy, m.key === "match")})` }}>{m.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="pm-btn pm-btn--ghost" onClick={() => dispatch({ type: "GO_TO", screen: "landing" })}>
            Back to today
          </button>
        </div>

        <div className="pm-card pm-summary__table">
          <div className="pm-summary__table-header">
            <span>#</span>
            <span>WHAT IT ASKED</span>
            <span>MARK</span>
            <span>ACCURACY</span>
            <span style={{ textAlign: "right" }}>POINTS</span>
          </div>
          {result.marks.map((m, idx) => (
            <div key={m.key} className="pm-summary__table-row">
              <span
                className="pm-summary__table-index"
                style={{ background: `var(--${tierToColor(m.accuracy, m.key === "match")})` }}
              >
                {idx + 1}
              </span>
              <span>{WHAT_IT_ASKED[m.key]}</span>
              <span className="pm-mono-label" style={{ letterSpacing: 0 }}>{markMeta[m.key].label}</span>
              <span style={{ color: `var(--${tierToColor(m.accuracy, m.key === "match")})` }}>{accuracyLine(m)}</span>
              <span style={{ textAlign: "right", fontWeight: 600 }}>{m.total.toLocaleString()}</span>
            </div>
          ))}
          <div className="pm-summary__table-total">
            <span>Total</span>
            <span>{result.totalScore.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
