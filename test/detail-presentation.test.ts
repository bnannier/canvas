import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { generatedPresentation, presentationFromSource, referenceTokenNames } from "../tools/v4/derive-detail-presentation.ts";
import { presentationFor, referenceGuidance, referenceTokens, referenceTokenValue, referenceVariants } from "../docs/src/ui/detail/presentation.ts";
import type { DocExample, DocGuidance } from "../docs/src/core/scope.ts";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import { colorsFor } from "../src/style/tokens.ts";

const ROOT = join(import.meta.dir, "..");
const source = readFileSync(join(ROOT, "tools/v4/handoff/canvas-docs.js"), "utf8");

describe("the reference's detail presentation", () => {
  it("keeps the manifest derived from the actual vendored registry", () => {
    expect(readFileSync(join(ROOT, "docs/src/ui/detail/presentation-data.ts"), "utf8")).toBe(generatedPresentation(source));
  });

  it("selects Button's twenty reference examples in source order, with current code", () => {
    const reference = presentationFromSource(source).button!;
    expect(reference.variants).toHaveLength(20);
    const example = (label: string): DocExample => ({ label, code: `current code for ${label}`, render: () => null });
    const current = [example("Default"), example("A new kit example"), ...[...reference.variants].reverse().map(example)];
    const result = referenceVariants(current, presentationFor("button"));
    expect(result.map(({ example }) => example.label)).toEqual(reference.variants);
    expect(result.every(({ example }) => example.code === `current code for ${example.label}`)).toBe(true);
    expect(current).toHaveLength(22);
  });

  it("applies the owner's Icon reorder: Disclosure indicator before Gallery", () => {
    const variants = presentationFromSource(source).icon!.variants;
    expect(variants.slice(-2)).toEqual(["Disclosure indicator", "Gallery"]);
  });

  it("does not invent a Variants section when the reference contains no variants", () => {
    const reference = presentationFromSource('window.CV_DOCS={"c":{"primitive":{"intro":[],"variants":[],"sections":[],"a11y":[]}}};').primitive!;
    const current: DocExample[] = [{ label: "Default", code: "", render: () => null }, { label: "New example", code: "", render: () => null }];
    expect(referenceVariants(current, reference)).toEqual([]);
  });

  it("can render every reference variant from current generated examples", () => {
    const root = join(ROOT, "docs/src/core/examples");
    const categories = readdirSync(root);
    for (const component of COMPONENTS) {
      const dir = component.dir ?? component.slug;
      const file = categories.map((category) => join(root, category, dir, `${dir}-docs.tsx`)).find(existsSync)!;
      const names = [...readFileSync(file, "utf8").matchAll(/^    \{ label: ("(?:[^"\\]|\\.)*")/gm)].map((match) => JSON.parse(match[1]!) as string);
      const current: DocExample[] = names.map((label) => ({ label, code: "", render: () => null }));
      const reference = presentationFor(component.slug)!;
      expect(referenceVariants(current, reference).map(({ example }) => example.label), component.slug).toEqual(reference.variants);
    }
  });

  it("orders current guidance by the reference and excludes extra visual sections", () => {
    const reference = presentationFor("button")!;
    const current: DocGuidance[] = [
      { title: "An extra current guide", blocks: ["Retained in the kit docs."] },
      ...[...reference.guidance].reverse().map((section) => ({ title: section.title, blocks: ["Current accurate prose."] })),
    ];
    expect(referenceGuidance(current, reference).map((g) => g.title)).toEqual(reference.guidance.map((g) => g.title));
    expect(referenceGuidance(current, reference).every((g) => g.blocks[0] === "Current accurate prose.")).toBe(true);
  });

  it("reads token names from the source renderer and follows intent and palette changes", () => {
    const reference = presentationFor("button")!;
    expect(referenceTokens(reference, {})).toEqual(referenceTokenNames("button"));
    expect(referenceTokens(reference, { "@Intent": "secondary" })).toEqual(referenceTokenNames("button", { "@Intent": "secondary" }));
    const violet = colorsFor("violet", "light");
    const mint = colorsFor("mint", "light");
    expect(referenceTokenValue("--ion", mint)).toBe(mint.primary);
    expect(referenceTokenValue("--ion", mint)).not.toBe(referenceTokenValue("--ion", violet));
  });
});
