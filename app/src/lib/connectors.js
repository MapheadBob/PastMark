// Pair-identity colors for the Match mark. Each color's only job is to link
// one left item, its connector line, and its right item — never anything
// else, so it can't be confused with the accuracy palette (green/rust) or
// the interaction palette (indigo/oxblood).
const PAIR_COLORS = ["var(--match-1)", "var(--match-2)", "var(--match-3)", "var(--match-4)", "var(--match-5)", "var(--match-6)"];

export function pairColor(index) {
  return PAIR_COLORS[index % PAIR_COLORS.length];
}

// Spreads each pair's elbow (the vertical jog in its connector) across the
// gap between columns, keyed by the pair's stable left-index rather than its
// current on-screen row — so two connectors never bend at the same x, even
// when their endpoints sit close together, and lines stay visually
// distinguishable instead of stacking into one diagonal band.
export function elbowFraction(index, total) {
  if (total <= 1) return 0.5;
  const spread = 0.4; // stays within the middle 40%-60%..30%-70% band
  return 0.5 - spread / 2 + (index / (total - 1)) * spread;
}

// A rounded right-angle connector: out horizontally from (x1,y1), a single
// bend at midX, then horizontally into (x2,y2). Reads as a deliberate
// "wiring diagram" link rather than a straight line, which is what keeps
// near-parallel pairs from visually merging.
export function elbowPath(x1, y1, x2, y2, midX, radius = 12) {
  const dirX = midX >= x1 ? 1 : -1;
  const dirY = y2 >= y1 ? 1 : -1;
  const rx = Math.max(0, Math.min(radius, Math.abs(midX - x1), Math.abs(x2 - midX)));
  const ry = Math.max(0, Math.min(radius, Math.abs(y2 - y1) / 2));

  if (ry === 0) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  return [
    `M ${x1} ${y1}`,
    `L ${midX - dirX * rx} ${y1}`,
    `Q ${midX} ${y1} ${midX} ${y1 + dirY * ry}`,
    `L ${midX} ${y2 - dirY * ry}`,
    `Q ${midX} ${y2} ${midX + dirX * rx} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");
}
