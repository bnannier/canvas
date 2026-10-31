import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import { fitElementForScreenshot, type Surface } from "./docs";
import { pixelDigest } from "./visual-digests";

/**
 * Actual painted browser effects, not React wrapper names or an iOS skin label.
 *
 * `activeBackdropEffects` counts the backdrop blurs. `clearMaterials` counts the material
 * layers that paint without one: Dark Factory's clear well (a text field under glass),
 * the layer's translucent tint and a hairline rim over an unblurred backdrop. A material
 * layer counts only when something in it is painted (a translucent fill, an inset rim),
 * so an empty wrapper proves nothing.
 */
export async function readMaterialEffects(scope: Locator) {
  return scope.evaluate((root) => {
    const visible = (node: Element) => {
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const backdropOf = (node: Element) => {
      const style = getComputedStyle(node);
      const filter = style.getPropertyValue("backdrop-filter") || style.getPropertyValue("-webkit-backdrop-filter");
      return filter && filter !== "none" ? filter : null;
    };
    const effects: { filter: string; width: number; height: number }[] = [];
    for (const node of [root, ...Array.from(root.querySelectorAll("*"))]) {
      if (!visible(node)) continue;
      const filter = backdropOf(node);
      if (filter) {
        const box = node.getBoundingClientRect();
        effects.push({ filter, width: Math.round(box.width), height: Math.round(box.height) });
      }
    }
    const translucent = (color: string) => {
      const m = /rgba?\(([^)]+)\)/.exec(color);
      const alpha = m ? Number(m[1]!.split(/[,/\s]+/).filter(Boolean)[3] ?? 1) : 1;
      return alpha > 0 && alpha < 1;
    };
    let clearMaterials = 0;
    for (const material of Array.from(root.querySelectorAll('[data-testid="glass-material"]'))) {
      if (!visible(material)) continue;
      const layers = Array.from(material.querySelectorAll("*"));
      if (layers.some((layer) => backdropOf(layer))) continue;
      const painted = layers.some((layer) => {
        const style = getComputedStyle(layer);
        return translucent(style.backgroundColor) || style.boxShadow.includes("inset");
      });
      if (painted) clearMaterials++;
    }
    return {
      runtime: "browser" as const,
      userAgent: navigator.userAgent,
      supportsBackdropFilter: CSS.supports("backdrop-filter", "blur(1px)"),
      activeBackdropEffects: effects.length,
      clearMaterials,
      effects,
    };
  });
}

/** Ordinary material surfaces stop backdrop work in solid, including after mode changes without a reload. */
export async function expectNoMaterialEffects(scope: Locator) {
  await expect.poll(async () => {
    const { activeBackdropEffects, clearMaterials } = await readMaterialEffects(scope);
    return activeBackdropEffects + clearMaterials;
  }, {
    message: "solid mode must remove active browser backdrop material",
  }).toBe(0);
}

/** The reference Dialog scrim keeps its authored 2px veil in either surface mode.
 * The panel must still have no material, and no other backdrop effect qualifies.
 */
export async function expectOnlyDialogVeil(scope: Locator, dialog: Locator, scrim: string) {
  await expect(dialog).toHaveCount(1);
  const veil = dialog.locator(":scope > div").first();
  await expect(veil).toHaveCSS("backdrop-filter", "blur(2px)");
  await expect(veil).toHaveCSS("background-color", scrim);
  await expect.poll(async () => {
    const outer = await dialog.boundingBox();
    const inner = await veil.boundingBox();
    if (!outer || !inner) return false;
    return (["x", "y", "width", "height"] as const).every((key) => Math.abs(outer[key] - inner[key]) < 0.1);
  }, { message: "the authored veil must fill its own Dialog scrim" }).toBe(true);
  await expect.poll(async () => {
    const effects = await readMaterialEffects(scope);
    return { activeBackdropEffects: effects.activeBackdropEffects, clearMaterials: effects.clearMaterials, filters: effects.effects.map(({ filter }) => filter) };
  }, { message: "solid Dialog permits only its owned reference veil, with no panel or unrelated material" })
    .toEqual({ activeBackdropEffects: 1, clearMaterials: 0, filters: ["blur(2px)"] });
}

/** Change the real docs appearance control. This intentionally moves input focus. */
export async function setDocsSurface(page: Page, surface: Surface) {
  // The pill navbar's Glass switch (docs/src/shell/pill-nav.tsx).
  const control = page.getByRole("banner").getByRole("switch", { name: "Glass", exact: true });
  const checked = surface === "glass" ? "true" : "false";
  if ((await control.getAttribute("aria-checked")) !== checked) await control.click();
  await expect(control).toHaveAttribute("aria-checked", checked);
}

/** Keep material diagnostics and one-way pixel metadata, never the glass image. */
export async function attachMaterialEvidence(
  page: Page,
  testInfo: TestInfo,
  name: string,
  frame: Locator,
  metadata: Record<string, unknown>,
  atDocumentRoot = false,
) {
  if (!atDocumentRoot) await fitElementForScreenshot(page, frame);
  const capture = { animations: "disabled" as const, caret: "hide" as const };
  const png = atDocumentRoot ? await page.screenshot(capture) : await frame.screenshot(capture);
  await testInfo.attach(`${name}.json`, {
    body: JSON.stringify({ ...metadata, ...await readMaterialEffects(frame), pixels: await pixelDigest(png) }, null, 2),
    contentType: "application/json",
  });
}
