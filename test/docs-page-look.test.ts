import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pageColor, shellTier } from "../docs/src/shell/page-look.ts";
import { PALETTES, colorsFor } from "../src/style/tokens.ts";

// The docs' page (docs/src/shell/page-look.ts) is the v4 hand-off's flat page: the scheme's
// `background`, whatever the palette, held to the hand-off's own `--bg` (tools/v4/handoff).

const HANDOFF = join(import.meta.dir, "../tools/v4/handoff");

/** The hand-off's `--bg` values, as its pages declare them. */
function handoffBackgrounds(): Set<string> {
  const found = new Set<string>();
  for (const file of readdirSync(HANDOFF)) {
    if (!/\.(html|js|css)$/.test(file)) continue;
    for (const m of readFileSync(join(HANDOFF, file), "utf8").matchAll(/--bg:\s*(#[0-9a-fA-F]{6})/g)) found.add(m[1]!.toLowerCase());
  }
  return found;
}

describe("the docs page look", () => {
  it("paints the scheme's background in every palette", () => {
    for (const scheme of ["light", "dark"] as const) {
      const page = pageColor(colorsFor("violet", scheme));
      for (const palette of PALETTES) {
        const tokens = colorsFor(palette, scheme);
        expect(pageColor(tokens), `${palette} ${scheme}`).toBe(tokens.background);
        expect(pageColor(tokens), `${palette} ${scheme}`).toBe(page);
      }
    }
  });

  it("is the hand-off's own page colour in both schemes", () => {
    expect([...handoffBackgrounds()].sort()).toEqual([pageColor(colorsFor("violet", "dark")), pageColor(colorsFor("violet", "light"))].map((c) => c.toLowerCase()).sort());
  });

  it("tiers the shell at Canvas's form factors", () => {
    expect(shellTier(390)).toBe("phone");
    expect(shellTier(640)).toBe("phone");
    expect(shellTier(641)).toBe("tablet");
    expect(shellTier(1024)).toBe("tablet");
    expect(shellTier(1025)).toBe("desktop");
  });
});
