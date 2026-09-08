/**
 * Every component page, scanned by axe.
 *
 * Scoped to the web row: that is the react-native-web output a consumer ships, and it
 * is the only row this browser is actually rendering for real. Overlay components are
 * scanned twice, once at rest and once with the overlay open, because a menu, a
 * dialog and a listbox are exactly where the roles and the relationships live.
 *
 * Set E2E_AXE_REPORT=1 to attach findings without failing during an investigation.
 * The normal gate permits no serious or critical violations.
 */
import { componentRoutes } from "../support/routes";
import { gotoDocs, platformRow } from "../support/docs";
import { OVERLAYS } from "../support/overlays";
import { BLOCKING_IMPACTS, attach, describe as describeViolations, scan } from "../support/axe";
import { expect, test } from "../support/fixtures";

const REPORT_ONLY = process.env.E2E_AXE_REPORT === "1";
const overlayFor = new Map(OVERLAYS.map((recipe) => [recipe.slug, recipe]));

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

    expect(
      blocking,
      `${route.name} has a serious or critical violation:\n${describeViolations(blocking)}`,
    ).toEqual([]);
  });
}
