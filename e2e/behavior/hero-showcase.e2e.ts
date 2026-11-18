import type { Page } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

async function sample(page: Page, duration: number) {
  return page.evaluate(duration => new Promise<{ opacity: number; id: string; transform: string }[][]>(resolve => {
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-testid^="library-panel-"]')];
    const frames: { opacity: number; id: string; transform: string }[][] = [];
    const start = performance.now();
    let last = -100;
    const tick = () => {
      if (performance.now() - last >= 60) {
        last = performance.now();
        frames.push(nodes.map(node => ({ id: node.dataset.testid!, opacity: Number(getComputedStyle(node).opacity), transform: getComputedStyle(node).transform })));
      }
      if (performance.now() - start < duration) requestAnimationFrame(tick);
      else resolve(frames);
    };
    requestAnimationFrame(tick);
  }), duration);
}

for (const width of [1440, 768, 390]) {
  test(`Hero independently replaces specimens and preserves motion controls at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoDocs(page, "/", { viewport: { width, height: 1100 } });
    const collage = page.getByTestId("library-collage");
    await expect(collage).toHaveAttribute("inert", "");
    await expect(collage.locator('[data-testid^="library-panel-"]')).toHaveCount(30);
    const initialBounds = await collage.boundingBox();
    const moving = await sample(page, 15000);
    const settled = new Set(moving.flatMap(frame => frame.filter(item => item.opacity >= 0.999).map(item => item.id)));
    expect(settled.size).toBeGreaterThan(7);
    let transitions = 0;
    for (const frame of moving) {
      const changing = frame.filter(item => item.opacity > 0.001 && item.opacity < 0.999);
      if (changing.length) transitions++;
      // At most the departing and arriving specimen of ONE slot can be in flight.
      expect(new Set(changing.map(item => item.id.replace(/-\d+$/, ""))).size).toBeLessThanOrEqual(1);
      expect(frame.filter(item => item.opacity >= 0.999).length).toBeGreaterThanOrEqual(5);
    }
    expect(transitions).toBeGreaterThan(4);
    const afterBounds = await collage.boundingBox();
    expect(afterBounds!.height).toBeCloseTo(initialBounds!.height, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    const pause = page.getByRole("button", { name: "Pause component showcase" });
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume component showcase" })).toBeFocused();
    const paused = await sample(page, 600);
    expect(new Set(paused.map(frame => frame.map(item => item.opacity).join())).size).toBe(1);
    // Keyboard navigation must never enter a decorative specimen, even the inputs.
    await page.keyboard.press("Tab");
    expect(await collage.evaluate(node => node.contains(document.activeElement))).toBe(false);
    await page.getByRole("button", { name: "Resume component showcase" }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Pause component showcase" })).toBeVisible();

    if (width === 1440) {
      const before = (await sample(page, 100)).at(-1)![0]!.transform;
      await page.mouse.move(width - 30, 100);
      await expect.poll(async () => (await sample(page, 60)).at(-1)![0]!.transform).not.toBe(before);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: "Pause component showcase" })).toHaveCount(0);
    await expect(page.getByTestId("library-panel-revenue")).toHaveCSS("opacity", "1");
    const still = await sample(page, 600);
    expect(new Set(still.map(frame => JSON.stringify(frame))).size).toBe(1);
    expect(still[0]!.filter(item => item.opacity === 1).map(item => item.id)).toEqual([
      "library-panel-revenue", "library-panel-online", "library-panel-segmented", "library-panel-glass", "library-panel-toast", "library-panel-ship",
    ]);
  });
}
