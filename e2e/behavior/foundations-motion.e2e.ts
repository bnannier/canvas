import type { Page } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const SPECIMENS = ["foundation-palette-0", "foundation-radius-2", "foundation-icon-bell", "foundation-icon-heart", "foundation-spring-dot"];

/** Sample a full timeline, including its reading pause, from the rendered hosts. */
async function sample(page: Page, duration: number) {
  await Promise.all(SPECIMENS.map(id => page.getByTestId(id).waitFor({ state: "attached" })));
  return page.evaluate(({ ids, duration }) => new Promise<string[][]>(resolve => {
    const nodes = ids.map(id => document.querySelector(`[data-testid="${id}"]`)!);
    const frames: string[][] = [];
    const start = performance.now();
    let last = -100;
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed - last >= 80) {
        last = elapsed;
        frames.push(nodes.map(node => {
          const style = getComputedStyle(node);
          return `${style.transform}/${style.borderRadius}`;
        }));
      }
      if (elapsed < duration) requestAnimationFrame(tick);
      else resolve(frames);
    };
    requestAnimationFrame(tick);
  }), { ids: SPECIMENS, duration });
}

for (const width of [1440, 768, 390]) {
  test(`Foundations specimens move, respect live Reduced Motion and preserve replay state at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoDocs(page, "/foundations", { viewport: { width, height: 1000 } });
    const moving = await sample(page, 6500);
    for (let index = 0; index < SPECIMENS.length; index++) {
      expect(new Set(moving.map(frame => frame[index])).size, `${SPECIMENS[index]} never moved`).toBeGreaterThan(2);
    }

    const card = page.getByTestId("showcase-c-motion");
    await card.scrollIntoViewIfNeeded();
    const toggle = card.getByRole("switch", { name: "Glass surfaces" });
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    const replay = card.getByRole("button", { name: "Replay entrance" });
    await replay.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("foundation-replay-entrance")).toHaveCSS("opacity", "1");
    await expect(toggle).not.toBeChecked();
    await expect(replay).toBeFocused();

    await page.emulateMedia({ reducedMotion: "reduce" });
    const dot = page.getByTestId("foundation-spring-dot");
    await expect(dot).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const still = await sample(page, 900);
    for (let index = 0; index < SPECIMENS.length; index++) {
      expect(new Set(still.map(frame => frame[index])).size, `${SPECIMENS[index]} kept moving under Reduced Motion`).toBe(1);
    }
    // Replay remains usable and immediate under Reduced Motion.
    await replay.press("Space");
    await expect(page.getByTestId("foundation-replay-entrance")).toHaveCSS("opacity", "1");
    await expect(toggle).not.toBeChecked();

    const lane = await page.getByTestId("foundation-spring-lane").boundingBox();
    const puck = await dot.boundingBox();
    expect(puck!.x).toBeGreaterThanOrEqual(lane!.x);
    expect(puck!.x + puck!.width).toBeLessThanOrEqual(lane!.x + lane!.width);
    expect(lane!.x + lane!.width).toBeLessThanOrEqual(width);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(() => dot.evaluate(node => getComputedStyle(node).transform)).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  });
}
