/**
 * A picture of every overlay while it is open.
 *
 * The component baselines catch the resting state; an overlay's whole point is the
 * state you cannot see at rest. An open dialog's scrim, a menu's elevation, a
 * listbox's selected row: none of that appears in the card shot.
 *
 * Anchored overlays portal into the Playground's stage outlet, so the stage is the
 * frame. Drawer and ActionSheet go through react-native-web's Modal, which renders at
 * the document root, so those two are full-page.
 */
import { OVERLAYS } from "../support/overlays";
import { gotoDocs, stage } from "../support/docs";
import { expect, test } from "../support/fixtures";

const FIXED_TIME = new Date("2026-01-15T12:00:00Z");
/** Overlays that render outside the stage, through a Modal at the document root. */
const AT_DOCUMENT_ROOT = new Set(["drawer", "action-sheet"]);

for (const scheme of ["dark", "light"] as const) {
  for (const recipe of OVERLAYS) {
    test(`${recipe.slug} open in ${scheme}`, async ({ page }) => {
      await page.clock.setFixedTime(FIXED_TIME);
      await gotoDocs(page, `/components/${recipe.slug}`, { scheme, surface: "solid" });
      await expect(stage(page)).toBeVisible();

      await recipe.open(page);
      await expect(recipe.panel(page).last()).toBeVisible();

      const name = `overlays/${recipe.slug}--${scheme}.png`;
      if (AT_DOCUMENT_ROOT.has(recipe.slug)) {
        await expect(page).toHaveScreenshot(name, { fullPage: false });
      } else {
        await expect(stage(page)).toHaveScreenshot(name);
      }
    });
  }
}
