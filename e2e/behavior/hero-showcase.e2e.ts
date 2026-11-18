import type { Page } from "@playwright/test";
import { animationFrames, gotoDocs } from "../support/docs";
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
  focusInCollage: boolean;
}

const RESTING_PANELS = [
  "library-panel-revenue", "library-panel-online", "library-panel-segmented", "library-panel-glass", "library-panel-toast", "library-panel-ship",
];

function opaquePanelIds(frame: ShowcaseSample) {
  return frame.panels.filter(item => item.opacity === 1).map(item => item.id);
}

async function sample(page: Page, duration: number) {
  return page.evaluate(duration => new Promise<ShowcaseSample[]>(resolve => {
    const collage = document.querySelector('[data-testid="library-collage"]')!;
    const nodes = [...collage.querySelectorAll<HTMLElement>('[data-testid^="library-panel-"]')];
    const frames: ShowcaseSample[] = [];
    const start = performance.now();
    const tick = () => {
      const time = performance.now() - start;
      if (time - (frames.at(-1)?.time ?? -100) >= 60) {
        const panels = nodes.map(node => {
          const style = getComputedStyle(node);
          return { id: node.dataset.testid!, opacity: Number(style.opacity), position: `${style.left}, ${style.top}`, transform: style.transform };
        });
        frames.push({ time, panels, focusInCollage: collage.contains(document.activeElement) });
      }
      if (time < duration) requestAnimationFrame(tick);
      else resolve(frames);
    };
    requestAnimationFrame(tick);
  }), duration);
}

for (const width of [1440, 768, 390]) {
  test(`Hero continuously replaces specimens in different positions at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoDocs(page, "/", { viewport: { width, height: 1100 } });
    const collage = page.getByTestId("library-collage");
    await expect(collage).toHaveAttribute("inert", "");
    await expect(collage.locator('[data-testid^="library-panel-"]')).toHaveCount(109);
    const center = collage.getByTestId(/^library-panel-revenue(?:-\d+)?$/);
    await expect(center).toHaveCount(61);
    await expect(center.getByTestId("hero-control-skeleton")).toHaveCount(1);
    for (const [position, count] of Object.entries({ glass: 9, online: 8, segmented: 8, ship: 8, toast: 10 })) {
      await expect(collage.getByTestId(new RegExp(`^library-panel-${position}-\\d+$`))).toHaveCount(count);
    }
    const tooltip = page.getByText(/^Copy the (workspace|project|share) link$/);
    await expect(tooltip).toHaveCount(1);
    await expect(center.getByText(/^Copy the (workspace|project|share) link$/)).toHaveCount(1);
    await expect(collage.getByTestId(/^library-panel-toast-\d+$/)
      .locator('[role="img"][aria-label="Visits trending upward"]')).toHaveCSS("height", "34px");
    await expect.poll(async () => opaquePanelIds((await sample(page, 0))[0]!)).toEqual(RESTING_PANELS);
    const initialBounds = await collage.boundingBox();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const moving = await sample(page, 15000);
    await expect(page.getByRole("button", { name: /^(Pause|Resume) component showcase$/ })).toHaveCount(0);
    expect(moving.some(frame => frame.focusInCollage)).toBe(false);
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
    expect(new Set(arrivals.map(item => item.id)).size, "unique specimens in the opening flights").toBe(arrivals.length);
    // Consecutive unchanged samples distinguish a quiet interval from a dropped frame.
    expect(longestStill, "longest still interval between showcase flights in milliseconds").toBeLessThan(500);
    const afterBounds = await collage.boundingBox();
    expect(afterBounds!.height).toBeCloseTo(initialBounds!.height, 0);
    if (width === 390) expect(afterBounds!.height).toBeLessThanOrEqual(380);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    const opener = page.getByTestId("library-hero").getByRole("link", { name: "View Canvas on GitHub" });
    await opener.focus();
    // Keyboard navigation must never enter a decorative specimen, even the inputs.
    await page.keyboard.press("Tab");
    expect(await collage.evaluate(node => node.contains(document.activeElement))).toBe(false);
    await opener.focus();
    expect(await opener.evaluate(node => node.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Escape", bubbles: true, cancelable: true,
    })))).toBe(true);
    await page.keyboard.press("Control+k");
    const search = page.getByRole("dialog", { name: "Search components", exact: true });
    await expect(search.getByRole("textbox", { name: "Search components", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(search).toHaveCount(0);
    await expect(opener).toBeFocused();

    if (width === 1440) {
      const authoredPanel = collage.getByTestId("library-panel-revenue");
      // Entries in the rotation columns stay fixed when a flight only adds translation.
      const rotation = () => authoredPanel.evaluate(node => {
        const { m13, m23 } = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        return [m13, m23] as const;
      });
      const [beforeX, beforeY] = await rotation();
      await page.mouse.move(width - 30, 100);
      await expect.poll(async () => {
        const [x, y] = await rotation();
        return Math.hypot(x - beforeX, y - beforeY);
      }).toBeGreaterThan(0.02);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(async () => opaquePanelIds((await sample(page, 0))[0]!)).toEqual(RESTING_PANELS);
    await animationFrames(page, 2);
    const still = await sample(page, 600);
    expect(new Set(still.map(({ panels }) => JSON.stringify(panels))).size).toBe(1);
    expect(opaquePanelIds(still[0]!)).toEqual(RESTING_PANELS);
  });
}
