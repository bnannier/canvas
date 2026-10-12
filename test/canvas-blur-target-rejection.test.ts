import { describe, expect, it } from "bun:test";
import { forCurrentTarget } from "../packages/canvas-blur/src/target-rejection.ts";
import type { TargetRejectedEvent } from "../packages/canvas-blur/src/index.tsx";

// @nannier/canvas-blur's FrostView forwards a refusal only for the host it names now:
// the native event can arrive after the target ref has moved to another host, and a
// stale report must not make Canvas's bridge withdraw a plane nobody refused.

const refusal = (targetId: number): TargetRejectedEvent => ({ nativeEvent: { targetId, reason: "ancestor" } });

describe("canvas-blur's refusal filter", () => {
  it("forwards a refusal of the host the frost names", () => {
    const seen: TargetRejectedEvent[] = [];
    forCurrentTarget(7, (event) => seen.push(event))?.(refusal(7));
    expect(seen).toEqual([refusal(7)]);
  });

  it("drops a refusal of a host the frost no longer names", () => {
    const seen: TargetRejectedEvent[] = [];
    const forward = forCurrentTarget(8, (event) => seen.push(event));
    forward?.(refusal(7));
    expect(seen).toEqual([]);
  });

  it("drops every refusal while the frost names no host", () => {
    const seen: TargetRejectedEvent[] = [];
    forCurrentTarget(null, (event) => seen.push(event))?.(refusal(7));
    expect(seen).toEqual([]);
  });

  it("gives the native view no handler when the app passed none", () => {
    expect(forCurrentTarget(7)).toBeUndefined();
  });
});
