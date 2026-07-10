/**
 * Sold-Out Snapshot Generator V0 — editable labels & options.
 *
 * EVERYTHING the team routes on lives here so it's trivial to rename, add, or
 * reorder as we learn. Nothing about the diagnosis is hardcoded as certain, and
 * there is NO assumption that pre-launch demand is always the bottleneck.
 */

/** Simple 3-point scale for the internal category scorecard. */
export const SCORE_LEVELS = ["", "Weak", "Moderate", "Strong"] as const;
export type ScoreLevel = (typeof SCORE_LEVELS)[number];

/**
 * Internal scoring categories (Deliverable 1). Each is scored Weak / Moderate /
 * Strong. The `key` is stable; the `label` is what shows in the UI + sheet.
 */
export const SCORE_CATEGORIES: { key: string; label: string }[] = [
  { key: "revenue_stage", label: "Revenue Stage" },
  { key: "paid_fit", label: "Paid Fit Score" },
  { key: "revenue_gap", label: "Revenue Gap" },
  { key: "drop_economics", label: "Drop Economics" },
  { key: "offer_strength", label: "Offer Strength" },
  { key: "attention_clarity", label: "Attention Clarity" },
  { key: "demand_structure", label: "Demand Structure" },
  { key: "launch_execution", label: "Launch Execution" },
  { key: "retention_aftermath", label: "Retention / Aftermath" },
  { key: "operating_maturity", label: "Operating Maturity" },
];

/** Estimated revenue stages (mirrors the diagnostic scoring in DiagnosticCode.gs). */
export const STAGE_OPTIONS = [
  "Beta / Prove It",
  "Growth / Scale + Stabilize",
  "Adaptation / Diversify",
] as const;

/**
 * Growth levers / bottlenecks. NOT ranked — demand is one option among several.
 * Each maps to a candidate Sold-Out Engine (labels only; engines aren't built).
 */
export const BOTTLENECK_OPTIONS = [
  "Offer",
  "Attention",
  "Demand",
  "Launch",
  "Retention / Aftermath",
  "Operating Rhythm",
] as const;

/** Recommended Sold-Out Engine — routing labels only (engines not built yet). */
export const ENGINE_OPTIONS = [
  "Sold-Out Offer Engine",
  "Sold-Out Attention Engine",
  "Sold-Out Demand Engine",
  "Sold-Out Launch Engine",
  "Sold-Out Aftermath Engine",
  "Sold-Out Operating Rhythm",
] as const;

/** Fit status buckets for internal triage. */
export const FIT_STATUS_OPTIONS = [
  "Too Early",
  "V0 Fit",
  "Advanced / Future Module",
  "Not Fit",
  "Needs Manual Review",
] as const;

/** Follow-up tracking states (internal only). */
export const FOLLOW_UP_OPTIONS = [
  "New",
  "Reviewing",
  "Snapshot Sent",
  "Call Booked",
  "Closed",
] as const;

/**
 * Suggested lever -> engine pairing. Used only to pre-fill the recommended
 * engine when the team picks a primary bottleneck; always overridable.
 */
export const LEVER_TO_ENGINE: Record<string, string> = {
  Offer: "Sold-Out Offer Engine",
  Attention: "Sold-Out Attention Engine",
  Demand: "Sold-Out Demand Engine",
  Launch: "Sold-Out Launch Engine",
  "Retention / Aftermath": "Sold-Out Aftermath Engine",
  "Operating Rhythm": "Sold-Out Operating Rhythm",
};

/** Revenue range labels — offered as datalist suggestions, but free-text. */
export const REVENUE_RANGE_SUGGESTIONS = [
  "Under $10K",
  "$10K – $25K",
  "$25K – $50K",
  "$50K – $100K",
  "$100K+",
];

/**
 * Default founder-facing CTA presets. All easy to edit inline.
 * `url` is where the button points — a mailto: draft or an https booking link.
 * Leave it blank to render the CTA as a non-clickable label.
 */
export const CTA_PRESETS = {
  book: {
    label: "Book a Sold-Out Review Call",
    note: "A short call to confirm the diagnosis and map your install path.",
    url: "mailto:toulzoned@gmail.com?subject=Sold-Out%20Review%20Call",
  },
  review: {
    label: "We'll review this and send your recommended next step",
    note: "No action needed — we'll follow up with your recommended next move.",
    url: "",
  },
} as const;
