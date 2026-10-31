/**
 * The scheme switch repaints the page.
 *
 * Worth its own test because of how it failed before: the screenshot script this
 * suite replaced used to set a `canvas-theme` localStorage key that no part of the
 * docs app reads (it belongs to the kit's web CSS hand-off, which the docs do not
 * use), so an entire "light" screenshot set was really dark and nothing said so.
 * Reading the scheme back off the painted pixels is what makes a silent no-op fail.
 */
import { accentOf, gotoDocs, pageChannels, readAccent, readPageLook, readScheme } from "../support/docs";
import { expect, test } from "../support/fixtures";
import type { Page } from "@playwright/test";

// The pill navbar's Dark | Light switch (docs/src/shell/pill-nav.tsx), a kit ButtonGroup
// segmented control: a tablist named Scheme.
function schemeTab(page: Page, scheme: "Dark" | "Light") {
  return page.getByRole("banner").getByRole("tablist", { name: "Scheme", exact: true }).getByRole("tab", { name: scheme, exact: true });
}

test("the scheme switch really changes what is painted", async ({ page }) => {
  await gotoDocs(page, "/components/button", { scheme: "dark" });
  const light = schemeTab(page, "Light");
  const dark = schemeTab(page, "Dark");
  await expect(dark).toHaveAttribute("aria-selected", "true");

  await light.click();
  await expect.poll(() => readScheme(page)).toBe("light");
  await expect(light).toHaveAttribute("aria-selected", "true");

  await dark.click();
  await expect.poll(() => readScheme(page)).toBe("dark");
});

test("the launch URL seeds the scheme, and a later navigation does not re-seed it", async ({ page }) => {
  // The docs store nothing by privacy declaration, so ?scheme is the only way to open
  // a shared link, or a capture, in a chosen look. It is read ONCE, at launch, by a
  // lazy useState initializer: a later client-side navigation must not fight the
  // in-app toggle. That second half is what this asserts, since gotoDocs already
  // waits for the first.
  await gotoDocs(page, "/components/button", { scheme: "light" });

  await schemeTab(page, "Dark").click();
  await expect.poll(() => readScheme(page)).toBe("dark");

  // Navigate within the app and back again: the back navigation is client-side too, and
  // lands on the launch URL, which still says scheme=light; the switch must win.
  await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Controls", exact: true }).click();
  await expect(page).toHaveURL(/\/controls(?:\?|$)/);
  await page.goBack();
  await expect(page).toHaveURL(/\/components\/button\?.*scheme=light/);
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

test("the pill's Palette control picks the accent in either scheme", async ({ page }) => {
  // The palette control is the pill navbar's five hue swatches (docs/src/shell/pill-nav.tsx),
  // at every width: the page opens at phone width, where the pill scrolls sideways and the
  // swatches sit past its links. It opens dark, where the control shows too: a palette
  // paints its accent in both schemes.
  await gotoDocs(page, "/components/button", { scheme: "dark", viewport: { width: 390, height: 900 } });
  const banner = page.getByRole("banner");
  const palette = banner.getByRole("radiogroup", { name: "Palette", exact: true });
  await expect(palette).toHaveCount(1);
  const violet = palette.getByRole("radio", { name: "Violet", exact: true });
  const mint = palette.getByRole("radio", { name: "Mint", exact: true });
  await expect(violet).toHaveAttribute("aria-checked", "true");

  // Mint picked while dark: the dark page stays, the choice holds into the light scheme.
  await mint.click();
  await expect(mint).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => readAccent(page)).toBe(accentOf("dark", "mint"));
  expect(await readPageLook(page)).toEqual(pageChannels("dark"));
  await schemeTab(page, "Light").click();
  await expect.poll(() => readScheme(page)).toBe("light");
  await expect.poll(() => readAccent(page)).toBe(accentOf("light", "mint"));

  await violet.click();
  await expect(violet).toHaveAttribute("aria-checked", "true");
  await expect.poll(() => readAccent(page)).toBe(accentOf("light", "violet"));
});
