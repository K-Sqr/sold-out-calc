import { useId } from "react";
import { cn } from "../lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  helper?: string;
  currency?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
  hideLabel?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  currency = false,
  min = 0,
  step = 1,
  max,
  className,
  inputClassName,
  hideLabel = false,
}: NumberFieldProps) {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") {
      onChange(0);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) onChange(n);
  };

  // Show empty string when value is 0 so placeholder shows
  const displayValue = value === 0 ? "" : String(value);

  return (
    <div className={cn("w-full", className)}>
      {!hideLabel && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        {currency && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-[15px]">
            $
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={label}
          className={cn(
            "input-base",
            currency && "input-currency",
            inputClassName
          )}
        />
      </div>
      {helper && <p className="field-helper">{helper}</p>}
    </div>
  );
}
