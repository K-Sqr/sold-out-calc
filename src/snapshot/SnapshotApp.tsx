import { useMemo } from "react";
import { decodeSnapshot } from "./encode";
import { SnapshotView } from "./SnapshotView";
import { SnapshotBuilder } from "./SnapshotBuilder";

/**
 * One page, two modes:
 *
 *  - Founder view:  /snapshot?s=<token>          → clean "Your Sold-Out Snapshot"
 *  - Internal build: /snapshot                    → the team's review + builder
 *  - Re-edit a link: /snapshot?s=<token>&edit=1   → builder pre-filled from token
 *
 * Everything is client-side and static — the link itself carries the data.
 */
export default function SnapshotApp() {
  const { mode, initial } = useMemo(() => {
    if (typeof window === "undefined") {
      return { mode: "build" as const, initial: null };
    }
    const params = new URLSearchParams(window.location.search);
    const token = params.get("s");
    const editing = params.get("edit") === "1";
    const decoded = token ? decodeSnapshot(token) : null;

    if (token && decoded && !editing) {
      return { mode: "view" as const, initial: decoded };
    }
    return { mode: "build" as const, initial: decoded };
  }, []);

  if (mode === "view" && initial) {
    return <SnapshotView data={initial} />;
  }
  return <SnapshotBuilder initial={initial} />;
}
