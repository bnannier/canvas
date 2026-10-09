import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CornerSites, platformOf, type CornerValue } from "./corner-sites.ts";
import { componentOf, cornerVerdict, partOf, siteOf } from "./corner-rules.ts";

// The folder behind test/design-rules-shape.test.ts: every way a corner reaches a view is
// traced to the place its number is written, with what that number is and every skin that
// draws it, and the rules judge it on each platform that draws it.

let root = "";
const write = (relative: string, text: string) => {
  mkdirSync(join(root, relative, ".."), { recursive: true });
  writeFileSync(join(root, relative), text);
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "corner-sites-"));
  write(
    "src/atoms/x/x.styles.ts",
    `
import { shape, radius } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { CARD } from "./x.shared-values.js";
const TRACK_H = { small: 4, base: 6 };
const ANY = 15;
const R = shape.web.card;
const BORDER = 1;
export function surface(tokens: unknown, corner: number) {
  return { borderRadius: corner, backgroundColor: "red" };
}
export const webSkin = {
  r: shape.web.card,
  track: { height: TRACK_H.base, borderRadius: TRACK_H.base / 2 },
  undrawn: { borderRadius: ANY / 2 },
  menuLess: { borderRadius: shape.web.menu - 5 },
  media: { borderRadius: Math.max(0, R - BORDER) },
  wrap: { borderRadius: (TRACK_H.small * 2 + 10) / 2 + 3 },
  mark: { borderRadius: radius.sm },
  pick: { borderRadius: Math.min(shape.web.control, shape.web.field) },
  card: { borderRadius: CARD },
  odd: { borderRadius: 7 },
};
export const iosSkin = {
  r: shape.ios.card,
  sheet: { borderRadius: platformShape.ios.actionSheet },
  group: { borderRadius: 10 },
};
`,
  );
  write("src/atoms/x/x.shared-values.ts", "export const CARD = 14;\n");
  write(
    "src/atoms/x/x.shared.tsx",
    `
import * as s from "./x.styles.js";
import { radius as radiusScale } from "../../style/index.js";
export function createX(skin: { r: number }) {
  return function X({ w, style }: { w: number; style: unknown }) {
    const flat = StyleSheet.flatten(style);
    return (
      <>
        <View style={s.surface(tokens, skin.r)} />
        <View style={{ borderRadius: flat.borderRadius }} />
        <Rect rx={Math.min(skin.r, w / 4)} />
        <Frame radius={6} />
        <Frame />
      </>
    );
  };
}
function Frame({ radius = 12 }: { radius?: number }) {
  return <View style={{ borderRadius: radius }} />;
}
function cornerFor(skin: { r: number }, round: boolean) {
  return round ? 9999 : skin.r;
}
export function Avatar({ skin }: { skin: { r: number } }) {
  return <View style={{ borderRadius: cornerFor(skin, true) }} />;
}
export function Loose(props: { corner: number }) {
  return <View style={{ borderTopStartRadius: props.corner }} />;
}
export function Picture(props: { radius?: "sm" | "lg" }) {
  const { radius } = props;
  return <View style={{ borderRadius: radiusScale[radius] }} />;
}
export function Clip(props: { radius?: "sm" | "lg" }) {
  return <View style={{ borderBottomLeftRadius: radiusScale[props.radius] }} />;
}
export function Picked({ step }: { step: "sm" }) {
  const key = step === "sm" ? "lg" : step;
  const inner = { k: key };
  return <View style={{ borderTopLeftRadius: radiusScale[inner.k] }} />;
}
`,
  );
  write("src/atoms/x/x.tsx", `import { createX } from "./x.shared.js";\nimport { webSkin } from "./x.styles.js";\nexport const X = createX(webSkin);\n`);
  write("src/atoms/x/x.ios.tsx", `import { createX } from "./x.shared.js";\nimport { iosSkin } from "./x.styles.js";\nexport const X = createX(iosSkin);\n`);
  // Where a corner is drawn: constants and helpers no platform names, and the skins that use them.
  write(
    "src/style/look.ts",
    `
import { shape } from "./index.js";
export const row = { borderRadius: shape.web.control };
export function panel() {
  return { borderRadius: shape.web.menu };
}
`,
  );
  write(
    "src/atoms/y/y.styles.ts",
    `
import { shape } from "../../style/index.js";
import * as look from "../../style/look.js";
import { panel as panelLook } from "../../style/look.js";
const EDIT_CORNER = shape.web.field;
const EDIT = { borderRadius: shape.web.field };
const ACTION = { borderRadius: shape.web.control };
const IOS_MENU = shape.ios.menu;
function menuCard() {
  return { borderRadius: shape.web.menu };
}
function capsule(corner: number) {
  return { borderRadius: corner };
}
export interface YSkin {
  action: unknown;
}
export const webSkin = {
  action: { ...ACTION },
  menu: { borderRadius: IOS_MENU },
  row: look.row,
  bar: capsule(shape.web.pill),
};
export const iosSkin = {
  edit: { borderRadius: EDIT_CORNER },
  editBox: { ...EDIT },
  action: { ...ACTION },
  menu: menuCard(),
  row: look.row,
  panel: panelLook,
};
export const androidSkin = {
  bar: capsule(shape.android.control),
};
`,
  );
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

const scan = () =>
  new CornerSites(root).scan(["src/atoms/x/x.styles.ts", "src/atoms/x/x.shared-values.ts", "src/atoms/x/x.shared.tsx", "src/atoms/x/x.tsx", "src/atoms/x/x.ios.tsx"]);
const at = (values: CornerValue[], path: string) => values.filter((v) => v.path === path);
const one = (values: CornerValue[], path: string) => {
  const found = at(values, path);
  expect(found.length, path).toBe(1);
  return found[0];
};

describe("CornerSites", () => {
  it("reports a read of the shape table, the platform table and the radius ladder", () => {
    const { values } = scan();
    expect(one(values, "webSkin.r").read).toEqual({ table: "shape", platform: "web", key: "card" });
    expect(one(values, "iosSkin.sheet")).toMatchObject({ value: 34, read: { table: "platformShape", platform: "ios", key: "actionSheet" } });
    expect(one(values, "webSkin.mark")).toMatchObject({ value: 2, kind: "read", read: { table: "radius", key: "sm" } });
  });

  it("reports a corner written concentric, which the rules take only with a declared container", () => {
    const { values } = scan();
    expect(one(values, "webSkin.media")).toMatchObject({ value: 13, concentric: "inside shape.web.card by 1" });
    expect(one(values, "webSkin.wrap")).toMatchObject({ value: 12, concentric: "around a capsule by 3" });
    // The form alone proves no container: an off-table 7 written as the menu corner less 5.
    expect(one(values, "webSkin.menuLess")).toMatchObject({ value: 7, concentric: "inside shape.web.menu by 5" });
    // Half of a size is not concentric with anything.
    expect(one(values, "webSkin.track")).toMatchObject({ value: 3, kind: "computed", concentric: null });
  });

  it("reports a min between two corners as a computation, not as either corner", () => {
    expect(one(scan().values, "webSkin.pick")).toMatchObject({ value: 8, kind: "computed", concentric: null });
  });

  it("follows an import, a namespace member's parameter and a shell's skin to the number", () => {
    const { values } = scan();
    expect(one(values, "CARD").value).toBe(14);
    // `s.surface(tokens, skin.r)` in the shell: the skin each platform entry hands createX.
    expect(at(values, "webSkin.r").length).toBe(1);
    expect(at(values, "iosSkin.r").length).toBe(1);
  });

  it("reads a clamp to a measured size as the corner it clamps", () => {
    // `Math.min(skin.r, w / 4)`: the skin's corners, where they are written.
    const { values } = scan();
    expect(values.filter((v) => v.text === "shape.web.card" || v.text === "shape.ios.card").length).toBe(2);
    expect(values.some((v) => v.text.startsWith("Math.min(skin.r"))).toBe(false);
  });

  it("follows a component's prop to its default and every use, and a function to what it returns", () => {
    const { values } = scan();
    expect(at(values, "Frame").map((v) => v.value)).toEqual([12]);
    expect(values.some((v) => v.path === "createX" && v.value === 6)).toBe(true);
    expect(at(values, "cornerFor").map((v) => v.value)).toEqual([9999]);
  });

  it("reports a step of the radius ladder a public prop picks as the app's corner", () => {
    const { values } = scan();
    // `const { radius } = props` and `props.radius`: every step, each the call site's pick.
    expect(new Set(at(values, "Picture").map((v) => v.kind))).toEqual(new Set(["consumer"]));
    expect(new Set(at(values, "Clip").map((v) => v.kind))).toEqual(new Set(["consumer"]));
    // A key the component computes is its own choice, so it is judged.
    expect(new Set(at(values, "Picked").map((v) => v.kind))).toEqual(new Set(["read"]));
  });

  it("skips a corner copied off another style, and reports what it cannot trace", () => {
    const { values, unresolved } = scan();
    expect(values.some((v) => v.text.includes("flat."))).toBe(false);
    expect(unresolved.map((u) => u.path)).toEqual(["Loose"]);
  });
});

/** A corner as the scan reports it, drawn where it is written unless a test says where else. */
const corner = (over: Partial<CornerValue>): CornerValue => {
  const v = { value: 0, file: "src/atoms/x/x.styles.ts", line: 1, at: 0, path: "webSkin.box", kind: "literal" as const, concentric: null, text: "", ...over };
  const here = { file: v.file, line: v.line, at: v.at, path: v.path };
  return { sets: [here], drawn: [{ ...here, platform: platformOf(here) }], ...v };
};

describe("where a corner is drawn", () => {
  const scanY = () => new CornerSites(root).scan(["src/style/look.ts", "src/atoms/y/y.styles.ts"]).values;
  const drawnBy = (values: CornerValue[], path: string) =>
    one(values, path)
      .drawn.map((d) => `${d.platform ?? "shared"} ${d.path}`)
      .sort();
  const roles = { "atoms/y": ["field", "control", "menu", "pill"], style: ["control", "menu"] };
  const verdict = (values: CornerValue[], path: string) => cornerVerdict(one(values, path), { roles });

  it("follows a constant no platform names to every skin that uses it", () => {
    const values = scanY();
    // A number constant the iOS skin reads, and a style object it spreads.
    expect(drawnBy(values, "EDIT_CORNER")).toEqual(["ios iosSkin.edit"]);
    expect(drawnBy(values, "EDIT")).toEqual(["ios iosSkin.editBox"]);
    // A helper the iOS skin calls, a module's member read through a namespace import, and
    // an export taken under an alias.
    expect(drawnBy(values, "menuCard")).toEqual(["ios iosSkin.menu"]);
    expect(drawnBy(values, "row")).toEqual(["ios iosSkin.row", "web webSkin.row"]);
    expect(drawnBy(values, "panel")).toEqual(["ios iosSkin.panel"]);
  });

  it("draws a corner a helper is handed for the skin that hands it", () => {
    const values = scanY();
    const bar = values.filter((v) => v.path === "webSkin.bar" || v.path === "androidSkin.bar");
    expect(bar.map((v) => `${v.path}: ${v.drawn.map((d) => d.platform).join(", ")}`).sort()).toEqual(["androidSkin.bar: android", "webSkin.bar: web"]);
  });

  it("refuses a native skin drawing another platform's row through a name no platform names", () => {
    const values = scanY();
    for (const path of ["EDIT_CORNER", "EDIT", "menuCard", "panel"]) {
      const result = verdict(values, path);
      expect(result.ok, path).toBe(false);
      expect(!result.ok && result.reason, path).toContain("another platform's row: it draws ios");
    }
    expect(!verdict(values, "EDIT_CORNER").ok && (verdict(values, "EDIT_CORNER") as { reason: string }).reason).toContain("src/atoms/y/y.styles.ts:25 iosSkin.edit draws shape.web.field");
  });

  it("refuses a web skin drawing a native row through a constant named for the platform", () => {
    const result = verdict(scanY(), "IOS_MENU");
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toContain("webSkin.menu draws shape.ios.menu");
  });

  it("takes a part the native skin shares with the web skin's same part", () => {
    const values = scanY();
    expect(verdict(values, "ACTION").ok).toBe(true);
    expect(verdict(values, "row").ok).toBe(true);
    expect(partOf({ file: "src/atoms/y/y.styles.ts", path: "iosSkin.action" })).toBe(partOf({ file: "src/atoms/y/y.styles.ts", path: "webSkin.action" }));
    expect(partOf({ file: "src/atoms/y/y.ios.tsx", path: "IOS_RADIUS" })).toBe("src/atoms/y/y.tsx _RADIUS");
    // The same number on a different part of the web skin is no shared part.
    const elsewhere = corner({
      value: 12,
      kind: "read",
      path: "SHARED",
      read: { table: "shape", platform: "web", key: "menu" },
      drawn: [
        { file: "src/atoms/x/x.styles.ts", line: 2, at: 0, path: "webSkin.menu", platform: "web" },
        { file: "src/atoms/x/x.styles.ts", line: 3, at: 0, path: "iosSkin.splitMenu", platform: "ios" },
      ],
    });
    expect(cornerVerdict(elsewhere, { roles: { "atoms/x": ["menu"] } }).ok).toBe(false);
  });
});

describe("the corner rules", () => {
  const roles = { "atoms/x": ["card", "actionSheet", "key"] };
  const read = (table: "shape" | "platformShape", platform: "web" | "ios" | "android", key: string, path: string, value = 12) =>
    cornerVerdict(corner({ value, kind: "read", path, read: { table, platform, key } as CornerValue["read"] }), { roles });

  it("reads the platform from the file, then the innermost platform name", () => {
    expect(platformOf({ file: "src/atoms/x/x.ios.tsx", path: "X" })).toBe("ios");
    expect(platformOf({ file: "src/atoms/x/x.styles.ts", path: "iosSkin.thumb" })).toBe("ios");
    expect(platformOf({ file: "src/atoms/x/x.styles.ts", path: "M3_TRACK_R" })).toBe("android");
    expect(platformOf({ file: "src/atoms/x/x.styles.ts", path: "androidBase" })).toBe("android");
    expect(platformOf({ file: "src/atoms/x/x.styles.ts", path: "webSkin.iosLike" })).toBe("ios");
    expect(platformOf({ file: "src/atoms/x/x.styles.ts", path: "DISMISS" })).toBeNull();
    expect(componentOf("src/atoms/x/x.styles.ts")).toBe("atoms/x");
    expect(componentOf("src/style/menu-look.ts")).toBe("style");
  });

  it("refuses a bare number, even one that equals a role's value, and names the skin", () => {
    // An iOS menu drawn at 12 equals the iOS card corner while the menu role is 26.
    const menu = cornerVerdict(corner({ value: 12, path: "iosSkin.splitMenu", text: "12" }), { roles });
    expect(menu.ok).toBe(false);
    expect(!menu.ok && menu.reason).toContain("src/atoms/x/x.styles.ts:1 iosSkin.splitMenu");
    expect(cornerVerdict(corner({ value: 6, path: "CAP_BOX" }), { roles }).ok).toBe(false);
    expect(cornerVerdict(corner({ value: 999, path: "RAIL" }), { roles }).ok).toBe(false);
  });

  it("takes a role read only on the row of the platform the skin draws", () => {
    expect(read("shape", "ios", "card", "iosSkin.card").ok).toBe(true);
    expect(read("shape", "web", "card", "SHARED").ok).toBe(true);
    // A native skin reading the web row, a web skin or shared code reading a native row.
    expect(read("shape", "web", "card", "iosSkin.card").ok).toBe(false);
    expect(read("shape", "android", "card", "iosSkin.card").ok).toBe(false);
    expect(read("shape", "ios", "card", "webSkin.card").ok).toBe(false);
    expect(read("shape", "ios", "card", "SHARED").ok).toBe(false);
    expect(read("platformShape", "ios", "actionSheet", "IOS_RADIUS", 34).ok).toBe(true);
    expect(read("platformShape", "ios", "actionSheet", "SHEET", 34).ok).toBe(false);
    expect(read("platformShape", "web", "key", "iosSkin.compact", 6).ok).toBe(false);
  });

  it("takes a role only from a component that plays it", () => {
    const menu = read("shape", "ios", "menu", "iosSkin.splitMenu", 26);
    expect(menu.ok).toBe(false);
    expect(!menu.ok && menu.reason).toContain("the menu role, which atoms/x does not play");
    expect(cornerVerdict(corner({ value: 26, kind: "read", path: "iosSkin.splitMenu", read: { table: "shape", platform: "ios", key: "menu" } }), { roles: { "atoms/x": ["menu"] } }).ok).toBe(true);
  });

  it("refuses the radius ladder, and leaves the app's own pick to the app", () => {
    expect(cornerVerdict(corner({ value: 2, kind: "read", read: { table: "radius", key: "sm" } }), { roles }).ok).toBe(false);
    expect(cornerVerdict(corner({ value: 24, kind: "read", read: { table: "radius", key: null } }), { roles }).ok).toBe(false);
    expect(cornerVerdict(corner({ value: 24, kind: "consumer", read: { table: "radius", key: null } }), { roles }).ok).toBe(true);
  });

  it("refuses half of a size: a capsule is the pill", () => {
    expect(cornerVerdict(corner({ value: 7.5, kind: "computed", path: "CAP", text: "ANY / 2" }), { roles }).ok).toBe(false);
  });

  it("takes a concentric corner only where its container is declared", () => {
    const inside = corner({ value: 7, kind: "computed", path: "card", concentric: "inside shape.web.menu by 5" });
    expect(cornerVerdict(inside, { roles }).ok).toBe(false);
    expect(cornerVerdict(inside, { roles, concentric: new Set([siteOf(inside)]) }).ok).toBe(true);
  });

  it("takes square and the pill", () => {
    expect(cornerVerdict(corner({ value: 0 }), { roles }).ok).toBe(true);
    expect(cornerVerdict(corner({ value: 9999 }), { roles }).ok).toBe(true);
  });
});
