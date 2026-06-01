/**
 * Sold-Out Gap Calculator — Lead capture + report email.
 *
 * Bind this script to a Google Sheet, then deploy it as a Web App
 * (Anyone with the link, execute as: Me).
 *
 * Full setup steps: docs/REPORT_CAPTURE_SETUP.md
 */

// ---------- Config ---------------------------------------------------------

const SHEET_NAME = 'Leads';

// Branding shown in the email + sheet.
const BRAND_NAME = 'The Sold-Out System';
const FROM_NAME = 'The Sold-Out System';
const EMAIL_SUBJECT = 'Your Sold-Out Gap Forecast';

// Optional: where the "Recalculate" button in the email should link to.
// If empty, the script falls back to the page the user submitted from.
const TOOL_URL = 'https://sold-out-calc.vercel.app/';

// Optional: where the "Get a Free Drop Leak Check" button should link.
const DROP_LEAK_CHECK_URL = '';

// ---------- Entry points ---------------------------------------------------

function doGet() {
  return jsonOut_({ ok: true, message: 'Sold-Out Gap Calculator endpoint is live.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'Missing request body' });
    }

    const data = JSON.parse(e.postData.contents);

    if (!data.email || String(data.email).indexOf('@') === -1) {
      return jsonOut_({ ok: false, error: 'Invalid email' });
    }

    const sheet = getOrCreateSheet_();
    appendRow_(sheet, data);

    let emailed = false;
    try {
      sendReportEmail_(data);
      emailed = true;
    } catch (mailErr) {
      Logger.log('Mail send failed: ' + mailErr);
    }

    let smsSent = false;
    if (data.phone && String(data.phone).trim().length >= 10 && data.reportUrl) {
      try {
        sendReportSms_(data.phone, data.reportUrl);
        smsSent = true;
      } catch (smsErr) {
        Logger.log('SMS send failed: ' + smsErr);
      }
    }

    return jsonOut_({ ok: true, emailed: emailed, smsSent: smsSent });
  } catch (err) {
    Logger.log(err);
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ---------- Sheet ----------------------------------------------------------

const HEADERS = [
  'Timestamp',
  'Email',
  'Phone',
  'Confidence',
  'Sold-Out Gap',
  'Required Warm Buyers',
  'Current Warm Reach',
  'Coverage %',
  'Daily Signup Target',
  'Days Until Launch',
  'Projected Revenue',
  'Projected Orders',
  'Conversion %',
  'Conversion Preset',
  'Revenue Goal',
  'AOV',
  'Email List',
  'SMS List',
  'IG Broadcast',
  'Waitlist / VIP',
  'Other Direct',
  'Follower Count',
  'Warm / Followers %',
  'Source URL',
];

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

function appendRow_(sheet, d) {
  const i = d.inputs || {};
  const r = d.results || {};
  const c = d.confidence || {};

  const coveragePct = round_(safeNum_(r.coverageRatio) * 100, 1);
  const warmFollowersPct = round_(safeNum_(r.warmAudienceRatio) * 100, 1);

  sheet.appendRow([
    new Date(),
    d.email || '',
    d.phone || '',
    c.label || '',
    safeNum_(r.soldOutGap),
    safeNum_(r.requiredWarmBuyers),
    safeNum_(r.totalWarmReach),
    coveragePct,
    safeNum_(r.dailySignupTarget),
    safeNum_(i.daysUntilLaunch),
    safeNum_(r.projectedRevenue),
    safeNum_(r.projectedOrders),
    safeNum_(i.conversionRate),
    i.conversionOption || '',
    safeNum_(i.revenueGoal),
    safeNum_(i.averageOrderValue),
    safeNum_(i.emailList),
    safeNum_(i.smsList),
    safeNum_(i.igBroadcast),
    safeNum_(i.waitlistVip),
    safeNum_(i.otherDirect),
    safeNum_(i.followerCount),
    warmFollowersPct,
    d.sourceUrl || '',
  ]);
}

// ---------- Email ----------------------------------------------------------

function sendReportEmail_(d) {
  const html = renderEmailHtml_(d);
  const text = renderEmailText_(d);

  MailApp.sendEmail({
    to: d.email,
    subject: EMAIL_SUBJECT,
    htmlBody: html,
    body: text,
    name: FROM_NAME,
  });
}

function renderEmailHtml_(d) {
  const i = d.inputs || {};
  const r = d.results || {};
  const c = d.confidence || {};

  const confLevel = (c.level || '').toLowerCase();
  const accentByLevel = {
    'strong': '#3F6E4A',
    'close': '#B5832C',
    'at-risk': '#C2562A',
    'high-risk': '#A23A2A',
  };
  const accent = accentByLevel[confLevel] || '#C2562A';

  const gap = safeNum_(r.soldOutGap);
  const required = safeNum_(r.requiredWarmBuyers);
  const reach = safeNum_(r.totalWarmReach);
  const daily = safeNum_(r.dailySignupTarget);
  const revenueGoal = safeNum_(i.revenueGoal);
  const projectedRevenue = safeNum_(r.projectedRevenue);
  const days = safeNum_(i.daysUntilLaunch);
  const convPct = safeNum_(i.conversionRate);
  const coveragePct = Math.max(0, Math.min(100, Math.round(safeNum_(r.coverageRatio) * 100)));

  // Build a pre-filled URL from the inputs so "Recalculate" opens the
  // calculator with the user's numbers already entered.
  const toolUrl = buildReportUrl_(d);

  const gapZero = gap <= 0;

  return [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"><title>' + escapeHtml_(EMAIL_SUBJECT) + '</title></head>',
    '<body style="margin:0;padding:0;background:#FBF9F5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Inter,Helvetica,Arial,sans-serif;color:#0E0D0B;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FBF9F5;">',
    '  <tr><td align="center" style="padding:32px 16px;">',
    '    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">',

    // Brand
    '      <tr><td style="padding:0 4px 16px 4px;">',
    '        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6B6864;font-weight:600;">' + escapeHtml_(BRAND_NAME) + '</div>',
    '      </td></tr>',

    // Hero card
    '      <tr><td style="background:#0E0D0B;border-radius:24px;padding:32px;color:#FBF9F5;">',
    '        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,241,234,0.7);font-weight:600;">Your Sold-Out Gap is</div>',
    '        <div style="font-family:Georgia,serif;font-size:64px;line-height:1;margin-top:10px;letter-spacing:-0.02em;">' + formatNumber_(gap) + '</div>',
    '        <div style="font-size:13px;color:rgba(245,241,234,0.7);margin-top:6px;">warm buyers</div>',
    '        <div style="height:1px;background:rgba(245,241,234,0.12);margin:24px 0;"></div>',
    '        <div style="font-size:15px;line-height:1.55;color:rgba(245,241,234,0.85);">',
    gapZero
      ? '          Based on your numbers, your warm demand can support this revenue goal.'
      : '          To hit <strong style="color:#FBF9F5;">' + formatCurrency_(revenueGoal) +
        '</strong>, you likely need about <strong style="color:#FBF9F5;">' + formatNumber_(required) +
        '</strong> warm buyers before launch day.',
    '        </div>',

    // Coverage bar
    '        <div style="margin-top:24px;">',
    '          <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,241,234,0.6);">',
    '            <span>Coverage</span><span style="color:#FBF9F5;letter-spacing:0;font-size:13px;font-weight:600;">' + coveragePct + '%</span>',
    '          </div>',
    '          <div style="height:6px;border-radius:6px;background:rgba(245,241,234,0.10);margin-top:8px;overflow:hidden;">',
    '            <div style="height:6px;width:' + coveragePct + '%;background:' + accent + ';border-radius:6px;"></div>',
    '          </div>',
    '          <div style="margin-top:10px;font-size:12px;color:rgba(245,241,234,0.75);">' + escapeHtml_(c.label || '') + ' — ' + escapeHtml_(c.message || '') + '</div>',
    '        </div>',
    '      </td></tr>',

    // Stats row
    '      <tr><td style="padding-top:12px;">',
    '        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">',
    '          <tr>',
    statCellHtml_('Current Warm Reach', formatNumber_(reach), 'people'),
    statCellHtml_('Projected Revenue', formatCurrency_(projectedRevenue), 'at ' + convPct + '%'),
    statCellHtml_('Daily Target', (days > 0 && !gapZero) ? formatNumber_(daily) : '—', (days > 0 && !gapZero) ? 'signups/day' : 'you\'re covered'),
    '          </tr>',
    '        </table>',
    '      </td></tr>',

    // Insight
    '      <tr><td style="background:#FFFFFF;border:1px solid #E8E5E0;border-radius:24px;padding:28px;margin-top:12px;">',
    '        <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C2562A;font-weight:600;">Insight</div>',
    '        <div style="font-family:Georgia,serif;font-size:24px;line-height:1.3;color:#0E0D0B;margin-top:8px;letter-spacing:-0.02em;">Followers don\'t forecast demand. <em style="color:#7A3318;">Warm buyers do.</em></div>',
    '        <div style="font-size:14px;line-height:1.6;color:#6B6864;margin-top:10px;">A large audience helps, but the real question is how many people you can directly reach before launch day.</div>',
    '      </td></tr>',

    // CTAs
    '      <tr><td style="padding-top:20px;text-align:center;">',
    toolUrl
      ? '        <a href="' + escapeAttr_(toolUrl) + '" style="display:inline-block;background:#0E0D0B;color:#FBF9F5;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:999px;">Recalculate my gap</a>'
      : '',
    DROP_LEAK_CHECK_URL
      ? '        &nbsp; <a href="' + escapeAttr_(DROP_LEAK_CHECK_URL) + '" style="display:inline-block;color:#0E0D0B;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:999px;border:1px solid #E8E5E0;background:#FFFFFF;">Get a Free Drop Leak Check</a>'
      : '',
    '      </td></tr>',

    // Footer
    '      <tr><td style="padding:28px 4px 8px 4px;text-align:center;font-size:11.5px;color:#6B6864;line-height:1.6;">',
    '        Sent because you requested your forecast from the Sold-Out Gap Calculator.<br>',
    '        ' + escapeHtml_(BRAND_NAME) + ' &middot; ' + new Date().getFullYear(),
    '      </td></tr>',

    '    </table>',
    '  </td></tr>',
    '</table>',
    '</body></html>',
  ].join('\n');
}

function statCellHtml_(label, value, suffix) {
  return [
    '<td style="padding:6px;width:33%;vertical-align:top;">',
    '  <div style="background:#FFFFFF;border:1px solid #E8E5E0;border-radius:18px;padding:16px;">',
    '    <div style="font-size:10.5px;letter-spacing:0.18em;text-transform:uppercase;color:#6B6864;font-weight:600;">' + escapeHtml_(label) + '</div>',
    '    <div style="font-family:Georgia,serif;font-size:22px;color:#0E0D0B;margin-top:6px;line-height:1;">' + escapeHtml_(value) + '</div>',
    '    <div style="font-size:11.5px;color:#6B6864;margin-top:4px;">' + escapeHtml_(suffix || '') + '</div>',
    '  </div>',
    '</td>',
  ].join('\n');
}

function renderEmailText_(d) {
  const i = d.inputs || {};
  const r = d.results || {};
  const c = d.confidence || {};
  const lines = [
    'My Sold-Out Gap Forecast:',
    '',
    'Revenue Goal: ' + formatCurrency_(safeNum_(i.revenueGoal)),
    'Required Warm Buyers: ' + formatNumber_(safeNum_(r.requiredWarmBuyers)),
    'Current Warm Reach: ' + formatNumber_(safeNum_(r.totalWarmReach)),
    'Sold-Out Gap: ' + formatNumber_(safeNum_(r.soldOutGap)),
    safeNum_(i.daysUntilLaunch) > 0
      ? 'Daily Signup Target: ' + formatNumber_(safeNum_(r.dailySignupTarget)) + '/day'
      : 'Daily Signup Target: —',
    'Confidence: ' + (c.label || ''),
    '',
    'Insight: Followers don\'t forecast demand. Warm buyers do.',
  ];
  return lines.join('\n');
}

// ---------- Report URL ------------------------------------------------------

/**
 * Build a link to the calculator with the user's figures encoded as query
 * params, so the page opens pre-filled instead of blank.
 *
 * The short param keys mirror the frontend's reader (src/lib/urlParams.ts):
 *   goal, aov, email, sms, ig, vip, other, followers, days, conv, custom
 *
 * Falls back to whatever the frontend sent (d.reportUrl), then the bare
 * TOOL_URL / source URL if there are no inputs to encode.
 */
function buildReportUrl_(d) {
  const i = d.inputs || {};

  let base = TOOL_URL || d.sourceUrl || d.reportUrl || '';
  if (!base) return '';
  // Drop any existing query/hash so we start from a clean base.
  base = base.split('#')[0].split('?')[0];

  const parts = [];
  const addNum = function (key, value) {
    const n = Number(value);
    if (isFinite(n) && n > 0) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(n));
    }
  };

  addNum('goal', i.revenueGoal);
  addNum('aov', i.averageOrderValue);
  addNum('email', i.emailList);
  addNum('sms', i.smsList);
  addNum('ig', i.igBroadcast);
  addNum('vip', i.waitlistVip);
  addNum('other', i.otherDirect);
  addNum('followers', i.followerCount);
  addNum('days', i.daysUntilLaunch);

  if (i.conversionOption) {
    parts.push('conv=' + encodeURIComponent(i.conversionOption));
    // For a custom rate, the resolved percentage is the custom value.
    if (i.conversionOption === 'custom') {
      addNum('custom', i.conversionRate);
    }
  }

  const qs = parts.join('&');
  if (!qs) {
    // No inputs to encode — use whatever the frontend gave us, else the base.
    return d.reportUrl || base;
  }
  return base + '?' + qs;
}

// ---------- SMS via Twilio ------------------------------------------------

/**
 * Send a one-time SMS with the user's report link via Twilio.
 *
 * Requires three Script Properties (set once via Apps Script editor →
 * Project Settings → Script Properties):
 *   TWILIO_ACCOUNT_SID  — your Twilio Account SID
 *   TWILIO_AUTH_TOKEN   — your Twilio Auth Token
 *   TWILIO_FROM_NUMBER  — your toll-free number (E.164, e.g. +18667744589)
 */
function sendReportSms_(toPhone, reportUrl) {
  var props = PropertiesService.getScriptProperties();
  var sid   = props.getProperty('TWILIO_ACCOUNT_SID');
  var token = props.getProperty('TWILIO_AUTH_TOKEN');
  var from  = props.getProperty('TWILIO_FROM_NUMBER');

  if (!sid || !token || !from) {
    Logger.log('SMS skipped — Twilio credentials not configured in Script Properties.');
    return;
  }

  var to = String(toPhone).trim();
  if (to.charAt(0) !== '+') {
    to = '+1' + to.replace(/\D/g, '');
  }

  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + token),
    },
    payload: {
      To: to,
      From: from,
      Body: "Here\u2019s your Sold-Out Gap report \u2014 tap to pick up where you left off:\n" + reportUrl,
    },
    muteHttpExceptions: true,
  });

  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Twilio returned ' + code + ': ' + response.getContentText());
  }
}

// ---------- Helpers --------------------------------------------------------

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeNum_(n) {
  const x = Number(n);
  return isFinite(x) ? x : 0;
}

function round_(n, digits) {
  const f = Math.pow(10, digits || 0);
  return Math.round(n * f) / f;
}

function formatNumber_(n) {
  return Math.round(safeNum_(n)).toLocaleString('en-US');
}

function formatCurrency_(n) {
  return '$' + formatNumber_(n);
}

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr_(s) {
  return escapeHtml_(s);
}

// ---------- One-off test from the Apps Script editor -----------------------

/**
 * Run this once from the Apps Script editor (Run > runSelfTest)
 * to verify the sheet gets created and an email lands in your inbox.
 * Replace the email below with your own first.
 */
function runSelfTest() {
  const testEmail = Session.getActiveUser().getEmail() || 'replace-me@example.com';
  doPost({
    postData: {
      contents: JSON.stringify({
        email: testEmail,
        phone: '',
        submittedAt: new Date().toISOString(),
        sourceUrl: 'https://example.com/test',
        reportUrl: 'https://sold-out-calc.vercel.app/?goal=10000&aov=120&email=500&sms=150&ig=300&vip=100&followers=50000&days=14',
        inputs: {
          revenueGoal: 10000,
          averageOrderValue: 120,
          emailList: 500,
          smsList: 150,
          igBroadcast: 300,
          waitlistVip: 100,
          otherDirect: 0,
          followerCount: 50000,
          daysUntilLaunch: 14,
          conversionOption: 'realistic',
          conversionRate: 5,
        },
        results: {
          totalWarmReach: 1050,
          requiredOrders: 84,
          requiredWarmBuyers: 1680,
          soldOutGap: 630,
          projectedOrders: 52,
          projectedRevenue: 6240,
          dailySignupTarget: 45,
          coverageRatio: 0.625,
          warmAudienceRatio: 0.021,
        },
        confidence: {
          level: 'at-risk',
          label: 'At Risk',
          message: 'You may be walking into launch day without enough warm demand.',
        },
      }),
    },
  });
}
