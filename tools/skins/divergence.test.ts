import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { builtExports, componentSkins, exportDivergences, isWebSkinAlias } from "./divergence.ts";
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
    expect(avatar.exportDivergence.AvatarMenu).toEqual({
      iOS: "builds a part from dropdown's own iosSkin (../dropdown/dropdown.styles.js)",
      Android: "builds a part from dropdown's own androidSkin (../dropdown/dropdown.styles.js)",
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
    expect(skinsOf(KIT, "video").exportDivergence.Video?.iOS).toBe("builds from its own iosSkin; injects platform parts (../spinner/spinner.ios.js)");
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
        ThingMenu: { iOS: "builds a part from other's own iosSkin (../other/other.styles.js)" },
        Bare: { iOS: "injects platform parts (../button/button.ios.js)" },
        A: { iOS: "injects platform parts (../button/button.ios.js)" },
        B: { iOS: "injects platform parts (../button/button.ios.js)" },
        Thing: { Android: "builds from its own androidSkin" },
      });
      expect(thing.divergent).toEqual({
        iOS: "builds a part from other's own iosSkin (../other/other.styles.js); injects platform parts (../button/button.ios.js)",
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
