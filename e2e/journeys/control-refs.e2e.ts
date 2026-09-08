import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const scheme of ["light", "dark"] as const) {
  test(`public refs focus the interactive hosts (${scheme})`, async ({ page }, testInfo) => {
    await gotoDocs(page, "/testing/control-refs", { scheme });
    for (const name of ["Button", "Checkbox", "Switch", "Radio", "Select", "Slider"]) {
      await page.getByRole("button", { name: `Focus ${name}`, exact: true }).click();
      await expect(page.getByTestId(`ref-${name.toLowerCase()}`)).toBeFocused();
      await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 0");
    }
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const screenshot = testInfo.outputPath("control-refs-focused.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach("control-refs-focused", { path: screenshot, contentType: "image/png" });
  });
}

test("ref focus preserves complete keyboard activation, roving navigation and modal return", async ({ page }) => {
  await gotoDocs(page, "/testing/control-refs");
  await page.getByRole("button", { name: "Focus Checkbox", exact: true }).click();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("ref-checkbox")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 1");
  await page.getByRole("button", { name: "Focus Switch", exact: true }).click();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("ref-switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Focus Radio", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Weekly", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Focus Radio", exact: true }).click();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("ref-radio")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("ref-radio")).toBeFocused();
  await page.getByRole("button", { name: "Focus Select", exact: true }).click();
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.getByRole("button", { name: "Focus Slider", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("ref-slider")).toHaveAttribute("aria-valuenow", "41");
  await page.getByRole("button", { name: "Focus Button", exact: true }).click();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByTestId("ref-button")).toBeFocused();
});

test("Space release owns one activation, cancels on blur and leaves Enter and clicks usable", async ({ page }) => {
  await gotoDocs(page, "/testing/control-refs");
  const checkbox = page.getByTestId("ref-checkbox");
  await page.getByRole("button", { name: "Focus Checkbox", exact: true }).click();
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 0");
  await page.keyboard.up("Space");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 1");
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 2");
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await checkbox.click();
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 3");
  await page.keyboard.down("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Space");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 3");
  await page.getByRole("button", { name: "Focus Checkbox", exact: true }).click();
  for (const composition of [{ isComposing: true }, { keyCode: 229 }]) {
    await checkbox.dispatchEvent("keydown", { key: " ", bubbles: true, cancelable: true, ...composition });
    await checkbox.dispatchEvent("keyup", { key: " ", bubbles: true, cancelable: true, ...composition });
    await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 3");
  }
  await page.keyboard.down("Space");
  await page.getByRole("button", { name: "Disable controls", exact: true }).click();
  await page.keyboard.up("Space");
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 3");
});

test("refs detach and reattach on real unmount and retain native measurement methods", async ({ page }) => {
  await gotoDocs(page, "/testing/control-refs");
  await page.getByRole("button", { name: "Inspect refs", exact: true }).click();
  await expect(page.getByTestId("ref-attached")).toHaveText("Attached: 6");
  await page.getByRole("button", { name: "Measure Slider", exact: true }).click();
  await expect(page.getByTestId("ref-measurement")).toHaveText(/Measured: [1-9]\d* × [1-9]\d*/);
  await page.getByRole("button", { name: "Unmount controls", exact: true }).click();
  await page.getByRole("button", { name: "Inspect refs", exact: true }).click();
  await expect(page.getByTestId("ref-attached")).toHaveText("Attached: 0");
  await page.getByRole("button", { name: "Focus Button", exact: true }).click();
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 0");
  await page.getByRole("button", { name: "Mount controls", exact: true }).click();
  await page.getByRole("button", { name: "Inspect refs", exact: true }).click();
  await expect(page.getByTestId("ref-attached")).toHaveText("Attached: 6");
  await page.getByRole("button", { name: "Focus Button", exact: true }).click();
  await expect(page.getByTestId("ref-button")).toBeFocused();
});

test("disabled controls keep their disabled behavior with public refs attached", async ({ page }) => {
  await gotoDocs(page, "/testing/control-refs");
  await page.getByRole("button", { name: "Disable controls", exact: true }).click();
  for (const name of ["Button", "Checkbox", "Switch", "Radio", "Select", "Slider"]) {
    await expect(page.getByTestId(`ref-${name.toLowerCase()}`)).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("button", { name: `Focus ${name}`, exact: true }).click();
    await page.keyboard.press("ArrowRight");
  }
  await expect(page.getByTestId("ref-changes")).toHaveText("Changes: 0");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
