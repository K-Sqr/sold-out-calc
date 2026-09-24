import { useEffect, useMemo, useRef, useState } from "react";
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
  STAGE_ROADMAPS,
  type ScoreLevel,
  type SnapshotMode,
} from "./constants";
import { buildShareUrl } from "./encode";
import { emptySnapshot, type SnapshotData } from "./types";
import { SnapshotView } from "./SnapshotView";
import {
  SHEET,
  fetchSubmissions,
  getStoredKey,
  isReviewed,
  rowToSnapshot,
  saveReview,
  setStoredKey,
  submissionsEndpoint,
  toSheetValues,
  type SubmissionRow,
} from "./load";

/**
 * Internal review + snapshot builder.
 *
 * The team reviews a submission, assigns/edits every routing field (all
 * manually overridable), scores the 10 categories, then generates a clean
 * founder-facing snapshot link — either the default "engine" snapshot or a
 * "stage roadmap" for founders who aren't a fit yet.
 *
 * Persistence: the review is saved back onto the submission's sheet row
 * ("Save review to sheet"), and the in-progress draft is autosaved to this
 * browser so a refresh never loses scoring.
 */

/** Which sheet row (if any) the current draft was loaded from. */
interface LoadedRow {
  rowIndex: number;
  timestamp: string;
}

const DRAFT_STORAGE = "snapshot_draft";

interface Draft {
  data: SnapshotData;
  loadedRow: LoadedRow | null;
  savedAt: string;
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    // Merge over defaults so new fields added later never come back undefined.
    return {
      data: { ...emptySnapshot(), ...parsed.data },
      loadedRow: parsed.loadedRow ?? null,
      savedAt: parsed.savedAt ?? "",
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft | null): void {
  try {
    if (draft) localStorage.setItem(DRAFT_STORAGE, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_STORAGE);
  } catch {
    /* ignore storage failures */
  }
}

const CTA_PRESET_LABELS: string[] = Object.values(CTA_PRESETS).map((p) => p.label);

export function SnapshotBuilder({ initial }: { initial: SnapshotData | null }) {
  // Restore an unsaved draft only when we weren't handed a link to edit.
  const restored = useMemo(() => (initial ? null : readDraft()), [initial]);

  const [data, setData] = useState<SnapshotData>(
    () => initial ?? restored?.data ?? emptySnapshot()
  );
  const [loadedRow, setLoadedRow] = useState<LoadedRow | null>(
    () => restored?.loadedRow ?? null
  );
  const [restoredNotice, setRestoredNotice] = useState<boolean>(!!restored);
  const [copied, setCopied] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string>("");

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

  // Switching snapshot type swaps the CTA preset — only if the CTA is still a
  // preset (a hand-edited CTA is left alone).
  const setMode = (mode: SnapshotMode) => {
    setData((prev) => {
      const next = { ...prev, mode };
      if (CTA_PRESET_LABELS.includes(prev.ctaLabel)) {
        const preset = mode === "roadmap" ? CTA_PRESETS.roadmap : CTA_PRESETS.book;
        next.ctaLabel = preset.label;
        next.ctaNote = preset.note;
        next.ctaUrl = preset.url;
      }
      return next;
    });
  };

  const applyCtaPreset = (preset: { label: string; note: string; url: string }) => {
    set("ctaLabel", preset.label);
    set("ctaNote", preset.note);
    set("ctaUrl", preset.url);
  };

  const shareUrl = useMemo(() => buildShareUrl(data), [data]);

  // --- Local autosave (debounced) -------------------------------------------
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      writeDraft({ data, loadedRow, savedAt: new Date().toISOString() });
    }, 400);
    return () => window.clearTimeout(t);
  }, [data, loadedRow]);

  // Any edit after a save means the sheet is stale again.
  useEffect(() => {
    setSaveState((s) => (s === "saved" ? "idle" : s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const discardDraft = () => {
    writeDraft(null);
    setData(emptySnapshot());
    setLoadedRow(null);
    setRestoredNotice(false);
  };

  const pickRow = (row: SubmissionRow) => {
    setData(rowToSnapshot(row));
    setLoadedRow({ rowIndex: row.rowIndex, timestamp: row.timestamp });
    setRestoredNotice(false);
    setSaveState("idle");
    setSaveError("");
  };

  // --- Save review to sheet -------------------------------------------------
  const canSave = !!submissionsEndpoint() && !!loadedRow;

  const save = async () => {
    if (!loadedRow) return;
    const key = getStoredKey();
    if (!key) {
      setSaveState("error");
      setSaveError("Enter your team access key (in Load a submission) first.");
      return;
    }
    setSaveState("saving");
    setSaveError("");
    try {
      await saveReview(key, loadedRow.rowIndex, toSheetValues(data, shareUrl));
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Could not save review");
    }
  };

  const flash = (id: string) => {
    setCopied(id);
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  };

  const copy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) flash(id);
  };

  const openFounderView = () => window.open(shareUrl, "_blank", "noopener");

  const isRoadmap = data.mode === "roadmap";
  const roadmapKnown = !!STAGE_ROADMAPS[data.stage];

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
            founder, and save your review back to the sheet.
          </p>
        </div>

        {restoredNotice && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-2.5 text-[13px] text-ink-800">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
            Restored your unsaved draft
            {restored?.savedAt ? ` from ${formatTs(restored.savedAt)}` : ""}
            {loadedRow ? ` (sheet row ${loadedRow.rowIndex})` : ""}.
            <button
              type="button"
              className="btn-ghost text-[12.5px] underline-offset-2 hover:underline"
              onClick={discardDraft}
            >
              Discard and start fresh
            </button>
            <button
              type="button"
              className="btn-ghost text-[12.5px] ml-auto"
              onClick={() => setRestoredNotice(false)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-6 lg:gap-8 items-start">
          {/* ---------------- Left: editable form ---------------- */}
          <div className="space-y-6">
            <LoadFromSheet onPick={pickRow} activeRow={loadedRow?.rowIndex ?? null} />

            <Panel title="Founder-facing snapshot" step="01">
              <div className="mb-5">
                <p className="field-label">Snapshot type</p>
                <div className="flex flex-wrap gap-2">
                  <PresetButton active={!isRoadmap} onClick={() => setMode("engine")}>
                    Engine recommendation
                  </PresetButton>
                  <PresetButton active={isRoadmap} onClick={() => setMode("roadmap")}>
                    Stage roadmap (not a fit yet)
                  </PresetButton>
                </div>
                <p className="field-helper">
                  {isRoadmap
                    ? "A “good luck” page: their current stage, what the next stage looks like, and a concise roadmap to get there. No engine pitch."
                    : "The default: likely bottleneck, strongest lever, and the recommended Sold-Out Engine."}
                </p>
              </div>

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
                {isRoadmap && data.stage && !roadmapKnown && (
                  <p className="sm:col-span-2 -mt-2 text-[12.5px] text-warning">
                    No roadmap copy exists for “{data.stage}” — pick one of the
                    standard stages, or add it to STAGE_ROADMAPS in constants.ts.
                  </p>
                )}
                <TextField
                  label="Current revenue / drop range"
                  value={data.currentRevenue}
                  onChange={(v) => set("currentRevenue", v)}
                  placeholder="e.g. $25K – $50K"
                  list="rev-suggestions"
                  half
                />
                {!isRoadmap && (
                  <>
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
                  </>
                )}
                {isRoadmap && (
                  <TextArea
                    label="Personal note (founder-facing, optional)"
                    value={data.roadmapNote}
                    onChange={(v) => set("roadmapNote", v)}
                    placeholder="One line from you — e.g. “Your waitlist idea is the right instinct; start there.”"
                  />
                )}
              </Grid>

              <div className="mt-5 border-t border-ink-100 pt-5">
                <p className="field-label">Call-to-action</p>
                <div className="flex flex-wrap gap-2">
                  <PresetButton
                    active={data.ctaLabel === CTA_PRESETS.book.label}
                    onClick={() => applyCtaPreset(CTA_PRESETS.book)}
                  >
                    Book a call
                  </PresetButton>
                  <PresetButton
                    active={data.ctaLabel === CTA_PRESETS.review.label}
                    onClick={() => applyCtaPreset(CTA_PRESETS.review)}
                  >
                    We'll review &amp; follow up
                  </PresetButton>
                  <PresetButton
                    active={data.ctaLabel === CTA_PRESETS.roadmap.label}
                    onClick={() => applyCtaPreset(CTA_PRESETS.roadmap)}
                  >
                    Re-take later (roadmap)
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
                  the bottleneck. Saved to the sheet with the review.{" "}
                  <a
                    href="/snapshot?guide=1"
                    target="_blank"
                    rel="noopener"
                    className="text-accent-ink underline underline-offset-2 hover:text-ink-900"
                  >
                    How the auto-scoring works
                  </a>
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
                <span className="section-eyebrow">
                  Founder preview · {isRoadmap ? "Stage roadmap" : "Engine"}
                </span>
                <span className="text-[11px] text-ink-400">Live</span>
              </div>
              <div className="max-h-[62vh] overflow-y-auto bg-cream-50">
                <SnapshotView data={data} embedded />
              </div>
            </div>

            <div className="section-card !p-5 space-y-3">
              <p className="section-eyebrow">Save &amp; share</p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-primary !py-2.5 flex-1"
                  onClick={save}
                  disabled={!canSave || saveState === "saving"}
                  title={
                    !submissionsEndpoint()
                      ? "Set VITE_DIAGNOSTIC_ENDPOINT_URL to save reviews"
                      : !loadedRow
                        ? "Load a submission first so we know which row to save to"
                        : "Write this review onto the submission's sheet row"
                  }
                >
                  {saveState === "saving"
                    ? "Saving…"
                    : saveState === "saved"
                      ? "Saved to sheet ✓"
                      : "Save review to sheet"}
                </button>
                {loadedRow && (
                  <span className="text-[11.5px] text-ink-400 whitespace-nowrap">
                    Row {loadedRow.rowIndex}
                  </span>
                )}
              </div>
              {!loadedRow && submissionsEndpoint() && (
                <p className="text-[12px] text-ink-400 -mt-1">
                  Load a submission above to enable saving. Your draft is still
                  autosaved in this browser.
                </p>
              )}
              {saveState === "error" && (
                <p className="text-[12.5px] text-danger -mt-1">{saveError}</p>
              )}

              <div className="flex items-stretch gap-2 pt-1">
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
                  className="btn-secondary !py-2.5 flex-1"
                  onClick={openFounderView}
                >
                  Open founder view
                </button>
                <button
                  type="button"
                  className="btn-secondary !py-2.5"
                  onClick={() => copy(buildSheetRow(data, shareUrl), "row")}
                  title="Tab-separated internal columns for pasting into the Google Sheet"
                >
                  {copied === "row" ? "Copied" : "Copy sheet row"}
                </button>
              </div>
              <p className="field-helper">
                The link carries only the founder-facing fields. Internal notes,
                fit score, and the scorecard stay with the team (and the sheet).
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
 * Tab-separated internal columns in the sheet's column order (INTERNAL_COLUMNS
 * in DiagnosticCode.gs), so the team can paste a reviewed row by hand if the
 * endpoint isn't wired. Uses the same header -> value map as "Save review".
 */
function buildSheetRow(d: SnapshotData, shareUrl: string): string {
  const values = toSheetValues(d, shareUrl);
  const order = [
    SHEET.stage,
    SHEET.paidFitScore,
    SHEET.revenueGap,
    SHEET.primaryLever,
    "Primary Bottleneck", // auto-scored label; left for the algorithm
    SHEET.secondaryBottleneck,
    SHEET.engine,
    SHEET.fitStatus,
    SHEET.notes,
    SHEET.nextStep,
    SHEET.followUp,
    SHEET.strongestLever,
    SHEET.scorecard,
    SHEET.mode,
    SHEET.link,
  ];
  return order.map((h) => values[h] ?? "").join("\t");
}

// ---------------- Load from sheet ----------------

function LoadFromSheet({
  onPick,
  activeRow,
}: {
  onPick: (row: SubmissionRow) => void;
  activeRow: number | null;
}) {
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
          load submissions directly from the sheet and save reviews back. For
          now, fill the fields below by hand or paste from the sheet — your
          draft is autosaved in this browser.
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
            Reviewed rows come back with their saved scoring.
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
            const reviewed = isReviewed(row);
            const active = row.rowIndex === activeRow;
            return (
              <li key={row.rowIndex}>
                <button
                  type="button"
                  onClick={() => onPick(row)}
                  className={
                    "w-full text-left py-2.5 px-1 transition-colors flex items-center justify-between gap-3 " +
                    (active ? "bg-cream-50" : "hover:bg-cream-50")
                  }
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-[13.5px] text-ink-900 font-medium truncate">
                      {brand}
                    </span>
                    {reviewed && (
                      <span className="shrink-0 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10.5px] uppercase tracking-[0.12em] text-success">
                        Reviewed
                      </span>
                    )}
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
      <div className="hidden sm:flex items-center gap-5">
        <a
          href="/snapshot?guide=1"
          className="text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
        >
          How scoring works
        </a>
        <a
          href="/diagnostic"
          className="text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
        >
          Stage Diagnostic →
        </a>
      </div>
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <label className="field-label">{label}</label>
      <textarea
        className="input-base min-h-[84px] resize-y leading-relaxed"
        value={value}
        placeholder={placeholder}
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
