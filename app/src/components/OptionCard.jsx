const LETTERS = ["A", "B", "C", "D"];

export default function OptionCard({
  index,
  label,
  selected,
  resolved, // "correct" | "incorrect" | undefined
  dimmed,
  onClick,
  variant = "text", // "text" | "image"
  caption,
}) {
  const letter = LETTERS[index];
  const classNames = ["pm-option", `pm-option--${variant}`];
  if (selected) classNames.push("pm-option--selected");
  if (resolved) classNames.push(`pm-option--${resolved}`);
  if (dimmed) classNames.push("pm-option--dimmed");

  return (
    <button
      type="button"
      className={classNames.join(" ")}
      onClick={onClick}
      disabled={!!resolved}
      aria-pressed={selected}
    >
      {variant === "image" ? (
        <div className="pm-option__image">
          <span>{caption}</span>
          {selected && !resolved && <span className="pm-option__check">✓</span>}
        </div>
      ) : null}
      <div className="pm-option__row">
        <span className="pm-option__letter">
          {resolved === "correct" ? "✓" : resolved === "incorrect" ? "✕" : letter}
        </span>
        <span className="pm-option__label">{label}</span>
      </div>
    </button>
  );
}
