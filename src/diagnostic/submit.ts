/**
 * Sold-Out Stage Diagnostic — submission.
 *
 * Sends every answer to a Google Apps Script Web App, which appends one row
 * per submission (see scripts/google-apps-script/DiagnosticCode.gs).
 *
 * Set the endpoint in `.env`:
 *   VITE_DIAGNOSTIC_ENDPOINT_URL=https://script.google.com/macros/s/.../exec
 *
 * Without it, the form runs in DEMO mode: it shows the confirmation screen
 * without saving anything, so the UX is fully testable before the sheet is wired.
 */

import { DIAGNOSTIC_SECTIONS } from "./schema";
import type { Answers } from "./types";
import { isVisible } from "./logic";

export interface DiagnosticField {
  id: string;
  label: string;
  /** Stable raw value (option code for selects). Used by server-side scoring. */
  value: string;
  /** Human-readable value written into the sheet cell. */
  display: string;
}

export interface DiagnosticPayload {
  submittedAt: string;
  sourceUrl: string;
  /** Ordered to match the schema so the sheet columns read naturally. */
  fields: DiagnosticField[];
}

/**
 * Flatten the schema + answers into an ordered field list. Hidden conditional
 * questions (e.g. "which ad platform?" when they don't run ads) are omitted.
 */
export function buildDiagnosticPayload(answers: Answers): DiagnosticPayload {
  const fields: DiagnosticField[] = [];

  for (const section of DIAGNOSTIC_SECTIONS) {
    for (const q of section.questions) {
      if (!isVisible(q, answers)) continue;
      const value = (answers[q.id] ?? "").toString().trim();
      const option = q.options?.find((o) => o.value === value);
      fields.push({
        id: q.id,
        label: q.label,
        value,
        display: option ? option.label : value,
      });
    }
  }

  return {
    submittedAt: new Date().toISOString(),
    sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    fields,
  };
}

export function isDemoMode(): boolean {
  return !import.meta.env.VITE_DIAGNOSTIC_ENDPOINT_URL;
}

export async function submitDiagnostic(payload: DiagnosticPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_DIAGNOSTIC_ENDPOINT_URL as
    | string
    | undefined;

  if (!endpoint) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Diagnostic] VITE_DIAGNOSTIC_ENDPOINT_URL is not set — running in DEMO mode. " +
          "No data is being saved. See docs/DIAGNOSTIC_SETUP.md."
      );
      // eslint-disable-next-line no-console
      console.info("[Diagnostic] Would submit:", payload);
    }
    // Simulate a brief network delay so the loading state feels real.
    await new Promise((r) => setTimeout(r, 700));
    return;
  }

  // text/plain avoids a CORS preflight against Apps Script; the script reads
  // the raw body via e.postData.contents and parses JSON.
  const res = await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Diagnostic submission failed (${res.status})`);
  }

  let data: { ok?: boolean; error?: string } | null = null;
  try {
    data = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    // Non-JSON 200 response — treat as success.
  }
  if (data && data.ok === false) {
    throw new Error(data.error || "Diagnostic submission failed");
  }
}
