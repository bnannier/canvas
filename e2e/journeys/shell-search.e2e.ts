import { attachVisualDigest } from "../support/visual-digests";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [1280, 390]) {
  test.describe(width === 1280 ? "desktop search" : "phone search", () => {
    test.use({ viewport: { width, height: 900 } });
    for (const scheme of ["light", "dark"] as const) {
      test(`search focuses its input and restores its keyboard opener (${scheme})`, async ({ page }, testInfo) => {
        await gotoDocs(page, "/tokens/colors", { scheme });
        // Search opens from the global shortcut at every width. The brand link
        // is a real keyboard focus target for the overlay to restore on dismissal.
        const opener = page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Canvas", exact: true });
        const dialog = page.getByRole("dialog");
        const input = page.getByRole("textbox", { name: "Search components", exact: true });

        for (const close of ["Escape", "backdrop"] as const) {
          // Explicit focus gives the overlay an actual keyboard return target
          // across browser engines and touch projects.
          await opener.focus();
          await expect(opener).toBeFocused();
          await page.keyboard.press("Control+k");
          await expect(dialog).toBeVisible();
          await expect(input).toBeFocused();
          await expect(input).toHaveValue("");
          await input.fill("Avatar");
          await attachVisualDigest(page, testInfo, `search-${close}`);
          if (close === "Escape") await page.keyboard.press("Escape");
          else await dialog.click({ position: { x: 8, y: 8 } });
          await expect(dialog).toHaveCount(0);
          await expect(opener).toBeFocused();
        }
        // Opening again after both close paths starts a fresh, focused search.
        await page.keyboard.press("Control+k");
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
  // The journey starts at desktop width, where search opens as a dialog rather than a
  // sheet, so the width is pinned here: the touch projects open at a device viewport,
  // not the suite's desktop default, and the resize below is the journey itself.
  await gotoDocs(page, "/tokens/colors", { viewport: { width: 1280, height: 900 } });
  const opener = page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: "Canvas", exact: true });
  await opener.focus();
  await page.keyboard.press("Control+k");
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
  await opener.focus();
  await page.keyboard.press("Control+k");
  await expect(input).toHaveValue("");
  await input.press("Meta+k");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
