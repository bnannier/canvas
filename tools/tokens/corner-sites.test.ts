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
        <Rect rx="9999" ry={} />
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
  // The same, through modules that are no style module: a component's own parts module, its
  // shell, and a component of its own beside them.
  write(
    "src/atoms/z/z-parts.ts",
    `
import { shape } from "../../style/index.js";
export const EDIT_SHAPE = { borderRadius: shape.web.field };
export function actionShape() {
  return { borderRadius: shape.web.control };
}
`,
  );
  write(
    "src/atoms/z/z.styles.ts",
    `
import { shape } from "../../style/index.js";
import { EDIT_SHAPE, actionShape } from "./z-parts.js";
import { shellHelper } from "./z.shared.js";
const iosBaseSkin = {};
function rowWith(skin: unknown) {
  return { borderRadius: shape.web.control };
}
export const webSkin = { radius: shape.web.card };
export const iosSkin = {
  radius: shape.ios.card,
  edit: { ...EDIT_SHAPE },
  action: actionShape(),
  helper: shellHelper(),
  row: rowWith(iosBaseSkin),
};
export const androidSkin = { radius: shape.android.card };
`,
  );
  write(
    "src/atoms/z/z.shared.tsx",
    `
import { shape } from "../../style/index.js";
import { Frame } from "./z-frame.js";
export function createZ(skin: { radius: number }) {
  return function Z() {
    return (
      <>
        <View style={{ borderRadius: skin.radius }} />
        <View style={{ borderRadius: shape.web.control }} />
        <Frame />
      </>
    );
  };
}
export function shellHelper() {
  return { borderRadius: shape.web.menu };
}
`,
  );
  write(
    "src/atoms/z/z-frame.tsx",
    `
import { shape } from "../../style/index.js";
export function Frame() {
  return <View style={{ borderRadius: shape.web.tile }} />;
}
export function EntryFrame() {
  return <View style={{ borderRadius: shape.web.sheet }} />;
}
`,
  );
  write("src/atoms/z/z.tsx", `import { createZ } from "./z.shared.js";\nimport { webSkin } from "./z.styles.js";\nexport const Z = createZ(webSkin);\n`);
  write(
    "src/atoms/z/z.ios.tsx",
    `import { createZ } from "./z.shared.js";
import { iosSkin } from "./z.styles.js";
import { EntryFrame } from "./z-frame.js";
export const Z = createZ(iosSkin);
export const Roomy = createZ({ ...iosSkin, gap: 6 });
export function Extra() {
  return <EntryFrame />;
}
`,
  );
  write("src/atoms/z/z.android.tsx", `import { createZ } from "./z.shared.js";\nimport { androidSkin } from "./z.styles.js";\nexport const Z = createZ(androidSkin);\n`);
  // A helper that adjusts a skin, in a module no platform names, built with by the entries
  // each table names; and the shell a table's iOS entry may build with instead.
  for (const [dir, table] of Object.entries(TABLES)) writeTable(dir, table);
  // Neutral constants reached under another name: an aliased export and re-export, a
  // namespace re-export, and default exports of a const, an object and a function; and
  // corner keys written as computed keys or assigned through an element access.
  write(
    "src/atoms/w/w-parts.ts",
    `
import { shape } from "../../style/index.js";
const EDIT = { borderRadius: shape.web.field };
const ACTION = { borderRadius: shape.web.control };
export { EDIT as EDIT_FRAME };
export default ACTION;
`,
  );
  write("src/atoms/w/w-menu.ts", `import { shape } from "../../style/index.js";\nexport default { borderRadius: shape.web.menu };\n`);
  write("src/atoms/w/w-tile.ts", `import { shape } from "../../style/index.js";\nexport default function () {\n  return { borderRadius: shape.web.tile };\n}\n`);
  write("src/atoms/w/index.ts", `export { EDIT_FRAME as FRAME } from "./w-parts.js";\nexport * as parts from "./w-parts.js";\n`);
  write(
    "src/atoms/w/w.styles.ts",
    `
import { shape } from "../../style/index.js";
import { EDIT_FRAME } from "./w-parts.js";
import { FRAME, parts } from "./index.js";
import Action from "./w-parts.js";
import Menu from "./w-menu.js";
import tile from "./w-tile.js";
const RADIUS_KEY = "borderRadius";
export const webSkin = {};
export const iosSkin = {
  edit: { ...EDIT_FRAME },
  frame: { ...FRAME },
  nsEdit: { ...parts.EDIT_FRAME },
  action: { ...Action },
  menu: { ...Menu },
  tile: tile(),
  computed: { ["borderRadius"]: shape.web.card },
  template: { [\`borderTopLeftRadius\`]: shape.web.card },
  keyed: { [RADIUS_KEY]: shape.web.card },
};
export function iosAssigned() {
  const style: Record<string, number> = {};
  style["borderRadius"] = shape.web.sheet;
  return style;
}
`,
  );
});

/** How a DataTable fixture's entries build it: each platform's expression, and whether the shell frames its own skin. */
interface Table {
  web: string;
  ios: string;
  android: string;
  shellFrames?: boolean;
}

const plain = { web: "createDataTable(webSkin, parts)", ios: "createDataTable(iosSkin, parts)", android: "createDataTable(androidSkin, parts)" };
const framed = (platform: "web" | "ios" | "android") => `createDataTable(withEditFrame(${platform}Skin), parts)`;
const TABLES: Record<string, Table> = {
  // The probe: only the iOS entry builds with the web field corner.
  "src/organisms/data-table": { ...plain, ios: framed("ios") },
  "src/organisms/table-every": { web: framed("web"), ios: framed("ios"), android: framed("android") },
  "src/organisms/table-two": { ...plain, web: framed("web"), ios: framed("ios") },
  "src/organisms/table-handed": { ...plain, ios: "createFramed(iosSkin, parts)" },
  "src/organisms/table-shared": { ...plain, shellFrames: true },
};

function writeTable(dir: string, table: Table) {
  write(
    `${dir}/data-table.styles.ts`,
    `
import { shape } from "../../style/index.js";
export interface DataTableSkin {
  outline: number;
  editInput: (t: unknown) => object;
}
export const webSkin: DataTableSkin = { outline: shape.web.card, editInput: () => ({ height: 32, borderRadius: shape.web.field }) };
export const iosSkin: DataTableSkin = { outline: shape.ios.card, editInput: () => ({ height: 32, borderRadius: shape.ios.field }) };
export const androidSkin: DataTableSkin = { outline: shape.android.card, editInput: () => ({ height: 32, borderRadius: shape.android.field }) };
`,
  );
  write(
    `${dir}/data-table.shared.tsx`,
    `
import { shape } from "../../style/index.js";
import type { DataTableSkin } from "./data-table.styles.js";
import { withEditFrame } from "./edit-skin.js";
export function createDataTable(skin: DataTableSkin, parts: unknown) {
  const edit = ${table.shellFrames ? "withEditFrame(skin)" : "skin"};
  return function DataTable() {
    return (
      <View style={{ borderRadius: skin.outline }}>
        <View style={{ borderRadius: shape.web.control }} />
        <TextInput style={edit.editInput(tokens)} />
      </View>
    );
  };
}
`,
  );
  const handed = Object.values(table).some((e) => typeof e === "string" && e.includes("createFramed"));
  write(
    `${dir}/edit-skin.ts`,
    `
import { shape } from "../../style/index.js";
import { createDataTable } from "./data-table.shared.js";
import type { DataTableSkin } from "./data-table.styles.js";
export function withEditFrame(skin: DataTableSkin): DataTableSkin {
  return { ...skin, editInput: (t: unknown) => ({ ...skin.editInput(t), borderRadius: shape.web.field }) };
}
${handed ? "export function createFramed(skin: DataTableSkin, parts: unknown) {\n  return createDataTable(withEditFrame(skin), parts);\n}\n" : ""}`,
  );
  for (const platform of ["web", "ios", "android"] as const) {
    write(
      `${dir}/data-table${platform === "web" ? "" : `.${platform}`}.tsx`,
      `import { createDataTable } from "./data-table.shared.js";
import { ${platform}Skin } from "./data-table.styles.js";
import { withEditFrame${handed ? ", createFramed" : ""} } from "./edit-skin.js";
const parts = {};
export const DataTable = ${table[platform]};
`,
    );
  }
}

const tableFiles = (dir: string) => ["data-table.styles.ts", "data-table.shared.tsx", "edit-skin.ts", "data-table.tsx", "data-table.ios.tsx", "data-table.android.tsx"].map((f) => `${dir}/${f}`);

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
    // An SVG corner written as a string is read; an empty one is reported.
    expect(values.some((v) => v.path === "createX" && v.text === '"9999"' && v.value === 9999)).toBe(true);
    expect(unresolved.map((u) => `${u.path} ${u.text}`)).toEqual(["createX ry={}", "Loose borderTopStartRadius: props.corner"]);
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

  const scanZ = () =>
    new CornerSites(root).scan([
      "src/atoms/z/z-parts.ts",
      "src/atoms/z/z.styles.ts",
      "src/atoms/z/z.shared.tsx",
      "src/atoms/z/z-frame.tsx",
      "src/atoms/z/z.tsx",
      "src/atoms/z/z.ios.tsx",
      "src/atoms/z/z.android.tsx",
    ]).values;
  const rolesZ = { "atoms/z": ["control", "field", "menu", "tile", "sheet", "card"] };

  it("follows a constant or helper in any module, not only a style module, to the skins that use it", () => {
    const values = scanZ();
    // A style object and a helper in the component's own parts module, a helper in its
    // shell module, and a style-module helper handed a skin by the iOS skin itself.
    expect(drawnBy(values, "EDIT_SHAPE")).toEqual(["ios iosSkin.edit"]);
    expect(drawnBy(values, "actionShape")).toEqual(["ios iosSkin.action"]);
    expect(drawnBy(values, "shellHelper")).toEqual(["ios iosSkin.helper"]);
    expect(drawnBy(values, "rowWith")).toEqual(["ios iosSkin.row"]);
    for (const path of ["EDIT_SHAPE", "actionShape", "shellHelper", "rowWith"]) {
      const result = cornerVerdict(one(values, path), { roles: rolesZ });
      expect(result.ok, path).toBe(false);
      expect(!result.ok && result.reason, path).toContain("another platform's row: it draws ios");
    }
  });

  it("follows a component to where it is rendered: a shell's code is shared, a platform entry's is its platform's", () => {
    const values = scanZ();
    // The shell's own corner, and a component only the shell renders, are drawn by code
    // every platform runs (every platform's entry builds the component by handing the shell
    // its skin, a skin spread into an object included); a component only the iOS entry
    // renders is drawn on iOS.
    expect(drawnBy(values, "createZ")).toEqual(["shared createZ"]);
    expect(drawnBy(values, "Frame")).toEqual(["shared createZ"]);
    expect(drawnBy(values, "EntryFrame")).toEqual(["ios Extra"]);
    expect(cornerVerdict(one(values, "createZ"), { roles: rolesZ }).ok).toBe(true);
    expect(cornerVerdict(one(values, "Frame"), { roles: rolesZ }).ok).toBe(true);
    const entryOnly = cornerVerdict(one(values, "EntryFrame"), { roles: rolesZ });
    expect(!entryOnly.ok && entryOnly.reason).toContain("src/atoms/z/z.ios.tsx:7 Extra draws shape.web.sheet");
    // A corner a shell is handed is the skin's, where the skin writes it.
    expect(drawnBy(values, "iosSkin.radius")).toEqual(["ios iosSkin.radius"]);
  });

  describe("a function the entries build with by handing it a skin", () => {
    const scanTable = (dir: string) => new CornerSites(root).scan(tableFiles(dir)).values;
    const rolesOf = (dir: string) => ({ [componentOf(`${dir}/x.ts`)]: ["field", "control", "card"] });
    const FRAME = "withEditFrame.editInput";

    it("is drawn on the platform of the only entry that builds with it, not shared", () => {
      // The probe: `createDataTable(withEditFrame(iosSkin), parts)` in the iOS entry, where
      // withEditFrame, in a module no platform names, sets the web field corner.
      const dir = "src/organisms/data-table";
      const values = scanTable(dir);
      expect(drawnBy(values, FRAME)).toEqual(["ios DataTable"]);
      const result = cornerVerdict(one(values, FRAME), { roles: rolesOf(dir) });
      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain("src/organisms/data-table/data-table.ios.tsx:5 DataTable draws shape.web.field");
      expect(!result.ok && result.reason).toContain("another platform's row: it draws ios");
      // The shell is still shared: every platform's entry builds with it, the iOS one
      // handing it a skin made from the iOS skin.
      expect(drawnBy(values, "createDataTable")).toEqual(["shared createDataTable"]);
    });

    it("is shared code only when every platform's entry builds with it", () => {
      const every = scanTable("src/organisms/table-every");
      expect(drawnBy(every, FRAME)).toEqual(["shared withEditFrame.editInput"]);
      expect(cornerVerdict(one(every, FRAME), { roles: rolesOf("src/organisms/table-every") }).ok).toBe(true);
      // Built with by the web and iOS entries, not Android's: each entry's platform draws it,
      // and iOS draws the web row only where it may share the web skin's part.
      const dir = "src/organisms/table-two";
      const two = scanTable(dir);
      expect(drawnBy(two, FRAME)).toEqual(["ios DataTable", "web DataTable"]);
      const refused = cornerVerdict(one(two, FRAME), { roles: rolesOf(dir) });
      expect(!refused.ok && refused.reason).toContain("it is the web skin's own part, but organisms/table-two keeps ios's row");
      expect(cornerVerdict(one(two, FRAME), { roles: rolesOf(dir), sharesWebPart: () => true }).ok).toBe(true);
    });

    it("follows a skin a shell hands on to the platforms that build the shell", () => {
      // A shell only the iOS entry builds with hands its skin to withEditFrame: iOS draws it.
      const handed = scanTable("src/organisms/table-handed");
      expect(drawnBy(handed, FRAME)).toEqual(["ios DataTable"]);
      expect(drawnBy(handed, "createDataTable")).toEqual(["shared createDataTable"]);
      // The shell every platform builds with hands its own skin on: shared code.
      expect(drawnBy(scanTable("src/organisms/table-shared"), FRAME)).toEqual(["shared withEditFrame.editInput"]);
    });
  });

  describe("a neutral constant reached under another name", () => {
    const W = ["src/atoms/w/w-parts.ts", "src/atoms/w/w-menu.ts", "src/atoms/w/w-tile.ts", "src/atoms/w/index.ts", "src/atoms/w/w.styles.ts"];
    const scanW = () => new CornerSites(root).scan(W);
    const inFile = (values: CornerValue[], file: string) => {
      const found = values.filter((v) => v.file === file);
      expect(found.length, file).toBe(1);
      return found[0];
    };
    const rolesW = { "atoms/w": ["field", "control", "menu", "tile", "card", "sheet"] };
    const refusedOnIos = (v: CornerValue) => {
      const result = cornerVerdict(v, { roles: rolesW });
      expect(result.ok, v.path).toBe(false);
      expect(!result.ok && result.reason, v.path).toContain("another platform's row: it draws ios");
    };

    it("follows an aliased export, an aliased re-export and a namespace re-export to the skins", () => {
      const { values } = scanW();
      expect(drawnBy(values, "EDIT")).toEqual(["ios iosSkin.edit", "ios iosSkin.frame", "ios iosSkin.nsEdit"]);
      refusedOnIos(one(values, "EDIT"));
    });

    it("follows a default export, of a const, an object or a function, to the skins that import it", () => {
      const { values } = scanW();
      expect(drawnBy(values, "ACTION")).toEqual(["ios iosSkin.action"]);
      const menu = inFile(values, "src/atoms/w/w-menu.ts");
      const tile = inFile(values, "src/atoms/w/w-tile.ts");
      expect(menu.drawn.map((d) => `${d.platform} ${d.path}`)).toEqual(["ios iosSkin.menu"]);
      expect(tile.drawn.map((d) => `${d.platform} ${d.path}`)).toEqual(["ios iosSkin.tile"]);
      for (const v of [one(values, "ACTION"), menu, tile]) refusedOnIos(v);
    });

    it("reads a corner key written as a computed key or assigned through an element access", () => {
      const { values, unresolved } = scanW();
      expect(unresolved).toEqual([]);
      for (const path of ["iosSkin.computed", "iosSkin.template", "iosSkin.keyed", "iosAssigned"]) {
        expect(drawnBy(values, path), path).toEqual([`ios ${path}`]);
        refusedOnIos(one(values, path));
      }
    });
  });

  it("refuses a web skin drawing a native row through a constant named for the platform", () => {
    const result = verdict(scanY(), "IOS_MENU");
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toContain("webSkin.menu draws shape.ios.menu");
  });

  it("takes a part the native skin shares with the web skin's same part, where its platform may share it", () => {
    const values = scanY();
    const sharing = { roles, sharesWebPart: () => true };
    expect(cornerVerdict(one(values, "ACTION"), sharing).ok).toBe(true);
    expect(cornerVerdict(one(values, "row"), sharing).ok).toBe(true);
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
    expect(cornerVerdict(elsewhere, { roles: { "atoms/x": ["menu"] }, sharesWebPart: () => true }).ok).toBe(false);
  });

  it("refuses a shared part where the native platform keeps its own row", () => {
    // The platform ships a control for the job (or the component has no reference row) and
    // nothing declares the part: a native field does not take the web's field corner by
    // sharing a part's name. No platform shares a part unless the context says it may.
    const values = scanY();
    for (const context of [{ roles }, { roles, sharesWebPart: () => false }]) {
      const result = cornerVerdict(one(values, "ACTION"), context);
      expect(result.ok).toBe(false);
      expect(!result.ok && result.reason).toContain("it is the web skin's own part, but atoms/y keeps ios's row");
      expect(!result.ok && result.reason).toContain("SHARED_PARTS does not declare src/atoms/y/y.styles.ts iosSkin.action");
    }
    // The predicate is asked about the native place that shares the part.
    const asked: string[] = [];
    cornerVerdict(one(values, "ACTION"), { roles, sharesWebPart: (place) => (asked.push(siteOf(place)), true) });
    expect(asked).toEqual(["src/atoms/y/y.styles.ts iosSkin.action"]);
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
