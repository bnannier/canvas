import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [390, 1280]) {
  test(`vertical divider has a visible row and matching source at ${width}px`, async ({ page }) => {
    const props = encodeURIComponent(JSON.stringify({ "@Orientation": "vertical" }));
    await gotoDocs(page, "/components/divider", { query: `props=${props}`, viewport: { width, height: 1000 } });
    const stage = page.locator('[data-playground-source]');
    await expect(stage).toHaveAttribute("data-playground-source", /^<Row relaxed>/);
    const rule = stage.getByRole("separator");
    await expect(rule).toHaveAttribute("aria-orientation", "vertical");
    await expect.poll(() => rule.evaluate(node => {
      const box = node.getBoundingClientRect();
      return box.width >= 1 && box.width <= 2 && box.height >= 36;
    })).toBe(true);
    await page.getByRole("radiogroup", { name: "Orientation", exact: true }).getByRole("radio", { name: "horizontal", exact: true }).click();
    await expect(stage).toHaveAttribute("data-playground-source", /^<Column>/);
    await expect.poll(() => rule.evaluate(node => node.getBoundingClientRect().width)).toBeGreaterThan(100);
  });

  test(`horizontal dividers fill the playground at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/divider", { viewport: { width, height: 1000 } });
    const stage = page.locator('[data-detail-section="pg"] [data-preview-stage]');
    const rule = stage.getByRole("separator");
    const fillsStage = () => rule.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const parent = node.closest("[data-preview-stage]")!.getBoundingClientRect();
      return box.width > 100 && Math.abs(box.width - parent.width) < 1 && box.height >= 1;
    });
    await expect.poll(fillsStage).toBe(true);
    await page.getByRole("textbox", { name: "children", exact: true }).fill("or");
    await expect(rule).toHaveAccessibleName("or");
    await expect.poll(fillsStage).toBe(true);
    await expect.poll(() => rule.evaluate((node) => {
      const before = node.firstElementChild!.getBoundingClientRect();
      const after = node.lastElementChild!.getBoundingClientRect();
      return before.width > 20 && after.width > 20 && Math.abs(before.width - after.width) < 1;
    })).toBe(true);
  });
}
