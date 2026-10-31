/**
 * Every component's preview flow and approved frame dimensions, in both schemes.
 *
 * The default gate checks frame dimensions alongside the existing visible-state
 * assertions. It cannot detect color or minor pixel regressions. Exact SHA256
 * comparison is an opt-in diagnostic (`bun run e2e:pixels`), because unchanged
 * browser renders have raster variations the former image matcher tolerated.
 *
 * Scoped to `[data-preview-card]`, the three platform rows without the switcher or
 * the code block, so an unrelated docs change does not rewrite the pixel approvals.
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
import { expectVisualDimensions } from "../support/visual-digests";

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
      await expectVisualDimensions(card, `components/${route.name}--${scheme}`);
    });
  }
}
