# Updated PRD design adjustments

_Started 2026-09-05 04:27 UTC_

---

## User

Continuing from "PastMark Game Design".

## Assistant

We've built out PastMark's full screen system for both mobile and web. Started from the PRD's five game mechanics and design tokens, mapping every state: landing (not started / in progress / completed), scoring rules, all five challenge types with select and reveal states, picture presentation and selection, right/wrong feedback, session close, and answer summary with stats.

Key decisions made: replaced date-year input with a slider for consistency across web and mobile. Switched all gameplay type to IBM Plex Sans (landing and branding only stay Spectral; mono reserved for technical tags). Desktop version adapted the layout to 1440 × 900 — persistent masthead, full-bleed map with floating prompt and side drawer, 2×2 multiple choice grid, single-row picture selection, and a proper table for the answer summary. All colors follow the token spreadsheet strictly: oxblood for actions, indigo for guesses and era tags, green/red for right/wrong with icons, bronze for streaks only.

Current state: both mobile (`PastMark Screens.dc.html`) and web (`PastMark Screens - Web.dc.html`) are built and verified. The only remaining flag is the intentional selected-state check badge on picture-selection cards — not a bug.

Open next steps: refine individual screen interactions (e.g., timeline handle behavior, reveal animations), add loading states if needed, or move into final asset handoff.

Files: PastMark Screens.dc.html, PastMark Screens - Web.dc.html, support.js

## User

See the updated changes in the updated PRD and make the necessary design adjustments

## Assistant

I'll re-read the PRD to see what changed.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

PRD v2 changes the format substantially: 7 Marks in fixed order (Pin → When → Know → See → Era → Succession → Match) around a single daily Subject. Rewriting both screen sets against the Constantinople worked example.

_[tool: dc_write]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

Both screen sets now follow PRD v2. What changed:

- **Seven Marks, not eight**, in the fixed order Pin → When → Know → See → Era → Succession → Match, with the mark names replacing the old Where/What/Identify/Connect vocabulary in headers, rails and progress bars.
- **Single daily Subject** — every screen is Constantinople, and the running score/reveal copy now builds one continuous session (1,082 → 6,470).
- **Two new screens**: Mark 5 Era, and Mark 6 Succession, which visibly carries the Era answer forward as a before/after pair.
- **See is now four image options by default**; the old image-as-stimulus screen is kept and labelled as the alternate authoring pattern. The incorrect-feedback screen now compares two photo cards.
- **Theme handling on entry**: withheld pre-play (with a note saying so), named on the in-progress and completed cards, named in the results screen and the share preview.
- **Collections** are now the three that Constantinople is tagged to, showing one subject advancing three collections at once.
- Explainer leads with the single-theme structure and shows the fixed seven-step order.

Web version (`PastMark Screens - Web.dc.html`) mirrors all of it at 1440 × 900 with the seven-Mark masthead rail. Open questions from the PRD I did not invent answers to: exact decay tiers (the shown 97%/96% are illustrative) and the reset boundary, still written as midnight UTC.

## User

Found issues — fixing…

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: write_file]_

_[tool: show_to_user]_

`DESIGN.md` is at the project root — color tokens with their single permitted use, the three-family type rule and scale, layout grids for both breakpoints, the component inventory (option card, mark rail, accuracy bar, map, result squares), interaction patterns, voice, and six non-negotiables.

Also fixed the two verifier items in the mobile file: the results screen's 12px overflow and the explainer frame's missing `box-sizing`.

