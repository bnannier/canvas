// Where the audit stands, read from the checklists under audit/: how many variant cells
// are ticked per platform, how many rubric, family and specific items are ticked, how
// many findings are open and at what severity, and which platforms are signed off.
// Counts only: a tick is a reviewer's claim, and this reports it, never verifies it.
//
// `bun run audit:status` prints the summary; `--json` prints the per-checklist rows.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { COMPONENTS_DIR, FACTS_BEGIN, FACTS_END, PAGES_DIR, SIGN_OFF_PLATFORMS, VARIANTS_BEGIN, VARIANTS_END, findBlock, parseVariantsTable } from "./checklists.ts";

export const OPEN_FINDING_STATUSES = ["open", "verified"] as const;
export const SEVERITIES = ["critical", "high", "medium", "low"] as const;

export interface ChecklistStatus {
  file: string;
  variants: { total: number; web: number; ios: number; android: number };
  items: { total: number; ticked: number };
  findings: { total: number; open: number; bySeverity: Record<string, number>; byStatus: Record<string, number> };
  signedOff: string[];
}

const ticked = (cellText: string): boolean => /^\[x\]/i.test(cellText.trim());

/** The rows of a findings table: every `| ... |` row after the header under `## Findings`. */
export function parseFindings(content: string): { severity: string; status: string }[] {
  const at = content.indexOf("\n## Findings");
  if (at === -1) return [];
  const section = content.slice(at).split(/\n## (?!Findings)/)[0];
  const rows: { severity: string; status: string }[] = [];
  for (const line of section.split("\n")) {
    if (!line.startsWith("| ") || /^\|\s*ID\s*\|/.test(line) || /^\|-+\|/.test(line.replace(/\s/g, ""))) continue;
    const cells = line.replace(/^\|\s?/, "").replace(/\s?\|$/, "").split(" | ").map((c) => c.trim());
    if (cells.length < 6) continue;
    rows.push({ severity: cells[1].toLowerCase(), status: cells[4].toLowerCase() });
  }
  return rows;
}

/** The platforms whose sign-off row carries a run id. */
export function parseSignOffs(content: string): string[] {
  const at = content.indexOf("\n## Sign-off");
  if (at === -1) return [];
  const section = content.slice(at).split(/\n## (?!Sign-off)/)[0];
  return SIGN_OFF_PLATFORMS.filter((platform) => {
    const row = section.split("\n").find((line) => line.startsWith(`| ${platform} |`));
    if (!row) return false;
    const cells = row.replace(/^\|\s?/, "").replace(/\s?\|$/, "").split(" | ").map((c) => c.trim());
    return Boolean(cells[1]);
  });
}

export function checklistStatus(file: string, content: string): ChecklistStatus {
  const variants = findBlock(content, VARIANTS_BEGIN, VARIANTS_END);
  const rows = variants ? [...parseVariantsTable(variants.lines).values()] : [];
  // Hand-maintained items: the task boxes outside the generated blocks.
  const facts = findBlock(content, FACTS_BEGIN, FACTS_END);
  const hand = [facts, variants].reduce((text, block) => (block ? text.replace(content.slice(block.start, block.end), "") : text), content);
  const boxes = [...hand.matchAll(/^\s*- \[( |x|X)\] /gm)];
  const findings = parseFindings(content);
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const finding of findings) {
    byStatus[finding.status] = (byStatus[finding.status] ?? 0) + 1;
    if ((OPEN_FINDING_STATUSES as readonly string[]).includes(finding.status)) bySeverity[finding.severity] = (bySeverity[finding.severity] ?? 0) + 1;
  }
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
      open: findings.filter((f) => (OPEN_FINDING_STATUSES as readonly string[]).includes(f.status)).length,
      bySeverity,
      byStatus,
    },
    signedOff: parseSignOffs(content),
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
  const active = rows.filter((r) => r.variants.web + r.variants.ios + r.variants.android + r.items.ticked + r.findings.total + r.signedOff.length > 0);
  if (active.length) {
    lines.push("", "| Checklist | Variants web/ios/android | Items | Open findings | Signed off |", "|---|---|---|---|---|");
    for (const r of active) {
      lines.push(`| ${r.file} | ${r.variants.web}/${r.variants.ios}/${r.variants.android} of ${r.variants.total} | ${r.items.ticked}/${r.items.total} | ${r.findings.open} of ${r.findings.total} | ${r.signedOff.join(", ") || "none"} |`);
    }
  }
  return lines.join("\n");
}

if (import.meta.main) {
  const rows = auditStatus(join(ROOT, "audit"));
  if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
  else console.log(formatStatus(rows));
}
