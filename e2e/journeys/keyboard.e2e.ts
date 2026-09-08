import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";

for (const scheme of ["light", "dark"] as const) {
  test(`autocomplete selects before submitting in ${scheme}`, { tag: "@interaction:autocomplete-form-keyboard" }, async ({ page }) => {
    await gotoDocs(page, "/testing/form-autocomplete", { scheme });
    const input = page.getByRole("combobox", { name: "Fruit", exact: true });
    await input.fill("Ap");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Apricot");
    await expect(input).toBeFocused();
    await expect(page.getByTestId("selection-count")).toHaveText("1");
    await expect(page.getByTestId("submit-count")).toHaveText("0");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("submit-count")).toHaveText("1");
  });

  test(`listbox has one tab stop and toggles once in ${scheme}`, { tag: "@interaction:listbox-keyboard" }, async ({ page }) => {
    await gotoDocs(page, "/testing/listbox", { scheme });
    const group = page.getByRole("group", { name: "Project teams" });
    const first = group.getByRole("checkbox", { name: "Backend", exact: true });
    const second = group.getByRole("checkbox", { name: "Frontend, Web applications" });
    await page.getByRole("button", { name: "Before teams" }).focus();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(second).toBeFocused();
    await page.keyboard.press("Space");
    await expect(second).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("multi-change-count")).toHaveText("Changes: 1");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After teams" })).toBeFocused();
    await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  });

  test(`drawer owns its hosted menu and closes one layer in ${scheme}`, { tag: "@interaction:drawer-nested-keyboard" }, async ({ page }) => {
    await gotoDocs(page, "/testing/escape-layers?scenario=drawer", { scheme });
    await page.getByRole("button", { name: "Open drawer" }).click();
    const dialog = page.getByRole("dialog");
    const trigger = dialog.getByRole("button", { name: "Open menu" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(dialog.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("parent-close-count")).toHaveText("1");
  });
}
