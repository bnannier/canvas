import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [320, 390, 430, 640, 768, 820, 1024, 1180, 1440]) {
  test(`the homepage hero fits its viewport at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/", { viewport: { width, height: 900 } });
    const hero = page.getByTestId("library-hero");
    const panels = hero.locator('[data-testid^="library-panel-"]');
    await expect(panels).toHaveCount(6);
    // The hero clips its decorative glow, so document scrollWidth alone cannot
    // detect an illustration cut off inside it. Measure every projected panel.
    await expect.poll(() => panels.evaluateAll((nodes) => nodes.every((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.left >= 0 && box.right <= window.innerWidth;
    }))).toBe(true);
    await expect.poll(() => page.locator("[data-page-scroll]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
    if (width <= 1024) {
      await expect.poll(() => page.getByTestId("library-collage").evaluate((node) => {
        const frame = node.getBoundingClientRect();
        const boxes = Array.from(node.querySelectorAll('[data-testid^="library-panel-"]')).map(panel => panel.getBoundingClientRect());
        const left = Math.min(...boxes.map(box => box.left));
        const right = Math.max(...boxes.map(box => box.right));
        return (window.innerWidth > 640 || (right - left) / frame.width > 0.9)
          && left >= frame.left && right <= frame.right
          && Math.abs((left - frame.left) - (frame.right - right)) < 2;
      })).toBe(true);
    }
    if (width <= 640) {
      const bar = await page.locator("[data-shell-mobile-top]").boundingBox();
      const eyebrow = await hero.getByText(/component library/i).boundingBox();
      expect(eyebrow!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height + 16);
      const heading = hero.getByRole("heading", { level: 1 });
      await expect.poll(async () => (await heading.boundingBox())?.x).toBe(24);
      await expect.poll(async () => (await page.getByTestId("library-collage").boundingBox())!.height).toBeLessThan(580);
      const github = hero.getByRole("link", { name: "View Canvas on GitHub" });
      await expect(github).toHaveAttribute("href", "https://github.com/bnannier/canvas");
      await expect(github.locator("svg")).toBeVisible();
      for (const name of ["Explore components", "View Canvas on GitHub"]) {
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
  test.use({ contextOptions: { reducedMotion: "no-preference", hasTouch: true } });

  test("centres its complete collage after portrait and landscape resizes", async ({ page }) => {
    await gotoDocs(page, "/", { viewport: { width: 820, height: 1180 } });
    for (const viewport of [
      { width: 820, height: 1180 },
      { width: 1024, height: 768 },
      { width: 1180, height: 820 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => page.getByTestId("library-collage").evaluate((node) => {
        const frame = node.getBoundingClientRect();
        const boxes = Array.from(node.querySelectorAll('[data-testid^="library-panel-"]')).map(panel => panel.getBoundingClientRect());
        const left = Math.min(...boxes.map(box => box.left));
        const right = Math.max(...boxes.map(box => box.right));
        const top = Math.min(...boxes.map(box => box.top));
        const bottom = Math.max(...boxes.map(box => box.bottom));
        return boxes.length === 6 && left >= frame.left && right <= frame.right
          && top >= frame.top && bottom <= frame.bottom
          && Math.abs((left - frame.left) - (frame.right - right)) < 2;
      })).toBe(true);
    }
  });
});
