import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { builtExports, componentSkins, exportDivergences, isOwnLook, isWebSkinAlias, platformModuleOf, shellImportFindings, traceExport, type ComponentSkins } from "./divergence.ts";
import { registeredSkins } from "./registry.ts";

const KIT = resolve(import.meta.dir, "../../src");

/** A throwaway kit with the skin and entry files a case needs. */
function kit(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "canvas-skins-"));
  for (const [path, source] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), source);
  }
  return root;
}

const skinsOf = (root: string, dir: string) => componentSkins(root).find((c) => c.dir === dir)!;

describe("skin divergence, per built export", () => {
  it("reads the real skin binding past an aliased import of another component's skin (K4)", () => {
    // avatar.ios.tsx imports `iosSkin as dropdownIosSkin` from the Dropdown's styles for
    // the pill's menu AND its own `iosSkin`, an alias of the web skin. The old regex took
    // the first import for the component's own and reported the whole file divergent.
    const avatar = skinsOf(KIT, "avatar");
    expect(avatar.exports).toEqual(["Avatar", "AvatarGroup", "AvatarMenu"]);
    expect(avatar.exportDivergence.Avatar).toBeUndefined();
    expect(avatar.exportDivergence.AvatarGroup).toBeUndefined();
    // The pill's menu also stands off by 6, which the web entry's menu does not.
    expect(avatar.exportDivergence.AvatarMenu).toEqual({
      iOS: "builds a part from dropdown's own iosSkin (../dropdown/dropdown.styles.js); passes `menuGap: 6` where the web entry has `dropdownWebSkin`; counted as the platform's own",
      Android: "builds a part from dropdown's own androidSkin (../dropdown/dropdown.styles.js); passes `menuGap: 6` where the web entry has `dropdownWebSkin`; counted as the platform's own",
    });
    expect(Object.keys(avatar.divergent).sort()).toEqual(["Android", "iOS"]);
  });

  it("counts a platform part only when the export it imports diverges", () => {
    // Corrected truth: the old read counted any `.ios.js` / `.android.js` import as a
    // divergent part, so Feed, MediaObject, GridList, StackedList, DescriptionList and
    // Navbar listed avatar.ios.js although Avatar is the web build on every platform, and
    // MetricBreakdown's iOS build was called divergent for an iOS Chip that aliases the
    // web skin. A part now counts only when its own export diverges by this same read.
    expect(skinsOf(KIT, "feeds").exportDivergence.Feed).toEqual({ iOS: "builds from its own iosSkin", Android: "builds from its own androidSkin" });
    expect(skinsOf(KIT, "media-objects").exportDivergence.MediaObject).toEqual({ iOS: "builds from its own iosSkin", Android: "builds from its own androidSkin" });
    for (const dir of ["feeds", "media-objects", "grid-lists", "stacked-lists", "description-lists", "navbars"]) {
      expect(Object.values(skinsOf(KIT, dir).divergent).join("; ")).not.toContain("avatar.");
    }
    expect(skinsOf(KIT, "navbars").exportDivergence.Navbar?.iOS).toBe(
      "builds from its own iosSkin; injects platform parts (../../atoms/dropdown/dropdown.ios.js); injects platform parts (../../atoms/button/button.ios.js)",
    );
    expect(skinsOf(KIT, "metric-breakdown").exportDivergence.MetricBreakdown).toEqual({ Android: "injects platform parts (../../atoms/chip/chip.android.js)" });
    // A part the part's module only re-exports from its shared module (the Icon) is one
    // build everywhere; a part under a nested directory (the Checkbox indicator) is read
    // the same way as any entry.
    // Video's native builds also hand the frame to the platform's own player controls.
    expect(skinsOf(KIT, "video").exportDivergence.Video?.iOS).toBe(
      "builds from its own iosSkin; injects platform parts (../spinner/spinner.ios.js); passes `nativeControls: true` which the web entry does not; counted as the platform's own",
    );
    expect(skinsOf(KIT, "listbox").exportDivergence.Listbox?.Android).toBe("injects platform parts (../checkbox/indicator/index.android.js)");
  });

  it("follows a local alias chain to the same object, and a styles re-export to its source", () => {
    // Tabs: `iosSkin = capsuleSkin; webSkin = capsuleSkin;` is one object under two names.
    const tabs = skinsOf(KIT, "tabs");
    expect(tabs.exportDivergence.Tabs).toEqual({ Android: "builds from its own androidSkin" });
    // Container and Grid re-export Row and Column's skins from layout.styles.
    for (const dir of ["container", "grid", "layout"]) expect(skinsOf(KIT, dir).divergent).toEqual({});
    expect(isWebSkinAlias(join(KIT, "atoms/container/container.styles.ts"), "iosSkin")).toBe(true);
    expect(isWebSkinAlias(join(KIT, "atoms/dropdown/dropdown.styles.ts"), "iosSkin")).toBe(false);
    expect(isWebSkinAlias(join(KIT, "atoms/dropdown/dropdown.styles.ts"), "noSuchSkin")).toBe(false);
  });

  it("tells an alias, an own object, a spread, a part and a local const carrying either apart", () => {
    const root = kit({
      "atoms/thing/thing.styles.ts": [
        'export const webSkin = { radius: 8 };',
        'export const iosSkin = webSkin;',
        'export const androidSkin = { ...webSkin, radius: 4 };',
        'export const webMenuSkin = { gap: 4 };',
        'export const iosMenuSkin = webMenuSkin;',
      ].join("\n"),
      "atoms/other/other.styles.ts": 'export const webSkin = { a: 1 };\nexport const iosSkin = { a: 2 };\nexport const androidSkin = webSkin;',
      // The parts: a Button that builds its own iOS skin, a Badge that aliases the web
      // skin, and an Icon whose entry only re-exports the shared build. Only the Button
      // makes the build that injects it diverge.
      "atoms/button/button.styles.ts": 'export const webSkin = { h: 36 };\nexport const iosSkin = { h: 44 };',
      "atoms/button/button.ios.tsx": 'import { createButton } from "./button.shared.js";\nimport { iosSkin } from "./button.styles.js";\nexport const Button = createButton(iosSkin);',
      "atoms/badge/badge.styles.ts": 'export const webSkin = { r: 4 };\nexport const iosSkin = webSkin;',
      "atoms/badge/badge.ios.tsx": 'import { createBadge } from "./badge.shared.js";\nimport { iosSkin } from "./badge.styles.js";\nexport const Badge = createBadge(iosSkin);',
      "atoms/icon/icon.ios.tsx": 'export { Icon } from "./icon.shared.js";',
      "atoms/thing/thing.ios.tsx": [
        'import { createThing, createMenu, createBare } from "./thing.shared.js";',
        'import { createOther } from "../other/other.shared.js";',
        'import { iosSkin as otherSkin } from "../other/other.styles.js";',
        'import { iosSkin, iosMenuSkin } from "./thing.styles.js";',
        'import { Button } from "../button/button.ios.js";',
        'import { Badge } from "../badge/badge.ios.js";',
        'import { Icon } from "../icon/icon.ios.js";',
        'import type { Props } from "./thing.shared.js";',
        'export const Thing = createThing(iosSkin);',
        'const Menu = createOther({ ...otherSkin, gap: 6 });',
        'export const ThingMenu = createMenu(iosMenuSkin, Menu);',
        'export const Bare = createBare(iosSkin, { Button, Badge });',
        'export const { A, B } = createThing(iosSkin, { trailing: Button });',
        'export const WebParts = createBare(iosSkin, { Badge, Icon });',
        'export { helper } from "./thing.shared.js";',
        'export type { Props };',
      ].join("\n"),
      "atoms/thing/thing.android.tsx": [
        'import { createThing } from "./thing.shared.js";',
        'import { androidSkin } from "./thing.styles.js";',
        'export const Thing = createThing(androidSkin);',
      ].join("\n"),
    });
    try {
      const thing = skinsOf(root, "thing");
      expect(thing.exports).toEqual(["Thing", "ThingMenu", "Bare", "A", "B", "WebParts"]);
      // WebParts injects only parts that are the web build, so it is the web build.
      expect(thing.exportDivergence).toEqual({
        ThingMenu: { iOS: "builds a part from other's own iosSkin (../other/other.styles.js); passes `gap: 6` and there is no web export of that name to match it against; counted as the platform's own" },
        Bare: { iOS: "injects platform parts (../button/button.ios.js)" },
        A: { iOS: "injects platform parts (../button/button.ios.js)" },
        B: { iOS: "injects platform parts (../button/button.ios.js)" },
        Thing: { Android: "builds from its own androidSkin" },
      });
      expect(thing.divergent).toEqual({
        iOS: "builds a part from other's own iosSkin (../other/other.styles.js); passes `gap: 6` and there is no web export of that name to match it against; counted as the platform's own; injects platform parts (../button/button.ios.js)",
        Android: "builds from its own androidSkin",
      });
      expect(builtExports('export const X = 1;\nexport const { A, B } = f();\nconst y = 2;\nexport { z } from "./z.js";')).toEqual(["X", "A", "B"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("judges the expression, not the binding: a spread of a web-skin alias with overrides is its own skin (K4)", () => {
    const root = kit({
      "atoms/flat/flat.styles.ts": 'export const webSkin = { radius: 8 };\nexport const iosSkin = webSkin;\nexport const androidSkin = webSkin;',
      "atoms/menu/menu.styles.ts": 'export const webSkin = { gap: 4 };\nexport const iosSkin = webSkin;',
      "atoms/flat/flat.ios.tsx": [
        'import { createFlat, createMenu } from "./flat.shared.js";',
        // An aliased import of the alias: the binding is the web skin, the expression is not.
        'import { iosSkin as webLook } from "./flat.styles.js";',
        'import { iosSkin as menuLook } from "../menu/menu.styles.js";',
        'const base = webLook;',
        'const extra = { shadow: 1 };',
        'export const Flat = createFlat({ ...webLook, radius: 4 });',
        'export const Same = createFlat({ ...webLook });',
        'export const Plain = createFlat(webLook);',
        'export const Local = createFlat({ ...base, gap: 2 });',
        'export const Merged = createFlat({ ...webLook, ...extra });',
        'export const WithMenu = createFlat(webLook, { menu: createMenu({ ...menuLook, dense: true }) });',
      ].join("\n"),
      "atoms/flat/flat.android.tsx": 'import { createFlat } from "./flat.shared.js";\nimport { androidSkin } from "./flat.styles.js";\nexport const Flat = createFlat({ ...androidSkin });',
    });
    try {
      const flat = skinsOf(root, "flat");
      expect(flat.exports).toEqual(["Flat", "Same", "Plain", "Local", "Merged", "WithMenu"]);
      expect(flat.exportDivergence).toEqual({
        Flat: { iOS: "builds its own skin (a spread of iosSkin, the web skin, with radius)" },
        Local: { iOS: "builds its own skin (a spread of iosSkin, the web skin, with gap)" },
        Merged: { iOS: "builds its own skin (a spread of iosSkin, the web skin, with ...extra)" },
        WithMenu: { iOS: "builds a part from menu's own skin (a spread of iosSkin, the web skin, with dense; ../menu/menu.styles.js)" },
      });
      // A spread that adds nothing, and the bare alias, are the web build on both platforms.
      expect(flat.divergent.Android).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("counts every form it cannot follow as the platform's own, never the web build (K4, fail safe)", () => {
    const root = kit({
      "atoms/look/look.styles.ts": 'export const webSkin = { radius: 8 };\nexport const iosSkin = webSkin;\nexport const iosOwnSkin = { radius: 4 };',
      "atoms/part/part.styles.ts": 'export const webSkin = { h: 36 };\nexport const iosSkin = { h: 44 };\nexport const iosPlainSkin = webSkin;',
      "atoms/part/part.ios.tsx": [
        'import { createPart } from "./part.shared.js";',
        'import { iosSkin, iosPlainSkin } from "./part.styles.js";',
        'export const Part = createPart(iosSkin);',
        'export const Plain = createPart(iosPlainSkin);',
      ].join("\n"),
      "atoms/look/look.ios.tsx": [
        'import { createLook } from "./look.shared.js";',
        'import type { Skin } from "./look.shared.js";',
        'import * as look from "./look.styles.js";',
        'import lookDefault from "./look.styles.js";',
        'import { iosSkin } from "./look.styles.js";',
        'import * as parts from "../part/part.ios.js";',
        'import { tweak } from "./tweak.js";',
        // A namespace import is judged through its member reads, like a named import...
        'export const NsAlias = createLook(look.iosSkin);',
        'export const NsOwn = createLook(look.iosOwnSkin);',
        'export const NsSpread = createLook({ ...look.iosSkin, radius: 4 });',
        'export const NsPart = createLook(iosSkin, { Part: parts.Part });',
        'export const NsPlainPart = createLook(iosSkin, { Plain: parts.Plain });',
        // ...and read whole, or as a default import, it cannot be followed.
        'export const NsWhole = createLook(look[key]);',
        'export const NsParts = createLook(iosSkin, parts);',
        'export const Default = createLook(lookDefault);',
        // A helper: whatever it does with the web skin, the reader does not follow it.
        'function rounded() { return { ...iosSkin, radius: 4 }; }',
        'function same() { return iosSkin; }',
        'const viaArrow = () => ({ ...iosSkin, gap: 2 });',
        'export const Helper = createLook(rounded());',
        'export const HelperSame = createLook(same());',
        'export const Arrow = createLook(viaArrow());',
        'export const Tweaked = createLook(tweak(iosSkin));',
        // A parenthesised or cast spread is the spread it wraps; a cast argument is the argument.
        'export const Paren = createLook({ ...(iosSkin), radius: 4 });',
        'export const Cast = createLook({ ...(iosSkin as Skin), radius: 4 });',
        'export const CastOnly = createLook({ ...(iosSkin satisfies Skin) });',
        'export const CastArg = createLook(iosSkin as Skin);',
      ].join("\n"),
    });
    try {
      const look = skinsOf(root, "look");
      const ios = Object.fromEntries(Object.entries(look.exportDivergence).map(([name, byPlatform]) => [name, byPlatform.iOS]));
      expect(ios).toEqual({
        NsOwn: "builds from its own iosOwnSkin",
        NsSpread: "builds its own skin (a spread of iosSkin, the web skin, with radius)",
        NsPart: "injects platform parts (../part/part.ios.js)",
        NsWhole: "builds from the namespace look, read whole (./look.styles.js), which the reader cannot resolve; counted as its own skin",
        NsParts: "injects platform parts (../part/part.ios.js, through the namespace parts, read whole, which the reader cannot resolve; counted as the platform's own)",
        Default: "builds from the default import lookDefault (./look.styles.js), which the reader cannot resolve; counted as its own skin",
        Helper: "builds its own skin (a spread of iosSkin, the web skin, with radius)",
        HelperSame: "builds its own skin (iosSkin, the web skin, read in `return iosSkin;`, a form the reader does not follow)",
        Arrow: "builds its own skin (a spread of iosSkin, the web skin, with gap)",
        Tweaked: "builds its own skin (iosSkin, the web skin, handed to tweak(), which the reader does not follow)",
        Paren: "builds its own skin (a spread of iosSkin, the web skin, with radius)",
        Cast: "builds its own skin (a spread of iosSkin, the web skin, with radius)",
      });
      // What it can prove stays the web build: an alias read off the namespace, a part that
      // is the web build, a cast argument, a cast spread that adds nothing.
      for (const name of ["NsAlias", "NsPlainPart", "CastOnly", "CastArg"]) expect(look.exports).toContain(name);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("counts data the entry writes itself as the platform's own unless the web entry has the same at that place (item c)", () => {
    const root = kit({
      "atoms/chip/chip.styles.ts": "export const webSkin = { radius: 8 };\nexport const iosSkin = webSkin;",
      "atoms/chip/chip.tsx": [
        'import { createChip, createRow } from "./chip.shared.js";',
        'import { webSkin } from "./chip.styles.js";',
        'const KIND = "row";',
        "export const Chip = createChip(webSkin);",
        "export const Local = createChip(webSkin);",
        "export const Empty = createChip(webSkin);",
        'export const Row = createRow(webSkin, "row");',
        'export const Named = createRow(webSkin, KIND);',
        'export const Column = createRow(webSkin, "column");',
        "export const Option = createChip(webSkin, { dense: true });",
        "export const Fn = createChip(webSkin);",
        "export const Helper = createChip(webSkin);",
        "export const Picked = createChip(webSkin);",
      ].join("\n"),
      "atoms/chip/chip.ios.tsx": [
        'import { createChip, createRow } from "./chip.shared.js";',
        'import { iosSkin } from "./chip.styles.js";',
        "const skin = { radius: 3 };",
        "function tweak() { return { radius: 2 }; }",
        // An object is never the web skin by being an object.
        "export const Chip = createChip({ radius: 3 });",
        "export const Local = createChip(skin);",
        "export const Empty = createChip({});",
        // The same literal at the same place as the web entry is the web build's, through a web const too.
        'export const Row = createRow(iosSkin, "row");',
        'export const Named = createRow(iosSkin, "row");',
        'export const Column = createRow(iosSkin, "row");',
        "export const Option = createChip(iosSkin, { dense: true });",
        // A function written here, a helper's own data, a choice the reader cannot place.
        "export const Fn = createChip(iosSkin, { render: () => null });",
        "export const Helper = createChip(tweak());",
        'export const Picked = createChip(iosSkin, { size: Math.random() > 0.5 ? "s" : "m" });',
        // An export the web entry does not have.
        'export const Extra = createRow(iosSkin, "row");',
      ].join("\n"),
    });
    try {
      const ios = Object.fromEntries(Object.entries(skinsOf(root, "chip").exportDivergence).map(([name, by]) => [name, by.iOS]));
      expect(ios).toEqual({
        Chip: "passes `radius: 3` where the web entry has `webSkin`; counted as the platform's own",
        Local: "passes `radius: 3` where the web entry has `webSkin`; counted as the platform's own",
        Empty: "passes `{}` where the web entry has `webSkin`; counted as the platform's own",
        Column: 'passes `"row"` where the web entry has `"column"`; counted as the platform\'s own',
        Fn: "passes `render: () => null` which the web entry does not; counted as the platform's own",
        Helper: "builds data of its own in tweak() (tweak()); counted as the platform's own",
        Picked: 'passes `size: Math.random() > 0.5 ? "s" : "m"` which the web entry does not; counted as the platform\'s own',
        Extra: 'passes `"row"` and there is no web export of that name to match it against; counted as the platform\'s own',
      });
      // Row, Named and Option match the web entry literal for literal: the web build.
      for (const name of ["Row", "Named", "Option"]) expect(ios[name]).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("treats a re-export-only entry and a skin it cannot resolve the right way round", () => {
    const root = kit({
      "atoms/plain/plain.ios.tsx": 'export { Plain } from "./plain.shared.js";',
      "atoms/odd/odd.styles.ts": 'export function iosSkin() { return {}; }\nexport const webSkin = {};',
      "atoms/odd/odd.ios.tsx": 'import { createOdd } from "./odd.shared.js";\nimport { iosSkin } from "./odd.styles.js";\nexport const Odd = createOdd(iosSkin());',
    });
    try {
      expect(skinsOf(root, "plain")).toMatchObject({ exports: [], exportDivergence: {}, divergent: {}, hasPlatformEntries: true });
      // A name no styles module declares as a value cannot be shown to be the web skin,
      // so it counts as the platform's own: the safe error is a registry entry the docs
      // do not need, never a web build labelled iOS.
      expect(exportDivergences(join(root, "atoms/odd"), 'import { createOdd } from "./odd.shared.js";\nimport { iosSkin } from "./odd.styles.js";\nexport const Odd = createOdd(iosSkin());', "iOS")).toEqual({ Odd: "builds from its own iosSkin" });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("classifies every form an entry exports in, and counts a form it cannot classify as the platform's own (item 5)", () => {
    const root = kit({
      "atoms/thing/thing.styles.ts": [
        "export const webSkin = { radius: 8 };",
        "export const iosSkin = webSkin;",
        "export const iosOwnSkin = { radius: 4 };",
        "export const androidSkin = webSkin;",
        "export const androidOwnSkin = { radius: 2 };",
      ].join("\n"),
      "atoms/part/part.styles.ts": "export const webSkin = { h: 36 };\nexport const iosSkin = { h: 44 };\nexport const iosPlainSkin = webSkin;",
      "atoms/part/part.ios.tsx": [
        'import { createPart } from "./part.shared.js";',
        'import { iosSkin, iosPlainSkin } from "./part.styles.js";',
        "export const Part = createPart(iosSkin);",
        "export const Plain = createPart(iosPlainSkin);",
      ].join("\n"),
      "atoms/other/other.styles.ts": "export const webSkin = { a: 1 };\nexport const iosSkin = { a: 2 };",
      "atoms/other/other.ios.tsx": 'import { createOther } from "./other.shared.js";\nimport { iosSkin } from "./other.styles.js";\nexport const Other = createOther(iosSkin);',
      "atoms/thing/tokenize.ts": "export const tokenize = () => [];",
      "atoms/thing/elsewhere.ts": "export const ELSEWHERE = 1;",
      "atoms/thing/odd.tsx": "export const Odd = 1;",
      "atoms/thing/odd.ios.tsx": "export const Odd = 2;",
      "atoms/thing/thing.ios.tsx": [
        'import { createThing } from "./thing.shared.js";',
        'import { iosSkin, iosOwnSkin } from "./thing.styles.js";',
        // A function or class the entry writes itself cannot be read as the web build.
        "export function Fn() { return null; }",
        "export class Klass {}",
        // A `let` may be reassigned after its initializer.
        "export let Mutable = createThing(iosSkin);",
        // Declared, then exported by list: judged like `export const`, under the exported name.
        "const Local = createThing(iosSkin);",
        "const Own = createThing(iosOwnSkin);",
        "export { Local, Own as Renamed };",
        // Another component's platform build: judged as a part.
        'export { Part, Plain } from "../part/part.ios.js";',
        'export * from "../other/other.ios.js";',
        // One module on every platform: the shared module, a logic module, a package.
        'export { helper } from "./thing.shared.js";',
        'export * from "./thing.shared.js";',
        'export { tokenize } from "./tokenize.js";',
        'export * from "./elsewhere.js";',
        'export { View } from "react-native";',
        // A module with an iOS build of its own that the entry does not name, and one that does not resolve.
        'export { Odd } from "./odd.js";',
        'export { Gone } from "./gone.js";',
        'export * as ns from "../part/part.ios.js";',
        "export default createThing(iosOwnSkin);",
      ].join("\n"),
      "atoms/thing/thing.android.tsx": [
        'import { createThing } from "./thing.shared.js";',
        'import { androidSkin, androidOwnSkin } from "./thing.styles.js";',
        "const D = createThing(androidSkin);",
        "const E = createThing(androidOwnSkin);",
        "export { E };",
        "export default D;",
      ].join("\n"),
    });
    try {
      const thing = skinsOf(root, "thing");
      const ios = Object.fromEntries(Object.entries(thing.exportDivergence).flatMap(([name, by]) => (by.iOS ? [[name, by.iOS]] : [])));
      expect(ios).toEqual({
        Fn: "exports Fn as a function declaration, a form the reader cannot classify; counted as the platform's own",
        Klass: "exports Klass as a class declaration, a form the reader cannot classify; counted as the platform's own",
        Mutable: "exports Mutable, the `let` or `var` Mutable, a form the reader cannot classify; counted as the platform's own",
        Renamed: "builds from its own iosOwnSkin",
        Part: "re-exports the iOS build of Part (../part/part.ios.js)",
        Other: "re-exports the iOS build of Other (../other/other.ios.js)",
        Odd: "re-exports Odd from ./odd.js (./odd.js has platform builds of its own that the entry does not import by their platform path), a form the reader cannot classify; counted as the platform's own",
        Gone: "re-exports Gone from ./gone.js (./gone.js does not resolve), a form the reader cannot classify; counted as the platform's own",
        ns: "re-exports ns, the namespace of ../part/part.ios.js, a form the reader cannot classify; counted as the platform's own",
        default: "builds from its own iosOwnSkin",
      });
      // What it can prove is listed as the web build; what is one module everywhere is not listed.
      expect(thing.exports).toEqual(expect.arrayContaining(["Local", "Plain"]));
      for (const name of ["Local", "Plain"]) expect(thing.exportDivergence[name]?.iOS).toBeUndefined();
      for (const name of ["helper", "tokenize", "ELSEWHERE", "View"]) expect(thing.exports).not.toContain(name);
      // A default export of a local const is that const's build.
      expect(thing.exportDivergence.E).toEqual({ Android: "builds from its own androidOwnSkin" });
      expect(thing.exportDivergence.default).toEqual({ iOS: "builds from its own iosOwnSkin" });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("names what each reason is made of: a skin or data of its own, a part, a part's skin, a form it cannot read (K8a)", () => {
    // A component's own look answers to its own reference row and a part's to the part's,
    // so each reason carries what it is made of.
    const kinds = (c: ComponentSkins, name: string, platform: "iOS" | "Android") => c.exportReasons[name]?.[platform]?.map((r) => (r.owner ? `${r.kind} ${r.owner}` : r.kind));
    // AvatarMenu builds the Dropdown from the Dropdown's own skin and hands its factory a 6
    // gap: both set the part's look, so Avatar's own skin is still the web skin.
    expect(kinds(skinsOf(KIT, "avatar"), "AvatarMenu", "iOS")).toEqual(["part-skin dropdown", "part-skin dropdown"]);
    // A part under a nested directory belongs to the component it sits in.
    expect(kinds(skinsOf(KIT, "listbox"), "Listbox", "Android")).toEqual(["part checkbox"]);
    expect(kinds(skinsOf(KIT, "video"), "Video", "Android")).toEqual(["own-skin", "part spinner", "own-data"]);
    expect(kinds(skinsOf(KIT, "feeds"), "Feed", "iOS")).toEqual(["own-skin"]);

    const root = kit({
      "atoms/thing/thing.styles.ts": "export const webSkin = { radius: 8 };\nexport const iosSkin = webSkin;\nexport const iosOwnSkin = { radius: 4 };",
      "atoms/other/other.styles.ts": "export const webSkin = { a: 1 };\nexport const iosSkin = webSkin;",
      "atoms/button/button.styles.ts": "export const webSkin = { h: 36 };\nexport const iosSkin = { h: 44 };",
      "atoms/button/button.ios.tsx": 'import { createButton } from "./button.shared.js";\nimport { iosSkin } from "./button.styles.js";\nexport const Button = createButton(iosSkin);',
      "atoms/thing/thing.tsx": [
        'import { createThing } from "./thing.shared.js";',
        'import { createOther } from "../other/other.shared.js";',
        'import { webSkin } from "./thing.styles.js";',
        'import { webSkin as otherWeb } from "../other/other.styles.js";',
        "export const Own = createThing(webSkin);",
        "export const Data = createThing(webSkin);",
        "export const WithPart = createThing(webSkin);",
        "export const PartLook = createThing(webSkin, createOther(otherWeb));",
      ].join("\n"),
      "atoms/thing/thing.ios.tsx": [
        'import { createThing } from "./thing.shared.js";',
        'import { createOther } from "../other/other.shared.js";',
        'import { iosSkin, iosOwnSkin } from "./thing.styles.js";',
        'import { iosSkin as otherIos } from "../other/other.styles.js";',
        'import { Button } from "../button/button.ios.js";',
        "export const Own = createThing(iosOwnSkin);",
        "export const Data = createThing(iosSkin, { dense: true });",
        "export const WithPart = createThing(iosSkin, { Button });",
        // The web skin of another component, spread with an override and handed to that
        // component's own factory: the part's look, never this component's.
        "export const PartLook = createThing(iosSkin, createOther({ ...otherIos, gap: 6 }));",
        "export function Unread() { return null; }",
      ].join("\n"),
    });
    try {
      const thing = skinsOf(root, "thing");
      expect(Object.fromEntries(thing.exports.map((name) => [name, kinds(thing, name, "iOS")]))).toEqual({
        Own: ["own-skin"],
        Data: ["own-data"],
        WithPart: ["part button"],
        PartLook: ["part-skin other"],
        Unread: ["unknown"],
      });
      // The kinds sit beside the reasons the string reads have always spelled.
      expect(thing.exportReasons.PartLook?.iOS?.map((r) => r.text).join("; ")).toBe(thing.exportDivergence.PartLook?.iOS);
      expect(thing.exportReasons.PartLook?.iOS?.every((r) => !isOwnLook(r))).toBe(true);
      expect(["Own", "Data", "Unread"].every((name) => thing.exportReasons[name]?.iOS?.every(isOwnLook))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("follows a barrel to the module that builds a name, and judges a shell's import there (item 7)", () => {
    const root = kit({
      "atoms/button/button.styles.ts": "export const webSkin = { h: 36 };\nexport const iosSkin = { h: 44 };\nexport const androidSkin = webSkin;",
      "atoms/button/button.tsx": 'import { createButton } from "./button.shared.js";\nimport { webSkin } from "./button.styles.js";\nexport const Button = createButton(webSkin);',
      "atoms/button/button.ios.tsx": 'import { createButton } from "./button.shared.js";\nimport { iosSkin } from "./button.styles.js";\nexport const Button = createButton(iosSkin);',
      "atoms/badge/badge.styles.ts": "export const webSkin = { r: 4 };\nexport const iosSkin = webSkin;",
      "atoms/badge/badge.tsx": 'import { createBadge } from "./badge.shared.js";\nimport { webSkin } from "./badge.styles.js";\nexport const Badge = createBadge(webSkin);',
      "atoms/badge/badge.ios.tsx": 'import { createBadge } from "./badge.shared.js";\nimport { iosSkin } from "./badge.styles.js";\nexport const Badge = createBadge(iosSkin);',
      "atoms/index.ts": 'export * from "./button/button.js";\nexport * from "./badge/badge.js";',
      "index.ts": 'export * from "./atoms/index.js";\nexport { View } from "react-native";',
    });
    try {
      const barrel = join(root, "atoms/index.ts");
      expect(traceExport(barrel, "Button")!.steps.map((s) => s.file)).toEqual([barrel, join(root, "atoms/button/button.tsx")]);
      expect(traceExport(join(root, "index.ts"), "View")).toEqual({ steps: [{ file: join(root, "index.ts"), name: "View" }], package: { specifier: "react-native", name: "View" } });
      expect(traceExport(barrel, "Nothing")).toBeNull();
      expect(platformModuleOf(barrel, "Badge")).toEqual({ file: join(root, "atoms/badge/badge.tsx"), name: "Badge" });
      const isComponent = (file: string) => /\/(atoms|molecules)\//.test(file);
      const shell = join(root, "molecules/card/card.shared.tsx");
      const judge = (source: string) => shellImportFindings(shell, source, "card.shared.tsx", isComponent);
      // Through the group barrel and through the kit's entry, judged as a direct import is.
      expect(judge('import { Button, Badge } from "../../atoms/index.js";')).toEqual({
        judged: 2,
        offenders: [
          "card.shared.tsx imports Button from ../../atoms/index.js (through to button.tsx), which looks different on iOS; take it as a part (import { Button as WebButton }, parts.Button ?? WebButton)",
        ],
      });
      expect(judge('import { Button } from "../../index.js";').offenders).toHaveLength(1);
      expect(judge('import { Button } from "../../atoms/button/button.js";').offenders).toEqual([
        "card.shared.tsx imports Button from ../../atoms/button/button.js, which looks different on iOS; take it as a part (import { Button as WebButton }, parts.Button ?? WebButton)",
      ]);
      // The part's web default is allowed; a namespace import of the barrel cannot inject parts.
      expect(judge('import { Button as WebButton, Badge } from "../../atoms/index.js";')).toEqual({ judged: 2, offenders: [] });
      expect(judge('import * as atoms from "../../atoms/index.js";').offenders).toEqual([
        "card.shared.tsx imports ../../atoms/index.js whole; import each part by name so its platform build can be injected",
      ]);
      expect(judge('import { View } from "../../index.js";')).toEqual({ judged: 0, offenders: [] });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads the docs registry tables as text", () => {
    const registry = registeredSkins([
      'export const PLATFORM_SKINS = {',
      '  ios: {',
      '    Button: ButtonIOS, AvatarMenu: AvatarMenuIOS,',
      '  },',
      '  android: {',
      '    Button: ButtonAndroid, Chip: ChipAndroid,',
      '  },',
      '};',
    ].join("\n"));
    expect([...registry.ios]).toEqual(["Button", "AvatarMenu"]);
    expect([...registry.android]).toEqual(["Button", "Chip"]);
  });
});
