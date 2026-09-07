// One distinct color per Mark category (PastMark Design Standard §Category
// color tokens). Always rendered as a filled pill — never bare colored text —
// so the same tag reads identically in the mark header, the progress rail
// and every results row.
export const MARK_COLORS = {
  pin: { bg: "#A9763F", fg: "#1F2B2E" },
  when: { bg: "#3F5E73", fg: "#F2EBDD" },
  know: { bg: "#A6402C", fg: "#F2EBDD" },
  see: { bg: "#6B4E71", fg: "#F2EBDD" },
  era: { bg: "#B8863A", fg: "#1F2B2E" },
  succession: { bg: "#6B8E4E", fg: "#1F2B2E" },
  match: { bg: "#7C3247", fg: "#F2EBDD" },
};

export function markColor(markKey) {
  return MARK_COLORS[markKey] ?? { bg: "var(--muted-ink)", fg: "var(--card)" };
}

// Accuracy is binary: green at or above half credit, rust below it — no
// third "partial" tier (Design Standard: "accuracy in green (>=50%) or
// rust (<50%)").
export function accuracyTier(accuracy) {
  return accuracy >= 50 ? "green" : "rust";
}

export function accuracyVar(accuracy) {
  return `var(--${accuracyTier(accuracy)})`;
}
