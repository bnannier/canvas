import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";

// Locator.tap dispatches touch input in mobile contexts. Shrinking a desktop
// viewport and clicking would leave the touch event path untested.
for (const scheme of ["light", "dark"] as const) {
  test(`touch selects and clears an autocomplete in ${scheme}`, { tag: "@interaction:autocomplete-touch" }, async ({ page }) => {
    let trustedTouches = 0;
    await page.exposeFunction("__recordJourneyTouch", () => { trustedTouches++; });
    await page.addInitScript(() => {
      document.addEventListener("touchstart", (event) => {
        const record = (window as unknown as { __recordJourneyTouch: () => void }).__recordJourneyTouch;
        if (event.isTrusted) record();
      });
    });
    await gotoDocs(page, "/testing/form-autocomplete", { scheme });
    const input = page.getByRole("combobox", { name: "Fruit", exact: true });
    await input.tap();
    await expect.poll(() => trustedTouches).toBeGreaterThan(0);
    await input.fill("Ap");
    await page.getByRole("option", { name: "Apricot", exact: true }).tap();
    await expect(input).toHaveValue("Apricot");
    await expect(page.getByTestId("selection-count")).toHaveText("1");
    await expect(page.getByTestId("submit-count")).toHaveText("0");
    await input.fill("");
    await expect(input).toHaveValue("");
    await expect(page.getByTestId("selection-count")).toHaveText("1");
  });

  test(`touch toggles a complete listbox row once in ${scheme}`, { tag: "@interaction:listbox-touch" }, async ({ page }) => {
    await gotoDocs(page, "/testing/listbox", { scheme });
    const row = page.getByRole("group", { name: "Project teams" }).getByRole("checkbox", { name: "Frontend, Web applications" });
    await row.tap();
    await expect(row).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("multi-change-count")).toHaveText("Changes: 1");
    await row.tap();
    await expect(row).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("multi-change-count")).toHaveText("Changes: 2");
  });

  test(`touch opens and selects inside a drawer in ${scheme}`, { tag: "@interaction:drawer-nested-touch" }, async ({ page }, info) => {
    await gotoDocs(page, "/testing/form-autocomplete?scenario=modal", { scheme });
    await page.getByRole("button", { name: "Open fruit drawer" }).tap();
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("combobox", { name: "Drawer fruit", exact: true });
    await input.tap();
    await input.fill("Ap");
    await expect(dialog.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("listbox")).toHaveCount(1);
    const shot = info.outputPath(`drawer-touch-${scheme}.png`);
    await page.screenshot({ path: shot });
    await info.attach("drawer-touch", { path: shot, contentType: "image/png" });
    await dialog.getByRole("option", { name: "Apricot", exact: true }).tap();
    await expect(input).toHaveValue("Apricot");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });
}
