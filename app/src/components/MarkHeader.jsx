import { useEffect, useState } from "react";
import { marksOrder, markMeta } from "../data/subjectPack";

function useElapsedSeconds(startedAt) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

function formatClock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function dotColor(markKey, currentIndex, answers) {
  const idx = marksOrder.indexOf(markKey);
  if (idx === currentIndex) return "var(--indigo)";
  if (idx > currentIndex) return null; // upcoming, uses rule color via CSS
  const answer = answers[markKey];
  if (!answer) return null;
  if (answer.accuracy >= 60) return "var(--green)";
  if (answer.accuracy > 0) return "var(--bronze)";
  return "var(--rust)";
}

export default function MarkHeader({ markIndex, phase, runningTotal, answers, markStartedAt }) {
  const elapsed = useElapsedSeconds(markStartedAt);
  const currentKey = marksOrder[markIndex];
  const meta = markMeta[currentKey];

  return (
    <div className="pm-mark-header">
      <div className="pm-mark-header__left">
        <span className="pm-mono-label pm-mark-header__label">
          MARK {markIndex + 1} OF 7 · {meta.label}
          {phase === "reveal" ? " · REVEAL" : ""}
        </span>
        <div className="pm-mark-rail" aria-hidden="true">
          {marksOrder.map((key) => {
            const color = dotColor(key, markIndex, answers);
            return (
              <span
                key={key}
                className="pm-mark-rail__dot"
                style={color ? { background: color } : undefined}
              />
            );
          })}
        </div>
      </div>
      <div className="pm-mark-header__right">
        {phase === "select" && <span className="pm-mark-header__timer">{formatClock(elapsed)}</span>}
        <span className="pm-mark-header__score">{runningTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}

export { useElapsedSeconds };
