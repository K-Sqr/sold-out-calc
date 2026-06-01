import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { CalculatorInputs, CalculatorResults } from "../types";
import { buildPayload, isDemoMode, submitReport } from "../lib/reportSubmit";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}

export function SendReport({ inputs, results }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const demo = isDemoMode();
  const submitting = status === "submitting";
  const success = status === "success";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || trimmedEmail.length < 5) {
      setError("Please enter a valid email.");
      return;
    }

    setStatus("submitting");
    try {
      const payload = buildPayload(trimmedEmail, phone, inputs, results);
      await submitReport(payload);
      setStatus("success");
      setEmail("");
      setPhone("");
      // Reset success state after a few seconds so the form is reusable.
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <motion.section
      id="send-report"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400 font-medium">
            Report
          </p>
          <h3 className="mt-1 font-serif text-[26px] sm:text-3xl text-ink-900 leading-tight tracking-tightish">
            Want a copy of this forecast?
          </h3>
          <p className="mt-2 text-[14.5px] text-ink-400 leading-relaxed">
            Send your Sold-Out Gap Report to your inbox so you can revisit it
            before launch.
          </p>
          {demo && import.meta.env.DEV && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-warning bg-warning/10 border border-warning/25 rounded-full px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Demo mode — set VITE_REPORT_ENDPOINT_URL to capture leads
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label className="sr-only" htmlFor="report-email">
              Email
            </label>
            <input
              id="report-email"
              type="email"
              required
              placeholder="you@yourbrand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              autoComplete="email"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="report-phone">
              Phone (optional)
            </label>
            <input
              id="report-phone"
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-base"
              autoComplete="tel"
              disabled={submitting}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="text-[12.5px] text-danger"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || success}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Spinner />
                Sending…
              </>
            ) : success ? (
              <>
                <Check />
                Sent
              </>
            ) : (
              "Send My Report"
            )}
          </button>

          <AnimatePresence>
            {success && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="text-[13px] text-success flex items-center gap-1.5"
              >
                <Check />
                {demo
                  ? "Demo: form submitted (no email sent — endpoint not configured)."
                  : "Sent — check your inbox in a minute."}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.section>
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

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7.5l2.8 2.8L11 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
