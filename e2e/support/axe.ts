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
 * region for every piece of content), which is a page's job rather than a component
 * library's, and every react-native-web app trips them.
 */
import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";

/** The success criteria the kit holds itself to. */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Impacts that fail a run. Minor and moderate findings are attached, not enforced. */
export const BLOCKING_IMPACTS = new Set(["serious", "critical"]);

/**
 * Rules turned off, each with the reason.
 *
 * This list is meant to stay short and to hold only structural artifacts of
 * react-native-web itself, never a real defect that is inconvenient to fix.
 */
export const KNOWN_RNW_RULES: Record<string, string> = {
  "scrollable-region-focusable": [
    "react-native-web renders every ScrollView as a scrollable div with no tabindex,",
    "so a keyboard cannot scroll it without focusing something inside. That is a real",
    "question for the kit, but it belongs to ScrollView and to react-native-web rather",
    "than to any component page, and filing it on all 102 of them says nothing new.",
  ].join(" "),
};

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
    .disableRules(Object.keys(KNOWN_RNW_RULES))
    .analyze();

  const order = ["critical", "serious", "moderate", "minor"];
  return results.violations
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
