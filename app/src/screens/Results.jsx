import { markMeta } from "../data/subjectPack";
import { tierToColor } from "../components/ResultSquares";
import { useGameDispatch, useGameState } from "../state/GameContext";

export default function Results() {
  const { profile } = useGameState();
  const dispatch = useGameDispatch();
  const result = profile.lastResult;
  if (!result) {
    dispatch({ type: "GO_TO", screen: "landing" });
    return null;
  }

  const squareEmoji = { green: "🟩", rust: "🟥", bronze: "🟨" };
  const sharePreview = result.marks
    .map((m) => squareEmoji[tierToColor(m.accuracy, m.key === "match")])
    .join("");

  return (
    <div className="pm-app pm-results">
      <div className="pm-results__top">
        <div className="pm-results__top-left">
          <span className="pm-mono-label">
            TODAY'S THEME · DAILY {result.dailyNumber} · {Math.floor(result.durationSeconds / 60)} MIN {result.durationSeconds % 60} S
          </span>
          <div className="pm-results__theme">{result.theme}</div>
          <div className="pm-results__score">{result.totalScore.toLocaleString()}</div>
          <span className="pm-results__score-note">
            {result.baseTotal.toLocaleString()} base plus {result.speedTotal.toLocaleString()} speed, across seven Marks
          </span>
        </div>
        <div className="pm-results__streak">
          <div className="pm-results__streak-num">{result.streak}</div>
          <div>
            <div className="pm-results__streak-label">Streak continued</div>
            <div className="pm-results__streak-sub">New subject tomorrow</div>
          </div>
        </div>
      </div>

      <div className="pm-results__body">
        <div className="pm-results__main">
          <div className="pm-card pm-results__marks-card">
            <span className="pm-mono-label">THE SEVEN MARKS</span>
            <div className="pm-results__marks-row">
              {result.marks.map((m) => (
                <span
                  key={m.key}
                  className="pm-results__mark-block"
                  style={{ background: `var(--${tierToColor(m.accuracy, m.key === "match")})` }}
                />
              ))}
            </div>
            <div className="pm-results__marks-labels">
              {result.marks.map((m) => (
                <span key={m.key}>{markMeta[m.key].label}</span>
              ))}
            </div>
          </div>
          <div className="pm-results__stats-row">
            <div className="pm-card pm-side-card">
              <span className="pm-mono-label">TODAY'S AVERAGE</span>
              <span className="pm-results__stat-num">{result.averageScore.toLocaleString()}</span>
              <span style={{ color: "var(--green)" }}>you beat {result.beatPercent}% of players</span>
            </div>
            <div className="pm-card pm-side-card pm-side-card--bronze">
              <span className="pm-mono-label" style={{ color: "var(--bronze)" }}>COLLECTIONS ADVANCED</span>
              <span className="pm-results__stat-num" style={{ color: "var(--bronze)" }}>{result.collectionsAdvanced.length}</span>
              <span>{result.collectionsAdvanced.join(", ") || "None this time"}</span>
            </div>
          </div>
        </div>
        <div className="pm-results__side">
          <button type="button" className="pm-btn">Share result</button>
          <button type="button" className="pm-btn pm-btn--ghost" onClick={() => dispatch({ type: "GO_TO", screen: "summary" })}>
            See answer summary
          </button>
          <div className="pm-card pm-side-card">
            <span className="pm-mono-label">SHARE PREVIEW</span>
            <span className="pm-mono-label" style={{ letterSpacing: 0, textTransform: "none" }}>
              PastMark {result.dailyNumber} — {result.theme}
              <br />
              {result.totalScore.toLocaleString()}
              <br />
              {sharePreview}
            </span>
            <span className="pm-side-card__note">Theme name, score and accuracy squares — never the answers.</span>
          </div>
          <button type="button" className="pm-btn pm-btn--ghost" onClick={() => dispatch({ type: "GO_TO", screen: "landing" })}>
            Back to today
          </button>
        </div>
      </div>
    </div>
  );
}
