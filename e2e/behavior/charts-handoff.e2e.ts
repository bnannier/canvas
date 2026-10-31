import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("all chart cards fit the phone and the completion rings stay three across", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoDocs(page, "/charts");
  const cards = page.locator('[data-testid^="showcase-c-"]');
  await expect(cards).toHaveCount(25);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box?.x).toBe(24);
    expect(box?.width).toBe(342);
  }
  const rings = page.getByTestId("showcase-c-progress-ring").locator('[aria-label]:not(svg)').filter({ hasText: /Tokens|Icons|Docs/ });
  await expect(rings).toHaveCount(3);
  const boxes = await Promise.all((await rings.all()).map(ring => ring.boundingBox()));
  expect(new Set(boxes.map(box => box?.y)).size).toBe(1);
  expect(boxes.every(box => box && box.width <= 100)).toBe(true);
});

test("chart inspection replaces the authored initial readout with the selected data", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoDocs(page, "/charts");
  const card = page.getByTestId("showcase-c-range-area-chart");
  await expect(card.getByText("Low 11°", { exact: true })).toBeVisible();
  const plot = card.locator('svg').last();
  await plot.scrollIntoViewIfNeeded();
  const box = (await plot.boundingBox())!;
  await page.mouse.click(box.x + box.width * 8 / 11, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width * 7 / 11, box.y + box.height / 2);
  await expect(card.getByText("Low 14°", { exact: true })).toBeVisible();
  await expect(card.getByText("Mid 19°", { exact: true })).toBeVisible();
  await page.mouse.click(box.x + box.width * 7 / 11, box.y + box.height / 2);
  await expect(card.getByText("Low 14°", { exact: true })).toHaveCount(0);
});

test("the chart hero animates and live Reduced Motion restores the hand-off's still state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/charts");
  const line = page.getByTestId("section-hero").locator('path[stroke-dasharray="420"]');
  await expect(line).toHaveCount(1);
  const before = await line.getAttribute("stroke-dashoffset");
  await expect.poll(() => line.getAttribute("stroke-dashoffset"), { timeout: 7500 }).not.toBe(before);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(line).toHaveAttribute("stroke-dashoffset", "420");
  const samples = await line.evaluate(node => new Promise<string[]>(resolve => {
    const values: string[] = [], start = performance.now();
    const sample = () => {
      values.push(node.getAttribute("stroke-dashoffset") ?? "");
      if (performance.now() - start < 500) requestAnimationFrame(sample);
      else resolve(values);
    };
    requestAnimationFrame(sample);
  }));
  expect(new Set(samples)).toEqual(new Set(["420"]));
});

test("signup-bar hover fades the mark without changing the inspected value", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/charts");
  const card = page.getByTestId("showcase-c-chart");
  const mark = card.locator('svg[height="180"] path[opacity]').first();
  await expect(mark).toHaveCount(1);
  await mark.scrollIntoViewIfNeeded();
  const box = (await mark.boundingBox())!;
  const opacity = () => mark.evaluate(node => Number(getComputedStyle(node).opacity));
  expect(await opacity()).toBeCloseTo(.55, 2);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(opacity).toBeCloseTo(1, 2);
  await expect(card.getByText("1,204", { exact: true })).toBeVisible();
  await page.mouse.move(20, 750);
  await expect.poll(opacity).toBeCloseTo(.55, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(opacity).toBeCloseTo(1, 2);
});

test("a documented detailed chart URL renders the selected live example", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoDocs(page, "/components/geo-map/detailed");
  const stage = page.locator('[data-preview-card][data-example="Detailed"]');
  await expect(stage).toHaveCount(1);
  const web = stage.locator('[data-platform-row="web"]');
  await expect(web.locator('[data-testid^="geo-map-place-"]').first()).toBeVisible();
});
