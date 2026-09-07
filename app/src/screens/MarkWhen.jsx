import { useEffect, useRef, useState } from "react";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel, FactNote } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { whenAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

const REVEAL_DURATION_MS = 1400;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function headlineFor(yearsOff) {
  if (yearsOff === 0) return "Exactly right";
  if (yearsOff <= 5) return `${yearsOff} year${yearsOff === 1 ? "" : "s"} out`;
  if (yearsOff <= 20) return "Close on the timeline";
  return "Off by a wide margin";
}

// Animates the reveal's traveling marker + year ticker from the player's
// guess to the true year. Runs once per reveal; respects reduced-motion.
function useYearTravel({ from, to, active }) {
  const [displayYear, setDisplayYear] = useState(from);
  const [progress, setProgress] = useState(0);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!active || hasRunRef.current) return;
    hasRunRef.current = true;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || from === to) {
      setDisplayYear(to);
      setProgress(1);
      return;
    }

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / REVEAL_DURATION_MS);
      const eased = easeInOutCubic(t);
      setProgress(eased);
      setDisplayYear(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplayYear(to);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, from, to]);

  return { displayYear, progress, arrived: progress >= 1 };
}

export default function MarkWhen({ session }) {
  const dispatch = useGameDispatch();
  const { min, max, trueYear, tags, prompt, fact, commentary } = subjectPack.when;
  const [year, setYear] = useState(Math.round((min + max) / 2));
  const answer = session.answers.when;
  const isReveal = session.phase === "reveal";
  const trackRef = useRef(null);

  const percent = ((year - min) / (max - min)) * 100;

  const { displayYear, progress, arrived } = useYearTravel({
    from: year,
    to: trueYear,
    active: isReveal && !!answer,
  });

  const handleLockIn = () => {
    const seconds = Math.round(((Date.now() - session.markStartedAt) / 1000) * 10) / 10;
    const { yearsOff, accuracy } = whenAccuracy(year, trueYear);
    const score = markScore({ accuracy, seconds });
    dispatch({
      type: "LOCK_IN_ANSWER",
      markKey: "when",
      answer: { accuracy, yearsOff, seconds, discovery: null, ...score },
    });
  };

  if (isReveal && answer) {
    const positive = answer.accuracy >= 60;
    const pctFor = (y) => ((y - min) / (max - min)) * 100;
    const guessPct = pctFor(year);
    const truePct = pctFor(trueYear);
    const dotPct = pctFor(displayYear);
    const fillLeft = Math.min(guessPct, dotPct);
    const fillWidth = Math.abs(dotPct - guessPct);
    const laterDirection = trueYear > year ? "later" : trueYear < year ? "earlier" : null;
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--timeline">
            <div className="pm-timeline-recap">
              <div className="pm-timeline-recap__track" />
              <div className="pm-timeline-recap__fill" style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }} />
              <div className="pm-timeline-recap__marker pm-timeline-recap__marker--ghost" style={{ left: `${guessPct}%` }}>
                <span className="pm-mono-label">YOUR GUESS · {year}</span>
                <span className="pm-timeline-recap__dot pm-timeline-recap__dot--ghost" />
              </div>
              <div
                className={
                  "pm-timeline-recap__marker pm-timeline-recap__marker--true" +
                  (arrived ? " pm-timeline-recap__marker--arrived" : "")
                }
                style={{ left: `${truePct}%` }}
              >
                <span className="pm-timeline-recap__dot" />
                <span className="pm-mono-label">ACTUAL · {trueYear}</span>
              </div>
              <div className="pm-timeline-recap__traveler" style={{ left: `${dotPct}%` }} aria-hidden="true">
                <span className="pm-timeline-recap__traveler-year">{displayYear}</span>
                <span className="pm-timeline-recap__traveler-dot" />
              </div>
              <span className="pm-mono-label pm-timeline-recap__bound pm-timeline-recap__bound--min">{min}</span>
              <span className="pm-mono-label pm-timeline-recap__bound pm-timeline-recap__bound--max">{max}</span>
            </div>
            {laterDirection && (
              <p className={"pm-timeline-recap__delta" + (arrived ? " pm-timeline-recap__delta--in" : "")}>
                {answer.yearsOff} year{answer.yearsOff === 1 ? "" : "s"} {laterDirection}
              </p>
            )}
            <FactNote fact={fact} />
          </div>
          <BreakdownPanel
            accuracyLabel="Time accuracy"
            accuracy={answer.accuracy}
            basePoints={answer.basePoints}
            bonus={answer.bonus}
            seconds={answer.seconds}
            total={answer.total}
            positive={positive}
            nextLabel="Next Mark — Know"
            onNext={() => dispatch({ type: "ADVANCE_MARK" })}
          />
        </div>
        <div className="pm-reveal-banner-wrap">
          <FeedbackBanner
            headline={headlineFor(answer.yearsOff)}
            subline={commentary[positive ? "positive" : "negative"]}
            positive={positive}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pm-mark-screen">
      <div className="pm-mark-prompt-band">
        <span className="pm-mono-label pm-mark-prompt-band__kicker">MARK 2 · TIME</span>
        <h2 className="pm-mark-prompt-band__prompt">{prompt}</h2>
      </div>
      <div className="pm-when-content">
        <div className="pm-when-answer">
          <span className="pm-mono-label">YOUR ANSWER</span>
          <span className="pm-when-answer__year">{year}</span>
        </div>
        <div
          ref={trackRef}
          className="pm-slider"
          role="slider"
          tabIndex={0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={year}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setYear((y) => Math.max(min, y - 1));
            if (e.key === "ArrowRight") setYear((y) => Math.min(max, y + 1));
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const move = (ev) => {
              const rect = trackRef.current.getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
              setYear(Math.round(min + ratio * (max - min)));
            };
            move(e);
            const up = () => window.removeEventListener("pointermove", move);
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up, { once: true });
          }}
        >
          <div className="pm-slider__track" />
          <div className="pm-slider__fill" style={{ width: `${percent}%` }} />
          <div className="pm-slider__handle" style={{ left: `${percent}%` }} />
        </div>
        <div className="pm-slider__bounds">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <div className="pm-when-tags">
          {tags.map((tag) => (
            <span key={tag} className="pm-mono-label pm-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="pm-when-hint">Drag the handle to your year, or use the arrow keys. Closer years score higher.</p>
      </div>
      <ActionBar>
        <button type="button" className="pm-btn" onClick={handleLockIn}>
          Lock In {year}
        </button>
      </ActionBar>
    </div>
  );
}
