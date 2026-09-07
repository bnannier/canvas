import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const initiallyOpen of [false, true]) {
  test(`a hosted menu closes before its dialog (${initiallyOpen ? "initially open" : "opened by keyboard"})`, async ({ page }) => {
    await gotoDocs(page, `/testing/escape-layers${initiallyOpen ? "?scenario=initial" : ""}`);
    if (!initiallyOpen) {
      await page.getByRole("button", { name: "Open dialog", exact: true }).click();
      const trigger = page.getByRole("button", { name: "Open menu", exact: true });
      await trigger.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Keyboard dialog" })).toBeVisible();
    await expect(page.getByTestId("parent-close-count")).toHaveText("0");
    await expect(page.getByTestId("child-close-count")).toHaveText("1");
    await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Keyboard dialog" })).toHaveCount(0);
    await expect(page.getByTestId("parent-close-count")).toHaveText("1");
    if (!initiallyOpen) await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused();
  });
}

test("held Escape repeats do not dismiss the next layer", async ({ page }) => {
  await gotoDocs(page, "/testing/escape-layers?scenario=initial");
  await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
  await page.keyboard.down("Escape");
  await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toHaveCount(0);
  await page.keyboard.down("Escape");
  await page.keyboard.down("Escape");
  await page.keyboard.up("Escape");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("parent-close-count")).toHaveText("1");
});

test("Autocomplete delegates stopped input events without clearing its query", async ({ page }) => {
  await gotoDocs(page, "/testing/escape-layers?scenario=autocomplete");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  const field = page.getByRole("combobox", { name: "Fruit" });
  await field.fill("Ap");
  await expect(page.getByRole("option", { name: /Apple/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(field).toHaveValue("Ap");
  await expect(page.getByTestId("query-change-count")).toHaveText("1");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("parent-close-count")).toHaveText("1");
});

test("Command delegates Escape even when filtering returns zero results", async ({ page }) => {
  await gotoDocs(page, "/testing/escape-layers?scenario=command");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  const field = page.getByRole("textbox", { name: "Find a command" });
  await expect(field).toHaveValue("missing");
  await field.focus();
  await page.keyboard.press("Escape");
  await expect(field).toHaveCount(0);
  await expect(page.getByTestId("child-close-count")).toHaveText("1");
  await expect(page.getByTestId("query-change-count")).toHaveText("0");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("parent-close-count")).toHaveText("1");
});

for (const scheme of ["light", "dark"] as const) {
  for (const width of [1280, 390]) {
    test(`a Drawer hosts its menu in the Modal and consumes one Escape (${scheme}, ${width}px)`, async ({ page }, testInfo) => {
      // This fixture has no caller-supplied provider inside Drawer. The component
      // owns the window host, including when an app-level provider exists above it.
      await gotoDocs(page, "/testing/escape-layers?scenario=drawer", { scheme, viewport: { width, height: 900 } });
      await page.getByRole("button", { name: "Open drawer", exact: true }).click();
      const drawer = page.getByRole("dialog").filter({ has: page.getByText("Drawer content", { exact: true }) });
      const trigger = drawer.getByRole("button", { name: "Open menu", exact: true });
      await trigger.click();
      const menu = drawer.getByRole("menu");
      await expect(menu.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
      await expect(page.getByRole("menu")).toHaveCount(1);
      const bounds = await menu.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
      const screenshot = testInfo.outputPath("drawer-hosted-menu.png");
      await page.screenshot({ path: screenshot });
      await testInfo.attach("drawer-hosted-menu", { path: screenshot, contentType: "image/png" });
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(drawer).toBeVisible();
      await expect(page.getByTestId("parent-close-count")).toHaveText("0");
      await expect(page.getByTestId("child-close-count")).toHaveText("1");
      await expect(trigger).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(drawer).toHaveCount(0);
      await expect(page.getByTestId("parent-close-count")).toHaveText("1");
    });
  }
}

test("a nested ActionSheet and its Drawer each need their own Escape", async ({ page }) => {
  await gotoDocs(page, "/testing/escape-layers?scenario=drawer");
  await page.getByRole("button", { name: "Open drawer", exact: true }).click();
  await page.getByRole("button", { name: "Open actions", exact: true }).click();
  await expect(page.getByText("Share", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Share", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("child-close-count")).toHaveText("1");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("parent-close-count")).toHaveText("1");
});

test("local table and description editors cancel without dismissing their Drawer", async ({ page }) => {
  await gotoDocs(page, "/testing/escape-layers?scenario=drawer");
  await page.getByRole("button", { name: "Open drawer", exact: true }).click();
  await page.getByText("Alice", { exact: true }).click();
  const tableField = page.getByRole("textbox", { name: /Edit Name/ });
  await tableField.fill("Changed");
  await page.keyboard.press("Escape");
  await expect(tableField).toHaveCount(0);
  await expect(page.getByText("Alice", { exact: true })).toBeVisible();
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
  await page.getByRole("button", { name: "Update Email" }).click();
  const descriptionField = page.getByRole("textbox", { name: "Email value" });
  await descriptionField.fill("changed@example.com");
  await page.keyboard.press("Escape");
  await expect(descriptionField).toHaveCount(0);
  await expect(page.getByText("alice@example.com", { exact: true })).toBeVisible();
  await expect(page.getByTestId("commit-count")).toHaveText("0");
  await expect(page.getByTestId("parent-close-count")).toHaveText("0");
});
