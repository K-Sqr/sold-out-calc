import type { CalculatorInputs, ConversionOption } from "../types";
import { DEFAULT_INPUTS } from "./calculations";

const PARAM_MAP = {
  goal: "revenueGoal",
  aov: "averageOrderValue",
  email: "emailList",
  sms: "smsList",
  ig: "igBroadcast",
  vip: "waitlistVip",
  other: "otherDirect",
  followers: "followerCount",
  days: "daysUntilLaunch",
  conv: "conversionOption",
  custom: "customConversion",
} as const;

type ParamKey = keyof typeof PARAM_MAP;

const REVERSE_MAP = Object.fromEntries(
  Object.entries(PARAM_MAP).map(([short, long]) => [long, short])
) as Record<string, ParamKey>;

const VALID_CONV_OPTIONS = new Set<ConversionOption>([
  "conservative",
  "realistic",
  "strong",
  "custom",
]);

/**
 * Read URL search params and return any overrides for CalculatorInputs.
 * Missing or invalid params are silently skipped — caller merges with defaults.
 */
export function readInputsFromUrl(): Partial<CalculatorInputs> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return {};

  const patch: Partial<CalculatorInputs> = {};

  for (const [shortKey, inputKey] of Object.entries(PARAM_MAP)) {
    const raw = params.get(shortKey);
    if (raw === null) continue;

    if (inputKey === "conversionOption") {
      if (VALID_CONV_OPTIONS.has(raw as ConversionOption)) {
        patch.conversionOption = raw as ConversionOption;
      }
    } else {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) {
        (patch as Record<string, number>)[inputKey] = n;
      }
    }
  }

  return patch;
}

/**
 * Encode the current inputs into a full URL with query params.
 * Omits params whose values match defaults to keep URLs shorter.
 */
export function buildReportUrl(inputs: CalculatorInputs): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "";

  const params = new URLSearchParams();

  for (const [inputKey, shortKey] of Object.entries(REVERSE_MAP)) {
    const value = inputs[inputKey as keyof CalculatorInputs];
    const defaultValue = DEFAULT_INPUTS[inputKey as keyof CalculatorInputs];

    if (value === defaultValue) continue;

    params.set(shortKey, String(value));
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
