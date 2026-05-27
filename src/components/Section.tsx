import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionProps {
  step: string;
  title: string;
  helper?: string;
  children: ReactNode;
  id?: string;
}

export function Section({ step, title, helper, children, id }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className="section-card"
    >
      <header className="mb-5 sm:mb-6">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent">
            {step}
          </span>
          <span className="h-px flex-1 bg-ink-100" aria-hidden />
        </div>
        <h2 className="mt-2 text-2xl sm:text-[28px] font-serif text-ink-900 tracking-tightish leading-tight">
          {title}
        </h2>
        {helper && (
          <p className="mt-1.5 text-[14px] text-ink-400 leading-relaxed">
            {helper}
          </p>
        )}
      </header>
      {children}
    </motion.section>
  );
}
