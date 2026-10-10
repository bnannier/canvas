// The sign-off table at the foot of every audit checklist (audit/components/<slug>.md and
// audit/pages/<kind>-<slug>.md): one row per platform, filled in by the reviewer who signs
// the component off on it. Read here, with the one table reader, by everything that asks
// whether a component is signed off: the checklist gate (tools/audit/checklists.ts),
// audit:status (tools/audit/status.ts), and the docs page gate, which requires a signed-off
// component's page to carry an Accessibility section (rule S10, tools/docgen/pages.ts). It
// imports nothing but the table reader, so the docs generator can read a checklist without
// loading the audit's facts.

import { oneOf, readSectionTable, type MalformedRow, type TableShape } from "./table.ts";

export const SIGN_OFF_PLATFORMS = ["web", "ios", "android"] as const;

/** The sign-off table: a "|" typed in a result stays in it, and the result may be left off. */
export const SIGN_OFF_SHAPE: TableShape = { name: "sign-off", columns: ["Platform", "Run id", "Reviewer", "Date", "Result"], minCells: 4, free: 4 };

/** A sign-off row as a reviewer left it. */
export interface SignOff {
  platform: (typeof SIGN_OFF_PLATFORMS)[number];
  runId: string;
  reviewer: string;
  date: string;
  result: string;
  line: number;
}

/** The sign-off table: whether it is there, its readable rows, and every line it could not read. */
export interface SignOffTable {
  found: boolean;
  rows: SignOff[];
  malformed: MalformedRow[];
}

/** The sign-off rows under `## Sign-off`, one per platform, read with the one table reader. */
export function readSignOffs(content: string): SignOffTable {
  const table = readSectionTable(content, "Sign-off", SIGN_OFF_SHAPE);
  const out: SignOffTable = { found: table.found, rows: [], malformed: [...table.malformed] };
  const seen = new Map<string, number>();
  for (const { cells, line } of table.rows) {
    const [platformCell, runId, reviewer, date, result] = cells;
    const platform = oneOf(SIGN_OFF_PLATFORMS, platformCell.toLowerCase());
    if (!platform) out.malformed.push({ line, reason: `the Platform cell reads "${platformCell}", not one of ${SIGN_OFF_PLATFORMS.join(", ")}` });
    else if (seen.has(platform)) out.malformed.push({ line, reason: `a second sign-off row for ${platform} (the first is on line ${seen.get(platform)})` });
    else {
      seen.set(platform, line);
      out.rows.push({ platform, runId, reviewer, date, result, line });
    }
  }
  out.malformed.sort((a, b) => a.line - b.line);
  return out;
}

/**
 * The platforms a checklist signs off: those whose row names the after-capture run that
 * shows the component passing (a run id), in table order.
 */
export function signedOffPlatforms(content: string): SignOff["platform"][] {
  return readSignOffs(content).rows.filter((row) => row.runId !== "").map((row) => row.platform);
}
