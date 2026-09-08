import { gotoDocs } from "../support/docs";
import { attach, describe as describeViolations, scanStructure, STRUCTURAL_RULES } from "../support/axe";
import { expect, test } from "../support/fixtures";

const PAGES = [
  { path: "/", title: "One codebase. Every platform. One component API." },
  { path: "/components", title: "Components" },
  { path: "/tokens/colors", title: "Colors & Theme" },
  { path: "/integration", title: "Integration" },
  { path: "/components/button", title: "Button" },
  { path: "/components/avatar", title: "Avatar" },
  { path: "/components/typography", title: "Typography" },
  { path: "/templates/activity", title: "Activity" },
  { path: "/patterns/accessibility", title: "Accessibility" },
];

for (const width of [1280, 390]) {
  for (const scheme of ["light", "dark"] as const) {
    for (const entry of PAGES) {
      test(`document structure ${entry.path} (${width}, ${scheme})`, async ({ page }, testInfo) => {
        await gotoDocs(page, entry.path, { scheme, viewport: { width, height: 900 } });
        const main = page.getByRole("main");
        await expect(main).toHaveCount(1);
        // Require the actual documentation title. A sample h1 inside a Typography
        // playground must never satisfy the page's heading requirement by accident.
        await expect(main.getByRole("heading", { level: 1, name: entry.title, exact: true })).toBeVisible();
        if (entry.path === "/components/avatar") {
          await expect(main.getByRole("heading", { level: 2, name: "Props", exact: true })).toHaveCount(1);
          await expect(main.getByRole("heading", { level: 3, name: "AvatarMenu", exact: true })).toHaveCount(1);
          await expect(main.getByRole("heading", { level: 2, name: "Don’ts", exact: true })).toHaveCount(1);
          await expect(main.getByRole("heading", { level: 3, name: "Identity", exact: true })).toHaveCount(1);
          await expect(main.getByRole("heading", { name: /^(Do|Don’t)$/ })).toHaveCount(0);
        }
        await expect(page.getByRole("banner")).toHaveCount(1);
        if (width < 1024) await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeVisible();
        // Axe derives the previous heading from its whole virtual tree, including
        // excluded nodes. Typography deliberately teaches broken h1-to-h4 jumps,
        // so even .exclude(previewStage) incorrectly flags the next docs h3.
        // Verify its complete docs outline directly, retaining all other Axe rules.
        if (entry.path === "/components/typography") {
          const outline = await main.getByRole("heading").evaluateAll((headings) => headings
            .filter((heading) => !heading.closest("[data-preview-stage]") && heading.getClientRects().length > 0)
            .map((heading) => ({
              name: heading.textContent,
              level: Number(heading.getAttribute("aria-level") ?? heading.tagName.slice(1)),
            })));
          expect(outline[0]).toEqual({ name: "Typography", level: 1 });
          expect(outline.find((heading) => heading.name === "Props")?.level).toBe(2);
          expect(outline.find((heading) => heading.name === "Don’ts")?.level).toBe(2);
          for (let index = 1; index < outline.length; index++) {
            expect(outline[index].level, `heading ${outline[index].name} follows ${outline[index - 1].name}`)
              .toBeLessThanOrEqual(outline[index - 1].level + 1);
          }
        }
        const findings = entry.path === "/components/typography"
          ? await scanStructure(page, "body", STRUCTURAL_RULES.filter((rule) => rule !== "heading-order"))
          : await scanStructure(page);
        await attach(testInfo, "structure", findings);
        expect(findings, describeViolations(findings)).toEqual([]);
        if (["/components", "/integration", "/components/avatar"].includes(entry.path)) {
          await page.screenshot({ path: testInfo.outputPath("headings.png") });
        }
      });
    }
  }
}

for (const width of [1280, 390]) {
  for (const [transparency, contrast] of [[false, false], [true, false], [false, true], [true, true]] as const) {
    test(`glass shell landmarks with transparency=${transparency}, contrast=${contrast} (${width})`, async ({ page }, testInfo) => {
      await gotoDocs(page, "/tokens/colors", { surface: "glass", viewport: { width, height: 900 } });
      const session = await page.context().newCDPSession(page);
      await session.send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-color-scheme", value: "dark" },
          { name: "prefers-reduced-transparency", value: transparency ? "reduce" : "no-preference" },
          { name: "prefers-contrast", value: contrast ? "more" : "no-preference" },
        ],
      });
      expect(await page.evaluate(() => [
        matchMedia("(prefers-reduced-transparency: reduce)").matches,
        matchMedia("(prefers-contrast: more)").matches,
      ])).toEqual([transparency, contrast]);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("navigation")).toHaveCount(1);
      const findings = await scanStructure(page);
      await attach(testInfo, "glass-structure", findings);
      expect(findings, describeViolations(findings)).toEqual([]);
    });
  }
}

test("mobile drawer and search preserve named landmarks when opened and dismissed", async ({ page }, testInfo) => {
  await gotoDocs(page, "/tokens/colors", { viewport: { width: 390, height: 900 } });
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // The responsive Sidebar renders a dialog, not a second navigation landmark.
  // Its modal hides the underlying Primary tabs from the accessibility tree.
  let findings = await scanStructure(page, "body", ["landmark-unique", "region"]);
  await attach(testInfo, "drawer-structure", findings);
  expect(findings, describeViolations(findings)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(menu).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Search", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search components", exact: true })).toBeFocused();
  findings = await scanStructure(page, "body", ["landmark-unique", "region"]);
  await attach(testInfo, "search-structure", findings);
  expect(findings, describeViolations(findings)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Search", exact: true })).toBeFocused();
});
