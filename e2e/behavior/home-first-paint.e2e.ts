import { expect, test } from "../support/fixtures";

// A slow bundle must not hide the main copy or decide whether the two hero cells
// wrap. Disable JavaScript to exercise the real exported document and its styles.
for (const width of [390, 768, 1350, 1440]) {
  test(`the homepage paints its copy and wraps before JavaScript at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, ignoreHTTPSErrors: true, reducedMotion: "no-preference", viewport: { width, height: 900 } });
    try {
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("library-entrance")).toHaveCSS("opacity", "1");
      await expect(page.getByTestId("library-entrance")).toHaveCSS("animation-duration", "0.9s");
      await expect(page.getByTestId("library-collage").locator('[data-testid^="library-panel-"]')).toHaveCount(6);
      const copy = (await page.getByTestId("library-copy-cell").boundingBox())!;
      const collage = (await page.getByTestId("library-collage-cell").boundingBox())!;
      expect(copy.width).toBeGreaterThan(0);
      expect(copy.x).toBeGreaterThanOrEqual(0);
      expect(copy.x + copy.width).toBeLessThanOrEqual(width);
      if (width <= 768) expect(collage.y).toBeGreaterThanOrEqual(copy.y + copy.height + 47);
      else {
        expect(Math.abs(collage.y - copy.y)).toBeLessThan(1);
        expect(Math.abs(copy.width - collage.width)).toBeLessThan(1);
      }
    } finally {
      await context.close();
    }
  });
}

for (const width of [390, 768, 1350]) {
  test(`a delayed bundle keeps the hero's artwork and footprint at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(/\/_expo\/.*\.js(?:\?|$)/, async route => { await gate; await route.continue(); });
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const collage = page.getByTestId("library-collage");
      await expect(collage).toHaveAttribute("data-hero-unmeasured", "");
      await expect(page.getByTestId("library-entrance")).toHaveCSS("opacity", "1");
      const headlinePainted = await page.evaluate(() => new Promise<boolean>(resolve => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries() as Array<PerformanceEntry & { element?: Element }>;
          if (entries.some(entry => entry.element?.closest('[data-testid="library-entrance"]'))) {
            observer.disconnect();
            clearTimeout(timer);
            resolve(true);
          }
        });
        const timer = setTimeout(() => { observer.disconnect(); resolve(false); }, 2000);
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      }));
      expect(headlinePainted, "hero text paints before the app bundle runs").toBe(true);
      const before = (await page.getByTestId("library-hero").boundingBox())!;
      const artworkBounds = async () => {
        const frame = (await collage.boundingBox())!;
        const artwork = (await page.getByTestId("library-artboard").boundingBox())!;
        return [artwork.x - frame.x, artwork.y - frame.y, artwork.width, artwork.height];
      };
      const initialArtwork = await artworkBounds();
      release();
      await expect(collage).not.toHaveAttribute("data-hero-unmeasured", "");
      const after = (await page.getByTestId("library-hero").boundingBox())!;
      expect(Math.abs(after.height - before.height)).toBeLessThan(1);
      await expect.poll(async () => Math.max(...(await artworkBounds()).map((value, index) => Math.abs(value - initialArtwork[index]!)))).toBeLessThan(1);
    } finally {
      release();
      await page.unrouteAll({ behavior: "wait" });
    }
  });
}

test("Reduced Motion shows the headline without an entrance before hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, ignoreHTTPSErrors: true, reducedMotion: "reduce" });
  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const entrance = page.getByTestId("library-entrance");
    await expect(entrance).toHaveCSS("animation-name", "none");
    await expect(entrance).toHaveCSS("opacity", "1");
    await expect(entrance).toHaveCSS("transform", "none");
  } finally {
    await context.close();
  }
});
