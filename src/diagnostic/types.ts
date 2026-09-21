/**
 * Sold-Out Stage Diagnostic — form model.
 *
 * The whole form is described by data (see `schema.ts`). To add, remove, or
 * reorder a question you only edit the schema — no component changes needed.
 * Each question's `id` becomes its column key in Google Sheets.
 */

export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "currency"
  | "percent"
  | "select"
  /** Like `select`, but several options can be picked. Stored as "a|b|c". */
  | "multiselect"
  | "yesno"
  | "date"
  | "textarea";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  /** Stable key. Becomes the Google Sheet column + used by scoring. */
  id: string;
  /** Human-readable column header + on-screen label. */
  label: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  /** Short line shown under the field. */
  helper?: string;
  /**
   * Longer plain-English explanation of the term / concept, shown behind an
   * (i) icon next to the label. Use this for jargon (AOV, sell-through…).
   */
  info?: string;
  /** For `select` / `multiselect` / `yesno` (yesno auto-fills Yes/No if omitted). */
  options?: QuestionOption[];
  /** Only show this question when another answer matches. */
  showIf?: { id: string; equals: string };
  /** Layout hint — render two of these side-by-side on desktop. */
  half?: boolean;
}

export interface DiagnosticSection {
  id: string;
  /** e.g. "Section 01" — shown as the eyebrow. */
  step: string;
  title: string;
  helper?: string;
  questions: Question[];
}

/** All answers are stored as strings (numbers as numeric strings). */
export type Answers = Record<string, string>;
