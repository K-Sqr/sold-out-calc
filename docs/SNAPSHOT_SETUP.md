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
existing Diagnostics Google Sheet.

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
7. **Copy link** (send to the founder) or **Open founder view** to check it.
   Optionally **Copy sheet row** to paste the reviewed internal columns back
   into the Google Sheet.

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
- The internal **"Team · Build snapshot"** shortcut on the diagnostic
  confirmation screen only appears for browsers that already hold the access key,
  so founders never see it.

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
- `CTA_PRESETS` — the two founder CTA presets

Founder-page copy (the hedged "appears to be / likely" language) lives in
**`src/snapshot/SnapshotView.tsx`**; default next-step + CTA text in
**`src/snapshot/types.ts`**.

---

## What this V0 is not

No accounts, no payment, no Shopify/Klaviyo, no dashboard, and none of the
actual Sold-Out Engines — just the routing labels and a clean snapshot. The
diagnosis is deliberately hedged and fully manually overridable while the logic
is still being validated.
