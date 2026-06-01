# Capture leads + email reports with Google Sheets

This guide wires "Send My Report" up to a Google Sheet so you can:

1. **Capture every submission** (email, phone, the user's inputs, their forecast).
2. **Automatically email the user a beautifully formatted forecast** — no extra service required.

You'll set up **one** Google Sheet + Apps Script. Total time: ~5 minutes.

> Free Gmail accounts can send ~100 emails/day via MailApp. Google Workspace accounts can send ~1,500/day. That's plenty for V1. When you outgrow it, you can swap the `MailApp.sendEmail` line for Resend / Loops / Klaviyo without changing anything on the frontend.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.new](https://sheets.new) (this creates a blank Google Sheet).
2. Rename it something like **"Sold-Out Gap — Leads"**.
3. Leave the first sheet tab as-is — the script will create a `Leads` tab automatically the first time it runs, with all the right column headers.

---

## Step 2 — Open the Apps Script editor

In the Google Sheet:

1. Go to **Extensions → Apps Script**.
2. Delete the empty `function myFunction() { ... }` placeholder.
3. Open `scripts/google-apps-script/Code.gs` in this repo and **paste its entire contents** into the editor.
4. (Optional) Adjust the config block at the top of the script:
   - `BRAND_NAME`, `FROM_NAME`, `EMAIL_SUBJECT` — branding shown in the email
   - `TOOL_URL` — link the "Recalculate my gap" button in the email points to (defaults to the page the user came from)
   - `DROP_LEAK_CHECK_URL` — link the secondary CTA points to (leave empty to hide it)
5. Hit **Save** (the disk icon). Name the project, e.g. "Sold-Out Gap Capture".

---

## Step 3 — Verify it works (before deploying)

In the Apps Script editor:

1. Select the function `runSelfTest` from the function dropdown at the top of the toolbar.
2. Click **Run**.
3. The first time, Google will ask for permissions:
   - **Spreadsheets** — to write the row.
   - **External requests / Send email as you** — to send the email.

   Click **Review permissions → choose your Google account → Advanced → Go to ... (unsafe) → Allow**. (Google flags any non-published script as "unsafe" — that just means it isn't on the Marketplace. Your own script is fine.)
4. After it runs:
   - Check your **Google Sheet** — you should see a new "Leads" tab with one row of test data.
   - Check your **inbox** — you should see the formatted forecast email.

If both arrived, you're good. If not, scroll to **Troubleshooting** below.

---

## Step 4 — Deploy it as a Web App

Still in the Apps Script editor:

1. Click the blue **Deploy** button (top right) **→ New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description** — `Sold-Out Gap Calculator capture (v1)` (or whatever)
   - **Execute as** — **Me (your email)**
   - **Who has access** — **Anyone**
4. Click **Deploy**.
5. The first time you'll be prompted to authorize again. Allow it.
6. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb.................../exec
   ```

   This is the URL the frontend posts to.

> Whenever you change the script later, you have to deploy a **new version** for the live URL to pick it up. Use **Deploy → Manage deployments → ✏️ edit → Version: New version → Deploy**. The URL stays the same.

---

## Step 5 — Plug the URL into the frontend

In the project root:

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste the Web app URL:

   ```
   VITE_REPORT_ENDPOINT_URL=https://script.google.com/macros/s/AKfycb..../exec
   ```

3. Restart the dev server (Vite only reads env vars on startup):

   ```bash
   npm run dev
   ```

4. Open the tool, fill in the calculator, scroll to the **Send My Report** card, enter an email, and hit **Send My Report**. You should see:

   - A new row in your Google Sheet within a second or two.
   - The formatted forecast email in the inbox you typed.

Done — the demo-mode pill in the form is gone.

---

## What the Sheet captures

The script appends one row per submission with these columns:

| Column | Source |
| --- | --- |
| Timestamp | server time |
| Email | required |
| Phone | optional |
| Confidence | `Strong Position` / `Close` / `At Risk` / `High Risk` |
| Sold-Out Gap | the headline number |
| Required Warm Buyers | from formula |
| Current Warm Reach | sum of channels |
| Coverage % | `warm_reach / required_buyers` |
| Daily Signup Target | from formula |
| Days Until Launch | input |
| Projected Revenue | from formula |
| Projected Orders | from formula |
| Conversion % | the rate they used |
| Conversion Preset | `conservative` / `realistic` / `strong` / `custom` |
| Revenue Goal | input |
| AOV | input |
| Email List · SMS List · IG Broadcast · Waitlist · Other | individual channels |
| Follower Count | input |
| Warm / Followers % | `warm_reach / followers` |
| Source URL | the page they submitted from |

That's everything you need to understand who's using the tool and where they're stuck.

---

## Troubleshooting

**The form says "Sent" but no row appears in the sheet.**
You're probably still in demo mode. Open the browser devtools console — if you see `[SendReport] VITE_REPORT_ENDPOINT_URL is not set — running in DEMO mode`, the env var isn't loaded. Check that `.env` is in the project root (next to `package.json`) and that you restarted `npm run dev` after editing it.

**The form says "Report submission failed (401/403)".**
Re-deploy the Web App with **Who has access: Anyone** (not "Anyone with Google account"). Apps Script ignores changes to access settings until you create a new deployment.

**The row appears but no email is sent.**
Open the Apps Script editor → **Executions** tab. Look at the most recent run — if MailApp threw, it'll show the error. Most common cause: you hit the 100/day free quota. Workspace accounts get 1,500/day.

**Emails land in spam.**
This is rare for MailApp because emails come from your verified Google address, but it can happen with brand-new sender histories. Have the user add the sender to their contacts, or move to a transactional provider (Resend/Loops) when you're ready.

**I edited the script but nothing changed.**
You have to **redeploy** for the live URL to pick up changes. **Deploy → Manage deployments → edit → Version: New version → Deploy**.

**Can I see who submitted in real time?**
Yes — keep the Google Sheet open in a tab. Rows append live as people submit.

---

## (Optional) SMS report links via Twilio

When a user enters their phone number, the app now sends them an SMS with a personalized link to their forecast results. The link encodes their inputs as URL params — no database needed.

### What you need

- A **Twilio account** (free trial works for testing) — [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
- A **Twilio toll-free number** that can send SMS (e.g. `+18667744589`) — must complete [Toll-Free Verification](https://console.twilio.com) before messages deliver to US numbers
- Three credentials from the [Twilio Console](https://console.twilio.com):
  - **Account SID** — starts with `AC...`
  - **Auth Token** — visible on the dashboard
  - **From Number** — your verified toll-free number in E.164 format (e.g. `+18667744589`)

### Setup (one-time, ~2 minutes)

1. In the **Apps Script editor** for your Google Sheet, go to **Project Settings** (the gear icon in the left sidebar).
2. Scroll to **Script Properties** and add three entries:

   | Property | Value |
   | --- | --- |
   | `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
   | `TWILIO_AUTH_TOKEN` | your auth token |
   | `TWILIO_FROM_NUMBER` | `+18667744589` |

3. **Redeploy** the Web App so the updated `Code.gs` is live: **Deploy → Manage deployments → edit → Version: New version → Deploy**.

That's it. The next time someone submits the form with a phone number, they'll receive an SMS like:

> Here's your Sold-Out Gap report — tap to pick up where you left off:
> https://yourtool.com?goal=5000&aov=85&email=320&conv=realistic

Tapping the link opens the calculator with their exact numbers pre-filled and results showing immediately.

### How it works

1. The React app encodes the user's calculator inputs into URL query params via `buildReportUrl()`.
2. That URL is included in the POST payload to Apps Script as `reportUrl`.
3. Apps Script calls Twilio's REST API to send a single transactional SMS with the link.
4. When the user opens the link, `readInputsFromUrl()` parses the params and pre-fills the calculator.

### Costs

- Twilio SMS: ~$0.0079/message in the US, ~$0.05/message internationally
- No other infrastructure costs — everything runs in Google Apps Script

### If Twilio isn't configured

SMS is silently skipped. The email report still sends normally. You'll see `SMS skipped — Twilio credentials not configured` in the Apps Script execution log.

### Twilio trial account limitations

On a free trial, you can only send SMS to **verified** phone numbers (numbers you've confirmed in the Twilio console). To send to any number, upgrade your Twilio account (~$20 minimum top-up).

---

## When to graduate from Apps Script

Apps Script is great for V1. You'll likely want to move when:

- You hit the 100/day (free) or 1,500/day (Workspace) MailApp quota
- You want richer email branding, open/click tracking, or A/B testing
- You want to add to a CRM (HubSpot, Notion, Airtable, etc.)
- You want more sophisticated SMS flows (reminders, sequences, etc.)

When that day comes: swap `submitReport` in `src/lib/reportSubmit.ts` to call **your** endpoint (Resend, Loops, ConvertKit, your own API). The frontend doesn't care where the data goes — it just POSTs JSON to whatever URL you give it.
