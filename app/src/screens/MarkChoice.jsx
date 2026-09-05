import { useEffect, useState } from "react";
import OptionCard from "../components/OptionCard";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel } from "../components/Reveal";
import { binaryAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

const LETTERS = ["A", "B", "C", "D"];

export default function MarkChoice({ session, markKey, data, kicker, markNumber, nextLabel, contextBanner }) {
  const dispatch = useGameDispatch();
  const [selected, setSelected] = useState(null);
  const answer = session.answers[markKey];
  const isReveal = session.phase === "reveal";

  useEffect(() => {
    setSelected(null);
  }, [markKey]);

  useEffect(() => {
    if (isReveal) return;
    const handler = (e) => {
      const idx = LETTERS.indexOf(e.key.toUpperCase());
      if (idx !== -1 && idx < data.options.length) setSelected(idx);
      if (e.key === "Enter" && selected !== null) handleLockIn(selected);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, isReveal]);

  const handleLockIn = (idx) => {
    const pick = idx ?? selected;
    if (pick === null) return;
    const seconds = Math.round(((Date.now() - session.markStartedAt) / 1000) * 10) / 10;
    const isCorrect = pick === data.correctIndex;
    const accuracy = binaryAccuracy(isCorrect);
    const score = markScore({ accuracy, seconds });
    dispatch({
      type: "LOCK_IN_ANSWER",
      markKey,
      answer: {
        accuracy,
        seconds,
        selectedIndex: pick,
        discovery: isCorrect ? data.discovery ?? null : null,
        ...score,
      },
    });
  };

  if (isReveal && answer) {
    const positive = answer.accuracy === 100;
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--choice">
            <div className={"pm-option-resolved " + (positive ? "pm-option-resolved--correct" : "pm-option-resolved--incorrect")}>
              <span className="pm-option-resolved__letter">{LETTERS[answer.selectedIndex]}</span>
              <div className="pm-option-resolved__text">
                <span className="pm-option-resolved__label">{data.options[answer.selectedIndex]}</span>
                <span className="pm-mono-label pm-option-resolved__tag">
                  YOUR ANSWER · {positive ? "CORRECT" : "INCORRECT"}
                </span>
              </div>
            </div>
            {!positive && (
              <div className="pm-option-resolved pm-option-resolved--correct">
                <span className="pm-option-resolved__letter">{LETTERS[data.correctIndex]}</span>
                <div className="pm-option-resolved__text">
                  <span className="pm-option-resolved__label">{data.options[data.correctIndex]}</span>
                  <span className="pm-mono-label pm-option-resolved__tag">CORRECT ANSWER</span>
                </div>
              </div>
            )}
            <p className="pm-when-hint">{data.blurb}</p>
          </div>
          <BreakdownPanel
            accuracyLabel="Knowledge"
            accuracy={answer.accuracy}
            basePoints={answer.basePoints}
            bonus={answer.bonus}
            seconds={answer.seconds}
            total={answer.total}
            positive={positive}
            nextLabel={nextLabel}
            onNext={() => dispatch({ type: "ADVANCE_MARK" })}
            discoveryTag={answer.discovery}
          />
        </div>
        <div className="pm-reveal-banner-wrap">
          <FeedbackBanner headline={positive ? "Correct" : "Not this time"} subline={positive ? "Full knowledge credit, and you were quick about it." : "No credit on this Mark — your total stands."} positive={positive} />
        </div>
      </div>
    );
  }

  return (
    <div className="pm-mark-screen">
      <div className="pm-mark-prompt-band">
        {contextBanner}
        <span className="pm-mono-label pm-mark-prompt-band__kicker">{kicker}</span>
        <h2 className="pm-mark-prompt-band__prompt">{data.prompt}</h2>
      </div>
      <div className="pm-option-grid-wrap">
        <div className="pm-option-grid">
          {data.options.map((label, idx) => (
            <OptionCard
              key={label}
              index={idx}
              label={label}
              selected={selected === idx}
              dimmed={selected !== null && selected !== idx}
              onClick={() => setSelected(idx)}
            />
          ))}
        </div>
        <p className="pm-when-hint">
          {selected === null ? "Click an option, or press A–D." : "Click another option to change your mind before locking in."}
        </p>
      </div>
      <ActionBar hint={selected !== null ? "Or press Enter" : undefined}>
        <button type="button" className="pm-btn" disabled={selected === null} onClick={() => handleLockIn()}>
          {selected !== null ? `Lock In ${LETTERS[selected]}` : "Lock In"}
        </button>
      </ActionBar>
    </div>
  );
}
