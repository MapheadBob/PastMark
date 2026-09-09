import { accuracyTier } from "../lib/markColors";

const COLOR_VAR = {
  green: "var(--green)",
  rust: "var(--rust)",
};

// Binary accuracy — green at or above half credit, rust below it (Design
// Standard: no third "partial" tier). `isMatch` no longer changes the rule;
// kept as a parameter so every call site doesn't need to change at once.
export function tierToColor(accuracy) {
  return accuracyTier(accuracy);
}

export default function ResultSquares({ marks, size = 34 }) {
  return (
    <div className="pm-result-squares">
      {marks.map((m) => (
        <span
          key={m.key}
          className="pm-result-square"
          style={{ width: size, height: size, background: COLOR_VAR[m.color] }}
          title={m.key}
        />
      ))}
    </div>
  );
}
