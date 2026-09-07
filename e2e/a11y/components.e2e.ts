/**
 * Every component page, scanned by axe.
 *
 * Scoped to the web row: that is the react-native-web output a consumer ships, and it
 * is the only row this browser is actually rendering for real. Overlay components are
 * scanned twice, once at rest and once with the overlay open, because a menu, a
 * dialog and a listbox are exactly where the roles and the relationships live.
 *
 * Set E2E_AXE_REPORT=1 to attach findings without failing, which is how the list of
 * known react-native-web rules in ../support/axe.ts was arrived at.
 */
import { componentRoutes } from "../support/routes";
import { gotoDocs, platformRow } from "../support/docs";
import { OVERLAYS } from "../support/overlays";
import { BLOCKING_IMPACTS, attach, describe as describeViolations, scan } from "../support/axe";
import { expect, test } from "../support/fixtures";

const REPORT_ONLY = process.env.E2E_AXE_REPORT === "1";
const overlayFor = new Map(OVERLAYS.map((recipe) => [recipe.slug, recipe]));

/**
 * Findings that stand today, by component and rule.
 *
 * Every one was surfaced by the first run of this suite, and every one is real: none
 * is a rule the kit disagrees with (those live in KNOWN_RNW_RULES, and there is
 * exactly one). They are recorded rather than suppressed so the gate is meaningful
 * everywhere else: a component not listed here must be clean, and a listed one must
 * not grow a rule it does not already have.
 *
 * The list is checked against itself: an entry naming a rule the component no longer
 * trips fails, so fixing something forces the entry out and the list cannot rot.
 */
const KNOWN_FINDINGS: Record<string, string[]> = {
  // A role="listbox" / "slider" / "progressbar" with no accessible name. The
  // components accept accessibilityLabel and forward it; what they do not do is
  // require one or fall back to something, so an example that omits it ships an
  // unnamed control. The fix is per component and is a change to their public
  // contract, so it is its own piece of work.
  listbox: ["aria-input-field-name"],
  slider: ["aria-input-field-name"],
  stepper: ["aria-input-field-name", "nested-interactive"],
  progress: ["aria-progressbar-name"],
  spinner: ["aria-progressbar-name"],
  command: ["aria-input-field-name", "aria-valid-attr-value"],
  select: ["aria-input-field-name", "label"],
  autocomplete: ["aria-input-field-name", "aria-required-attr", "target-size"],
  // Form fields inside the overlay's own example content, with a placeholder but no
  // label. Docs-side, in the example rather than in the component.
  dialog: ["label"],
  popover: ["label"],
  // Attributes the element's role does not allow. Kit-side, and narrow.
  calendar: ["aria-allowed-attr"],
  carousel: ["aria-allowed-attr", "target-size"],
  // A pressable row wrapping a pressable control, and focusable content inside an
  // aria-hidden subtree. Both kit-side and both structural.
  "filter-panel": ["nested-interactive", "aria-hidden-focus"],
  // The cancel row's label against the sheet fill.
  "action-sheet": ["color-contrast"],
};

for (const route of componentRoutes()) {
  const recipe = overlayFor.get(route.name);

  test(`${route.name} has no serious accessibility violations`, async ({ page }, testInfo) => {
    await gotoDocs(page, route.path, { scheme: "dark" });
    await expect(platformRow(page, "web").first()).toBeVisible();

    const findings = await scan(page, '[data-platform-row="web"]');
    await attach(testInfo, route.name, findings);

    if (recipe) {
      // An open overlay portals OUT of the row, so it is scanned as part of the page.
      await recipe.open(page);
      await expect(recipe.panel(page).last()).toBeVisible();
      const openFindings = await scan(page, "body");
      await attach(testInfo, `${route.name}-open`, openFindings);
      findings.push(...openFindings);
    }

    const blocking = findings.filter((f) => BLOCKING_IMPACTS.has(f.impact));
    if (REPORT_ONLY) {
      if (blocking.length > 0) console.log(`${route.name}\n${describeViolations(blocking)}`);
      return;
    }

    const known = KNOWN_FINDINGS[route.name] ?? [];
    const unexpected = blocking.filter((f) => !known.includes(f.id));
    expect(unexpected, `${route.name} has a NEW violation:\n${describeViolations(unexpected)}`).toEqual([]);

    // The other half of the contract: an entry that no longer fires has to go, or the
    // list slowly becomes a description of a codebase that no longer exists.
    const fixed = known.filter((id) => !blocking.some((f) => f.id === id));
    expect(
      fixed,
      `${route.name} no longer trips ${fixed.join(", ")}; delete it from KNOWN_FINDINGS`,
    ).toEqual([]);
  });
}
