import type {
  CalculatorInputs,
  CalculatorResults,
  ConfidenceBadgeData,
  ConversionOption,
} from "../types";

export const CONVERSION_PRESETS: Record<
  Exclude<ConversionOption, "custom">,
  { label: string; value: number; description: string }
> = {
  conservative: {
    label: "Conservative",
    value: 2,
    description: "Cold list or first launch",
  },
  realistic: {
    label: "Realistic",
    value: 5,
    description: "Most healthy warm lists",
  },
  strong: {
    label: "Strong",
    value: 10,
    description: "Proven repeat buyer base",
  },
};

export const DEFAULT_INPUTS: CalculatorInputs = {
  revenueGoal: 0,
  averageOrderValue: 0,
  emailList: 0,
  smsList: 0,
  igBroadcast: 0,
  waitlistVip: 0,
  otherDirect: 0,
  followerCount: 0,
  daysUntilLaunch: 0,
  conversionOption: "realistic",
  customConversion: 5,
};

export function resolveConversionRate(inputs: CalculatorInputs): number {
  if (inputs.conversionOption === "custom") {
    return Math.max(0, inputs.customConversion);
  }
  return CONVERSION_PRESETS[inputs.conversionOption].value;
}

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const totalWarmReach =
    safe(inputs.emailList) +
    safe(inputs.smsList) +
    safe(inputs.igBroadcast) +
    safe(inputs.waitlistVip) +
    safe(inputs.otherDirect);

  const conversionPct = resolveConversionRate(inputs);
  const conversionDecimal = conversionPct / 100;

  const revenueGoal = safe(inputs.revenueGoal);
  const aov = safe(inputs.averageOrderValue);
  const days = safe(inputs.daysUntilLaunch);
  const followers = safe(inputs.followerCount);

  const isValid = revenueGoal > 0 && aov > 0 && conversionDecimal > 0;

  const requiredOrdersRaw = isValid ? revenueGoal / aov : 0;
  const requiredOrders = Math.ceil(requiredOrdersRaw);

  const requiredWarmBuyersRaw = isValid ? requiredOrdersRaw / conversionDecimal : 0;
  const requiredWarmBuyers = Math.ceil(requiredWarmBuyersRaw);

  const soldOutGap = Math.max(0, Math.ceil(requiredWarmBuyersRaw - totalWarmReach));

  const projectedOrders = Math.floor(totalWarmReach * conversionDecimal);
  const projectedRevenue = Math.round(projectedOrders * aov);

  const dailySignupTarget =
    days > 0 ? Math.max(0, Math.ceil(soldOutGap / days)) : 0;

  const coverageRatio =
    requiredWarmBuyersRaw > 0 ? totalWarmReach / requiredWarmBuyersRaw : 0;

  const warmAudienceRatio = followers > 0 ? totalWarmReach / followers : 0;

  return {
    totalWarmReach,
    conversionRate: conversionPct,
    requiredOrders,
    requiredWarmBuyers,
    soldOutGap,
    projectedOrders,
    projectedRevenue,
    dailySignupTarget,
    coverageRatio,
    warmAudienceRatio,
    hasFollowers: followers > 0,
    isValid,
  };
}

export function getConfidence(coverageRatio: number): ConfidenceBadgeData {
  if (coverageRatio >= 1) {
    return {
      level: "strong",
      label: "Strong Position",
      message: "Your warm demand can support this goal based on your assumptions.",
    };
  }
  if (coverageRatio >= 0.7) {
    return {
      level: "close",
      label: "Close",
      message: "You're near the target. A focused pre-launch push could close the gap.",
    };
  }
  if (coverageRatio >= 0.4) {
    return {
      level: "at-risk",
      label: "At Risk",
      message: "You may be walking into launch day without enough warm demand.",
    };
  }
  return {
    level: "high-risk",
    label: "High Risk",
    message: "You may be relying too heavily on launch-day attention.",
  };
}

function safe(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function formatCurrency(n: number, currency = "$"): string {
  if (!Number.isFinite(n)) return `${currency}0`;
  return `${currency}${Math.round(n).toLocaleString("en-US")}`;
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

export function formatPercent(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "0%";
  const pct = n * 100;
  if (pct < 1 && pct > 0) return `${pct.toFixed(digits)}%`;
  return `${Math.round(pct)}%`;
}
