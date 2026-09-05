import { useMemo, useState } from "react";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { matchAccuracy, markScore } from "../lib/scoring";
import { useGameDispatch } from "../state/GameContext";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MarkMatch({ session }) {
  const dispatch = useGameDispatch();
  const { prompt, pairs, blurb } = subjectPack.match;
  const rightItems = useMemo(
    () => shuffle(pairs.map((p, i) => ({ id: i, text: p.right }))),
    []
  );
  const [matches, setMatches] = useState({}); // leftIndex -> rightId
  const [pendingLeft, setPendingLeft] = useState(null);
  const answer = session.answers.match;
  const isReveal = session.phase === "reveal";

  const pairedCount = Object.keys(matches).length;
  const matchedRightIds = new Set(Object.values(matches));

  const handleLeftClick = (idx) => {
    if (matches[idx] !== undefined) {
      const next = { ...matches };
      delete next[idx];
      setMatches(next);
      setPendingLeft(null);
      return;
    }
    setPendingLeft(idx);
  };

  const handleRightClick = (rightId) => {
    if (pendingLeft === null || matchedRightIds.has(rightId)) return;
    setMatches({ ...matches, [pendingLeft]: rightId });
    setPendingLeft(null);
  };

  const handleClear = () => {
    setMatches({});
    setPendingLeft(null);
  };

  const handleSubmit = () => {
    const seconds = Math.round(((Date.now() - session.markStartedAt) / 1000) * 10) / 10;
    const correctPairs = pairs.filter((_, idx) => matches[idx] === idx).length;
    const accuracy = matchAccuracy(correctPairs, pairs.length);
    const score = markScore({ accuracy, seconds });
    dispatch({
      type: "LOCK_IN_ANSWER",
      markKey: "match",
      answer: {
        accuracy,
        seconds,
        correctPairs,
        totalPairs: pairs.length,
        discovery: subjectPack.match.discovery,
        ...score,
      },
    });
  };

  if (isReveal && answer) {
    const positive = answer.accuracy === 100;
    return (
      <div className="pm-mark-screen">
        <div className="pm-reveal-split">
          <div className="pm-reveal-visual pm-reveal-visual--match">
            <div className="pm-match-columns pm-match-columns--reveal">
              {pairs.map((p, idx) => {
                const rightId = matches[idx];
                const correct = rightId === idx;
                return (
                  <div key={p.left} className={"pm-match-pair-row " + (correct ? "pm-match-pair-row--correct" : "pm-match-pair-row--incorrect")}>
                    <span>{p.left}</span>
                    <span className="pm-mono-label">{correct ? "✓" : "✕"}</span>
                    <span>{p.right}</span>
                  </div>
                );
              })}
            </div>
            <p className="pm-when-hint">{blurb}</p>
          </div>
          <BreakdownPanel
            accuracyLabel={`${answer.correctPairs} of ${answer.totalPairs} pairs`}
            accuracy={answer.accuracy}
            basePoints={answer.basePoints}
            bonus={answer.bonus}
            seconds={answer.seconds}
            total={answer.total}
            positive={positive}
            nextLabel="See Results"
            onNext={() => dispatch({ type: "ADVANCE_MARK" })}
            discoveryTag={answer.discovery}
          />
        </div>
        <div className="pm-reveal-banner-wrap">
          <FeedbackBanner
            headline={positive ? "All four paired" : `${answer.correctPairs} of ${answer.totalPairs} correct`}
            subline={blurb}
            positive={positive}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pm-mark-screen">
      <div className="pm-mark-prompt-band">
        <span className="pm-mono-label pm-mark-prompt-band__kicker">PARTIAL CREDIT — EACH CORRECT PAIR EARNS ITS SHARE</span>
        <h2 className="pm-mark-prompt-band__prompt">{prompt}</h2>
      </div>
      <div className="pm-option-grid-wrap">
        <div className="pm-match-header">
          <span>RULER</span>
          <span>DEED</span>
        </div>
        <div className="pm-match-columns">
          <div className="pm-match-column">
            {pairs.map((p, idx) => (
              <button
                key={p.left}
                type="button"
                className={
                  "pm-match-item" +
                  (matches[idx] !== undefined ? " pm-match-item--matched" : "") +
                  (pendingLeft === idx ? " pm-match-item--pending" : "")
                }
                onClick={() => handleLeftClick(idx)}
              >
                {p.left}
              </button>
            ))}
          </div>
          <div className="pm-match-column">
            {rightItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  "pm-match-item" +
                  (matchedRightIds.has(item.id) ? " pm-match-item--matched" : "")
                }
                disabled={matchedRightIds.has(item.id)}
                onClick={() => handleRightClick(item.id)}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
        <div className="pm-match-status">
          <span>
            {pairedCount} of {pairs.length} paired
            {pendingLeft !== null ? ` · ${pairs[pendingLeft].left} selected, now pick a deed` : ""}
          </span>
          <button type="button" className="pm-match-clear" onClick={handleClear}>
            CLEAR PAIRS
          </button>
        </div>
      </div>
      <ActionBar>
        <button type="button" className="pm-btn" disabled={pairedCount < pairs.length} onClick={handleSubmit}>
          {pairedCount < pairs.length ? "Pair all four to submit" : "Submit"}
        </button>
      </ActionBar>
    </div>
  );
}
