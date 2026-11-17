import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [390, 1280]) {
  test(`Swatch selects semantic theme colors at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/swatch", { viewport: { width, height: 1000 } });
    const stage = page.locator('[data-playground-source]');
    await stage.getByRole("button", { name: /^Theme token,/ }).click();
    await page.getByRole("option", { name: "secondary", exact: true }).click();
    await expect(stage.getByText("--secondary", { exact: true })).toBeVisible();
    await stage.getByRole("button", { name: /^Theme token,/ }).click();
    await page.getByRole("option", { name: "success", exact: true }).click();
    await expect(stage.getByText("--success", { exact: true })).toBeVisible();
    await expect(stage).toHaveAttribute("data-playground-source", /color=\{sample.color\}/);
  });

  test(`Typography alignment and tabular figures visibly change at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/typography", { viewport: { width, height: 1000 } });
    const playground = page.locator('[data-detail-section="pg"]');
    const text = playground.locator('[data-playground-source]').getByText("Invoice totals", { exact: false });
    const metrics = () => text.evaluate(node => {
      const content = node.firstChild!;
      const sample = (value: string) => {
        const start = content.textContent!.indexOf(value);
        const range = document.createRange();
        range.setStart(content, start);
        range.setEnd(content, start + value.length);
        return range.getBoundingClientRect();
      };
      const first = sample("111.11");
      const second = sample("888.88");
      return { difference: Math.abs(first.width - second.width), offset: first.x - node.getBoundingClientRect().x };
    });
    const styles = playground.getByRole("radiogroup", { name: "Style", exact: true }).getByRole("radio");
    await expect.poll(async () => (await styles.allTextContents()).slice(0, 5)).toEqual(["h1", "h2", "h3", "h4", "h5"]);
    await expect.poll(async () => (await metrics()).difference).toBeGreaterThan(5);
    await playground.getByRole("switch", { name: "tabular", exact: true }).click();
    await expect.poll(async () => (await metrics()).difference).toBeLessThan(0.1);
    const before = (await metrics()).offset;
    await playground.getByRole("switch", { name: "center", exact: true }).click();
    await expect.poll(async () => (await metrics()).offset).toBeGreaterThan(before + 40);
  });

  test(`Text line limits visibly truncate at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/text", { viewport: { width, height: 1000 } });
    const playground = page.locator('[data-detail-section="pg"]');
    const text = playground.locator('[data-playground-source]').getByText("The design review is ready.", { exact: false });
    const fullHeight = (await text.boundingBox())!.height;
    const limit = playground.getByRole("slider", { name: "numberOfLines", exact: true });
    await limit.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(limit).toHaveAttribute("aria-valuenow", "1");
    await expect.poll(async () => (await text.boundingBox())!.height).toBeLessThan(fullHeight / 2);
    await expect(text).toHaveCSS("text-overflow", "ellipsis");
    await expect(playground.locator('[data-playground-source]')).toHaveAttribute("data-playground-source", /numberOfLines=\{1\}/);
  });
}

test("Icon search reaches glyphs beyond the original preset and shares the selection", async ({ page }) => {
  await gotoDocs(page, "/components/icon");
  const playground = page.locator('[data-detail-section="pg"]');
  await playground.getByRole("textbox", { name: "Search glyph icons", exact: true }).fill("accessibility");
  await playground.getByRole("radiogroup", { name: "glyph", exact: true }).getByRole("radio", { name: "accessibility", exact: true }).click();
  await expect(playground.locator('[data-playground-source]')).toHaveAttribute("data-playground-source", /<Icon accessibility/);
  const shared = page.url();
  expect(JSON.parse(new URL(shared).searchParams.get("props")!)["@glyph"]).toBe("accessibility");
  await page.reload();
  await expect(page.locator('[data-playground-source]')).toHaveAttribute("data-playground-source", /<Icon accessibility/);
});
