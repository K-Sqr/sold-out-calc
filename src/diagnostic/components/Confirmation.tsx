import { motion } from "framer-motion";

/**
 * Only team members ever see the internal "Build snapshot" shortcut: it renders
 * exclusively when the shared access key has been saved in this browser (set in
 * the /snapshot builder). Founders never have that key, so they never see it.
 */
function hasTeamAccess(): boolean {
  try {
    return !!localStorage.getItem("snapshot_list_key");
  } catch {
    return false;
  }
}

export function Confirmation() {
  const isTeam = hasTeamAccess();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="section-card text-center"
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink-900 text-cream-50">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M5 11.5l4 4L17 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="section-eyebrow justify-center mt-6">
        <span className="h-px w-6 bg-ink-200" />
        Submitted
        <span className="h-px w-6 bg-ink-200" />
      </div>

      <h2 className="mt-3 font-serif text-[30px] sm:text-[38px] leading-[1.08] tracking-tightish text-ink-900">
        Your Sold-Out Stage Diagnostic
        <br className="hidden sm:block" /> has been{" "}
        <span className="editorial-em">submitted.</span>
      </h2>

      <p className="mt-4 mx-auto max-w-lg text-[15px] sm:text-[16px] text-ink-400 leading-relaxed">
        We'll review your drop economics, offer, attention, demand, launch, and
        retention signals to identify your current stage and likely growth
        bottleneck. If there's a fit, we'll send back the recommended Sold-Out
        Engine for your next revenue stage.
      </p>

      <div className="mt-7 flex items-center justify-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400 flex items-center gap-2">
          <span className="h-px w-8 bg-ink-100" />
          The Sold-Out System
          <span className="h-px w-8 bg-ink-100" />
        </span>
      </div>

      {isTeam && (
        <div className="mt-6 border-t border-ink-100 pt-5">
          <a
            href="/snapshot"
            className="btn-secondary !py-2 text-[12.5px]"
          >
            Team · Build snapshot
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
      )}
    </motion.div>
  );
}
