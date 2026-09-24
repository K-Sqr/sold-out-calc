/**
 * A faithful mirror of the scoring that runs in the Apps Script.
 *
 * ⚠️  SOURCE OF TRUTH IS STILL `scripts/google-apps-script/DiagnosticCode.gs`.
 * That script is what actually writes to the sheet. This file exists so the
 * Scoring Guide (`/snapshot?guide=1`) can *show its working* with a live
 * calculator instead of asking people to read Apps Script.
 *
 * If you change a weight, threshold, midpoint, or routing label in the .gs,
 * change it here too — the guide's tables are generated from these constants,
 * so they stay honest automatically once this file matches.
 *
 * Mirrors, in order: monthlyBand_, estimateStage_, paidFitScore_,
 * revenueGap_ / dropRangeMidpoint_, routeBottleneck_, fitStatus_.
 */

// ---------- Inputs ---------------------------------------------------------

export interface ScoringInput {
  /** `monthly_revenue` — the picked range. */
  monthlyRevenue: string;
  /** `monthly_revenue_avg` — the optional exact figure; wins when > 0. */
  monthlyRevenueAvg: string;
  numDrops: string;
  emailListSize: string;
  smsListSize: string;
  communitySize: string;
  grossMargin: string;
  dropsProfitable: string;
  runsPaidAds: string;
  nextDropGoal: string;
  lastDropRevenue: string;
  /** `bottleneck` — multi-select, "first|second|…" in pick order. */
  bottleneck: string;
}

export function emptyScoringInput(): ScoringInput {
  return {
    monthlyRevenue: "",
    monthlyRevenueAvg: "",
    numDrops: "",
    emailListSize: "",
    smsListSize: "",
    communitySize: "",
    grossMargin: "",
    dropsProfitable: "",
    runsPaidAds: "",
    nextDropGoal: "",
    lastDropRevenue: "",
    bottleneck: "",
  };
}

// ---------- Constants (these drive both the math and the guide's tables) ----

export const STAGES = {
  beta: "Beta / Prove It",
  growth: "Growth / Scale + Stabilize",
  adaptation: "Adaptation / Diversify",
} as const;

/** Monthly revenue bands: the label, the stage they imply, the points they earn. */
export const MONTHLY_BANDS: {
  value: string;
  label: string;
  stage: string;
  points: number;
  /** Upper bound used when deriving a band from an exact figure (null = no cap). */
  under: number | null;
}[] = [
  { value: "under_10k_mo", label: "Under $10K / month", stage: STAGES.beta, points: 5, under: 10000 },
  { value: "10k_30k_mo", label: "$10K – $30K / month", stage: STAGES.beta, points: 20, under: 30000 },
  { value: "30k_100k_mo", label: "$30K – $100K / month", stage: STAGES.growth, points: 35, under: 100000 },
  { value: "100k_plus_mo", label: "$100K+ / month", stage: STAGES.adaptation, points: 30, under: null },
];

/** Owned-audience tiers (email + SMS + community added together). */
export const LIST_TIERS: { min: number; points: number; label: string }[] = [
  { min: 10000, points: 15, label: "10,000 or more" },
  { min: 2500, points: 10, label: "2,500 – 9,999" },
  { min: 500, points: 6, label: "500 – 2,499" },
  { min: 0, points: 0, label: "Under 500" },
];

export const MARGIN_POINTS: { values: string[]; label: string; points: number }[] = [
  { values: ["60_75", "75_plus"], label: "60% or higher", points: 10 },
  { values: ["40_60"], label: "40% – 60%", points: 5 },
  { values: ["under_40", "not_sure", ""], label: "Under 40%, or not sure", points: 0 },
];

/** Flat yes/no signals worth a fixed number of points. */
export const FLAT_SIGNALS = {
  launched: { points: 15, label: "Has launched at least one drop" },
  profitable: { points: 5, label: "Drops are profitable after costs" },
  paidAds: { points: 5, label: "Already runs paid ads" },
  hasGoal: { points: 5, label: "Has set a next-drop revenue goal" },
} as const;

/** Midpoint used as the "before" number when sizing the revenue gap. */
export const DROP_MIDPOINTS: { value: string; label: string; midpoint: number }[] = [
  { value: "under_10k", label: "Under $10K", midpoint: 5000 },
  { value: "10k_25k", label: "$10K – $25K", midpoint: 17500 },
  { value: "25k_50k", label: "$25K – $50K", midpoint: 37500 },
  { value: "50k_100k", label: "$50K – $100K", midpoint: 75000 },
  { value: "100k_plus", label: "$100K+", midpoint: 125000 },
];

export const FIT_THRESHOLDS = { likely: 60, maybe: 35 } as const;

export const FIT_STATUSES = {
  futureEngine: "Review — possible future engine",
  likely: "Likely fit",
  maybe: "Maybe — needs review",
  notYet: "Not yet",
} as const;

/** How a founder's self-selected constraint routes to a lever and an engine. */
export interface BottleneckRoute {
  value: string;
  /** What the founder ticked, in their words (from the diagnostic). */
  question: string;
  /** How it's recorded internally. */
  label: string;
  lever: string;
  engine: string;
}

export const BOTTLENECK_ROUTES: BottleneckRoute[] = [
  { value: "offer_unclear", question: "Product / offer is not clear enough", label: "Offer/product not clear enough", lever: "Offer", engine: "Sold-Out Offer Engine" },
  { value: "not_special", question: "People don't understand why the product is special", label: "Can't communicate why it's special", lever: "Attention", engine: "Sold-Out Attention Engine" },
  { value: "not_enough_ready", question: "Not enough people are ready to buy before launch", label: "Not enough warm buyers before launch", lever: "Demand", engine: "Sold-Out Demand Engine" },
  { value: "too_dependent_social", question: "Too dependent on Instagram / TikTok reach", label: "Over-dependent on IG/TikTok reach", lever: "Demand", engine: "Sold-Out Demand Engine" },
  { value: "aov_too_low", question: "AOV is too low", label: "AOV too low", lever: "Offer", engine: "Sold-Out Offer Engine" },
  { value: "margins_tight", question: "Margins are too tight", label: "Margins too tight", lever: "Offer", engine: "Sold-Out Offer Engine" },
  { value: "launch_chaotic", question: "Launch day is chaotic", label: "Chaotic launch execution", lever: "Launch", engine: "Sold-Out Launch Engine" },
  { value: "inconsistent_drops", question: "Drops are inconsistent", label: "Inconsistent drops", lever: "Operating Rhythm", engine: "Sold-Out Operating Rhythm" },
  { value: "low_repeat", question: "We get buyers but not enough repeat customers", label: "Weak repeat / retention", lever: "Aftermath", engine: "Sold-Out Aftermath Engine" },
  { value: "ads_not_profitable", question: "Paid ads are not profitable", label: "Paid ads not profitable", lever: "Offer", engine: "Sold-Out Offer Engine" },
  { value: "not_sure", question: "Not sure", label: "Unsure (needs review)", lever: "Needs review", engine: "Needs manual review" },
];

/** Highest score any submission can reach today (no path gets to 100). */
export const MAX_SCORE =
  FLAT_SIGNALS.launched.points +
  Math.max(...MONTHLY_BANDS.map((b) => b.points)) +
  LIST_TIERS[0].points +
  MARGIN_POINTS[0].points +
  FLAT_SIGNALS.profitable.points +
  FLAT_SIGNALS.paidAds.points +
  FLAT_SIGNALS.hasGoal.points;

// ---------- The math -------------------------------------------------------

/** Mirrors `num_` in the Apps Script: strip everything that isn't a number. */
export function num(value: string): number {
  const x = Number(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return isFinite(x) ? x : 0;
}

/** Mirrors `monthlyBand_`: an exact figure beats the picked range. */
export function monthlyBand(input: ScoringInput): {
  band: string;
  fromExact: boolean;
} {
  const avg = num(input.monthlyRevenueAvg);
  if (avg > 0) {
    const hit = MONTHLY_BANDS.find((b) => b.under === null || avg < b.under);
    return { band: hit ? hit.value : "", fromExact: true };
  }
  return { band: input.monthlyRevenue || "", fromExact: false };
}

/** One line of the score, so the guide can show where every point came from. */
export interface ScoreLine {
  label: string;
  detail: string;
  points: number;
  max: number;
}

export interface ScoringResult {
  band: string;
  bandLabel: string;
  bandFromExact: boolean;
  stage: string;
  score: number;
  lines: ScoreLine[];
  fitStatus: string;
  /** Blank when there's no goal to measure against. */
  revenueGap: string;
  revenueGapNote: string;
  lever: string;
  bottleneck: string;
  secondaryBottleneck: string;
  engine: string;
}

export function scoreDiagnostic(input: ScoringInput): ScoringResult {
  const { band, fromExact } = monthlyBand(input);
  const bandDef = MONTHLY_BANDS.find((b) => b.value === band);

  // --- Stage (mirrors estimateStage_) ---
  const stage =
    band === "100k_plus_mo"
      ? STAGES.adaptation
      : band === "30k_100k_mo"
        ? STAGES.growth
        : STAGES.beta;

  // --- Score (mirrors paidFitScore_) ---
  const launched = num(input.numDrops) > 0;
  const listTotal =
    num(input.emailListSize) + num(input.smsListSize) + num(input.communitySize);
  const listTier = LIST_TIERS.find((t) => listTotal >= t.min) ?? LIST_TIERS[LIST_TIERS.length - 1];
  const marginTier =
    MARGIN_POINTS.find((m) => m.values.includes(input.grossMargin)) ??
    MARGIN_POINTS[MARGIN_POINTS.length - 1];
  const profitable = (input.dropsProfitable || "").toLowerCase() === "yes";
  const runsAds = (input.runsPaidAds || "").toLowerCase() === "yes";
  const goal = num(input.nextDropGoal);

  const lines: ScoreLine[] = [
    {
      label: FLAT_SIGNALS.launched.label,
      detail: launched ? `${num(input.numDrops)} drop(s) launched` : "No drops launched yet",
      points: launched ? FLAT_SIGNALS.launched.points : 0,
      max: FLAT_SIGNALS.launched.points,
    },
    {
      label: "Monthly revenue band",
      detail: bandDef ? bandDef.label + (fromExact ? " (from the exact figure)" : "") : "Not answered",
      points: bandDef ? bandDef.points : 0,
      max: Math.max(...MONTHLY_BANDS.map((b) => b.points)),
    },
    {
      label: "Owned audience",
      detail: `${listTotal.toLocaleString("en-US")} across email, SMS and community — ${listTier.label}`,
      points: listTier.points,
      max: LIST_TIERS[0].points,
    },
    {
      label: "Gross margin",
      detail: marginTier.label,
      points: marginTier.points,
      max: MARGIN_POINTS[0].points,
    },
    {
      label: FLAT_SIGNALS.profitable.label,
      detail: profitable ? "Yes" : input.dropsProfitable ? "No / not sure" : "Not answered",
      points: profitable ? FLAT_SIGNALS.profitable.points : 0,
      max: FLAT_SIGNALS.profitable.points,
    },
    {
      label: FLAT_SIGNALS.paidAds.label,
      detail: runsAds ? "Yes" : input.runsPaidAds ? "No" : "Not answered",
      points: runsAds ? FLAT_SIGNALS.paidAds.points : 0,
      max: FLAT_SIGNALS.paidAds.points,
    },
    {
      label: FLAT_SIGNALS.hasGoal.label,
      detail: goal > 0 ? `$${goal.toLocaleString("en-US")}` : "Not set",
      points: goal > 0 ? FLAT_SIGNALS.hasGoal.points : 0,
      max: FLAT_SIGNALS.hasGoal.points,
    },
  ];

  const score = Math.max(
    0,
    Math.min(100, Math.round(lines.reduce((sum, l) => sum + l.points, 0)))
  );

  // --- Fit status (mirrors fitStatus_) ---
  const fitStatus =
    band === "100k_plus_mo"
      ? FIT_STATUSES.futureEngine
      : score >= FIT_THRESHOLDS.likely
        ? FIT_STATUSES.likely
        : score >= FIT_THRESHOLDS.maybe
          ? FIT_STATUSES.maybe
          : FIT_STATUSES.notYet;

  // --- Revenue gap (mirrors revenueGap_) ---
  let revenueGap = "";
  let revenueGapNote = "Needs a next-drop revenue goal before we can size it.";
  if (goal > 0) {
    const mid = DROP_MIDPOINTS.find((d) => d.value === input.lastDropRevenue);
    if (mid) {
      const diff = goal - mid.midpoint;
      revenueGap = `${diff >= 0 ? "+" : "−"}$${Math.abs(diff).toLocaleString("en-US")}`;
      revenueGapNote = `$${goal.toLocaleString("en-US")} goal − $${mid.midpoint.toLocaleString(
        "en-US"
      )} midpoint of "${mid.label}".`;
    } else {
      revenueGap = `$${goal.toLocaleString("en-US")}`;
      revenueGapNote = "No last-drop range given, so the goal itself is the target.";
    }
  }

  // --- Routing (mirrors routeBottleneck_) ---
  const picks = String(input.bottleneck || "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  const primaryHit = BOTTLENECK_ROUTES.find((r) => r.value === picks[0]);
  const secondaryHit = BOTTLENECK_ROUTES.find((r) => r.value === picks[1]);

  return {
    band,
    bandLabel: bandDef ? bandDef.label : "Not answered",
    bandFromExact: fromExact,
    stage,
    score,
    lines,
    fitStatus,
    revenueGap,
    revenueGapNote,
    lever: primaryHit ? primaryHit.lever : "Needs review",
    // An unrecognised value passes through as-is, exactly as the Apps Script
    // does — so a renamed option shows up loudly instead of silently reading
    // as "unsure".
    bottleneck: primaryHit ? primaryHit.label : picks[0] || "Unsure (needs review)",
    secondaryBottleneck: secondaryHit
      ? `${secondaryHit.lever} — ${secondaryHit.label}`
      : picks[1] || "",
    engine: primaryHit ? primaryHit.engine : "Needs manual review",
  };
}

// ---------- Worked examples for the guide ----------------------------------

export interface GuidePreset {
  name: string;
  blurb: string;
  input: ScoringInput;
}

export const GUIDE_PRESETS: GuidePreset[] = [
  {
    name: "Early brand",
    blurb: "Two drops in, small list, margins unclear. Lands well below the bar.",
    input: {
      ...emptyScoringInput(),
      monthlyRevenue: "under_10k_mo",
      numDrops: "2",
      emailListSize: "300",
      smsListSize: "0",
      communitySize: "120",
      grossMargin: "not_sure",
      dropsProfitable: "not_sure",
      runsPaidAds: "No",
      nextDropGoal: "8000",
      lastDropRevenue: "under_10k",
      bottleneck: "not_enough_ready",
    },
  },
  {
    name: "Proven drops",
    blurb: "The typical 'likely fit': real revenue, a warm list, healthy margins.",
    input: {
      ...emptyScoringInput(),
      monthlyRevenue: "30k_100k_mo",
      numDrops: "8",
      emailListSize: "6000",
      smsListSize: "1200",
      communitySize: "900",
      grossMargin: "60_75",
      dropsProfitable: "yes",
      runsPaidAds: "Yes",
      nextDropGoal: "75000",
      lastDropRevenue: "25k_50k",
      bottleneck: "aov_too_low|launch_chaotic",
    },
  },
  {
    name: "Borderline",
    blurb: "Sits either side of the 60 line — the case worth arguing about.",
    input: {
      ...emptyScoringInput(),
      monthlyRevenue: "10k_30k_mo",
      numDrops: "5",
      emailListSize: "2200",
      smsListSize: "400",
      communitySize: "150",
      grossMargin: "60_75",
      dropsProfitable: "yes",
      runsPaidAds: "No",
      nextDropGoal: "30000",
      lastDropRevenue: "10k_25k",
      bottleneck: "too_dependent_social",
    },
  },
  {
    name: "Too big for V0",
    blurb: "Above $100K/month — flagged for review whatever the score says.",
    input: {
      ...emptyScoringInput(),
      monthlyRevenue: "100k_plus_mo",
      numDrops: "20",
      emailListSize: "40000",
      smsListSize: "9000",
      communitySize: "3000",
      grossMargin: "75_plus",
      dropsProfitable: "yes",
      runsPaidAds: "Yes",
      nextDropGoal: "250000",
      lastDropRevenue: "100k_plus",
      bottleneck: "low_repeat",
    },
  },
];
