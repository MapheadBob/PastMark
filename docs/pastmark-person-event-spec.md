# PastMark — Person & Event Subject Types (Spec v1)

**Status:** Draft v3 — updated with the flexible Mark-selection model: Succession (and every other non-anchor type) is now an optional flexible-slot candidate rather than a required field, per the companion *Daily Gameplay PRD* v3 (2026-09-17)
**Owner:** TBD (Product)
**Scope:** Two new Subject types — Person and Event — that extend the existing single-theme Daily Gameplay model; a new Order interaction mechanic; and the data architecture for all three Subject types (Location, Person, Event) in Supabase.
**Relationship to other docs:** Extends *PastMark — Daily Gameplay PRD* (7-Mark structure, scoring model) and *PastMark 25-Location Subject Pack Notes* (existing content pattern). Reconciles with *PastMark Subject Pack - Supabase Import Plan* (schema already delivered and partially built).
**What this is not:** This spec documents design decisions already reached through brainstorming, not an open exploration. Open Questions below are the genuinely unresolved items only.

---

## Problem Statement

The Daily Gameplay PRD anticipated Person and Event Subjects from the start ("a person-Subject or event-Subject reframes the same 7 slots") but never specified how. Two of the seven Marks don't reframe cleanly on inspection: **Succession** has no natural equivalent for a scientist or explorer the way it does for a monarch, and testing a person's life dates via exact-year Know/Match questions breaks down when their pivotal dates cluster close together (a discovery and its award in the same year, for instance). Without resolving these, content authors can't start building Person or Event Subject Packs, and the existing single-`subjects`-table Supabase schema — built for Location only — needs a decision on how it extends before more schema changes are layered on.

## Goals

1. Ship Person and Event as fully-specified Subject types, each reframing the existing 7-Mark sequence (Pin, When, Know, See, Era, Succession, Match) with no new marks required in the fixed daily sequence.
2. Resolve the Succession generalization gap for Person Subjects without forcing a political-succession framing onto non-ruler figures.
3. Introduce one new, validated interaction mechanic — **Order** — that solves the clustered-dates problem for Person Subjects and is reusable for Event Subjects as a fast follow.
4. Land a single data architecture decision for all three Subject types that avoids another schema migration when a fourth type is eventually added.
5. Preserve the PRD's subject-variety goal: Location, Person, and Event Subjects should be able to rotate through the Daily slot and share one Collections system without special-casing.

## Non-Goals

- **Scale/Magnitude mechanic** (a decay-scored slider for death toll, eruption magnitude, army size) — raised in brainstorming as a strong idea for Event Subjects, but it's a genuinely new 7th mechanic with real engineering cost. Out of scope for this spec; captured under Future Considerations.
- **Image sourcing for See marks** — Person and Event inherit the same open gap Location already has (no licensed image library yet). Not solved here.
- **Explore/Challenge mode implications** — this spec only covers how Person/Event slot into the existing Daily loop.
- **Content authoring tooling** — how Subject Packs actually get entered/edited is a separate workstream, same exclusion the Daily PRD already makes.

---

## Subject Type Design: Person

*Example subjects: Cleopatra, Einstein, Columbus.*

| Mark | Content | Notes |
|---|---|---|
| **Pin** | Birthplace by default | Authors may substitute a more iconic place (e.g., where their defining achievement happened) when that's more interesting than birthplace — same per-subject flexibility the PRD already grants the When mark. This is Place #1 of the 5-place Life Events set (see Match/Order below). |
| **When** | A pivotal life date — birth, coronation, publication, first voyage | Author's choice of the most interesting date, same flexibility as the existing When mark. |
| **Know** | Core identity fact | Unchanged mechanic. |
| **See** | Portrait/depiction, or an artifact/object tied to them | Unchanged mechanic. |
| **Era** | The period/dynasty/movement they belong to | Unchanged mechanic. |
| **Succession** | Optional flexible-slot candidate — may be entirely absent | No longer a blocker. Under the Daily Gameplay PRD's v3 flexible-pool model, Succession is just one of several candidate types competing for Person Subjects' 4 flexible slots (alongside Know, Era, See, and the bonus categories), not a required field. For Person Subjects where it doesn't generalize cleanly (most non-rulers), authors simply don't write it and fill that slot with something else — Legacy, Nickname, or Contemporaries, for instance. |
| **Match / Order** | See the shared Mark 7: Match & Order system below | Originally scoped for Person only; now shared across all three Subject types. |

### Life events content (Person-specific)

Every Person Subject Pack still includes **5 curated life-event entries**, each with `{event label, place, year}` — for example, for Einstein: Birth (Ulm, 1879), Published Special Relativity (Bern, 1905), Nobel Prize (Stockholm, 1922 — awarded for the photoelectric effect), Death (Princeton, 1955).

Entry #1 (typically Birth) is consumed by Mark 1 (Pin). The remaining 4 feed Mark 7 under the shared Match & Order system below — the content author picks whichever mode (`subject_to_year`, `subject_to_place`, `subject_to_event`, or `order`) best fits that person's specific events, subject to the 15-year rule described there.

### Bonus knowledge categories (Person)

Reworked from the Location pack's v2 fields:

| Location field | Person equivalent |
|---|---|
| Nickname | Epithet (e.g., Cleopatra's honorifics) — ports over cleanly |
| Language | Language(s) they spoke/wrote in — ports over cleanly |
| Flag | Flag of the nation/empire they're most associated with |
| World Firsts | A personal first ("first to circumnavigate...", "first pharaoh to...") |
| Inventions | Only fits inventor/scientist subjects as-is; should generalize to a broader **Legacy / Signature Achievement** field so it applies to rulers, artists, and explorers too |
| Flag Meaning | Carries over unchanged (meaning of a symbol/color on their associated flag) |

Two new categories proposed, with no Location equivalent: **Contemporaries** (who else was active at the same time — naturally Match-shaped content) and **Relationships** (spouse, mentor, rival — also naturally Match-shaped).

---

## Subject Type Design: Event

*Example subjects: Battle of Culloden, outbreak of Spanish Flu, Krakatoa eruption.*

| Mark | Content | Notes |
|---|---|---|
| **Pin** | Where it happened — battlefield, epicenter, island | The cleanest Pin fit of all three Subject types; no per-subject flexibility needed. |
| **When** | Date it began/occurred | The cleanest When fit of all three Subject types. |
| **Know** | What triggered it, or what it's known as | Unchanged mechanic. |
| **See** | Painting, photo, map, or artifact from the event | Unchanged mechanic. |
| **Era** | Broader historical/political context | Unchanged mechanic. |
| **Succession** | Direct consequence/aftermath (e.g., Culloden → Highland Clearances; Krakatoa → global climate effects) | Generalizes **better** for Event than for Person — cause-and-effect is well-documented for historical events, so this mark stays load-bearing here, unlike for Person. |
| **Match / Order** | Drawn from the shared Mark 7 system below | No longer split into a v1/v2 pattern — Event Subjects choose among the same four modes (`subject_to_year`, `subject_to_place`, `subject_to_event`, `order`) as Location and Person, per-subject, under the same 15-year rule. |

### Bonus knowledge categories (Event)

Reworked from the Location pack's v2 fields: **Nickname** (the event's popular/alternate name — e.g., "Spanish Flu" wasn't actually Spanish, a built-in misconception hook), **Flag** (flags of the factions/nations involved), **Inventions** (technology or tactics born from the event), **World Firsts** (a documented first tied to the event).

### Sensitivity note (resolved: applies every time)

Sensitive tone/framing guidelines apply to casualty figures and disaster content in **every** Event Subject — this is now standing policy, not a case-by-case editorial call. What's still needed is the concrete style guide itself (rounding conventions for large casualty figures, language to avoid, how much detail is appropriate) — a separate content-guidelines workstream, tracked in Open Questions below, distinct from the now-resolved question of whether the policy applies.

---

## Mark 7: Match & Order — Shared System (all Subject types)

Originally scoped for Person only, Mark 7's content model is now a single, subject-type-agnostic system available to Location, Person, and Event Subjects alike. This also resolves what would otherwise have needed a separate Event-specific Match design — Event draws from the same system as everyone else rather than needing its own v1/v2 split.

**Content model:** every Subject Pack's Mark 7 content is a set of curated items, each capturing `{item label, match value, year}` — for a Location Subject, items might be rulers (item label) matched to their reign years; for a Person Subject, items are life events matched to a place, year, or associated fact; for an Event Subject, items might be key figures or phases of the event matched to a place, date, or outcome.

**Four content modes, chosen per Subject by the content author:**

| Mode | What's matched | Interaction |
|---|---|---|
| `subject_to_year` | Item ↔ a year | Tap-to-pair, two text columns |
| `subject_to_place` | Item ↔ a place name | Tap-to-pair, two text columns |
| `subject_to_event` | Item ↔ a related fact/event description | Tap-to-pair, two text columns |
| `order` | A shuffled list of items, arranged into chronological sequence | Tap-to-select sequence — **no drag-and-drop.** Each tap assigns the next open position; retappable before lock-in. |

**Firm authoring rule:** use `order` whenever the day's 4 Mark-7 items span **fewer than 15 years** start-to-finish; otherwise, choose whichever of the three `subject_to_*` modes best fits what's actually interesting/available for that Subject (author's discretion). This directly resolves the clustered-dates problem raised earlier in this spec: `subject_to_year` stays a legitimate mode, it's just gated to Subjects whose items are spread out enough that year-distractors are meaningfully different from the correct answer.

**Scoring:**
- `subject_to_year` / `subject_to_place` / `subject_to_event`: existing Match partial-credit formula — correct pairs ÷ total (4).
- `order`: pairwise/inversion-based partial credit — correct pairs ÷ 6 (the 6 possible orderings among 4 items). A single adjacent swap scores 5/6 rather than being graded as fully wrong, consistent with PastMark's "how right, not just right/wrong" philosophy. Exact-position scoring was considered and rejected as too punishing for near-miss answers.

**Engineering note:** `order` is a genuinely new interaction mechanic — a tap-to-sequence UI plus pairwise scoring logic — even though it lives in the same Mark 7 slot as the three Match modes. Scope and estimate it as new build work.

### Data model: `subject_match_items`

Widened from the originally-planned `match_pairs` table (renamed — that table was created empty, so there's no migration cost to renaming it now) to hold all four modes in one place:

```
subject_match_items
  id
  subject_id        (FK)
  mode              ('subject_to_year' | 'subject_to_place' | 'subject_to_event' | 'order')
  item_label         text          -- the left-side item (a ruler, a life event, a figure, a phase)
  match_value        text NULL     -- the right-side answer for the three subject_to_* modes
                                    -- (a year, a place, or a fact/event description depending on mode)
  correct_position   smallint NULL -- used only when mode='order': correct 1–4 sequence position
  year               int NULL      -- numeric year backing the item; used to enforce the 15-year rule,
                                    -- to derive correct_position for 'order', and as match_value's
                                    -- source when mode='subject_to_year'
  sort_order         smallint      -- authoring/shuffle-source display order
```

Integrity is enforced with a CHECK constraint rather than a strict per-mode table split:

```
CHECK (
  (mode IN ('subject_to_year','subject_to_place','subject_to_event')
    AND match_value IS NOT NULL AND correct_position IS NULL)
  OR
  (mode = 'order' AND correct_position IS NOT NULL AND match_value IS NULL)
)
```

One table keeps the Mark 7 content fetcher to a single query per Subject regardless of mode, and keeps content-authoring/admin views from needing a UNION across mode-specific tables. See Data Architecture below for how this fits the broader single-`subjects`-table decision.

---

## Data Architecture

**Decision: single `subjects` table for all three Subject types (Location, Person, Event).** Not separate tables per type, not a core-plus-extension-table hybrid.

**Rationale:** All three types share an identical 7-Mark gameplay structure — the core columns (Pin, When, Know, See, Era, Succession, Match/Order config) are the same shape regardless of subject_type. A shared table keeps every cross-type feature simple: Daily subject selection, Collections (a single Collection can already span types — e.g., a "Byzantine Empire" Collection could hold Constantinople the Location alongside a future Byzantine Person or Event), subject-variety rotation, and cross-subject linking (Cleopatra [Person] → Alexandria [Location] → Battle of Actium [Event]) all query one table with no UNIONs or joins. Not all columns apply to all types, and that's expected — nullable fields are the right tradeoff against the query complexity of separate tables.

**Reconciling with the existing schema:** The *Subject Pack - Supabase Import Plan* doc shows the `subjects` table already built this way in spirit — one row per Subject Pack, with Pin/When/Era/Succession/Know/See held as direct columns — which validates the single-table direction independently of this brainstorm. Two additions are needed to carry it forward to Person and Event:

1. **Add a `subject_type` column** (`location` / `person` / `event`) to `subjects`. It doesn't exist yet because only Location has shipped.
2. **Replace the earlier flat-bonus-fields plan with a `subject_questions` table.** An earlier draft of this spec proposed a flexible `attributes JSONB` column on `subjects` for the v2 bonus categories. The flexible-pool model (see the Daily Gameplay PRD v3) changes what's actually needed: a Subject can now have **multiple candidate questions per type** — e.g., three different Know candidates, of which one ships — each needing its own selection flag. That's a repeating-row shape, not a flat per-subject blob, so JSONB is the wrong fit. Recommend a dedicated table:

   ```
   subject_questions
     id
     subject_id       (FK)
     mechanic_type     ('know' | 'see' | 'era' | 'succession' | 'nickname' | 'language'
                         | 'flag' | 'flag_meaning' | 'current_country' | 'legacy'
                         | 'world_firsts' | 'contemporaries' | 'relationships' | ...)
     prompt            text
     correct_answer    text  -- or a reference into subject_images for mechanic_type='see'
     distractors       text[]  -- 3 distractors, existing MC pattern
     is_selected       boolean  -- true for the ~4 that ship in this Subject's actual daily 7
     slot_position     smallint NULL  -- 3-6, set only when is_selected = true
     pair_group_id     uuid NULL      -- shared across two rows that are companion questions;
                                       -- NULL for standalone flexible-slot candidates
     pair_order        smallint NULL  -- 1 or 2: which half of the pair displays first
   ```

   This absorbs the Location pack's existing `era`, `succession`, `know_1/2/3` columns plus all v2 bonus fields into one extensible, queryable shape. A Subject can hold 10–20 rows here (per the Daily PRD's flexible-pool guidance) with only ~4 flagged `is_selected`. `see`-type rows reference the existing `subject_images` table for their image options rather than duplicating that data.

   **Companion pairs.** Some flexible-slot questions are only fully satisfying as a linked duo — a current-country question ("What country is Constantinople in today?") naturally leads into a current-name question ("What is Constantinople called today?"); a Flag image-choice naturally leads into a Flag Meaning question about the specific symbol on *that* flag. `pair_group_id` links two `subject_questions` rows as a bonded unit: selecting one for `is_selected` requires selecting its partner too, and the two always occupy consecutive `slot_position`s in the order set by `pair_order`, regardless of where their individual `mechanic_type` would otherwise rank in the priority-order list. A pair still counts as 2 rows toward the "at least 4 flexible candidates" minimum — a Subject could ship with 2 pairs (4 rows), 1 pair + 2 standalone questions, or 4 standalone questions, all satisfying the same rule. Pairing is authored per-row-pair, not as a fixed rule tied to `mechanic_type` — because Flag Meaning's correct answer depends on which specific flag was shown, it only makes sense linked to one particular Flag row, not to the type in general. This mechanism isn't Location-specific; any two candidate questions for any Subject type can be linked this way when they read better together than apart.

3. **Widen and rename `match_pairs` to `subject_match_items`.** It currently holds nothing (Mark 7 content hasn't been authored for Location either), so there's no migration cost to renaming it now. The widened table holds all four Mark 7 modes (`subject_to_year`, `subject_to_place`, `subject_to_event`, `order`) in one place, with a CHECK constraint enforcing which columns are required per mode. Full schema and rationale are under "Mark 7: Match & Order — Shared System" above.

Together, `subjects` (holding the Pin and When anchors as direct columns), `subject_match_items` (the Match/Order anchor), and `subject_questions` (the flexible pool) mirror the anchor-plus-pool split in the Daily Gameplay PRD v3 exactly. The `attributes` JSONB column from earlier drafts of this spec is no longer needed for bonus fields — it can be dropped from the plan, or kept minimal for genuinely one-off, non-repeating metadata that doesn't fit a question shape (e.g., a content-sensitivity flag).

No changes are needed to `collections` or `subject_collections` — those already work across any `subject_type` value without modification.

---

## User Stories

- As a content author, I want to choose among matching an item to a year, a place, or a related event — not just a place — so that I can pick whichever content is most interesting and available for that day's Subject.
- As a content author, I want a firm rule (use Order under 15 years) rather than pure discretion for choosing Order vs. a Match mode, so that content stays consistent as the Subject library grows.
- As a player, I want a single adjacent-order mistake on the Order mark to cost me less than a completely scrambled answer, so that the scoring feels proportionate to how close I actually was.
- As a player, I want Cleopatra's Pin (Mark 1) and her Match/Order round (Mark 7) to reference different places, so that Mark 7 teaches me something new rather than just repeating what I already learned in Mark 1.
- As a content author, I want Event Subjects to reuse the exact same 7-Mark shape as Location and Person, so that I don't need a different authoring template per type.
- As a product owner, I want Location, Person, and Event Subjects to share one Collections and rotation system, so that "today's theme" can be any of the three types without special-casing in the Daily selection logic.

## Requirements

### P0 — Must-Have

**Person Subject type**
- All 7 Marks implemented per the Person table above: the Life Events content model supplies the Pin and Match/Order anchors (5 entries, 1 to Pin, 4 to the shared Mark 7 system), and the remaining 2 flexible slots (of the standard 4) are filled from the Person question pool (Know, Era, See, Succession, and bonus categories — Succession included only when it genuinely fits).
- *Acceptance:* A Person Subject Pack cannot be published unless it supplies all 5 life-event entries with event label, place, and year for each, plus at least 4 flexible-slot candidate questions per the Daily Gameplay PRD's content requirement.

**Event Subject type**
- All 7 Marks implemented per the Event table above, with Mark 7 drawn from the shared Match & Order system.
- *Acceptance:* An Event Subject Pack cannot be published unless it supplies all fields the existing Subject Pack data model already requires (per the Daily PRD's P0 content requirement), adapted to Event's framing.

**Mark 7: Match & Order shared system**
- Four content modes (`subject_to_year`, `subject_to_place`, `subject_to_event`, `order`) available to all three Subject types, chosen per-subject by the content author, gated by the 15-year rule (use `order` when the 4 items span fewer than 15 years).
- `subject_match_items` table (widened/renamed from the originally-planned `match_pairs`) implemented per the schema above, with its CHECK constraint.
- New tap-to-sequence UI component for `order` (shuffle items, tap to assign position, retap to change, explicit lock-in — no drag-and-drop).
- Pairwise partial-credit scoring for `order` (correct pairs ÷ 6 for 4 items); existing Match partial-credit formula (correct pairs ÷ 4) for the three `subject_to_*` modes.
- *Acceptance:* Given a completed Mark 7 with a known correct answer set and a player's submission, the displayed score matches the formula for that item's mode (pairwise for `order`, pairs-correct-÷-4 for the others).

**Data architecture**
- `subjects.subject_type` column added; `subject_questions` table added for the flexible-slot pool (superseding the earlier `attributes` JSONB plan). `subject_match_items` table added (widened/renamed from `match_pairs`) with the four-mode CHECK constraint.
- *Acceptance:* A Location, Person, and Event Subject can all be inserted into the same `subjects` table without schema errors, and existing Location rows continue to import unchanged.

**Companion pairs (flexible-slot pairing)**
- `subject_questions.pair_group_id` / `pair_order` implemented; selection logic (wherever "is this Subject Pack complete" and "assign slot positions" get computed — likely a content-authoring tool and/or the Daily selection service) enforces that selecting one half of a pair selects the other, and that paired rows always land in consecutive `slot_position`s.
- Two example pairs to seed content with: **Current Country ↔ Current Name** (new `current_country` type paired with a `know`-type row), and **Flag ↔ Flag Meaning** (existing v2 bonus types, now explicitly linked instead of independently selectable).
- *Acceptance:* A Subject Pack cannot be published with exactly one half of an authored pair marked `is_selected` — either both ship or neither does.

### P1 — Nice-to-Have (fast follow)

- **Sensitivity/style guide for Event content** — concrete rules for framing casualty figures and disaster content (rounding conventions, language to avoid, level of detail), operationalizing the now-resolved "applies every time" policy above.

### P2 — Future Considerations

- **Scale/Magnitude mechanic** — a decay-scored slider for death toll, eruption magnitude (VEI), or army size, for Event Subjects. Not built now, but the `subjects`/JSONB approach shouldn't block adding it later.
- **Contemporaries and Relationships** as first-class Match-round content types for Person, beyond the initial bonus-category listing.

## Open Questions

- **Which pairs are canonical vs. author's discretion:** Current Country↔Current Name and Flag↔Flag Meaning are confirmed here, but should there be a maintained list of "recommended" companion pairs content authors are pointed to, or is any two-question pairing fair game whenever an author judges they read better together? *(Owner: content/product)*
- **Flexible-slot minimum per Subject type:** the Daily PRD sets a floor of "at least 4" flexible candidates system-wide — is 4 also sufficient specifically for Person Subjects, where Succession (one of the original four core types) may be unavailable and Know/Era/See plus bonus categories need to cover the gap? Worth checking once a few real Person Subjects are authored. *(Owner: content/product)*
- **Event content style guide:** the policy that sensitivity guidelines apply to every casualty/disaster-related Event Subject is resolved — the guidelines themselves (rounding conventions, language to avoid, level of detail) still need to be written. *(Owner: content/legal)*
- **`subject_to_event` mode semantics:** defined generically here as "item ↔ a related fact/event description," but not yet pressure-tested against real content — worth revisiting once a handful of subjects have actually been authored with it, to confirm it reads as genuinely distinct from `subject_to_place` in practice. *(Owner: content/product)*

## Timeline Considerations

No hard deadline specified. Suggested phasing:

1. **Phase 1:** Data architecture changes (`subject_type`, `subject_questions`, `subject_match_items`) — unblocks all authoring work below it. Person Subject type (3 anchors + 4 flexible slots, no Succession blocker). Event Subject type (all 7 Marks, using the shared Mark 7 system from day one — no separate later phase needed for Event's Match content). Order mechanic (tap-to-sequence UI, pairwise scoring).
2. **Phase 2 (future):** Sensitivity/style guide for Event content; `subject_to_event` mode semantics revisited once real content exists.
3. **Phase 3+ (future):** Scale/Magnitude mechanic for Event; Contemporaries/Relationships as structured Match content for Person.

Dependency to flag: Order is new engineering scope not previously estimated anywhere in the original Daily PRD — should be sized before committing Person Subjects to a launch date.
