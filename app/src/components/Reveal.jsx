export function FeedbackBanner({ headline, subline, positive }) {
  return (
    <div className={"pm-feedback-banner " + (positive ? "pm-feedback-banner--pos" : "pm-feedback-banner--neg")}>
      <span className="pm-feedback-banner__icon">{positive ? "✓" : "✕"}</span>
      <div className="pm-feedback-banner__text">
        <span className="pm-feedback-banner__headline">{headline}</span>
        <span className="pm-feedback-banner__subline">{subline}</span>
      </div>
    </div>
  );
}

export function AccuracyRow({ label, accuracy, positive }) {
  return (
    <div className="pm-accuracy-row">
      <div className="pm-accuracy-row__labels">
        <span>{label}</span>
        <span style={{ color: positive ? "var(--green)" : "var(--rust)" }}>{accuracy}%</span>
      </div>
      <div className="pm-accuracy-row__track">
        <div
          className="pm-accuracy-row__fill"
          style={{
            width: Math.max(3, accuracy) + "%",
            background: positive ? "var(--green)" : "var(--rust)",
          }}
        />
      </div>
    </div>
  );
}

export function BreakdownPanel({ accuracyLabel, accuracy, basePoints, bonus, seconds, total, positive, nextLabel, onNext, discoveryTag, extraTag }) {
  return (
    <div className="pm-breakdown pm-card">
      <span className="pm-mono-label pm-breakdown__title">BREAKDOWN</span>
      <AccuracyRow label={accuracyLabel} accuracy={accuracy} positive={positive} />
      <div className="pm-breakdown__line">
        <span>Base points</span>
        <span>{basePoints}</span>
      </div>
      <div className="pm-breakdown__line">
        <span>Speed bonus{seconds != null ? ` · ${seconds}s` : ""}</span>
        <span>{bonus > 0 ? `+${bonus}` : "—"}</span>
      </div>
      <div className="pm-breakdown__rule" />
      <div className="pm-breakdown__total">
        <span>Points this Mark</span>
        <span style={{ color: positive ? undefined : "var(--rust)" }}>{total.toLocaleString()}</span>
      </div>
      {(discoveryTag || extraTag) && (
        <div className="pm-breakdown__tags">
          {discoveryTag && <span className="pm-tag pm-tag--bronze">+1 DISCOVERY · {discoveryTag.toUpperCase()}</span>}
          {extraTag && <span className="pm-tag">{extraTag}</span>}
        </div>
      )}
      <div className="pm-breakdown__spacer" />
      <button type="button" className="pm-btn" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}
