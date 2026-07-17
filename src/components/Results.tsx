import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { CalculatorInputs, CalculatorResults } from "../types";
import {
  CONVERSION_PRESETS,
  formatCurrency,
  formatNumber,
  formatPercent,
  getConfidence,
} from "../lib/calculations";
import { cn, copyToClipboard } from "../lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";
import { ConfidenceBadge, getConfidenceColors } from "./ConfidenceBadge";

interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  update: (patch: Partial<CalculatorInputs>) => void;
}

export function Results({ inputs, results, update }: Props) {
  const confidence = useMemo(
    () => getConfidence(results.coverageRatio),
    [results.coverageRatio]
  );
  const colors = getConfidenceColors(confidence.level);

  const coveragePct = Math.max(
    0,
    Math.min(100, Math.round(results.coverageRatio * 100))
  );

  const gapIsZero = results.soldOutGap <= 0;

  const [copiedResults, setCopiedResults] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyResults = async () => {
    const text = buildCopyText(inputs, results, confidence.label);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedResults(true);
      setTimeout(() => setCopiedResults(false), 2200);
    }
  };

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <motion.section
      id="results"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative"
    >
      <div className="text-center mb-6">
        <div className="section-eyebrow justify-center">
          <span className="h-px w-6 bg-ink-200" /> Your Forecast{" "}
          <span className="h-px w-6 bg-ink-200" />
        </div>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-ink-900 tracking-tightish">
          Your sold-out gap
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-cream-50 p-7 sm:p-10 shadow-cardHover">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(194,86,42,0.7), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.18), transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cream-100/70 font-medium">
              Your Sold-Out Gap is
            </p>
            <ConfidenceBadge data={confidence} />
          </div>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <AnimatedNumber
              value={results.soldOutGap}
              className="result-number text-[80px] sm:text-[120px] text-cream-50"
            />
            <span className="text-cream-100/70 text-base sm:text-lg">
              warm buyers
            </span>
          </div>

          <p className="mt-3 text-cream-100/80 text-[15px] leading-relaxed max-w-xl">
            {gapIsZero ? (
              <>
                Based on your numbers, your warm demand can support this revenue
                goal.
              </>
            ) : (
              <>
                To hit{" "}
                <span className="text-cream-50 font-medium">
                  {formatCurrency(inputs.revenueGoal)}
                </span>
                , you likely need about{" "}
                <span className="text-cream-50 font-medium">
                  {formatNumber(results.requiredWarmBuyers)}
                </span>{" "}
                warm buyers before launch day.
              </>
            )}
          </p>

          <div className="mt-7">
            <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.2em] text-cream-100/60 mb-2">
              <span>Coverage</span>
              <span className="text-cream-50 tracking-normal text-sm font-medium">
                {coveragePct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-50/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coveragePct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                className={cn("h-full rounded-full", colors.bar)}
              />
            </div>
            <p className="mt-2 text-[12.5px] text-cream-100/70 leading-relaxed">
              {confidence.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <StatCard
          label="Current Warm Reach"
          value={formatNumber(results.totalWarmReach)}
          suffix="people"
          hint="Sum of all your direct channels."
        />
        <StatCard
          label="Projected Revenue"
          value={formatCurrency(results.projectedRevenue)}
          suffix={`at ${results.conversionRate}%`}
          hint={`${formatNumber(results.projectedOrders)} projected orders.`}
        />
        <StatCard
          label="Daily Signup Target"
          value={
            inputs.daysUntilLaunch > 0 && !gapIsZero
              ? `${formatNumber(results.dailySignupTarget)}`
              : "—"
          }
          suffix={
            inputs.daysUntilLaunch > 0 && !gapIsZero
              ? "new signups/day"
              : gapIsZero
              ? "you're covered"
              : "add days to launch"
          }
          hint={
            inputs.daysUntilLaunch > 0 && !gapIsZero
              ? `Over the next ${formatNumber(inputs.daysUntilLaunch)} days.`
              : undefined
          }
        />
      </div>

      {results.hasFollowers && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-3 px-5 py-4 rounded-2xl border border-ink-100 bg-white flex items-start gap-3"
        >
          <div className="mt-0.5 h-8 w-8 rounded-full bg-cream-100 grid place-items-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5.5" stroke="#363330" strokeWidth="1.2" />
              <path
                d="M3 11c1-1.6 2.4-2.4 4-2.4S9.9 9.4 11 11"
                stroke="#363330"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-[14px] text-ink-800 leading-relaxed">
            You can directly reach about{" "}
            <span className="font-medium text-ink-900">
              {formatPercent(results.warmAudienceRatio)}
            </span>{" "}
            of your main audience before launch.
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-cream-100/70 border border-cream-200">
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400 font-medium">
          Recalculate with…
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["conservative", "realistic", "strong"] as const).map((key) => {
            const preset = CONVERSION_PRESETS[key];
            const active = inputs.conversionOption === key;
            return (
              <button
                key={key}
                onClick={() => update({ conversionOption: key })}
                className={cn(
                  "px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border",
                  active
                    ? "bg-ink-900 text-cream-50 border-ink-900"
                    : "bg-white text-ink-800 border-ink-100 hover:border-ink-800"
                )}
              >
                {preset.label} {preset.value}%
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button onClick={handleCopyResults} className="btn-secondary">
          <CopyIcon copied={copiedResults} />
          {copiedResults ? "Copied" : "Copy My Results"}
        </button>
        <button onClick={handleCopyLink} className="btn-secondary">
          <LinkIcon copied={copiedLink} />
          {copiedLink ? "Link Copied" : "Copy Tool Link"}
        </button>
        <a href="#send-report" className="btn-ghost ml-1 self-center">
          Send to my inbox →
        </a>
      </div>

      <AnimatePresence>
        {(copiedResults || copiedLink) && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-2 text-[12.5px] text-ink-400"
          >
            {copiedResults && "Forecast copied — paste it anywhere."}
            {copiedLink && "Tool link copied — bookmark before every drop."}
          </motion.p>
        )}
      </AnimatePresence>

      <Insight />
    </motion.section>
  );
}

function StatCard({
  label,
  value,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="bg-white border border-ink-100 rounded-2xl p-5 shadow-soft"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-serif text-3xl text-ink-900 leading-none">{value}</span>
        {suffix && <span className="text-[12.5px] text-ink-400">{suffix}</span>}
      </div>
      {hint && (
        <p className="mt-2 text-[12.5px] text-ink-400 leading-relaxed">{hint}</p>
      )}
    </motion.div>
  );
}

function Insight() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-6 relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 sm:p-8"
    >
      <div className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
        Insight
      </div>
      <p className="mt-2 font-serif text-2xl sm:text-[28px] text-ink-900 leading-snug tracking-tightish">
        Followers aren't buyers.{" "}
      </p>
      <p className="mt-3 text-[14.5px] text-ink-400 leading-relaxed max-w-xl">
        A large audience helps, but the real question is how many people you can
        directly reach before launch day.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-[13px] text-ink-800 font-medium">
        <span className="h-px w-6 bg-ink-200" />
        Start building early-access interest before the full drop goes live.
      </div>
    </motion.div>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7.5l2.8 2.8L11 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="3.5"
        width="7.5"
        height="7.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M2 8V2.8C2 2.36 2.36 2 2.8 2H8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkIcon({ copied }: { copied: boolean }) {
  return copied ? (
    <CopyIcon copied />
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M6 8c1 1 2.6 1 3.6 0l1.6-1.6c1-1 1-2.6 0-3.6s-2.6-1-3.6 0l-.8.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M8 6c-1-1-2.6-1-3.6 0L2.8 7.6c-1 1-1 2.6 0 3.6s2.6 1 3.6 0l.8-.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildCopyText(
  inputs: CalculatorInputs,
  results: CalculatorResults,
  confidenceLabel: string
): string {
  const lines = [
    "My Sold-Out Gap Forecast:",
    "",
    `Revenue Goal: ${formatCurrency(inputs.revenueGoal)}`,
    `Required Warm Buyers: ${formatNumber(results.requiredWarmBuyers)}`,
    `Current Warm Reach: ${formatNumber(results.totalWarmReach)}`,
    `Sold-Out Gap: ${formatNumber(results.soldOutGap)}`,
    inputs.daysUntilLaunch > 0
      ? `Daily Signup Target: ${formatNumber(results.dailySignupTarget)}/day`
      : "Daily Signup Target: —",
    `Confidence: ${confidenceLabel}`,
    "",
    "Insight: Followers don't forecast demand. Warm buyers do.",
  ];
  return lines.join("\n");
}
