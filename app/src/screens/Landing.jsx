import Masthead from "../components/Masthead";
import ResultSquares, { tierToColor } from "../components/ResultSquares";
import { marksOrder, markMeta, subjectPack } from "../data/subjectPack";
import { formatCountdown, formatLongDate, msUntilNextUtcMidnight } from "../lib/date";
import { useGameDispatch, useGameState } from "../state/GameContext";

function CollectionsPreview({ collections, onViewAll }) {
  return (
    <div className="pm-card pm-side-card">
      <div className="pm-side-card__header">
        <span className="pm-mono-label">COLLECTIONS</span>
        <button type="button" className="pm-link" onClick={onViewAll}>
          View all
        </button>
      </div>
      {Object.entries(collections).map(([name, { discovered, total }]) => (
        <div key={name} className="pm-collection-row">
          <div className="pm-collection-row__labels">
            <span>{name}</span>
            <span className="pm-mono-label">{discovered}/{total}</span>
          </div>
          <div className="pm-collection-row__track">
            <div className="pm-collection-row__fill" style={{ width: `${(discovered / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function YesterdayCard({ yesterday }) {
  if (!yesterday) return null;
  return (
    <div className="pm-card pm-side-card">
      <span className="pm-mono-label">YESTERDAY · {yesterday.theme.toUpperCase()}</span>
      <div className="pm-yesterday-score">
        <span>{yesterday.score.toLocaleString()}</span>
        <span className="pm-mono-label">Daily {yesterday.dailyNumber}</span>
      </div>
      <div className="pm-yesterday-squares">
        {yesterday.squares.map((color, idx) => (
          <span key={idx} className={`pm-yesterday-square pm-yesterday-square--${color}`} />
        ))}
      </div>
    </div>
  );
}

function NotStarted({ profile, dispatch }) {
  return (
    <div className="pm-landing__grid">
      <div className="pm-card pm-landing-hero">
        <span className="pm-mono-label pm-landing-hero__date">{formatLongDate()} · DAILY {subjectPack.dailyNumber}</span>
        <h1 className="pm-landing-hero__title">Seven Marks. One subject.</h1>
        <p className="pm-landing-hero__body">
          One place, person or event, from seven angles — where it was, when it turned, what it
          became, what came after. The same subject for every player today. Close counts.
        </p>
        <div className="pm-mark-chips">
          {marksOrder.map((key, i) => (
            <span key={key} className="pm-mark-chip">
              {i + 1} {markMeta[key].label}
            </span>
          ))}
        </div>
        <div className="pm-landing-hero__cta">
          <button type="button" className="pm-btn" onClick={() => dispatch({ type: "START_SESSION" })}>
            Play Today's PastMark
          </button>
          <span className="pm-landing-hero__meta">About five minutes</span>
        </div>
        <span className="pm-landing-hero__note">Today's subject stays hidden until Mark 1.</span>
      </div>
      <div className="pm-landing__side">
        <CollectionsPreview collections={profile.collections} onViewAll={() => dispatch({ type: "GO_TO", screen: "collections" })} />
        <YesterdayCard yesterday={profile.yesterday} />
      </div>
    </div>
  );
}

function InProgress({ session, dispatch }) {
  const idx = session.markIndex;
  return (
    <div className="pm-landing__center">
      <div className="pm-card pm-landing-progress">
        <div className="pm-landing-progress__top">
          <span className="pm-mono-label">IN PROGRESS · DAILY {subjectPack.dailyNumber} · {subjectPack.theme.toUpperCase()}</span>
          <span className="pm-mono-label pm-landing-progress__saved">PROGRESS SAVED</span>
        </div>
        <div className="pm-landing-progress__mid">
          <span className="pm-landing-progress__title">Mark {idx + 1} of 7</span>
          <div className="pm-landing-progress__score">
            <span>Score so far</span>
            <span className="pm-landing-progress__score-num">{session.runningTotal.toLocaleString()}</span>
          </div>
        </div>
        <div className="pm-mark-rail pm-mark-rail--landing">
          {marksOrder.map((key, i) => {
            const answer = session.answers[key];
            let color = "var(--rule)";
            if (i === idx) color = "var(--indigo)";
            else if (answer) color = `var(--${tierToColor(answer.accuracy, key === "match")})`;
            return <span key={key} className="pm-mark-rail__dot pm-mark-rail__dot--lg" style={{ background: color }} />;
          })}
        </div>
        <div className="pm-mark-rail__labels">
          {marksOrder.map((key, i) => (
            <span key={key} className={i === idx ? "pm-mark-rail__label--active" : ""}>
              {markMeta[key].label}
            </span>
          ))}
        </div>
        <div className="pm-landing-progress__rule" />
        <div className="pm-landing-progress__bottom">
          <span>
            Your first {idx} Mark{idx === 1 ? "" : "s"} {idx === 1 ? "is" : "are"} locked in and safe.
          </span>
          <button type="button" className="pm-btn" onClick={() => dispatch({ type: "RESUME_SESSION" })}>
            Continue — Mark {idx + 1} of 7
          </button>
        </div>
      </div>
    </div>
  );
}

function Completed({ profile, dispatch }) {
  const result = profile.lastResult;
  const ms = msUntilNextUtcMidnight();
  return (
    <div className="pm-landing__grid">
      <div className="pm-card pm-landing-hero">
        <span className="pm-mono-label">TODAY'S THEME · DAILY {subjectPack.dailyNumber}</span>
        <div className="pm-landing-hero__theme">{subjectPack.theme}</div>
        <div className="pm-landing-progress__rule" />
        <div className="pm-landing-hero__score-row">
          <span className="pm-landing-hero__score">{result ? result.totalScore.toLocaleString() : "—"}</span>
          <span>your score</span>
        </div>
        {result && <ResultSquares marks={result.marks.map((m) => ({ key: m.key, color: tierToColor(m.accuracy, m.key === "match") }))} />}
        <p className="pm-landing-hero__body">
          Today's subject is done. A new subject unlocks at midnight UTC — <span className="pm-mono-label" style={{ letterSpacing: 0 }}>{formatCountdown(ms)}</span>.
        </p>
        <div className="pm-landing-hero__cta">
          <button type="button" className="pm-btn pm-btn--ghost" onClick={() => dispatch({ type: "GO_TO", screen: "results" })}>
            See results
          </button>
          <button type="button" className="pm-btn pm-btn--dark">
            Share your result
          </button>
        </div>
      </div>
      <div className="pm-landing__side">
        {result && result.collectionsAdvanced.length > 0 && (
          <div className="pm-card pm-side-card pm-side-card--bronze">
            <span className="pm-mono-label" style={{ color: "var(--bronze)" }}>NEW DISCOVERIES</span>
            {Object.entries(profile.collections)
              .filter(([name]) => result.collectionsAdvanced.includes(name))
              .map(([name, { discovered, total }]) => (
                <span key={name}>{name} · {discovered}/{total}</span>
              ))}
            <span className="pm-side-card__note">One subject, three collections advanced.</span>
          </div>
        )}
        <div className="pm-card pm-side-card">
          <span className="pm-mono-label">TODAY'S AVERAGE</span>
          <div className="pm-yesterday-score">
            <span>{result ? result.averageScore.toLocaleString() : "—"}</span>
            <span style={{ color: "var(--green)" }}>you beat {result?.beatPercent ?? 0}%</span>
          </div>
        </div>
        <div className="pm-card pm-side-card">
          <span className="pm-mono-label">STREAK</span>
          <span className="pm-side-card__note">{profile.streak} days</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { status, profile, session } = useGameState();
  const dispatch = useGameDispatch();

  return (
    <div className="pm-app">
      <Masthead />
      <div className="pm-landing">
        {status === "not_started" && <NotStarted profile={profile} dispatch={dispatch} />}
        {status === "in_progress" && session && <InProgress session={session} dispatch={dispatch} />}
        {status === "completed" && <Completed profile={profile} dispatch={dispatch} />}
      </div>
    </div>
  );
}
