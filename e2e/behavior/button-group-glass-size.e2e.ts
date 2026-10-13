/**
 * ButtonGroup is the same size in solid and glass, so a page does not reflow when the
 * surface mode changes (glass-surface-button-group-size-1, the owner's GP-1 decision).
 *
 * Under glass the group used to swap its skin's track and cells for a shared geometry,
 * and every page holding a ButtonGroup moved: /components/button-group's segmented,
 * spaced, stepper and split examples changed size, and so did the docs' own Solid |
 * Glass and viewport toggles in the page chrome. The unit test (test/button-group-glass-
 * size.test.tsx) holds each skin's boxes; this reads the served export as a browser lays
 * it out: every tab list, tab and button on the page keeps its width and height, and the
 * page its height, between solid and glass, in light and dark.
 */
import type { Page } from "@playwright/test";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

const ROUTE = "/components/button-group";

/** Every tab list, tab and button's size, in document order, and the page's height. */
async function sizes(page: Page) {
  return page.evaluate(() => {
    const round = (value: number) => Math.round(value * 10) / 10;
    const boxes = Array.from(document.querySelectorAll('[role="tablist"], [role="tab"], [role="button"], button')).map((node) => {
      const rect = node.getBoundingClientRect();
      return `${node.getAttribute("role") ?? node.tagName.toLowerCase()} ${(node.getAttribute("aria-label") ?? node.textContent ?? "").trim().slice(0, 24)}: ${round(rect.width)} x ${round(rect.height)}`;
    });
    return { boxes, height: round(document.documentElement.scrollHeight) };
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`every ButtonGroup on its page keeps its size between solid and glass, ${scheme}`, async ({ page }) => {
    await gotoDocs(page, ROUTE, { scheme, surface: "solid", viewport: { width: 1440, height: 900 } });
    const solid = await sizes(page);
    expect(solid.boxes.filter((box) => box.startsWith("tablist")).length, "the page's segmented groups").toBeGreaterThan(3);
    await gotoDocs(page, ROUTE, { scheme, surface: "glass", viewport: { width: 1440, height: 900 } });
    const glass = await sizes(page);
    expect(glass.boxes).toEqual(solid.boxes);
    expect(glass.height).toBe(solid.height);
  });
}
