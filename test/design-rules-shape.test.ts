import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Glob } from "bun";
import { lightColors, shape } from "../src/style/tokens.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import { platformBlocks, platformValue, type PlatformKey } from "../tools/tokens/css-tokens.ts";
import { SKIN_FAMILIES, normalize, type SkinFamily } from "../tools/tokens/skin-families.ts";
import { COMPONENT_ROLES, CONCENTRIC_CORNERS, HANDOFF_SHAPE_TOKENS, NESTED_CORNERS, SHAPE_ROLES, type CornerSource, type ShapeRole } from "../tools/tokens/shape-roles.ts";
import { CornerSites, type CornerValue } from "../tools/tokens/corner-sites.ts";
import { componentOf, cornerVerdict, platformOf, siteOf } from "../tools/tokens/corner-rules.ts";
import { cornerClaims, handoffClaims } from "../tools/tokens/corner-comments.ts";

// Design rules, shape side: every corner in the kit is a role of the row of the platform
// its skin draws, for a role its component plays (the shape table's roles and the
// platform's own, src/style/platform-shape.ts), the pill (9999), square (0), or concentric
// with a declared container, computed from that container's own corner and inset. A bare
// number that merely equals a role's value is refused, since it says nothing about the role
// the corner plays, and so is half of a size (a capsule is the pill) and the radius ladder.
//
// `shape` (src/style/tokens.ts) is the one source for a corner that plays a role, and each
// skin reads its platform's row. Comparing the skins with the CSS hand-off
// (design-rules-skins) cannot see a table that has drifted from both: the iOS checkbox
// row said 5 while the skin and the hand-off agreed on a circle. So the skins are invoked
// here, the way the hand-off test invokes them, and held to the table itself; and every
// corner the source sets, in a skin or a shell, is traced to the number that sets it
// (tools/tokens/corner-sites.ts) and judged on its platform (tools/tokens/corner-rules.ts).

const ROOT = join(import.meta.dir, "..");
const PLATFORMS: PlatformKey[] = ["web", "ios", "android"];
const ROLES = Object.keys(shape.web) as ShapeRole[];
const blocks = platformBlocks(readFileSync(join(ROOT, "styles", "tokens", "platforms.css"), "utf8"));
const tokens = lightColors as unknown as Record<string, string>;

type Skin = Record<string, unknown>;

/** Every family that checks a token (Input and Textarea both draw the field corner). */
const familiesOf = (token: string): SkinFamily[] => SKIN_FAMILIES.filter((f) => f.checks.some((c) => c.token === token));

async function skinsOf(module: string): Promise<Record<string, Skin>> {
  // A .js specifier resolves to the .styles.ts or .styles.tsx source alike.
  return (await import(join(ROOT, "src", `${module}.styles.js`))) as Record<string, Skin>;
}

async function skinValue(family: SkinFamily, token: string, platform: PlatformKey): Promise<string | null> {
  const check = family.checks.find((c) => c.token === token)!;
  return normalize(check.read((await skinsOf(family.module))[`${platform}Skin`], tokens));
}

describe("the shape table", () => {
  it("has the same roles on every platform", () => {
    for (const platform of PLATFORMS) expect(Object.keys(shape[platform]).sort()).toEqual([...ROLES].sort());
  });

  it("names every role in tools/tokens/shape-roles.ts", () => {
    expect(Object.keys(SHAPE_ROLES).sort()).toEqual([...ROLES].sort());
  });

  // A row that no skin draws is a number nothing keeps honest.
  for (const role of ROLES) {
    it(`${role} is drawn by a skin on every platform`, () => {
      for (const platform of PLATFORMS) {
        expect(SHAPE_ROLES[role].some((m) => m.on.includes(platform)), `${role} on ${platform}`).toBe(true);
      }
    });
  }

  it("keeps the platforms' own corners out of the package", () => {
    // platformShape is the kit's own table; promoting an entry to a role is a public change.
    for (const index of ["src/index.ts", "src/style/index.ts"]) {
      expect(readFileSync(join(ROOT, index), "utf8"), index).not.toContain("platform-shape");
    }
  });
});

describe("the skins draw the shape table", () => {
  for (const role of ROLES) {
    for (const member of SHAPE_ROLES[role]) {
      it(`${member.token} is the ${role} corner on ${member.on.join(", ")}`, async () => {
        const families = familiesOf(member.token);
        expect(families.length, `${member.token} is not a hand-off token of tools/tokens/skin-families.ts`).toBeGreaterThan(0);
        // A platform left out says what it draws instead, so the table never silently skips one.
        if (member.on.length < PLATFORMS.length) expect(member.why, `${member.token} leaves a platform out without saying why`).toBeTruthy();
        for (const family of families) {
          for (const platform of member.on) {
            expect(await skinValue(family, member.token, platform), `${family.name} ${member.token} on ${platform}`).toBe(
              normalize(shape[platform][role]),
            );
          }
        }
      });
    }
  }
});

describe("the hand-off's role tokens follow the shape table", () => {
  for (const [token, role] of Object.entries(HANDOFF_SHAPE_TOKENS)) {
    for (const platform of PLATFORMS) {
      it(`--${token} is the ${role} corner on ${platform}`, () => {
        expect(normalize(platformValue(blocks, platform, token)), `--${token} on ${platform}`).toBe(normalize(shape[platform][role]));
      });
    }
  }
});

// Every corner the source sets. The icons are left out: a glyph's `rx` rounds a stroke in
// the icon's own 24-unit drawing, scaled with the glyph, not a corner of the UI.
const files = [...new Glob("src/**/*.{ts,tsx}").scanSync(ROOT)].filter((f) => !f.endsWith(".d.ts") && !f.startsWith("src/atoms/icon/")).sort();
const { values: corners, unresolved } = new CornerSites(ROOT).scan(files);
const where = (v: CornerValue) => `${v.file}:${v.line} ${v.path} (${v.text})`;
const concentricSites = new Set(CONCENTRIC_CORNERS.map((c) => c.site));

describe("every corner in the kit", () => {
  it("is found", () => {
    // A scan that stopped finding corners would pass every rule below.
    expect(corners.length).toBeGreaterThan(350);
    expect(new Set(corners.map((v) => v.file)).size).toBeGreaterThan(80);
  });

  it("is traced to the number that sets it", () => {
    // A corner the folder cannot see would otherwise pass for want of a value.
    expect(unresolved.map((u) => `${u.file}:${u.line} ${u.path}: ${u.text}`)).toEqual([]);
  });

  it("is a role of its own platform's row that its component plays, the pill, square or concentric", () => {
    const wrong = corners.flatMap((v) => {
      const verdict = cornerVerdict(v, { concentric: concentricSites });
      return verdict.ok ? [] : [`${v.file}:${v.line}: ${verdict.reason}`];
    });
    expect(wrong).toEqual([]);
  });

  it("is a role the component reads, for every role COMPONENT_ROLES lists", () => {
    // A listed role no corner of the component reads is a claim nothing keeps honest.
    const read = new Set(corners.flatMap((v) => (v.read && v.read.table !== "radius" && v.kind === "read" ? [`${componentOf(v.file)} ${v.read.key}`] : [])));
    const stale = Object.entries(COMPONENT_ROLES).flatMap(([component, roles]) => roles.filter((role) => !read.has(`${component} ${role}`)).map((role) => `${component} ${role}`));
    expect(stale).toEqual([]);
    // Every listed role is a role of some platform's row.
    const known = new Set([...ROLES, ...PLATFORMS.flatMap((p) => Object.keys((platformShape as Record<PlatformKey, Record<string, number>>)[p]))]);
    expect(Object.values(COMPONENT_ROLES).flat().filter((role) => !known.has(role))).toEqual([]);
  });

  it("leaves to the app only the corners a public prop picks", () => {
    // Image's and Video's `radius` name a step of the public ladder at the call site.
    expect([...new Set(corners.filter((v) => v.kind === "consumer").map((v) => `${v.file} ${v.path}`))].sort()).toEqual([
      "src/atoms/image/image.shared.tsx Image",
      "src/atoms/video/video.shared.tsx createVideo.frame",
    ]);
  });

  it("reads every role of the shape table on every platform", async () => {
    // A native row no skin of its own reads is drawn only where every skin that draws the
    // role there is the web skin (no platform ships the control, so the native skins alias
    // the Dark Factory look), and then it is the web row's value.
    const throughWeb = new Set<string>();
    for (const platform of PLATFORMS) {
      if (platform === "web") continue;
      for (const role of ROLES) {
        const members = SHAPE_ROLES[role].filter((m) => m.on.includes(platform));
        let aliased = members.length > 0 && shape[platform][role] === shape.web[role];
        for (const member of members) {
          for (const family of familiesOf(member.token)) {
            const skins = await skinsOf(family.module);
            if (skins[`${platform}Skin`] !== skins.webSkin) aliased = false;
          }
        }
        if (aliased) throughWeb.add(`${platform}.${role}`);
      }
    }
    const read = new Set(corners.flatMap((v) => (v.read?.table === "shape" ? [`${v.read.platform}.${v.read.key}`] : [])));
    const unread = PLATFORMS.flatMap((p) => ROLES.filter((r) => !read.has(`${p}.${r}`) && !throughWeb.has(`${p}.${r}`)).map((r) => `shape.${p}.${r}`));
    expect(unread).toEqual([]);
  });

  it("reads every role of each platform's own row on that platform", () => {
    const read = new Set(corners.flatMap((v) => (v.read?.table === "platformShape" ? [`${v.read.platform}.${v.read.key}`] : [])));
    const rows = platformShape as Record<PlatformKey, Record<string, number>>;
    const unread = PLATFORMS.flatMap((p) => Object.keys(rows[p]).filter((k) => !read.has(`${p}.${k}`)).map((k) => `platformShape.${p}.${k}`));
    expect(unread).toEqual([]);
  });

  it("is declared wherever it is written concentric, and only there", () => {
    const written = new Set(corners.filter((v) => v.concentric).map(siteOf));
    expect([...concentricSites].filter((site) => !written.has(site))).toEqual([]);
  });
});

describe("the comments state the corners the code draws", () => {
  // The corners each source file draws: those written in its component's directory or set
  // there, and those written in the style modules it imports by name (a menu's rows come
  // from src/style/menu-look.ts). A comment in the file that defines the tables states the
  // tables' own values.
  const byDir = new Map<string, Set<number>>();
  const byFile = new Map<string, Set<number>>();
  const add = (map: Map<string, Set<number>>, key: string, value: number) => map.set(key, (map.get(key) ?? new Set()).add(value));
  for (const v of corners) {
    add(byFile, v.file, v.value);
    for (const dir of v.rounds) add(byDir, dir, v.value);
  }
  const imported = (file: string): string[] =>
    [...readFileSync(join(ROOT, file), "utf8").matchAll(/from "(\.{1,2}\/[^"]+)\.js"/g)]
      .map((m) => join(dirname(file), m[1]))
      .filter((base) => !base.endsWith("/index"))
      .flatMap((base) => [`${base}.ts`, `${base}.tsx`]);
  const drawnBy = (file: string): Set<number> => new Set([...(byDir.get(dirname(file)) ?? []), ...imported(file).flatMap((f) => [...(byFile.get(f) ?? [])])]);
  const tables = new Set([shape, platformShape].flatMap((table) => Object.values(table).flatMap((row) => Object.values(row as Record<string, number>))));
  const TABLE_FILES = new Set(["src/style/tokens.ts", "src/style/platform-shape.ts"]);

  it("in the source", () => {
    const wrong = cornerClaims(ROOT, files)
      .filter((c) => !(TABLE_FILES.has(c.file) ? tables : drawnBy(c.file)).has(c.value))
      .map((c) => `${c.file}:${c.line} "${c.text}"`);
    expect(wrong).toEqual([]);
  });

  it("in the hand-off", () => {
    const sheets = [...new Glob("styles/**/*.css").scanSync(ROOT)].sort();
    const wrong = handoffClaims(ROOT, sheets)
      .filter((c) => !c.tokens.includes(c.value))
      .map((c) => `${c.file}:${c.line} "${c.text}" over [${c.tokens.join(", ")}]`);
    expect(wrong).toEqual([]);
  });
});

describe("a concentric corner is computed from its declared container", () => {
  for (const decl of CONCENTRIC_CORNERS) {
    it(`${decl.name} on ${decl.on.join(", ")}`, async () => {
      const written = [...new Set(corners.filter((v) => siteOf(v) === decl.site).map((v) => v.value))].sort((a, b) => a - b);
      expect(written.length, `${decl.site} writes no corner`).toBeGreaterThan(0);
      const styles = await skinsOf(decl.module);
      const computed = [...new Set(decl.on.flatMap((p) => decl.corners(styles as Record<string, unknown>, p, tokens)))].sort((a, b) => a - b);
      expect(written, decl.name).toEqual(computed);
    });
  }
});

async function cornerOn(source: CornerSource, platform: PlatformKey): Promise<number | null> {
  if ("token" in source) {
    const families = familiesOf(source.token);
    expect(families.length, `${source.token} is not a hand-off token of tools/tokens/skin-families.ts`).toBe(1);
    const value = await skinValue(families[0], source.token, platform);
    return value === null ? null : Number(value);
  }
  return source.read((await skinsOf(source.module))[`${platform}Skin`], tokens);
}

describe("a nested corner is never rounder than its container", () => {
  for (const pair of NESTED_CORNERS) {
    const on = pair.on ?? ["web"];
    it(`${pair.name} on ${on.join(", ")}`, async () => {
      for (const platform of on) {
        const outer = await cornerOn(pair.outer, platform);
        const inner = await cornerOn(pair.inner, platform);
        expect(outer, `${pair.name}: the container's corner on ${platform}`).not.toBeNull();
        expect(inner, `${pair.name}: the inner corner on ${platform}`).not.toBeNull();
        expect(inner!, `${pair.name} on ${platform}`).toBeLessThanOrEqual(outer!);
      }
    });
  }
});
