import { BLOCKING_IMPACTS, scan } from "../support/axe";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [1280, 390]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`overflowing content is reachable and scrolls with the keyboard (${width}, ${scheme})`, async ({ page }, testInfo) => {
      await gotoDocs(page, "/testing/scroll-focus", { scheme, viewport: { width, height: 900 } });
      for (const name of ["plain", "numbered", "terminal", ...(width < 640 ? ["table"] : [])]) {
        const content = page.getByTestId(`scroll-${name}`);
        const scrollport = content.locator('[tabindex="0"]');
        await expect(scrollport).toHaveCount(1);
        await page.getByTestId(`before-${name}`).focus();
        await page.keyboard.press("Tab");
        await expect(scrollport).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect.poll(() => scrollport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
        const screenshot = testInfo.outputPath(`scroll-${name}-focused.png`);
        await page.screenshot({ path: screenshot });
        await testInfo.attach(`scroll-${name}-focused`, { path: screenshot, contentType: "image/png" });
      }
      await expect(page.getByTestId("scroll-wrap").locator('[tabindex="0"]')).toHaveCount(0);
      await expect(page.getByTestId("scroll-inline").locator('[tabindex="0"]')).toHaveCount(0);
      const findings = await scan(page, "body");
      expect(findings.filter((finding) => BLOCKING_IMPACTS.has(finding.impact))).toEqual([]);
    });
  }
}

test("content replacement and container resizing update keyboard stops without remounting", async ({ page }) => {
  await gotoDocs(page, "/testing/scroll-focus", { viewport: { width: 390, height: 900 } });
  const plain = page.getByTestId("scroll-plain");
  const table = page.getByTestId("scroll-table");
  await expect(plain.locator('[tabindex="0"]')).toHaveCount(1);
  await expect(table.locator('[tabindex="0"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Use short content", exact: true }).click();
  await expect(plain.locator('[tabindex="0"]')).toHaveCount(0);
  await page.getByTestId("before-plain").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("after-plain")).toBeFocused();
  await page.getByRole("button", { name: "Use long content", exact: true }).click();
  await expect(plain.locator('[tabindex="0"]')).toHaveCount(1);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(table.locator('[tabindex="0"]')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(table.locator('[tabindex="0"]')).toHaveCount(1);
});

for (const scheme of ["light", "dark"] as const) {
  test(`the narrow token reference has headings and keyboard-accessible regions (${scheme})`, async ({ page }, testInfo) => {
    await gotoDocs(page, "/tokens/colors", { scheme, viewport: { width: 390, height: 900 } });
    await expect(page.getByRole("heading", { level: 1, name: "Colors & Theme" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    const screenshot = testInfo.outputPath(`token-colors-phone-${scheme}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach("token-colors-phone", { path: screenshot, contentType: "image/png" });
    const findings = await scan(page, "body");
    expect(findings.filter((finding) => BLOCKING_IMPACTS.has(finding.impact) || finding.id === "page-has-heading-one")).toEqual([]);
  });
}
