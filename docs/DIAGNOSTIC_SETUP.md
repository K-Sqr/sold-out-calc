# Sold-Out Stage Diagnostic — Google Sheets setup

This guide wires the **Stage Diagnostic** up to its own Google Sheet so every
submission becomes one new row, with all answers captured plus internal review
columns (Estimated Stage, Paid Fit Score, Primary Bottleneck, Recommended
Module, Notes, Follow-up Status).

You'll set up **one** new Google Sheet + Apps Script. Total time: ~5 minutes.

> This is intentionally separate from the calculator's "Leads" sheet so
> diagnostic data and calculator leads don't mix.

---

## Step 1 — Create a new Google Sheet

1. Go to [sheets.new](https://sheets.new) to create a blank sheet.
2. Rename it something like **"Sold-Out — Stage Diagnostic"**.
3. Leave the first tab as-is. The script creates a `Diagnostics` tab
   automatically the first time it runs, with all the right headers.

---

## Step 2 — Open the Apps Script editor

In the Google Sheet:

1. Go to **Extensions → Apps Script**.
2. Delete the empty `function myFunction() { ... }` placeholder.
3. Open `scripts/google-apps-script/DiagnosticCode.gs` in this repo and **paste
   its entire contents** into the editor.
4. Hit **Save**. Name the project, e.g. "Sold-Out Stage Diagnostic".

---

## Step 3 — Verify it works (before deploying)

In the Apps Script editor:

1. In the function dropdown, choose **`runDiagnosticSelfTest`** and click **Run**.
2. Approve the permission prompt the first time (it needs access to the sheet).
3. Switch to the Google Sheet — you should see a `Diagnostics` tab with one test
   row, including the auto-filled **Estimated Stage**, **Paid Fit Score**,
   **Revenue Gap**, **Primary Growth Lever**, **Primary Bottleneck**,
   **Recommended Sold-Out Engine**, and **Fit Status**.

You can delete the test row afterward.

---

## Step 4 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Under **Select type**, choose **Web app**.
3. Configure:
   - **Description:** Stage Diagnostic
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**
4. Click **Deploy**, approve access, and **copy the Web App URL**
   (ends in `/exec`).

---

## Step 5 — Point the frontend at it

In the project root, create a `.env` file (copy from `.env.example`) and set:

```
VITE_DIAGNOSTIC_ENDPOINT_URL=https://script.google.com/macros/s/.../exec
```

Restart `npm run dev`. Submissions from `/diagnostic` now land in your sheet.

On Vercel, add the same variable under **Project → Settings → Environment
Variables**, then redeploy.

---

## Editing questions

Everything about the form lives in **`src/diagnostic/schema.ts`**. To add,
remove, or reorder a question, edit that file. Each question's `id` becomes its
Sheet column.

**You do not need to touch the Apps Script when adding questions** — new columns
are created automatically (inserted just before the internal review columns).
The only time you'd edit `DiagnosticCode.gs` is to change the **scoring** logic
(`scoreSubmission_` and the small functions below it).

---

## Editing the scoring / routing

Full under-the-hood write-up (stage rules, fit point table, thresholds, how to
override with judgement): **`docs/SCORING_UNDER_THE_HOOD.md`**.

Open `scripts/google-apps-script/DiagnosticCode.gs` and edit:

- `estimateStage_` — Beta / Growth / Adaptation thresholds
- `paidFitScore_` — the 0–100 fit weighting
- `revenueGap_` — how the target revenue jump is computed
- `routeBottleneck_` — the single map from self-assessed constraint →
  Primary Growth Lever + Recommended **Sold-Out Engine** (Offer, Attention,
  Demand, Launch, Aftermath, Operating Rhythm). The engines aren't built yet —
  this is just the routing label.
- `fitStatus_` — the coarse triage bucket

Save, then **Deploy → Manage deployments → Edit → New version** to publish the
change. No frontend redeploy needed.

The internal review columns are: **Estimated Stage, Paid Fit Score, Revenue Gap,
Primary Growth Lever, Primary Bottleneck, Secondary Bottleneck, Recommended
Sold-Out Engine, Fit Status, Notes, Next Step, Follow-Up Status**.

`Secondary Bottleneck`, `Notes`, `Next Step`, and `Follow-Up Status` are
intentionally left blank for your team to fill in during review.

> **Already deployed an earlier version?** The new columns
> (`Secondary Bottleneck`, `Next Step`) and the submission-list endpoint used by
> the Snapshot Generator only take effect after you **re-paste `DiagnosticCode.gs`
> and publish a New version**. Existing sheets keep their old columns — add the
> two new headers by hand (or start a fresh sheet) if you want them populated.

See **`docs/SNAPSHOT_SETUP.md`** for how the `/snapshot` Snapshot Generator uses
these fields.
