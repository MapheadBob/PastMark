# PastMark — Design System

The visual and interaction system behind PastMark Daily. This document reflects the **PastMark Design Standard** update (see `project/uploads/` history and the Design Standard reference at the project's linked Claude Design canvas) — a deliberate simplification of the earlier system: one typeface instead of three, a smaller and more disciplined color set, and a single reusable "category tag" pattern that ties the mark header, the progress rail and every results row together.

The product is a history game about graded accuracy — "how right were you," not "right or wrong." The design has to carry that: a quiet, archival surface that lets accuracy states (green, rust) read instantly, without ever feeling like a quiz app.

---

## 1. Color

Every color has one job. Nothing is decorative.

### Ink and ground

| Token | Hex | Use |
| :--- | :--- | :--- |
| Ink | `#1F2B2E` | Masthead, mark header, gameplay footer, dark screens, body text |
| Deep ink | `#143138` | Map ground, image placeholders |
| Parchment | `#F2EBDD` | App background, recessed panels |
| Card white | `#FFFDF8` | Raised surfaces, option cards, stat cards |
| Table tint | `#FCF8F1` | Results/summary table row background |
| Hairline | `#E4DAC6` | Borders, dividers, empty progress track |
| Slate gray | `#5A6663` | Secondary text on light |
| Muted teal | `#8C978F` | Timer, meta text on dark |

### Semantic

| Token | Hex | Use — and only this use |
| :--- | :--- | :--- |
| Gold | `#A9763F` | Primary accent — PIN category, score numbers, the primary CTA (outlined) |
| Sienna | `#C1652F` | Nav / CTA / selection accent — option selection, "Back to today" / "Share" |
| Maroon | `#7C3247` | Match category tag only |
| Slate blue (indigo) | `#3F5E73` | The player's own input — When Mark slider/answer, map guess pin, links |
| Green | `#6B8E4E` | Correct / accuracy ≥ 50% |
| Rust | `#A6402C` | Incorrect / accuracy < 50% |

### Category color tokens

One distinct color per Mark, always rendered as a **filled pill** — dark ink text on light fills, cream text on dark fills — never bare colored text. This is the one visual thread tying the mark header, the progress rail and every results row together.

| Mark | Fill | Text |
| :--- | :--- | :--- |
| PIN | `#A9763F` | `#1F2B2E` |
| WHEN | `#3F5E73` | `#F2EBDD` |
| KNOW | `#A6402C` | `#F2EBDD` |
| SEE | `#6B4E71` | `#F2EBDD` |
| ERA | `#B8863A` | `#1F2B2E` |
| SUCC. | `#6B8E4E` | `#1F2B2E` |
| MATCH | `#7C3247` | `#F2EBDD` |

### Tints

`#FDF0E8` behind a sienna selection. `#F4F6EC` behind a green correct answer. No other tints.

### Rules

- Two background colors per screen, maximum: ink or parchment, plus card.
- Accuracy is **binary**: green at or above half credit, rust below it. There is no third "partial" tier — Match's per-pair credit still resolves to one binary color once totaled.
- A mark's category color is fixed and never changes with accuracy — it names *what was asked*, not *how well you did*.
- Sienna and gold are never interchangeable: gold is the app's primary accent and the "Lock In" action; sienna is specifically selection state and the nav actions that leave or share a result.
- Full-opacity ink on any colored ground. No alpha-muted type.

---

## 2. Type

**One typeface: IBM Plex Sans** (400/500/600/700) — for everything, brand included. No serif, no mono. Structural labels are small, uppercase, wide-tracked sans instead of monospace.

### Scale

| Role | Size |
| :--- | :--- |
| Screen title | 26–32px, weight 600 |
| Mark prompt / headline | 27–34px, weight 600 |
| Score, hero number | 46–96px, weight 600 |
| Answer / total | 28–30px, weight 700 |
| Option label | 14px, weight 500 |
| Body | 12–15px, weight 400 |
| Eyebrow / structural label | 11px, `.14em` tracking, uppercase, weight 600 (gold when it's a kicker) |
| Stat micro-label | 9–10px, `.08em`–`.12em` tracking, uppercase |

Line height 1.5–1.6 for body, 1.0–1.32 for display. `text-wrap: pretty` on every multi-line block.

---

## 3. Layout

**Surface stack** — dark header/footer (`#1F2B2E`) sandwiching a parchment (`#F2EBDD`) body. Outer shell radius 5–6px on the frame; 9–14px on inner cards.

**Mobile** — 390 × 844, `border-radius: 22px`, `overflow: hidden`. Three-part vertical stack: ink header (status + prompt), flexible content, dark footer action bar. Content padding 18–24px; safe-area top padding 16–20px.

**Web** — 1440 × 900, `border-radius: 14px`. Persistent 64–68px ink masthead. Gameplay uses either a centered column (multiple choice, timeline) or split (map + reveal panel). Results and summaries use `1fr / 400px` grids.

**Spacing** — 4px base. Card padding 15–28px (mobile) / 16–48px (web). Sibling groups use flex/grid with `gap`, never margins.

**Radii** — 22px phone frame, 14px cards and panels, 9–12px option cards (9px desktop / 12px mobile), 4–6px chips and tags, 999px pills.

**Elevation** — one shadow only, on the device frame. Cards separate by border and surface, never by shadow.

---

## 4. Components

**Option row** — circular letter badge (ink fill, cream text by default) + label, on a card-white pill (9px desktop / 12px mobile radius). Three states: resting (ink badge, hairline border), selected (2–3px sienna border, sienna tint fill, sienna badge), resolved (green or rust border with ✓/✕ badge).

**Primary CTA ("Lock In")** — outlined button, gold border/text on the dark footer. 5px radius on desktop, 24px pill on mobile.

**Navigation CTA ("Back to today" / "Share")** — outlined sienna pill. Used only for leaving or sharing a result — never for gameplay actions.

**Category tag** — filled pill in that Mark's category color, used wherever the Mark's name appears as a short code (mark header, progress rail's implicit identity, every results row) — never as bare colored text.

**Mark progress rail** — one bar/dot per Mark. Filled with the Mark's category color once reached (current or completed); translucent cream (or `--rule` gray on a light card) while still upcoming. Identity, not accuracy — a Mark answered incorrectly still shows its own category color, not rust.

**Stat card** — card-white fill, 9–10px radius, 9px uppercase micro-label over an 18–26px value.

**Results table row** — table-tint background, the Mark's category pill in its own column (shown at every breakpoint — the numeric index is what gives way on mobile), accuracy in green (≥50%) or rust (<50%).

**Map** — deep-ink ocean. The player's guess pin is slate blue with a cream ring (the player's own input, same token as the When Mark); the true location is gold with a larger ring (the answer/target color used throughout). The miss is a dashed cream line plus a chip naming the distance.

**Image placeholder** — deep-ink with a 135° hatch, centered caption naming the asset. All imagery is a placeholder; real photography replaces it 1:1.

---

## 5. Interaction patterns

- **Nothing counts until Lock In.** Every Mark allows free adjustment, then one explicit confirm.
- **Reveal shows both answers.** The player's input stays visible next to the truth, with the accuracy breakdown, points earned and running total.
- **Advance is manual.** No auto-advance timer; the player controls when they leave a reveal.
- **Slider over typed input.** The When Mark uses a draggable handle with a live year readout, identically on mobile and web.
- **Parity over platform flourish.** Web adds space and persistent chrome, never a different interaction model. Every gesture has a keyboard equivalent (arrow keys nudge the pin, A–D select options, Enter locks in).
- **Speed is a bonus, never a threat.** The timer reads as a quiet counter, never a countdown.

---

## 6. Voice

Plain, factual, mildly archival. Short declaratives.

- Screen copy states what happens: "Pin placed — adjust freely." "No credit on this Mark — your total stands."
- Feedback headlines are specific, not congratulatory: "Right on the Bosphorus." "Four years out." "Not this time." Never "Great job!"
- Reveal blurbs are two sentences of real history with a concrete detail — a date, a number, a name.
- Structural labels are uppercase and terse: TODAY'S THEME, MARK 4 OF 7, NEW DISCOVERIES.
- No emoji in the interface. The share card's accuracy squares are the one exception, since they have to survive as plain text.

---

## 7. Non-negotiables

1. Seven Marks, always in the order Pin → When → Know → See → Era → Succession → Match.
2. One Subject per day. The theme name is withheld before play and named everywhere after.
3. A category tag's color is fixed to its Mark and never encodes accuracy; accuracy is always green (≥50%) or rust (<50%), never color alone (paired with an icon, a word, or the percentage).
4. IBM Plex Sans for everything — brand and gameplay alike. No serif, no mono.
5. Gold means the primary action or the PIN/score accent; sienna means selection or leaving/sharing a result. The two are never swapped.
6. Sharing carries the theme and the score. Never the answers.
