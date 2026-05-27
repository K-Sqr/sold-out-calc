import { AnimatePresence, motion } from "framer-motion";
import type { CalculatorInputs, ConversionOption } from "../types";
import { CONVERSION_PRESETS } from "../lib/calculations";
import { cn } from "../lib/utils";
import { NumberField } from "./NumberField";
import { Section } from "./Section";

interface Props {
  inputs: CalculatorInputs;
  update: (patch: Partial<CalculatorInputs>) => void;
}

const PRESET_ORDER: Array<Exclude<ConversionOption, "custom">> = [
  "conservative",
  "realistic",
  "strong",
];

export function ConversionSection({ inputs, update }: Props) {
  const showCustom = inputs.conversionOption === "custom";

  return (
    <Section
      step="Step 05"
      title="Your buyer conversion assumption"
      helper="How many of your warm signups do you expect to actually buy?"
      id="conversion"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESET_ORDER.map((key) => {
          const preset = CONVERSION_PRESETS[key];
          const active = inputs.conversionOption === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => update({ conversionOption: key })}
              className={cn("conv-card text-left group", active && "conv-card-active")}
              aria-pressed={active}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-ink-800">
                  {preset.label}
                </span>
                <span className="font-serif text-2xl text-ink-900 leading-none">
                  {preset.value}%
                </span>
              </div>
              <p className="mt-2 text-[12.5px] text-ink-400 leading-snug">
                {preset.description}
              </p>
              <span
                className={cn(
                  "absolute top-2 right-2 h-2 w-2 rounded-full transition-all duration-200",
                  active ? "bg-accent scale-100" : "bg-transparent scale-0"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12.5px] text-ink-400 leading-relaxed max-w-md">
          Most brands should start with{" "}
          <span className="text-ink-800 font-medium">Realistic</span> unless they
          already know their list converts strongly.
        </p>
        <button
          type="button"
          onClick={() =>
            update({
              conversionOption: showCustom ? "realistic" : "custom",
            })
          }
          className="btn-ghost"
        >
          {showCustom ? "Use preset" : "Use custom %"}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-xs">
              <NumberField
                label="Custom conversion rate (%)"
                value={inputs.customConversion}
                onChange={(n) =>
                  update({ customConversion: Math.max(0, Math.min(100, n)) })
                }
                placeholder="5"
                min={0}
                max={100}
                step={0.5}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
