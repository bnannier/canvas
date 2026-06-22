import { describe, it, expect } from "bun:test";
import { liquidGlassAvailable } from "../src/style/glass-surface/liquid-glass.ts";

describe("liquidGlassAvailable", () => {
  it("is false off iOS (web/Android/test resolve the base module)", () => {
    // The base module (no .ios suffix) always reports false; only iOS 26+ overrides it.
    expect(liquidGlassAvailable()).toBe(false);
  });
});
