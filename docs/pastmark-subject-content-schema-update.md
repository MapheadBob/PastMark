# PastMark — Subject Content Schema Update (Spec v1)

**Status:** Draft — informed by the real 175-subject content workbook (75 Person + 50 Event + 50 Location)
**Owner:** TBD (Product/Engineering)
**Scope:** Reconciles the DB schema landed in [PR #6](https://github.com/MapheadBob/PastMark/pull/6) (`subjects`, `subject_questions`, `subject_match_items`) against the actual authored content, and specifies the schema changes needed before that content can be imported.
**Relationship to other docs:** Extends *PastMark — Person & Event Subject Types* (`pastmark-person-event-spec.md`), which this content was authored against.

---

## Source reviewed

Google Sheet "PastMark Full Subject Pack — 175 Subjects" (75 Person + 50 Event + 50 Location), four tabs:

1. **Subjects** — one row per subject, 26 columns (Pin/When anchor data plus narrative/editorial fields).
2. **Match_Order_Items** — 700 rows (4 per subject), the Mark 7 content.
3. **Flexible_Questions** — 950 rows (4 per Person/Event subject, up to 9 per Location subject), the Marks 3–6 candidate pool.
4. **Notes** — a changelog/methodology tab documenting authoring conventions, research methodology, and (helpfully) an explicit note on where new fields should land in the DB.

The workbook is large enough that a full read was truncated by tooling; the sample pulled (~95 Subjects rows, ~275 Match_Order_Items rows, ~250 Flexible_Questions rows, full Notes tab) was large enough to identify every structural mismatch below with high confidence, cross-checked against the Notes tab's own explicit column-by-column definitions.

## What already matches, unchanged

- `subject_questions` (mechanic_type/prompt/correct_answer/distractors/is_selected/slot_position) matches **Flexible_Questions** closely. Real content only fills exactly 4 rows per Person/Event subject (no surplus pool yet), but Location subjects average ~9 candidates for 4 slots — confirming `is_selected`/`slot_position` are still doing real work, just not yet exercised by Person/Event authoring.
- `pair_group_id`/`pair_order` (companion pairs) — unused in current content, still a valid forward-looking feature.
- `pin_prompt`/`when_prompt` and the reveal-fact fields conceptually match `pin_fact`/`when_fact` already in the schema — the Notes tab even calls out (line 679) that these belong as direct columns on `subjects`, confirming the single-table direction. Renaming ours to match their vocabulary (`pin_reveal_fact`/`when_reveal_fact`) below.
- `collections`/`subject_collections` — `suggested_collections` is a comma-separated tag list per subject; this is import-time data, not a schema change.
- Only 3 of the 4 Match/Order modes are used anywhere in the 175-subject set (`subject_to_year`, `subject_to_place`, `order` — zero uses of `subject_to_event`), consistent with the original spec's Open Question flagging that mode's semantics as untested.

## What needs to change

### 1. `subjects` is missing columns the content actually needs

The Subjects tab carries several fields with no home in the current schema:

| Sheet column | New `subjects` column | Notes |
|---|---|---|
| `short_description` | `short_description text` | One-line summary, all types. |
| `when_label` | `when_label text` | Short label for what the date represents (e.g. "Annus Mirabilis (special relativity published)"). |
| `when_date_display` | `when_date_display text` | Human-formatted date string ("16 April 1746", "morning June 18") — `when_true_year` alone can't carry this. |
| `when_precision` | `when_precision text check (in ('year','month','day'))` | New concept; not in the original schema at all. |
| `match_order_rationale` | `match_order_rationale text` | Editorial rationale for the chosen Mark 7 mode (e.g. "4 items span 22 yrs > 15-yr threshold"). One per subject, not per item. |
| `era` / `succession` | `era_note text` / `succession_note text` | Full-sentence narrative facts, not the MC question itself (that lives in `subject_questions` under `mechanic_type = 'era'/'succession'`). Renamed with an `_note` suffix to avoid confusion with the mechanic type. |
| `know1_fact` / `know3_fact` | `know_fact_1 text` / `know_fact_2 text` | Same story as era/succession — narrative color, not the MC question. Renumbered 1/2 (source data skips "know2" for no evident reason). |
| `country_region` | `country_region text` | Originally Location-only; the content team generalized it to Person/Event too (e.g. "Ptolemaic Kingdom of Egypt (Egypt)"). |
| `continent` | `continent text` | Same generalization as above. |
| `sensitivity_flag` | `sensitivity_note text` (nullable; `NULL` = not flagged) | Directly operationalizes the original spec's unresolved "Event content sensitivity" open question — real data already carries per-subject reasons (e.g. "Review - battlefield casualties; keep tone factual/educational..."), and it's not Event-only: several Person subjects are flagged too (executions, assassinations, colonization). |
| `source_notes` | `source_notes text` | Research citations (Wikipedia/Britannica/etc.), editorial-only, never shown to players. |

Also renaming for vocabulary alignment with the content team (no functional change): `pin_fact` → `pin_reveal_fact`, `when_fact` → `when_reveal_fact`.

**Resolved:** the sheet has no per-subject `when_min_year`/`when_max_year` range at all — the slider range is computed at runtime rather than authored. `when_min_year`/`when_max_year` stay as optional per-subject overrides (`NULL` = "use the computed default"). The default is **100 years before the oldest year fact anywhere in the corpus, through the current year** — computed live, not a static authored value, since both ends move as content is added and time passes. "Oldest year fact" is taken across both `subjects.when_true_year` and `subject_match_items.year`, since a subject's own Match/Order items can predate the date its When mark anchors on (e.g. Cleopatra's earliest life-event item is older than her death date). See `default_when_slider_min_year()` / `default_when_slider_max_year()` / `subject_when_slider_range(subject_id)` in the schema.

### 2. `subject_match_items` — the generic `match_value` design doesn't match reality

The original schema (per the Person/Event spec) used one polymorphic `match_value text` column whose meaning depended on `mode`. The actual Match_Order_Items data doesn't work that way: **every row carries both a place and a year, regardless of mode** — confirmed across all 275 sampled rows, 0 blanks in either column. `mode` just picks which fact is quizzed; it isn't gating which facts exist. This matches the Person spec's own life-event model (`{event label, place, year}`) generalized to every subject type, not just Person.

The sheet also always fills `correct_position` (mirroring `sort_order` 1-for-1 on every sampled row, even for `subject_to_year`/`subject_to_place` items), which the current CHECK constraint would reject outright (it requires `correct_position IS NULL` for non-`order` modes).

**Change:** replace `match_value` with concrete `place` and `year` columns (both effectively always populated), add `related_fact` for the still-unused `subject_to_event` mode, and relax the CHECK to only require what each mode actually needs instead of forbidding the rest:

```
subject_match_items
  id
  subject_id        (FK)
  mode              ('subject_to_year' | 'subject_to_place' | 'subject_to_event' | 'order')
  item_label        text not null
  place             text not null   -- was match_value; always present in real content
  year              int  not null   -- always present in real content, any mode
  related_fact      text null       -- for subject_to_event; unused by any of the 175 subjects so far
  correct_position  smallint null   -- required + unique only when mode = 'order'
  sort_order        smallint not null
  notes             text null       -- research citation and/or a finer display date, per the sheet's Notes column

CHECK (
  (mode != 'subject_to_event' or related_fact is not null)
  and (mode != 'order' or correct_position is not null)
)
```

Note on BC dates: the sheet encodes them as simple negation (30 BC → `-30`, not astronomical year numbering where 30 BC would be `-29`). `year`/`when_true_year` being plain `int` already handles negative values fine — just documenting the convention so a future importer doesn't introduce an off-by-one.

### 3. `subject_questions` — one small addition

Add `notes text null`, mirroring the Flexible_Questions tab's own Notes column (research citations). Everything else about the table already fits.

## Non-changes worth confirming explicitly

- No new mechanic types needed — every `mechanic_type` seen in the sample (`know`, `era`, `legacy`, `contemporaries`, `nickname`, `world_firsts`) is already in the existing CHECK list.
- No changes to `collections`, `subject_collections`, `subject_images`, or the publish-validation / companion-pairing / 15-year-rule triggers — none of them reference the columns being renamed or restructured.

## Full-corpus import (175/175 subjects)

The earlier sections were based on a partial read of the workbook (tooling truncation). Once the full workbook was pulled (exported as `.xlsx` and parsed directly, bypassing the truncated markdown conversion), it validated almost everything above and surfaced three more things, all landed in `20260918000000_prep_for_content_import.sql` and `20260918010000_import_175_subject_pack.sql`:

- **`mechanic_type` was missing four values the Location batch actually uses**: `know_landmark`, `see_location`, `see_landmark`, `inventions` — more specific than the generic `know`/`see` Person/Event uses. Added to the CHECK constraint.
- **Publish validation only fired on `UPDATE`**, so a row inserted with `status = 'published'` directly skipped it entirely. Fixed to also run on `INSERT` (in practice a subject can never legitimately publish on its own `INSERT` anyway, since its Match/Order items and questions are FK'd to it and can't exist yet — so this only closes a bypass, it doesn't change the real import flow, which is insert-as-draft → add children → update to published).
- **`subjects.external_id`** added (`text unique`) to hold the workbook's own ids (`P001`, `E001`, `L001`, ...), so this and future imports can match rows by source id instead of a generated UUID.

One real content gap, resolved with a documented default rather than a schema change: **Location subjects author 9 Flexible_Questions candidates each (Person/Event only ever author exactly 4), and the workbook carries no `is_selected` flag** to say which 4 of a Location subject's 9 should ship. The import selects the lowest 4 `slot_number`s per subject and leaves the other 5 as an unselected candidate pool (available for future admin re-selection tooling). This is a judgment call, not a discovered fact — flagging it here in case product wants a different default (e.g. prioritizing variety across mechanic types rather than raw slot order).

Full-corpus validation, against a local embedded Postgres: all 175 subjects, 700 Match/Order items, and 950 flexible questions imported and every subject published cleanly — meaning the entire real corpus satisfies the schema's NOT NULL constraints, the mode-uniformity trigger, the 15-year Order rule, and the publish-completeness trigger with zero exceptions or manual fixes needed.

## Next steps

1. ~~Land the schema changes above as an update to the two migrations in PR #6~~ — done (PR #6, then #7 after #6 merged first).
2. ~~Re-verify against a local embedded Postgres~~ — done, including the full 175-subject import.
3. ~~Write the actual import script mapping sheet rows → tables~~ — done (`20260918010000_import_175_subject_pack.sql`, generated from the workbook, not hand-written — regenerate from source rather than hand-editing).
4. Apply these migrations to the real Supabase project (`supabase db push` or equivalent) — not done here, since this repo has no live Supabase project connection configured.
