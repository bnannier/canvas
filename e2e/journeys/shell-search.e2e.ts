import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

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
      // keyboard activation gives Modal an actual focused opener on every engine.
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
