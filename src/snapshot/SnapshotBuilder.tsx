import { useMemo, useState } from "react";
import { copyToClipboard } from "../lib/utils";
import {
  BOTTLENECK_OPTIONS,
  CTA_PRESETS,
  ENGINE_OPTIONS,
  FIT_STATUS_OPTIONS,
  FOLLOW_UP_OPTIONS,
  LEVER_TO_ENGINE,
  REVENUE_RANGE_SUGGESTIONS,
  SCORE_CATEGORIES,
  SCORE_LEVELS,
  STAGE_OPTIONS,
  type ScoreLevel,
} from "./constants";
import { buildShareUrl } from "./encode";
import { emptySnapshot, type SnapshotData } from "./types";
import { SnapshotView } from "./SnapshotView";
import {
  fetchSubmissions,
  getStoredKey,
  rowToSnapshot,
  setStoredKey,
  submissionsEndpoint,
  type SubmissionRow,
} from "./load";

/**
 * Internal review + snapshot builder.
 *
 * The team reviews a submission, assigns/edits every routing field (all
 * manually overridable), scores the 10 categories, then generates a clean
 * founder-facing snapshot link. Nothing here is locked to automation — the
 * diagnostic logic is still being validated.
 */
export function SnapshotBuilder({ initial }: { initial: SnapshotData | null }) {
  const [data, setData] = useState<SnapshotData>(
    () => initial ?? emptySnapshot()
  );
  const [copied, setCopied] = useState<string | null>(null);

  const set = <K extends keyof SnapshotData>(key: K, value: SnapshotData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setScore = (key: string, level: ScoreLevel) =>
    setData((prev) => ({ ...prev, scores: { ...prev.scores, [key]: level } }));

  // Picking a primary bottleneck suggests an engine, but never forces it.
  const setPrimaryBottleneck = (value: string) => {
    setData((prev) => {
      const suggested = LEVER_TO_ENGINE[value];
      const shouldSuggest =
        suggested &&
        (!prev.recommendedEngine ||
          Object.values(LEVER_TO_ENGINE).includes(prev.recommendedEngine));
      return {
        ...prev,
        primaryBottleneck: value,
        recommendedEngine: shouldSuggest ? suggested : prev.recommendedEngine,
      };
    });
  };

  const shareUrl = useMemo(() => buildShareUrl(data), [data]);

  const flash = (id: string) => {
    setCopied(id);
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };

  const copy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) flash(id);
  };

  const openFounderView = () => window.open(shareUrl, "_blank", "noopener");

  return (
    <div className="relative z-10 min-h-screen">
      <BuilderHeader />

      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8 pb-20">
        <div className="pt-10 sm:pt-12">
          <span className="section-eyebrow">
            <span className="inline-block h-1 w-1 rounded-full bg-accent" />
            Internal · Snapshot Generator
          </span>
          <h1 className="mt-3 font-serif text-[30px] sm:text-[38px] tracking-tighter2 text-ink-900 leading-tight">
            Review &amp; build a <span className="editorial-em">Sold-Out</span>{" "}
            Snapshot
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] text-ink-400 leading-relaxed">
            Assign or edit the stage, fit, bottleneck, and recommended engine —
            everything is manually overridable while the diagnostic logic is
            still being validated. Then generate a clean link to send the
            founder.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-6 lg:gap-8 items-start">
          {/* ---------------- Left: editable form ---------------- */}
          <div className="space-y-6">
            <LoadFromSheet onPick={(row) => setData(rowToSnapshot(row))} />

            <Panel title="Founder-facing snapshot" step="01">
              <Grid>
                <TextField
                  label="Brand name"
                  value={data.brandName}
                  onChange={(v) => set("brandName", v)}
                  placeholder="e.g. Atelier North"
                />
                <SelectField
                  label="Estimated stage"
                  value={data.stage}
                  options={STAGE_OPTIONS}
                  onChange={(v) => set("stage", v)}
                />
                <TextField
                  label="Current revenue / drop range"
                  value={data.currentRevenue}
                  onChange={(v) => set("currentRevenue", v)}
                  placeholder="e.g. $25K – $50K"
                  list="rev-suggestions"
                  half
                />
                <TextField
                  label="Target revenue goal"
                  value={data.targetRevenue}
                  onChange={(v) => set("targetRevenue", v)}
                  placeholder="e.g. $80K"
                  half
                />
                <TextField
                  label="Revenue gap"
                  value={data.revenueGap}
                  onChange={(v) => set("revenueGap", v)}
                  placeholder="e.g. +$35K"
                  half
                />
                <SelectField
                  label="Primary bottleneck"
                  value={data.primaryBottleneck}
                  options={BOTTLENECK_OPTIONS}
                  onChange={setPrimaryBottleneck}
                  half
                />
                <SelectField
                  label="Secondary bottleneck"
                  value={data.secondaryBottleneck}
                  options={BOTTLENECK_OPTIONS}
                  onChange={(v) => set("secondaryBottleneck", v)}
                  half
                />
                <SelectField
                  label="Strongest current lever"
                  value={data.strongestLever}
                  options={BOTTLENECK_OPTIONS}
                  onChange={(v) => set("strongestLever", v)}
                  half
                />
                <SelectField
                  label="Recommended Sold-Out Engine"
                  value={data.recommendedEngine}
                  options={ENGINE_OPTIONS}
                  onChange={(v) => set("recommendedEngine", v)}
                />
                <TextArea
                  label="Simple next step (founder-facing)"
                  value={data.nextStep}
                  onChange={(v) => set("nextStep", v)}
                />
              </Grid>

              <div className="mt-5 border-t border-ink-100 pt-5">
                <p className="field-label">Call-to-action</p>
                <div className="flex flex-wrap gap-2">
                  <PresetButton
                    active={data.ctaLabel === CTA_PRESETS.book.label}
                    onClick={() => {
                      set("ctaLabel", CTA_PRESETS.book.label);
                      set("ctaNote", CTA_PRESETS.book.note);
                      set("ctaUrl", CTA_PRESETS.book.url);
                    }}
                  >
                    Book a call
                  </PresetButton>
                  <PresetButton
                    active={data.ctaLabel === CTA_PRESETS.review.label}
                    onClick={() => {
                      set("ctaLabel", CTA_PRESETS.review.label);
                      set("ctaNote", CTA_PRESETS.review.note);
                      set("ctaUrl", CTA_PRESETS.review.url);
                    }}
                  >
                    We'll review &amp; follow up
                  </PresetButton>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <TextField
                    label="CTA label"
                    value={data.ctaLabel}
                    onChange={(v) => set("ctaLabel", v)}
                  />
                  <TextField
                    label="CTA link (mailto: or https:// — leave blank for no link)"
                    value={data.ctaUrl}
                    onChange={(v) => set("ctaUrl", v)}
                    placeholder="mailto:toulzoned@gmail.com or https://calendly.com/…"
                  />
                  <TextField
                    label="CTA sub-note"
                    value={data.ctaNote}
                    onChange={(v) => set("ctaNote", v)}
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Internal scoring & routing" step="02" subtle>
              <Grid>
                <TextField
                  label="Paid Fit Score"
                  value={data.paidFitScore}
                  onChange={(v) => set("paidFitScore", v)}
                  placeholder="0–100 or Weak / Moderate / Strong"
                  half
                />
                <SelectField
                  label="Fit status"
                  value={data.fitStatus}
                  options={FIT_STATUS_OPTIONS}
                  onChange={(v) => set("fitStatus", v)}
                  half
                />
                <SelectField
                  label="Follow-up status"
                  value={data.followUpStatus}
                  options={FOLLOW_UP_OPTIONS}
                  onChange={(v) => set("followUpStatus", v)}
                  half
                />
                <TextArea
                  label="Internal notes (never shared with founder)"
                  value={data.internalNotes}
                  onChange={(v) => set("internalNotes", v)}
                />
              </Grid>

              <div className="mt-5 border-t border-ink-100 pt-5">
                <p className="field-label">Category scorecard</p>
                <p className="field-helper -mt-1 mb-3">
                  Quick read across each growth lever. No lever is assumed to be
                  the bottleneck.
                </p>
                <div className="space-y-2">
                  {SCORE_CATEGORIES.map((cat) => (
                    <ScoreRow
                      key={cat.key}
                      label={cat.label}
                      value={data.scores[cat.key] ?? ""}
                      onChange={(lvl) => setScore(cat.key, lvl)}
                    />
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* ---------------- Right: preview + share ---------------- */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100">
                <span className="section-eyebrow">Founder preview</span>
                <span className="text-[11px] text-ink-400">Live</span>
              </div>
              <div className="max-h-[62vh] overflow-y-auto bg-cream-50">
                <SnapshotView data={data} embedded />
              </div>
            </div>

            <div className="section-card !p-5 space-y-3">
              <p className="section-eyebrow">Share</p>
              <div className="flex items-stretch gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="input-base !py-2.5 !text-[12.5px] flex-1 text-ink-400"
                  aria-label="Shareable snapshot link"
                />
                <button
                  type="button"
                  className="btn-secondary !px-4 whitespace-nowrap"
                  onClick={() => copy(shareUrl, "link")}
                >
                  {copied === "link" ? "Copied" : "Copy link"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary !py-2.5 flex-1"
                  onClick={openFounderView}
                >
                  Open founder view
                </button>
                <button
                  type="button"
                  className="btn-secondary !py-2.5"
                  onClick={() => copy(buildSheetRow(data), "row")}
                  title="Tab-separated internal columns for pasting into the Google Sheet"
                >
                  {copied === "row" ? "Copied" : "Copy sheet row"}
                </button>
              </div>
              <p className="field-helper">
                The link carries only the founder-facing fields. Internal notes,
                fit score, and the scorecard stay with the team.
              </p>
            </div>
          </div>
        </div>
      </main>

      <datalist id="rev-suggestions">
        {REVENUE_RANGE_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

/**
 * Tab-separated internal columns matching the Google Sheet order, so the team
 * can paste a reviewed row straight into the sheet.
 */
function buildSheetRow(d: SnapshotData): string {
  const scoreSummary = SCORE_CATEGORIES.map(
    (c) => `${c.label}: ${d.scores[c.key] || "—"}`
  ).join("; ");
  return [
    d.stage,
    d.paidFitScore,
    d.revenueGap,
    d.strongestLever,
    d.primaryBottleneck,
    d.secondaryBottleneck,
    d.recommendedEngine,
    d.fitStatus,
    `${d.internalNotes}${d.internalNotes ? " | " : ""}${scoreSummary}`,
    d.nextStep,
    d.followUpStatus,
  ].join("\t");
}

// ---------------- Load from sheet ----------------

function LoadFromSheet({ onPick }: { onPick: (row: SubmissionRow) => void }) {
  const [rows, setRows] = useState<SubmissionRow[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [key, setKey] = useState<string>(() => getStoredKey());
  const [showKey, setShowKey] = useState(false);

  if (!submissionsEndpoint()) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-100 bg-cream-100/50 px-5 py-4">
        <p className="text-[13px] text-ink-400 leading-relaxed">
          <span className="text-ink-800 font-medium">Manual mode.</span> Set{" "}
          <code className="text-[12px]">VITE_DIAGNOSTIC_ENDPOINT_URL</code> to
          load submissions directly from the sheet. For now, fill the fields
          below by hand or paste from the sheet.
        </p>
      </div>
    );
  }

  const load = async () => {
    if (!key.trim()) {
      setStatus("error");
      setError("Enter your team access key to load submissions.");
      return;
    }
    setStatus("loading");
    setError("");
    setStoredKey(key.trim());
    try {
      const list = await fetchSubmissions(key.trim());
      setRows(list);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not load submissions");
    }
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-ink-900">
            Load a diagnostic submission
          </p>
          <p className="text-[12.5px] text-ink-400">
            Team only · pull recent rows from the sheet to pre-fill the fields.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary !py-2 whitespace-nowrap"
          onClick={load}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading…" : rows ? "Refresh" : "Load"}
        </button>
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <input
          type={showKey ? "text" : "password"}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Team access key"
          autoComplete="off"
          className="input-base !py-2.5 !text-[13px] flex-1"
          aria-label="Team access key"
          onKeyDown={(e) => {
            if (e.key === "Enter") load();
          }}
        />
        <button
          type="button"
          className="btn-ghost px-2 text-[12px]"
          onClick={() => setShowKey((s) => !s)}
        >
          {showKey ? "Hide" : "Show"}
        </button>
      </div>
      <p className="mt-1.5 text-[11.5px] text-ink-400">
        Remembered in this browser only. Never included in a founder link.
      </p>

      {status === "error" && (
        <p className="mt-3 text-[12.5px] text-danger">{error}</p>
      )}

      {rows && rows.length === 0 && status !== "error" && (
        <p className="mt-3 text-[12.5px] text-ink-400">
          No submissions found yet.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ul className="mt-3 max-h-56 overflow-y-auto divide-y divide-ink-100 border-t border-ink-100">
          {rows.map((row) => {
            const brand =
              row.values["Brand name"] || row.values["Brand"] || "Untitled";
            return (
              <li key={row.rowIndex}>
                <button
                  type="button"
                  onClick={() => onPick(row)}
                  className="w-full text-left py-2.5 px-1 hover:bg-cream-50 transition-colors flex items-center justify-between gap-3"
                >
                  <span className="text-[13.5px] text-ink-900 font-medium truncate">
                    {brand}
                  </span>
                  <span className="text-[11.5px] text-ink-400 whitespace-nowrap">
                    {formatTs(row.timestamp)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatTs(ts: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------- Small building blocks ----------------

function BuilderHeader() {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
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
        href="/diagnostic"
        className="hidden sm:inline-flex text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
      >
        Stage Diagnostic →
      </a>
    </header>
  );
}

function Panel({
  title,
  step,
  subtle,
  children,
}: {
  title: string;
  step: string;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={subtle ? "section-card bg-cream-100/40" : "section-card"}>
      <div className="flex items-baseline gap-2.5 mb-5">
        <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent">
          {step}
        </span>
        <h2 className="text-[17px] font-medium text-ink-900 tracking-tightish">
          {title}
        </h2>
        <span className="h-px flex-1 bg-ink-100" aria-hidden />
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  half,
  list,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  half?: boolean;
  list?: string;
}) {
  return (
    <div className={half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label className="field-label">{label}</label>
      <input
        className="input-base"
        value={value}
        placeholder={placeholder}
        list={list}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="field-label">{label}</label>
      <textarea
        className="input-base min-h-[84px] resize-y leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  half,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  half?: boolean;
}) {
  // Keep any loaded/overridden value even if it isn't in the preset list.
  const opts =
    value && !options.includes(value) ? [value, ...options] : [...options];
  return (
    <div className={half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label className="field-label">{label}</label>
      <select
        className="input-base appearance-none bg-white pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' stroke='%236B6864' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.9rem center",
        }}
      >
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ScoreLevel;
  onChange: (v: ScoreLevel) => void;
}) {
  const levels = SCORE_LEVELS.filter((l) => l !== "");
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13.5px] text-ink-800">{label}</span>
      <div className="inline-flex rounded-full border border-ink-100 bg-white p-0.5">
        {levels.map((lvl) => {
          const active = value === lvl;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange(active ? "" : lvl)}
              className={
                "px-3 py-1 rounded-full text-[12px] font-medium transition-colors " +
                (active
                  ? "bg-ink-900 text-cream-50"
                  : "text-ink-400 hover:text-ink-900")
              }
            >
              {lvl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PresetButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors " +
        (active
          ? "border-ink-900 bg-ink-900 text-cream-50"
          : "border-ink-100 text-ink-600 hover:border-ink-800")
      }
    >
      {children}
    </button>
  );
}
