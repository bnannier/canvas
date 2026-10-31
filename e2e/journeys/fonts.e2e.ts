import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

// The document owns the docs' faces: every pre-rendered page declares its three critical
// brand families and optional Roboto preview face in its own style element (`canvas-shell`,
// docs/src/app/+html.tsx, from docs/src/ui/web-fonts.json). Only the three brand files
// are preloaded; Roboto loads on demand. The client declares
// none (docs/src/ui/fonts.ts registers nothing through expo-font, whose web rule could not
// carry a weight range). Three things are held on every engine: the declaring style element
// never leaves the head after the page loads (expo-font 57.0.1 once moved its own element
// and re-declared every face in Firefox, whose CSSOM keeps the family quoted, so the text
// vanished and came back in a fallback face), no family is declared twice, and there is one
// @font-face rule per family, each a self-hosted woff2 with its weight range, so the
// browser draws every weight from it rather than synthesizing one.
//
// The check is deterministic: anything that re-declared a face would do it in the root
// layout's mount effect, which runs before the commit that marks the document hydrated, so
// by the time gotoDocs returns it has already happened.
test("the pre-rendered page's font faces are the document's, declared once", async ({ page }) => {
  // Watch the document's style element from the document's first node on.
  await page.addInitScript(() => {
    const scope = window as unknown as { __fontStyleMoves: number };
    scope.__fontStyleMoves = 0;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of Array.from(record.removedNodes)) {
          if (node instanceof HTMLStyleElement && node.id === "canvas-shell") scope.__fontStyleMoves += 1;
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await gotoDocs(page, "/components/carousel/loop");
  const faces = await page.evaluate(() => ({
    rules: Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule)
      .map((rule) => ({
        // Firefox serializes the family quoted, Chromium and WebKit bare.
        family: rule.style.getPropertyValue("font-family").replace(/^(["'])(.*)\1$/, "$2"),
        weight: rule.style.getPropertyValue("font-weight"),
        path: /url\(["']?([^"')]+)/.exec(rule.style.getPropertyValue("src"))?.[1] ?? null,
      }))
      .sort((a, b) => a.family.localeCompare(b.family)),
    preloads: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]')).map((link) => link.getAttribute("href")),
    moves: (window as unknown as { __fontStyleMoves: number }).__fontStyleMoves,
  }));
  expect(faces.moves, "the faces' style element left the head after the page loaded").toBe(0);
  const families = faces.rules.map((rule) => rule.family);
  expect(families.filter((family, index) => families.indexOf(family) !== index), "faces declared twice").toEqual([]);
  expect(families, "the brand and optional preview families, each declared once").toEqual(["Bricolage Grotesque", "Instrument Sans", "JetBrains Mono", "Roboto"]);
  const critical = faces.rules.filter((rule) => rule.family !== "Roboto");
  expect(faces.preloads, "only the three critical brand faces are preloaded").toHaveLength(3);
  expect([...faces.preloads].sort()).toEqual(critical.map((rule) => rule.path).sort());
  expect(faces.preloads.map((href) => href?.split("/").pop()).sort(), "the exact three brand preload files").toEqual([
    expect.stringMatching(/^BricolageGrotesque\.[0-9a-f]{12}\.woff2$/),
    expect.stringMatching(/^InstrumentSans\.[0-9a-f]{12}\.woff2$/),
    expect.stringMatching(/^JetBrainsMono\.[0-9a-f]{12}\.woff2$/),
  ]);
  const roboto = faces.rules.find((rule) => rule.family === "Roboto")!;
  expect(roboto.path, "Roboto is declared as a self-hosted optional face").toMatch(/\/fonts\/Roboto\.[0-9a-f]{12}\.woff2$/);
  expect(faces.preloads, "Roboto is not a critical preload").not.toContain(roboto.path);
  for (const href of faces.preloads) expect(href, "a self-hosted, content-named woff2").toMatch(/\/fonts\/[A-Za-z]+\.[0-9a-f]{12}\.woff2$/);
  for (const rule of faces.rules) {
    expect(rule.weight, `${rule.family} carries its weight range`).toMatch(/^[1-9]00 [1-9]00$/);
    expect(rule.path, `${rule.family} uses a self-hosted, content-named woff2`).toMatch(/^\/fonts\/[A-Za-z]+\.[0-9a-f]{12}\.woff2$/);
  }
});
