/**
 * The scheme toggle repaints the page.
 *
 * Worth its own test because of how it failed before: the screenshot script this
 * suite replaced used to set a `canvas-theme` localStorage key that no part of the
 * docs app reads (it belongs to the kit's web CSS hand-off, which the docs do not
 * use), so an entire "light" screenshot set was really dark and nothing said so.
 * Reading the scheme back off the painted pixels is what makes a silent no-op fail.
 */
import { accentOf, gotoDocs, pageChannels, readAccent, readPageLook, readScheme } from "../support/docs";
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

test("?palette=mint paints the light page with the mint accent", async ({ page }) => {
  // gotoDocs itself fails when a page resolves the wrong palette. This pins what that
  // check rests on: the mint seed reaches the kit's ThemeProvider, the page stays the
  // scheme's flat page (the v4 page is the same in every palette), and the two accents
  // differ, so the check cannot pass by chance.
  await gotoDocs(page, "/components/button", { scheme: "light", palette: "mint" });
  expect(await readPageLook(page)).toEqual(pageChannels("light"));
  expect(await readAccent(page)).toBe(accentOf("light", "mint"));
  expect(accentOf("light", "mint")).not.toBe(accentOf("light", "violet"));
});

test("scheme=dark&palette=mint paints the dark page, with the mint accent", async ({ page }) => {
  await gotoDocs(page, "/components/button", { scheme: "dark", palette: "mint" });
  expect(await readScheme(page)).toBe("dark");
  expect(await readPageLook(page)).toEqual(pageChannels("dark"));
  expect(await readAccent(page)).toBe(accentOf("dark", "mint"));
});

test("the drawer's Palette control picks the accent in either scheme", async ({ page }) => {
  // On the web the palette control is carried only by the labelled appearance form, the
  // phone web drawer's footer (docs/src/shell/navbar.tsx), so the page opens at phone
  // width. It opens dark, where the control shows too: a palette paints its accent in
  // both schemes.
  await gotoDocs(page, "/components/button", { scheme: "dark", viewport: { width: 390, height: 900 } });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  const scheme = drawer.getByRole("button", { name: "Toggle color scheme", exact: true });
  const palette = drawer.getByRole("tablist", { name: "Palette", exact: true });
  await expect(scheme).toBeVisible();
  await expect(palette).toBeVisible();
  const violet = palette.getByRole("tab", { name: "Violet", exact: true });
  const mint = palette.getByRole("tab", { name: "Mint", exact: true });
  await expect(violet).toHaveAttribute("aria-selected", "true");

  // Mint picked while dark: the dark page stays, the choice holds into the light scheme.
  await mint.click();
  await expect(mint).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => readAccent(page)).toBe(accentOf("dark", "mint"));
  expect(await readPageLook(page)).toEqual(pageChannels("dark"));
  await scheme.click();
  await expect.poll(() => readScheme(page)).toBe("light");
  await expect.poll(() => readAccent(page)).toBe(accentOf("light", "mint"));

  await violet.click();
  await expect(violet).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => readAccent(page)).toBe(accentOf("light", "violet"));
});
