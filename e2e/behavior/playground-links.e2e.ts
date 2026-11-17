import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

for (const width of [390, 1440]) {
  test(`playground links restore configured buttons at ${width}px`, async ({ page, context }) => {
    await gotoDocs(page, "/components/button", { viewport: { width, height: 1000 } });
    const playground = page.locator('[data-detail-section="pg"]');
    await playground.getByRole("radiogroup", { name: "Intent", exact: true }).getByRole("radio", { name: "outline", exact: true }).click();
    await playground.getByRole("radiogroup", { name: "Size", exact: true }).getByRole("radio", { name: "large", exact: true }).click();
    const text = playground.getByRole("textbox", { name: "children", exact: true });
    await text.fill("");
    await text.pressSequentially("Save & share + 50% #?");
    await text.press("End");
    await text.pressSequentially(" now");
    await expect(text).toHaveValue("Save & share + 50% #? now");
    await playground.getByRole("radiogroup", { name: "iconLeft", exact: true }).getByRole("radio", { name: "heart", exact: true }).click();
    await playground.getByRole("switch", { name: "disabled", exact: true }).click();
    const stage = playground.locator("[data-playground-source]");
    const source = await stage.getAttribute("data-playground-source");
    expect(source).toContain("outline");
    expect(source).toContain("large");
    expect(source).toContain("heart");
    expect(source).toContain("Save & share + 50% #? now");
    const shared = page.url();
    expect(JSON.parse(new URL(shared).searchParams.get("props")!)).toMatchObject({ "@Intent": "outline", "@Size": "large", disabled: true, iconLeft: "heart", children: "Save & share + 50% #? now" });

    const recipient = await context.newPage();
    await gotoDocs(recipient, "/components/button", { query: new URL(shared).searchParams.toString() });
    const restored = recipient.locator('[data-detail-section="pg"]');
    await expect(restored.locator("[data-playground-source]")).toHaveAttribute("data-playground-source", source!);
    await expect(restored.getByRole("textbox", { name: "children", exact: true })).toHaveValue("Save & share + 50% #? now");
    await expect(restored.locator("[data-playground-source]").getByRole("button")).toBeDisabled();
    await recipient.reload();
    await recipient.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await expect(restored.locator("[data-playground-source]")).toHaveAttribute("data-playground-source", source!);
    await restored.getByRole("button", { name: "Reset", exact: true }).click();
    await expect.poll(() => JSON.parse(new URL(recipient.url()).searchParams.get("props")!)).toEqual({});
    await expect(restored.getByRole("textbox", { name: "children", exact: true })).toHaveValue("Save changes");
    await recipient.close();
  });
}

test("shared props coexist with documented example routes and platform choice", async ({ page }) => {
  await gotoDocs(page, "/components/input/label", { query: 'props=' + encodeURIComponent(JSON.stringify({ disabled: true, placeholder: "Shared field" })) + '&platform=ios' });
  const playground = page.locator('[data-detail-section="pg"]');
  await expect(playground.getByRole("switch", { name: "disabled", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(playground.getByRole("textbox", { name: "placeholder", exact: true })).toHaveValue("Shared field");
  await expect(playground.getByRole("tab", { name: "iOS", exact: true })).toHaveAttribute("aria-selected", "true");
  await playground.getByRole("switch", { name: "disabled", exact: true }).click();
  expect(new URL(page.url()).pathname).toBe("/components/input/label");
  await page.reload();
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await expect(playground.getByRole("switch", { name: "disabled", exact: true })).toHaveAttribute("aria-checked", "false");
  await expect(playground.getByRole("tab", { name: "iOS", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("malformed props fall back to the working authored example", async ({ page }) => {
  await gotoDocs(page, "/components/button?props=%7Binvalid&platform=invalid");
  const playground = page.locator('[data-detail-section="pg"]');
  await expect(playground.locator("[data-playground-source]").getByRole("button", { name: "Save changes", exact: true })).toBeEnabled();
  await playground.getByRole("radiogroup", { name: "Intent", exact: true }).getByRole("radio", { name: "ghost", exact: true }).click();
  await expect.poll(() => JSON.parse(new URL(page.url()).searchParams.get("props")!)).toEqual({ "@Intent": "ghost" });
});

test("a shared icon-sized Button uses an icon-only composition with an accessible name", async ({ page }) => {
  await gotoDocs(page, "/components/button", { query: "props=" + encodeURIComponent(JSON.stringify({ "@Size": "icon", iconLeft: "bell", iconRight: "" })) });
  const playground = page.locator('[data-detail-section="pg"]');
  const stage = playground.locator("[data-playground-source]");
  const button = stage.getByRole("button", { name: "Save changes", exact: true });
  await expect(button).toBeVisible();
  await expect(button).toHaveText("");
  await expect(button.locator("svg")).toHaveCount(1);
  const box = await button.boundingBox();
  expect(Math.abs(box!.width - box!.height)).toBeLessThanOrEqual(1);
  const source = await stage.getAttribute("data-playground-source");
  expect(source).toContain('accessibilityLabel={"Save changes"}');
  expect(source).toContain("<Icon bell");
  expect(source).not.toContain(">Save changes</Button>");
  await expect(playground.getByTestId("playground-code")).toContainText('accessibilityLabel={"Save changes"}');
  await playground.getByRole("radiogroup", { name: "Size", exact: true }).getByRole("radio", { name: "default", exact: true }).click();
  await expect(button).toHaveText("Save changes");
  await page.reload();
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  await expect(button).toHaveText("Save changes");
});

test("empty values in shared props override uncontrolled example defaults", async ({ page }) => {
  await gotoDocs(page, "/components/select", { query: "props=" + encodeURIComponent(JSON.stringify({ value: "" })) });
  const playground = page.locator('[data-detail-section="pg"]');
  const stage = playground.locator("[data-playground-source]");
  await expect(playground.getByRole("textbox", { name: "value", exact: true })).toHaveValue("");
  await expect(stage).toHaveAttribute("data-playground-source", /value=\{""\}/);
  await expect(stage.getByRole("button", { name: "Country, Select an option", exact: true })).toBeVisible();
});
