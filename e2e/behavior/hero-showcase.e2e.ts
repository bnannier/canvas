import type { Page } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

interface PanelSample {
  id: string;
  opacity: number;
  position: string;
  transform: string;
}

interface ShowcaseSample {
  time: number;
  panels: PanelSample[];
}

async function sample(page: Page, duration: number) {
  return page.evaluate(duration => new Promise<ShowcaseSample[]>(resolve => {
    const nodes = [...document.querySelectorAll<HTMLElement>('[data-testid^="library-panel-"]')];
    const frames: ShowcaseSample[] = [];
    const start = performance.now();
    const tick = () => {
      const time = performance.now() - start;
      if (time - (frames.at(-1)?.time ?? -100) >= 60) {
        const panels = nodes.map(node => {
          const style = getComputedStyle(node);
          return { id: node.dataset.testid!, opacity: Number(style.opacity), position: `${style.left}, ${style.top}`, transform: style.transform };
        });
        frames.push({ time, panels });
      }
      if (time < duration) requestAnimationFrame(tick);
      else resolve(frames);
    };
    requestAnimationFrame(tick);
  }), duration);
}

for (const width of [1440, 768, 390]) {
  test(`Hero continuously replaces specimens in different positions at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoDocs(page, "/", { viewport: { width, height: 1100 } });
    const collage = page.getByTestId("library-collage");
    await expect(collage).toHaveAttribute("inert", "");
    await expect(collage.locator('[data-testid^="library-panel-"]')).toHaveCount(53);
    await expect(collage.getByTestId(/^library-panel-revenue(?:-\d+)?$/)).toHaveCount(28);
    await expect(collage.getByTestId(/^library-panel-toast-\d+$/)
      .locator('[role="img"][aria-label="Visits trending upward"]')).toHaveCSS("height", "34px");
    const initialBounds = await collage.boundingBox();
    const moving = await sample(page, 15000);
    const settled = new Set(moving.flatMap(({ panels }) => panels.filter(item => item.opacity >= 0.999).map(item => item.id)));
    expect(settled.size).toBeGreaterThan(7);
    const arrivals: PanelSample[] = [];
    let sawMotion = false;
    let stillSince: number | undefined;
    let longestStill = 0;
    for (let index = 1; index < moving.length; index++) {
      const { time, panels } = moving[index]!;
      const previous = moving[index - 1]!.panels;
      const changing = panels.filter(item => item.opacity > 0.001 && item.opacity < 0.999);
      const flying = new Set(changing.map(item => item.position));
      const transforms = new Map<string, string>();
      for (const { position, transform } of panels) {
        const reference = transforms.get(position);
        if (reference === undefined) transforms.set(position, transform);
        else if (reference !== transform) flying.add(position);
      }
      // A fully opaque arrival can still be sliding while other specimens at its position are parked.
      expect(flying.size, `positions in flight at ${Math.round(time)}ms`).toBeLessThanOrEqual(1);
      expect(panels.filter(item => item.opacity >= 0.999).length).toBeGreaterThanOrEqual(5);

      const arrival = panels.find((item, i) => item.opacity > previous[i]!.opacity && item.transform !== previous[i]!.transform);
      if (arrival && arrival.id !== arrivals.at(-1)?.id) {
        expect(arrival.position, `arrival ${arrival.id} at ${Math.round(time)}ms`).not.toBe(arrivals.at(-1)?.position);
        arrivals.push(arrival);
      }

      // Follow the flight past the point when its incoming specimen reaches full opacity.
      if (panels.some((item, i) => item.transform !== previous[i]!.transform)) {
        sawMotion = true;
        stillSince = undefined;
      } else if (sawMotion) {
        stillSince ??= time;
        longestStill = Math.max(longestStill, time - stillSince);
      }
    }
    expect(arrivals.length).toBeGreaterThanOrEqual(6);
    // Consecutive unchanged samples distinguish a quiet interval from a dropped frame.
    expect(longestStill, "longest still interval between showcase flights in milliseconds").toBeLessThan(500);
    const afterBounds = await collage.boundingBox();
    expect(afterBounds!.height).toBeCloseTo(initialBounds!.height, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    const pause = page.getByRole("button", { name: "Pause component showcase" });
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Resume component showcase" })).toBeFocused();
    const paused = await sample(page, 600);
    expect(new Set(paused.map(({ panels }) => JSON.stringify(panels))).size).toBe(1);
    // Keyboard navigation must never enter a decorative specimen, even the inputs.
    await page.keyboard.press("Tab");
    expect(await collage.evaluate(node => node.contains(document.activeElement))).toBe(false);
    await page.getByRole("button", { name: "Resume component showcase" }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Pause component showcase" })).toBeVisible();

    if (width === 1440) {
      await pause.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Resume component showcase" })).toBeFocused();
      const before = (await sample(page, 100)).at(-1)!.panels[0]!.transform;
      await page.mouse.move(width - 30, 100);
      await expect.poll(async () => (await sample(page, 60)).at(-1)!.panels[0]!.transform).not.toBe(before);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByRole("button", { name: "Pause component showcase" })).toHaveCount(0);
    await expect(page.getByTestId("library-panel-revenue")).toHaveCSS("opacity", "1");
    const still = await sample(page, 600);
    expect(new Set(still.map(({ panels }) => JSON.stringify(panels))).size).toBe(1);
    expect(still[0]!.panels.filter(item => item.opacity === 1).map(item => item.id)).toEqual([
      "library-panel-revenue", "library-panel-online", "library-panel-segmented", "library-panel-glass", "library-panel-toast", "library-panel-ship",
    ]);
  });
}
