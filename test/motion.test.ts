import { describe, it, expect } from "bun:test";
import { supportsNativeDriver } from "../src/style/motion.ts";

describe("supportsNativeDriver", () => {
  it("is a boolean gate (RNW can't run the native driver; native can)", () => {
    expect(typeof supportsNativeDriver).toBe("boolean");
  });
});
