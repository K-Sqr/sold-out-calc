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
 * Two founder-facing snapshot types:
 *  - "engine":  the default — likely bottleneck + recommended Sold-Out Engine.
 *  - "roadmap": for founders who aren't a fit yet — their current stage and a
 *               concise roadmap to the next stage, so everyone gets something.
 */
export const SNAPSHOT_MODES = ["engine", "roadmap"] as const;
export type SnapshotMode = (typeof SNAPSHOT_MODES)[number];

export interface StageRoadmap {
  /** What this stage means, in one or two hedged sentences. */
  summary: string;
  /** What we typically see at this stage (bullets). */
  signals: string[];
  /** The stage this roadmap points toward. */
  nextStage: string;
  /** What "arriving" at the next stage usually looks like. */
  nextStageLooksLike: string;
  /** Concise, ordered steps to get there. */
  roadmap: string[];
  /** Closing encouragement — the "good luck" line. */
  encouragement: string;
}

/**
 * Stage roadmaps for the "good luck" snapshot. Written in the same hedged
 * tone as the founder view ("usually", "tends to"). Edit freely — this is
 * copy, not logic.
 */
export const STAGE_ROADMAPS: Record<string, StageRoadmap> = {
  "Beta / Prove It": {
    summary:
      "You're in the proving stage: the brand has product and some attention, and the job now is to show that a drop can sell out on purpose — not by luck.",
    signals: [
      "Monthly revenue under ~$30K, or only a handful of drops so far",
      "Sales still depend heavily on a post landing on the day",
      "The owned audience (email / SMS / waitlist) is small or not yet activated",
      "Numbers after each drop are looked at loosely, if at all",
    ],
    nextStage: "Growth / Scale + Stabilize",
    nextStageLooksLike:
      "Drops that sell through predictably, a warm list you can reach directly, and a repeatable launch process you could hand to someone else.",
    roadmap: [
      "Pick one hero product for the next drop and make the reason to buy it obvious in five seconds.",
      "Open a waitlist / \"get notified\" page and collect email or SMS before the drop — every launch, not just this one.",
      "Set an exact drop time and send reminders (48h / 24h / 3h / live) to the list, not only social.",
      "Write down a simple drop checklist and reuse it, so each launch starts from the last one.",
      "After the drop, record revenue, units, and sell-through. Three drops of clean numbers is what unlocks the next stage.",
    ],
    encouragement:
      "Most brands we talk to are here. The ones that move on aren't the biggest — they're the ones that turn one good drop into a repeatable one. Good luck; we'll be here when you're ready.",
  },
  "Growth / Scale + Stabilize": {
    summary:
      "You've proven drops can sell — now the constraint is usually consistency: making every drop land, not just the good ones, and building the systems to scale them.",
    signals: [
      "Monthly revenue roughly $30K – $100K",
      "Some drops sell out, others stall, and it's not always clear why",
      "Owned channels exist but aren't yet the main driver of launch-day sales",
      "Launch day still leans on the founder being in the room",
    ],
    nextStage: "Adaptation / Diversify",
    nextStageLooksLike:
      "A launch engine that runs on a calendar with a team, strong repeat purchase across drops, and revenue no longer tied to one channel or one person.",
    roadmap: [
      "Standardise the launch: one drop calendar, one sequence (teaser → waitlist → reminders → live → last chance), the same every time.",
      "Make email / SMS the primary launch channel and measure how much of each drop comes from it.",
      "Tighten the economics — AOV, gross margin, and returns — so growth adds profit, not just revenue.",
      "Build the aftermath: capture people who missed it, collect UGC, and use sold-out proof in the next campaign.",
      "Track repeat-customer rate per drop; retention is what makes the next stage possible.",
    ],
    encouragement:
      "This is the stage where systems beat hustle. Keep doing what already works, write it down, and let the process carry more of the load. Good luck — and keep us posted.",
  },
  "Adaptation / Diversify": {
    summary:
      "You're operating at scale. The work now is adapting — protecting what got you here while opening new channels, products, or markets so growth doesn't depend on one lever.",
    signals: [
      "Monthly revenue above ~$100K",
      "Drops are established, with a team or partners running parts of them",
      "Growth from the core channel is slowing or getting more expensive",
      "The brand is exploring wholesale, new categories, or new markets",
    ],
    nextStage: "Sustained, diversified growth",
    nextStageLooksLike:
      "Several revenue lines (drops, evergreen, wholesale, or new markets) that each stand on their own, with the launch playbook documented well enough to survive a team change.",
    roadmap: [
      "Audit which channel each drop's revenue actually comes from and reduce dependence on the biggest one.",
      "Turn the launch playbook into a documented operating rhythm the team can run without the founder.",
      "Add one adjacent revenue line (evergreen hero, wholesale, or a new market) and give it its own numbers.",
      "Invest in retention: VIP tiers, early access, and post-drop follow-up that keeps repeat buyers coming back.",
      "Review numbers on a fixed cadence and prune what isn't working before adding more.",
    ],
    encouragement:
      "Brands at this stage are ahead of the V0 engines we've built so far — which is a good problem. Keep the core strong while you diversify. Good luck, and let's talk when the next module fits.",
  },
};

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
  roadmap: {
    label: "Re-take the diagnostic when you've moved the needle",
    note: "No action needed now. When your next few drops land, run the diagnostic again and we'll take a fresh look.",
    url: "/diagnostic",
  },
} as const;
