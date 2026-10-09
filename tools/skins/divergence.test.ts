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
      "atoms/thing/thing.ios.tsx": [
        'import { createThing, createMenu, createBare } from "./thing.shared.js";',
        'import { createOther } from "../other/other.shared.js";',
        'import { iosSkin as otherSkin } from "../other/other.styles.js";',
        'import { iosSkin, iosMenuSkin } from "./thing.styles.js";',
        'import { Button } from "../button/button.ios.js";',
        'import type { Props } from "./thing.shared.js";',
        'export const Thing = createThing(iosSkin);',
        'const Menu = createOther({ ...otherSkin, gap: 6 });',
        'export const ThingMenu = createMenu(iosMenuSkin, Menu);',
        'export const Bare = createBare(iosSkin, { Button });',
        'export const { A, B } = createThing(iosSkin, { trailing: Button });',
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
      expect(thing.exports).toEqual(["Thing", "ThingMenu", "Bare", "A", "B"]);
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
