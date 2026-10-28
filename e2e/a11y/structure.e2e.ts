import { gotoDocs, isDetailPath } from "../support/docs";
import { attach, describe as describeViolations, scanStructure, STRUCTURAL_RULES } from "../support/axe";
import { expect, test } from "../support/fixtures";

const PAGES = [
  { path: "/", title: "Made of light." },
  { path: "/components", title: "Components" },
  { path: "/tokens/colors", title: "Colors & Theme" },
  { path: "/integration", title: "Integration" },
  { path: "/components/button", title: "Button" },
  { path: "/components/avatar", title: "Avatar" },
  { path: "/components/typography", title: "Typography" },
  { path: "/templates/activity", title: "Activity" },
  { path: "/patterns/accessibility", title: "Accessibility" },
  // The section pages (docs/src/sections): the room's title is the page's h1.
  { path: "/sections/foundations", title: "Foundations" },
  { path: "/sections/layout", title: "Layout" },
  { path: "/sections/controls", title: "Controls" },
  { path: "/sections/inputs", title: "Inputs" },
  { path: "/sections/navigation", title: "Navigation" },
  { path: "/sections/data", title: "Surfaces & data" },
  { path: "/sections/charts", title: "Charts" },
  { path: "/sections/overlays", title: "Overlays & feedback" },
];

// A component page's Do/Don't section heading (docs/src/ui/detail/sections.tsx), named after the
// `## Do & Don't` section of the component's .md source, with the typographic apostrophe
// the page sets. One h2 for the section; each pair's title is an h3 under it.
const DO_DONT_HEADING = "Do & Don’t";

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
          // Avatar's own props lead; its sub-components' tables are collapsibles under them.
          await expect(main.getByText(/props on AvatarProps,/)).toHaveCount(1);
          await expect(main.getByRole("button", { name: /^AvatarMenuProps/ })).toHaveCount(1);
          await expect(main.getByRole("heading", { level: 2, name: DO_DONT_HEADING, exact: true })).toHaveCount(1);
          await expect(main.getByRole("heading", { level: 3, name: "Identity", exact: true })).toHaveCount(1);
          // Each card's Do or Don't is a Badge label, never a heading of its own.
          await expect(main.getByRole("heading", { name: /^(Do|Don’t)$/ })).toHaveCount(0);
        }
        if (isDetailPath(entry.path)) {
          // The v4 detail page (docs/src/ui/detail): every section an h2 under the title,
          // Props and Do & Don't among them, and the guidance in Usage as h3 cards.
          // A specimen's own headings sit in a preview stage (Typography's samples name
          // themselves "Playground"), so only the page's outline is counted.
          const outline = await main.getByRole("heading", { level: 2 }).evaluateAll((headings) => headings
            .filter((heading) => !heading.closest("[data-preview-stage]"))
            .map((heading) => heading.textContent));
          for (const section of ["Playground", "Variants", "Props", "Usage", DO_DONT_HEADING]) {
            expect(outline.filter((name) => name === section), section).toHaveLength(1);
          }
          await expect(main.getByRole("heading", { name: /^(Do|Don’t)$/ })).toHaveCount(0);
          // A section of the component's own after Do & Don't (Button's "## Touch area").
          if (entry.path === "/components/button") {
            await expect(main.getByRole("heading", { level: 3, name: "Touch area", exact: true })).toHaveCount(1);
          }
        }
        await expect(page.getByRole("banner")).toHaveCount(1);
        // The pill navbar is the Primary navigation at every width (docs/src/shell/pill-nav.tsx).
        await expect(page.getByRole("banner").getByRole("navigation", { name: "Primary", exact: true })).toBeVisible();
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
          // Both lookups fail as "Expected: 2, Received: undefined", so each names its heading.
          expect(outline.find((heading) => heading.name === "Props")?.level, "the Props section h2").toBe(2);
          expect(outline.find((heading) => heading.name === DO_DONT_HEADING)?.level, `the ${DO_DONT_HEADING} section h2`)
            .toBe(2);
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
      // The pill is the one Primary navigation; a room's page adds the rail's navigation
      // beside it in a window of 760 px or more (docs/src/shell/rail.tsx), and
      // /tokens/colors is a page of the Guides room.
      await expect(page.getByRole("navigation", { name: "Primary", exact: true })).toHaveCount(1);
      await expect(page.getByRole("navigation")).toHaveCount(width >= 760 ? 2 : 1);
      const findings = await scanStructure(page);
      await attach(testInfo, "glass-structure", findings);
      expect(findings, describeViolations(findings)).toEqual([]);
    });
  }
}

test("phone search preserves named landmarks when opened and dismissed", async ({ page }, testInfo) => {
  // The phone shell is the pill navbar alone (no drawer, no tab bar): its search opener
  // sits in the pill's sideways-scrolling row.
  await gotoDocs(page, "/tokens/colors", { viewport: { width: 390, height: 900 } });
  const primary = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(primary).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(1);
  const opener = page.getByRole("banner").getByRole("button", { name: "Search components", exact: true });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search components", exact: true })).toBeFocused();
  const findings = await scanStructure(page, "body", ["landmark-unique", "region"]);
  await attach(testInfo, "search-structure", findings);
  expect(findings, describeViolations(findings)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(primary).toBeVisible();
});
