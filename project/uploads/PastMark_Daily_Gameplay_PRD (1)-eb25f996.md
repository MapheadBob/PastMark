# PastMark — Daily Gameplay PRD

**Status:** Draft v2 — revised to a single-theme daily format **Owner:** TBD (Product) **Scope:** PastMark Daily — the core gameplay loop, mechanics, and scoring/progression tactics **Explicitly out of scope:** Account creation, authentication, and subscription/billing — these are assumed to be fully covered by Bronze Atlas infrastructure and are not addressed in this spec. **What changed in v2:** The Daily Challenge is no longer a loose set of 5–10 unrelated Marks. It is now a fixed, ordered sequence of **7 Marks built around a single daily theme** (one subject — a city, empire, person, event, object, or invention). See the worked example under Daily Theme Model.

---

## Problem Statement

History trivia products today force a binary right/wrong judgment on inherently graded knowledge — someone who knows a battle happened "somewhere in France" and someone who knows the exact village both get scored identically to someone who guessed. That flattens the skill expression the format could otherwise reward, and it produces the same generic "quiz app" experience players have seen dozens of times, with nothing distinctive to share. It also produces a scattershot experience — one Mark about the Roman Empire, the next about the moon landing — that never builds any depth on one subject.

PastMark's map-based interaction model (dropping a pin, placing a date on a timeline) creates a natural mechanism for graded accuracy instead of pass/fail. Anchoring each day to a **single theme explored from seven different angles** turns the daily session into a small guided tour of one place, person, or era rather than a disconnected trivia mix — and it creates a much stronger shared, comparable moment ("Today was Constantinople — I got 8,420, how'd you do?") than a generic score ever could. Without a well-defined single-theme gameplay loop and scoring model, PastMark risks being just another trivia app with a map skin instead of a genuinely differentiated format.

## Goals

1. Ship a complete, playable PastMark Daily loop — open app → play a fixed 7-Mark sequence, all about one theme → see a graded score → return tomorrow.  
2. Make each day feel like a **cohesive exploration of one subject**, not a disconnected trivia mix — every Mark should deepen the player's understanding of the same theme from a different angle (place, time, identity, image, era, succession, relationships).  
3. Make "how right" (graded accuracy), not just "right or wrong," the central scoring feeling across every Mark that supports it.  
4. Drive daily return behavior: target a meaningful percentage of players who complete a Daily Challenge coming back to play the next day's (different-themed) challenge.  
5. Create a shareable result moment that costs the player near-zero effort (one tap), names the day's theme, and communicates a comparable, specific score.  
6. Lay a progression foundation (Collections, streaks) that gives long-session players a reason to keep playing beyond the \~5-minute daily session, without requiring Explore or Challenge modes to exist yet.

## Non-Goals

- **Mixed-topic daily Marks.** A single day never mixes unrelated subjects (e.g., one Mark about Constantinople and the next about the Wright brothers). Each day is exactly one theme, end to end. This is a deliberate constraint, not an oversight.  
- **Explore mode** (choose Era/Region/Topic/Difficulty) — a real mode, but a separate spec once Daily is validated.  
- **Challenge mode** (timed competitive play) — depends on concepts (Rank, head-to-head/leaderboards) that aren't defined yet; separate initiative.  
- **Account, authentication, sign-up, and subscription/paywall flows** — per the stated assumption, this is Bronze Atlas's responsibility. This spec assumes a valid, identified player session exists by the time gameplay starts.  
- **Content authoring/CMS workflow** — how a daily theme and its 7 Marks get written, fact-checked, geocoded, and scheduled is real work but a different workstream. This spec treats the daily "Subject Pack" as a data dependency (see Open Questions) rather than designing the authoring tooling.  
- **Leaderboards / competitive Rank ladder** — tied to Challenge mode, out of scope. Lightweight, non-competitive comparison (e.g., "today's average score") is in scope as P1; ranked leaderboards are not.  
- **Friends / social graph** (following other players, head-to-head results) — sharing in v1 is one-way (generate a shareable result), not a social graph feature.

## Daily Theme Model

Every Daily Challenge is anchored to exactly one **Subject** — a single historical city, empire/dynasty, person, event, object, or invention. All 7 Marks for that day are authored against that one Subject, each exercising a different mechanic and a different facet of it. This is what separates PastMark Daily from a generic trivia mix: by the end of the 7 Marks, the player has effectively taken a guided tour of one piece of history.

**Worked example — Subject: Constantinople**

| \# | Mark | Mechanic | Prompt (illustrative) | Input |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **Pin** | Pin | "Where was Constantinople located?" | Drop a pin on the map |
| 2 | **When** | Time | "When did this city change its name from Constantinople?" | Timeline/year slider |
| 3 | **Know** | Know (MC) | "What is the current name of the city once called Constantinople?" | 4-option multiple choice |
| 4 | **See** | See (image-choice) | "Which of these is Constantinople's most famous landmark?" | 4 images to choose from |
| 5 | **Era** | Know (MC) | "What was the main dynasty/era associated with this city?" (e.g., Byzantine) | 4-option multiple choice |
| 6 | **Succession** | Know (MC) | "What empire/dynasty superseded that era?" (e.g., Ottoman) | 4-option multiple choice |
| 7 | **Match** | Match | Connect related facts about the Subject (e.g., rulers ↔ dates, or related landmarks ↔ descriptions) | Tap-to-pair columns |

A few things to note about this structure:

- **Five underlying mechanics, seven Marks.** Pin, Time, See, and Match each appear once. The multiple-choice mechanic (**Know**) appears three times under three different content angles — plain identity/knowledge (**Know**), historical period (**Era**), and what came after (**Succession**). Those three are not different interaction types; they're the same 4-option MC mechanic authored against three distinct facts about the Subject, kept as separate labeled Marks because each is a genuinely distinct thing to learn about the theme, not a variant of the others.  
- **The order is fixed:** Pin → When → Know → See → Era → Succession → Match. This gives every day the same rhythm (place → time → identity → visual → historical context → what came next → relationships), so players learn the shape of the session quickly regardless of that day's Subject.  
- **Subject variety across days** should rotate across the taxonomy already established for PastMark's content model — cities, people, places, objects, empires, inventions — so the format doesn't feel like "the city game." A person-Subject or event-Subject reframes the same 7 slots (e.g., Pin \= where they were born/it happened, When \= a pivotal date in their life/the event, Era/Succession \= the political context around them).  
- **Content requirement:** each day's Subject Pack must supply, at minimum: one precise location (Pin), one pivotal date (When), one core identity fact with 3 plausible distractors (Know), one landmark/reference image with 3 plausible distractor images (See), one era/dynasty fact with distractors (Era), one succession fact with distractors (Succession), and 3–5 matchable pairs (Match). Authoring a full Subject Pack is meaningfully more work per day than authoring 7 independent trivia questions — see Open Questions on content pipeline capacity.

## User Stories

### New Player

- As a first-time player, I want to understand what to do on my very first Mark without reading instructions, so that I don't bounce before I experience the "aha" of graded accuracy scoring.  
- As a first-time player, I want to notice by the second or third Mark that the whole day is about one connected subject, so that the format feels like a story I'm uncovering rather than a random quiz.  
- As a first-time player, I want to see *why* my pin or date got the score it did, so that I learn how the grading works from the very first Mark.

### Daily-Habit Player

- As a returning player, I want to see immediately whether I've already played today's theme, so that I don't waste a click trying to replay it.  
- As a returning player, I want my streak to be visible and to update the moment I finish a challenge, so that I feel the momentum of consecutive days.  
- As a returning player, I want my progress mid-challenge to survive a refresh or accidental tab close, so that a technical hiccup doesn't cost me a day's streak.  
- As a returning player, I want to see which Subjects and eras I've "discovered" over time, so that I have a reason to keep playing beyond just the daily score.

### Social Sharer

- As a player who just finished, I want to generate a shareable result in one tap that names today's theme and shows my score without spoiling the specific answers for people who haven't played yet, so that I can post it without feeling like I ruined the game for a friend.  
- As a player, I want to see how my score compares to other players today, so that sharing my result feels like a comparison, not just a number in a vacuum.

### Edge Cases

- As a player who lost connectivity mid-Mark, I want my in-progress answer to be preserved locally and submitted once connectivity returns, so that I don't lose credit for a Mark I already answered.  
- As a player who opens the app after the daily reset has occurred, I want to be dropped into the *new* day's theme (not a stale cached one), so that I'm never scored against yesterday's Subject.  
- As a player with a motor or visual accessibility need, I want every Mark (including the map pin-drop and image-choice Marks) to be operable via keyboard and screen reader, so that no single Mark locks me out of finishing the day's theme.

## Core Gameplay Loop (Session Workflow)

This is the primary "5-minute session" flow, spelled out end to end.

**1\. Home / Entry** Player lands on Home. A single Daily card is the primary, default focus of the screen, and now names the theme once it's known (post-completion) rather than staying generic. State reflects where the player is relative to today's challenge:

- *Not started:* "Play Today's PastMark" CTA (theme name withheld pre-play so Mark 1 — "Where?" — isn't spoiled).  
- *In progress* (returning mid-session): "Continue — Mark 4 of 7."  
- *Completed:* "Today's Theme: Constantinople — Score: 8,420 — see results," CTA leads to the Results screen (read-only), not a replay.

**2\. Challenge Start** Tapping "Play" loads the day's fixed 7-Mark sequence for that day's Subject (same Subject and same 7 Marks for every player globally — see Requirements). First-time players see a brief, skippable one-screen explainer of "how scoring works" (P1); returning players skip straight to Mark 1 (Pin).

**3\. Per-Mark Loop** (repeats for each of the 7 Marks, in fixed order)

1. **Prompt** — the Mark's question/context is shown (text, or an image for the See Mark). Nothing reveals the Subject's identity ahead of when the player should logically infer or answer it.  
2. **Interaction** — player provides an answer using the mechanic-specific input (map pin, timeline, multiple choice, image-choice, or match pairs — see Mechanic Tactics below). Adjustments are allowed before the answer is locked in.  
3. **Lock In** — an explicit confirm action submits the answer, on every Mark, so a mis-tap doesn't cost credit.  
4. **Immediate Feedback** — the correct answer is revealed alongside the player's answer, the accuracy breakdown for that Mark (e.g., Location Accuracy 98%), the points earned, and the running total for the session. This is also where the Subject's identity becomes explicit if it wasn't already (by Mark 3 at the latest, most players will know the theme regardless).  
5. **Advance** — player taps to continue to the next Mark (no forced auto-advance timer, so players can absorb the "why" behind their score).

**4\. Completion / Results** After Mark 7 (Match), the player sees a Results screen:

- **Today's Theme**, named explicitly (e.g., "Constantinople").  
- Total **Mark Score** for the day, plus the 7-Mark breakdown that produced it.  
- Updated streak count (with a visible "streak continued" or "new streak" state).  
- Any Collections progress unlocked this session (e.g., "+1 discovery: Byzantine Empire," "+1 discovery: Ottoman Empire" — a single Subject can advance multiple Collections at once; see Collections below).  
- A one-tap **Share** action that generates a spoiler-free result summary: the theme name and total score (safe to share, since anyone reading it hasn't lost anything by knowing the theme), but not the specific correct answers to each Mark.  
- (P1) A lightweight comparison, e.g., "Today's average score: 6,100 — you beat 72% of players."

**5\. Return to Home** Daily card now reflects the completed state (theme \+ score) until the next daily reset. Streak and Collections are visible from persistent navigation, independent of whether the player starts another session that day.

## Mechanic Tactics

Every day's 7 Marks are built from five underlying mechanics (Pin, Time, Know, See, Match); Know is reused across three labeled content angles (Know, Era, Succession) as explained in the Daily Theme Model above.

### PIN — "Where?" (Mark 1\)

- Full-screen interactive world map (pan via drag, zoom via scroll/pinch).  
- Player taps to drop a pin; pin can be dragged to adjust before locking in; one confirmed placement per Mark.  
- Scored on **Location Accuracy**: graded by distance between the placed pin and the true location, using a tiered decay (closer \= higher %), not binary right/wrong. Exact distance thresholds are a design/data question (see Open Questions), but the tiering should reward precision the way the overview doc's example does (a pin a few km off scoring \~98%, versus a pin merely "in the right country" scoring meaningfully lower).  
- Post-answer feedback shows both pins (player's and true) on the map so the miss distance is visually legible, not just a percentage.

### WHEN (Time) — "When?" (Mark 2\)

- Horizontal timeline control with a draggable handle, plus a numeric year input for precision; range spans the plausible historical window for that day's question (e.g., "when did this city change its name" only needs a range covering the plausible transition period, not all of human history).  
- Scored on **Time Accuracy**: graded by year-distance decay, same tiered-accuracy principle as Pin.  
- The date asked about need not be the Subject's "founding" date — per the worked example, it can be any pivotal date tied to the theme (a name change, a conquest, a treaty), giving content authors flexibility in which fact to test.

### KNOW — "What/Who?" (Mark 3\)

- Standard 4-option multiple choice, single-select, explicit "Lock In" confirm.  
- Scored on **Knowledge**: binary — full credit for the correct option, zero for any other. No partial credit (there's no meaningful "how right" gradient for a single correct-answer MC question).  
- Tests the Subject's core identity fact (e.g., "what is this place/person/thing known as").

### SEE — "Identify the image" (Mark 4\)

- A text prompt (e.g., "Which of these is \[Subject\]'s most famous landmark?") paired with **4 image options** to choose from, single-select, same Lock In pattern as Know.  
- Scored identically to Know (binary Knowledge credit).  
- Authoring note: a Subject Pack needs one correct reference image plus 3 plausible distractor images (other real landmarks/artifacts, not obviously wrong ones) for this Mark to be meaningfully hard. An alternate authoring pattern — show one image as the stimulus and ask a text-answer MC question about it — is also supported where it fits the Subject better, but the default is image-options-as-answers per the worked example.

### ERA — "What period/dynasty?" (Mark 5\)

- Same 4-option MC mechanic as Know, applied to a distinct content angle: the historical era, dynasty, or civilization most associated with the Subject (e.g., "Byzantine").  
- Scored identically to Know (binary).

### SUCCESSION — "What came next?" (Mark 6\)

- Same 4-option MC mechanic again, this time testing what superseded or replaced the Era answered in Mark 5 (e.g., "Ottoman").  
- Scored identically to Know (binary).  
- Authoring dependency: Succession's correct answer and distractors should be written with awareness of what Era's Mark already established, so the two Marks read as a clear before/after pair rather than two disconnected questions.

### MATCH — "Connect historical relationships" (Mark 7\)

- Two columns of 3–5 items each, built from facts about the day's Subject (e.g., rulers ↔ their dates, or related landmarks ↔ their descriptions); tap one item per column to form a pair; matched pairs are visually confirmed (highlight/line).  
- Submit once all items are paired.  
- Scored with **partial credit**: correct pairs ÷ total pairs — the one Mark besides Pin/Time that keeps a "how right" gradient rather than binary scoring.  
- Closes the day by pulling together several facts about the Subject at once, functioning as a light recap of what the player just learned across Marks 1–6.

## Requirements

### P0 — Must-Have

**Single-theme Daily Challenge structure**

- Each day, the server selects exactly one Subject and generates the fixed 7-Mark sequence (Pin, When, Know, See, Era, Succession, Match) against it, served identically to every player.  
- *Acceptance:* Two different player sessions loading the Daily Challenge on the same calendar day receive the same Subject and the same 7 Marks in the same order.  
- *Acceptance:* No Daily Challenge mixes Marks from more than one Subject.  
- A daily reset boundary exists after which a new Subject/Mark sequence becomes active and the previous day's is no longer playable (only viewable via that day's saved results, if completed).  
- *Acceptance:* A session that starts before reset and finishes after reset still gets scored against the Subject/sequence it started.

**All seven Marks implemented in fixed order**

- Pin, When, Know, See, Era, Succession, and Match all ship with the interactions and scoring described under Mechanic Tactics, always presented in that order.  
- *Acceptance:* Each of the 7 Marks has a working input UI, a lock-in/confirm step, a scoring computation, and a feedback state showing the correct answer; the sequence cannot be reordered or skipped.

**Subject Pack data model**

- A Subject Pack (the content unit backing one day) contains: one location (Pin), one date (When), one identity fact \+ 3 distractors (Know), one reference image \+ 3 distractor images (See), one era fact \+ 3 distractors (Era), one succession fact \+ 3 distractors (Succession), and 3–5 matchable pairs (Match).  
- *Acceptance:* The Daily Challenge cannot be published for a day whose Subject Pack is missing any of the above fields.

**Mark Score computation**

- Each Mark has a defined maximum point value. Its score is composed of an accuracy component (mechanic-dependent: Location/Time decay tiers for Pin/When, binary for Know/See/Era/Succession, partial-credit ratio for Match) plus a speed component that rewards faster (but not rushed/reckless) responses within a soft cap.  
- The Daily Mark Score is the sum of all 7 Mark scores earned in that session.  
- *Acceptance:* Given a completed Mark with a known accuracy tier and response time, the displayed score matches the defined formula; the session total equals the sum of the 7 per-Mark scores.

**Per-Mark and session feedback**

- After each Mark, the player sees the correct answer, their own answer, an accuracy breakdown, points earned, and the running total.  
- *Acceptance:* Feedback is shown before advancing to the next Mark; running total updates immediately after each Mark, not just at session end.

**Results screen**

- Shows the day's Subject/theme name, total Mark Score, the 7-Mark breakdown, and updated streak state.  
- *Acceptance:* Reopening the app after completing today's challenge lands on this same Results screen (read-only), not a fresh challenge.

**Session resilience**

- In-progress answers and session position are preserved across a refresh, tab close, or brief network loss; an answer that was locked in but failed to submit is retried/queued rather than silently dropped.  
- *Acceptance:* Refreshing mid-challenge resumes at the same Mark, in the same Subject's sequence, with prior Marks' scores intact.

**Streaks**

- Completing a Daily Challenge on consecutive calendar days increments a streak counter; missing a day resets it to zero (no grace period required for v1 — see Open Questions on whether a freeze is P1).  
- *Acceptance:* Completing today and yesterday shows a streak of 2; completing today after a missed day shows a streak of 1\.

**Sharing**

- One-tap generation of a spoiler-free result summary that includes the theme name and total score/accuracy indicators, but never the specific correct answers to Marks 1–7.  
- *Acceptance:* The generated share content includes the day's Subject name and the player's score, and never includes the individual Mark answers.

**Collections (progression)**

- Each Subject is tagged with one or more Collections at authoring time (e.g., Constantinople → "Byzantine Empire," "Ottoman Empire," "World Capitals"). Completing a day's challenge marks that Subject "discovered" within every Collection it's tagged to.  
- A persistent Collections view shows discovered/total counts per Collection (e.g., "Byzantine Empire: 18/20 discovered").  
- *Acceptance:* Completing a Daily Challenge updates discovered counts for every Collection that day's Subject belongs to, and this state persists across sessions.

### P1 — Nice-to-Have (fast follow)

- **Comparison stats:** today's average Mark Score across all players, and/or a percentile, shown on the Results screen.  
- **Speed bonus transparency:** explicitly break out the speed component in the per-Mark feedback, not just fold it into the total.  
- **Onboarding explainer:** a skippable one-time "how scoring works" screen for first-time players, ideally previewing the single-theme structure ("today's 7 questions are all about one place, person, or event").  
- **Collections detail view:** browse a specific Collection to see how many Subjects remain undiscovered (without revealing their content).  
- **Streak freeze/grace token:** protects a streak from a single missed day.  
- **Practice/archive mode:** replay past days' Subjects in a non-scoring context.  
- **Accessibility pass:** keyboard-operable map pin placement and timeline control, screen-reader labeling for all 7 Marks (including image-choice alt text for See).  
- **Subject variety guardrail:** logic (or an editorial rule) that prevents the same Subject category (e.g., "city") from repeating too many days in a row, so the format doesn't start to feel one-note.

### P2 — Future Considerations (not built now, but shouldn't be architecturally foreclosed)

- Explore mode (Era/Region/Topic/Difficulty selection).  
- Challenge mode (timed competitive play) and any associated Rank/leaderboard system.  
- Image hotspot interaction for the See Mark (tap the artifact within a scene, rather than choosing among 4 image options).  
- Friends/social graph and head-to-head comparison.  
- Multi-day or "deep dive" themes (e.g., a Subject that spans two consecutive days) — not needed for v1's single-day-single-theme model, but worth not architecturally blocking.

## Success Metrics

### Leading Indicators

- **Daily Challenge completion rate:** % of sessions that start Mark 1 and finish all 7 Marks. Target and measurement window TBD (no baseline exists pre-launch — treat as a hypothesis to validate, not a committed number).  
- **Time to complete:** median time from challenge start to Results screen (sanity-checks the "5-minute session" framing).  
- **Mark-level drop-off:** completion rate at each of the 7 Marks, to catch whether a specific Mark (e.g., Match, as the most complex interaction) disproportionately causes abandonment.  
- **Share rate:** % of completed sessions that trigger the share action.  
- **Streak-start rate:** % of players who complete a second consecutive day after their first completion.

### Lagging Indicators

- **D7 / D30 retention** among players who complete at least one Daily Challenge.  
- **Streak length distribution:** e.g., % of active players reaching a 7-day streak.  
- **Collections depth over time:** average discovered-Subject count per active player at 30/60/90 days, as a proxy for whether the progression system is pulling people back beyond the daily habit alone.  
- **Attributed return traffic from shares** (new sessions traceable to a shared result), pending whatever tracking Bronze Atlas's infrastructure supports.

Specific numeric targets are intentionally left open pending stakeholder input — see Open Questions.

## Open Questions

- **Daily reset boundary:** midnight UTC for all players, or player-local midnight? Affects fairness of "same challenge" claims and streak logic. *(Owner: product/engineering)*  
- **Accuracy decay curves:** the exact distance/year thresholds and point tiers for Pin and When scoring aren't specified here — need a designed curve (and playtesting) rather than an arbitrary formula. *(Owner: design/data)*  
- **Per-Mark timing:** is there a hard time limit that forces submission, or is timing purely a soft speed-bonus input with no forced cutoff? The spec assumes no hard cutoff for v1, but this should be confirmed. *(Owner: design)*  
- **Content pipeline capacity:** a full Subject Pack (location, date, identity fact \+ distractors, image \+ distractor images, era fact, succession fact, and 3–5 match pairs) is significantly more authoring work per day than 7 independent trivia questions. Who produces this, at what lead time, and can it sustain a daily cadence indefinitely? This is the single biggest dependency for this spec and isn't addressed here. *(Owner: content/product)*  
- **Subject selection and rotation:** who decides which Subject runs on which day, and what prevents repetitive or unbalanced coverage (e.g., too many European cities, not enough people/objects/inventions)? *(Owner: content/product)*  
- **Distractor image sourcing for See:** finding 3 plausible (not laughably wrong) distractor images per day is a real content constraint — is there a licensed image library this can draw from? *(Owner: content/legal)*  
- **Bronze Atlas data surface:** does the Bronze Atlas account layer expose whatever is needed to persist per-player gameplay state (streaks, Collections, session-in-progress), or does PastMark need its own gameplay datastore keyed off a Bronze Atlas identity? *(Owner: engineering)*  
- **Streak grace/freeze:** is a missed-day streak freeze a v1 requirement or genuinely P1? *(Owner: product)*  
- **Comparison stats scope:** is a simple daily average enough, or does "compare to others" need segmentation that would pull in social-graph questions currently marked out of scope? *(Owner: product)*  
- **Accessibility target:** what compliance level (e.g., WCAG 2.1 AA) is required, particularly for the map/timeline/image-choice Marks? *(Owner: design/legal)*  
- **Success metric targets:** the leading/lagging indicators above need real numeric targets before launch; none are set here. *(Owner: stakeholder alignment)*

## Timeline Considerations

No hard deadline was provided as part of this spec's scope — flag to product if a target launch window exists so phasing below can be validated against it.

Suggested phasing given the P0/P1/P2 split above:

1. **Phase 1 (v1 launch):** Full single-theme Daily loop, all 7 Marks in fixed order, Subject Pack data model, Mark Score computation, Results screen, streaks (no freeze), one-tap sharing (with theme name), Collections (discovery counts only).  
2. **Phase 2 (fast follow):** Comparison stats, speed-bonus transparency, onboarding explainer, Collections detail view, streak freeze, accessibility pass, Subject variety guardrail.  
3. **Phase 3+ (separate specs):** Explore mode, Challenge mode, any Rank/leaderboard system, friends/social graph, image hotspot interaction, multi-day themes.

Dependencies to track before Phase 1 can ship: a content pipeline capable of producing a full Subject Pack (not just 7 independent questions) on a daily cadence — this is now a heavier lift than in the prior draft and should be validated for feasibility before committing to a launch date — and confirmation of what Bronze Atlas's identity layer exposes for gameplay-state persistence.  
