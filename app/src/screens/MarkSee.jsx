import { useState } from "react";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel, FactNote } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { binaryAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

const LETTERS = ["A", "B", "C", "D"];

export default function MarkSee({ session }) {
  const dispatch = useGameDispatch();
  const { prompt, options, correctIndex, fact, commentary } = subjectPack.see;
  const [selected, setSelected] = useState(null);
  const answer = session.answers.see;
  const isReveal = session.phase === "reveal";

  const handleLockIn = () => {
    if (selected === null) return;
    const seconds = Math.round(((Date.now() - session.markStartedAt) / 1000) * 10) / 10;
    const isCorrect = selected === correctIndex;
    const accuracy = binaryAccuracy(isCorrect);
    const score = markScore({ accuracy, seconds });
    dispatch({
      type: "LOCK_IN_ANSWER",
      markKey: "see",
      answer: { accuracy, seconds, selectedIndex: selected, discovery: null, ...score },
    });
  };

  if (isReveal && answer) {
    const positive = answer.accuracy === 100;
    const yourOption = options[answer.selectedIndex];
    const correctOption = options[correctIndex];
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--see">
            <div className="pm-see-compare">
              <div className={"pm-see-card " + (positive ? "pm-see-card--hidden" : "pm-see-card--incorrect")}>
                {!positive && (
                  <>
                    <div className="pm-see-card__image">{yourOption.caption}</div>
                    <div className="pm-see-card__body">
                      <span className="pm-mono-label" style={{ color: "var(--rust)" }}>✕ YOUR PICK</span>
                      <span>{yourOption.label}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="pm-see-card pm-see-card--correct">
                <div className="pm-see-card__image">{correctOption.caption}</div>
                <div className="pm-see-card__body">
                  <span className="pm-mono-label" style={{ color: "var(--green)" }}>✓ CORRECT ANSWER</span>
                  <span>{correctOption.label}</span>
                </div>
              </div>
            </div>
            <FactNote fact={fact} />
          </div>
          <BreakdownPanel
            accuracyLabel="Knowledge"
            accuracy={answer.accuracy}
            basePoints={answer.basePoints}
            bonus={answer.bonus}
            seconds={answer.seconds}
            total={answer.total}
            positive={positive}
            nextLabel="Next Mark — Era"
            onNext={() => dispatch({ type: "ADVANCE_MARK" })}
          />
        </div>
        <div className="pm-reveal-banner-wrap">
          <FeedbackBanner
            headline={positive ? "Correct" : "Not this time"}
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
        <span className="pm-mono-label pm-mark-prompt-band__kicker">FOUR REAL LANDMARKS — ONE IS THIS CITY'S</span>
        <h2 className="pm-mark-prompt-band__prompt">{prompt}</h2>
      </div>
      <div className="pm-option-grid-wrap">
        <div className="pm-image-grid">
          {options.map((opt, idx) => (
            <button
              key={opt.label}
              type="button"
              className={"pm-image-option" + (selected === idx ? " pm-image-option--selected" : "")}
              onClick={() => setSelected(idx)}
            >
              <div className="pm-image-option__placeholder">{opt.caption}</div>
              <div className="pm-image-option__footer">
                {selected === idx ? `${LETTERS[idx]} · SELECTED` : LETTERS[idx]}
                {selected === idx && <span className="pm-image-option__check">✓</span>}
              </div>
            </button>
          ))}
        </div>
        <p className="pm-when-hint">Click an image to select it.</p>
      </div>
      <ActionBar>
        <button type="button" className="pm-btn" disabled={selected === null} onClick={handleLockIn}>
          {selected !== null ? `Lock In ${LETTERS[selected]}` : "Lock In"}
        </button>
      </ActionBar>
    </div>
  );
}
