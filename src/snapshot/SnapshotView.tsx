import { motion } from "framer-motion";
import type { SnapshotData } from "./types";

const ease = [0.22, 0.61, 0.36, 1] as const;

/**
 * "Your Sold-Out Snapshot" — the founder-facing page.
 *
 * Clean, premium, fashion-friendly, mobile-first. Deliberately NOT a SaaS
 * dashboard: large section cards, calm hierarchy, screenshot-friendly. All
 * diagnosis language is hedged ("appears to be", "likely", "based on the
 * information submitted") — nothing is stated as certain.
 */
export function SnapshotView({
  data,
  embedded = false,
}: {
  data: SnapshotData;
  embedded?: boolean;
}) {
  const {
    brandName,
    stage,
    currentRevenue,
    targetRevenue,
    revenueGap,
    primaryBottleneck,
    strongestLever,
    recommendedEngine,
    nextStep,
    ctaLabel,
    ctaNote,
    ctaUrl,
  } = data;

  const ctaIsExternal = /^https?:/i.test(ctaUrl);

  return (
    <div className={embedded ? "relative z-10" : "relative z-10 min-h-screen"}>
      {!embedded && <Header />}

      <main className="container-tool pb-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className={
            embedded
              ? "pt-8 pb-6 text-center"
              : "pt-12 sm:pt-16 pb-8 text-center"
          }
        >
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-400 font-medium">
            <span className="h-px w-6 bg-ink-200" aria-hidden />
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-accent" />
              The Sold-Out System
            </span>
            <span className="h-px w-6 bg-ink-200" aria-hidden />
          </div>

          <h1 className="mt-7 font-serif text-[38px] leading-[1.06] sm:text-[56px] sm:leading-[1.02] tracking-tighter2 text-ink-900 pb-1">
            Your <span className="editorial-em">Sold-Out</span> Snapshot
          </h1>

          {brandName && (
            <p className="mt-4 text-[15px] sm:text-[16px] text-ink-400">
              Prepared for{" "}
              <span className="text-ink-900 font-medium">{brandName}</span>
            </p>
          )}

          <p className="mt-5 mx-auto max-w-xl text-[14px] sm:text-[15px] text-ink-400 leading-relaxed">
            Based on the information submitted in your Sold-Out Stage Diagnostic.
            This is a starting read, not a final verdict — a short review confirms
            the details.
          </p>
        </motion.section>

        <div className="space-y-5 sm:space-y-6">
          {/* Section 1 — Current Stage */}
          {stage && (
            <Card index={0} eyebrow="01 · Current Stage">
              <p className="font-serif text-[26px] sm:text-[30px] text-ink-900 tracking-tightish leading-tight">
                {stage}
              </p>
              <p className="mt-2 text-[14px] text-ink-400 leading-relaxed">
                This appears to be your current Sold-Out stage based on your
                revenue, drop history, and operating setup.
              </p>
            </Card>
          )}

          {/* Section 2 — Revenue Target */}
          {(currentRevenue || targetRevenue || revenueGap) && (
            <Card index={1} eyebrow="02 · Revenue Target">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                {currentRevenue && (
                  <span className="font-serif text-[24px] sm:text-[28px] text-ink-900 tracking-tightish">
                    {currentRevenue}
                  </span>
                )}
                {currentRevenue && targetRevenue && (
                  <span className="text-ink-200 text-[22px] sm:text-[26px]" aria-hidden>
                    →
                  </span>
                )}
                {targetRevenue && (
                  <span className="font-serif text-[24px] sm:text-[28px] text-accent-ink tracking-tightish">
                    {targetRevenue}
                  </span>
                )}
              </div>
              {revenueGap && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream-100 border border-cream-200 px-3.5 py-1.5">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-ink-400 font-medium">
                    Revenue gap
                  </span>
                  <span className="text-[14px] font-medium text-ink-900">
                    {revenueGap}
                  </span>
                </div>
              )}
              <p className="mt-4 text-[14px] text-ink-400 leading-relaxed">
                This is the revenue jump you're aiming to make on your next
                drops.
              </p>
            </Card>
          )}

          {/* Section 3 — Primary Bottleneck */}
          {primaryBottleneck && (
            <Card index={2} eyebrow="03 · Likely Primary Bottleneck">
              <p className="font-serif text-[26px] sm:text-[30px] text-ink-900 tracking-tightish leading-tight">
                {primaryBottleneck}
              </p>
              <p className="mt-2 text-[14px] text-ink-400 leading-relaxed">
                Based on the information submitted, your current constraint
                appears to be <span className="text-ink-800">{primaryBottleneck}</span>.
              </p>
              {strongestLever && (
                <div className="mt-4 flex items-center gap-2 text-[13.5px]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-ink-400">
                    Strongest current lever:
                  </span>
                  <span className="text-ink-900 font-medium">
                    {strongestLever}
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Section 4 — Recommended Sold-Out Engine (dark feature card) */}
          {recommendedEngine && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl bg-ink-900 text-cream-50 p-7 sm:p-9 shadow-cardHover"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(194,86,42,0.55), transparent 70%)",
                }}
                aria-hidden
              />
              <span className="relative text-[11px] uppercase tracking-[0.22em] text-cream-50/60 font-medium">
                04 · Recommended Sold-Out Engine
              </span>
              <p className="relative mt-3 font-serif text-[28px] sm:text-[34px] tracking-tightish leading-tight">
                {recommendedEngine}
              </p>
              <p className="relative mt-3 text-[14px] text-cream-50/70 leading-relaxed max-w-lg">
                This is the recommended next module to work on given your likely
                bottleneck. We'd confirm the fit together before installing
                anything.
              </p>
            </motion.div>
          )}

          {/* Section 5 — Next Step + CTA */}
          <Card index={4} eyebrow="05 · Next Step">
            {nextStep && (
              <p className="text-[15px] sm:text-[16px] text-ink-800 leading-relaxed">
                {nextStep}
              </p>
            )}
            {ctaLabel && (
              <div className="mt-6">
                {ctaUrl ? (
                  <a
                    href={ctaUrl}
                    className="btn-primary"
                    target={ctaIsExternal ? "_blank" : undefined}
                    rel={ctaIsExternal ? "noopener noreferrer" : undefined}
                  >
                    {ctaLabel}
                  </a>
                ) : (
                  <span className="btn-primary cursor-default select-none">
                    {ctaLabel}
                  </span>
                )}
                {ctaNote && (
                  <p className="mt-3 text-[13px] text-ink-400 leading-relaxed">
                    {ctaNote}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Hedged closing line */}
        <p className="mt-8 text-center text-[12.5px] text-ink-400 leading-relaxed max-w-lg mx-auto">
          This snapshot is a first read based on the information submitted.
          Figures and recommendations are likely, not final, and are confirmed
          during a short Sold-Out Review.
        </p>
      </main>

      {!embedded && (
        <footer className="container-tool pb-10 text-center">
          <p className="text-[11.5px] text-ink-400">
            The Sold-Out System · {new Date().getFullYear()}
          </p>
        </footer>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="container-tool pt-6 sm:pt-8 flex items-center justify-between">
      <a
        href="/"
        className="inline-flex items-center gap-2 text-ink-900"
        aria-label="The Sold-Out System"
      >
        <span className="h-7 w-7 rounded-lg bg-ink-900 grid place-items-center text-cream-50 font-serif italic text-[15px]">
          S
        </span>
        <span className="text-[13px] tracking-[0.18em] uppercase font-medium">
          The Sold-Out System
        </span>
      </a>
    </header>
  );
}

function Card({
  index,
  eyebrow,
  children,
}: {
  index: number;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.08 * index }}
      className="section-card"
    >
      <div className="flex items-baseline gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-accent">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-ink-100" aria-hidden />
      </div>
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}
