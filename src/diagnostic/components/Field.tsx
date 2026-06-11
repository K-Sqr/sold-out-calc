import { useId } from "react";
import { cn } from "../../lib/utils";
import type { Question, QuestionOption } from "../types";

interface FieldProps {
  question: Question;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const NUMERIC_TYPES = new Set(["number", "currency", "percent"]);

export function Field({ question, value, error, onChange }: FieldProps) {
  const id = useId();
  const { type, label, helper, placeholder } = question;

  const isChoice = type === "select" || type === "yesno";
  const options: QuestionOption[] =
    type === "yesno"
      ? question.options ?? [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]
      : question.options ?? [];

  return (
    <div className="w-full">
      <label
        htmlFor={isChoice ? undefined : id}
        className="field-label"
        id={isChoice ? `${id}-label` : undefined}
      >
        {label}
        {question.required && <span className="text-accent"> *</span>}
      </label>

      {isChoice ? (
        <ChoiceCards
          options={options}
          value={value}
          onChange={onChange}
          compact={type === "yesno"}
          labelledBy={`${id}-label`}
        />
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-base resize-none"
        />
      ) : (
        <div className="relative">
          {type === "currency" && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-[15px]">
              $
            </span>
          )}
          {type === "percent" && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 text-[15px]">
              %
            </span>
          )}
          <input
            id={id}
            type={inputHtmlType(type)}
            inputMode={NUMERIC_TYPES.has(type) ? "numeric" : undefined}
            min={NUMERIC_TYPES.has(type) ? 0 : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoCompleteFor(question.id, type)}
            className={cn(
              "input-base",
              type === "currency" && "input-currency",
              type === "percent" && "pr-9"
            )}
          />
        </div>
      )}

      {helper && !error && <p className="field-helper">{helper}</p>}
      {error && (
        <p className="mt-1.5 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceCards({
  options,
  value,
  onChange,
  compact,
  labelledBy,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  labelledBy: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn(
        "grid gap-2.5",
        compact ? "grid-cols-2 max-w-xs" : "grid-cols-1 sm:grid-cols-2"
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative text-left rounded-2xl border px-4 py-3.5 text-[15px] transition-all duration-200",
              active
                ? "border-ink-900 bg-cream-50 text-ink-900 shadow-card"
                : "border-ink-100 bg-white text-ink-800 hover:border-ink-200"
            )}
          >
            <span className="pr-5 leading-snug">{opt.label}</span>
            <span
              className={cn(
                "absolute top-1/2 right-3.5 -translate-y-1/2 h-2 w-2 rounded-full transition-all duration-200",
                active ? "bg-accent scale-100" : "bg-transparent scale-0"
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

function inputHtmlType(type: Question["type"]): string {
  switch (type) {
    case "email":
      return "email";
    case "tel":
      return "tel";
    case "url":
      return "text";
    case "date":
      return "date";
    case "number":
    case "currency":
    case "percent":
      return "number";
    default:
      return "text";
  }
}

function autoCompleteFor(qId: string, type: Question["type"]): string | undefined {
  if (type === "email") return "email";
  if (type === "tel") return "tel";
  if (qId === "contact_name") return "name";
  if (qId === "country") return "country-name";
  return undefined;
}
