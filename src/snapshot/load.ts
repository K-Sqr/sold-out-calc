/**
 * Sheet round-trip for the snapshot builder.
 *
 *  - LOAD: pull recent diagnostic submissions from the Google Sheet so the
 *    team can pre-fill the builder instead of retyping (best-effort — without
 *    the endpoint the builder is fully manual).
 *  - SAVE: write the team's review (stage, fit, scorecard, notes, snapshot
 *    link…) back onto that submission's row, so scoring is persistent and
 *    comes back the next time the row is loaded.
 *
 * Reuses VITE_DIAGNOSTIC_ENDPOINT_URL (the same Apps Script that stores the
 * submissions). GET ?mode=list returns rows; POST {mode:"review"} saves one.
 */

import { SCORE_CATEGORIES, SCORE_LEVELS, type ScoreLevel } from "./constants";
import { emptySnapshot, type SnapshotData } from "./types";

export interface SubmissionRow {
  rowIndex: number;
  timestamp: string;
  /** header label -> cell value */
  values: Record<string, string>;
}

export function submissionsEndpoint(): string | undefined {
  return import.meta.env.VITE_DIAGNOSTIC_ENDPOINT_URL as string | undefined;
}

/** Where the team's shared access key is remembered (this browser only). */
export const LIST_KEY_STORAGE = "snapshot_list_key";

export function getStoredKey(): string {
  try {
    return localStorage.getItem(LIST_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setStoredKey(key: string): void {
  try {
    if (key) localStorage.setItem(LIST_KEY_STORAGE, key);
    else localStorage.removeItem(LIST_KEY_STORAGE);
  } catch {
    /* ignore storage failures */
  }
}

export async function fetchSubmissions(key: string): Promise<SubmissionRow[]> {
  const endpoint = submissionsEndpoint();
  if (!endpoint) return [];

  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${endpoint}${sep}mode=list&key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { method: "GET", redirect: "follow" });
  if (!res.ok) throw new Error(`Could not load submissions (${res.status})`);

  const data = (await res.json()) as {
    ok?: boolean;
    rows?: SubmissionRow[];
    error?: string;
  };
  if (data.ok === false) {
    throw new Error(data.error || "Could not load submissions");
  }
  return Array.isArray(data.rows) ? data.rows : [];
}

// ---------------- Save review ----------------

/** Sheet headers the builder owns. Must match INTERNAL_COLUMNS in DiagnosticCode.gs. */
export const SHEET = {
  stage: "Estimated Stage",
  paidFitScore: "Paid Fit Score",
  revenueGap: "Revenue Gap",
  primaryLever: "Primary Growth Lever",
  secondaryBottleneck: "Secondary Bottleneck",
  engine: "Recommended Sold-Out Engine",
  fitStatus: "Fit Status",
  notes: "Notes",
  nextStep: "Next Step",
  followUp: "Follow-Up Status",
  strongestLever: "Strongest Lever",
  scorecard: "Scorecard",
  mode: "Snapshot Mode",
  link: "Snapshot Link",
  reviewedAt: "Reviewed At",
} as const;

/** "Revenue Stage: Weak; Offer Strength: Strong" — only scored categories. */
export function scorecardToString(scores: Record<string, ScoreLevel>): string {
  return SCORE_CATEGORIES.filter((c) => scores[c.key])
    .map((c) => `${c.label}: ${scores[c.key]}`)
    .join("; ");
}

export function parseScorecard(raw: string): Record<string, ScoreLevel> {
  const scores: Record<string, ScoreLevel> = {};
  if (!raw) return scores;
  for (const part of raw.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const label = part.slice(0, idx).trim().toLowerCase();
    const level = part.slice(idx + 1).trim();
    const cat = SCORE_CATEGORIES.find((c) => c.label.toLowerCase() === label);
    if (cat && (SCORE_LEVELS as readonly string[]).includes(level)) {
      scores[cat.key] = level as ScoreLevel;
    }
  }
  return scores;
}

/**
 * The header -> value map the builder writes back to the sheet. Shared by
 * "Save review" (POST) and "Copy sheet row" (clipboard) so both agree.
 */
export function toSheetValues(
  d: SnapshotData,
  shareUrl: string
): Record<string, string> {
  return {
    [SHEET.stage]: d.stage,
    [SHEET.paidFitScore]: d.paidFitScore,
    [SHEET.revenueGap]: d.revenueGap,
    [SHEET.primaryLever]: d.primaryBottleneck,
    [SHEET.secondaryBottleneck]: d.secondaryBottleneck,
    [SHEET.engine]: d.recommendedEngine,
    [SHEET.fitStatus]: d.fitStatus,
    [SHEET.notes]: d.internalNotes,
    [SHEET.nextStep]: d.nextStep,
    [SHEET.followUp]: d.followUpStatus,
    [SHEET.strongestLever]: d.strongestLever,
    [SHEET.scorecard]: scorecardToString(d.scores),
    [SHEET.mode]: d.mode,
    [SHEET.link]: shareUrl,
  };
}

export async function saveReview(
  key: string,
  rowIndex: number,
  values: Record<string, string>
): Promise<void> {
  const endpoint = submissionsEndpoint();
  if (!endpoint) throw new Error("No endpoint configured.");

  // text/plain avoids a CORS preflight against Apps Script (same as submit.ts).
  const res = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ mode: "review", key, rowIndex, values }),
  });
  if (!res.ok) throw new Error(`Could not save review (${res.status})`);

  let data: { ok?: boolean; error?: string } | null = null;
  try {
    data = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    /* non-JSON 200 — treat as success */
  }
  if (data && data.ok === false) {
    throw new Error(data.error || "Could not save review");
  }
}

// ---------------- Row -> builder ----------------

/** Case-insensitive header lookup. */
function pick(values: Record<string, string>, ...labels: string[]): string {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) lower[k.toLowerCase()] = v;
  for (const label of labels) {
    const hit = lower[label.toLowerCase()];
    if (hit) return hit;
  }
  return "";
}

const LEVER_ALIASES: Record<string, string> = {
  offer: "Offer",
  attention: "Attention",
  demand: "Demand",
  launch: "Launch",
  aftermath: "Retention / Aftermath",
  retention: "Retention / Aftermath",
  "retention / aftermath": "Retention / Aftermath",
  "operating rhythm": "Operating Rhythm",
  operations: "Operating Rhythm",
};

/**
 * Map a lever cell onto the builder's vocabulary. Accepts a bare lever
 * ("Launch") or the auto-scored "Lever — description" form the Apps Script
 * writes for the secondary bottleneck.
 */
function normalizeLever(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const head = v.split(/\s+[—–-]\s+/)[0].trim().toLowerCase();
  return LEVER_ALIASES[head] || LEVER_ALIASES[v.toLowerCase()] || v;
}

/**
 * The Apps Script writes its own fit wording; the builder dropdown uses the
 * team's. Translate on load so a row never shows an out-of-list value.
 */
const FIT_ALIASES: Record<string, string> = {
  "likely fit": "V0 Fit",
  "maybe — needs review": "Needs Manual Review",
  "maybe - needs review": "Needs Manual Review",
  "not yet": "Too Early",
  "review — possible future engine": "Advanced / Future Module",
  "review - possible future engine": "Advanced / Future Module",
};

function normalizeFit(raw: string): string {
  return FIT_ALIASES[raw.trim().toLowerCase()] || raw;
}

/**
 * Map a sheet row onto the snapshot builder fields. Reads both the
 * auto-scored columns and anything the team saved back, so a reviewed row
 * comes back exactly as it was left.
 */
export function rowToSnapshot(row: SubmissionRow): SnapshotData {
  const v = row.values;
  const data = emptySnapshot();

  data.brandName = pick(v, "Brand name", "Brand");
  data.currentRevenue = pick(
    v,
    "Last drop revenue range",
    "Best drop revenue range",
    "Approx. monthly revenue range"
  );
  data.targetRevenue = pick(v, "Next drop revenue goal");
  data.stage = pick(v, SHEET.stage);
  data.paidFitScore = pick(v, SHEET.paidFitScore);
  data.revenueGap = pick(v, SHEET.revenueGap);
  data.primaryBottleneck = normalizeLever(
    pick(v, SHEET.primaryLever, "Primary Bottleneck")
  );
  data.secondaryBottleneck = normalizeLever(pick(v, SHEET.secondaryBottleneck));
  data.strongestLever = normalizeLever(pick(v, SHEET.strongestLever));
  data.recommendedEngine = pick(v, SHEET.engine);
  data.fitStatus = normalizeFit(pick(v, SHEET.fitStatus));
  data.internalNotes = pick(v, SHEET.notes);
  data.nextStep = pick(v, SHEET.nextStep) || data.nextStep;
  data.followUpStatus = pick(v, SHEET.followUp) || "New";
  data.scores = parseScorecard(pick(v, SHEET.scorecard));

  const mode = pick(v, SHEET.mode);
  if (mode === "roadmap" || mode === "engine") data.mode = mode;

  return data;
}

/** Has the team saved a review on this row yet? */
export function isReviewed(row: SubmissionRow): boolean {
  return !!pick(row.values, SHEET.reviewedAt);
}
