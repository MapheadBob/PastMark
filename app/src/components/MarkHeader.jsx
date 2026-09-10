import { useEffect, useState } from "react";
import { marksOrder } from "../data/subjectPack";
import { markColor } from "../lib/markColors";
import MarkTag from "./MarkTag";

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

// Mark progress rail: filled with the mark's own category color once its
// mark is reached (current or completed), translucent cream while still
// upcoming — identity, not accuracy (Design Standard §Component patterns:
// "Mark progress").
function dotColor(markKey, currentIndex) {
  const idx = marksOrder.indexOf(markKey);
  if (idx > currentIndex) return null; // upcoming — default translucent cream
  return markColor(markKey).bg;
}

export default function MarkHeader({ markIndex, phase, runningTotal, markStartedAt }) {
  const elapsed = useElapsedSeconds(markStartedAt);
  const currentKey = marksOrder[markIndex];

  return (
    <div className="pm-mark-header">
      <div className="pm-mark-header__left">
        <img className="pm-mark-header__mark" src="/pastmark-mark.png" alt="" aria-hidden="true" />
        <span className="pm-eyebrow pm-mark-header__label">
          MARK {markIndex + 1} OF 7
          {phase === "reveal" ? " · REVEAL" : ""}
        </span>
        <MarkTag markKey={currentKey} />
        <div className="pm-mark-rail" aria-hidden="true">
          {marksOrder.map((key) => {
            const color = dotColor(key, markIndex);
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
