import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [320, 390]) {
  test(`one-time-code entry fits and stays typeable at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/input-otp", { viewport: { width, height: 900 } });
    const stage = page.locator('[data-detail-section="pg"] [data-playground-source]');
    await expect.poll(() => stage.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    const input = stage.getByRole("textbox");
    await input.fill("123456");
    await expect(input).toHaveValue("123456");
    await expect.poll(() => stage.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    const bounds = await input.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  });
}
