# PastMark — Daily Gameplay PRD

**Status:** Draft v1
**Owner:** TBD (Product)
**Scope:** PastMark Daily — the core gameplay loop, mechanics, and scoring/progression tactics
**Explicitly out of scope:** Account creation, authentication, and subscription/billing — these are assumed to be fully covered by Bronze Atlas infrastructure and are not addressed in this spec.

---

## Problem Statement

History trivia products today force a binary right/wrong judgment on inherently graded knowledge — someone who knows a battle happened "somewhere in France" and someone who knows the exact village both get scored identically to someone who guessed. That flattens the skill expression the format could otherwise reward, and it produces the same generic "quiz app" experience players have seen dozens of times, with nothing distinctive to share. PastMark's map-based interaction model (dropping a pin, placing a date on a timeline) creates a natural mechanism for graded accuracy instead of pass/fail, and a daily-cadence format creates the shared, comparable moment ("I got 8,420 today, how'd you do?") that drives the organic sharing loop successful daily-puzzle products rely on. Without a well-defined gameplay loop and scoring model, PastMark is just another trivia app with a map skin instead of a genuinely differentiated format.

## Goals

1. Ship a complete, playable PastMark Daily loop — open app → play 5–10 Marks across all five core mechanics → see a graded score → return tomorrow.
2. Make "how right" (graded accuracy), not just "right or wrong," the central scoring feeling across every mechanic that supports it.
3. Drive daily return behavior: target a meaningful percentage of players who complete a Daily Challenge coming back to play the next day's challenge (streak-driven).
4. Create a shareable result moment that costs the player near-zero effort (one tap) and communicates a comparable, specific score.
5. Lay a progression foundation (Collections, streaks) that gives long-session players a reason to keep playing beyond the ~5-minute daily session, without requiring Explore or Challenge modes to exist yet.

## Non-Goals

- **Explore mode** (choose Era/Region/Topic/Difficulty) — a real mode, but a separate spec once Daily is validated. Building it now risks diluting focus on getting the core loop right.
- **Challenge mode** (timed competitive play) — depends on concepts (Rank, head-to-head/leaderboards) that aren't defined yet; separate initiative.
- **Account, authentication, sign-up, and subscription/paywall flows** — per the stated assumption, this is Bronze Atlas's responsibility. This spec assumes a valid, identified player session exists by the time gameplay starts.
- **Content authoring/CMS workflow** — how Marks get written, fact-checked, geocoded, and scheduled is real work but a different workstream. This spec treats daily content as a data dependency (see Open Questions) rather than designing the authoring pipeline.
- **Leaderboards / competitive Rank ladder** — the overview doc's "Rank → competitive standing" concept is tied to Challenge mode, which is out of scope. Lightweight, non-competitive comparison (e.g., "today's average score") is in scope as P1; ranked leaderboards are not.
- **Friends / social graph** (following other players, head-to-head results) — sharing in v1 is one-way (generate a shareable result), not a social graph feature. Revisit once Bronze Atlas's account layer defines what social primitives (if any) it exposes.

## User Stories

### New Player
- As a first-time player, I want to understand what to do on my very first Mark without reading instructions, so that I don't bounce before I experience the "aha" of graded accuracy scoring.
- As a first-time player, I want to see *why* my pin or date got the score it did, so that I learn how the grading works from the very first Mark.

### Daily-Habit Player
- As a returning player, I want to see immediately whether I've already played today's challenge, so that I don't waste a click trying to replay it.
- As a returning player, I want my streak to be visible and to update the moment I finish a challenge, so that I feel the momentum of consecutive days.
- As a returning player, I want my progress mid-challenge to survive a refresh or accidental tab close, so that a technical hiccup doesn't cost me a day's streak.
- As a returning player, I want to see which historical topics I've "discovered" over time, so that I have a reason to keep playing beyond just the daily score.

### Social Sharer
- As a player who just finished, I want to generate a shareable result in one tap that shows my score without spoiling the answers for people who haven't played yet, so that I can post it without feeling like I ruined the game for a friend.
- As a player, I want to see how my score compares to other players today, so that sharing my result feels like a comparison, not just a number in a vacuum.

### Edge Cases
- As a player who lost connectivity mid-Mark, I want my in-progress answer to be preserved locally and submitted once connectivity returns, so that I don't lose credit for a Mark I already answered.
- As a player who opens the app after the daily reset has occurred, I want to be dropped into the *new* day's challenge (not a stale cached one), so that I'm never scored against yesterday's Marks.
- As a player with a motor or visual accessibility need, I want every mechanic (including map pin-drop) to be operable via keyboard and screen reader, so that the map mechanic doesn't lock me out of the product.

## Core Gameplay Loop (Session Workflow)

This is the primary "5-minute session" flow referenced in the overview doc, spelled out end to end.

**1. Home / Entry**
Player lands on Home. A single Daily card is the primary, default focus of the screen. Its state reflects where the player is relative to today's challenge:
- *Not started:* "Play Today's PastMark" CTA.
- *In progress* (returning mid-session): "Continue — Mark 4 of 8."
- *Completed:* "Today's Score: 8,420 — see results," CTA leads to the results screen (read-only), not a replay.

**2. Challenge Start**
Tapping "Play" loads the day's fixed Mark set (5–10 Marks, same set for every player globally — see Requirements). First-time players see a brief, skippable one-screen explainer of "how scoring works" (P1); returning players skip straight to Mark 1.

**3. Per-Mark Loop** (repeats for each Mark in the set)
1. **Prompt** — the Mark's question/context is shown (text, and an image for See-type Marks).
2. **Interaction** — player provides an answer using the mechanic-specific input (map pin, timeline, multiple choice, image MC, or match pairs — see Mechanic Tactics below). Adjustments are allowed before the answer is locked in.
3. **Lock In** — an explicit confirm action submits the answer. This exists on every mechanic (not just Pin/Time) so the interaction model feels consistent, and so a mis-tap doesn't cost a Mark.
4. **Immediate Feedback** — the correct answer is revealed alongside the player's answer, the accuracy breakdown for that Mark (e.g., Location Accuracy 98%, Knowledge 100%), the points earned, and the running total for the session.
5. **Advance** — player taps to continue to the next Mark (no forced auto-advance timer, so players can absorb the "why" behind their score).

**4. Completion / Results**
After the final Mark, the player sees a Results screen:
- Total **Mark Score** for the day, plus the per-Mark breakdown that produced it.
- Updated streak count (with a visible "streak continued" or "new streak" state).
- Any Collections progress unlocked this session (e.g., "+3 discoveries in World War II").
- A one-tap **Share** action that generates a spoiler-free result summary (score + per-Mark accuracy icons, no correct answers revealed) suitable for pasting into any channel.
- (P1) A lightweight comparison, e.g., "Today's average score: 6,100 — you beat 72% of players."

**5. Return to Home**
Daily card now reflects the completed state until the next daily reset. Streak and Collections are visible from persistent navigation, independent of whether the player starts another session that day.

## Mechanic Tactics

Each Mark is authored as exactly one of five mechanics. All five must ship in v1 Daily (per scope decision — no mechanic is deferred).

### PIN — "Where?"
- Full-screen interactive world map (pan via drag, zoom via scroll/pinch).
- Player taps to drop a pin; pin can be dragged to adjust before locking in; one confirmed placement per Mark.
- Scored on **Location Accuracy**: graded by distance between the placed pin and the true location, using a tiered decay (closer = higher %), not binary right/wrong. Exact distance thresholds are a design/data question (see Open Questions) but the tiering should roughly mirror the overview doc's example (a pin a few km off scoring ~98%, versus a pin merely "in the right country" scoring meaningfully lower).
- Post-answer feedback shows both pins (player's and true) on the map so the miss distance is visually legible, not just a percentage.

### TIME — "When?"
- Horizontal timeline control with a draggable handle, plus a numeric year input for precision; range spans the plausible historical window for that Mark (default full range roughly 3000 BCE–present, but authored Marks may scope the visible range to keep the slider usable).
- Scored on **Time Accuracy**: graded by year-distance decay, same tiered-accuracy principle as Pin.

### KNOW — "What/Who?"
- Standard 4-option multiple choice, single-select, explicit "Lock In" confirm.
- Scored on **Knowledge**: binary — full credit for the correct option, zero for any other. No partial credit (there's no meaningful "how right" gradient for a single correct-answer MC question).

### SEE — "Identify from an image"
- Prominent image stimulus (artifact, painting, photo, map excerpt) with a 4-option multiple-choice answer, reusing the Know interaction pattern.
- Scored identically to Know (binary Knowledge credit). A tap-on-image "hotspot" interaction (e.g., "tap the artifact in this scene") is a plausible richer future variant but is P2 — not required for v1.

### MATCH — "Connect historical relationships"
- Two columns of 3–5 items each (e.g., empires ↔ capitals); tap one item per column to form a pair; matched pairs are visually confirmed (highlight/line).
- Submit once all items are paired.
- Scored with **partial credit**: correct pairs ÷ total pairs, unlike Know/See's binary scoring — this is the one non-Pin/Time mechanic that still has a "how right" gradient.

## Requirements

### P0 — Must-Have

**Daily Challenge structure**
- A single, server-defined set of 5–10 Marks is generated once per day and served identically to every player (no personalization/randomization of which Marks appear).
- *Acceptance:* Two different player sessions loading the Daily Challenge on the same calendar day receive the exact same ordered Mark set.
- A daily reset boundary exists after which a new Mark set becomes active and the previous day's challenge is no longer playable (only viewable via that day's saved results, if the player completed it).
- *Acceptance:* A session that starts the challenge before reset and finishes after reset still gets scored against the set it started (in-progress sessions aren't invalidated mid-play by a reset).

**All five mechanics implemented**
- Pin, Time, Know, See, and Match all ship with the interactions and scoring described under Mechanic Tactics.
- *Acceptance:* Each mechanic type has a working input UI, a lock-in/confirm step, a scoring computation, and a feedback state showing the correct answer.

**Mark Score computation**
- Each Mark has a defined maximum point value. Its score is composed of an accuracy component (mechanic-dependent: Location/Time decay tiers for Pin/Time, binary for Know/See, partial-credit ratio for Match) plus a speed component that rewards faster (but not rushed/reckless) responses within a soft cap.
- The Daily Mark Score is the sum of all Mark scores earned in that session.
- *Acceptance:* Given a completed Mark with a known accuracy tier and response time, the displayed score matches the defined formula; the session total equals the sum of per-Mark scores.

**Per-Mark and session feedback**
- After each Mark, the player sees the correct answer, their own answer, an accuracy breakdown, points earned, and the running total.
- *Acceptance:* Feedback is shown before advancing to the next Mark; running total updates immediately after each Mark, not just at session end.

**Results screen**
- Shows total Mark Score, per-Mark breakdown, and updated streak state.
- *Acceptance:* Reopening the app after completing today's challenge lands on this same Results screen (read-only), not a fresh challenge.

**Session resilience**
- In-progress answers and session position are preserved across a refresh, tab close, or brief network loss; an answer that was locked in but failed to submit is retried/queued rather than silently dropped.
- *Acceptance:* Refreshing mid-challenge resumes at the same Mark with prior Marks' scores intact.

**Streaks**
- Completing a Daily Challenge on consecutive calendar days increments a streak counter; missing a day resets it to zero (no grace period required for v1 — see Open Questions on whether a freeze is P1).
- *Acceptance:* Completing today and yesterday shows a streak of 2; completing today after a missed day shows a streak of 1.

**Sharing**
- One-tap generation of a spoiler-free result summary (score + per-Mark accuracy indicators, no correct answers or Mark content revealed) in a copyable/shareable format.
- *Acceptance:* The generated share content never includes the Mark prompts or correct answers, only the player's own score/accuracy summary.

**Collections (progression)**
- Every Mark is tagged with one or more topic/region/era categories at authoring time. Playing a Mark (regardless of score) marks it "discovered" within its associated collection(s).
- A persistent Collections view shows discovered/total counts per collection (e.g., "World War II: 43/50 discovered").
- *Acceptance:* Completing a Daily Challenge updates discovered counts for every collection any of that day's Marks belong to, and this state persists across sessions.

### P1 — Nice-to-Have (fast follow)

- **Comparison stats:** today's average Mark Score across all players, and/or a percentile, shown on the Results screen.
- **Speed bonus transparency:** explicitly break out the speed component in the per-Mark feedback, not just fold it into the total.
- **Onboarding explainer:** a skippable one-time "how scoring works" screen for first-time players.
- **Collections detail view:** browse a specific collection to see how many Marks remain undiscovered (without revealing their content).
- **Streak freeze/grace token:** protects a streak from a single missed day.
- **Practice/archive mode:** replay past days' Marks in a non-scoring context.
- **Accessibility pass:** keyboard-operable map pin placement and timeline control, screen-reader labeling for all five mechanics.

### P2 — Future Considerations (not built now, but shouldn't be architecturally foreclosed)

- Explore mode (Era/Region/Topic/Difficulty selection).
- Challenge mode (timed competitive play) and any associated Rank/leaderboard system.
- Image hotspot interaction for See-type Marks.
- Friends/social graph and head-to-head comparison.
- "Ages" as a literal navigable content structure (v1 Collections are tag-based, not a forced chronological progression — consistent with the overview doc's caution against making Ages a literal level-gate).

## Success Metrics

### Leading Indicators
- **Daily Challenge completion rate:** % of sessions that start Mark 1 and finish the full set. Target and measurement window TBD (no baseline exists pre-launch — treat as a hypothesis to validate, not a committed number).
- **Time to complete:** median time from challenge start to Results screen (sanity-checks the "5-minute session" framing from the overview doc).
- **Share rate:** % of completed sessions that trigger the share action.
- **Streak-start rate:** % of players who complete a second consecutive day after their first completion.

### Lagging Indicators
- **D7 / D30 retention** among players who complete at least one Daily Challenge.
- **Streak length distribution:** e.g., % of active players reaching a 7-day streak.
- **Collections depth over time:** average discovered-Mark count per active player at 30/60/90 days, as a proxy for whether the progression system is actually pulling people back beyond the daily habit alone.
- **Attributed return traffic from shares** (new sessions traceable to a shared result), pending whatever tracking Bronze Atlas's infrastructure supports.

Specific numeric targets are intentionally left open pending stakeholder input — see Open Questions.

## Open Questions

- **Daily reset boundary:** midnight UTC for all players, or player-local midnight? Affects fairness of "same challenge" claims and streak logic. *(Owner: product/engineering)*
- **Accuracy decay curves:** the exact distance/year thresholds and point tiers for Pin and Time scoring aren't specified here — need a designed curve (and playtesting) rather than an arbitrary formula. *(Owner: design/data)*
- **Per-Mark timing:** is there a hard time limit that forces submission, or is timing purely a soft speed-bonus input with no forced cutoff? The spec assumes no hard cutoff for v1, but this should be confirmed. *(Owner: design)*
- **Content pipeline dependency:** this spec assumes a steady supply of authored, fact-checked, geocoded Marks tagged with topic/region/era metadata is available on a daily cadence. Who produces this, at what volume, and how far in advance, is not addressed here and is a real dependency for launch readiness. *(Owner: content/product)*
- **Bronze Atlas data surface:** does the Bronze Atlas account layer expose whatever is needed to persist per-player gameplay state (streaks, Collections, session-in-progress), or does PastMark need its own gameplay datastore keyed off a Bronze Atlas identity? This spec assumes an identified player session exists but doesn't assume where gameplay state lives. *(Owner: engineering)*
- **Streak grace/freeze:** is a missed-day streak freeze a v1 requirement or genuinely P1? Placed as P1 here but flagging since streak loss is a common source of negative sentiment in daily-puzzle products. *(Owner: product)*
- **Comparison stats scope:** is a simple daily average enough, or does "compare to others" need segmentation (e.g., by region/friends) that would pull in social-graph questions currently marked out of scope? *(Owner: product)*
- **Accessibility target:** what compliance level (e.g., WCAG 2.1 AA) is required, particularly for the map/timeline mechanics, which are the hardest to make non-visual? *(Owner: design/legal)*
- **Success metric targets:** the leading/lagging indicators above need real numeric targets before launch; none are set here. *(Owner: stakeholder alignment)*

## Timeline Considerations

No hard deadline was provided as part of this spec's scope — flag to product if a target launch window exists so phasing below can be validated against it.

Suggested phasing given the P0/P1/P2 split above:
1. **Phase 1 (v1 launch):** Full Daily loop, all five mechanics, Mark Score computation, Results screen, streaks (no freeze), one-tap sharing, Collections (discovery counts only).
2. **Phase 2 (fast follow):** Comparison stats, speed-bonus transparency, onboarding explainer, Collections detail view, streak freeze, accessibility pass.
3. **Phase 3+ (separate specs):** Explore mode, Challenge mode, any Rank/leaderboard system, friends/social graph.

Dependencies to track before Phase 1 can ship: a reliable daily-cadence content pipeline (Open Questions), and confirmation of what Bronze Atlas's identity layer exposes for gameplay-state persistence.
