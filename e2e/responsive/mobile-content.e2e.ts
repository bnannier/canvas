import type { Locator } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

/** Controls inside clipping cards must fit even when the page itself has no overflow. */
async function clippedControls(root: Locator): Promise<string[]> {
  return root.evaluate((host) => Array.from(host.querySelectorAll<HTMLElement>('button, input, [role="tab"]')).flatMap((control) => {
    const box = control.getBoundingClientRect();
    if (!box.width) return [];
    for (let parent = control.parentElement; parent && parent !== host; parent = parent.parentElement) {
      const overflow = getComputedStyle(parent).overflowX;
      // A real horizontal scroller deliberately makes more content reachable by panning.
      if (overflow === "auto" || overflow === "scroll") return [];
      const clip = parent.getBoundingClientRect();
      if ((overflow === "hidden" || overflow === "clip") && (box.x < clip.x - 2 || box.right > clip.right + 2)) {
        return [control.getAttribute("aria-label") || control.textContent || control.tagName];
      }
    }
    return [];
  }));
}

for (const width of [320, 390, 768]) {
  test(`the Layout ruler stays inside its page at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/layout", { viewport: { width, height: 844 } });
    await expect.poll(() => page.locator("[data-page-scroll]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
    await expect.poll(() => clippedControls(page.getByRole("main"))).toEqual([]);
  });
}

for (const width of [320, 390]) {
  test(`templates keep the picker and app controls usable at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/templates/dashboard", { viewport: { width, height: 844 } });
    const main = page.getByRole("main");
    const picker = main.getByRole("button", { name: /^Template, / });
    await expect(picker).toBeVisible();
    await expect.poll(() => clippedControls(main)).toEqual([]);
    // The full eighteen-row template rail must not push the screen down on phones.
    await expect(main.getByRole("navigation", { name: "Templates", exact: true })).toHaveCount(0);
    for (const name of ["Search Riskora", "Notifications"]) {
      const control = main.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      await expect.poll(async () => {
        const box = await control.boundingBox();
        return !!box && box.x >= 0 && box.x + box.width <= width;
      }, { message: `${name} is clipped by the mobile browser frame` }).toBe(true);
    }
    const inbox = main.getByRole("tab", { name: "Inbox", exact: true });
    await inbox.scrollIntoViewIfNeeded();
    await inbox.click();
    await expect(page).toHaveURL(/\/templates\/inbox(?:\?|$)/);
    await picker.click();
    await page.getByRole("option", { name: "14 · Account · Settings", exact: true }).click();
    await expect(page).toHaveURL(/\/templates\/settings(?:\?|$)/);
    const field = main.getByRole("textbox", { name: "Workspace name", exact: true });
    await expect.poll(() => clippedControls(main)).toEqual([]);
    await field.fill("Mobile workspace");
    const node = await field.elementHandle();
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(main.getByRole("navigation", { name: "Templates", exact: true })).toBeVisible();
    await page.setViewportSize({ width, height: 844 });
    await expect(picker).toBeVisible();
    expect(await node!.evaluate((element) => element.isConnected)).toBe(true);
    await expect(field).toHaveValue("Mobile workspace");
    await node!.dispose();
  });

  test(`overlay specimens keep their controls inside the card at ${width}px`, async ({ page }) => {
    await gotoDocs(page, "/overlays", { viewport: { width, height: 844 } });
    const main = page.getByRole("main");
    await expect.poll(() => clippedControls(main)).toEqual([]);
    const input = main.getByRole("textbox", { name: "Type a command or search…", exact: true });
    const search = input.locator("..");
    // Inputs have a browser-specific intrinsic minimum. The whole search row,
    // including its Escape hint, must share the narrow palette's available width.
    await expect.poll(async () => {
      const [row, field, escape] = await Promise.all([search.boundingBox(), input.boundingBox(), search.getByText("esc", { exact: true }).locator("..").boundingBox()]);
      return !!row && !!field && !!escape && field.x >= row.x && field.x + field.width <= escape.x && escape.x + escape.width <= row.x + row.width;
    }).toBe(true);
    await input.fill("Go to");
    await input.press("ArrowDown");
    await expect(main.getByRole("option", { name: /Go to Foundations/ })).toHaveAttribute("aria-selected", "true");
  });
}

test("the typography guide reports the current v4 scale", async ({ page }) => {
  await gotoDocs(page, "/tokens/typography", { viewport: { width: 390, height: 844 } });
  const main = page.getByRole("main");
  for (const spec of ["56 / 56 · 500", "44 / 46.2 · 500", "15 / 23.25 · 400", "12 / 17.4 · 400"]) {
    await expect(main.getByText(spec, { exact: true })).toBeVisible();
  }
  await expect(main.getByText("<Typography eyebrow>", { exact: true })).toBeVisible();
  await expect.poll(() => page.locator("[data-page-scroll]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
});
