import type { CalculatorInputs, CalculatorResults } from "../types";
import { getConfidence } from "./calculations";

export interface ReportPayload {
  email: string;
  phone: string;
  submittedAt: string;
  sourceUrl: string;
  inputs: {
    revenueGoal: number;
    averageOrderValue: number;
    emailList: number;
    smsList: number;
    igBroadcast: number;
    waitlistVip: number;
    otherDirect: number;
    followerCount: number;
    daysUntilLaunch: number;
    conversionOption: CalculatorInputs["conversionOption"];
    conversionRate: number;
  };
  results: {
    totalWarmReach: number;
    requiredOrders: number;
    requiredWarmBuyers: number;
    soldOutGap: number;
    projectedOrders: number;
    projectedRevenue: number;
    dailySignupTarget: number;
    coverageRatio: number;
    warmAudienceRatio: number;
  };
  confidence: {
    level: string;
    label: string;
    message: string;
  };
}

export function buildPayload(
  email: string,
  phone: string,
  inputs: CalculatorInputs,
  results: CalculatorResults
): ReportPayload {
  const confidence = getConfidence(results.coverageRatio);
  return {
    email: email.trim(),
    phone: phone.trim(),
    submittedAt: new Date().toISOString(),
    sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    inputs: {
      revenueGoal: inputs.revenueGoal,
      averageOrderValue: inputs.averageOrderValue,
      emailList: inputs.emailList,
      smsList: inputs.smsList,
      igBroadcast: inputs.igBroadcast,
      waitlistVip: inputs.waitlistVip,
      otherDirect: inputs.otherDirect,
      followerCount: inputs.followerCount,
      daysUntilLaunch: inputs.daysUntilLaunch,
      conversionOption: inputs.conversionOption,
      conversionRate: results.conversionRate,
    },
    results: {
      totalWarmReach: results.totalWarmReach,
      requiredOrders: results.requiredOrders,
      requiredWarmBuyers: results.requiredWarmBuyers,
      soldOutGap: results.soldOutGap,
      projectedOrders: results.projectedOrders,
      projectedRevenue: results.projectedRevenue,
      dailySignupTarget: results.dailySignupTarget,
      coverageRatio: results.coverageRatio,
      warmAudienceRatio: results.warmAudienceRatio,
    },
    confidence,
  };
}

export async function submitReport(payload: ReportPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_REPORT_ENDPOINT_URL as string | undefined;

  if (!endpoint) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        "[SendReport] VITE_REPORT_ENDPOINT_URL is not set — running in DEMO mode. " +
          "No data is being saved or emailed. See docs/REPORT_CAPTURE_SETUP.md."
      );
      // eslint-disable-next-line no-console
      console.info("[SendReport] Would submit:", payload);
    }
    // Simulate brief network delay so the loading state feels real in dev.
    await new Promise((r) => setTimeout(r, 600));
    return;
  }

  // Using text/plain to avoid a CORS preflight against Apps Script.
  // Apps Script reads the raw body via e.postData.contents and parses JSON.
  const res = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Report submission failed (${res.status})`);
  }

  // Apps Script returns JSON { ok: true } on success.
  try {
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (data && data.ok === false) {
      throw new Error(data.error || "Report submission failed");
    }
  } catch {
    // If the response isn't JSON, treat the 200 OK as success.
  }
}

export function isDemoMode(): boolean {
  return !import.meta.env.VITE_REPORT_ENDPOINT_URL;
}
