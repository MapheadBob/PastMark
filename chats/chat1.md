# PastMark Game Design

_Started 2026-09-04 20:48 UTC_

---

## User

PastMark is an new game I'd like to create.  Use the PRD for Guidance on function, and the Design Token spreadsheet as inspiration for colors.  Using PRD.md and DESIGN.md, design the user flows as screens — [ landing page, game play, each challenge, the states when selecting on a map or multiple choice, picture presentation, picture selection, affirmative and negative responses to right/ wrong answers, game play conclusion, answer summary and stats]. Follow design token  spreadsheet exactly for colors,  and choose fitting fonts, and spacing accordinly

## Assistant

I'll read the PRD and design tokens first.

_[tool: read_file]_

_[tool: list_files]_

_[tool: run_script]_

Tokens read. Building the screen flow now — one thing to flag: there's no `DESIGN.md` in the project, so I'm using the token spreadsheet as the sole visual source (Spectral + IBM Plex for type).

_[tool: dc_write]_

_[tool: ready_for_verification]_

17 screens on one pannable canvas: landing (not started / in progress / completed), the scoring explainer, all five mechanics with their select + reveal states, picture presentation and picture selection, correct and incorrect feedback, session conclusion, and the answer summary with stats.

Colors are strictly the spreadsheet — oxblood for actions, indigo for guess pins and era tags, green/red for right and wrong (always paired with an icon or label), and bronze held back for streaks and discoveries only. Type is Spectral for prompts and headings, IBM Plex Sans for UI, IBM Plex Mono for all scores and measurements. Maps use real world geometry with the shared ocean/land hexes.

Two notes: there's no `DESIGN.md` in the project, so type and spacing are my calls — send it over if one exists. Image slots are marked placeholders, not artwork.

## User

Two things, on the date selection, let's have no type in, just a slider to mimic the same behavior on web and mobile designs.  Also, let's tighten up the design for game play so that the more modern typeface is used throughout the game play and the summary at the end (daily game score, answer summaries) stays in that font.  So in the When Timeline drag, the 'your answer' as well as the score summary in the header should be updated.

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Timeline is now slider-only — no year input, same handle behavior on web and mobile. IBM Plex Sans now carries all gameplay prompts, feedback headings, HUD running totals, the "your answer" year, per-Mark points, the final daily score, and the answer summary. Spectral stays on the landing/branding screens only; mono is kept for small technical tags like `141 km · 74%`.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Both landing-card score values now use IBM Plex Sans, matching the gameplay HUD and results. The flagged overlap is the intentional selected-state check badge on the picture-selection card.

## User

These screens are great for mobile web.  now lets create the same screens for full sized web app.

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

All 17 screens at 1440 × 900 in a new file, `PastMark Screens — Web.dc.html`. Same tokens and type rule.

Desktop-specific adaptations: a persistent dark masthead with nav, streak and avatar; the Where Mark goes edge-to-edge map with a floating prompt card and a 440px reveal drawer beside it; Where/When/What prompts sit in a dark band above centered interaction areas; multiple choice becomes a 2×2 grid, picture selection a single row of four; the answer summary is a proper table with a stats column beside it. The timeline is slider-only here too, with arrow-key nudging noted.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: list_files]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Explainer frame now measures 1440 × 900 like the rest (`box-sizing:border-box`), and cleaned up the duplicate display declaration on the in-progress card. The remaining flag is the intentional selected-state check badge.

