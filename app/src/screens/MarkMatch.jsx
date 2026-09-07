import { useLayoutEffect, useMemo, useRef, useState } from "react";
import ActionBar from "../components/ActionBar";
import { FeedbackBanner, BreakdownPanel, FactNote } from "../components/Reveal";
import { subjectPack } from "../data/subjectPack";
import { matchAccuracy, markScore } from "../lib/scoring";
import { pairColor, elbowFraction, elbowPath } from "../lib/connectors";
import { useGameDispatch } from "../state/GameContext";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Measures the paired left/right buttons inside `wrapRef` and produces one
// angled connector path per pair, colored by `colorFor(leftIndex)`. Recomputes
// on every match change and on layout/resize so the lines never drift off
// their buttons.
// `mode` is a stable primitive ("identity" | "correctness") rather than a
// callback, so it can sit in the effect's dependency array without ever
// changing reference and re-triggering itself — a colorFor function
// recreated every render would retrigger this effect on every one of its
// own setPaths() calls, i.e. an infinite loop.
function useConnectorPaths({ wrapRef, leftRefs, rightRefs, matches, totalPairs, mode }) {
  const [paths, setPaths] = useState([]);

  useLayoutEffect(() => {
    const wrapEl = wrapRef.current;
    if (!wrapEl) return;

    const recompute = () => {
      const containerRect = wrapEl.getBoundingClientRect();
      const next = [];
      Object.entries(matches).forEach(([leftIdxStr, rightId]) => {
        const leftIdx = Number(leftIdxStr);
        const leftEl = leftRefs.current[leftIdx];
        const rightEl = rightRefs.current[rightId];
        if (!leftEl || !rightEl) return;
        const l = leftEl.getBoundingClientRect();
        const r = rightEl.getBoundingClientRect();
        const x1 = l.right - containerRect.left;
        const y1 = l.top + l.height / 2 - containerRect.top;
        const x2 = r.left - containerRect.left;
        const y2 = r.top + r.height / 2 - containerRect.top;
        const midX = x1 + (x2 - x1) * elbowFraction(leftIdx, totalPairs);
        const color = mode === "correctness" ? (matches[leftIdx] === leftIdx ? "var(--green)" : "var(--rust)") : pairColor(leftIdx);
        next.push({ key: leftIdx, d: elbowPath(x1, y1, x2, y2, midX), color });
      });
      setPaths(next);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrapEl);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
    // leftRefs/rightRefs/wrapRef are stable ref objects, safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, totalPairs, mode]);

  return paths;
}

function ConnectorSvg({ paths }) {
  return (
    <svg className="pm-match-svg" aria-hidden="true">
      {paths.map((p) => (
        <path key={p.key} d={p.d} stroke={p.color} className="pm-match-svg__path" />
      ))}
    </svg>
  );
}

export default function MarkMatch({ session }) {
  const dispatch = useGameDispatch();
  const { prompt, pairs, fact, commentary } = subjectPack.match;
  const rightItems = useMemo(
    () => shuffle(pairs.map((p, i) => ({ id: i, text: p.right }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const answer = session.answers.match;
  const isReveal = session.phase === "reveal";
  // leftIndex -> rightId. Once an answer exists the mark is immutable, so on
  // an initial mount mid-reveal (e.g. the page was reloaded) rehydrate the
  // pairing from the persisted answer rather than starting from empty —
  // otherwise every pair would render as unmatched/incorrect regardless of
  // what was actually submitted.
  const [matches, setMatches] = useState(() => answer?.matches ?? {});
  const [pendingLeft, setPendingLeft] = useState(null);

  const wrapRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});

  const pairedCount = Object.keys(matches).length;
  const matchedRightIds = new Set(Object.values(matches));
  const rightToLeftIdx = {};
  Object.entries(matches).forEach(([l, r]) => {
    rightToLeftIdx[r] = Number(l);
  });

  const paths = useConnectorPaths({
    wrapRef,
    leftRefs,
    rightRefs,
    matches,
    totalPairs: pairs.length,
    mode: isReveal ? "correctness" : "identity",
  });

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
        matches,
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
            <div className="pm-match-wrap" ref={wrapRef}>
              <div className="pm-match-columns">
                <div className="pm-match-column">
                  {pairs.map((p, idx) => {
                    const correct = matches[idx] === idx;
                    return (
                      <div
                        key={p.left}
                        ref={(el) => (leftRefs.current[idx] = el)}
                        className={"pm-match-item pm-match-item--resolved " + (correct ? "pm-match-item--correct" : "pm-match-item--incorrect")}
                      >
                        <span className={"pm-match-badge " + (correct ? "pm-match-badge--correct" : "pm-match-badge--incorrect")}>
                          {correct ? "✓" : "✕"}
                        </span>
                        {p.left}
                      </div>
                    );
                  })}
                </div>
                <div className="pm-match-column">
                  {rightItems.map((item) => {
                    const leftIdx = rightToLeftIdx[item.id];
                    const correct = leftIdx === item.id;
                    return (
                      <div
                        key={item.id}
                        ref={(el) => (rightRefs.current[item.id] = el)}
                        className={"pm-match-item pm-match-item--resolved " + (correct ? "pm-match-item--correct" : "pm-match-item--incorrect")}
                      >
                        {item.text}
                        <span className={"pm-match-badge pm-match-badge--right " + (correct ? "pm-match-badge--correct" : "pm-match-badge--incorrect")}>
                          {correct ? "✓" : "✕"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <ConnectorSvg paths={paths} />
            </div>
            <FactNote fact={fact} />
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
        <span className="pm-mono-label pm-mark-prompt-band__kicker">PARTIAL CREDIT — EACH CORRECT PAIR EARNS ITS SHARE</span>
        <h2 className="pm-mark-prompt-band__prompt">{prompt}</h2>
      </div>
      <div className="pm-option-grid-wrap">
        <div className="pm-match-header">
          <span>RULER</span>
          <span>DEED</span>
        </div>
        <div className="pm-match-wrap" ref={wrapRef}>
          <div className="pm-match-columns">
            <div className="pm-match-column">
              {pairs.map((p, idx) => {
                const matched = matches[idx] !== undefined;
                const color = matched ? pairColor(idx) : undefined;
                return (
                  <button
                    key={p.left}
                    ref={(el) => (leftRefs.current[idx] = el)}
                    type="button"
                    className={
                      "pm-match-item" +
                      (matched ? " pm-match-item--linked" : "") +
                      (pendingLeft === idx ? " pm-match-item--pending" : "")
                    }
                    style={matched ? { borderColor: color } : undefined}
                    onClick={() => handleLeftClick(idx)}
                  >
                    {matched && (
                      <span className="pm-match-badge" style={{ background: color }}>
                        {idx + 1}
                      </span>
                    )}
                    {p.left}
                  </button>
                );
              })}
            </div>
            <div className="pm-match-column">
              {rightItems.map((item) => {
                const matched = matchedRightIds.has(item.id);
                const color = matched ? pairColor(rightToLeftIdx[item.id]) : undefined;
                return (
                  <button
                    key={item.id}
                    ref={(el) => (rightRefs.current[item.id] = el)}
                    type="button"
                    className={"pm-match-item" + (matched ? " pm-match-item--linked" : "")}
                    style={matched ? { borderColor: color } : undefined}
                    disabled={matched}
                    onClick={() => handleRightClick(item.id)}
                  >
                    {item.text}
                    {matched && (
                      <span className="pm-match-badge pm-match-badge--right" style={{ background: color }}>
                        {rightToLeftIdx[item.id] + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <ConnectorSvg paths={paths} />
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
