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
  // a shared link, or a capture, in a chosen look. It is read ONCE, at launch, by a
  // lazy useState initializer: a later client-side navigation must not fight the
  // in-app toggle. That second half is what this asserts, since gotoDocs already
  // waits for the first.
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

test("the drawer's Palette control repaints the backdrop, and is absent while dark", async ({ page }) => {
  // On the web the Blush/Mint control is carried only by the labelled appearance form,
  // the phone web drawer's footer (docs/src/shell/navbar.tsx), so the page opens at phone
  // width. It opens dark, where the control has nothing to paint and is not rendered.
  await gotoDocs(page, "/components/button", { scheme: "dark", viewport: { width: 390, height: 900 } });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  const scheme = drawer.getByRole("button", { name: "Toggle color scheme", exact: true });
  const palette = drawer.getByRole("tablist", { name: "Palette", exact: true });
  await expect(scheme).toBeVisible();
  await expect(palette).toHaveCount(0);

  await scheme.click();
  await expect.poll(() => readScheme(page)).toBe("light");
  await expect(palette).toBeVisible();
  const blush = palette.getByRole("tab", { name: "Blush", exact: true });
  const mint = palette.getByRole("tab", { name: "Mint", exact: true });
  await expect(blush).toHaveAttribute("aria-selected", "true");
  expect(await readBackground(page)).toEqual(channels(colorsFor("blush", "light").background));

  await mint.click();
  await expect(mint).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => readBackground(page)).toEqual(channels(colorsFor("mint", "light").background));

  await blush.click();
  await expect(blush).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => readBackground(page)).toEqual(channels(colorsFor("blush", "light").background));

  // Mint picked, then dark: the control goes, and the kit paints its one dark palette.
  await mint.click();
  await expect.poll(() => readBackground(page)).toEqual(channels(colorsFor("mint", "light").background));
  await scheme.click();
  await expect.poll(() => readScheme(page)).toBe("dark");
  await expect(palette).toHaveCount(0);
  expect(await readBackground(page)).toEqual(channels(colorsFor("mint", "dark").background));
});
