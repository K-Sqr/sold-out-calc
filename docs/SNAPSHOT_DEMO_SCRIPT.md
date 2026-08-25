# Demoing the Snapshot Generator to the founder

A walkthrough script for showing `/snapshot` end-to-end: what it is, the full
feature set, and the talking points that head off the obvious questions. Budget
~8–10 minutes for the live click-through, longer if there are questions.

Before you start: open two tabs — one on `/diagnostic`, one on `/snapshot` —
and make sure the browser you're demoing from already has the **team access
key** saved (Builder → "Load a diagnostic submission" → paste the key once).
Founders never see this key; it only lives in a team member's browser.

---

## 1. Frame it in one sentence (30 sec)

> "This turns a Stage Diagnostic submission into a clean, branded page we send
> back to the founder — no login, no database. The link itself carries the
> data."

That's the whole pitch. Everything after this is showing, not explaining.

---

## 2. Where it starts: the Diagnostic (1 min)

Open `/diagnostic` — this is the intake form founders already fill out
(10 sections: drop economics, offer, attention, demand, launch, retention,
operating rhythm, etc.). You don't need to fill out a new one live unless the
founder wants to see the intake itself — it's faster to say:

> "A founder fills this out, it lands as a row in our Diagnostics sheet with
> internal scoring already run automatically."

If you *do* submit a live test one, point out the confirmation screen
afterward has a **"Team · Build snapshot →"** shortcut — but only visible to
you, because it only renders when your browser already holds the team key.
That's the handoff from intake to snapshot.

---

## 3. The builder — `/snapshot` (4–5 min, the core of the demo)

Load a real submission:

1. Click **Load** in the "Load a diagnostic submission" panel (top of the
   page) — pull up the list of recent rows from the sheet.
2. Pick one. The founder-facing fields auto-fill from whatever the automated
   scoring produced.
3. Say explicitly: **"Nothing here is locked."** Every field — stage, revenue
   numbers, bottleneck, engine, next step — is editable. The automation is a
   starting draft, not a verdict.

Walk the fields top to bottom, narrating what each becomes on the founder's
page:

| Field in the builder | What it becomes for the founder |
| --- | --- |
| Brand name | "Prepared for ___" |
| Estimated stage | Section 1 — their current Sold-Out stage |
| Current / target revenue + gap | Section 2 — the revenue jump they're aiming for |
| Primary / secondary bottleneck, strongest lever | Section 3 — likely constraint + what's already working |
| Recommended Sold-Out Engine | Section 4 — the dark feature card, the "next module" |
| Next step | Section 5 — plain-language recommendation |
| CTA preset | The button at the bottom |

Point out the **two CTA presets** — "Book a Sold-Out Review Call" (opens a
pre-filled mailto:) and "We'll review & follow up" (no action needed, just a
label) — and that the CTA link/label/note are also freely editable per
snapshot.

Then scroll to the second panel, **"Internal scoring & routing"**, and be
clear about the boundary:

> "Everything in this second panel — Paid Fit Score, Fit status, Follow-up
> status, internal notes, and the 10-category scorecard — stays internal.
> None of it is in the link we send."

Score a couple of the 10 categories live (Weak / Moderate / Strong) so the
founder sees the scorecard exists, even though it's for the team, not them.

---

## 4. The live preview (1 min)

The right-hand panel has been updating in real time this whole walkthrough —
call that out explicitly:

> "Everything I just edited, the founder preview on the right updated live.
> This is exactly what they'll see."

---

## 5. Generating and sending the link (1–2 min)

1. Click **Copy link** — explain: the link is a single URL with the founder
   data encoded in the `?s=` parameter, base64'd. No server round-trip, no
   database row — the URL *is* the snapshot.
2. Click **Open founder view** — this opens the link in a new tab so you can
   show the exact page the founder receives, standalone, without the builder
   chrome around it.
3. Mention **Copy sheet row** — a convenience button that copies the reviewed
   internal fields as tab-separated values, ready to paste back into the
   Diagnostics sheet as your own permanent record of what was actually sent
   (separate from the raw automated scoring).

---

## 6. The founder view itself (1 min)

On the opened tab, scroll through it as if you were the founder:

- Editorial, screenshot-friendly layout — not a SaaS dashboard.
- Every diagnosis line is deliberately **hedged** — "appears to be," "likely
  based on the information submitted" — never stated as fact.
- The closing line reinforces that: "a first read... confirmed during a short
  Sold-Out Review."

That hedging is worth calling out on purpose — it's the thing that keeps this
V0 honest about what it actually knows.

---

## 7. Re-opening an existing link (30 sec, optional)

If the founder asks "what if we need to fix a typo after sending it" —
demonstrate: take the same link, append `&edit=1`, and it reopens in the
builder pre-filled from the link itself (no sheet lookup needed). Generate a
new corrected link and send that one instead — the old link still works
until you send the new one.

---

## What this V0 deliberately is *not* (say this out loud once)

- No accounts, no login for founders, no payment flow.
- No Shopify/Klaviyo integration.
- No dashboard — just this one page in two modes.
- The six "Sold-Out Engines" are **routing labels only** — naming the
  recommended next module, not a built product. Say this plainly if asked
  "so what happens after they click Book a Call" — the answer today is a
  human call, not automated onboarding into an engine.
- The diagnosis logic is still being validated, which is why every field is
  manually overridable rather than locked to the automated score.

---

## Anticipated questions + short answers

**"Can founders see each other's data?"**
No — each link only decodes to the one snapshot encoded in it. There's no
index or list a founder could browse.

**"What stops a random visitor from loading the builder and seeing our
leads?"**
The builder page itself is just an empty form to anyone without the team key.
Pulling the list of submissions requires the shared access key, which lives
only in Apps Script (server-side) and in each team member's browser — it's
never shipped in the public site's code.

**"What if the automated scoring is wrong?"**
That's the entire point of the builder step — a human reviews and can
override every field before anything goes to the founder. Nothing auto-sends.

**"Can we change the wording / add a section later?"**
Yes — all the labels (stages, bottlenecks, engines, CTA presets) live in one
file (`src/snapshot/constants.ts`), and the founder-facing copy lives in
`SnapshotView.tsx`. Both are quick edits, no rebuild of the flow.
