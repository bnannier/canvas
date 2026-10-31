import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

test("the platform picker updates every specimen and preserves knob values", async ({ page }) => {
  await gotoDocs(page, "/components/button", { surface: "solid" });
  const playground = page.locator('[data-detail-section="pg"]');
  const picker = playground.getByRole("tablist", { name: "Playground platform" });
  const label = playground.getByRole("textbox", { name: "children", exact: true });
  await label.fill("Platform specimen");
  const sizes = page.locator('[data-detail-section="sz"]');
  await expect(sizes.getByRole("button", { name: "Platform specimen", exact: true }).first()).toBeVisible();

  await picker.getByRole("tab", { name: "iOS", exact: true }).click();
  await expect(picker.getByRole("tab", { name: "iOS", exact: true })).toHaveAttribute("aria-selected", "true");
  // iOS uses capsule buttons; web uses the hand-off's 10 px control corner.
  // Reading every section catches a picker that only changes its own playground.
  for (const section of ["pg", "var", "sz", "st", "an"]) {
    const button = page.locator(`[data-detail-section="${section}"] [data-preview-stage]`).getByRole("button").first();
    await expect.poll(() => button.evaluate((node) => parseFloat(getComputedStyle(node).borderRadius))).toBeGreaterThan(100);
  }
  await expect(label).toHaveValue("Platform specimen");
  const platforms = page.locator('[data-detail-section="pf"]');
  for (const platform of ["web", "ios", "android"]) {
    await expect(platforms.locator(`[data-platform-row="${platform}"]`).getByRole("button", { name: "Platform specimen", exact: true })).toBeVisible();
  }
  await expect(platforms.getByRole("combobox", { name: "Platform example" })).toHaveCount(0);
  await expect(page.locator('[data-detail-section="dodont"]')).toHaveCount(0);
  await picker.getByRole("tab", { name: "Web", exact: true }).click();
  await expect.poll(() => sizes.getByRole("button").first().evaluate((node) => parseFloat(getComputedStyle(node).borderRadius))).toBeLessThan(100);
  await expect(sizes.getByRole("button", { name: "Platform specimen", exact: true }).first()).toBeVisible();
});

test("a primitive keeps its Props explanation and section jump", async ({ page }) => {
  await gotoDocs(page, "/components/view");
  const props = page.locator('[data-detail-section="props"]');
  await expect(props.getByRole("heading", { name: "Props", exact: true })).toBeVisible();
  await expect(props).toContainText("Accepts every React Native View prop unchanged.");
  const jump = page.locator('[data-detail-section="header"]').getByRole("button", { name: "Props", exact: true });
  await jump.click();
  await expect.poll(async () => (await props.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(70);
  await expect.poll(async () => (await props.boundingBox())?.y ?? Infinity).toBeLessThan(100);
});

test("phone Props retain four columns in a horizontal sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoDocs(page, "/components/button");
  const table = page.locator('[data-detail-section="props"]').getByTestId("prop-table").first();
  await expect(table.getByText("Description", { exact: true }).first()).toBeAttached();
  const prop = table.getByText("Prop", { exact: true }).first();
  const description = table.getByText("Description", { exact: true }).first();
  await expect.poll(async () => {
    const a = await prop.boundingBox();
    const b = await description.boundingBox();
    return a && b ? Math.abs(a.y - b.y) : Infinity;
  }).toBeLessThan(2);
  expect(await table.evaluate((node) => Array.from(node.querySelectorAll<HTMLElement>("*")).some((child) => child.scrollWidth > child.clientWidth && getComputedStyle(child).overflowX === "auto"))).toBe(true);
});

test("the phone section index uses the reference pill and expands the component list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoDocs(page, "/components/button");
  const trigger = page.getByRole("button", { name: "Components in this section", exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const box = await trigger.boundingBox();
  expect(box?.x).toBe(18);
  expect(box?.y).toBe(88);
  expect(box?.height).toBe(36);
  await trigger.click();
  await expect(page.getByRole("button", { name: "Hide components", exact: true })).toHaveAttribute("aria-expanded", "true");
  const index = page.getByRole("navigation", { name: "Controls components", exact: true });
  await expect(index.getByRole("button", { name: "Switch", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hide components", exact: true }).click();
  await expect(index).toHaveCount(0);
});

test("the navbar scheme moves one capsule thumb with the reference spring", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/components/button", { surface: "solid" });
  const picker = page.getByRole("tablist", { name: "Scheme", exact: true });
  const thumb = page.getByTestId("navbar-scheme-selection");
  await expect(thumb).toHaveCSS("transition-duration", "0.45s");
  await expect(thumb).toHaveCSS("transition-timing-function", "cubic-bezier(0.34, 1.56, 0.64, 1)");
  const box = await picker.boundingBox();
  expect(box?.height).toBe(32);
  expect(box?.width).toBeGreaterThan(85);
  await thumb.evaluate((node) => node.setAttribute("data-retained", "true"));
  await picker.getByRole("tab", { name: "Light", exact: true }).click();
  await expect(thumb).toHaveAttribute("data-retained", "true");
  await expect(picker.getByRole("tab", { name: "Light", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => thumb.evaluate((node) => {
    const x = new DOMMatrix(getComputedStyle(node).transform).m41;
    return Math.abs(x - node.getBoundingClientRect().width);
  })).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(thumb).toHaveCSS("transition-duration", "0s");
});

test("the navbar Glass chip keeps the reference geometry and a persistent spring knob", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoDocs(page, "/components/button", { surface: "solid" });
  const chip = page.getByTestId("navbar-glass");
  const track = chip.locator(":scope > div").first();
  const knob = track.locator(":scope > div").first();
  await expect(chip).toHaveCSS("height", "32px");
  await expect(track).toHaveCSS("width", "26px");
  await expect(track).toHaveCSS("height", "16px");
  await expect(knob).toHaveCSS("width", "10px");
  await expect(knob).toHaveCSS("transition-duration", "0.35s");
  await knob.evaluate((node) => node.setAttribute("data-retained", "true"));
  await chip.click();
  await expect(chip).toHaveAttribute("aria-checked", "true");
  await expect(knob).toHaveAttribute("data-retained", "true");
  await expect.poll(() => knob.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41)).toBeCloseTo(10, 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(knob).toHaveCSS("transition-duration", "0s");
});
