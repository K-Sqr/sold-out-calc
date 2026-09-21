/**
 * Shared form logic — conditional visibility + validation. Kept separate so
 * both the stepper (live validation) and the submit payload (which omits
 * hidden questions) agree on exactly what is shown.
 */

import type { Answers, DiagnosticSection, Question } from "./types";

/** Is this question currently shown, given its `showIf` and the answers? */
export function isVisible(q: Question, answers: Answers): boolean {
  if (!q.showIf) return true;
  return (answers[q.showIf.id] ?? "") === q.showIf.equals;
}

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length >= 5 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Multi-select answers -----------------------------------------------------
//
// `Answers` stores every value as a string, so a multi-select is kept as a
// pipe-delimited list ("a|b|c") in click order — the first pick is treated as
// the primary choice downstream (e.g. primary vs. secondary bottleneck).

export const MULTI_SEPARATOR = "|";

export function splitMulti(value: string): string[] {
  return value
    .split(MULTI_SEPARATOR)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function joinMulti(values: string[]): string {
  return values.join(MULTI_SEPARATOR);
}

/** Add `option` if missing, remove it if present. */
export function toggleMulti(value: string, option: string): string {
  const current = splitMulti(value);
  return current.includes(option)
    ? joinMulti(current.filter((v) => v !== option))
    : joinMulti([...current, option]);
}

/**
 * Validate one section. Returns a map of questionId -> error message for any
 * visible, required question that's empty (plus email format).
 */
export function validateSection(
  section: DiagnosticSection,
  answers: Answers
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const q of section.questions) {
    if (!isVisible(q, answers)) continue;
    const value = (answers[q.id] ?? "").trim();

    if (q.required && !value) {
      errors[q.id] =
        q.type === "multiselect"
          ? "Pick at least one."
          : "This one's required.";
      continue;
    }
    if (value && q.type === "email" && !isValidEmail(value)) {
      errors[q.id] = "Please enter a valid email.";
    }
  }

  return errors;
}
