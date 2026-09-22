# Loom script — walking the founder through the backlog fixes

A recording script for the ~7-minute Loom showing what changed after the
"Soldout Features Back Log" feedback. Every item the founder raised is covered,
in the order it's easiest to demo — not the order it was written.

**Before you hit record**

- Two tabs open: `/diagnostic` and `/snapshot`.
- The `/snapshot` tab already has the **team access key** saved and a
  submission loaded (Load → pick a row), so you're not typing a key on camera.
- Clear the `/diagnostic` tab (fresh start, not mid-form).
- Have one sentence ready for anything not yet deployed — if the Apps Script
  hasn't been redeployed, say so up front rather than hitting an error live.

---

## 0. Open — name the feedback (20 sec)

> "You sent over a run-through with about eight things to fix. All of them are
> in. I'm going to go through each one in the order you'd hit them if you were
> filling this out as a founder."

Don't list them here. Show them.

---

## 1. Multiple choice now takes multiple picks (45 sec)

Start on `/diagnostic`, click **Start the diagnostic**, and go straight to
**Main product category**. Click three: Streetwear, Menswear, Accessories.

> "First one: you said these shouldn't force a single pick, so people don't
> second-guess. Four questions now take as many as apply — product category,
> traffic source, what your launch posts communicate, and the big one at the
> end, your biggest constraint."

Click one of them again to show it toggles off.

> "The sheet records them in the order you tapped, which matters for the last
> question — more on that in a second."

---

## 2. Required fields (45 sec)

Without filling anything, click **Next**.

> "Second thing — too much was optional. It's the other way round now: about
> forty questions are required, and the form won't move on until they're
> answered. Watch what happens if you skip."

Point at the red lines and the asterisks.

> "It jumps you to the first thing it needs, rather than just sitting there."

Then set expectations out loud:

> "The rule I used: it's required if it feeds the scoring, or if it's one tap
> with an honest way out — there's a 'Not sure' or a 'Sometimes' on nearly all
> of them. What's still optional is anything you'd have to go look up.
> Average order value, sell-through, return rate — those still say 'if known',
> because making someone guess a number is worse than leaving it blank."

Fill the section in (brand, name, email, a category) and hit **Next**.

---

## 3. The (i) explanations (1 min)

Click through to **Section 04 · Drop economics**. Tap the (i) next to
**Sell-through percentage**.

> "You said people aren't all savvy with the concepts — average order value,
> gross margin, sell-through. Every term like that now has an 'i' you can tap
> or hover. Plain English, with the math where there is any."

Tap the (i) on **Gross margin range** to show a second one (it has the $100
hoodie example). Then tap the one on **Return rate**.

> "Fifty-six questions have one of these. They work on a phone too — tap once
> to pin it open, tap anywhere to close."

Move to **Section 05** and tap the (i) on **Is the expected checkout value
above $50?**

> "This is the one you flagged specifically. 'Expected checkout value' now
> explains itself: what one customer typically spends in a single order,
> including multiple items — and how to tell which answer is yours."

Worth naming while you're here: hero product also has one now.

---

## 4. Yes / Sometimes / No (30 sec)

Continue to **Section 07 · Demand & owned audience**.

> "You said not everything should be yes or no. Fifteen of these are now
> Yes / Sometimes / No — the habit questions, where the honest answer is
> usually 'sometimes'. Do you collect email before drop day, do you send
> reminders, do you capture people who missed the drop."

Tap **Sometimes** on one.

> "Things that genuinely are yes or no — do you have a waitlist page, do you
> run paid ads — stayed as they were."

---

## 5. The exact revenue field (20 sec)

Scroll back to **Section 03** (or mention it if you'd rather not break flow).

> "Small one you asked for: on monthly revenue, the bands were too coarse, so
> there's a field underneath to type your actual average. If someone fills it
> in, that number is what we score the stage off — it overrides the band."

---

## 6. The last question, and how it routes (45 sec)

Jump to **Section 10** and pick two constraints — AOV is too low, then Launch
day is chaotic.

> "Your biggest constraint takes multiple picks now. Order matters: the first
> one you tap becomes the primary bottleneck and drives the recommended
> engine. The second fills in as a secondary — that column used to sit empty
> on every single row."

This is the natural moment for the "how is the stage calculated" question:

> "Since you asked how the stage and the fit are worked out — the stage is
> basically your monthly revenue band. Under $30K a month is Beta, $30K to
> $100K is Growth, above that is Adaptation. The fit score is a 0-to-100
> number built from whether you've launched before, that revenue band, the
> size of your owned list, your margin, and whether drops are profitable.
> Sixty and above reads as a likely fit. All of it is a first draft — we
> override it by hand before anything goes out, and it's all written up if
> you want the detail."

---

## 7. Submit, and what's no longer there (20 sec)

Submit the form (or show a submitted screen you prepared).

> "And the build-snapshot link that was showing up on this page is gone — that
> was ours, it shouldn't have been on a founder's screen."

---

## 8. The good-luck document (1 min 30 — the part worth landing)

Switch to `/snapshot` with a submission already loaded.

> "The last one is the one I think matters most of what you sent. You said
> everyone should walk away with something, even if they're not a fit. So
> there are two versions of the snapshot now."

Click the **Stage roadmap (not a fit yet)** toggle. Let the preview on the
right redraw.

> "Same review process — I pick their stage, and this writes itself."

Scroll the preview panel slowly:

> "Where they are and what that stage actually means. What the next stage
> looks like. Then five steps to get there, in order — concise on purpose,
> it's a roadmap, not a course. Then a good-luck note."

Type a line into **Personal note**.

> "And I can add one line myself, so it doesn't read like a form letter."

Click **Open founder view** and scroll the real page once, top to bottom.

> "That's what lands in their inbox. No pitch, no engine, no call booking —
> just where you are and what to do next. And the button at the bottom invites
> them back to re-take the diagnostic once they've moved."

---

## 9. Scoring that sticks (1 min)

Back in the builder, switch to **Engine recommendation** and score three or
four of the categories in the scorecard.

> "Last thing — you said to debug this page and make the team's scoring
> persistent. Two things fixed that."

Click **Save review to sheet**, wait for the tick.

> "That writes everything on this page back onto that founder's row — the
> stage, the fit, the notes, the scorecard, which kind of snapshot I sent, and
> the link I sent. It stamps it as reviewed."

Hit **Refresh** in the load panel and point at the **Reviewed** tag, then pick
that row again.

> "Reload it and the scoring comes back exactly as I left it. It used to be
> gone the moment you closed the tab."

Then refresh the whole page to trigger the restored-draft banner.

> "And in the middle of a review, it's saving a draft in the browser as you
> type — refresh, and it's still here."

---

## 10. Close (20 sec)

> "That's all eight. The copy — the explanations, the roadmap wording — is all
> plain text I can change in a few minutes, so if any of it doesn't sound like
> us, just tell me which lines and I'll swap them."

---

## If something's not deployed yet

Say it at the top, not when it breaks:

> "One thing to flag — the Google Sheet side of this needs a redeploy, so the
> Save button and the two-pick routing won't do anything live until that's
> done. Everything I'm showing on the form is live."

---

## Questions to expect

**"Won't making everything required scare people off?"**
Most of what became required is one tap with a 'Not sure' option — the long
and genuinely hard ones stayed optional. If the drop-off looks bad, the rule
lives in one file and we can relax any of them individually.

**"Can we add a question?"**
Yes, one file (`src/diagnostic/schema.ts`) — the form, the validation and the
sheet column all follow from it. New questions become new columns
automatically.

**"Who decides whether someone gets a roadmap or an engine?"**
We do, per submission. Nothing auto-sends; the toggle is a manual call on the
review page.

**"What if the roadmap advice doesn't fit a particular brand?"**
The five steps per stage are fixed copy, but the personal note is free text,
and every founder-facing field on the page stays editable before sending.
