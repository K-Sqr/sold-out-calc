import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { DIAGNOSTIC_SECTIONS } from "./schema";
import { isVisible, validateSection } from "./logic";
import { buildDiagnosticPayload, isDemoMode, submitDiagnostic } from "./submit";
import type { Answers } from "./types";
import { Field } from "./components/Field";
import { ProgressBar } from "./components/ProgressBar";
import { Confirmation } from "./components/Confirmation";

type Phase = "intro" | "form" | "done";
type Status = "idle" | "submitting" | "error";

const SECTIONS = DIAGNOSTIC_SECTIONS;
const LAST_STEP = SECTIONS.length - 1;

export default function DiagnosticApp() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const section = SECTIONS[step];
  const demo = isDemoMode();
  const submitting = status === "submitting";

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const visibleQuestions = useMemo(
    () => section.questions.filter((q) => isVisible(q, answers)),
    [section, answers]
  );

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const goNext = async () => {
    const sectionErrors = validateSection(section, answers);
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(sectionErrors);
      return;
    }

    if (step < LAST_STEP) {
      setStep((s) => s + 1);
      scrollTop();
      return;
    }

    setStatus("submitting");
    setSubmitError(null);
    try {
      await submitDiagnostic(buildDiagnosticPayload(answers));
      setPhase("done");
      setStatus("idle");
      scrollTop();
    } catch (err) {
      setStatus("error");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const goBack = () => {
    setSubmitError(null);
    if (step === 0) {
      setPhase("intro");
      return;
    }
    setStep((s) => s - 1);
    scrollTop();
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="container-tool pb-16">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <Intro key="intro" onStart={() => setPhase("form")} />
          )}

          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="pt-8 sm:pt-10"
            >
              <ProgressBar
                current={step}
                total={SECTIONS.length}
                title={section.title}
              />

              <div className="section-card">
                <header className="mb-6">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent">
                      {section.step}
                    </span>
                    <span className="h-px flex-1 bg-ink-100" aria-hidden />
                  </div>
                  <h2 className="mt-2 text-2xl sm:text-[28px] font-serif text-ink-900 tracking-tightish leading-tight">
                    {section.title}
                  </h2>
                  {section.helper && (
                    <p className="mt-1.5 text-[14px] text-ink-400 leading-relaxed">
                      {section.helper}
                    </p>
                  )}
                </header>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5"
                  >
                    {visibleQuestions.map((q) => (
                      <div
                        key={q.id}
                        className={q.half ? "sm:col-span-1" : "sm:col-span-2"}
                      >
                        <Field
                          question={q}
                          value={answers[q.id] ?? ""}
                          error={errors[q.id]}
                          onChange={(v) => setAnswer(q.id, v)}
                        />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {submitError && (
                  <p className="mt-5 text-[13px] text-danger" role="alert">
                    {submitError}
                  </p>
                )}

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
                  <button
                    type="button"
                    onClick={goBack}
                    className="btn-ghost"
                    disabled={submitting}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M9 3L5 7l4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-primary"
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    {step < LAST_STEP ? (
                      <>
                        Next
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path
                            d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    ) : submitting ? (
                      <>
                        <Spinner />
                        Submitting…
                      </>
                    ) : (
                      "Submit diagnostic"
                    )}
                  </button>
                </div>
              </div>

              {demo && import.meta.env.DEV && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] text-warning bg-warning/10 border border-warning/25 rounded-full px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Demo mode — set VITE_DIAGNOSTIC_ENDPOINT_URL to save submissions
                </p>
              )}
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="pt-10 sm:pt-16"
            >
              <Confirmation />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="container-tool pb-10 text-center">
        <p className="text-[11.5px] text-ink-400">
          The Sold-Out System · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative pt-14 sm:pt-20 pb-8 text-center"
    >
      <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-400 font-medium">
        <span className="h-px w-6 bg-ink-200" aria-hidden />
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1 w-1 rounded-full bg-accent" />
          The Sold-Out System
        </span>
        <span className="h-px w-6 bg-ink-200" aria-hidden />
      </div>

      <h1 className="mt-8 font-serif text-[40px] leading-[1.06] sm:text-[60px] sm:leading-[1.02] tracking-tighter2 text-ink-900 pb-1">
        The Sold-Out <span className="editorial-em">Stage Diagnostic</span>
      </h1>

      <p className="mt-5 mx-auto max-w-xl text-[16px] sm:text-[17px] text-ink-400 leading-relaxed">
        A few quick questions about your drops, your numbers, and what's holding
        the next level back. We'll map your stage and likely growth bottleneck —
        then point you to the right next move.
      </p>

      <div className="mt-9 flex items-center justify-center gap-4 flex-wrap">
        <button onClick={onStart} className="btn-primary group" type="button">
          Start the diagnostic
          <svg
            className="transition-transform duration-300 group-hover:translate-x-0.5"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="text-[13px] text-ink-400 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3.2L9 8.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          ~3 minutes · no signup
        </div>
      </div>
    </motion.section>
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
      <a
        href="/"
        className="hidden sm:inline-flex text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
      >
        Free calculator →
      </a>
    </header>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
