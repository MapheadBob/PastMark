import { useGameState, useGameDispatch } from "../state/GameContext";

export default function Masthead() {
  const { profile, screen } = useGameState();
  const dispatch = useGameDispatch();
  const streakLit = profile.streak > 0;

  return (
    <header className="pm-masthead">
      <div className="pm-masthead__left">
        <span className="pm-masthead__wordmark">PastMark</span>
        <button
          type="button"
          className={"pm-masthead__nav-item" + (screen === "landing" ? " pm-masthead__nav-item--active" : "")}
          onClick={() => dispatch({ type: "GO_TO", screen: "landing" })}
        >
          DAILY
        </button>
        <button
          type="button"
          className="pm-masthead__nav-item"
          onClick={() => dispatch({ type: "GO_TO", screen: "collections" })}
        >
          COLLECTIONS
        </button>
        <span className="pm-masthead__nav-item pm-masthead__nav-item--static">STREAK</span>
      </div>
      <div className="pm-masthead__right">
        <div className={"pm-streak-pill" + (streakLit ? " pm-streak-pill--lit" : "")}>
          <span className="pm-streak-pill__dot" />
          <span>{profile.streak} DAY STREAK</span>
        </div>
        <div className="pm-avatar">EM</div>
      </div>
    </header>
  );
}
