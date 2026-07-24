# Sold-Out Labs — Coming-Soon Page Setup

The coming-soon page is the **site root** (`index.html`). It is a static
page — no React, no framework JS — so it loads fast and the email capture
works even with JavaScript blocked.

Site structure (project renamed to `sold-out-labs.vercel.app`; the old
`sold-out-calc.vercel.app` redirects here):

| Route | Page |
| --- | --- |
| `/` | Sold-Out Labs coming-soon + waitlist |
| `/calc` | Sold-Out Gap Calculator |
| `/diagnostic` | Stage Diagnostic |
| `/snapshot` | Snapshot Generator (internal, not indexed) |
| `/labs` | 301 redirect to `/` (kept because it was already submitted to Google) |

Three things need doing before the ad goes out:

1. [Wire up the waitlist email capture](#1-waitlist-email-capture) (~10 min)
2. [Decide the domain](#2-domain) — either use the vercel.app URLs as-is
   (nothing to do) or buy `soldoutlabs.com` (~15 min)
3. [Get it on Google](#3-seo--google-search-console) (~10 min)

---

## 1. Waitlist email capture

Emails go to a **Google Sheet** via a Google Apps Script — the exact same
setup as the calculator's report capture, so it's a pattern we already trust.
Free, exportable to CSV/Mailchimp/ConvertKit any time, no third-party account.

### Steps

1. Open the Google Sheet used for calculator leads (or create a new one —
   the waitlist writes to its own tab named `Waitlist` either way).
2. **Extensions → Apps Script**. Create a new script file and paste in the
   contents of `scripts/google-apps-script/LabsWaitlist.gs`.

   > If you're adding it to the same Apps Script project as the calculator's
   > `Code.gs`, deploy it as a **separate project** instead — each project
   > only gets one `doPost`. Easiest: make a new sheet + new script.

3. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the web app URL (looks like
   `https://script.google.com/macros/s/AKfy.../exec`).
5. In `index.html`, find the form and replace the placeholder action URL:

   ```html
   <form id="waitlist-form" method="POST"
     action="https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID_HERE/exec">
   ```

6. In the Apps Script editor, run `runSelfTest` once and confirm a row lands
   in the `Waitlist` tab.
7. Deploy the site. Submit a real email on the homepage and check the sheet.

Also test the no-JS path once: submit the form with JS disabled (or just
open the form action URL flow) — you should get a styled "You're on the
list" page instead of the inline confirmation.

### What gets captured

| Column | Meaning |
| --- | --- |
| Timestamp | When they signed up |
| Email | Their email |
| Ref | `?ref=` tag from the URL (e.g. the ad tag) |
| Source | Always `labs-coming-soon` |
| Page URL | Full URL they submitted from |

The hidden "company" field is a honeypot — bot submissions that fill it are
silently dropped.

### Note on the calculator's report email

`scripts/google-apps-script/Code.gs` now says `Sold-Out Labs` instead of
`The Sold-Out System`. That change only takes effect when you **redeploy**
the calculator's Apps Script (Deploy → Manage deployments → Edit → new
version).

---

## 2. Domain

Two ways to run this. Both work — Option A costs nothing and works today,
Option B is stronger long-term.

One thing that's off the table either way: `so.labs`. `.labs` is not a real
TLD in the global DNS root zone (it only exists as a Web3/blockchain name
that normal browsers and Google cannot resolve).

### Option A — no domain, use the vercel.app URLs as-is

Use these links directly:

| Page | URL |
| --- | --- |
| Labs coming-soon page | `https://sold-out-labs.vercel.app/` |
| Calculator | `https://sold-out-labs.vercel.app/calc` |

**There is nothing to configure.** Every URL in the codebase (canonical
tags, `og:url`, JSON-LD, `robots.txt`, `sitemap.xml`, the Apps Script
`LABS_URL`) already points at `sold-out-labs.vercel.app`, and production
`.vercel.app` domains are fully indexable by Google (only Vercel *preview*
deployments get a noindex header).

For the ad / IG bio, link to `https://sold-out-labs.vercel.app/` — the
coming-soon page has a corner link to the calculator.

Then do the Search Console steps in
[section 3, "Using the vercel.app URL"](#if-youre-using-the-vercelapp-url-option-a) —
that part is required no matter which option you pick.

Trade-offs to know about: a shared `.vercel.app` subdomain carries slightly
less trust with Google and looks less polished to a person reading the URL,
and if you buy a domain later the SEO history mostly restarts (redirects
carry some of it over). Since "Sold-Out Labs" is a distinctive phrase with
near-zero competition, ranking for the brand-name search from the vercel.app
URL is still very plausible.

### Option B — buy `soldoutlabs.com` (recommended long-term)

1. Buy `soldoutlabs.com` (Namecheap, Cloudflare, or straight from Vercel —
   buying through Vercel skips the DNS steps).
2. Vercel dashboard → the project → **Settings → Domains → Add** →
   `soldoutlabs.com` (and `www.soldoutlabs.com`, redirected to the apex).
   Follow the DNS instructions it gives you.
3. No routing config needed — the coming-soon page is already the site
   root, so `soldoutlabs.com/` serves it automatically and the calculator
   sits at `soldoutlabs.com/calc`.
4. After the domain is live, update the hardcoded URLs from
   `https://sold-out-labs.vercel.app` to `https://soldoutlabs.com` in:
   - `index.html` — the `<link rel="canonical">`, `og:url`, and JSON-LD block
   - `calc.html` — the `<link rel="canonical">`
   - `public/sitemap.xml` and `public/robots.txt`
   - `scripts/google-apps-script/LabsWaitlist.gs` — `LABS_URL` and
     `scripts/google-apps-script/Code.gs` — `TOOL_URL` (then redeploy both)

Until the domain is bought, everything works at
`https://sold-out-labs.vercel.app/` — put that in the ad if the domain
isn't ready in time.

---

## 3. SEO / Google Search Console

The page already ships with the on-page work done: title + meta description
containing "Sold-Out Labs", canonical URL, Open Graph tags, JSON-LD
`Organization` markup, `robots.txt`, `sitemap.xml`, and an internal link from
the calculator's footer. What's left is telling Google the page exists:

### If you're using the vercel.app URL (Option A)

> After the project rename, add a **new** URL-prefix property for
> `https://sold-out-labs.vercel.app/` — the old `sold-out-calc` property
> now points at a redirecting domain. The verification file works for both.

1. Go to [Google Search Console](https://search.google.com/search-console)
   → **Add property** → choose **URL prefix** (not Domain — you don't own
   `vercel.app`) → enter `https://sold-out-labs.vercel.app/`.
2. Verify ownership. Search Console's default is the **HTML file** method:
   it gives you a file like `google5fff8f9c303df6e0.html` to serve from the
   site root. Drop it into `public/` (Vite copies everything there to the
   deployed root) and deploy — it's then live at
   `https://sold-out-labs.vercel.app/google5fff8f9c303df6e0.html`. Click
   **Verify**. Don't delete the file afterwards; Google re-checks it.

   > Ours is already committed at `public/google5fff8f9c303df6e0.html`,
   > and the token is tied to your Google account, so the same file
   > verifies any property you add.

   The **HTML tag** method (a `<meta name="google-site-verification">` tag
   pasted into the `<head>` of both `index.html` and `calc.html`) works too.
   The DNS method won't work here since the `vercel.app` domain isn't yours.
3. **Sitemaps → Add a new sitemap** → enter `sitemap.xml` → Submit.
4. **URL Inspection** → paste `https://sold-out-labs.vercel.app/` →
   **Request Indexing**. This is the lever that matters for the weekend
   deadline — it usually gets a page indexed within
   hours-to-a-couple-of-days instead of weeks.
5. Repeat Request Indexing for `https://sold-out-labs.vercel.app/calc`.

### If you're on soldoutlabs.com (Option B)

1. In Search Console, add a **Domain** property for `soldoutlabs.com` and
   verify with the TXT record (Vercel dashboard → Domains → your domain →
   shows you how, or add the TXT in your registrar).
2. Update the hardcoded URLs as described in Option B of the domain section,
   deploy, then submit `sitemap.xml` and Request Indexing on the new URLs
   the same way as steps 3–5 above.

Reality check on timing: a brand-new page ranking #1 for "Sold-Out Labs" the
same weekend is not guaranteed. It helps a lot that the name is distinctive
(near-zero competition for the exact phrase). Requesting indexing on day one
is the best available play. Backup: whoever asks gets the link in the IG bio.

### Analytics

- The calculator already uses Vercel Analytics (`@vercel/analytics`).
- The coming-soon page (`index.html`) includes the static-page equivalent
  (`/_vercel/insights/script.js`). It reports automatically as long as
  **Analytics is enabled** for the project in the Vercel dashboard
  (Project → Analytics → Enable, if it isn't already).
- Traffic tagging: the coming-soon page's corner link points to the
  calculator with `?ref=labs&utm_source=labs`. Give the ad its own tag,
  e.g. `?ref=ig-ad-1&utm_source=ig-ad`, so ad-driven and labs-driven
  calculator visits stay distinguishable. Vercel Analytics shows
  `utm_source` as a filter; the `ref` value lands in the lead/waitlist
  sheets on signup.
