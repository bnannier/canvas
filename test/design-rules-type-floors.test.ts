import { describe, it, expect } from "bun:test";
import { join } from "node:path";
import { Glob } from "bun";
import { READING_FLOOR, TEXT_ROLES, type ReadingRole } from "../tools/tokens/type-roles.ts";
import { TypeSites, type TypeValue } from "../tools/tokens/type-sites.ts";

// Design rules, type side: every text the kit sets is at least its reading role's floor.
//
// The floors are the design language's (CLAUDE.md, item 4): body and lead 12, small 11,
// tiny and caption 10. design-rules-source keeps every size at the 10 px source floor;
// this gate knows which text is which. A size reaches a Text through a skin's `fontSize`,
// a type-scale style taken whole, or the helpers and tables a skin builds its type from,
// so every one is traced to the place its number is written (tools/tokens/type-sites.ts),
// on every platform's skin at once, and the text under 12 is held to the role
// tools/tokens/type-roles.ts declares for it.

const ROOT = join(import.meta.dir, "..");
const BODY_FLOOR = READING_FLOOR.body;

const files = [...new Glob("src/**/*.{ts,tsx}").scanSync(ROOT)].filter((f) => !f.endsWith(".d.ts")).sort();
const { values, unresolved } = new TypeSites(ROOT).scan(files);
const small = values.filter((v) => v.value < BODY_FLOOR);

/** The role declared for a text: the longest declared name that is the text's own name or encloses it. */
function roleOf(v: TypeValue): { key: string; role: ReadingRole } | null {
  const declared = TEXT_ROLES[v.file] ?? {};
  let best: { key: string; role: ReadingRole } | null = null;
  for (const [key, role] of Object.entries(declared)) {
    if (v.path !== key && !v.path.startsWith(`${key}.`)) continue;
    if (!best || key.length > best.key.length) best = { key, role };
  }
  return best;
}

const where = (v: TypeValue) => `${v.file}:${v.line} ${v.path} (${v.kind}) ${v.value}px`;

describe("the reading floors", () => {
  it("are the design language's", () => {
    expect(READING_FLOOR).toEqual({ body: 12, lead: 12, small: 11, tiny: 10, caption: 10 });
  });

  for (const platform of ["web", "ios", "android"] as const) {
    it(`hold the Typography roles on ${platform}`, async () => {
      const mod = (await import("../src/atoms/typography/typography.styles.ts")) as Record<string, { roleType: Record<string, { fontSize?: number }> }>;
      const roleType = mod[`${platform}Skin`].roleType;
      for (const [role, floor] of Object.entries(READING_FLOOR)) {
        expect(roleType[role]?.fontSize, `Typography ${role} on ${platform}`).toBeGreaterThanOrEqual(floor);
      }
    });
  }
});

describe("every text size in the kit", () => {
  it("is found", () => {
    // A scan that stopped finding text would pass every rule below.
    expect(values.length).toBeGreaterThan(500);
  });

  it("is traced to the number that sets it", () => {
    // A size the folder cannot see would otherwise pass for want of a value.
    expect(unresolved.map((u) => `${u.file}:${u.line} ${u.path}: ${u.text}`)).toEqual([]);
  });

  it("under the body floor declares its reading role", () => {
    expect(small.filter((v) => !roleOf(v)).map(where)).toEqual([]);
  });

  it("is at least its role's floor", () => {
    const under = small.flatMap((v) => {
      const role = roleOf(v);
      return role && v.value < READING_FLOOR[role.role] ? [`${where(v)} is under the ${role.role} floor of ${READING_FLOOR[role.role]}px`] : [];
    });
    expect(under).toEqual([]);
  });

  it("leaves no declared role without text under the body floor", () => {
    const covered = new Set(small.map((v) => roleOf(v)).filter((r) => r !== null).map((r) => r!.key));
    const stale: string[] = [];
    for (const [file, roles] of Object.entries(TEXT_ROLES)) {
      for (const key of Object.keys(roles)) {
        if (!small.some((v) => v.file === file && covered.has(key) && roleOf(v)?.key === key)) stale.push(`${file} ${key}`);
      }
    }
    expect(stale).toEqual([]);
  });
});
