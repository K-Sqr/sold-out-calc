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
// These are the Snapshot Generator's scoring/routing + manual-override fields.
// All are safe to edit by hand in the sheet; auto-scoring only fills a few.
const INTERNAL_COLUMNS = [
  'Estimated Stage',
  'Paid Fit Score',
  'Revenue Gap',
  'Primary Growth Lever',
  'Primary Bottleneck',
  'Secondary Bottleneck',
  'Recommended Sold-Out Engine',
  'Fit Status',
  'Notes',
  'Next Step',
  'Follow-Up Status',
];

// Max rows the /snapshot builder pulls when listing submissions.
const LIST_LIMIT = 100;

// Script Property name holding the shared access key for listing submissions.
// Set it once (see setListAccessKey below) so only your team can pull data.
const LIST_KEY_PROP = 'LIST_KEY';

// ---------- Entry points ---------------------------------------------------

function doGet(e) {
  const mode = e && e.parameter ? e.parameter.mode : '';
  if (mode === 'list') {
    return listSubmissions_(e);
  }
  return jsonOut_({ ok: true, message: 'Sold-Out Stage Diagnostic endpoint is live.' });
}

/**
 * Return recent submissions as JSON so the Snapshot Generator (/snapshot) can
 * pre-fill the builder. Read-only. Most-recent first.
 *
 * Access-gated: requires ?key= to match the LIST_KEY Script Property. This keeps
 * random visitors from pulling everyone's submissions. It is NOT a login system
 * — just one shared team key. Submitting the diagnostic (doPost) is unaffected.
 */
function listSubmissions_(e) {
  const provided = e && e.parameter ? e.parameter.key : '';
  const expected = PropertiesService.getScriptProperties().getProperty(LIST_KEY_PROP);

  if (!expected) {
    return jsonOut_({
      ok: false,
      error:
        'List access key not configured. Run setListAccessKey once in the ' +
        'Apps Script editor to set a LIST_KEY, then redeploy.',
    });
  }
  if (String(provided) !== String(expected)) {
    return jsonOut_({ ok: false, error: 'Invalid access key.' });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) {
      return jsonOut_({ ok: true, rows: [] });
    }

    const headers = readHeaders_(sheet);
    const lastRow = sheet.getLastRow();
    const numData = lastRow - 1;
    const take = Math.min(LIST_LIMIT, numData);
    const startRow = lastRow - take + 1;

    const values = sheet.getRange(startRow, 1, take, headers.length).getValues();
    const rows = [];
    for (let i = 0; i < values.length; i++) {
      const rowValues = values[i];
      const map = {};
      for (let c = 0; c < headers.length; c++) {
        const cell = rowValues[c];
        map[headers[c]] = cell instanceof Date ? cell.toISOString() : String(cell);
      }
      const ts = rowValues[0];
      rows.push({
        rowIndex: startRow + i,
        timestamp: ts instanceof Date ? ts.toISOString() : String(ts),
        values: map,
      });
    }
    rows.reverse(); // most recent first
    return jsonOut_({ ok: true, rows: rows });
  } catch (err) {
    Logger.log(err);
    return jsonOut_({ ok: false, error: String(err) });
  }
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

  // Auto-filled internal columns (Notes / Follow-Up Status left blank for us).
  rowMap['Estimated Stage'] = scores.stage;
  rowMap['Paid Fit Score'] = scores.fitScore;
  rowMap['Revenue Gap'] = scores.revenueGap;
  rowMap['Primary Growth Lever'] = scores.growthLever;
  rowMap['Primary Bottleneck'] = scores.bottleneck;
  rowMap['Recommended Sold-Out Engine'] = scores.engine;
  rowMap['Fit Status'] = scores.fitStatus;

  const row = headers.map(function (h) {
    return rowMap[h] !== undefined ? rowMap[h] : '';
  });

  sheet.appendRow(row);
}

// ---------- Scoring (edit me freely) ---------------------------------------

/**
 * Simple, EDITABLE first-pass scoring. The directive is explicit that this
 * does not need to be perfect yet — the point is a flexible data model that
 * inspects multiple possible bottlenecks (offer, attention, demand, launch,
 * aftermath, operations) rather than assuming pre-launch demand.
 *
 * `byId` keys are the question ids from src/diagnostic/schema.ts, e.g.
 * monthly_revenue, bottleneck, email_list_size, runs_paid_ads, next_drop_goal...
 */
function scoreSubmission_(byId) {
  const route = routeBottleneck_(byId);
  const fitScore = paidFitScore_(byId);
  return {
    stage: estimateStage_(byId),
    fitScore: fitScore,
    revenueGap: revenueGap_(byId),
    growthLever: route.lever,
    bottleneck: route.bottleneck,
    engine: route.engine,
    fitStatus: fitStatus_(byId, fitScore),
  };
}

function estimateStage_(b) {
  const monthly = b.monthly_revenue || '';
  const launched = num_(b.num_drops) > 0;

  // Adaptation / Diversify: $100K+/month.
  if (monthly === '100k_plus_mo') return 'Adaptation / Diversify';

  // Growth / Scale + Stabilize: $30K–$100K/month.
  if (monthly === '30k_100k_mo') return 'Growth / Scale + Stabilize';

  // Everything else (under $30K/month, or no proven launches): Beta / Prove It.
  if (!launched) return 'Beta / Prove It';
  return 'Beta / Prove It';
}

/**
 * 0–100 rough "is this a fit for a first paid install?" signal.
 * Higher = more proven economics to work with. Tune the weights as we learn.
 */
function paidFitScore_(b) {
  let score = 0;

  if (num_(b.num_drops) > 0) score += 15;

  const monthly = b.monthly_revenue || '';
  if (monthly === '10k_30k_mo') score += 20;
  else if (monthly === '30k_100k_mo') score += 35;
  else if (monthly === '100k_plus_mo') score += 30; // very large may route to a future engine
  else if (monthly === 'under_10k_mo') score += 5;

  // Owned audience to activate.
  const list = num_(b.email_list_size) + num_(b.sms_list_size) + num_(b.community_size);
  if (list >= 10000) score += 15;
  else if (list >= 2500) score += 10;
  else if (list >= 500) score += 6;

  // Healthy unit economics make a paid install more likely to pay back.
  const margin = b.gross_margin || '';
  if (margin === '60_75' || margin === '75_plus') score += 10;
  else if (margin === '40_60') score += 5;
  if ((b.drops_profitable || '').toLowerCase() === 'yes') score += 5;

  // Some commercial infrastructure / intent already in place.
  if ((b.runs_paid_ads || '').toLowerCase() === 'yes') score += 5;
  if (num_(b.next_drop_goal) > 0) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * The revenue jump the brand is trying to make: next drop goal minus a midpoint
 * estimate of their last drop. Returns a signed number (blank if not enough
 * data). Editable — swap in best-drop or monthly logic later if we prefer.
 */
function revenueGap_(b) {
  const goal = num_(b.next_drop_goal);
  if (goal <= 0) return '';
  const lastMid = dropRangeMidpoint_(b.last_drop_revenue);
  if (lastMid === null) return goal; // no baseline — the goal itself is the target
  return goal - lastMid;
}

function dropRangeMidpoint_(range) {
  const mids = {
    under_10k: 5000,
    '10k_25k': 17500,
    '25k_50k': 37500,
    '50k_100k': 75000,
    '100k_plus': 125000,
  };
  return mids[range] !== undefined ? mids[range] : null;
}

/**
 * Map the self-assessed constraint to a primary growth lever + the candidate
 * Sold-Out Engine we may install first. ENGINES ARE NOT BUILT YET — this is
 * just the routing label. All of this is intentionally easy to edit.
 */
function routeBottleneck_(b) {
  // bottleneck value -> { label, lever, engine }
  const map = {
    offer_unclear: {
      label: 'Offer/product not clear enough',
      lever: 'Offer', engine: 'Sold-Out Offer Engine',
    },
    not_special: {
      label: "Can't communicate why it's special",
      lever: 'Attention', engine: 'Sold-Out Attention Engine',
    },
    not_enough_ready: {
      label: 'Not enough warm buyers before launch',
      lever: 'Demand', engine: 'Sold-Out Demand Engine',
    },
    too_dependent_social: {
      label: 'Over-dependent on IG/TikTok reach',
      lever: 'Demand', engine: 'Sold-Out Demand Engine',
    },
    aov_too_low: {
      label: 'AOV too low',
      lever: 'Offer', engine: 'Sold-Out Offer Engine',
    },
    margins_tight: {
      label: 'Margins too tight',
      lever: 'Offer', engine: 'Sold-Out Offer Engine',
    },
    launch_chaotic: {
      label: 'Chaotic launch execution',
      lever: 'Launch', engine: 'Sold-Out Launch Engine',
    },
    inconsistent_drops: {
      label: 'Inconsistent drops',
      lever: 'Operating Rhythm', engine: 'Sold-Out Operating Rhythm',
    },
    low_repeat: {
      label: 'Weak repeat / retention',
      lever: 'Aftermath', engine: 'Sold-Out Aftermath Engine',
    },
    ads_not_profitable: {
      label: 'Paid ads not profitable',
      lever: 'Offer', engine: 'Sold-Out Offer Engine',
    },
    not_sure: {
      label: 'Unsure (needs review)',
      lever: 'Needs review', engine: 'Needs manual review',
    },
  };

  const v = b.bottleneck || '';
  const hit = map[v];
  if (hit) {
    return { bottleneck: hit.label, lever: hit.lever, engine: hit.engine };
  }
  return {
    bottleneck: v || 'Unsure (needs review)',
    lever: 'Needs review',
    engine: 'Needs manual review',
  };
}

/**
 * Coarse fit bucket for quick triage. Editable. Very large brands are flagged
 * for review since they may be routed to a future (not-yet-built) engine.
 */
function fitStatus_(b, score) {
  if ((b.monthly_revenue || '') === '100k_plus_mo') return 'Review — possible future engine';
  if (score >= 60) return 'Likely fit';
  if (score >= 35) return 'Maybe — needs review';
  return 'Not yet';
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

// ---------- One-off setup from the Apps Script editor ----------------------

/**
 * Set the shared access key that the /snapshot builder must provide to list
 * submissions. Edit the value below, Run this once, then redeploy a New version.
 *
 * Pick anything hard to guess (e.g. a long random string). Share it only with
 * your team — they'll paste it into the builder's "access key" field once.
 */
function setListAccessKey() {
  const KEY = 'whereismy20k?';
  PropertiesService.getScriptProperties().setProperty(LIST_KEY_PROP, KEY);
  Logger.log('LIST_KEY set. Team access key is now: ' + KEY);
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
          { id: 'monthly_revenue', label: 'Approx. monthly revenue range', value: '30k_100k_mo', display: '$30K – $100K / month' },
          { id: 'last_drop_revenue', label: 'Last drop revenue range', value: '25k_50k', display: '$25K – $50K' },
          { id: 'num_drops', label: 'Number of drops launched so far', value: '6', display: '6' },
          { id: 'gross_margin', label: 'Gross margin range', value: '60_75', display: '60% – 75%' },
          { id: 'drops_profitable', label: 'Are your drops profitable...', value: 'yes', display: 'Yes' },
          { id: 'runs_paid_ads', label: 'Do you run paid ads?', value: 'Yes', display: 'Yes' },
          { id: 'next_drop_goal', label: 'Next drop revenue goal', value: '60000', display: '60000' },
          { id: 'bottleneck', label: 'What feels like the biggest constraint right now?', value: 'aov_too_low', display: 'AOV is too low' },
        ],
      }),
    },
  });
}
