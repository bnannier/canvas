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
import { gotoDocs, previewCard, settledBox } from "../support/docs";
import { expect, test } from "../support/fixtures";

// Several examples render today's date or a live-looking clock. A fixed instant makes
// them the same picture tomorrow.
const FIXED_TIME = new Date("2026-01-15T12:00:00Z");

for (const scheme of ["dark", "light"] as const) {
  for (const route of componentRoutes()) {
    test(`${route.name} in ${scheme}`, async ({ page }) => {
      await page.clock.setFixedTime(FIXED_TIME);
      // Solid, always: the glass material is GPU-dependent, so a frosted baseline
      // would differ between machines for reasons that are not defects.
      await gotoDocs(page, route.path, { scheme, surface: "solid" });
      const card = previewCard(page).first();
      await expect(card).toBeVisible();
      // A card holding a self-measuring component settles a pass after it appears.
      await settledBox(card);
      await expect(card).toHaveScreenshot(`components/${route.name}--${scheme}.png`);
    });
  }
}
