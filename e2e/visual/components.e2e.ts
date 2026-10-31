/**
 * A picture of every component's preview card, in both schemes.
 *
 * This is the check that catches what nothing else can: a token change that quietly
 * repaints half the kit, a skin edit that moves a corner, a shadow that lost its
 * blur. The other suites assert facts about the DOM; this one asserts the pixels.
 *
 * Scoped to `[data-preview-card]`, the three platform rows without the switcher or
 * the code block, so an unrelated docs change does not rewrite 204 baselines.
 *
 * Baselines are Linux, because the CI runner rasterizes them. macOS renders the same
 * DOM with different glyph metrics, which shifts layout by whole pixels, so a run
 * anywhere else executes every flow (selector rot still fails) and compares nothing.
 * See the `visual` project in playwright.config.ts.
 */
import { componentRoutes } from "../support/routes";
import { FIXED_TIME, fitElementForScreenshot, gotoDocs, previewCard, stage, paintedPreviewPanels } from "../support/docs";
import { DETAIL_SPECS } from "../../docs/src/core/data/detail-specs";
import { expect, test } from "../support/fixtures";

const PANEL_ROLES: Record<string, "alert" | "menu" | "listbox" | undefined> = {
  tooltip: "alert", dropdown: "menu", "row-menu": "menu", select: "listbox", autocomplete: "listbox", command: "listbox",
};

for (const scheme of ["dark", "light"] as const) {
  for (const route of componentRoutes()) {
    test(`${route.name} in ${scheme}`, async ({ page }) => {
      await page.clock.setFixedTime(FIXED_TIME);
      // Solid, always: the glass material is GPU-dependent, so a frosted baseline
      // would differ between machines for reasons that are not defects.
      await gotoDocs(page, route.path, { scheme, surface: "solid" });
      const card = previewCard(page).first();
      await expect(card).toBeVisible();
      // Settle self-measuring examples and fit tall cards before Chromium crops them.
      await fitElementForScreenshot(page, card);
      const role = PANEL_ROLES[route.name];
      const spec = DETAIL_SPECS[route.name];
      const pinnedOpen = spec?.knobs.some(knob => knob.kind === "boolean" && knob.prop === "open" && knob.value);
      if (role && pinnedOpen) {
        await paintedPreviewPanels(card, stage(page).locator("..").getByRole(role), 3);
      }
      await expect(card).toHaveScreenshot(`components/${route.name}--${scheme}.png`);
    });
  }
}
