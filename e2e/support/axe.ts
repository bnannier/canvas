/**
 * Accessibility scanning, scoped to what the kit is actually responsible for.
 *
 * Every component page renders three rows: an iOS skin, an Android skin and the web
 * skin. Only the last is what a consumer ships to a browser; the other two are
 * previews of how the component looks on a platform this browser is not, and holding
 * them to web contrast thresholds would file findings against a picture. So the
 * component scans run against `[data-platform-row="web"]`, and the docs' own chrome
 * is scanned separately, on a handful of pages rather than on all 102.
 *
 * The tag list is the WCAG success criteria only. axe's "best-practice" rules are
 * useful advice and mostly about document structure (landmarks, heading order, a
 * region for every piece of content). The separate structural scan enforces these
 * rules on complete documentation pages, including moderate-impact findings.
 */
import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";

/** The success criteria the kit holds itself to. */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Impacts that fail a run. Minor and moderate findings are attached, not enforced. */
export const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/** Whole-page requirements, explicitly selected because WCAG tags omit several. */
export const STRUCTURAL_RULES = [
  "heading-order",
  "page-has-heading-one",
  "landmark-one-main",
  "landmark-no-duplicate-banner",
  "landmark-banner-is-top-level",
  "landmark-unique",
  "region",
  "scrollable-region-focusable",
];

export interface Violation {
  id: string;
  impact: string;
  help: string;
  nodes: number;
  target: string;
}

/** Run axe over `selector` and return the violations, worst first. */
export async function scan(page: Page, selector: string): Promise<Violation[]> {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(WCAG_TAGS)
    .analyze();

  return summarize(results.violations);
}

/** Structural findings are enforced at every impact, separately from WCAG policy. */
export async function scanStructure(
  page: Page,
  selector = "body",
  rules = STRUCTURAL_RULES,
): Promise<Violation[]> {
  const results = await new AxeBuilder({ page }).include(selector).withRules(rules).analyze();
  return summarize(results.violations);
}

function summarize(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]): Violation[] {
  const order = ["critical", "serious", "moderate", "minor"];
  return violations
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? "unknown",
      help: violation.help,
      nodes: violation.nodes.length,
      target: String(violation.nodes[0]?.target?.[0] ?? ""),
    }))
    .sort((a, b) => order.indexOf(a.impact) - order.indexOf(b.impact));
}

/** Attach the full result to the report, so a failure explains itself. */
export async function attach(testInfo: TestInfo, name: string, violations: Violation[]): Promise<void> {
  if (violations.length === 0) return;
  await testInfo.attach(`axe-${name}.json`, {
    body: JSON.stringify(violations, null, 2),
    contentType: "application/json",
  });
}

/** One line per violation, for the failure message. */
export function describe(violations: Violation[]): string {
  return violations.map((v) => `  ${v.impact} ${v.id}: ${v.help} (${v.nodes} node(s), first at ${v.target})`).join("\n");
}
