import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AudienceSection } from "./components/AudienceSection";
import { ConversionSection } from "./components/ConversionSection";
import { Footer } from "./components/Footer";
import { GoalSection } from "./components/GoalSection";
import { Hero } from "./components/Hero";
import { Results } from "./components/Results";
import { SendReport } from "./components/SendReport";
import { SoftCTA } from "./components/SoftCTA";
import { TimelineSection } from "./components/TimelineSection";
import { WarmDemandSection } from "./components/WarmDemandSection";
import { DEFAULT_INPUTS, calculate } from "./lib/calculations";
import { readInputsFromUrl } from "./lib/urlParams";
import type { CalculatorInputs } from "./types";

function getInitialInputs(): CalculatorInputs {
  return { ...DEFAULT_INPUTS, ...readInputsFromUrl() };
}

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(getInitialInputs);
  const calcRef = useRef<HTMLDivElement | null>(null);

  const update = (patch: Partial<CalculatorInputs>) =>
    setInputs((prev) => ({ ...prev, ...patch }));

  const results = useMemo(() => calculate(inputs), [inputs]);

  const handleStart = () => {
    calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleJumpToGoal = () => {
    const goal = document.getElementById("goal");
    if (!goal) return;
    goal.scrollIntoView({ behavior: "smooth", block: "start" });
    // After the scroll settles, focus the first input so they can start typing.
    window.setTimeout(() => {
      const firstInput = goal.querySelector<HTMLInputElement>(
        'input[type="number"]'
      );
      firstInput?.focus({ preventScroll: true });
    }, 500);
  };

  const canShowResults = results.isValid;

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <Hero onStart={handleStart} />

      <main ref={calcRef} className="container-tool pb-12">
        <div className="space-y-5 sm:space-y-6">
          <GoalSection inputs={inputs} update={update} />
          <WarmDemandSection inputs={inputs} update={update} />
          <AudienceSection inputs={inputs} update={update} />
          <TimelineSection inputs={inputs} update={update} />
          <ConversionSection inputs={inputs} update={update} />
        </div>

        <AnimatePresence mode="wait">
          {canShowResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.45 }}
              className="mt-10 sm:mt-14 space-y-5 sm:space-y-6"
            >
              <Results inputs={inputs} results={results} update={update} />
              <SendReport inputs={inputs} results={results} />
              <SoftCTA />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-10 sm:mt-14 section-card text-center"
            >
              <div className="section-eyebrow justify-center">
                <span className="h-px w-6 bg-ink-200" />
                Forecast preview
                <span className="h-px w-6 bg-ink-200" />
              </div>
              <p className="mt-3 font-serif text-2xl sm:text-3xl text-ink-900 tracking-tightish">
                Your sold-out gap will appear here.
              </p>
              <p className="mt-2 text-[14px] text-ink-400 leading-relaxed max-w-md mx-auto">
                Add a revenue goal and an average order value to see your
                forecast. Everything else fine-tunes the numbers.
              </p>
              <button
                onClick={handleJumpToGoal}
                className="mt-5 btn-secondary"
                type="button"
              >
                Jump to the inputs
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
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
      <a
        href="#send-report"
        className="hidden sm:inline-flex text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
      >
        Send report →
      </a>
    </header>
  );
}
