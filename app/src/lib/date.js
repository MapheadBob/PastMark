// Daily reset boundary is midnight UTC (DESIGN.md leaves this "still written
// as midnight UTC" pending the PRD's open question on player-local vs UTC).
export function todayUtcKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function yesterdayUtcKey(now = new Date()) {
  const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return todayUtcKey(d);
}

export function msUntilNextUtcMidnight(now = new Date()) {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatLongDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);
}
