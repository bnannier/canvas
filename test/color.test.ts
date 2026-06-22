import { describe, it, expect } from "bun:test";
import { alpha } from "../src/style/color.ts";

describe("alpha", () => {
  it("converts a 6-digit hex to rgba with the given alpha", () => {
    expect(alpha("#4f46e5", 0.1)).toBe("rgba(79, 70, 229, 0.1)");
    expect(alpha("#000000", 0.5)).toBe("rgba(0, 0, 0, 0.5)");
    expect(alpha("#ffffff", 0)).toBe("rgba(255, 255, 255, 0)");
  });

  it("expands a 3-digit hex before converting", () => {
    expect(alpha("#fff", 1)).toBe("rgba(255, 255, 255, 1)");
    expect(alpha("#f00", 0.25)).toBe("rgba(255, 0, 0, 0.25)");
  });

  it("returns non-hex values unchanged (already-translucent tokens, transparent)", () => {
    expect(alpha("transparent", 0.5)).toBe("transparent");
    expect(alpha("rgba(0, 0, 0, 0.2)", 0.5)).toBe("rgba(0, 0, 0, 0.2)");
    expect(alpha("hsl(0 0% 0%)", 0.5)).toBe("hsl(0 0% 0%)");
  });
});
