// Where the audit stands, read from the checklists under audit/: how many variant cells
// are ticked per platform, how many rubric, family and specific items are ticked, how
// many findings are open and at what severity, and which platforms are signed off.
// Counts only: a tick is a reviewer's claim, and this reports it, never verifies it.
//
// Every table is read with the one escape-aware reader the checklists are written and
// checked with (tools/audit/table.ts, through tools/audit/checklists.ts), so a "|" typed
// in a summary does not shift the Status column and an empty cell typed `| |` does not
// drop the row. A finding is counted only when its Status is one of audit/README.md's
// words (open, verified, fixed, wontfix, duplicate), a `fixed` one names its Fix commit,
// and a Fix commit is a commit SHA. A row it cannot read, or a table it cannot find, is
// not counted: it is listed by file and line under the counts, and the command exits
// non-zero, because the counts above it under-report by that much.
//
// `bun run audit:status` prints the summary; `--json` prints the per-checklist rows.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  COMPONENTS_DIR,
  FACTS_BEGIN,
  FACTS_END,
  FINDING_SEVERITIES,
  PAGES_DIR,
  SIGN_OFF_PLATFORMS,
  VARIANTS_BEGIN,
  VARIANTS_END,
  blockFirstLine,
  findBlock,
  handTableProblems,
  readFindings,
  readSignOffs,
  readVariantsTable,
} from "./checklists.ts";

export const OPEN_FINDING_STATUSES = ["open", "verified"] as const;
export const SEVERITIES = FINDING_SEVERITIES;

/** A line or table the counts leave out, because it cannot be read. */
export interface StatusProblem {
  /** The 1-based line in the checklist, or null for a table that is missing as a whole. */
  line: number | null;
  message: string;
}

export interface ChecklistStatus {
  file: string;
  variants: { total: number; web: number; ios: number; android: number };
  items: { total: number; ticked: number };
  findings: { total: number; open: number; bySeverity: Record<string, number>; byStatus: Record<string, number> };
  signedOff: string[];
  /** What the counts above leave out: rows that cannot be read and tables that are missing. */
  unreadable: StatusProblem[];
}

const ticked = (cellText: string): boolean => /^\[x\]/i.test(cellText.trim());

export function checklistStatus(file: string, content: string): ChecklistStatus {
  const variants = findBlock(content, VARIANTS_BEGIN, VARIANTS_END);
  const table = variants ? readVariantsTable(variants.lines, blockFirstLine(content, variants)) : { rows: [], malformed: [] };
  const rows = table.rows.map((row) => row.ticks);
  // Hand-maintained items: the task boxes outside the generated blocks.
  const facts = findBlock(content, FACTS_BEGIN, FACTS_END);
  const hand = [facts, variants].reduce((text, block) => (block ? text.replace(content.slice(block.start, block.end), "") : text), content);
  const boxes = [...hand.matchAll(/^\s*- \[( |x|X)\] /gm)];
  const findings = readFindings(content).rows;
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const isOpen = (status: string) => (OPEN_FINDING_STATUSES as readonly string[]).includes(status);
  for (const finding of findings) {
    byStatus[finding.status] = (byStatus[finding.status] ?? 0) + 1;
    if (isOpen(finding.status)) bySeverity[finding.severity] = (bySeverity[finding.severity] ?? 0) + 1;
  }
  const unreadable: StatusProblem[] = [
    ...(variants ? [] : [{ line: null, message: "variants table markers missing" }]),
    ...table.malformed.map((row) => ({ line: row.line, message: `malformed variants row: ${row.reason}` })),
    ...handTableProblems(content),
  ];
  return {
    file,
    variants: {
      total: rows.length,
      web: rows.filter((r) => ticked(r.web)).length,
      ios: rows.filter((r) => ticked(r.ios)).length,
      android: rows.filter((r) => ticked(r.android)).length,
    },
    items: { total: boxes.length, ticked: boxes.filter((m) => m[1] !== " ").length },
    findings: {
      total: findings.length,
      open: findings.filter((f) => isOpen(f.status)).length,
      bySeverity,
      byStatus,
    },
    signedOff: readSignOffs(content)
      .rows.filter((row) => row.runId !== "")
      .map((row) => row.platform),
    unreadable,
  };
}

export function auditStatus(auditDir: string): ChecklistStatus[] {
  const out: ChecklistStatus[] = [];
  for (const dir of [COMPONENTS_DIR, PAGES_DIR]) {
    const absolute = join(auditDir, dir);
    if (!existsSync(absolute)) continue;
    for (const name of readdirSync(absolute).sort()) {
      if (!name.endsWith(".md")) continue;
      out.push(checklistStatus(`${dir}/${name}`, readFileSync(join(absolute, name), "utf8")));
    }
  }
  return out;
}

const sum = (rows: ChecklistStatus[], pick: (row: ChecklistStatus) => number): number => rows.reduce((n, row) => n + pick(row), 0);

export function formatStatus(rows: ChecklistStatus[]): string {
  const variants = sum(rows, (r) => r.variants.total);
  const open = sum(rows, (r) => r.findings.open);
  const severity = SEVERITIES.map((s) => `${s} ${sum(rows, (r) => r.findings.bySeverity[s] ?? 0)}`).join(", ");
  const signed = SIGN_OFF_PLATFORMS.map((p) => `${p} ${rows.filter((r) => r.signedOff.includes(p)).length}/${rows.length}`).join(", ");
  const lines = [
    `audit:status over ${rows.length} checklists`,
    `  variant rows ${variants}: ticked web ${sum(rows, (r) => r.variants.web)}, ios ${sum(rows, (r) => r.variants.ios)}, android ${sum(rows, (r) => r.variants.android)}`,
    `  checklist items ${sum(rows, (r) => r.items.total)}: ticked ${sum(rows, (r) => r.items.ticked)}`,
    `  findings ${sum(rows, (r) => r.findings.total)}: open ${open} (${severity})`,
    `  signed off: ${signed}`,
  ];
  const unreadable = rows.flatMap((r) => r.unreadable.map((p) => `    audit/${r.file}${p.line === null ? "" : `:${p.line}`}: ${p.message}`));
  if (unreadable.length) {
    lines.push(`  unreadable ${unreadable.length}: left out of the counts above, which under-report by that much; fix each by hand`, ...unreadable);
  }
  const active = rows.filter((r) => r.variants.web + r.variants.ios + r.variants.android + r.items.ticked + r.findings.total + r.signedOff.length + r.unreadable.length > 0);
  if (active.length) {
    lines.push("", "| Checklist | Variants web/ios/android | Items | Open findings | Signed off | Unreadable |", "|---|---|---|---|---|---|");
    for (const r of active) {
      lines.push(
        `| ${r.file} | ${r.variants.web}/${r.variants.ios}/${r.variants.android} of ${r.variants.total} | ${r.items.ticked}/${r.items.total} | ${r.findings.open} of ${r.findings.total} | ${r.signedOff.join(", ") || "none"} | ${r.unreadable.length} |`,
      );
    }
  }
  return lines.join("\n");
}

if (import.meta.main) {
  const rows = auditStatus(join(ROOT, "audit"));
  if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
  else console.log(formatStatus(rows));
  if (rows.some((row) => row.unreadable.length)) process.exit(1);
}
