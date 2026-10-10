import { describe, expect, it } from "bun:test";
import { axis, MEASURE, pick } from "../src/style/axis.ts";
import { stepOf } from "../src/style/sizing.ts";
import { widths } from "../src/style/tokens.ts";

// Axis precedence, as data. A component resolves each axis of its semantic booleans to one
// member when a call site passes several (CLAUDE.md, "Semantic prop styling", Conflicts).
// src/style/axis.ts declares an axis as an ordered list and `pick` resolves it, the way
// `stepOf` has always read the measure axis from the width scale's declaration order.

describe("the axis primitive", () => {
  it("declares members in precedence order, resolving to themselves", () => {
    const size = axis(["small", "large"], "base");
    expect(size.members).toEqual(["small", "large"]);
    expect(size.values).toEqual({ small: "small", large: "large" });
    expect(size.fallback).toBe("base");
    expect(Object.isFrozen(size) && Object.isFrozen(size.members) && Object.isFrozen(size.values)).toBe(true);
  });

  it("declares valued members in the record's key order, the way `widths` declares the measure", () => {
    const size = axis({ small: 96, large: 200 }, 140);
    expect(size.members).toEqual(["small", "large"]);
    expect(size.values).toEqual({ small: 96, large: 200 });
    expect(size.fallback).toBe(140);
  });

  it("falls back to null when no fallback is given", () => {
    expect(axis(["padLoose", "pad", "padTight"]).fallback).toBeNull();
    expect(axis({ chart1: "chart-1" }).fallback).toBeNull();
  });

  it("picks the highest-precedence member the props set, whatever order they are passed in", () => {
    const size = axis(["small", "large"], "base");
    type Props = { small?: boolean; large?: boolean };
    expect(pick(size, {} as Props)).toBe("base");
    expect(pick(size, { large: true } as Props)).toBe("large");
    expect(pick(size, { small: true, large: true } as Props)).toBe("small");
    expect(pick(size, { large: true, small: true } as Props)).toBe("small");
  });

  it("reads a member as set when its prop is truthy, as an `if` does", () => {
    const tone = axis({ destructive: "error", error: "error", warning: "warning" }, "neutral");
    type Props = { destructive?: boolean; error?: boolean; warning?: boolean };
    expect(pick(tone, { destructive: false, warning: true } as Props)).toBe("warning");
    expect(pick(tone, { destructive: undefined, error: true } as Props)).toBe("error");
    expect(pick(tone, { error: true, warning: true } as Props)).toBe("error");
  });
});

describe("the measure axis", () => {
  it("is the width scale's steps in their declaration order, narrowest first", () => {
    expect(MEASURE.members).toEqual(Object.keys(widths));
    const caps = MEASURE.members.map((step) => widths[step]);
    expect(caps).toEqual([...caps].sort((a, b) => a - b));
    expect(MEASURE.fallback).toBeNull();
  });

  it("picks the step stepOf picks, for every step and every pair", () => {
    for (const a of MEASURE.members) {
      expect(stepOf({ [a]: true })).toBe(pick(MEASURE, { [a]: true }));
      for (const b of MEASURE.members) expect(stepOf({ [a]: true, [b]: true })).toBe(pick(MEASURE, { [a]: true, [b]: true }));
    }
    expect(stepOf({ start: true })).toBeNull();
  });
});
