import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { splitMulti, toggleMulti } from "../logic";
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
  const { type, label, helper, info, placeholder } = question;

  const isMulti = type === "multiselect";
  const isChoice = type === "select" || type === "yesno" || isMulti;
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
        {info && <InfoTip id={`${id}-info`} text={info} />}
      </label>

      {isChoice ? (
        <ChoiceCards
          options={options}
          value={value}
          onChange={onChange}
          multiple={isMulti}
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
          aria-describedby={info ? `${id}-info` : undefined}
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
            aria-describedby={info ? `${id}-info` : undefined}
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

/**
 * Small (i) button beside a label. Opens on hover / focus, toggles on tap, and
 * closes on Esc or an outside click — so it works on phones too, where hover
 * doesn't exist. The explanation is also wired up via aria-describedby.
 */
function InfoTip({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  // Anchor the popover to the right edge when the (i) sits in the right half
  // of the viewport, so it never runs off-screen on a two-column row.
  const [alignRight, setAlignRight] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const reveal = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left > window.innerWidth / 2);
    setOpen(true);
  };

  useEffect(() => {
    if (!pinned) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setPinned(false);
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  const show = open || pinned;

  return (
    <span
      ref={wrapRef}
      className="relative inline-block align-middle ml-1.5"
      onMouseEnter={reveal}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="What does this mean?"
        aria-expanded={show}
        aria-controls={id}
        onClick={(e) => {
          e.preventDefault();
          reveal();
          setPinned((p) => !p);
        }}
        onFocus={reveal}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPinned(false);
            setOpen(false);
          }
        }}
        className={cn(
          "inline-grid h-[18px] w-[18px] place-items-center rounded-full border text-[11px] font-serif italic leading-none transition-colors duration-150 -translate-y-px",
          show
            ? "border-ink-900 bg-ink-900 text-cream-50"
            : "border-ink-200 text-ink-400 hover:border-ink-800 hover:text-ink-900"
        )}
      >
        i
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "absolute top-full z-30 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl",
          alignRight ? "right-0" : "left-0",
          " bg-ink-900 px-3.5 py-3 text-[12.5px] font-normal normal-case tracking-normal leading-relaxed text-cream-50 shadow-cardHover transition-all duration-150",
          show
            ? "visible opacity-100 translate-y-0"
            : "invisible opacity-0 -translate-y-1 pointer-events-none"
        )}
      >
        {text}
      </span>
    </span>
  );
}

function ChoiceCards({
  options,
  value,
  onChange,
  multiple,
  compact,
  labelledBy,
}: {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  compact?: boolean;
  labelledBy: string;
}) {
  const selected = multiple ? splitMulti(value) : [value];

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-labelledby={labelledBy}
      className={cn(
        "grid gap-2.5",
        compact
          ? options.length > 2
            ? "grid-cols-3"
            : "grid-cols-2 max-w-xs"
          : "grid-cols-1 sm:grid-cols-2"
      )}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() =>
              onChange(multiple ? toggleMulti(value, opt.value) : opt.value)
            }
            className={cn(
              "relative rounded-2xl border py-3.5 text-[15px] transition-all duration-200",
              // Compact (yes / sometimes / no) rows are narrow: centre the label
              // and tuck the dot in the corner so the two never collide.
              compact ? "px-3 text-center" : "px-4 text-left",
              active
                ? "border-ink-900 bg-cream-50 text-ink-900 shadow-card"
                : "border-ink-100 bg-white text-ink-800 hover:border-ink-200"
            )}
          >
            <span className={cn("leading-snug", !compact && "pr-5")}>
              {opt.label}
            </span>
            <span
              className={cn(
                "absolute h-2 w-2 rounded-full transition-all duration-200",
                compact
                  ? "top-2 right-2"
                  : "top-1/2 right-3.5 -translate-y-1/2",
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
