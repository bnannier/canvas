import { describe, expect, it } from "bun:test";
import type { AuditLook } from "../docs/src/audit/protocol.ts";
import { LINK_PALETTES } from "../docs/src/theme/theme-links.ts";
import { PALETTES, type Palette } from "../src/style/tokens.ts";

// The audit protocol (docs/src/audit/protocol.ts) and the docs' theme links
// (docs/src/theme/theme-links.ts) spell the palettes out, so the capture host, the preview
// opener and the unit tests import them with no kit build. This holds both spellings to the
// kit's own `Palette`, at compile time and at run time.

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const same: Same<AuditLook["palette"], Palette> = true;

describe("the audit protocol's palette", () => {
  it("is the kit's Palette", () => {
    expect(same).toBe(true);
    const spelled: Record<AuditLook["palette"], true> = { violet: true, cyan: true, mint: true, rose: true, amber: true };
    expect(Object.keys(spelled).sort()).toEqual([...PALETTES].sort());
  });

  it("is the theme links' palette list, in the kit's order", () => {
    const linked: Same<(typeof LINK_PALETTES)[number], Palette> = true;
    expect(linked).toBe(true);
    expect([...LINK_PALETTES]).toEqual([...PALETTES]);
  });
});
