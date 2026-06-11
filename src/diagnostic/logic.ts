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
      errors[q.id] = "This one's required.";
      continue;
    }
    if (value && q.type === "email" && !isValidEmail(value)) {
      errors[q.id] = "Please enter a valid email.";
    }
  }

  return errors;
}
