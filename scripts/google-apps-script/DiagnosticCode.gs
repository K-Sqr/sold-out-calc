/**
 * Sold-Out Stage Diagnostic V0 — submission capture.
 *
 * Bind this script to a (new) Google Sheet, then deploy it as a Web App
 * (Anyone with the link, execute as: Me). Paste the resulting /exec URL into
 * the frontend's .env as VITE_DIAGNOSTIC_ENDPOINT_URL.
 *
 * Full setup steps: docs/DIAGNOSTIC_SETUP.md
 *
 * Design goals (per the dev directive):
 *   - Every submission becomes one new row with all fields captured.
 *   - Columns are DYNAMIC: add/remove/reorder questions in the frontend schema
 *     and new columns appear automatically — no edits needed here.
 *   - Internal review columns are always present and easy to edit.
 *   - Stage / fit / bottleneck / module scoring is intentionally simple and
 *     lives in ONE place (scoreSubmission_) so it's easy to update later.
 *   - NO hardcoded assumption that pre-launch demand is the bottleneck.
 */

// ---------- Config ---------------------------------------------------------

const SHEET_NAME = 'Diagnostics';

// Internal review columns, always kept at the right edge of the sheet.
const INTERNAL_COLUMNS = [
  'Estimated Stage',
  'Paid Fit Score',
  'Primary Bottleneck',
  'Recommended Sold-Out Module',
  'Notes',
  'Follow-up Status',
];

// ---------- Entry points ---------------------------------------------------

function doGet() {
  return jsonOut_({ ok: true, message: 'Sold-Out Stage Diagnostic endpoint is live.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'Missing request body' });
    }

    const data = JSON.parse(e.postData.contents);
    const fields = Array.isArray(data.fields) ? data.fields : [];
    if (!fields.length) {
      return jsonOut_({ ok: false, error: 'No fields submitted' });
    }

    // Stable id -> raw value map for scoring.
    const byId = {};
    fields.forEach(function (f) {
      if (f && f.id) byId[f.id] = f.value;
    });

    const scores = scoreSubmission_(byId);

    const sheet = getOrCreateSheet_();
    appendSubmission_(sheet, data, fields, scores);

    return jsonOut_({ ok: true });
  } catch (err) {
    Logger.log(err);
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ---------- Sheet (dynamic columns) ----------------------------------------

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    // Seed with the baseline columns; field columns get added on demand.
    const headers = ['Timestamp'].concat(INTERNAL_COLUMNS).concat(['Source URL']);
    sheet.appendRow(headers);
    styleHeader_(sheet, headers.length);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function styleHeader_(sheet, count) {
  sheet
    .getRange(1, 1, 1, count)
    .setFontWeight('bold')
    .setBackground('#0E0D0B')
    .setFontColor('#FBF9F5');
}

/** Read the header row as an array of label strings. */
function readHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
    return String(h);
  });
}

/**
 * Ensure a column exists for every field label, inserting new field columns
 * just BEFORE the internal review columns so the sheet reads left-to-right:
 * Timestamp | ...questions... | internal columns | Source URL.
 */
function ensureColumns_(sheet, fields) {
  let headers = readHeaders_(sheet);

  fields.forEach(function (f) {
    const label = f.label || f.id;
    if (headers.indexOf(label) !== -1) return;

    // Insert before the first internal column (fallback: before Source URL).
    let insertAt = headers.indexOf(INTERNAL_COLUMNS[0]);
    if (insertAt === -1) insertAt = headers.indexOf('Source URL');
    if (insertAt === -1) insertAt = headers.length;

    sheet.insertColumnBefore(insertAt + 1);
    sheet.getRange(1, insertAt + 1).setValue(label);
    headers = readHeaders_(sheet);
  });

  styleHeader_(sheet, headers.length);
  return headers;
}

function appendSubmission_(sheet, data, fields, scores) {
  const headers = ensureColumns_(sheet, fields);

  // Build a header -> value map for this row.
  const rowMap = {};
  rowMap['Timestamp'] = new Date();
  rowMap['Source URL'] = data.sourceUrl || '';

  fields.forEach(function (f) {
    const label = f.label || f.id;
    // Prefer the human-readable display; fall back to the raw value.
    rowMap[label] = (f.display !== undefined && f.display !== '') ? f.display : f.value;
  });

  // Auto-filled internal columns (Notes / Follow-up Status left blank for us).
  rowMap['Estimated Stage'] = scores.stage;
  rowMap['Paid Fit Score'] = scores.fitScore;
  rowMap['Primary Bottleneck'] = scores.bottleneck;
  rowMap['Recommended Sold-Out Module'] = scores.module;

  const row = headers.map(function (h) {
    return rowMap[h] !== undefined ? rowMap[h] : '';
  });

  sheet.appendRow(row);
}

// ---------- Scoring (edit me freely) ---------------------------------------

/**
 * Simple, EDITABLE first-pass scoring. The directive is explicit that this
 * does not need to be perfect yet — the point is a flexible data model.
 *
 * `byId` keys are the question ids from src/diagnostic/schema.ts, e.g.
 * monthly_revenue, has_launched, bottleneck, email_list_size, runs_paid_ads...
 */
function scoreSubmission_(byId) {
  return {
    stage: estimateStage_(byId),
    fitScore: paidFitScore_(byId),
    bottleneck: primaryBottleneck_(byId),
    module: recommendedModule_(byId),
  };
}

function estimateStage_(b) {
  const monthly = b.monthly_revenue || '';
  const launched = (b.has_launched || '').toLowerCase() === 'yes';

  // Adaptation / Diversify: $100K+/month.
  if (monthly === '100k_plus_mo') return 'Adaptation / Diversify';

  // Growth / Scale + Stabilize: $30K–$100K/month with proven launches.
  if (monthly === '30k_100k_mo') return 'Growth / Scale + Stabilize';

  // Everything else (under $30K/month, or no proven launches): Beta / Prove It.
  if (!launched) return 'Beta / Prove It';
  return 'Beta / Prove It';
}

/**
 * 0–100 rough "is this a fit for the first paid install offer?" signal.
 * Higher = more proven economics to work with. Tune the weights as we learn.
 */
function paidFitScore_(b) {
  let score = 0;

  if ((b.has_launched || '').toLowerCase() === 'yes') score += 20;

  const monthly = b.monthly_revenue || '';
  if (monthly === '10k_30k_mo') score += 20;
  else if (monthly === '30k_100k_mo') score += 35;
  else if (monthly === '100k_plus_mo') score += 30; // very large may route to a future module
  else if (monthly === 'under_10k_mo') score += 5;

  // Owned audience to activate.
  const list = num_(b.email_list_size) + num_(b.sms_list_size) + num_(b.community_size);
  if (list >= 10000) score += 20;
  else if (list >= 2500) score += 14;
  else if (list >= 500) score += 8;

  // Some commercial infrastructure already in place.
  if ((b.uses_shopify || '').toLowerCase() === 'yes') score += 5;
  if ((b.runs_paid_ads || '').toLowerCase() === 'yes') score += 5;

  // A concrete near-term goal.
  if (num_(b.next_drop_goal) > 0) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Echo the operator's self-assessed constraint as a clean label. */
function primaryBottleneck_(b) {
  const map = {
    not_enough_buyers: 'Not enough pre-launch buyers',
    too_dependent_social: 'Over-dependent on IG/TikTok reach',
    list_too_small: 'Email/SMS list too small',
    like_not_buy: 'Engagement without conversion',
    aov_too_low: 'AOV too low',
    inconsistent_drops: 'Inconsistent drops',
    low_sell_through: 'Low sell-through',
    ads_not_profitable: 'Paid ads not profitable',
    low_retention: 'Weak retention / repeat',
    not_sure: 'Unsure (needs review)',
  };
  const v = b.bottleneck || '';
  return map[v] || (v ? v : 'Unsure (needs review)');
}

/**
 * Map the self-assessed bottleneck to a candidate Sold-Out module. These are
 * placeholders — the real module set is decided after more data. Kept here so
 * the routing is visible and editable in one spot.
 */
function recommendedModule_(b) {
  const map = {
    not_enough_buyers: 'Pre-Launch Demand Engine',
    too_dependent_social: 'Owned Audience Builder',
    list_too_small: 'Owned Audience Builder',
    like_not_buy: 'Conversion / Offer Tune-up',
    aov_too_low: 'AOV / Bundle Builder',
    inconsistent_drops: 'Drop Cadence System',
    low_sell_through: 'Sell-Through / Inventory Match',
    ads_not_profitable: 'Paid Acquisition Tune-up',
    low_retention: 'Retention / Repeat Engine',
    not_sure: 'Needs manual review',
  };
  const v = b.bottleneck || '';
  return map[v] || 'Needs manual review';
}

// ---------- Helpers --------------------------------------------------------

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function num_(n) {
  const x = Number(String(n == null ? '' : n).replace(/[^0-9.\-]/g, ''));
  return isFinite(x) ? x : 0;
}

// ---------- One-off test from the Apps Script editor -----------------------

/**
 * Run this once (Run > runDiagnosticSelfTest) to verify the sheet gets
 * created and a row lands with scoring filled in.
 */
function runDiagnosticSelfTest() {
  doPost({
    postData: {
      contents: JSON.stringify({
        submittedAt: new Date().toISOString(),
        sourceUrl: 'https://example.com/diagnostic',
        fields: [
          { id: 'brand_name', label: 'Brand name', value: 'Test Label', display: 'Test Label' },
          { id: 'contact_name', label: 'Founder / contact name', value: 'Jane Doe', display: 'Jane Doe' },
          { id: 'email', label: 'Email', value: 'jane@example.com', display: 'jane@example.com' },
          { id: 'email_list_size', label: 'Email list size', value: '3000', display: '3000' },
          { id: 'sms_list_size', label: 'SMS list size', value: '800', display: '800' },
          { id: 'community_size', label: 'Waitlist / VIP / community size', value: '400', display: '400' },
          { id: 'has_launched', label: 'Have you launched before?', value: 'Yes', display: 'Yes' },
          { id: 'monthly_revenue', label: 'Approx. monthly revenue range', value: '30k_100k_mo', display: '$30K – $100K / month' },
          { id: 'uses_shopify', label: 'Do you currently use Shopify?', value: 'Yes', display: 'Yes' },
          { id: 'runs_paid_ads', label: 'Do you currently run paid ads?', value: 'Yes', display: 'Yes' },
          { id: 'next_drop_goal', label: 'Next drop revenue goal', value: '40000', display: '40000' },
          { id: 'bottleneck', label: 'Biggest constraint right now', value: 'aov_too_low', display: 'AOV is too low' },
        ],
      }),
    },
  });
}
