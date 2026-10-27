/**
 * The token stylesheet, rendered the way a consumer links it.
 *
 * test/tokens.html pulls in styles/canvas.css exactly as a web consumer would, so
 * this is the one baseline that photographs the CSS hand-off rather than the React
 * Native kit. It replaces the screenshot script that used to shoot this fixture, whose
 * 5% pixel and 1% dimension tolerances existed only to paper over the difference
 * between the macOS machine that minted its baselines and whatever machine ran it
 * next. Linux-only baselines remove the reason for the tolerance.
 *
 * Served by the second web server in playwright.config.ts, from the checkout root.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TOKENS_URL } from "../../playwright.config";
import { expect, test } from "../support/fixtures";
import { paletteDeclarations } from "../../tools/tokens/css-tokens.ts";
import { colorsFor } from "../../src/style/tokens.ts";

for (const scheme of ["light", "dark"] as const) {
  test(`the token stylesheet in ${scheme}`, async ({ page }) => {
    await page.goto(TOKENS_URL, { waitUntil: "networkidle" });
    // The stylesheet keys dark off a `.dark` class on the root, never
    // prefers-color-scheme, so this is how a consumer switches it too.
    await page.evaluate((wantDark) => {
      document.documentElement.classList.toggle("dark", wantDark);
    }, scheme === "dark");
    await expect(page).toHaveScreenshot(`tokens--${scheme}.png`, { fullPage: true });
  });
}

// The palette axis, where it actually resolves: the browser's cascade. A palette is one
// --hue (on the root or on any wrapper) and paints its accent in both schemes; a wrapper's
// own hue wins over the root's, and the scheme decides the neutrals and the accent's
// lightness. Values come from the stylesheet itself (paletteDeclarations resolves the
// oklch forms for a palette), and the browser's computed accent is compared as the
// clipped sRGB it paints.
const colorsCss = readFileSync(resolve(__dirname, "../../styles/tokens/colors.css"), "utf8");
const looks = {
  violetLight: paletteDeclarations(colorsCss, "violet", "light"),
  mintLight: paletteDeclarations(colorsCss, "mint", "light"),
  mintDark: paletteDeclarations(colorsCss, "mint", "dark"),
  roseDark: paletteDeclarations(colorsCss, "rose", "dark"),
};

test("a palette paints its accent in either scheme, on the root or a wrapper", async ({ page }) => {
  await page.goto(TOKENS_URL, { waitUntil: "networkidle" });
  const read = (setup: { rootDark: boolean; rootPalette?: string; wrapperPalette?: string; wrapperDark?: boolean }) => page.evaluate((s) => {
    const root = document.documentElement;
    root.classList.toggle("dark", s.rootDark);
    if (s.rootPalette) root.dataset.palette = s.rootPalette; else delete root.dataset.palette;
    const wrapper = document.createElement("div");
    if (s.wrapperPalette) wrapper.dataset.palette = s.wrapperPalette;
    if (s.wrapperDark) wrapper.classList.add("dark");
    document.body.append(wrapper);
    // The accent through a real paint: a canvas fill reads back the sRGB the browser drew.
    const paint = (node: Element) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--primary)";
      node.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `#${[r, g, b].map((c) => c!.toString(16).padStart(2, "0")).join("")}`;
    };
    const at = (node: Element) => ({ background: getComputedStyle(node).getPropertyValue("--background").trim(), primary: paint(node) });
    const values = { root: at(root), wrapper: at(wrapper) };
    wrapper.remove();
    delete root.dataset.palette;
    root.classList.remove("dark");
    return values;
  }, setup);
  const near = (a: string, b: string) =>
    Math.max(...[1, 3, 5].map((i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)))) <= 1;
  const expectLook = (seen: { background: string; primary: string }, look: Record<string, string>, hex: string, name: string) => {
    expect(seen.background, name).toBe(look.background);
    expect(near(seen.primary, hex), `${name}: ${seen.primary} vs ${hex}`).toBe(true);
  };

  let seen = await read({ rootDark: false });
  expectLook(seen.root, looks.violetLight, colorsFor("violet", "light").primary, "no attribute: violet");
  seen = await read({ rootDark: false, rootPalette: "mint" });
  expectLook(seen.root, looks.mintLight, colorsFor("mint", "light").primary, "mint on the root");
  seen = await read({ rootDark: true, rootPalette: "mint" });
  expectLook(seen.root, looks.mintDark, colorsFor("mint", "dark").primary, "dark and mint on the root: the mint accent in the dark scheme");
  seen = await read({ rootDark: false, wrapperPalette: "mint" });
  expectLook(seen.root, looks.violetLight, colorsFor("violet", "light").primary, "a mint wrapper leaves the root violet");
  expectLook(seen.wrapper, looks.mintLight, colorsFor("mint", "light").primary, "a mint wrapper in a light root");
  seen = await read({ rootDark: true, wrapperPalette: "rose" });
  expectLook(seen.wrapper, looks.roseDark, colorsFor("rose", "dark").primary, "a rose wrapper inside a dark root paints dark rose");
  seen = await read({ rootDark: false, rootPalette: "mint", wrapperDark: true });
  expectLook(seen.wrapper, looks.mintDark, colorsFor("mint", "dark").primary, "a dark wrapper inside a mint root is dark mint");
});

test("increased contrast turns the glass opaque inside palette and scheme wrappers too", async ({ page }) => {
  await page.goto(TOKENS_URL, { waitUntil: "networkidle" });
  await page.emulateMedia({ contrast: "more" });
  const tints = await page.evaluate(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.dataset.surface = "glass";
    const read = (setup: (node: HTMLElement) => void) => {
      const wrapper = document.createElement("div");
      setup(wrapper);
      document.body.append(wrapper);
      const tint = getComputedStyle(wrapper).getPropertyValue("--glass-tint").trim();
      wrapper.remove();
      return tint;
    };
    const values = {
      root: getComputedStyle(root).getPropertyValue("--glass-tint").trim(),
      mint: read((node) => { node.dataset.palette = "mint"; }),
      dark: read((node) => { node.classList.add("dark"); }),
    };
    delete root.dataset.surface;
    return values;
  });
  // The fallback points each tint at an opaque token, so none stays a translucent rgba().
  for (const [where, tint] of Object.entries(tints)) expect(tint, where).not.toMatch(/^rgba\(/);
});
