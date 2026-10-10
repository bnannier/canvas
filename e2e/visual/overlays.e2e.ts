/**
 * A picture of every overlay while it is open.
 *
 * The component baselines catch the resting state; an overlay's whole point is the
 * state you cannot see at rest. An open dialog's scrim, a menu's elevation, a
 * listbox's selected row: none of that appears in the card shot.
 *
 * Anchored overlays are placed within the Playground's stage (a card that closes on
 * an outside tap paints in the app root's outlet, over the stage), so the stage is the
 * frame: its screenshot takes whatever is painted over it. Drawer and ActionSheet go
 * through react-native-web's Modal, which renders at the document root, so those two
 * are full-page. Every overlay opens with the stage at the top of the page's scrollport,
 * so the prose a page carries above its stage moves none of these pictures.
 */
import { OVERLAYS } from "../support/overlays";
import { FIXED_TIME, fitElementForScreenshot, gotoDocs, settledBox, stage } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const scheme of ["dark", "light"] as const) {
  for (const recipe of OVERLAYS) {
    test(`${recipe.slug} open in ${scheme}`, async ({ page }) => {
      await page.clock.setFixedTime(FIXED_TIME);
      await gotoDocs(page, `/components/${recipe.slug}`, { scheme, surface: "solid" });
      await expect(stage(page)).toBeVisible();
      // Open it from the same place on every page: the stage at the top of the page's
      // scrollport, under the banner. Where the page left the stage is set by the prose
      // above it, and an anchored card keeps the side it opened on while that side still
      // fits, so a Select opened from the bottom of the window stays above its field after
      // the shot scrolls it into view. When the component pages gained their overview
      // (48fde0fa) the Select and Autocomplete shots flipped above their fields that way.
      await fitElementForScreenshot(page, stage(page));

      await recipe.open(page);
      await expect(recipe.panel(page).last()).toBeVisible();
      // Visible is not settled. An anchored overlay portals into the stage, and the
      // stage grows to hold it a layout pass LATER, so a shot taken here catches the
      // closed height. toHaveScreenshot's own retry stabilises pixels, not the box,
      // so it cannot see the difference: it happily agreed with itself twice at the
      // wrong size and minted a baseline of a dialog that had not opened yet.
      await settledBox(stage(page));

      const name = `overlays/${recipe.slug}--${scheme}.png`;
      if (recipe.atDocumentRoot) {
        await expect(page).toHaveScreenshot(name, { fullPage: false });
      } else {
        await fitElementForScreenshot(page, stage(page));
        await expect(recipe.panel(page).last()).toBeVisible();
        await expect(stage(page)).toHaveScreenshot(name);
        await expect(recipe.panel(page).last()).toBeVisible();
      }
    });
  }
}
