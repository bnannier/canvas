import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CornerSites } from "./corner-sites.ts";
import { claimHolds, cornerClaims, handoffClaims, type SourceClaim } from "./corner-comments.ts";

// The comment side of test/design-rules-shape.test.ts: a corner a comment states is held to
// what the code the comment sits on draws, not to anything its component draws elsewhere.

let root = "";
const write = (relative: string, text: string) => {
  mkdirSync(join(root, relative, ".."), { recursive: true });
  writeFileSync(join(root, relative), text);
};

const STYLES = `import { shape } from "../../style/index.js";

// The z skins. Web: the field at the 10px field corner, the list a card at the 12px
// menu corner.
export type Size = "small" | "large";

export const webSkin = {
  // The list: a card at the 12px menu corner.
  popover: { borderRadius: shape.web.menu },
  // Rows with a 10px corner, like the field's.
  row: { borderRadius: shape.web.control },
  field: { borderRadius: shape.web.field }, // the 10px field corner
  // --- stepper (rounded 8) ---
  stepperArrow: { height: 32 },
  // A box with a rounded 1px border at the
  // 8px corner.
  box: { borderWidth: 1, borderRadius: shape.web.control },
};

const label = \`\${webSkin.field.borderRadius}\`;
// After a template literal: the 8pt corner of the iOS row.
export const iosSkin = { row: { borderRadius: shape.ios.field }, label };
// Size-dependent, one element: the 6px corner small and the 8px corner large.
export const sizedSkin = { box: (size: Size) => ({ borderRadius: size === "small" ? 6 : 8 }) };
// The whole skin: a 12pt card corner and an 8pt editor corner.
export const wholeSkin = { outline: { borderRadius: shape.ios.card }, editor: { borderRadius: shape.ios.field }, dot: { borderRadius: 9999 } };
// The menu skin at its 12px corner, its dots round.
export const menuSkin = { card: { borderRadius: shape.web.menu }, dot: { borderRadius: 9999 } };
// The iOS 12pt corner, on rows that draw 8.
export const versionSkin = { row: { borderRadius: shape.web.control } };
// The Material 3 continuous look, and the iOS 26 corner style: versions, not corners.
export const plainSkin = { row: { borderRadius: shape.web.control } };
`;

const ENTRY = `import { iosSkin } from "./z.styles.js";
import { createZ } from "./z.shared.js";

// The iOS z at its 8pt corner.
export const Z = createZ(iosSkin);
`;

const SHELL = `export function createZ(skin: unknown) {
  return skin;
}
`;

const FILES = ["src/atoms/z/z.styles.ts", "src/atoms/z/z.ios.tsx", "src/atoms/z/z.shared.tsx"];

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "corner-comments-"));
  write(FILES[0], STYLES);
  write(FILES[1], ENTRY);
  write(FILES[2], SHELL);
  write("styles/z.css", "/* The 12px menu corner. */\n.z { --p-menu-radius: 12px; }\n.y { --p-field-radius: 10px; /* the 8px field corner */ }\n");
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("a corner a comment states", () => {
  const judged = () => {
    const sites = new CornerSites(root);
    const { values } = sites.scan(FILES);
    return cornerClaims(root, FILES).map((c: SourceClaim) => ({
      line: c.line,
      file: c.file,
      value: c.value,
      on: c.on.text,
      drawn: claimHolds(c.value, sites.cornersIn(values, c.file, c.on.start, c.on.end)),
    }));
  };
  const at = (file: string, line: number) => judged().filter((c) => c.file === file && c.line === line);

  it("is held to the element the comment sits on", () => {
    expect(at(FILES[0], 8)).toEqual([{ line: 8, file: FILES[0], value: 12, on: "popover: { borderRadius: shape.web.menu }", drawn: true }]);
    // The rows' corner stated over the rows, which draw 8: the field's 10 elsewhere does not count.
    expect(at(FILES[0], 10)).toEqual([{ line: 10, file: FILES[0], value: 10, on: "row: { borderRadius: shape.web.control }", drawn: false }]);
  });

  it("binds a trailing comment to the code it ends", () => {
    expect(at(FILES[0], 12).map((c) => [c.value, c.on, c.drawn])).toEqual([[10, "field: { borderRadius: shape.web.field }", true]]);
  });

  it("refuses a number in a header that sits on a declaration drawing no corner", () => {
    // The module header sits on `export type Size`; the section comment on a corner-less part.
    expect(at(FILES[0], 3).map((c) => [c.value, c.drawn])).toEqual([
      [10, false],
      [12, false],
    ]);
    expect(at(FILES[0], 13).map((c) => [c.value, c.on, c.drawn])).toEqual([[8, "stepperArrow: { height: 32 }", false]]);
  });

  it("reads a phrase wrapped across lines, and not a border's width", () => {
    // "a rounded 1px border" states a width; "at the / 8px corner" runs over two lines.
    expect(at(FILES[0], 15)).toEqual([]);
    expect(at(FILES[0], 16).map((c) => [c.value, c.drawn])).toEqual([[8, true]]);
  });

  it("finds the comments after a template literal", () => {
    expect(at(FILES[0], 21).map((c) => [c.value, c.drawn])).toEqual([[8, true]]);
  });

  it("is every element's corner where the code holds several, square and the pill aside", () => {
    // One element drawing a corner per size is one element.
    expect(at(FILES[0], 23).map((c) => [c.value, c.drawn])).toEqual([
      [6, true],
      [8, true],
    ]);
    // A whole skin whose outline draws 12 and whose editor draws 8: neither number says
    // which element it is, so each belongs on its element.
    expect(at(FILES[0], 25).map((c) => [c.value, c.drawn])).toEqual([
      [12, false],
      [8, false],
    ]);
    // A dot drawn as the pill is a shape, not a corner of its own.
    expect(at(FILES[0], 27).map((c) => [c.value, c.drawn])).toEqual([[12, true]]);
  });

  it("reads a measure after a platform or version word, and leaves the version alone", () => {
    // "iOS 12pt" states a corner; "Material 3" and "iOS 26" name a version.
    expect(at(FILES[0], 29).map((c) => [c.value, c.drawn])).toEqual([[12, false]]);
    expect(at(FILES[0], 31)).toEqual([]);
  });

  it("is held to some element: code that draws no corner holds no claim", () => {
    expect(claimHolds(8, new Map())).toBe(false);
    expect(claimHolds(8, new Map([["a", new Set([9999])]]))).toBe(false);
    expect(claimHolds(8, new Map([["a", new Set([8, 9999])], ["b", new Set([0])]]))).toBe(true);
  });

  it("follows a platform entry to the skin it hands its shell", () => {
    expect(at(FILES[1], 4).map((c) => [c.value, c.on, c.drawn])).toEqual([[8, "export const Z = createZ(iosSkin);", true]]);
  });
});

describe("a corner a hand-off comment states", () => {
  it("is held to the corner tokens under it, or on its line", () => {
    const claims = handoffClaims(root, ["styles/z.css"]);
    // The first comment introduces both declarations; the trailing one only its line's.
    expect(claims.map((c) => [c.line, c.value, c.tokens])).toEqual([
      [1, 12, [12, 10]],
      [3, 8, [10]],
    ]);
  });
});
