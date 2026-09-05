export default function ActionBar({ hint, children }) {
  return (
    <div className="pm-action-bar">
      {hint && <span className="pm-action-bar__hint">{hint}</span>}
      {children}
    </div>
  );
}
