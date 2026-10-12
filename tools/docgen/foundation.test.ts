import { expect, test } from "bun:test";
import type { ApiEntry, ApiExport } from "../api/types";
import { deprecatedRows, firstSentence, renderFoundationModule } from "./foundation";

const exported = (name: string, facts: Partial<ApiExport> = {}): ApiExport => ({
  name, value: true, renderable: false, callable: false, deprecated: false, deprecatedText: "", summary: false, summaryText: "", files: ["src/field.ts"], ...facts,
});

const EXPORTS = [
  exported("Field", { renderable: true, summary: true, summaryText: "A labelled input." }),
  exported("fieldWidths", { summary: true, summaryText: "The field width scale." }),
  exported("FIELD_WASH", { deprecated: true, deprecatedText: "Use `fieldWidths`. It keeps working until a major.", summary: true, summaryText: "The old field wash (a tint, e.g. a hover). It painted rows.\n\nThe detail." }),
  exported("FieldShape", { value: false, deprecated: true, deprecatedText: "Kit internals, with no replacement.", summary: true, summaryText: "The shape of a field skin." }),
  exported("StyleKit", { deprecated: true, deprecatedText: "React Native's own: import it from react-native.", files: ["node_modules/.bun/react-native@0.86.0/node_modules/react-native/types/index.d.ts"] }),
];
const API: Record<string, ApiEntry> = {
  Field: { kind: "component", docs: "components/field" },
  fieldWidths: { kind: "token", docs: "guides/layout" },
  FIELD_WASH: { kind: "deprecated-alias", replacement: "fieldWidths", docs: "foundation", section: "Field helpers" },
  FieldShape: { kind: "deprecated-alias" },
  StyleKit: { kind: "deprecated-alias", replacement: "Field" },
};

test("every deprecated alias becomes a row: what it was, what to use instead and where that is documented", () => {
  expect(deprecatedRows(EXPORTS, API)).toEqual([
    {
      name: "FIELD_WASH",
      type: false,
      summary: "The old field wash (a tint, e.g. a hover).",
      instead: "Use `fieldWidths`. It keeps working until a major.",
      replacement: "fieldWidths",
      replacementRoute: "guides/layout",
      section: "Field helpers",
    },
    { name: "FieldShape", type: true, summary: "The shape of a field skin.", instead: "Kit internals, with no replacement.", replacement: null, replacementRoute: null, section: null },
    // A dependency's name is its owner's to document: the row says whose it is.
    { name: "StyleKit", type: false, summary: "React Native's own StyleKit, re-exported unchanged.", instead: "React Native's own: import it from react-native.", replacement: "Field", replacementRoute: "components/field", section: null },
  ]);
  // A manifest alias the entry does not export is a stale manifest, never a silent gap.
  expect(() => deprecatedRows(EXPORTS, { ...API, GONE: { kind: "deprecated-alias" } })).toThrow("records the deprecated alias GONE");
});

test("what a name was is its summary's first sentence, never cut inside parentheses or code", () => {
  expect(firstSentence("Spread it onto a field. The rest is detail.")).toBe("Spread it onto a field.");
  expect(firstSentence("The hold (one View. Invisible.) for a card. More.")).toBe("The hold (one View. Invisible.) for a card.");
  expect(firstSentence("Pass `a. B` through. Then more.")).toBe("Pass `a. B` through.");
  expect(firstSentence("A long summary\nwrapped over lines\n\nand a second paragraph.")).toBe("A long summary wrapped over lines");
  expect(firstSentence("e.g. lowercase continues. Next.")).toBe("e.g. lowercase continues.");
  expect(firstSentence("The web skin. iOS draws its own.")).toBe("The web skin.");
});

test("the module is typed rows under the generated header", () => {
  const text = renderFoundationModule(deprecatedRows(EXPORTS, API), "/* header */");
  expect(text.startsWith("/* header */\n")).toBe(true);
  expect(text).toContain("export const DEPRECATED_NAMES: DeprecatedName[] = [");
  expect(text).toContain('"name": "FIELD_WASH"');
});
