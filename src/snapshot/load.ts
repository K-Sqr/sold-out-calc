/**
 * Optional convenience: pull recent diagnostic submissions from the Google
 * Sheet so the team can pre-fill the builder instead of retyping. Best-effort
 * only — if the endpoint isn't configured or the request fails, the builder
 * falls back to fully manual entry.
 *
 * Reuses VITE_DIAGNOSTIC_ENDPOINT_URL (the same Apps Script that stores the
 * submissions). The script's doGet returns rows when called with ?mode=list.
 */

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
  "operating rhythm": "Operating Rhythm",
  operations: "Operating Rhythm",
};

function normalizeLever(raw: string): string {
  return LEVER_ALIASES[raw.trim().toLowerCase()] || raw;
}

/** Map a sheet row onto the snapshot builder fields (best-effort prefill). */
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
  data.stage = pick(v, "Estimated Stage");
  data.paidFitScore = pick(v, "Paid Fit Score");
  data.revenueGap = pick(v, "Revenue Gap");
  data.primaryBottleneck = normalizeLever(
    pick(v, "Primary Growth Lever", "Primary Bottleneck")
  );
  data.recommendedEngine = pick(v, "Recommended Sold-Out Engine");
  data.fitStatus = pick(v, "Fit Status");
  data.internalNotes = pick(v, "Notes");
  data.followUpStatus = pick(v, "Follow-Up Status") || "New";
  data.strongestLever = pick(v, "Strongest Lever");

  return data;
}
