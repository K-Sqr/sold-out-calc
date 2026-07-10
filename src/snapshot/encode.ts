import { emptySnapshot, type SnapshotData } from "./types";

/**
 * The snapshot is shared as a URL: all founder-facing data is packed into a
 * single `?s=` param (base64 of compact JSON). No backend / database needed —
 * the link IS the snapshot. Internal-only fields are never encoded.
 */

// Compact keys keep the shareable URL short.
const FOUNDER_KEYS: Record<string, keyof SnapshotData> = {
  b: "brandName",
  st: "stage",
  cr: "currentRevenue",
  tr: "targetRevenue",
  g: "revenueGap",
  pb: "primaryBottleneck",
  sb: "secondaryBottleneck",
  sl: "strongestLever",
  e: "recommendedEngine",
  ns: "nextStep",
  cl: "ctaLabel",
  cn: "ctaNote",
  cu: "ctaUrl",
};

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

/** URL-safe base64 (strip padding, swap +/ characters). */
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return b64 + pad;
}

/** Encode the founder-facing subset into a compact URL-safe token. */
export function encodeSnapshot(data: SnapshotData): string {
  const compact: Record<string, string> = {};
  for (const [shortKey, field] of Object.entries(FOUNDER_KEYS)) {
    const value = (data[field] ?? "").toString().trim();
    if (value) compact[shortKey] = value;
  }
  return toUrlSafe(utf8ToBase64(JSON.stringify(compact)));
}

/** Decode a token back into a (partial) snapshot, merged over defaults. */
export function decodeSnapshot(token: string): SnapshotData | null {
  try {
    const json = base64ToUtf8(fromUrlSafe(token));
    const compact = JSON.parse(json) as Record<string, string>;
    const data = emptySnapshot();
    for (const [shortKey, field] of Object.entries(FOUNDER_KEYS)) {
      if (compact[shortKey] !== undefined) {
        (data[field] as string) = compact[shortKey];
      }
    }
    return data;
  } catch {
    return null;
  }
}

/** Build the full shareable founder URL for the current snapshot. */
export function buildShareUrl(data: SnapshotData): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/snapshot?s=${encodeSnapshot(data)}`;
}
