import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  title: string;
}

export function ProgressBar({ current, total, title }: ProgressBarProps) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent">
          Step {current + 1} of {total}
        </span>
        <span className="text-[12px] tracking-tightish text-ink-400 truncate">
          {title}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <motion.div
          className="h-full rounded-full bg-ink-900"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
