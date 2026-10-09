import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TypeSites, type TypeValue } from "./type-sites.ts";

// The folder behind test/design-rules-type-floors.test.ts: every way a skin hands a number
// to a font size is traced to the place the number is written, and what it cannot trace
// it reports instead of guessing.

let root = "";
const write = (relative: string, text: string) => {
  mkdirSync(join(root, relative, ".."), { recursive: true });
  writeFileSync(join(root, relative), text);
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "type-sites-"));
  write(
    "src/atoms/x/x.styles.ts",
    `
const LABEL = { small: { fontSize: 11, lineHeight: 15 }, base: { fontSize: 14 } };
const GLYPH: Record<string, number> = { small: 10.5, base: 13 };
const DIGIT: Record<string, [number, number]> = { small: [12, 16], base: [16, 24] };
function glyphType(fontSize: number) { return { fontSize, lineHeight: fontSize }; }
function digit(size: string) { const [fontSize, lineHeight] = DIGIT[size]; return { fontSize, lineHeight }; }
export const webSkin = {
  iconSize: { small: 16, base: 20 },
  label: (size: "small" | "base") => LABEL[size],
  glyph: (size: string) => glyphType(GLYPH[size]),
  digit,
  helper: (big: boolean) => ({ fontSize: big ? 13 : 11.5 }),
  eyebrow: { ...typeScale.eyebrow, color: "red" },
  caption: typeScale.caption,
  hint: { fontSize: typeScale.small.fontSize, lineHeight: typeScale.small.lineHeight },
};
export const iosSkin = webSkin;
`,
  );
  write(
    "src/atoms/x/x.shared.tsx",
    `
export function createX(skin: XSkin) {
  return function X({ size }: { size: string }) {
    const glyph = skin.iconSize[size];
    return <Text style={{ fontSize: Math.round(glyph * 0.85) }} />;
  };
}
export function Loose(props: { size: number }) {
  return <Text style={{ fontSize: props.size }} />;
}
`,
  );
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

const scan = () => new TypeSites(root).scan(["src/atoms/x/x.styles.ts", "src/atoms/x/x.shared.tsx"]);
const at = (values: TypeValue[], path: string) => values.filter((v) => v.path === path).map((v) => v.value).sort((a, b) => a - b);

describe("TypeSites", () => {
  it("reports a table row where its number is written", () => {
    const { values } = scan();
    expect(at(values, "LABEL.small")).toEqual([11]);
    expect(at(values, "LABEL.base")).toEqual([14]);
  });

  it("follows a helper's parameter to every call, and a table read by any key", () => {
    expect(at(scan().values, "GLYPH")).toEqual([]);
    expect(at(scan().values, "GLYPH.small")).toEqual([10.5]);
    expect(at(scan().values, "GLYPH.base")).toEqual([13]);
  });

  it("reads a destructured element of a tuple table", () => {
    const { values } = scan();
    expect(at(values, "DIGIT.small")).toEqual([12]);
    expect(at(values, "DIGIT.base")).toEqual([16]);
  });

  it("takes both branches of a conditional", () => {
    expect(at(scan().values, "webSkin.helper")).toEqual([11.5, 13]);
  });

  it("reads the type scale where a style is used whole or by its size", () => {
    const { values } = scan();
    expect(values.find((v) => v.path === "webSkin.eyebrow")).toMatchObject({ value: 10, kind: "type scale" });
    expect(values.find((v) => v.path === "webSkin.caption")).toMatchObject({ value: 11, kind: "type scale" });
    expect(values.find((v) => v.path === "webSkin.hint")).toMatchObject({ value: 11.5, kind: "type scale" });
  });

  it("computes a shell's size from the skins its styles module exports", () => {
    const { values } = scan();
    expect(values.filter((v) => v.kind === "computed").map((v) => v.value).sort((a, b) => a - b)).toEqual([14, 17]);
  });

  it("reports what it cannot trace instead of guessing", () => {
    const { unresolved } = scan();
    expect(unresolved.map((u) => u.path)).toEqual(["Loose"]);
  });
});
