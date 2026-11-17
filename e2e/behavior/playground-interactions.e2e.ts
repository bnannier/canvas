import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("untouched knobs preserve the example's interactive state", async ({ page }) => {
  await gotoDocs(page, "/components/switch");
  const stage = page.locator('[data-detail-section="pg"] [data-playground-source]');
  const control = stage.getByRole("switch").first();
  const before = await control.getAttribute("aria-checked");
  const source = await stage.getAttribute("data-playground-source");
  await control.click();
  await expect(control).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");
  await expect(stage).toHaveAttribute("data-playground-source", source!);
});

test("Pressable executes the displayed handler with pointer and keyboard", async ({ page }) => {
  await gotoDocs(page, "/components/pressable");
  const playground = page.locator('[data-detail-section="pg"]');
  const stage = playground.locator("[data-playground-source]");
  const control = stage.getByRole("button", { name: "Press me", exact: true });
  await expect(stage.getByText("Pressed 0 times", { exact: true })).toBeVisible();
  await control.click();
  await expect(stage.getByText("Pressed 1 time", { exact: true })).toBeVisible();
  await control.press("Enter");
  await expect(stage.getByText("Pressed 2 times", { exact: true })).toBeVisible();
  await control.press("Space");
  await expect(stage.getByText("Pressed 3 times", { exact: true })).toBeVisible();
  await expect(playground.getByTestId("playground-code")).toContainText("onPress={() => setPresses(presses + 1)}");
  await playground.getByRole("switch", { name: "disabled", exact: true }).click();
  await expect(control).toBeDisabled();
  await expect(stage.getByText("Pressed 0 times", { exact: true })).toBeVisible();
  await expect(playground.getByTestId("playground-code")).toContainText("disabled");
});

for (const width of [390, 1280]) {
  test(`AppFrame anatomy separates its fixed header and scrolling body at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/components/app-frame", { viewport: { width, height: 1000 } });
    const anatomy = page.locator('[data-detail-section="an"]');
    await anatomy.scrollIntoViewIfNeeded();
    for (const part of ["Frame", "Header", "Body"]) {
      await expect(anatomy.locator(`[data-anatomy-part="${part}"]`)).toHaveAttribute("data-anatomy-shown", "true");
    }
    const header = anatomy.getByRole("banner");
    const body = anatomy.getByRole("main");
    await expect(header.getByText("Workspace", { exact: true })).toBeVisible();
    await expect.poll(async () => (await header.boundingBox())!.height).toBeGreaterThan(40);
    await expect.poll(() => body.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    const before = (await header.boundingBox())!.y;
    await body.evaluate(node => { node.scrollTop = 100; });
    expect((await header.boundingBox())!.y).toBe(before);
    await expect(anatomy.getByText("The remaining height holds Page and its scrolling content.")).toBeVisible();
  });
}
