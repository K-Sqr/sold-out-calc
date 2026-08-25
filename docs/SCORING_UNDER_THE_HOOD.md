# Under the hood — Stage, Fit Score & Fit Status

How the Stage Diagnostic auto-fills **Estimated Stage**, **Paid Fit Score**,
**Fit Status**, **Revenue Gap**, and **Recommended Sold-Out Engine** — and how
the team overrides those calls with human judgement.

> **Source of truth:** all of this logic lives in one place —
> `scripts/google-apps-script/DiagnosticCode.gs` (`scoreSubmission_` and the
> helpers below it). The frontend form only collects answers; it does **not**
> score. Edit the `.gs` file, save, then **Deploy → Manage deployments → Edit →
> New version** for changes to go live.

---

## The pipeline (what happens on every submission)

```
Founder fills /diagnostic
        ↓
Answers POST to Apps Script
        ↓
scoreSubmission_(answers)
  ├─ estimateStage_        → Estimated Stage
  ├─ paidFitScore_         → Paid Fit Score (0–100)
  ├─ fitStatus_(score)     → Fit Status
  ├─ revenueGap_           → Revenue Gap
  └─ routeBottleneck_      → Primary Growth Lever + Bottleneck + Engine
        ↓
Row written to Diagnostics sheet (auto columns + blank Notes / Next Step /
Follow-Up / Secondary Bottleneck for the team)
        ↓
/snapshot builder loads the row as a draft — every field is editable
```

Nothing is locked. Automation is a **first draft**. The sheet and the Snapshot
Generator exist so you can disagree with the algorithm and leave a trail.

---

## 1. Estimated Stage

**Function:** `estimateStage_`

Stage is driven almost entirely by **approx. monthly revenue**
(`monthly_revenue`). Number of drops launched is checked but currently does
not change the outcome (both branches land on Beta).

| Monthly revenue answer | Estimated Stage |
| --- | --- |
| `$100K+ / month` (`100k_plus_mo`) | **Adaptation / Diversify** |
| `$30K – $100K / month` (`30k_100k_mo`) | **Growth / Scale + Stabilize** |
| `$10K – $30K / month`, `Under $10K / month`, blank, or no drops | **Beta / Prove It** |

### Is this too harsh / too loose?

- **Harsh:** a brand doing ~$25K/mo with many solid drops still lands in Beta.
- **Loose:** a brand barely at $30K/mo jumps straight to Growth with no other proof.
- **Dead path today:** `num_drops > 0` is read but never upgrades stage. If you
  want “has launched” to matter, that’s the first knob to turn in
  `estimateStage_`.

---

## 2. Paid Fit Score (0–100)

**Function:** `paidFitScore_`

Rough signal: *“Is there enough proven economics for a first paid install?”*
Higher = more to work with. Score is clamped to `0–100`.

Theoretical max today is **~90** (no path reaches 100).

### Point breakdown

| Signal | Condition | Points |
| --- | --- | --- |
| Has launched at least one drop | `num_drops > 0` | **+15** |
| Monthly revenue | Under $10K/mo | **+5** |
| | $10K – $30K/mo | **+20** |
| | $30K – $100K/mo | **+35** |
| | $100K+/mo | **+30** *(slightly less — may need a future engine)* |
| Owned audience (email + SMS + community) | ≥ 10,000 | **+15** |
| | ≥ 2,500 | **+10** |
| | ≥ 500 | **+6** |
| Gross margin | 60–75% or 75%+ | **+10** |
| | 40–60% | **+5** |
| Drops profitable after costs | Yes | **+5** |
| Runs paid ads | Yes | **+5** |
| Has a next-drop revenue goal | `next_drop_goal > 0` | **+5** |

### Worked example (score ≈ 65 → “Likely fit”)

A brand that has launched, sits in the $10–30K band, has a mid-size list,
decent margins, profitable drops, ads on, and a goal:

| Piece | Points |
| --- | --- |
| Launched | 15 |
| $10K–$30K/mo | 20 |
| Owned list ≥ 2,500 | 10 |
| Margin 60%+ | 10 |
| Profitable drops | 5 |
| Runs ads | 5 |
| Has next-drop goal | 5 |
| **Total** | **70** |

Dial any of those down (smaller list, weaker margin, no ads) and you land
around the **60** threshold that flips Fit Status.

### What the score ignores (on purpose, for now)

Offer clarity, attention/5-second tests, launch chaos, retention, operating
maturity, Instagram/TikTok size alone, AOV, sell-through — none of these add
points today. They feed the **Snapshot category scorecard** (manual Weak /
Moderate / Strong) and the founder’s self-selected bottleneck, not the
numeric fit score.

---

## 3. Fit Status (likely fit or not)

**Function:** `fitStatus_(answers, score)`

Coarse triage bucket from the numeric score, with one hard override for very
large brands.

| Rule (checked in order) | Fit Status written to the sheet |
| --- | --- |
| Monthly revenue is `$100K+ / month` | **Review — possible future engine** |
| Paid Fit Score **≥ 60** | **Likely fit** |
| Paid Fit Score **≥ 35** | **Maybe — needs review** |
| Paid Fit Score **< 35** | **Not yet** |

So “likely fit” is not a separate model — it is literally **score ≥ 60**,
unless they’re already at $100K+/mo (then they’re flagged for a future /
advanced path instead of V0).

### Threshold intuition

| Score band | Algorithm says | Typical read |
| --- | --- | --- |
| 60–90 | Likely fit | Enough revenue + list + economics to justify a paid install conversation |
| 35–59 | Maybe — needs review | Partial signal; don’t auto-yes or auto-no |
| 0–34 | Not yet | Too early / not enough infrastructure |
| any + $100K+/mo | Review — possible future engine | Out of V0 scope by size |

### Calibrating harsh vs loose

Two knobs only:

1. **Point weights** in `paidFitScore_` — raise/lower what “counts.”
2. **Cutoffs** in `fitStatus_` — e.g. move Likely fit from `60` → `55` (looser)
   or `70` (harsher).

If the team keeps overriding “Likely fit” down to “Not yet,” the algorithm is
too loose. If you keep upgrading “Not yet” / “Maybe” to “Likely fit,” it’s too
harsh. Track those overrides (see below).

---

## 4. Recommended Sold-Out Engine (and bottleneck)

**Function:** `routeBottleneck_`

This is **not** inferred from the score. The founder picks
“What feels like the biggest constraint right now?” (`bottleneck`). That
answer maps 1:1 to a primary growth lever + engine label.

| Founder picks (constraint) | Primary Growth Lever | Recommended Engine |
| --- | --- | --- |
| Product / offer is not clear enough | Offer | Sold-Out Offer Engine |
| People don’t understand why it’s special | Attention | Sold-Out Attention Engine |
| Not enough people ready to buy before launch | Demand | Sold-Out Demand Engine |
| Too dependent on IG / TikTok reach | Demand | Sold-Out Demand Engine |
| AOV is too low | Offer | Sold-Out Offer Engine |
| Margins are too tight | Offer | Sold-Out Offer Engine |
| Launch day is chaotic | Launch | Sold-Out Launch Engine |
| Drops are inconsistent | Operating Rhythm | Sold-Out Operating Rhythm |
| Buyers but not enough repeat | Aftermath | Sold-Out Aftermath Engine |
| Paid ads are not profitable | Offer | Sold-Out Offer Engine |
| Not sure | Needs review | Needs manual review |

Engines are **routing labels** today (modules not built yet). Secondary
bottleneck is left blank for the team.

---

## 5. Revenue Gap

**Function:** `revenueGap_`

```
next_drop_goal − midpoint(last_drop_revenue range)
```

Last-drop midpoints used:

| Last drop range | Midpoint used |
| --- | --- |
| Under $10K | $5,000 |
| $10K – $25K | $17,500 |
| $25K – $50K | $37,500 |
| $50K – $100K | $75,000 |
| $100K+ | $125,000 |

If there’s a goal but no last-drop range, the gap is just the goal itself.
If there’s no goal, the gap is blank.

---

## 6. Human judgement — where you override, and how to spot drift

The product is built so **your call wins**. Use that on purpose.

### Where to override

| Place | What you can change | Shared with founder? |
| --- | --- | --- |
| **Diagnostics sheet** | Any internal column (stage, score, fit, engine, notes, next step, follow-up) | No |
| **`/snapshot` builder → founder panel** | Stage, revenue, bottleneck, engine, next step, CTA | Yes (in the share link) |
| **`/snapshot` builder → Internal scoring & routing** | Paid Fit Score, Fit status, follow-up, notes, 10-category scorecard | **No** — stays with the team |

Workflow that keeps the algorithm honest:

1. Load the submission in `/snapshot` (auto-fill from sheet scoring).
2. Leave the **algorithm’s** Paid Fit Score / Fit status as-is first.
3. Put **your** Fit status (and notes: “too harsh — strong waitlist”) in
   Internal scoring & routing / Notes.
4. Over time, count how often you flip Likely ↔ Maybe ↔ Not yet.

### Category scorecard (manual, separate from the 0–100)

In the builder, ten levers can each be marked Weak / Moderate / Strong:

Revenue Stage · Paid Fit · Revenue Gap · Drop Economics · Offer Strength ·
Attention Clarity · Demand Structure · Launch Execution · Retention /
Aftermath · Operating Maturity

This is **team judgement**, not auto-scored from the form. Use it when the
numeric fit score looks fine but a specific lever is clearly broken (or the
reverse).

### Label mismatch to be aware of

The Apps Script writes fit labels like **Likely fit / Maybe — needs review /
Not yet / Review — possible future engine**.

The Snapshot builder dropdown offers a slightly different set:
**Too Early / V0 Fit / Advanced / Future Module / Not Fit / Needs Manual Review**.

When you load a row, you may see the algorithm’s wording in the field even if
it’s not in the dropdown list. Map them mentally as:

| Algorithm (sheet) | Closest team dropdown |
| --- | --- |
| Likely fit | V0 Fit |
| Maybe — needs review | Needs Manual Review |
| Not yet | Too Early / Not Fit |
| Review — possible future engine | Advanced / Future Module |

Aligning these labels (so sheet and builder use one vocabulary) is a small
cleanup if the mismatch starts confusing reviews.

---

## 7. Quick “is the algo wrong?” checklist

When a row feels off:

1. **Stage wrong?** → Only look at `monthly_revenue`. Everything else is ignored today.
2. **Score feels high/low?** → Recompute from the point table in §2. Owned list
   and monthly band dominate.
3. **Fit status disagree?** → Check whether score sits just above/below 60 or 35,
   or whether $100K+/mo forced the “future engine” path.
4. **Wrong engine?** → They self-selected the constraint. Override the engine in
   the builder; don’t expect the score to pick the module.
5. **Want systemic change?** → Edit `DiagnosticCode.gs`, publish a new Web App
   version. No frontend redeploy needed for scoring-only changes.

---

## Related docs

- `docs/DIAGNOSTIC_SETUP.md` — sheet + Apps Script deploy; where to edit scoring
- `docs/SNAPSHOT_SETUP.md` — builder wiring
- `docs/SNAPSHOT_DEMO_SCRIPT.md` — how to talk about “automation is a draft”
- `src/diagnostic/schema.ts` — questions / answer values the scorer reads
- `src/snapshot/constants.ts` — builder dropdown options (stage, engine, fit)
