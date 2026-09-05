// Accuracy decay curves and the speed bonus are marked as open questions in
// the PRD ("exact distance/year thresholds and point tiers... need a designed
// curve and playtesting"). These constants are a reasonable placeholder tuned
// to land near the design mockups' worked numbers (34km -> ~97%, 4yr -> ~96%),
// not a validated production curve. The decay *shape* and distance/year
// tiers are intentionally tighter than GeoIQ's own 50km-perfect/5000km-max
// curve — PastMark's Pin Mark grades landmark-precision guesses, not
// country-scale ones, so the same shared distance math (below) is tuned to a
// different radius here.
import { distanceKm } from "./geo";

export const MAX_MARK_POINTS = 1000;
const PIN_DECAY_KM = 1100;
const WHEN_DECAY_YEARS = 130;

export const haversineKm = distanceKm;

function decayAccuracy(distance, decayConstant) {
  const raw = 100 * Math.exp(-distance / decayConstant);
  return Math.max(3, Math.round(raw));
}

export function pinAccuracy(placed, trueLocation) {
  const distanceKm = haversineKm(placed, trueLocation);
  return { distanceKm: Math.round(distanceKm), accuracy: decayAccuracy(distanceKm, PIN_DECAY_KM) };
}

export function whenAccuracy(guessYear, trueYear) {
  const yearsOff = Math.abs(guessYear - trueYear);
  return { yearsOff, accuracy: decayAccuracy(yearsOff, WHEN_DECAY_YEARS) };
}

export function binaryAccuracy(isCorrect) {
  return isCorrect ? 100 : 0;
}

export function matchAccuracy(correctPairs, totalPairs) {
  return Math.round((correctPairs / totalPairs) * 100);
}

// A modest, capped bonus for a fast lock-in; no forced cutoff (per DESIGN.md
// "Speed is a bonus, never a threat" and the PRD's soft-cap requirement).
export function speedBonus(basePoints, seconds) {
  const factor = Math.max(0, 1 - seconds / 25);
  return Math.round(basePoints * 0.3 * factor);
}

export function markScore({ accuracy, seconds }) {
  const basePoints = Math.round((accuracy / 100) * MAX_MARK_POINTS);
  const bonus = accuracy > 0 ? speedBonus(basePoints, seconds) : 0;
  return { basePoints, bonus, total: basePoints + bonus };
}
