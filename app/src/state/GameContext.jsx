import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { marksOrder, subjectPack } from "../data/subjectPack";
import { todayUtcKey } from "../lib/date";
import { loadJSON, saveJSON, clearKey } from "../lib/storage";
import { defaultProfile, freshSession, TODAYS_AVERAGE_SCORE, TODAYS_BEAT_PERCENT } from "./gameData";

const GameStateContext = createContext(null);
const GameDispatchContext = createContext(null);

function computeInitialScreen(profile, session) {
  const today = todayUtcKey();
  if (profile.lastCompletedDay === today) return "landing";
  if (session && session.day === today) return "landing";
  return "landing";
}

function init() {
  const profile = loadJSON("profile", defaultProfile());
  const session = loadJSON("session", null);
  const today = todayUtcKey();
  const validSession = session && session.day === today ? session : null;
  return {
    profile,
    session: validSession,
    screen: computeInitialScreen(profile, validSession),
  };
}

function sessionStatus(state) {
  const today = todayUtcKey();
  if (state.profile.lastCompletedDay === today) return "completed";
  if (state.session && state.session.day === today) return "in_progress";
  return "not_started";
}

function finalizeSession(state, session) {
  const marks = marksOrder.map((key) => {
    const a = session.answers[key];
    return {
      key,
      ...a,
    };
  });
  const baseTotal = marks.reduce((sum, m) => sum + m.basePoints, 0);
  const speedTotal = marks.reduce((sum, m) => sum + m.bonus, 0);
  const totalScore = baseTotal + speedTotal;
  const durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);

  const discoveries = marks.filter((m) => m.discovery).map((m) => m.discovery);
  const collections = { ...state.profile.collections };
  discoveries.forEach((name) => {
    if (collections[name]) {
      collections[name] = {
        ...collections[name],
        discovered: Math.min(collections[name].total, collections[name].discovered + 1),
      };
    }
  });

  const today = todayUtcKey();
  const wasYesterday = state.profile.lastCompletedDay
    ? isConsecutiveDay(state.profile.lastCompletedDay, today)
    : false;
  const streak = wasYesterday ? state.profile.streak + 1 : 1;

  const result = {
    day: today,
    dailyNumber: subjectPack.dailyNumber,
    theme: subjectPack.theme,
    totalScore,
    baseTotal,
    speedTotal,
    durationSeconds,
    marks,
    streak,
    collectionsAdvanced: discoveries,
    averageScore: TODAYS_AVERAGE_SCORE,
    beatPercent: TODAYS_BEAT_PERCENT,
  };

  const newProfile = {
    ...state.profile,
    streak,
    lastCompletedDay: today,
    collections,
    lastResult: result,
    yesterday: state.profile.yesterday,
  };

  return newProfile;
}

function isConsecutiveDay(lastDay, today) {
  const last = new Date(lastDay + "T00:00:00Z").getTime();
  const cur = new Date(today + "T00:00:00Z").getTime();
  return cur - last === 24 * 60 * 60 * 1000;
}

function reducer(state, action) {
  switch (action.type) {
    case "START_SESSION": {
      if (!state.profile.seenExplainer) {
        return { ...state, screen: "explainer" };
      }
      return { ...state, session: freshSession(), screen: "mark" };
    }
    case "DISMISS_EXPLAINER": {
      return {
        ...state,
        profile: { ...state.profile, seenExplainer: true },
        session: freshSession(),
        screen: "mark",
      };
    }
    case "RESUME_SESSION": {
      return { ...state, screen: "mark" };
    }
    case "LOCK_IN_ANSWER": {
      const { markKey, answer } = action;
      const session = state.session;
      if (!session) return state;
      const nextAnswers = { ...session.answers, [markKey]: answer };
      const nextSession = {
        ...session,
        answers: nextAnswers,
        runningTotal: session.runningTotal + answer.total,
        phase: "reveal",
      };
      return { ...state, session: nextSession };
    }
    case "ADVANCE_MARK": {
      const session = state.session;
      if (!session) return state;
      const isLast = session.markIndex >= marksOrder.length - 1;
      if (isLast) {
        const newProfile = finalizeSession(state, session);
        return { ...state, profile: newProfile, session: null, screen: "results" };
      }
      const nextSession = {
        ...session,
        markIndex: session.markIndex + 1,
        phase: "select",
        markStartedAt: Date.now(),
      };
      return { ...state, session: nextSession };
    }
    case "GO_TO": {
      return { ...state, screen: action.screen };
    }
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    saveJSON("profile", state.profile);
  }, [state.profile]);

  useEffect(() => {
    if (state.session) saveJSON("session", state.session);
    else clearKey("session");
  }, [state.session]);

  const status = sessionStatus(state);

  const value = useMemo(() => ({ ...state, status }), [state, status]);

  return (
    <GameStateContext.Provider value={value}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error("useGameState must be used within GameProvider");
  return ctx;
}

export function useGameDispatch() {
  const ctx = useContext(GameDispatchContext);
  if (!ctx) throw new Error("useGameDispatch must be used within GameProvider");
  return ctx;
}
