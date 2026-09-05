import { useRef, useState } from "react";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { whenAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

function headlineFor(yearsOff) {
  if (yearsOff === 0) return "Exactly right";
  if (yearsOff <= 5) return `${yearsOff} year${yearsOff === 1 ? "" : "s"} out`;
  if (yearsOff <= 20) return "Close on the timeline";
  return "Off by a wide margin";
}

export default function MarkWhen({ session }) {
  const dispatch = useGameDispatch();
  const { min, max, trueYear, tags, prompt, blurb } = subjectPack.when;
  const [year, setYear] = useState(Math.round((min + max) / 2));
  const answer = session.answers.when;
  const isReveal = session.phase === "reveal";
  const trackRef = useRef(null);

  const percent = ((year - min) / (max - min)) * 100;

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
    const yourPct = ((year - min) / (max - min)) * 100;
    const truePct = ((trueYear - min) / (max - min)) * 100;
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--timeline">
            <div className="pm-timeline-recap">
              <div className="pm-timeline-recap__track" />
              <div className="pm-timeline-recap__marker pm-timeline-recap__marker--you" style={{ left: `${yourPct}%` }}>
                <span className="pm-mono-label">YOU · {year}</span>
                <span className="pm-timeline-recap__dot" />
              </div>
              <div className="pm-timeline-recap__marker pm-timeline-recap__marker--true" style={{ left: `${truePct}%` }}>
                <span className="pm-timeline-recap__dot" />
                <span className="pm-mono-label">ACTUAL · {trueYear}</span>
              </div>
              <span className="pm-timeline-recap__bound pm-timeline-recap__bound--min">{min}</span>
              <span className="pm-timeline-recap__bound pm-timeline-recap__bound--max">{max}</span>
            </div>
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
          <FeedbackBanner headline={headlineFor(answer.yearsOff)} subline={blurb} positive={positive} />
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
