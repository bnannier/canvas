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

type RawViolation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

export interface Violation {
  id: string;
  impact: string;
  help: string;
  nodes: number;
  target: string;
  /** Original rule and every node/check, retained for diagnostic attachments. */
  raw: RawViolation;
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

export function summarize(violations: RawViolation[]): Violation[] {
  const order = ["critical", "serious", "moderate", "minor"];
  return violations
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? "unknown",
      help: violation.help,
      nodes: violation.nodes.length,
      target: String(violation.nodes[0]?.target?.[0] ?? ""),
      raw: violation,
    }))
    .sort((a, b) => order.indexOf(a.impact) - order.indexOf(b.impact));
}

/** An authored visual limitation, not a claim that these targets meet WCAG 2.5.8. */
export const PALETTE_TARGET_REFERENCE_NOTE =
  "The owner's exact v4 navbar reference uses five 16px palette radios with 6px gaps (22px centers). " +
  "24px hit targets would overlap by 2px. Preserve this authored geometry and report its target-size failure.";

const PALETTE_NAMES = ["Violet", "Cyan", "Mint", "Rose", "Amber"];

/**
 * Apply only to the shell scan. Verify the live landmark, names and geometry before
 * recognizing any axe selector; similarly named radios elsewhere never qualify.
 */
export async function shellReferencePolicy(page: Page, findings: Violation[]) {
  const targetSize = findings.find((finding) => finding.id === "target-size");
  const targets = targetSize ? await page.evaluate(({ names, candidates }) => {
    const groups = document.querySelectorAll(
      ':is(nav,[role="navigation"])[aria-label="Primary"] [role="radiogroup"][aria-label="Palette"]',
    );
    if (groups.length !== 1) return [];
    const radios = [...groups[0].querySelectorAll('[role="radio"]')];
    if (radios.length !== names.length) return [];
    const boxes = radios.map((radio) => radio.getBoundingClientRect());
    const near = (a: number, b: number) => Math.abs(a - b) <= 0.25;
    if (!radios.every((radio, index) => radio.getAttribute("aria-label") === names[index]
      && ["true", "false"].includes(radio.getAttribute("aria-checked") ?? "")
      && near(boxes[index].width, 16) && near(boxes[index].height, 16)
      && near(boxes[index].y, boxes[0].y)
      && (index === 0 || near(boxes[index].x - boxes[index - 1].x, 22)))) return [];
    return candidates.filter((target) => {
      try {
        const matches = document.querySelectorAll(target);
        return matches.length === 1 && radios.includes(matches[0]);
      } catch { return false; }
    });
  }, {
    names: PALETTE_NAMES,
    candidates: targetSize.raw.nodes.flatMap((node) =>
      node.target.length === 1 && typeof node.target[0] === "string" ? [node.target[0]] : []),
  }) : [];
  return partitionAuthoredPaletteTargets(findings, new Set(targets));
}

/** Whole-page scan: attach every raw finding before enforcing the authored shell policy. */
export async function scanPage(
  page: Page,
  testInfo: Pick<TestInfo, "attach" | "annotations">,
  name: string,
  rules?: string[],
) {
  const findings = rules ? await scanStructure(page, "body", rules) : await scan(page, "body");
  await attach(testInfo, name, findings);
  const { enforced, excepted } = await shellReferencePolicy(page, findings);
  if (excepted.length > 0) {
    testInfo.annotations.push({ type: "authored-reference", description: PALETTE_TARGET_REFERENCE_NOTE });
    await testInfo.attach(`axe-${name}-authored-reference-exceptions.json`, {
      body: JSON.stringify({ reason: PALETTE_TARGET_REFERENCE_NOTE, violations: excepted.map(({ raw }) => raw) }, null, 2),
      contentType: "application/json",
    });
  }
  return enforced;
}

/** Pure policy boundary: retain unrelated nodes, and fail closed if the five differ. */
export function partitionAuthoredPaletteTargets(findings: Violation[], liveTargets: ReadonlySet<string>) {
  const excepted: RawViolation[] = [];
  const enforced = findings.map((finding) => {
    if (finding.id !== "target-size" || liveTargets.size !== PALETTE_NAMES.length) return finding.raw;
    const eligible = finding.raw.nodes.filter((node) => {
      if (node.target.length !== 1 || typeof node.target[0] !== "string" || !liveTargets.has(node.target[0])) return false;
      const size = node.any.find((check) => check.id === "target-size")?.data;
      const offset = node.any.find((check) => check.id === "target-offset")?.data;
      return size?.width === 16 && size?.height === 16 && size?.minSize === 24
        && offset?.closestOffset === 20 && offset?.minOffset === 24;
    });
    if (eligible.length !== PALETTE_NAMES.length
      || new Set(eligible.map((node) => node.target[0])).size !== PALETTE_NAMES.length) return finding.raw;
    const accepted = new Set(eligible);
    excepted.push({ ...finding.raw, nodes: eligible });
    return { ...finding.raw, nodes: finding.raw.nodes.filter((node) => !accepted.has(node)) };
  }).filter((violation) => violation.nodes.length > 0);
  return { enforced: summarize(enforced), excepted: summarize(excepted) };
}

/** Keep the compact report and attach unabridged rule/node/check diagnostics. */
export async function attach(testInfo: Pick<TestInfo, "attach">, name: string, violations: Violation[]): Promise<void> {
  if (violations.length === 0) return;
  await testInfo.attach(`axe-${name}.json`, {
    body: JSON.stringify(violations.map(({ raw: _raw, ...summary }) => summary), null, 2),
    contentType: "application/json",
  });
  await testInfo.attach(`axe-${name}-raw.json`, {
    body: JSON.stringify(violations.map(({ raw }) => raw), null, 2),
    contentType: "application/json",
  });
}

/** One line per violation, for the failure message. */
export function describe(violations: Violation[]): string {
  return violations.map((v) => `  ${v.impact} ${v.id}: ${v.help} (${v.nodes} node(s), first at ${v.target})`).join("\n");
}
