# PastMark — Design System

The visual and interaction system behind PastMark Daily, as built in `PastMark Screens.dc.html` (mobile, 390 × 844) and `PastMark Screens - Web.dc.html` (web, 1440 × 900).

The product is a history game about graded accuracy — "how right were you," not "right or wrong." The design has to carry that: a quiet, archival surface that lets accuracy states (green, bronze, red) read instantly, without ever feeling like a quiz app.

---

## 1. Color

Every color has one job. Nothing is decorative.

### Ink and ground

| Token | Hex | Use |
| :--- | :--- | :--- |
| Ink | `#1F2B2E` | Masthead, prompt bands, dark screens, body text |
| Deep ink | `#143138` | Map ground, dark cards inside dark screens |
| Paper | `#F2EBDD` | App background, recessed panels |
| Card | `#FFFDF8` | Raised surfaces, option cards, stat cards |
| Rule | `#E4DAC6` | Borders, dividers, empty progress track |
| Muted ink | `#5A6663` | Secondary text on light, dividers on dark |
| Muted paper | `#BCC89F` | Secondary text on dark, map landmass |

### Semantic

| Token | Hex | Use — and only this use |
| :--- | :--- | :--- |
| Oxblood | `#7C3247` | Primary action, current selection, links. Hover `#6A2A3C` |
| Indigo | `#3F5E73` | The player's own input — pin, timeline handle, year, matched pairs, era tags |
| Green | `#6B8E4E` | Correct / high accuracy |
| Bronze | `#A9763F` | Achievement only — streaks, discoveries, partial credit |
| Rust | `#A6402C` | Incorrect / zero credit, "saved" alert state |

### Tints

`#FFF6F1` behind an oxblood selection. `#F4F6EC` behind a green correct answer. No other tints.

### Rules

- Two background colors per screen, maximum: ink or paper, plus card.
- Bronze is never a decorative accent. If it appears, the player earned something.
- Indigo and oxblood never mean the same thing: indigo is *what you said*, oxblood is *what the app wants you to press*.
- Accuracy color always pairs with an icon or a number — never color alone (✓, ✕, ≈, the percentage).
- Full-opacity ink on any colored ground. No alpha-muted type.

---

## 2. Type

Three families, strictly divided by role.

**Spectral** (serif) — brand and framing only. Wordmark, landing headlines, theme names, section titles on entry screens. Weight 600, tight tracking (`-.01em` to `-.02em`).

**IBM Plex Sans** — all gameplay, prompts, answers, scores, results, body copy. 400 for body, 500 for labels, 600 for prompts and numbers.

**IBM Plex Mono** — small structural labels, mark counters, tags, distances, years-in-labels. Always uppercase with `.10em`–`.16em` letter-spacing, 10–13px, weight 500–600.

Never: Spectral inside gameplay, mono for reading copy, sans for a structural label.

### Scale (mobile / web)

| Role | Mobile | Web |
| :--- | :--- | :--- |
| Screen title (Spectral) | 30–34px | 44–60px |
| Mark prompt | 21px | 34–38px |
| Score, hero number | 46–68px | 84–120px |
| Option text | 15–16px | 18–21px |
| Body | 13–15px | 15–18px |
| Structural label (mono) | 10–12px | 11–13px |

Line height 1.5–1.6 for body, 1.0–1.32 for display. `text-wrap: pretty` on every multi-line block.

---

## 3. Layout

**Mobile** — 390 × 844, `border-radius: 22px`, `overflow: hidden`. Three-part vertical stack: ink header (status + prompt), flexible content, bottom action bar separated by a `#E4DAC6` rule. Content padding 20–24px; safe-area top padding 52–56px. Action buttons are full-width, `padding: 17px`, `border-radius: 10px`.

**Web** — 1440 × 900, `border-radius: 14px`. Persistent 64–68px ink masthead carrying the wordmark, nav, streak pill and avatar. Gameplay uses either a centered column (multiple choice, timeline) or split (map + 440px reveal drawer; image + 480px answer panel). Results and summaries use `1fr / 400–420px` grids. Actions sit right-aligned in a `#FFFDF8` footer bar.

**Spacing** — 4px base. Card padding 18–28px (mobile) / 24–48px (web). Sibling groups always use flex/grid with `gap`, never margins.

**Radii** — 22px phone frame, 14px cards and panels, 12px option cards, 10px buttons, 5–6px chips and squares, 999px pills.

**Elevation** — one shadow only, on the device frame: `0 18px 44px rgba(0,0,0,.35)` mobile, `0 22px 54px rgba(0,0,0,.4)` web. Cards separate by border and surface, never by shadow.

---

## 4. Components

**Option card** — bordered `#FFFDF8` card, lettered circle (A–D) plus label. Three states: resting (1px `#E4DAC6`), selected (2–3px `#7C3247`, `#FFF6F1` fill, filled letter circle, siblings at 50–55% opacity), resolved (green or rust border with ✓/✕ and a mono caption naming the state).

**Action button** — oxblood fill, cream text, 10px radius. Disabled is `#E4DAC6` with `#5A6663` text. The label always names the commitment: "Lock In B", "Lock In 1926", "Next Mark — Era".

**Mark rail** — seven segments, one per Mark, in fixed order. Completed segments carry their accuracy color, the current segment is indigo, upcoming is `#E4DAC6` (light) or `#5A6663` (dark). Mono labels underneath: PIN · WHEN · KNOW · SEE · ERA · SUCCESSION · MATCH.

**Accuracy bar** — 6–8px track on `#F2EBDD`, filled to the percentage in its accuracy color, with the number stated in mono beside the label. A 0% state still shows a 3% sliver so the bar reads as present.

**Score block** — recessed `#F2EBDD` panel, "Points this Mark" on the left, the number at 25–36px on the right, colored only when the outcome is notable (green on full credit, rust on zero).

**Result squares** — seven rounded squares, one per Mark, in accuracy color. This is the shareable artifact; it never encodes which answer was which.

**Map** — `#143138` ocean with a 42–56px `rgba(188,200,159,.14)` graticule, `#BCC89F` landmass. The player's pin is indigo with a cream ring; the true location is oxblood, larger ring, labelled in mono. The miss is a dashed cream line plus a mono distance chip.

**Image placeholder** — `#143138` with a 135° hatch, centered mono caption naming the asset and its pixel size. All imagery in these files is a placeholder; real photography replaces it 1:1.

---

## 5. Interaction patterns

- **Nothing counts until Lock In.** Every Mark allows free adjustment, then one explicit confirm.
- **Reveal shows both answers.** The player's input stays visible next to the truth, with the accuracy breakdown, points earned and running total.
- **Advance is manual.** No auto-advance timer; the player controls when they leave a reveal.
- **Slider over typed input.** The When Mark uses a draggable handle with a live year readout, identically on mobile and web, with a range covering only the plausible window for that question.
- **Parity over platform flourish.** Web adds space and persistent chrome, never a different interaction model. Every gesture has a keyboard equivalent (arrow keys nudge the pin, A–D select options, Enter locks in).
- **Speed is a bonus, never a threat.** The timer reads as a quiet mono counter, never a countdown.

---

## 6. Voice

Plain, factual, mildly archival. Short declaratives.

- Screen copy states what happens: "Pin placed — adjust freely." "No credit on this Mark — your total stands."
- Feedback headlines are specific, not congratulatory: "Right on the Bosphorus." "Four years out." "Not this time." Never "Great job!"
- Reveal blurbs are two sentences of real history with a concrete detail — a date, a number, a name.
- Structural labels are uppercase mono and terse: TODAY'S THEME, MARK 4 OF 7, NEW DISCOVERIES.
- No emoji in the interface. The share card's accuracy squares are the one exception, since they have to survive as plain text.

---

## 7. Non-negotiables

1. Seven Marks, always in the order Pin → When → Know → See → Era → Succession → Match.
2. One Subject per day. The theme name is withheld before play and named everywhere after.
3. Bronze means achievement. Indigo means the player's own input. Oxblood means action.
4. Spectral for brand and theme names; IBM Plex Sans for everything played.
5. Accuracy is never communicated by color alone.
6. Sharing carries the theme and the score. Never the answers.
