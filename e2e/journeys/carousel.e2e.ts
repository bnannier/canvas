import type { Locator } from "@playwright/test";
import { BLOCKING_IMPACTS, scan, scanStructure } from "../support/axe";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const scrollport = (root: Locator) => root.locator('div[tabindex="0"]').first();
async function expectPage(viewport: Locator, index: number) {
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft / element.clientWidth)).toBeCloseTo(index, 2);
}

async function expectPaintedSlide(viewport: Locator, slide: Locator) {
  // DOM visibility includes virtualized overscan cells outside the scrollport.
  // The intended page must occupy the actual viewport on both axes.
  await expect.poll(async () => {
    const [visible, content] = await Promise.all([viewport.boundingBox(), slide.boundingBox()]);
    if (!visible || !content) return Infinity;
    return Math.max(Math.abs(content.x - visible.x), Math.abs(content.width - visible.width),
      Math.abs(content.y - visible.y), Math.max(0, content.height - visible.height));
  }).toBeLessThanOrEqual(1);
}

for (const width of [1280, 390]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`Carousel keyboard focus, page state and targets (${width}, ${scheme})`, async ({ page }, testInfo) => {
      await gotoDocs(page, "/testing/carousel", { scheme, viewport: { width, height: 900 } });
      const root = page.getByTestId("carousel-uncontrolled");
      const viewport = scrollport(root);
      await page.getByTestId("before-carousel").focus();
      await page.keyboard.press("Tab");
      await expect(viewport).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expectPage(viewport, 1);
      await expectPaintedSlide(viewport, root.getByTestId("slide-2"));
      await expect(root.getByRole("button", { name: "Slide 2 of 6, current slide" })).toHaveAttribute("aria-current", "true");
      await page.keyboard.press("End");
      await expectPage(viewport, 5);
      await expectPaintedSlide(viewport, root.getByTestId("slide-6"));
      await expect(page.getByTestId("carousel-changes")).toHaveText("Changes: 1,5");
      await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("carousel-changes")).toHaveText("Changes: 1,5");
      await page.keyboard.press("Home");
      await expectPage(viewport, 0);
      await root.getByRole("textbox", { name: "Notes for slide 1" }).focus();
      await page.keyboard.press("End");
      await expect(page.getByTestId("carousel-changes")).toHaveText("Changes: 1,5,0");
      const picker = root.getByRole("group", { name: "Choose a slide" });
      for (const button of await picker.getByRole("button").all()) {
        const box = await button.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(24);
        expect(box!.height).toBeGreaterThanOrEqual(24);
        expect(await button.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [0.25, 23.75].every((x) => [0.25, 23.75].every((y) => {
            const target = document.elementFromPoint(bounds.x + (bounds.width - 24) / 2 + x, bounds.y + (bounds.height - 24) / 2 + y);
            return target === element || (target !== null && element.contains(target));
          }));
        })).toBe(true);
      }
      await viewport.focus();
      await page.keyboard.press("Tab");
      await root.getByRole("button", { name: "Slide 1 of 6, current slide" }).focus();
      await expect.poll(() => root.getByRole("button", { name: "Slide 1 of 6, current slide" }).evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
      // Focus can scroll the slide title beneath the fixed docs banner. Center
      // the capture target so the screenshot includes the complete component.
      await root.evaluate((element) => element.scrollIntoView({ block: "center" }));
      const screenshot = testInfo.outputPath(`carousel-${width}-${scheme}.png`);
      await root.screenshot({ path: screenshot });
      await testInfo.attach("carousel", { path: screenshot, contentType: "image/png" });
      expect((await scan(page, '[data-testid="carousel-uncontrolled"]')).filter((finding) => BLOCKING_IMPACTS.has(finding.impact))).toEqual([]);
      expect(await scanStructure(page, '[data-testid="carousel-uncontrolled"]', ["scrollable-region-focusable"])).toEqual([]);
    });
  }
}

test("consecutive keys and picker jumps emit once while replacement removes the scroll stop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/testing/carousel");
  const root = page.getByTestId("carousel-uncontrolled");
  const viewport = scrollport(root);
  await viewport.focus();
  await page.keyboard.down("ArrowRight");
  await page.keyboard.down("ArrowRight");
  await page.keyboard.up("ArrowRight");
  await expectPage(viewport, 2);
  await expect(page.getByTestId("carousel-changes")).toHaveText("Changes: 1,2");
  await root.getByRole("button", { name: "Slide 6 of 6", exact: true }).click();
  await expectPage(viewport, 5);
  await root.getByRole("button", { name: "Slide 6 of 6, current slide", exact: true }).click();
  await expect(page.getByTestId("carousel-changes")).toHaveText("Changes: 1,2,5");
  await page.getByRole("button", { name: "Use one slide", exact: true }).click();
  await expect(root.locator('div[tabindex="0"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Restore slides", exact: true }).click();
  await expect(scrollport(root)).toHaveCount(1);
});

test("controlled keyboard requests preserve ownership and external updates stay silent", async ({ page }) => {
  await gotoDocs(page, "/testing/carousel");
  const root = page.getByTestId("carousel-controlled");
  const viewport = scrollport(root);
  await viewport.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("carousel-controlled-changes")).toHaveText("Requests: 1");
  await expectPage(viewport, 0);
  await expect(root.getByRole("button", { name: "Slide 1 of 6, current slide" })).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Accept changes", exact: true }).click();
  await viewport.focus();
  await page.keyboard.press("End");
  await expectPage(viewport, 5);
  await expectPaintedSlide(viewport, root.getByTestId("slide-6"));
  await expect(page.getByTestId("carousel-controlled-changes")).toHaveText("Requests: 1,5");
  await page.getByRole("button", { name: "Set external index", exact: true }).click();
  await expectPage(viewport, 4);
  await expectPaintedSlide(viewport, root.getByTestId("slide-5"));
  await expect(page.getByTestId("carousel-controlled-changes")).toHaveText("Requests: 1,5");
});
