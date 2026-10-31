/**
 * Full manifest coverage for material mode, independent of the solid PNG baselines.
 * Browser screenshots of iOS/Android rows establish skin anatomy only. Native
 * material evidence comes from the explicit native Lookout targets.
 */
import { colorsFor } from "../../src/style/tokens";
import { MATERIAL_ROUTES } from "../support/material-routes";
import { MATERIAL_OVERLAYS, TOAST } from "../support/overlays";
import { FIXED_TIME, gotoDocs, platformRow, previewCard, stage } from "../support/docs";
import { attachMaterialEvidence, expectNoMaterialEffects, expectOnlyDialogVeil, readMaterialEffects } from "../support/material-evidence";
import { expect, test } from "../support/fixtures";

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  phone: { width: 390, height: 844 },
} as const;

// These default examples own a surface of their own, a content or control surface. On
// the web only what floats over the page takes glass (the owner's 2026-10-28 pixel-exact
// rule, PLAN D13: resolveMaterial's "design" fallback), so under glass their web row keeps
// its complete solid skin and does no backdrop work; the floating overlays below are the
// web's glass, and native material evidence comes from the native Lookout targets.
const SOLID_ON_WEB_DEFAULTS = new Set(["button", "button-group", "card", "input", "badge", "data-table"]);

for (const scheme of ["dark", "light"] as const) {
  for (const [formFactor, viewport] of Object.entries(VIEWPORTS)) {
    for (const route of MATERIAL_ROUTES) {
      test(`material ${route.slug} ${scheme} ${formFactor}`, async ({ page }, testInfo) => {
        await page.clock.setFixedTime(FIXED_TIME);
        await gotoDocs(page, route.path, { scheme, surface: "glass", viewport });
        const card = previewCard(page).first();
        const row = platformRow(page, "web").first();
        await expect(row).toBeVisible();
        if (SOLID_ON_WEB_DEFAULTS.has(route.slug)) await expectNoMaterialEffects(row);
        const metadata = { route: route.path, roles: route.roles, scheme, formFactor, surface: "glass", reducedMotion: true };
        await attachMaterialEvidence(page, testInfo, "glass-rest", card, metadata);

        if (route.slug === "toast") {
          await gotoDocs(page, "/components", { scheme, surface: "glass", viewport });
          const speaking = TOAST.region(page).filter({ hasText: /\S/ });
          const before = await speaking.count();
          await TOAST.open(page);
          await expect(speaking).toHaveCount(before + 1);
          await attachMaterialEvidence(page, testInfo, "glass-notification", page.locator("[data-page-scroll]").first(), metadata, true);
        }

        // Preserve the existing solid image baselines and additionally verify
        // that this route does no browser backdrop work when glass is disabled.
        await gotoDocs(page, route.path, { scheme, surface: "solid", viewport });
        await expect(row).toBeVisible();
        await testInfo.attach("solid-rest-effects.json", {
          body: JSON.stringify(await readMaterialEffects(row), null, 2), contentType: "application/json",
        });
        // cv-kit-overlays.js stg() paints the Dialog's 2px dim veil in both modes;
        // the floating panel's glass must still disappear completely.
        if (route.slug === "dialog") await expectOnlyDialogVeil(row, row.getByRole("dialog"), colorsFor("violet", scheme).scrim!);
        else await expectNoMaterialEffects(row);
        for (const overlay of MATERIAL_OVERLAYS) {
          if (overlay.slug !== route.slug) continue;
          await gotoDocs(page, overlay.path, { scheme, surface: "glass", viewport });
          const closed = await overlay.panel(page).count();
          await overlay.open(page);
          await expect(overlay.panel(page)).toHaveCount(closed + overlay.adds);
          await expect(overlay.panel(page).last()).toBeVisible();
          await attachMaterialEvidence(page, testInfo, "glass-open", stage(page), metadata, overlay.atDocumentRoot || overlay.inWindowLayer);
          await page.keyboard.press("Escape");
          await expect(overlay.panel(page)).toHaveCount(closed);

          await gotoDocs(page, overlay.path, { scheme, surface: "solid", viewport });
          await overlay.open(page);
          await expect(overlay.panel(page).last()).toBeVisible();
          const host = overlay.atDocumentRoot || overlay.inWindowLayer ? page.locator("body") : stage(page).locator("..");
          await testInfo.attach("solid-open-effects.json", {
            body: JSON.stringify(await readMaterialEffects(host), null, 2), contentType: "application/json",
          });
          if (overlay.slug === "dialog") await expectOnlyDialogVeil(host, overlay.panel(page).last(), colorsFor("violet", scheme).scrim!);
          else await expectNoMaterialEffects(host);
        }
      });
    }
  }
}
