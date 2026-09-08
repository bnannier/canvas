import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";
import { scanStructure } from "../support/axe";

for (const width of [1280, 390]) for (const scheme of ["light", "dark"] as const) {
  test(`wide-trigger popover measures its pointer at width ${width} in ${scheme}`, async ({ page }, info) => {
    await gotoDocs(page, "/testing/overlay-placement", { scheme, viewport: { width, height: 600 } });
    const trigger = page.getByRole("button", { name: "Review this project's settings and sharing permissions", exact: true });
    await trigger.click();
    const panel = page.getByRole("dialog").filter({ hasText: "Wide-trigger details" });
    await expect(panel).toBeVisible();
    const geometry = () => panel.evaluate((node) => {
      for (let card = node.parentElement; card; card = card.parentElement) {
        if (!card.style.maxHeight) continue;
        const arrow = Array.from(card.querySelectorAll("svg")).find((element) => getComputedStyle(element).position === "absolute");
        return arrow ? { card: card.getBoundingClientRect().toJSON(), arrow: arrow.getBoundingClientRect().toJSON() } : null;
      }
      return null;
    });
    await expect.poll(async () => {
      const actual = await geometry();
      const anchor = await trigger.boundingBox();
      return actual && anchor ? Math.abs(actual.arrow.x + actual.arrow.width / 2 - anchor.x - anchor.width / 2) : Infinity;
    }).toBeLessThan(1);
    const actual = (await geometry())!;
    const anchor = (await trigger.boundingBox())!;
    expect(anchor.width).toBeGreaterThan(260);
    const band = (await page.getByTestId("overlay-content-band").boundingBox())!;
    expect(actual.card.width).toBeCloseTo(Math.min(anchor.width, band.width - 16), 0);
    expect(actual.card.x).toBeGreaterThanOrEqual(0);
    expect(actual.card.right).toBeLessThanOrEqual(width);
    await expect(panel.getByRole("button", { name: "Close details", exact: true })).toBeInViewport({ ratio: 1 });
    const shot = info.outputPath(`wide-popover-${width}-${scheme}.png`);
    await page.screenshot({ path: shot });
    await info.attach("wide popover", { path: shot, contentType: "image/png" });
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`long command results keep the search and footer visible in ${scheme}`, async ({ page }, info) => {
    await gotoDocs(page, "/testing/overlay-placement", { scheme, viewport: { width: 390, height: 420 } });
    const trigger = page.getByTestId("edge-command").getByRole("button");
    await trigger.evaluate((element) => element.scrollIntoView({ block: "end" }));
    await trigger.click();
    const input = page.getByRole("textbox", { name: "Edge commands", exact: true });
    await expect(input).toBeFocused();
    for (let index = 1; index < 40; index += 1) await input.press("ArrowDown");
    const last = page.getByRole("option", { name: "Option 40", exact: true });
    await expect(last).toHaveAttribute("aria-selected", "true");
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(input).toBeInViewport({ ratio: 1 });
    const banner = await page.getByRole("banner").boundingBox();
    expect((await input.boundingBox())!.y).toBeGreaterThanOrEqual(banner!.y + banner!.height);
    await expect(page.getByText("to close", { exact: true })).toBeInViewport({ ratio: 1 });
    await expect(input).toBeFocused();
    const shot = info.outputPath(`command-edge-${scheme}.png`);
    await page.screenshot({ path: shot });
    await info.attach("fitted command", { path: shot, contentType: "image/png" });
    await input.press("Enter");
    await expect(page.getByTestId("command-selection")).toHaveText("Command selection: Option 40");
    await expect(input).toHaveCount(0);
  });

  test(`bottom-edge options flip and remain reachable in ${scheme}`, async ({ page }, info) => {
    await gotoDocs(page, "/testing/overlay-placement", { scheme, viewport: { width: 390, height: 420 } });
    const input = page.getByRole("combobox", { name: "Edge autocomplete", exact: true });
    await input.evaluate((element) => element.scrollIntoView({ block: "end" }));
    await input.click();
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    await expect.poll(async () => (await list.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y);
    await input.press("ArrowDown");
    await input.press("End");
    const option = page.getByRole("option", { name: "Option 40", exact: true });
    await expect(option).toBeInViewport({ ratio: 1 });
    const shot = info.outputPath(`autocomplete-edge-${scheme}.png`);
    await page.screenshot({ path: shot });
    await info.attach("fitted options", { path: shot, contentType: "image/png" });
    await input.press("Enter");
    await expect(input).toHaveValue("Option 40");
    await expect(list).toHaveCount(0);
  });

  test(`generic menu scrolls its final row within the viewport in ${scheme}`, async ({ page }, info) => {
    await gotoDocs(page, "/testing/overlay-placement", { scheme, viewport: { width: 390, height: 420 } });
    const trigger = page.getByRole("button", { name: "Edge menu", exact: true });
    await trigger.evaluate((element) => element.scrollIntoView({ block: "end" }));
    await trigger.click();
    const first = page.getByRole("menuitem", { name: "Option 01", exact: true });
    await expect(first).toBeFocused();
    await first.press("End");
    const last = page.getByRole("menuitem", { name: "Option 40", exact: true });
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport({ ratio: 1 });
    const shot = info.outputPath(`menu-edge-${scheme}.png`);
    await page.screenshot({ path: shot });
    await info.attach("fitted menu", { path: shot, contentType: "image/png" });
    expect(await scanStructure(page, undefined, ["scrollable-region-focusable", "aria-hidden-focus"])).toEqual([]);
    await last.press("Enter");
    await expect(last).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
