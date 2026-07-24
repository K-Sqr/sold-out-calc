import { motion } from "framer-motion";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative pt-14 sm:pt-20 pb-12 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="container-tool text-center"
      >
        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ink-400 font-medium">
          <span className="h-px w-6 bg-ink-200" aria-hidden />
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            A free tool by Sold-Out Labs
          </span>
          <span className="h-px w-6 bg-ink-200" aria-hidden />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-8 font-serif text-[44px] leading-[1.05] sm:text-[68px] sm:leading-[1.02] tracking-tighter2 text-ink-900 pb-1"
        >
          How far are you from{" "}
          <span className="editorial-em whitespace-nowrap">a sold-out drop?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-5 mx-auto max-w-xl text-[16px] sm:text-[17px] text-ink-400 leading-relaxed"
        >
          Enter a few quick numbers and we'll show how many warm buyers you're
          missing before launch day — in under 60 seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-9 flex items-center justify-center gap-4 flex-wrap"
        >
          <button onClick={onStart} className="btn-primary group">
            Calculate My Sold-Out Gap
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
              <path
                d="M7 4v3.2L9 8.4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            ~60 seconds · no signup
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 sm:mt-20 flex items-center justify-center"
          aria-hidden
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-400">
            <span className="h-px w-8 bg-ink-100" />
            <span>Start with your goal</span>
            <span className="h-px w-8 bg-ink-100" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
