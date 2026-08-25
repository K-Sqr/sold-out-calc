# Ad tracking setup — separate ad traffic from everything else

Goal: know **how many people used the Sold-Out Gap Calculator because of the
ad**, separate from organic, IG bio, the Labs coming-soon page, and anything
else.

Method: same domain + **distinct UTM tags** on the ad link. No new domain,
no new analytics product required for V1.

---

## 1. The rule (read this once)

Every public link that points at the calculator should carry a tag that
answers: *where did this person come from?*

| Traffic source | Use this link |
| --- | --- |
| **Paid Instagram ad** (this launch) | See [§2](#2-the-ad-link--paste-thiscopy) |
| Labs coming-soon corner link | Already wired: `/SoldOutGap?ref=labs&utm_source=labs` |
| IG bio / stories / organic posts | Give each its **own** tags — never reuse the ad's |
| Untagged / typed URL / old bookmarks | Shows up as "direct" or empty — fine |

If two channels share the same `utm_source`, you cannot tell them apart later.
**Never reuse the ad's tags on anything else.**

---

## 2. The ad link (copy-paste this)

Put **exactly this URL** in the Instagram ad destination:

```
https://sold-out-labs.vercel.app/SoldOutGap?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch_july2026&ref=ig-ad-1
```

### What each piece means

| Param | Value | Why |
| --- | --- | --- |
| `utm_source` | `instagram` | Where the click came from (platform) |
| `utm_medium` | `paid_social` | Paid vs organic |
| `utm_campaign` | `launch_july2026` | This specific ad flight — change the date/name for the next campaign |
| `ref` | `ig-ad-1` | Short internal tag that also lands in our Google Sheets |

### If you run a second ad later

Change **both** `utm_campaign` and `ref` so campaigns don't mix:

```
https://sold-out-labs.vercel.app/SoldOutGap?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch_aug2026&ref=ig-ad-2
```

### If the ad should land on the Labs coming-soon page instead

Same tags, different path:

```
https://sold-out-labs.vercel.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch_july2026&ref=ig-ad-1
```

The corner link from that page to the calculator still uses `utm_source=labs`,
so you can still tell "clicked the ad → Labs page" vs "clicked through to the
calculator from Labs."

---

## 3. Where you'll read the numbers

You get **two** primary reads (Umami + sheets). Use both — they answer
different questions. Vercel Analytics stays as a light backup.

### A. Umami Cloud — "how many people visited" (free UTM / campaigns)

This is the **source of truth for visit + campaign breakdowns**. No Vercel Pro
needed. The tracking script is on every public page (`/`, `/SoldOutGap`,
`/diagnostic`, `/snapshot`) with website id
`06c4938d-d6ac-4a74-a05a-b874ee55d296`.

1. Open [cloud.umami.is](https://cloud.umami.is) → your Sold-Out Labs site.
2. Confirm the website **domain** in Umami settings matches production
   (`sold-out-labs.vercel.app`, plus any custom domain if you add one).
3. Open **Sources / Campaigns / Query parameters** (wording varies by Umami
   version) and look for:
   - `utm_source` = `instagram` (ads) or `referral` (Atlanta friends)
   - `utm_campaign` = `launch_july2026` or `mtl-tags`
4. Also check **Pages** for `/SoldOutGap` (and `/diagnostic` if that's the
   landing page) over the same date range.

**What this number means:** pageviews / visitors who landed with those tags.

**Accuracy caveats:**

- Privacy-friendly / cookieless-style — can undercount ad blockers or blocked
  JS, same class of caveat as other lightweight analytics.
- Events only fire **after deploy** with the script live. Local `npm run dev`
  hits may not show (or may need localhost allowed in Umami).
- Treat Umami as the **daily visit + campaign pulse**; sheets (§B) for
  "actually used the tool."

### B. Leads sheet — "how many people actually used the calculator"

Every time someone fills in numbers and clicks **Send My Report**, the row
in the **Leads** tab stores `Source URL` — the full URL they were on,
**including the UTM tags**.

1. Open the Sold-Out Gap Leads Google Sheet → **Leads** tab.
2. Find the **Source URL** column.
3. Filter or search for `utm_campaign=launch_july2026` (or `ref=ig-ad-1`).

**What this number means:** people who came from the ad **and** completed a
calculator run far enough to request their report. That's the strongest
"used the calculator because of the ad" signal you have today.

**Accuracy:** exact for that subset. It does **not** count people who
opened the calculator, poked around, and left without submitting.

### C. Waitlist sheet — only if the ad lands on `/`

If the ad points at the coming-soon page, waitlist signups land in the
**Waitlist** tab with a **Ref** column. Filter for `ig-ad-1`.

### D. Vercel Analytics (optional backup)

Still installed (`@vercel/analytics` on React routes + `/_vercel/insights`
on the Labs page). Useful for raw page volume. **Do not rely on it for UTM
campaign filters** unless you're on Analytics Plus / Pro — use Umami (§A)
instead.

---

## 4. Pre-launch checklist (do this before the ad goes live)

- [ ] Confirm the destination URL in Meta Ads Manager is the tagged link from
      [§2](#2-the-ad-link-copy-paste-this) — not the bare `/SoldOutGap`.
- [ ] Open the tagged link yourself in an **incognito** window → you should
      land on the calculator.
- [ ] Confirm Umami is receiving hits (open tagged link → Umami realtime /
      recent events within a minute or two).
- [ ] Confirm the **Leads** sheet is still receiving report submissions
      (send yourself one report from an untagged `/SoldOutGap` visit first).
- [ ] Do **not** put the ad's UTM tags on the IG bio, stories, or the Labs
      corner link.

---

## 5. After the ad is live — daily / weekly read

| Question | Where to look |
| --- | --- |
| Rough traffic from the ad today | Umami → campaign / query → `utm_campaign=launch_july2026` |
| People who used the calculator + asked for a report | Leads sheet → Source URL contains `launch_july2026` or `ig-ad-1` |
| Waitlist signups from the ad (if landing on `/`) | Waitlist sheet → Ref = `ig-ad-1` |
| Everything else (organic, labs, untagged) | Same places, **excluding** those tags |

Suggested weekly summary for the founder:

> Ad campaign `launch_july2026`: ~X visitors (Umami), Y report submissions
> (Leads sheet). Labs / organic are separate.

---

## 6. Templates for other channels (keep tags unique)

| Channel | Example link |
| --- | --- |
| IG bio | `…/SoldOutGap?utm_source=instagram&utm_medium=social&utm_campaign=bio&ref=ig-bio` |
| IG story (organic) | `…/SoldOutGap?utm_source=instagram&utm_medium=social&utm_campaign=story_july29&ref=ig-story-1` |
| Email / newsletter | `…/SoldOutGap?utm_source=email&utm_medium=newsletter&utm_campaign=…&ref=email-1` |
| Twitter / X | `…/SoldOutGap?utm_source=twitter&utm_medium=social&utm_campaign=…&ref=tw-1` |
| Atlanta friends (boss referral) | `…/SoldOutGap?utm_source=referral&utm_medium=word_of_mouth&utm_campaign=mtl-tags&ref=mtl-tags` |

Pattern: **platform** in `utm_source`, **paid vs organic** in `utm_medium`,
**unique name** in `utm_campaign` + `ref`.

---

## 7. Optional upgrades (not required for launch)

These are nice-to-haves if you outgrow the Umami + sheet setup above.

1. **Dedicated sheet columns for UTM** — parse `utm_source` / `utm_campaign`
   out of `Source URL` into their own columns in `Code.gs` so you can filter
   without searching a long URL. Ask and we can wire that in.
2. **Umami custom events** — track "Send My Report" / diagnostic submit as
   events in addition to pageviews (needs a small `umami.track(...)` call).
3. **Meta Pixel** — for ad *optimization* inside Ads Manager (who converted),
   separate from "how many used our calculator." Only needed if you're
   optimizing the ad for conversions, not just measuring visits.

---

## 8. Quick reply you can send the team

> Ad destination link (use only this for the paid IG ad — don't reuse these
> tags elsewhere):
>
> `https://sold-out-labs.vercel.app/SoldOutGap?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch_july2026&ref=ig-ad-1`
>
> We'll read traffic two ways: Umami for visit + campaign volume (free UTM
> breakdowns), and the Leads sheet Source URL column for people who actually
> ran the calculator and requested a report. Same domain, distinct tags.

---

## 9. Atlanta friends — `mtl-tags` (share + test in Umami)

Personal referral links for the boss's Atlanta network. Tag name:
**`mtl-tags`**. Use these only for that group — don't reuse on IG ads, bio,
or Labs.

### The link (copy-paste this)

**Calculator** (primary — same surface as §2):

```
https://sold-out-labs.vercel.app/SoldOutGap?utm_source=referral&utm_medium=word_of_mouth&utm_campaign=mtl-tags&ref=mtl-tags
```

**Stage Diagnostic** (if you're sending them to intake instead):

```
https://sold-out-labs.vercel.app/diagnostic?utm_source=referral&utm_medium=word_of_mouth&utm_campaign=mtl-tags&ref=mtl-tags
```

### What each piece means

| Param | Value | Why |
| --- | --- | --- |
| `utm_source` | `referral` | Personal / word-of-mouth — not a paid platform |
| `utm_medium` | `word_of_mouth` | Distinguishes from paid_social and organic social |
| `utm_campaign` | `mtl-tags` | This Atlanta-friends batch — filter on this in Umami |
| `ref` | `mtl-tags` | Short tag that also lands in Leads / Diagnostics sheets |

### Test in Umami before sharing

Do this yourself once so you know the pipeline works (**after the Umami
script is deployed to production**):

1. **Open the tagged calculator link in an incognito window** (paste the URL
   above — don't type the bare `/SoldOutGap`).
2. Confirm you land on the calculator and the address bar still shows
   `utm_campaign=mtl-tags` and `ref=mtl-tags`.
3. In **Umami Cloud** → your site:
   - Check **Realtime** / recent visitors — you should appear within ~1–2
     minutes.
   - Look under campaigns / query params for `utm_campaign` = **`mtl-tags`**
     (and/or `utm_source` = **`referral`**).
   - Confirm a pageview for **`/SoldOutGap`**.
4. **Optional stronger signal:** on that same tagged visit, run the calculator
   and click **Send My Report** with a test email.
5. Open the **Leads** sheet → **Source URL** column → search for
   `mtl-tags`. The full tagged URL should be stored on that row.

If Umami shows nothing, double-check the site domain in Umami settings matches
`sold-out-labs.vercel.app` and that production has the latest deploy with the
script. The Leads sheet (§B) still proves tags on submit even if Umami is
misconfigured.

### After you share with Atlanta friends

| Question | Where to look |
| --- | --- |
| How many clicked the link? | Umami → `utm_campaign=mtl-tags` |
| How many used the calculator + requested a report? | Leads sheet → Source URL contains `mtl-tags` |
| Diagnostic submissions from this group | Diagnostics sheet → Source URL contains `mtl-tags` |

### Quick message for the boss

> Atlanta friends link (calculator — use only this URL, don't strip the tags):
>
> `https://sold-out-labs.vercel.app/SoldOutGap?utm_source=referral&utm_medium=word_of_mouth&utm_campaign=mtl-tags&ref=mtl-tags`
>
> We'll track visits in Umami under campaign **`mtl-tags`** and report
> submissions in the Leads sheet Source URL column.

---

## Related docs

- Calculator report capture (Leads sheet): `docs/REPORT_CAPTURE_SETUP.md`
- Labs waitlist + domain/SEO: `docs/LABS_SETUP.md`
