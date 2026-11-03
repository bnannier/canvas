import { DETAIL_SPECS } from "../../docs/src/core/data/detail-specs";
import { gotoDocs } from "../support/docs";
import { expect, test } from "../support/fixtures";

// Every component page's Anatomy figure numbers the parts its legend lists, as the
// hand-off's does (Component.dc.html `_measure`): each kit component registers its parts
// with the AnatomyProvider (src/style/anatomy.tsx), and the section draws a marker for
// every part it measured and dims the rest. Before every component registered its parts,
// only Button's figure carried numbers.
//
// A part listed below is one the page's specimen does not draw, so the legend dims it: the
// component registers it once it is drawn (test/anatomy-parts-*.test.tsx pins that), but
// the docs demo, its first example and the spec's anatomy props, leave it out. Each one is
// a gap in the specimen's data or presentation, not in the registry; drawing it means
// changing that specimen.
const UNDRAWN: Record<string, Record<string, string>> = {
  "action-sheet": Object.fromEntries(["Scrim", "Sheet", "Title", "Action", "Destructive action", "Cancel"].map((p) => [p, "the specimen shows the trigger: the embedded sheet takes its height from a parent and the stage gives it none"])),
  drawer: Object.fromEntries(["Scrim", "Panel", "Header", "Body", "Footer"].map((p) => [p, "the specimen shows the trigger: the embedded drawer takes its height from a parent and the stage gives it none"])),
  command: Object.fromEntries(["Panel", "Search field", "Group label", "Item", "Active item", "Footer hints"].map((p) => [p, "the specimen shows the trigger; the bare card overflows the stage"])),
  calendar: { "Event dot": "the first example passes no events" },
  chart: { Legend: "the single-series demo draws no legend" },
  "range-area-chart": { Legend: "RangeAreaChart draws no legend; its band is named by `label`" },
  chat: { Avatar: "the reference conversation passes no providerIcon" },
  "description-lists": { Action: "the first example has no item with `update`" },
  dialog: { Body: "the form dialog ignores `withBody` and the example passes no children", Actions: "the example passes no footer" },
  "drag-drop": { "Lifted item": "drawn only during a drag", "Drop indicator": "drawn only during a drag" },
  dropdown: { "Section label": "the first example's items have no label", Shortcut: "the first example's items have no shortcut", "Destructive item": "the first example has no destructive item" },
  feeds: { Connector: "the default `activity` lead draws no connector line" },
  heatmap: { Title: "drawn only with the calendar layout's `caption`" },
  input: { "Helper or error": "Input has no message line; it is Field's" },
  "phone-input": { Error: "`error` is a state; the message line is Field's" },
  listbox: { "Detail line": "the first example has no `detail` items" },
  popover: { Trigger: "the inline specimen omits the trigger" },
  radio: { Description: "the first example passes no description" },
  sidebar: { "Section label": "the first example's sections are untitled", Footer: "the first example has no footer or account" },
  sparkline: { Fill: "the default bar strip has no wash; Fill is the `line` variant's" },
  "stacked-bar": { Total: "StackedBar draws no total" },
  tabs: { Badge: "the first example's tabs carry no badge" },
};

// A desktop window, where the figure's stage is wide enough for a Navbar to show its links
// (in a narrower stage it folds them into its menu button, and the legend dims them).
const DESKTOP = { width: 1440, height: 900 };

for (const [slug, spec] of Object.entries(DETAIL_SPECS)) {
  test(`${slug}: the anatomy figure numbers every part it draws`, async ({ page }) => {
    await gotoDocs(page, `/components/${slug}`, { viewport: DESKTOP });
    const section = page.locator('[data-detail-section="an"]');
    await section.scrollIntoViewIfNeeded();
    const undrawn = UNDRAWN[slug] ?? {};
    const expected = spec.anatomy.parts.flatMap((part, i) => (part in undrawn ? [] : [String(i + 1)]));
    await expect.poll(() => section.locator("[data-anatomy-mark]").evaluateAll((marks) => marks.map((m) => m.getAttribute("data-anatomy-mark")).sort((a, b) => Number(a) - Number(b)))).toEqual(expected);
    const dimmed = await section.locator('[data-anatomy-shown="false"]').evaluateAll((rows) => rows.map((r) => r.getAttribute("data-anatomy-part")));
    expect(dimmed.sort()).toEqual(Object.keys(undrawn).sort());
  });
}

test("every undrawn part is a part its spec lists", () => {
  for (const [slug, parts] of Object.entries(UNDRAWN)) for (const part of Object.keys(parts)) expect(DETAIL_SPECS[slug]?.anatomy.parts).toContain(part);
});
