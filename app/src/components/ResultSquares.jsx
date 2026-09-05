const COLOR_VAR = {
  green: "var(--green)",
  rust: "var(--rust)",
  bronze: "var(--bronze)",
};

export function tierToColor(accuracy, isMatch) {
  if (isMatch) {
    if (accuracy >= 100) return "green";
    if (accuracy > 0) return "bronze";
    return "rust";
  }
  if (accuracy >= 60) return "green";
  if (accuracy > 0) return "bronze";
  return "rust";
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
