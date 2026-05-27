# Sold-Out Gap Calculator

> A free tool by **The Sold-Out System** — for fashion creators, designers, and small fashion brands launching clothing drops.

The Sold-Out Gap Calculator answers one emotionally useful question:

> **How far am I from a sold-out drop?**

More specifically: how many warm buyers are you missing before launch day?

It's designed to feel like a fast, elegant utility — not a heavy dashboard.

---

## Quick start

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173.

To build for production:

```bash
npm run build
npm run preview
```

The output goes to `dist/` — deploy it to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, etc.).

---

## Tech stack

- **Vite** + **React 18** + **TypeScript** — fast, modern, single-page tool
- **Tailwind CSS** — design system + responsive layout
- **Framer Motion** — calm, premium animations
- **Instrument Serif** + **Inter** — fashion-friendly display/body pairing

No backend. No login. No tracking. Everything calculates in the browser.

---

## Project structure

```
src/
├── App.tsx                       # One-page composition
├── main.tsx                      # React entry
├── index.css                     # Tailwind + design tokens
├── types.ts                      # Input / result / confidence types
├── lib/
│   ├── calculations.ts           # The single source of truth for math
│   └── utils.ts                  # cn() + clipboard helper
└── components/
    ├── Hero.tsx
    ├── Section.tsx               # Animated wrapper used by every form section
    ├── NumberField.tsx           # Reusable input
    ├── GoalSection.tsx
    ├── WarmDemandSection.tsx
    ├── AudienceSection.tsx
    ├── TimelineSection.tsx
    ├── ConversionSection.tsx     # Conservative / Realistic / Strong / Custom
    ├── Results.tsx               # Main result card + supporting stats + insight
    ├── ConfidenceBadge.tsx
    ├── AnimatedNumber.tsx        # Count-up animation
    ├── SendReport.tsx            # Email/SMS capture (post-result)
    ├── SoftCTA.tsx               # Drop Leak Check link
    └── Footer.tsx
```

---

## The math

All calculations live in `src/lib/calculations.ts`. Formulas follow the
handoff spec exactly:

```
total_warm_reach        = sum of all direct channels
conversion_decimal      = selected % / 100
required_orders         = ceil(revenue_goal / aov)
required_warm_buyers    = ceil(required_orders / conversion_decimal)
sold_out_gap            = max(0, ceil(required_warm_buyers - total_warm_reach))
projected_orders        = floor(total_warm_reach * conversion_decimal)
projected_revenue       = round(projected_orders * aov)
daily_signup_target     = max(0, ceil(sold_out_gap / days_until_launch))
coverage_ratio          = total_warm_reach / required_warm_buyers
warm_audience_ratio     = total_warm_reach / follower_count
```

### Confidence levels (from `coverage_ratio`)

| Range        | Level           |
| ------------ | --------------- |
| ≥ 100%       | Strong Position |
| 70% – 99%    | Close           |
| 40% – 69%    | At Risk         |
| < 40%        | High Risk       |

---

## Premium utility features

- **Recalculate** instantly with Conservative / Realistic / Strong (or a custom %).
- **Copy My Results** — formatted text dump for sharing with a partner / pasting in Notes.
- **Copy Tool Link** — bookmark before every drop.
- **Send My Report** — email capture (phone optional, with consent copy).
- **Soft CTA** — link out to a Drop Leak Check (placeholder href, swap in your real link).

---

## Hooking up "Send My Report"

By default the "Send My Report" form runs in **demo mode** — it shows a
success state without saving anything. To capture real leads into a
Google Sheet **and** automatically email each user their forecast:

1. Follow [`docs/REPORT_CAPTURE_SETUP.md`](docs/REPORT_CAPTURE_SETUP.md) (~5 minutes).
2. Paste the Apps Script Web App URL into `.env`:

   ```
   VITE_REPORT_ENDPOINT_URL=https://script.google.com/macros/s/.../exec
   ```

3. Restart `npm run dev`. Submissions now land in your sheet and the
   user gets a branded HTML email with their forecast.

The Apps Script lives in `scripts/google-apps-script/Code.gs`. The
frontend submit logic lives in `src/lib/reportSubmit.ts` — when you
outgrow Apps Script, point that file at Resend, Loops, ConvertKit,
Klaviyo, or your own API. Everything else stays the same.

---

## What this tool intentionally does **not** include

No login. No accounts. No dashboard. No AI audit. No payment. No admin.
No required email/SMS gate before results.

The goal is one realization:

> "I don't just need more hype. I need enough warm demand before launch."

That's the whole product.
