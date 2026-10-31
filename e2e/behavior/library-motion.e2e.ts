import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("the Library keeps the hand-off's hero layout after its entrance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoDocs(page, "/");
  const hero = page.getByTestId("library-hero");
  // 120px top + 580px collage + 96px bottom; the following Divider adds the797th pixel.
  await expect(hero).toHaveCSS("height", "796px");
  const accent = page.getByTestId("library-headline-accent");
  await expect(accent).toHaveCSS("background-clip", "text");
  await expect(accent).toHaveCSS("color", "rgba(0, 0, 0, 0)");
  const first = await hero.getByRole("link", { name: /Explore components/ }).boundingBox();
  const second = await hero.getByRole("link", { name: /bnannier\/canvas/ }).boundingBox();
  expect(first?.x).toBe(48);
  expect(first?.height).toBe(48);
  expect(second?.height).toBe(48);
  expect(Math.abs((second?.x ?? 0) - ((first?.x ?? 0) + (first?.width ?? 0)) - 12)).toBeLessThan(0.1);
});

test("the collage follows the pointer and live Reduced Motion restores a still poster", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/");
  const panel = page.getByTestId("library-collage").locator(":scope > div").first();
  await expect(panel).toBeVisible();
  await page.mouse.move(20, 100);
  const before = await panel.evaluate(node => getComputedStyle(node).transform);
  await page.mouse.move(1400, 750);
  await expect.poll(() => panel.evaluate(node => getComputedStyle(node).transform)).not.toBe(before);
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Sample actual painted transforms over frames, including a pointer move after the
  // preference changes. A frozen timer or a one-time startup preference cannot pass.
  const still = await panel.evaluate(node => new Promise<string[]>(resolve => {
    const values: string[] = [];
    const start = performance.now();
    const sample = () => {
      values.push(getComputedStyle(node).transform);
      if (performance.now() - start < 700) requestAnimationFrame(sample);
      else resolve(values.slice(-10));
    };
    requestAnimationFrame(sample);
  }));
  expect(new Set(still).size).toBe(1);
  await page.mouse.move(10, 10);
  expect(await panel.evaluate(node => getComputedStyle(node).transform)).toBe(still[0]);
});
