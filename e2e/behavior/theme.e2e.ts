/**
 * The scheme toggle repaints the page.
 *
 * Worth its own test because of how it failed before: the screenshot script this
 * suite replaced used to set a `canvas-theme` localStorage key that no part of the
 * docs app reads (it belongs to the kit's web CSS hand-off, which the docs do not
 * use), so an entire "light" screenshot set was really dark and nothing said so.
 * Reading the scheme back off the painted pixels is what makes a silent no-op fail.
 */
import { colorsFor } from "../../src/style/tokens.ts";
import { channels, gotoDocs, readBackground, readScheme } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("the toggle really changes what is painted", async ({ page }) => {
  await gotoDocs(page, "/components/button", { scheme: "dark" });
  const toggle = page.getByLabel("Toggle color scheme").first();
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect.poll(() => readScheme(page)).toBe("light");

  await toggle.click();
  await expect.poll(() => readScheme(page)).toBe("dark");
});

test("the launch URL seeds the scheme, and a later navigation does not re-seed it", async ({ page }) => {
  // The docs store nothing by privacy declaration, so ?scheme is the only way to open
  // a shared link, or a capture, in a chosen look. It is read ONCE, at launch, held in
  // a ref: a later client-side navigation must not fight the in-app toggle. That
  // second half is what this asserts, since gotoDocs already waits for the first.
  await gotoDocs(page, "/components/button", { scheme: "light" });

  await page.getByLabel("Toggle color scheme").first().click();
  await expect.poll(() => readScheme(page)).toBe("dark");

  // Navigate within the app. The URL still says scheme=light; the toggle must win.
  await page.getByRole("tab").nth(1).click();
  await expect(page).toHaveURL(/scheme=light/);
  expect(await readScheme(page), "a client-side navigation re-seeded the scheme").toBe("dark");
});

test("?palette=mint paints the mint background", async ({ page }) => {
  // gotoDocs itself fails when a page paints light in the wrong palette. This pins
  // what that check rests on: the mint seed reaches the kit's ThemeProvider, and the
  // two light palettes differ on the backdrop, so the check cannot pass by chance.
  await gotoDocs(page, "/components/button", { scheme: "light", palette: "mint" });
  const painted = await readBackground(page);
  expect(painted).toEqual(channels(colorsFor("mint", "light").background));
  expect(painted).not.toEqual(channels(colorsFor("blush", "light").background));
});

test("scheme=dark&palette=mint paints dark: the kit lets dark win over mint", async ({ page }) => {
  await gotoDocs(page, "/components/button", { scheme: "dark", palette: "mint" });
  expect(await readScheme(page)).toBe("dark");
  expect(await readBackground(page)).toEqual(channels(colorsFor("mint", "dark").background));
});
