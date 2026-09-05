import { marksOrder, markMeta } from "../data/subjectPack";
import { useGameDispatch } from "../state/GameContext";

export default function Explainer() {
  const dispatch = useGameDispatch();
  const dismiss = () => dispatch({ type: "DISMISS_EXPLAINER" });

  return (
    <div className="pm-explainer">
      <div className="pm-explainer__inner">
        <div className="pm-explainer__top">
          <div className="pm-explainer__heading">
            <span className="pm-mono-label" style={{ color: "var(--bronze)" }}>BEFORE YOUR FIRST MARK</span>
            <h1 className="pm-explainer__title">One subject. Seven angles.</h1>
            <p className="pm-explainer__lead">
              Today's seven Marks are all about one place, person or event — and most are graded on
              how near you got, not just whether you nailed it.
            </p>
          </div>
          <button type="button" className="pm-explainer__skip" onClick={dismiss}>
            Skip
          </button>
        </div>

        <div className="pm-explainer-card">
          <span className="pm-mono-label" style={{ color: "var(--muted-paper)" }}>THE ORDER NEVER CHANGES</span>
          <div className="pm-explainer-order">
            {marksOrder.map((key) => (
              <div key={key} className="pm-explainer-order__item">
                <span className="pm-explainer-order__bar" />
                <span className="pm-mono-label">{markMeta[key].label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-explainer-grid">
          <div className="pm-explainer-card">
            <span className="pm-mono-label" style={{ color: "var(--muted-paper)" }}>PIN &amp; WHEN</span>
            <p>A pin 4 km off the mark scores 98%. The right country alone scores far less.</p>
          </div>
          <div className="pm-explainer-card">
            <span className="pm-mono-label" style={{ color: "var(--muted-paper)" }}>KNOW, SEE, ERA &amp; SUCCESSION</span>
            <p>Four-option multiple choice, all or nothing. Match pays per correct pair.</p>
          </div>
          <div className="pm-explainer-card">
            <span className="pm-mono-label" style={{ color: "var(--muted-paper)" }}>SPEED</span>
            <p>A modest bonus for answering quickly. No clock forces you.</p>
          </div>
        </div>

        <button type="button" className="pm-btn" onClick={dismiss}>
          Start Mark 1 — Pin
        </button>
      </div>
    </div>
  );
}
