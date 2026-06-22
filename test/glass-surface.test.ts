import { describe, it, expect } from "bun:test";
import { splitSurfaceStyle, MATERIAL_FILL, GLASS_INTENSITY } from "../src/style/glass-surface/glass-surface.shared.tsx";

describe("splitSurfaceStyle", () => {
  it("strips backgroundColor so the material supplies the fill", () => {
    const { outer, clip } = splitSurfaceStyle({ backgroundColor: "#ffffff", borderRadius: 12, width: 100 });
    expect(outer.backgroundColor).toBeUndefined();
    expect(clip.backgroundColor).toBeUndefined();
  });

  it("routes sizing/position to the outer box and clips the inner", () => {
    const { outer, clip } = splitSurfaceStyle({ width: 100, height: 50, margin: 8, borderRadius: 12 });
    expect(outer.width).toBe(100);
    expect(outer.height).toBe(50);
    expect(outer.margin).toBe(8);
    expect(clip.overflow).toBe("hidden");
    expect(clip.flex).toBe(1);
  });

  it("duplicates the radius onto both boxes so the drop shadow is rounded too", () => {
    const { outer, clip } = splitSurfaceStyle({ borderRadius: 16 });
    expect(outer.borderRadius).toBe(16);
    expect(clip.borderRadius).toBe(16);
  });

  it("keeps non-sizing skin styles (padding, border) on the clip box", () => {
    const { clip } = splitSurfaceStyle({ padding: 12, borderWidth: 1 });
    expect(clip.padding).toBe(12);
    expect(clip.borderWidth).toBe(1);
  });
});

describe("material constants", () => {
  it("MATERIAL_FILL is an absolute-fill, non-interactive layer", () => {
    expect(MATERIAL_FILL.position).toBe("absolute");
    expect(MATERIAL_FILL.top).toBe(0);
    expect(MATERIAL_FILL.left).toBe(0);
    expect(MATERIAL_FILL.right).toBe(0);
    expect(MATERIAL_FILL.bottom).toBe(0);
    expect(MATERIAL_FILL.pointerEvents).toBe("none");
  });

  it("GLASS_INTENSITY is a sane blur intensity", () => {
    expect(typeof GLASS_INTENSITY).toBe("number");
    expect(GLASS_INTENSITY).toBeGreaterThan(0);
    expect(GLASS_INTENSITY).toBeLessThanOrEqual(100);
  });
});
