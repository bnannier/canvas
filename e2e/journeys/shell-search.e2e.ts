import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [1280, 390]) {
  test.describe(width === 1280 ? "desktop search" : "phone search", () => {
    test.use({ viewport: { width, height: 900 } });
    for (const scheme of ["light", "dark"] as const) {
      test(`search focuses its input and restores its keyboard opener (${scheme})`, async ({ page }, testInfo) => {
        await gotoDocs(page, "/tokens/colors", { scheme });
        const mobile = (page.viewportSize()?.width ?? 1280) <= 1024;
        const opener = mobile
          ? page.getByRole("tab", { name: "Search", exact: true })
          : page.getByRole("banner").getByRole("button", { name: /Search components/ });
        const dialog = page.getByRole("dialog");
        const input = page.getByRole("textbox", { name: "Search components", exact: true });

        for (const close of ["Escape", "backdrop"] as const) {
          // WebKit pointer activation does not promise focus on a button. Explicit
          // keyboard activation gives the overlay an actual focused opener on every engine.
          await opener.focus();
          await expect(opener).toBeFocused();
          await page.keyboard.press("Enter");
          await expect(dialog).toBeVisible();
          await expect(input).toBeFocused();
          await expect(input).toHaveValue("");
          await input.fill("Avatar");
          await page.screenshot({ path: testInfo.outputPath(`search-${close}.png`) });
          if (close === "Escape") await page.keyboard.press("Escape");
          else await dialog.click({ position: { x: 8, y: 8 } });
          await expect(dialog).toHaveCount(0);
          await expect(opener).toBeFocused();
        }
        // Opening again after both close paths starts a fresh, focused search.
        await page.keyboard.press("Enter");
        await expect(input).toBeFocused();
        await expect(input).toHaveValue("");
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(opener).toBeFocused();

  });
}

  });
}

test("search preserves resize state, description matches, shortcuts and the chosen row", async ({ page }) => {
  await gotoDocs(page, "/tokens/colors");
  const opener = page.getByRole("banner").getByRole("button", { name: /Search components/ });
  await opener.click();
  const input = page.getByRole("textbox", { name: "Search components", exact: true });
  await expect(input).toBeFocused();
  await input.fill("universal");
  await expect(page.getByRole("option", { name: /^Integration\./ })).toBeVisible();
  const field = await input.elementHandle();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("universal");
  expect(await input.evaluate((node, original) => node === original, field)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(input).toBeFocused();
  await input.fill("a");
  const options = page.getByRole("option");
  await expect(options).toHaveCount(20);
  for (let index = 1; index < 20; index++) await input.press("ArrowDown");
  await expect(options.last()).toHaveAttribute("aria-selected", "true");
  const lastId = await options.last().getAttribute("id");
  await expect(input).toHaveAttribute("aria-activedescendant", lastId!);
  await expect.poll(() => options.last().evaluate((row) => {
    let scroll = row.parentElement;
    while (scroll && !["auto", "scroll"].includes(getComputedStyle(scroll).overflowY)) scroll = scroll.parentElement;
    if (!scroll) return false;
    const option = row.getBoundingClientRect();
    const port = scroll.getBoundingClientRect();
    return scroll.scrollTop > 0 && option.top >= port.top - 1 && option.bottom <= port.bottom + 1;
  })).toBe(true);
  await expect(input).toBeFocused();
  await input.press("Control+k");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await opener.click();
  await expect(input).toHaveValue("");
  await input.press("Meta+k");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
