# Sold-Out Labs — Coming-Soon Page Setup

The page lives at `/labs` (`labs.html`). It is a static page — no React, no
framework JS — so it loads fast and the email capture works even with
JavaScript blocked.

Three things need doing before the ad goes out:

1. [Wire up the waitlist email capture](#1-waitlist-email-capture) (~10 min)
2. [Buy and connect the domain](#2-domain) (~15 min)
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
5. In `labs.html`, find the form and replace the placeholder action URL:

   ```html
   <form id="waitlist-form" method="POST"
     action="https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID_HERE/exec">
   ```

6. In the Apps Script editor, run `runSelfTest` once and confirm a row lands
   in the `Waitlist` tab.
7. Deploy the site. Submit a real email on `/labs` and check the sheet.

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

**Recommendation: buy `soldoutlabs.com`.**

`so.labs` is **not an option** — `.labs` is not a real TLD in the global DNS
root zone (it only exists as a Web3/blockchain name that normal browsers and
Google cannot resolve). A subdomain of the vercel.app URL works technically
but looks less legitimate in an ad context and is weaker for ranking on a
brand-name search.

### Connect it to Vercel

1. Buy `soldoutlabs.com` (Namecheap, Cloudflare, or straight from Vercel —
   buying through Vercel skips the DNS steps).
2. Vercel dashboard → the `sold-out-calc` project → **Settings → Domains →
   Add** → `soldoutlabs.com` (and `www.soldoutlabs.com`, redirected to the
   apex). Follow the DNS instructions it gives you.
3. That's it for routing — `vercel.json` is already configured so that
   **`soldoutlabs.com/` serves the Labs page** while the calculator stays at
   the root of `sold-out-calc.vercel.app`:

   ```json
   { "source": "/", "has": [{ "type": "host", "value": "soldoutlabs.com" }], "destination": "/labs.html" }
   ```

4. After the domain is live, update the hardcoded URLs from
   `https://sold-out-calc.vercel.app/labs` to `https://soldoutlabs.com/` in:
   - `labs.html` — the `<link rel="canonical">`, `og:url`, and JSON-LD block
   - `public/sitemap.xml` and `public/robots.txt`
   - `scripts/google-apps-script/LabsWaitlist.gs` — `LABS_URL` (then redeploy it)

Until the domain is bought, everything works at
`https://sold-out-calc.vercel.app/labs` — put that in the ad if the domain
isn't ready in time.

---

## 3. SEO / Google Search Console

The page already ships with the on-page work done: title + meta description
containing "Sold-Out Labs", canonical URL, Open Graph tags, JSON-LD
`Organization` markup, `robots.txt`, `sitemap.xml`, and an internal link from
the calculator's footer. What's left is telling Google the page exists:

1. Go to [Google Search Console](https://search.google.com/search-console)
   and add a property:
   - If the domain is on Vercel: use a **Domain** property and verify with
     the TXT record (Vercel dashboard → Domains → your domain → shows you
     how, or add the TXT in your registrar).
   - For the vercel.app URL in the meantime: use a **URL prefix** property
     for `https://sold-out-calc.vercel.app/` and verify with the HTML tag
     method (paste the `<meta name="google-site-verification" ...>` tag into
     the `<head>` of `index.html` and `labs.html`, redeploy).
2. In Search Console: **Sitemaps → Add** → `sitemap.xml` → Submit.
3. **URL Inspection** → paste the labs URL → **Request Indexing**. This is
   the lever that matters for the weekend deadline — it usually gets a page
   indexed within hours-to-a-couple-of-days instead of weeks.
4. Repeat "Request Indexing" for the calculator root URL since its title
   changed to "Sold-Out Labs".

Reality check on timing: a brand-new page ranking #1 for "Sold-Out Labs" the
same weekend is not guaranteed. It helps a lot that the name is distinctive
(near-zero competition for the exact phrase). Requesting indexing on day one
+ the exact-match domain is the best available play. Backup: whoever asks
gets the link in the IG bio.

### Analytics

- The calculator already uses Vercel Analytics (`@vercel/analytics`).
- `labs.html` includes the static-page equivalent
  (`/_vercel/insights/script.js`). It reports automatically as long as
  **Analytics is enabled** for the project in the Vercel dashboard
  (Project → Analytics → Enable, if it isn't already).
- Traffic tagging: the Labs page button links to the calculator with
  `?ref=labs&utm_source=labs`. Give the ad its own tag, e.g.
  `?ref=ig-ad-1&utm_source=ig-ad`, so ad-driven and labs-driven calculator
  visits stay distinguishable. Vercel Analytics shows `utm_source` as a
  filter; the `ref` value lands in the lead/waitlist sheets on signup.
