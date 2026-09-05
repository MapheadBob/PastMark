import { todayUtcKey, yesterdayUtcKey } from "../lib/date";

export function defaultProfile() {
  return {
    streak: 12,
    lastCompletedDay: yesterdayUtcKey(),
    seenExplainer: false,
    collections: {
      "Byzantine Empire": { discovered: 17, total: 20 },
      "Ottoman Empire": { discovered: 9, total: 24 },
      "World Capitals": { discovered: 31, total: 60 },
    },
    yesterday: {
      dailyNumber: 411,
      theme: "Machu Picchu",
      score: 5940,
      squares: ["green", "green", "rust", "green", "bronze", "green", "green"],
    },
    lastResult: null,
  };
}

export function freshSession() {
  return {
    day: todayUtcKey(),
    markIndex: 0,
    phase: "select",
    startedAt: Date.now(),
    markStartedAt: Date.now(),
    answers: {},
    runningTotal: 0,
  };
}

// Today's cohort comparison is a flat mock (P1 "comparison stats" feature has
// no real backend to aggregate against in this frontend-only build).
export const TODAYS_AVERAGE_SCORE = 5100;
export const TODAYS_BEAT_PERCENT = 72;
