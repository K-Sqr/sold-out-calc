/**
 * Sold-Out Labs — coming-soon waitlist capture.
 *
 * Bind this script to a Google Sheet (can be the same spreadsheet as the
 * calculator leads — it writes to its own tab), then deploy it as a Web App
 * (Anyone with the link, execute as: Me).
 *
 * Full setup steps: docs/LABS_WAITLIST_SETUP.md
 *
 * The page (/labs) submits in two ways:
 *   1. No JS: a native HTML form POST (form-urlencoded). We respond with a
 *      small styled HTML confirmation page.
 *   2. With JS: fetch() sends the same fields plus format=json. We respond
 *      with JSON and the page shows its inline confirmation state.
 */

// ---------- Config ---------------------------------------------------------

const SHEET_NAME = 'Waitlist';
const BRAND_NAME = 'Sold-Out Labs';

// Where the "Back" link on the no-JS confirmation page points.
const LABS_URL = 'https://sold-out-calc.vercel.app/labs';

// ---------- Entry points ---------------------------------------------------

function doGet() {
  return jsonOut_({ ok: true, message: 'Sold-Out Labs waitlist endpoint is live.' });
}

function doPost(e) {
  const wantsJson = !!(e && e.parameter && e.parameter.format === 'json');

  try {
    const p = (e && e.parameter) || {};
    const email = String(p.email || '').trim();

    // Honeypot: bots fill the hidden "company" field. Pretend it worked.
    if (String(p.company || '').trim() !== '') {
      return wantsJson ? jsonOut_({ ok: true }) : htmlConfirmation_();
    }

    if (!email || email.indexOf('@') === -1 || email.length < 5) {
      return wantsJson
        ? jsonOut_({ ok: false, error: 'Invalid email' })
        : htmlError_('That email address doesn\u2019t look right. Go back and try again.');
    }

    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      new Date(),
      email,
      String(p.ref || ''),
      String(p.source || ''),
      String(p.page || ''),
    ]);

    return wantsJson ? jsonOut_({ ok: true }) : htmlConfirmation_();
  } catch (err) {
    Logger.log(err);
    return wantsJson
      ? jsonOut_({ ok: false, error: String(err) })
      : htmlError_('Something went wrong on our end. Go back and try again.');
  }
}

// ---------- Sheet ----------------------------------------------------------

const HEADERS = ['Timestamp', 'Email', 'Ref', 'Source', 'Page URL'];

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet
      .getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0E0D0B')
      .setFontColor('#FBF9F5');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

// ---------- Responses -------------------------------------------------------

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Styled confirmation page for the no-JS fallback path. */
function htmlConfirmation_() {
  return htmlPage_(
    'You\u2019re on the list.',
    'We\u2019ll only email when there\u2019s something real.'
  );
}

function htmlError_(message) {
  return htmlPage_('Hmm, that didn\u2019t work.', message);
}

function htmlPage_(title, body) {
  const html = [
    '<!doctype html><html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + escapeHtml_(title) + ' \u2014 ' + escapeHtml_(BRAND_NAME) + '</title>',
    '<style>',
    'body{margin:0;background:#FBF9F5;color:#1A1916;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;',
    'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;}',
    '.card{max-width:26rem;}',
    '.brand{font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6B6864;font-weight:600;}',
    'h1{font-family:Georgia,serif;font-size:32px;letter-spacing:-0.02em;margin:16px 0 10px;color:#0E0D0B;font-weight:500;}',
    'p{font-size:15px;line-height:1.6;color:#6B6864;margin:0;}',
    'a{display:inline-block;margin-top:24px;background:#0E0D0B;color:#FBF9F5;text-decoration:none;font-weight:600;',
    'font-size:14px;padding:12px 22px;border-radius:999px;}',
    '</style></head><body>',
    '<div class="card">',
    '<div class="brand">' + escapeHtml_(BRAND_NAME) + '</div>',
    '<h1>' + escapeHtml_(title) + '</h1>',
    '<p>' + escapeHtml_(body) + '</p>',
    '<a href="' + escapeHtml_(LABS_URL) + '">Back to ' + escapeHtml_(BRAND_NAME) + '</a>',
    '</div></body></html>',
  ].join('');

  return HtmlService.createHtmlOutput(html)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ---------- Helpers ---------------------------------------------------------

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- One-off test from the Apps Script editor -----------------------

/**
 * Run this once from the Apps Script editor (Run > runSelfTest)
 * to verify the sheet tab gets created and a row lands in it.
 */
function runSelfTest() {
  doPost({
    parameter: {
      email: 'test@example.com',
      ref: 'self-test',
      source: 'labs-coming-soon',
      page: LABS_URL,
      format: 'json',
    },
  });
}
