import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ICONS, NAMES } from "../src/atoms/icon/icon.glyphs.ts";
import { SOURCES, ALIASES, REQUIRED_NAMES } from "../tools/icongen/icons.ts";

// The glyph set is GENERATED (tools/icongen -> src/atoms/icon/icon.glyphs.ts), so the
// failure mode it has that a hand-written module does not is DRIFT: a name added to the
// curated source list without a regenerate, or a regenerate that silently drops a glyph.
// These tests pin the generated output against its two inputs (the curated list and
// lucide-static's icon-nodes.json) so the drift fails here instead of at a call site.

const nodes: Record<string, [string, Record<string, string>][]> = JSON.parse(
  readFileSync(resolve(import.meta.dir, "../node_modules/lucide-static/icon-nodes.json"), "utf8"),
);

// The generator's own name mapping, mirrored so the test derives the expected set from
// the source list rather than from the generated file it is checking.
const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const canvasName = (source: string) => ALIASES[source] ?? camel(source);

describe("Icon glyph set", () => {
  it("ships the `blend` glyph, camelCased to the `blend` prop name", () => {
    // The glass-surface toggle's glyph: two overlapping circles reading as a blend of
    // two surfaces. Without it a consumer has to fall back to an unrelated metaphor.
    expect(nodes.blend).toBeDefined(); // the upstream glyph really exists
    expect(canvasName("blend")).toBe("blend"); // single word: camelCase is identity
    expect(ICONS.blend).toBeDefined();
    expect(ICONS.blend).toEqual([
      { t: "circle", cx: 9, cy: 9, r: 7 },
      { t: "circle", cx: 15, cy: 15, r: 7 },
    ]);
    expect(NAMES).toContainEqual({ key: "blend", label: "blend" });
  });

  it("generates exactly the curated source list, with no drift in either direction", () => {
    const expected = [...new Set(SOURCES)].map(canvasName).sort((a, b) => a.localeCompare(b));
    const produced = NAMES.map((n) => n.key);
    // Alphabetical gallery order is part of the generated contract.
    expect(produced).toEqual([...produced].sort((a, b) => a.localeCompare(b)));
    expect(produced).toEqual(expected);
    // ICONS and NAMES are two views of one entry list and must never diverge.
    expect(Object.keys(ICONS).sort((a, b) => a.localeCompare(b))).toEqual(expected);
  });

  it("keeps every previously-shipped glyph name available", () => {
    for (const name of REQUIRED_NAMES) expect(ICONS[name]).toBeDefined();
  });

  it("transcribes each glyph's primitive count from lucide-static", () => {
    // A cheap whole-set check that the generated shapes came from the real upstream
    // nodes: a stale or hand-edited entry shows up as a primitive-count mismatch.
    for (const source of new Set(SOURCES)) {
      expect(ICONS[canvasName(source)]).toHaveLength(nodes[source].length);
    }
  });
});
