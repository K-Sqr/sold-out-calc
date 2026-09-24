import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { SCORE_CATEGORIES } from "./constants";
import {
  BOTTLENECK_ROUTES,
  DROP_MIDPOINTS,
  FIT_STATUSES,
  FIT_THRESHOLDS,
  FLAT_SIGNALS,
  GUIDE_PRESETS,
  LIST_TIERS,
  MARGIN_POINTS,
  MAX_SCORE,
  MONTHLY_BANDS,
  emptyScoringInput,
  scoreDiagnostic,
  type ScoringInput,
} from "./scoring";

const ease = [0.22, 0.61, 0.36, 1] as const;

/**
 * "How the scoring works" — the shared explainer for everything the system
 * works out on its own: stage, fit score, fit status, revenue gap, and the
 * bottleneck routing. Lives at /snapshot?guide=1.
 *
 * Two rules this page follows:
 *  1. Every table is generated from the constants in `scoring.ts`, so the
 *     numbers on screen can't drift from the numbers being applied.
 *  2. Nothing here is presented as a verdict. The automation is a first draft;
 *     the section on the human layer says so explicitly.
 */
export function ScoringGuide() {
  return (
    <div className="relative z-10 min-h-screen">
      <GuideHeader />

      <main className="mx-auto w-full max-w-4xl px-5 sm:px-8 pb-24">
        <Hero />
        <Contents />

        <div className="mt-14 space-y-14">
          <Pipeline />
          <StageSection />
          <ScoreSection />
          <FitStatusSection />
          <RevenueGapSection />
          <RoutingSection />
          <LiveExample />
          <HumanLayer />
          <WhereToChange />
        </div>
      </main>

      <footer className="mx-auto w-full max-w-4xl px-5 sm:px-8 pb-10 text-center">
        <p className="text-[11.5px] text-ink-400">
          The Sold-Out System · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

// ---------------- Page furniture ----------------

function GuideHeader() {
  return (
    <header className="mx-auto w-full max-w-4xl px-5 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
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
        href="/snapshot"
        className="hidden sm:inline-flex text-[12.5px] tracking-tightish text-ink-400 hover:text-ink-900 transition-colors"
      >
        ← Snapshot builder
      </a>
    </header>
  );
}

function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="pt-12 sm:pt-16"
    >
      <span className="section-eyebrow">
        <span className="inline-block h-1 w-1 rounded-full bg-accent" />
        Internal · Reference
      </span>
      <h1 className="mt-3 font-serif text-[36px] sm:text-[52px] leading-[1.04] tracking-tighter2 text-ink-900 pb-1">
        How the <span className="editorial-em">scoring</span> works
      </h1>
      <p className="mt-5 max-w-2xl text-[16px] sm:text-[17px] text-ink-400 leading-relaxed">
        Everything the Stage Diagnostic works out on its own — the stage, the
        fit score, the fit status, the revenue gap, and which engine gets
        recommended — explained in full, with a calculator at the bottom you can
        run real numbers through.
      </p>

      <div className="mt-7 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4">
        <p className="text-[14.5px] text-ink-800 leading-relaxed">
          <span className="font-medium">The one thing to take away:</span> every
          number on this page is a <em>first draft</em>. It runs automatically so
          nobody starts from a blank page — then a person reviews it and can
          change any of it before a founder sees anything. Nothing auto-sends.
        </p>
      </div>
    </motion.section>
  );
}

const SECTIONS = [
  { id: "pipeline", label: "What happens on submission" },
  { id: "stage", label: "Estimated Stage" },
  { id: "score", label: "Paid Fit Score" },
  { id: "fit", label: "Fit Status" },
  { id: "gap", label: "Revenue Gap" },
  { id: "routing", label: "Bottleneck → Engine" },
  { id: "live", label: "Try it yourself" },
  { id: "human", label: "What the system doesn't decide" },
  { id: "change", label: "Where to change it" },
];

function Contents() {
  return (
    <nav className="mt-10 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-soft">
      <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400 font-medium">
        On this page
      </p>
      <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group flex items-baseline gap-2.5 text-[14px] text-ink-800 hover:text-accent-ink transition-colors py-0.5"
            >
              <span className="text-[11px] tabular-nums text-ink-200 group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="group-hover:underline underline-offset-2">
                {s.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-accent whitespace-nowrap">
          {eyebrow}
        </span>
        <span className="h-px flex-1 bg-ink-100" aria-hidden />
      </div>
      <h2 className="mt-3 font-serif text-[26px] sm:text-[32px] text-ink-900 tracking-tightish leading-tight">
        {title}
      </h2>
      {lead && (
        <p className="mt-3 text-[15.5px] text-ink-400 leading-relaxed max-w-2xl">
          {lead}
        </p>
      )}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Table({
  headers,
  rows,
  align,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  /** Per-column alignment; defaults to left. */
  align?: ("left" | "right")[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="bg-cream-100/60">
            {headers.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn(
                  "px-4 py-3 text-[11px] uppercase tracking-[0.14em] font-medium text-ink-400 border-b border-ink-100 whitespace-nowrap",
                  align?.[i] === "right" ? "text-right" : "text-left"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-ink-100 last:border-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    "px-4 py-3 text-ink-800 align-top leading-snug",
                    align?.[c] === "right" && "text-right tabular-nums"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-cream-100/40 px-5 py-4">
      <p className="text-[14px] text-ink-800 leading-relaxed">{children}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-cream-100 px-1.5 py-0.5 text-[13px] text-accent-ink">
      {children}
    </code>
  );
}

// ---------------- Content sections ----------------

function Pipeline() {
  const steps = [
    {
      title: "A founder submits the diagnostic",
      body: "Ten sections covering economics, offer, attention, demand, launch, retention and operating rhythm.",
    },
    {
      title: "The answers land in the Diagnostics sheet",
      body: "One row per submission, every answer in its own column.",
    },
    {
      title: "Five things get worked out automatically",
      body: "Estimated Stage, Paid Fit Score, Fit Status, Revenue Gap, and the bottleneck routing — all written onto the same row.",
    },
    {
      title: "A person reviews it in the Snapshot builder",
      body: "Every field is editable. The reviewer adds the category scorecard and decides which kind of snapshot to send.",
    },
    {
      title: "The founder gets a snapshot",
      body: "Either an engine recommendation, or a stage roadmap if they're not a fit yet. Only after a human says so.",
    },
  ];

  return (
    <Section
      id="pipeline"
      eyebrow="01"
      title="What happens when someone submits"
      lead="Five steps. The system does steps 2 and 3; a person does 4 and 5."
    >
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "flex gap-4 rounded-2xl border px-5 py-4",
              i === 2
                ? "border-accent/30 bg-accent/[0.05]"
                : "border-ink-100 bg-white"
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full font-serif text-[13px]",
                i === 2 ? "bg-accent text-cream-50" : "bg-ink-900 text-cream-50"
              )}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-[15px] font-medium text-ink-900 leading-snug">
                {s.title}
                {i === 2 && (
                  <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-accent">
                    this page
                  </span>
                )}
              </p>
              <p className="mt-1 text-[14px] text-ink-400 leading-relaxed">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function StageSection() {
  return (
    <Section
      id="stage"
      eyebrow="02"
      title="Estimated Stage"
      lead="Which of the three Sold-Out stages a brand is in. It comes from one number only: monthly revenue."
    >
      <Table
        headers={["Monthly revenue", "Estimated stage"]}
        rows={MONTHLY_BANDS.map((b) => [
          b.label,
          <span className="font-medium text-ink-900">{b.stage}</span>,
        ])}
      />
      <Note>
        <span className="font-medium">Where the number comes from.</span> If the
        founder typed an exact monthly average, that figure is used and the band
        is worked out from it. Otherwise the range they picked is used as-is. So
        someone who picks “$10K – $30K” but types $45,000 is scored as{" "}
        <Code>$30K – $100K</Code>.
      </Note>
      <Note>
        <span className="font-medium">Known limitation.</span> Nothing else moves
        the stage — not drop count, not list size, not how well they run a
        launch. A brand doing $25K a month with twelve polished drops still reads
        as Beta. That is usually the first thing a reviewer overrides, and it's
        the first knob we'd turn if it keeps happening.
      </Note>
    </Section>
  );
}

function ScoreSection() {
  return (
    <Section
      id="score"
      eyebrow="03"
      title="Paid Fit Score"
      lead={
        <>
          A 0–100 read on one question: is there enough proven business here for
          a first paid install to pay for itself? Points add up from seven
          signals — the highest any submission can currently reach is{" "}
          <span className="text-ink-800 font-medium">{MAX_SCORE}</span>.
        </>
      }
    >
      <Table
        headers={["Signal", "Condition", "Points"]}
        align={["left", "left", "right"]}
        rows={[
          [
            FLAT_SIGNALS.launched.label,
            "At least one drop launched",
            `+${FLAT_SIGNALS.launched.points}`,
          ],
          ...MONTHLY_BANDS.map((b, i) => [
            i === 0 ? "Monthly revenue" : "",
            b.label,
            `+${b.points}`,
          ]),
          ...LIST_TIERS.filter((t) => t.points > 0).map((t, i) => [
            i === 0 ? "Owned audience (email + SMS + community)" : "",
            t.label,
            `+${t.points}`,
          ]),
          ...MARGIN_POINTS.filter((m) => m.points > 0).map((m, i) => [
            i === 0 ? "Gross margin" : "",
            m.label,
            `+${m.points}`,
          ]),
          [
            FLAT_SIGNALS.profitable.label,
            "Answered “Yes”",
            `+${FLAT_SIGNALS.profitable.points}`,
          ],
          [
            FLAT_SIGNALS.paidAds.label,
            "Answered “Yes”",
            `+${FLAT_SIGNALS.paidAds.points}`,
          ],
          [
            FLAT_SIGNALS.hasGoal.label,
            "A goal above $0",
            `+${FLAT_SIGNALS.hasGoal.points}`,
          ],
        ]}
      />
      <Note>
        <span className="font-medium">Note the $100K+ dip.</span> The top revenue
        band scores {MONTHLY_BANDS[3].points}, slightly{" "}
        <em>less</em> than the {MONTHLY_BANDS[2].points} for $30K–$100K. That's
        deliberate: very large brands are usually past what the V0 engines do, so
        they get routed to a review rather than straight to an install.
      </Note>
      <Note>
        <span className="font-medium">What the score ignores, on purpose.</span>{" "}
        Offer clarity, the five-second tests, launch chaos, retention, operating
        maturity, follower counts, AOV and sell-through add{" "}
        <em>no points at all</em> today. They're read by a human in the category
        scorecard instead. So a brand can have a weak offer and still score well
        — the score measures whether there's a business to work with, not whether
        the drops are good.
      </Note>
    </Section>
  );
}

function FitStatusSection() {
  const badge = (status: string) => <FitBadge status={status} />;
  return (
    <Section
      id="fit"
      eyebrow="04"
      title="Fit Status"
      lead="The triage bucket. It is not a separate model — it's just the score crossing a line, with one override on top."
    >
      <Table
        headers={["Rule (checked in this order)", "Fit status"]}
        rows={[
          [
            <>
              Monthly revenue is <Code>$100K+</Code> — whatever the score
            </>,
            badge(FIT_STATUSES.futureEngine),
          ],
          [
            <>
              Score is <strong>{FIT_THRESHOLDS.likely} or above</strong>
            </>,
            badge(FIT_STATUSES.likely),
          ],
          [
            <>
              Score is <strong>{FIT_THRESHOLDS.maybe}–{FIT_THRESHOLDS.likely - 1}</strong>
            </>,
            badge(FIT_STATUSES.maybe),
          ],
          [
            <>
              Score is <strong>under {FIT_THRESHOLDS.maybe}</strong>
            </>,
            badge(FIT_STATUSES.notYet),
          ],
        ]}
      />
      <Note>
        <span className="font-medium">How to read a disagreement.</span> If the
        team keeps pushing “Likely fit” down to “Not yet”, the bar is too low. If
        they keep pulling “Not yet” up, it's too high. Two knobs fix either: the
        point weights in the table above, or the {FIT_THRESHOLDS.likely} /{" "}
        {FIT_THRESHOLDS.maybe} cut-offs here.
      </Note>
    </Section>
  );
}

function FitBadge({ status }: { status: string }) {
  const tone =
    status === FIT_STATUSES.likely
      ? "border-success/30 bg-success/10 text-success"
      : status === FIT_STATUSES.maybe
        ? "border-warning/30 bg-warning/10 text-warning"
        : status === FIT_STATUSES.futureEngine
          ? "border-accent/30 bg-accent/10 text-accent-ink"
          : "border-ink-200 bg-ink-50 text-ink-400";
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-1 text-[12px] font-medium whitespace-nowrap",
        tone
      )}
    >
      {status}
    </span>
  );
}

function RevenueGapSection() {
  return (
    <Section
      id="gap"
      eyebrow="05"
      title="Revenue Gap"
      lead="The size of the jump a brand is trying to make on its next drop."
    >
      <div className="rounded-2xl border border-ink-100 bg-ink-900 px-5 py-5 text-cream-50">
        <p className="font-serif text-[18px] sm:text-[21px] leading-snug">
          next drop goal − midpoint of their last drop range
        </p>
      </div>
      <Table
        headers={["Last drop range", "Midpoint used"]}
        align={["left", "right"]}
        rows={DROP_MIDPOINTS.map((d) => [
          d.label,
          `$${d.midpoint.toLocaleString("en-US")}`,
        ])}
      />
      <Note>
        A range is turned into a single number so the subtraction works — “$25K –
        $50K” becomes $37,500. If there's a goal but no last-drop range, the gap
        is just the goal. If there's no goal, the gap is left blank rather than
        guessed.
      </Note>
    </Section>
  );
}

function RoutingSection() {
  return (
    <Section
      id="routing"
      eyebrow="06"
      title="Bottleneck → Lever → Engine"
      lead="This one isn't calculated at all. The founder tells us, and we map their answer to a growth lever and a candidate engine."
    >
      <Table
        headers={["What the founder ticks", "Growth lever", "Recommended engine"]}
        rows={BOTTLENECK_ROUTES.map((r) => [
          r.question,
          <span className="font-medium text-ink-900">{r.lever}</span>,
          r.engine,
        ])}
      />
      <Note>
        <span className="font-medium">Pick order matters.</span> That question
        takes several answers. The <strong>first</strong> one tapped becomes the
        primary bottleneck and chooses the engine; the{" "}
        <strong>second</strong> is recorded as the secondary bottleneck. Any
        further picks are kept on the row for the reviewer but don't route
        anything.
      </Note>
      <Note>
        <span className="font-medium">Engines are labels, not products.</span>{" "}
        The six Sold-Out Engines name the module we'd install next. None of them
        is a built product today, so “Recommended engine” means “this is the
        conversation to have”, not “this is what they're buying”.
      </Note>
    </Section>
  );
}

// ---------------- The live example ----------------

function LiveExample() {
  const [input, setInput] = useState<ScoringInput>(() => GUIDE_PRESETS[1].input);
  const [activePreset, setActivePreset] = useState<string | null>(
    GUIDE_PRESETS[1].name
  );

  const result = useMemo(() => scoreDiagnostic(input), [input]);

  const set = <K extends keyof ScoringInput>(key: K, value: ScoringInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const applyPreset = (name: string, preset: ScoringInput) => {
    setInput(preset);
    setActivePreset(name);
  };

  const toggleBottleneck = (value: string) => {
    const picks = input.bottleneck.split("|").filter(Boolean);
    const next = picks.includes(value)
      ? picks.filter((p) => p !== value)
      : [...picks, value];
    set("bottleneck", next.join("|"));
  };
  const pickIndex = (value: string) =>
    input.bottleneck.split("|").filter(Boolean).indexOf(value);

  return (
    <Section
      id="live"
      eyebrow="07"
      title="Try it yourself"
      lead="Change any answer and watch every output move. This runs the exact same rules described above — including the points breakdown, so you can see where each point came from."
    >
      <div>
        <p className="field-label">Start from an example</p>
        <div className="flex flex-wrap gap-2">
          {GUIDE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.name, p.input)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors",
                activePreset === p.name
                  ? "border-ink-900 bg-ink-900 text-cream-50"
                  : "border-ink-100 bg-white text-ink-600 hover:border-ink-800"
              )}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyPreset("Blank", emptyScoringInput())}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors",
              activePreset === "Blank"
                ? "border-ink-900 bg-ink-900 text-cream-50"
                : "border-ink-100 bg-white text-ink-600 hover:border-ink-800"
            )}
          >
            Clear
          </button>
        </div>
        {activePreset && (
          <p className="field-helper">
            {GUIDE_PRESETS.find((p) => p.name === activePreset)?.blurb ??
              "Empty form — nothing answered."}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-5 items-start">
        {/* Inputs */}
        <div className="section-card !p-5 space-y-4">
          <p className="section-eyebrow">The answers that count</p>

          <GuideSelect
            label="Approx. monthly revenue range"
            value={input.monthlyRevenue}
            onChange={(v) => set("monthlyRevenue", v)}
            options={MONTHLY_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          />
          <GuideNumber
            label="Exact monthly average (optional — overrides the range)"
            value={input.monthlyRevenueAvg}
            onChange={(v) => set("monthlyRevenueAvg", v)}
            prefix="$"
          />
          <div className="grid grid-cols-2 gap-3">
            <GuideNumber
              label="Drops launched"
              value={input.numDrops}
              onChange={(v) => set("numDrops", v)}
            />
            <GuideNumber
              label="Next drop goal"
              value={input.nextDropGoal}
              onChange={(v) => set("nextDropGoal", v)}
              prefix="$"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <GuideNumber
              label="Email list"
              value={input.emailListSize}
              onChange={(v) => set("emailListSize", v)}
            />
            <GuideNumber
              label="SMS list"
              value={input.smsListSize}
              onChange={(v) => set("smsListSize", v)}
            />
            <GuideNumber
              label="Community"
              value={input.communitySize}
              onChange={(v) => set("communitySize", v)}
            />
          </div>
          <GuideSelect
            label="Last drop revenue range"
            value={input.lastDropRevenue}
            onChange={(v) => set("lastDropRevenue", v)}
            options={DROP_MIDPOINTS.map((d) => ({ value: d.value, label: d.label }))}
          />
          <GuideSelect
            label="Gross margin"
            value={input.grossMargin}
            onChange={(v) => set("grossMargin", v)}
            options={[
              { value: "under_40", label: "Under 40%" },
              { value: "40_60", label: "40% – 60%" },
              { value: "60_75", label: "60% – 75%" },
              { value: "75_plus", label: "75%+" },
              { value: "not_sure", label: "Not sure" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <GuideSelect
              label="Drops profitable?"
              value={input.dropsProfitable}
              onChange={(v) => set("dropsProfitable", v)}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "not_sure", label: "Not sure" },
              ]}
            />
            <GuideSelect
              label="Runs paid ads?"
              value={input.runsPaidAds}
              onChange={(v) => set("runsPaidAds", v)}
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
            />
          </div>

          <div>
            <p className="field-label">
              Biggest constraint{" "}
              <span className="font-normal text-ink-400">
                — tap in order; first pick routes the engine
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {BOTTLENECK_ROUTES.map((r) => {
                const idx = pickIndex(r.value);
                const active = idx >= 0;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleBottleneck(r.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                      active
                        ? "border-ink-900 bg-cream-50 text-ink-900"
                        : "border-ink-100 bg-white text-ink-600 hover:border-ink-200"
                    )}
                  >
                    {active && (
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-medium text-cream-50">
                        {idx + 1}
                      </span>
                    )}
                    {r.question}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="section-card !p-5 space-y-4">
            <p className="section-eyebrow">What the system writes</p>

            <Output label="Estimated Stage" value={result.stage} />

            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">
                Paid Fit Score
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="result-number text-[38px] text-ink-900">
                  {result.score}
                </span>
                <span className="text-[13px] text-ink-400">
                  / {MAX_SCORE} possible
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${(result.score / MAX_SCORE) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-400">
                <span>Not yet</span>
                <span>{FIT_THRESHOLDS.maybe} · maybe</span>
                <span>{FIT_THRESHOLDS.likely} · likely</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">
                Fit Status
              </p>
              <div className="mt-1.5">
                <FitBadge status={result.fitStatus} />
              </div>
              {result.fitStatus === FIT_STATUSES.futureEngine && (
                <p className="mt-1.5 text-[12px] text-ink-400 leading-relaxed">
                  Forced by the $100K+ rule — the score didn't decide this.
                </p>
              )}
            </div>

            <Output
              label="Revenue Gap"
              value={result.revenueGap || "—"}
              note={result.revenueGapNote}
            />
            <Output label="Primary Bottleneck" value={result.bottleneck} />
            {result.secondaryBottleneck && (
              <Output
                label="Secondary Bottleneck"
                value={result.secondaryBottleneck}
              />
            )}
            <Output label="Primary Growth Lever" value={result.lever} />
            <Output label="Recommended Engine" value={result.engine} />
          </div>

          <div className="section-card !p-5">
            <p className="section-eyebrow">Where the points came from</p>
            <ul className="mt-3 space-y-2.5">
              {result.lines.map((line) => (
                <li key={line.label} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 w-11 shrink-0 rounded-full px-2 py-0.5 text-center text-[11.5px] font-medium tabular-nums",
                      line.points > 0
                        ? "bg-accent/10 text-accent-ink"
                        : "bg-ink-50 text-ink-200"
                    )}
                  >
                    {line.points > 0 ? `+${line.points}` : "0"}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] text-ink-900 leading-snug">
                      {line.label}
                    </span>
                    <span className="block text-[12px] text-ink-400 leading-snug">
                      {line.detail}
                      {line.points < line.max && (
                        <span className="text-ink-200">
                          {" "}
                          · up to +{line.max} here
                        </span>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-ink-100 pt-3">
              <span className="text-[13px] font-medium text-ink-900">Total</span>
              <span className="text-[15px] font-medium text-ink-900 tabular-nums">
                {result.score}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Output({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400 font-medium">
        {label}
      </p>
      <p className="mt-1 text-[15px] text-ink-900 leading-snug">{value}</p>
      {note && (
        <p className="mt-1 text-[12px] text-ink-400 leading-relaxed">{note}</p>
      )}
    </div>
  );
}

function GuideSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        className="input-base !py-2.5 !text-[14px] appearance-none bg-white pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' stroke='%236B6864' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.9rem center",
        }}
      >
        <option value="">— not answered —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GuideNumber({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-[14px]">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className={cn("input-base !py-2.5 !text-[14px]", prefix && "!pl-8")}
        />
      </div>
    </div>
  );
}

// ---------------- The human layer ----------------

function HumanLayer() {
  return (
    <Section
      id="human"
      eyebrow="08"
      title="What the system doesn't decide"
      lead="Everything above is a draft written by a script. These are the calls a person makes, and they always win."
    >
      <Table
        headers={["Decision", "Made by", "Seen by the founder?"]}
        rows={[
          ["Stage, fit score, fit status, gap, engine", "Script first — reviewer can change any of them", "Only what's in the snapshot"],
          ["The 10-category scorecard", "Reviewer only — never auto-filled", "No"],
          ["Whether they're a fit at all", "Reviewer", "Indirectly"],
          ["Engine recommendation vs. stage roadmap", "Reviewer, per submission", "Yes"],
          ["Internal notes and follow-up status", "Reviewer only", "No"],
          ["Whether anything gets sent", "Reviewer — nothing auto-sends", "—"],
        ]}
      />
      <div>
        <p className="text-[14px] text-ink-800 leading-relaxed mb-3">
          The category scorecard is the human counterweight to the score. Ten
          levers, each marked Weak / Moderate / Strong by the reviewer:
        </p>
        <div className="flex flex-wrap gap-2">
          {SCORE_CATEGORIES.map((c) => (
            <span
              key={c.key}
              className="rounded-full border border-ink-100 bg-white px-3 py-1.5 text-[12.5px] text-ink-800"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>
      <Note>
        Use it when the number looks fine but a lever is obviously broken — a
        brand can score 70 and still have an offer nobody understands. The score
        won't catch that; a person will.
      </Note>
    </Section>
  );
}

function WhereToChange() {
  return (
    <Section
      id="change"
      eyebrow="09"
      title="Where to change it"
      lead="All of this is meant to be tuned as we learn. Nothing here is permanent."
    >
      <Table
        headers={["To change…", "Edit", "Takes effect"]}
        rows={[
          [
            "Point weights, thresholds, stage bands, routing",
            <Code>DiagnosticCode.gs</Code>,
            "After redeploying the Web App as a new version",
          ],
          [
            "This page's tables and calculator",
            <Code>src/snapshot/scoring.ts</Code>,
            "Next site deploy",
          ],
          [
            "The questions being asked",
            <Code>src/diagnostic/schema.ts</Code>,
            "Next site deploy — new columns appear automatically",
          ],
          [
            "Stage names, engine names, scorecard categories",
            <Code>src/snapshot/constants.ts</Code>,
            "Next site deploy",
          ],
        ]}
      />
      <Note>
        <span className="font-medium">One catch worth knowing.</span> The live
        scoring runs in the Apps Script; this page runs a copy of those rules so
        it can show its working in the browser. They're kept in step by hand and
        verified against each other, so if you change one, change the other — the
        file header in <Code>scoring.ts</Code> says the same thing.
      </Note>
    </Section>
  );
}
