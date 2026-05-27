import type { ConfidenceBadgeData } from "../types";
import { cn } from "../lib/utils";

interface Props {
  data: ConfidenceBadgeData;
  className?: string;
}

const STYLES: Record<
  ConfidenceBadgeData["level"],
  { dot: string; chip: string; bar: string; label: string }
> = {
  strong: {
    dot: "bg-success",
    chip: "bg-success/10 text-success border-success/20",
    bar: "bg-success",
    label: "text-success",
  },
  close: {
    dot: "bg-warning",
    chip: "bg-warning/10 text-warning border-warning/25",
    bar: "bg-warning",
    label: "text-warning",
  },
  "at-risk": {
    dot: "bg-accent",
    chip: "bg-accent/10 text-accent border-accent/25",
    bar: "bg-accent",
    label: "text-accent",
  },
  "high-risk": {
    dot: "bg-danger",
    chip: "bg-danger/10 text-danger border-danger/25",
    bar: "bg-danger",
    label: "text-danger",
  },
};

export function ConfidenceBadge({ data, className }: Props) {
  const s = STYLES[data.level];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium border",
        s.chip,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {data.label}
    </div>
  );
}

export function getConfidenceColors(level: ConfidenceBadgeData["level"]) {
  return STYLES[level];
}
