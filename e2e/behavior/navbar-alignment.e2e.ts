import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [768, 820, 1024]) {
  test(`Layout's collapsed navbar centers its menu at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/layout", { viewport: { width, height: 1000 } });
    // Keep the example's own container narrow enough to show its menu even
    // when the surrounding tablet viewport has room for the full links.
    await page.getByRole("tab", { name: "Phone", exact: true }).click();
    const menu = page.getByRole("button", { name: "Navigation menu", exact: true }).first();
    await expect(menu).toBeVisible();
    await expect.poll(() => menu.evaluate((node) => {
      const trigger = node.getBoundingClientRect();
      const cluster = node.parentElement!.parentElement!.getBoundingClientRect();
      return Math.abs(trigger.y + trigger.height / 2 - cluster.y - cluster.height / 2);
    })).toBeLessThanOrEqual(0.5);
    await menu.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
}
