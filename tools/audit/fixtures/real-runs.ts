// Real capture records for the readers' tests (runs.ts, analyze.ts, sheets.ts, index.ts,
// prune.ts). Three runs of `bun run audit:web` over a static export on 2026-10-09, cut down
// to a few cells each and otherwise copied as the runners wrote them: each run's
// manifest.json (with the checkout's absolute path replaced by `<checkout>`), the cells'
// own lines of cells.jsonl, and each cell's probe.json and photographs. The analysis is
// derived, so none of it is kept; a test writes its own.
//
//   variants  web/button/default/desktop.blush.{solid,glass}
//   states    web-states/button/hover.web and pressed.web at desktop.blush.{solid,glass},
//             web-states/slider/pressed.web/desktop.blush.solid (its release flagged
//             press-not-cancelled), web-states/heatmap/pressed.web/desktop.blush.solid (not
//             reached), web-states/tooltip/open.web/phone.blush.solid (the viewport, its
//             bubble drawn in the row, flagged hover-unstable)
//   pages     web-pages/template-signin/phone.blush.glass (the first screen and three sections)
//
// earlier-runs/ holds the two captures of web-states/button/hover.web/desktop.blush.solid the
// states run replaced (the same command run twice before it, on the commits that recorded
// the region origins and the text's own opacity), for the pruner: with them a cell has three
// captures, and the oldest run holds nothing a reviewer needs.

import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT } from "../../../e2e/support/routes.ts";
import { RUNS_DIR } from "../web-capture.ts";

/** Where the copied runs are, laid out as .audit/runs is. */
export const REAL_RUNS = join(ROOT, "tools", "audit", "fixtures", "runs");

/** The two earlier captures of one state cell, laid out as .audit/runs is. */
export const EARLIER_RUNS = join(ROOT, "tools", "audit", "fixtures", "earlier-runs");

/** The earlier runs, oldest first. */
export const EARLIER = ["20261009-170001-web-90fb168", "20261009-170859-web-1914767"] as const;

/** The three runs, by what they captured. */
export const RUNS = {
  variants: "20261009-171438-web-b87e514",
  states: "20261009-171726-web-b87e514",
  pages: "20261009-171819-web-b87e514",
} as const;

/** A temporary checkout holding the real runs (and the earlier ones, when asked) under its .audit/runs; the caller removes it. */
export function checkoutWithRealRuns(options: { earlier?: boolean } = {}): string {
  const root = mkdtempSync(join(tmpdir(), "audit-real-runs-"));
  cpSync(REAL_RUNS, join(root, RUNS_DIR), { recursive: true });
  if (options.earlier) cpSync(EARLIER_RUNS, join(root, RUNS_DIR), { recursive: true });
  return root;
}
