import { motion } from "framer-motion";

export function SoftCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="relative overflow-hidden rounded-3xl bg-ink-900 text-cream-50 p-7 sm:p-10 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(194,86,42,0.45), transparent 55%)",
        }}
      />
      <div className="relative max-w-xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.22em] text-cream-100/70 font-medium">
          Next Step
        </p>
        <h3 className="mt-3 font-serif text-[28px] sm:text-[34px] leading-tight tracking-tightish">
          Want to know what's actually capping your drops?
        </h3>
        <p className="mt-3 text-[15px] text-cream-100/75 leading-relaxed">
          Take the Sold-Out Stage Diagnostic — a few questions about your drop
          economics, and we'll map your stage and likely growth bottleneck.
        </p>
        <a
          href="/diagnostic"
          className="mt-6 inline-flex items-center gap-2 bg-cream-50 text-ink-900 px-6 py-3.5 rounded-full font-medium text-[15px] hover:bg-white transition-colors duration-200 group"
        >
          Take the Stage Diagnostic
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
        </a>
      </div>
    </motion.section>
  );
}
