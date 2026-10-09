import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lightColors, shape } from "../src/style/tokens.ts";
import { platformBlocks, platformValue, type PlatformKey } from "../tools/tokens/css-tokens.ts";
import { SKIN_FAMILIES, normalize, type SkinFamily } from "../tools/tokens/skin-families.ts";
import { HANDOFF_SHAPE_TOKENS, SHAPE_ROLES, type ShapeRole } from "../tools/tokens/shape-roles.ts";

// Design rules, shape side: every corner that plays a role of the shape table is the
// table's value on its platform.
//
// `shape` (src/style/tokens.ts) is the one source for those corners, and each skin
// reads its platform's row. Comparing the skins with the CSS hand-off
// (design-rules-skins) cannot see a table that has drifted from both: the iOS checkbox
// row said 5 while the skin and the hand-off agreed on a circle. So the skins are invoked
// here, the way the hand-off test invokes them, and held to the table itself.

const ROOT = join(import.meta.dir, "..");
const PLATFORMS: PlatformKey[] = ["web", "ios", "android"];
const ROLES = Object.keys(shape.web) as ShapeRole[];
const blocks = platformBlocks(readFileSync(join(ROOT, "styles", "tokens", "platforms.css"), "utf8"));
const tokens = lightColors as unknown as Record<string, string>;

type Skin = Record<string, unknown>;

/** Every family that checks a token (Input and Textarea both draw the field corner). */
const familiesOf = (token: string): SkinFamily[] => SKIN_FAMILIES.filter((f) => f.checks.some((c) => c.token === token));

async function skinValue(family: SkinFamily, token: string, platform: PlatformKey): Promise<string | null> {
  // A .js specifier resolves to the .styles.ts or .styles.tsx source alike.
  const mod = (await import(join(ROOT, "src", `${family.module}.styles.js`))) as Record<string, Skin>;
  const check = family.checks.find((c) => c.token === token)!;
  return normalize(check.read(mod[`${platform}Skin`], tokens));
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
