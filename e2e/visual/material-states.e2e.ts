import { gotoDocs, platformRow } from "../support/docs";
import { expectNoMaterialEffects, setDocsSurface } from "../support/material-evidence";
import { expect, test } from "../support/fixtures";

for (const scheme of ["light", "dark"] as const) {
  for (const initialSurface of ["solid", "glass"] as const) {
    test(`input survives both material directions from ${initialSurface} in ${scheme}`, async ({ page }) => {
      await gotoDocs(page, "/components/input", { scheme, surface: initialSurface });
      const row = platformRow(page, "web").first();
      const input = row.getByRole("textbox");
      await input.fill("Material changes preserve this draft");
      const originalInput = await input.elementHandle();
      expect(originalInput).not.toBeNull();
      for (const surface of initialSurface === "solid" ? ["glass", "solid"] as const : ["solid", "glass"] as const) {
        await setDocsSurface(page, surface);
        await expect(input).toHaveValue("Material changes preserve this draft");
        expect(await originalInput!.evaluate((node) => node.isConnected), "changing material must not remount the input").toBe(true);
        // On the web only floating surfaces take glass (the owner's 2026-10-28 pixel-exact
        // rule, PLAN D13): a field keeps its complete solid skin in both modes.
        await expectNoMaterialEffects(row);
      }
      await originalInput!.dispose();
    });

    test(`selection survives both material directions from ${initialSurface} in ${scheme}`, async ({ page }) => {
      await gotoDocs(page, "/components/button-group", { scheme, surface: initialSurface });
      const row = platformRow(page, "web").first();
      const week = row.getByRole("tab", { name: "Week", exact: true });
      await week.click();
      await expect(week).toHaveAttribute("aria-selected", "true");
      for (const surface of initialSurface === "solid" ? ["glass", "solid"] as const : ["solid", "glass"] as const) {
        await setDocsSurface(page, surface);
        await expect(week).toHaveAttribute("aria-selected", "true");
        // A segmented control is no floating surface: it keeps its solid skin under glass too.
        await expectNoMaterialEffects(row);
      }
    });
  }
}
