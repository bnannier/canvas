import type { Locator } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const PANEL_SELECTOR = '[data-testid^="library-panel-"]';

async function restingCollageFit(collage: Locator) {
  return collage.evaluate((node, panelSelector) => {
    const frame = node.getBoundingClientRect();
    const boxes = Array.from(node.querySelectorAll(panelSelector))
      .filter(panel => Number(getComputedStyle(panel).opacity) > 0)
      .map(panel => panel.getBoundingClientRect());
    const left = Math.min(...boxes.map(rect => rect.left));
    const right = Math.max(...boxes.map(rect => rect.right));
    const frameCenter = (frame.left + frame.right) / 2;
    return {
      visiblePanels: boxes.length,
      fitsViewportWidth: boxes.every(box => box.width > 0 && box.height > 0 && box.left >= 0 && box.right <= window.innerWidth),
      fitsColumnWidth: left >= frame.left && right <= frame.right,
      // The layout centers the full rotation pool. The opening glass panel sits slightly inside that envelope.
      openingCentered: Math.abs((left + right) / 2 - frameCenter) < 3,
      fillsPhoneColumn: (right - left) / frame.width > 0.9,
    };
  }, PANEL_SELECTOR);
}

for (const width of [320, 390, 430, 640, 768, 820, 1024, 1180, 1440]) {
  test(`the homepage hero fits its viewport at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/", { viewport: { width, height: 900 } });
    const hero = page.getByTestId("library-hero");
    const collage = hero.getByTestId("library-collage");
    await expect(collage.locator(PANEL_SELECTOR)).toHaveCount(6);
    // The hero clips its decorative glow, so document scrollWidth alone cannot
    // detect an illustration cut off inside it. Measure the resting projection.
    await expect.poll(() => restingCollageFit(collage)).toMatchObject({
      visiblePanels: 6,
      fitsViewportWidth: true,
      ...(width <= 1024 ? { fitsColumnWidth: true, openingCentered: true } : {}),
      ...(width <= 640 ? { fillsPhoneColumn: true } : {}),
    });
    await expect.poll(() => page.locator("[data-page-scroll]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
    const appStore = hero.getByRole("link", { name: "Download Canvas on the App Store" });
    await expect(appStore).toHaveAttribute("href", "https://apps.apple.com/app/id6794454098");
    const githubBox = (await hero.getByRole("link", { name: "View Canvas on GitHub" }).boundingBox())!;
    const storeBox = (await appStore.boundingBox())!;
    expect(storeBox.x).toBeGreaterThan(githubBox.x + githubBox.width);
    expect(Math.abs((storeBox.y + storeBox.height / 2) - (githubBox.y + githubBox.height / 2))).toBeLessThan(1);
    if (width <= 640) {
      const bar = await page.locator("[data-shell-mobile-top]").boundingBox();
      const eyebrow = await hero.getByText(/^Canvas v.+ · Component library$/).boundingBox();
      expect(eyebrow!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height + 16);
      const heading = hero.getByRole("heading", { level: 1 });
      await expect.poll(async () => (await heading.boundingBox())?.x).toBe(24);
      await expect.poll(async () => (await collage.boundingBox())!.height).toBeLessThan(580);
      const github = hero.getByRole("link", { name: "View Canvas on GitHub" });
      await expect(github).toHaveAttribute("href", "https://github.com/bnannier/canvas");
      await expect(github.locator("svg")).toBeVisible();
      for (const name of ["Explore components", "View Canvas on GitHub", "Download Canvas on the App Store"]) {
        const link = hero.getByRole("link", { name: new RegExp(name) });
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(24);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width - 24);
      }
    }
  });
}

// Rotation and the mobile/desktop shell handoff must update the existing hero,
// including when its collage column grows beyond the authored 648 px canvas.
test.describe("the live tablet hero", () => {
  test.use({ contextOptions: { reducedMotion: "reduce", hasTouch: true } });

  test("centres its resting collage after portrait and landscape resizes", async ({ page }) => {
    await gotoDocs(page, "/", { viewport: { width: 820, height: 1180 } });
    const collage = page.getByTestId("library-collage");
    for (const viewport of [
      { width: 820, height: 1180 },
      { width: 1024, height: 768 },
      { width: 1180, height: 820 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => restingCollageFit(collage), { message: `collage fit at ${viewport.width} × ${viewport.height}` })
        .toMatchObject({ visiblePanels: 6, fitsViewportWidth: true, fitsColumnWidth: true, openingCentered: true });
      await expect.poll(() => page.locator("[data-page-scroll]").evaluate(node => node.scrollWidth - node.clientWidth)).toBe(0);
    }
  });
});
