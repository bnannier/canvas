import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CornerSites, type CornerValue } from "./corner-sites.ts";
import { componentOf, cornerVerdict, platformOf, siteOf } from "./corner-rules.ts";

// The folder behind test/design-rules-shape.test.ts: every way a corner reaches a view is
// traced to the place its number is written, with what that number is, and the rules
// judge it on the platform it is written for.

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

describe("the corner rules", () => {
  const corner = (over: Partial<CornerValue>): CornerValue => ({
    value: 0,
    file: "src/atoms/x/x.styles.ts",
    line: 1,
    path: "webSkin.box",
    kind: "literal",
    concentric: null,
    text: "",
    rounds: ["src/atoms/x"],
    ...over,
  });
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
    expect(!menu.ok && menu.reason).toContain("src/atoms/x/x.styles.ts iosSkin.splitMenu");
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
