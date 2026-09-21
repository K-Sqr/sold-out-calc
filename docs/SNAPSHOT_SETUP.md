# Sold-Out Snapshot Generator V0

A lightweight layer on top of the Stage Diagnostic that turns a submission into
a clean, founder-facing **"Your Sold-Out Snapshot"**. It has two modes on one
page:

| URL | Who | What |
| --- | --- | --- |
| `/snapshot` | Internal team | Review a submission, assign/edit routing, score categories, generate a link |
| `/snapshot?s=…` | Founder | The clean, branded snapshot (the link the team sends) |
| `/snapshot?s=…&edit=1` | Internal team | Re-open an existing link in the builder to tweak it |

There is **no login, no database, and no new deploy target** — the shareable
link itself carries the founder-facing data, and internal scoring lives in the
existing Diagnostics Google Sheet (written back via **Save review to sheet**).

## Two snapshot types

| Type | For | What the founder sees |
| --- | --- | --- |
| **Engine recommendation** (default) | Likely fits | Stage → revenue target → likely bottleneck → recommended Sold-Out Engine → next step / CTA |
| **Stage roadmap** ("good luck") | Founders who aren't a fit yet | Their current stage, what the next stage looks like, a 5-step roadmap to get there, an encouragement line (+ optional personal note), and a "re-take the diagnostic later" CTA |

Switch between them with the **Snapshot type** toggle at the top of the founder
panel. Roadmap copy per stage lives in `STAGE_ROADMAPS` (`src/snapshot/constants.ts`).
Old links without a type decode as "engine".

---

## The workflow

1. A founder submits the **Stage Diagnostic** (`/diagnostic`) → one row lands in
   the `Diagnostics` sheet, with the auto-scored internal columns pre-filled.
2. The team opens **`/snapshot`**.
3. *(Optional)* Click **Load** to pull recent submissions from the sheet and
   pick one — the builder pre-fills what it can. If the endpoint isn't set, just
   fill the fields by hand (or paste from the sheet).
4. Review and **edit anything** — stage, paid-fit, revenue gap, primary /
   secondary bottleneck, strongest lever, recommended engine, fit status, notes,
   next step. Nothing is locked to automation.
5. Score the 10 categories (Weak / Moderate / Strong) as a quick internal read.
6. Watch the **live founder preview** on the right.
7. **Save review to sheet** — writes your stage, fit, scorecard, notes, next
   step, follow-up, snapshot type and the share link onto that submission's
   row, and stamps **Reviewed At**. Loading the row again brings all of it back.
8. **Copy link** (send to the founder) or **Open founder view** to check it.
   **Copy sheet row** is still there for pasting by hand if the endpoint isn't
   wired.

Your in-progress draft is also **autosaved in the browser** (localStorage), so
a refresh or accidental tab close never loses scoring. A banner offers to
discard it when you come back.

The founder link contains **only** the founder-facing fields. Internal notes,
fit score, follow-up status, and the raw scorecard never leave with the founder.

---

## Enabling "Load from sheet" (optional, access-gated)

The builder reuses `VITE_DIAGNOSTIC_ENDPOINT_URL`. To let it pull submissions:

1. Make sure `DiagnosticCode.gs` is the **current** version in your Apps Script
   project (it now answers `GET …/exec?mode=list&key=…` with recent rows).
   - If you deployed an earlier version: re-paste the file, then
     **Deploy → Manage deployments → Edit → New version**.
2. **Set a shared access key** (this is what keeps random visitors out):
   - In the Apps Script editor, open the `setListAccessKey` function.
   - Change `'change-me-to-a-long-random-string'` to your own long random value.
   - In the function dropdown pick **`setListAccessKey`** → **Run** (once).
   - **Deploy → Manage deployments → Edit → New version** to publish.
3. Ensure `VITE_DIAGNOSTIC_ENDPOINT_URL` is set (see `docs/DIAGNOSTIC_SETUP.md`).
4. In the builder, paste that same key into the **"Team access key"** field once.
   It's saved in your browser (localStorage) and sent with each load request —
   it is **never** baked into the public site or a founder link.

Without a key, listing is refused. Without the endpoint, the builder runs in
**manual-entry mode** — everything still works, you just type or paste fields.

### Why this is safe (no login required)

- The `/snapshot` **builder page** is reachable by anyone, but on its own it's an
  empty form — it exposes no data.
- Pulling submissions requires the shared **access key**, which lives only in the
  Apps Script (a Script Property) and in each team member's browser. It is never
  shipped in the public JavaScript bundle.
- The **founder view** (`/snapshot?s=…`) is meant to be shared and contains only
  that one founder's data, encoded in the link — no access to anyone else's.
- The diagnostic confirmation screen has no link to the builder at all
  (removed after founder feedback) — the team reaches `/snapshot` directly.

---

## Saving reviews back to the sheet

"Save review to sheet" POSTs `{ mode: "review", key, rowIndex, values }` to the
same Apps Script. The script only writes the internal columns
(`INTERNAL_COLUMNS` in `DiagnosticCode.gs`) — founder answers are never
touched — and stamps `Reviewed At`.

Requirements:

1. `DiagnosticCode.gs` must be the **current** version (it adds `saveReview_`
   plus the columns `Strongest Lever`, `Scorecard`, `Snapshot Mode`,
   `Snapshot Link`, `Reviewed At`). Re-paste the file, then
   **Deploy → Manage deployments → Edit → New version**. Existing sheets get
   the new columns inserted automatically before `Source URL`.
2. The same shared access key as for loading (`setListAccessKey`).
3. A submission must be **loaded** first so the builder knows which row to
   write to (the Save button is disabled otherwise and says why).

Verify in the Apps Script editor: run `runDiagnosticSelfTest`, then
`runReviewSelfTest` — the last row should show `Fit Status = V0 Fit`,
`Scorecard = Revenue Stage: Moderate; Offer Strength: Strong` and a
`Reviewed At` timestamp, while `Brand name` stays untouched.

Rotating the key: change it in `setListAccessKey`, re-run, redeploy a New
version, and have the team re-enter the new key in the builder.

---

## Where to edit labels

All routing labels live in one file: **`src/snapshot/constants.ts`**

- `STAGE_OPTIONS` — estimated stages
- `BOTTLENECK_OPTIONS` — growth levers / bottlenecks (no lever is assumed default)
- `ENGINE_OPTIONS` — the six Sold-Out Engines (routing labels only; not built)
- `FIT_STATUS_OPTIONS` — Too Early / V0 Fit / Advanced-Future / Not Fit / Needs Manual Review
- `SCORE_CATEGORIES` — the 10 internal scorecard categories
- `LEVER_TO_ENGINE` — which engine a bottleneck suggests (always overridable)
- `CTA_PRESETS` — the three founder CTA presets (book / review / roadmap)
- `STAGE_ROADMAPS` — per-stage copy for the "Stage roadmap" snapshot

Founder-page copy (the hedged "appears to be / likely" language) lives in
**`src/snapshot/SnapshotView.tsx`**; default next-step + CTA text in
**`src/snapshot/types.ts`**.

---

## What this V0 is not

No accounts, no payment, no Shopify/Klaviyo, no dashboard, and none of the
actual Sold-Out Engines — just the routing labels and a clean snapshot. The
diagnosis is deliberately hedged and fully manually overridable while the logic
is still being validated.
