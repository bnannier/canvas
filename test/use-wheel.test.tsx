import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { View } from "react-native";
import { normalizeWheelDelta, useWheel, type WheelGesture } from "../src/style/use-wheel.ts";

// useWheel binds a NON-PASSIVE wheel listener, which is the whole reason it is not
// just an onWheel prop: React registers its root wheel listener as passive, so a
// prop handler's preventDefault() is ignored and the page scrolls under the map.
//
// happy-dom cannot falsify the passive/non-passive difference (it reports
// defaultPrevented for both paths), so what is asserted here is the contract this
// hook owns: the unit normalization, the node-relative coordinates, and that the
// page's scroll is claimed only for a gesture the handler said it acted on.

afterEach(cleanup);

const BOX = { x: 0, y: 0, width: 200, height: 100, top: 40, left: 30, right: 230, bottom: 140, toJSON: () => ({}) };

/** happy-dom's WheelEvent honours deltaY/deltaMode from its init dict but drops the
 *  MouseEvent half (clientX/clientY/ctrlKey), so those are set on the instance. */
function wheelEvent(init: { deltaY: number; deltaMode?: number; clientX?: number; clientY?: number; ctrlKey?: boolean }) {
  const event = new WheelEvent("wheel", {
    deltaY: init.deltaY,
    deltaMode: init.deltaMode ?? 0,
    cancelable: true,
    bubbles: true,
  });
  for (const [key, value] of [["clientX", init.clientX], ["clientY", init.clientY], ["ctrlKey", init.ctrlKey]] as const) {
    if (value !== undefined) Object.defineProperty(event, key, { value, configurable: true });
  }
  return event;
}

function Probe({ active, onWheel }: { active: boolean; onWheel: (g: WheelGesture) => boolean }) {
  const ref = useWheel(active, onWheel);
  return <View ref={ref} testID="probe" />;
}

function mount(active: boolean, onWheel: (g: WheelGesture) => boolean) {
  render(<Probe active={active} onWheel={onWheel} />);
  const node = screen.getByTestId("probe");
  // happy-dom lays nothing out, so the hook's own zero-size guard would bail;
  // give the node a real box, as a browser would.
  node.getBoundingClientRect = () => BOX as DOMRect;
  return node;
}

describe("normalizeWheelDelta (pure)", () => {
  it("passes pixel-mode travel straight through", () => {
    expect(normalizeWheelDelta(120, 0)).toBe(120);
    expect(normalizeWheelDelta(-53, 0)).toBe(-53);
  });

  it("reads Firefox's line mode and a page mode at a comparable rate", () => {
    // Without this a Firefox user zooms ~16x slower than a Chrome user per notch.
    expect(normalizeWheelDelta(3, 1)).toBeGreaterThan(normalizeWheelDelta(3, 0));
    expect(normalizeWheelDelta(1, 2)).toBeGreaterThan(normalizeWheelDelta(1, 1));
    expect(Math.sign(normalizeWheelDelta(-3, 1))).toBe(-1);
  });

  it("treats a malformed delta as no travel rather than propagating NaN", () => {
    expect(normalizeWheelDelta(NaN, 0)).toBe(0);
    expect(normalizeWheelDelta(Infinity, 1)).toBe(0);
  });
});

describe("useWheel", () => {
  it("reports the pointer relative to its OWN node, not the event target", () => {
    // offsetX would be measured against whatever was hit, which for the map is the
    // hit-layer Pressable, not the plot.
    let seen: WheelGesture | undefined;
    const node = mount(true, (g) => {
      seen = g;
      return true;
    });
    fireEvent(node, wheelEvent({ deltaY: 100, clientX: 130, clientY: 90 }));
    expect(seen).toBeDefined();
    expect(seen!.x).toBe(100); // 130 - left 30
    expect(seen!.y).toBe(50); //  90 - top 40
    expect(seen!.deltaY).toBe(100);
  });

  it("flags a trackpad pinch, which every browser sends as ctrl+wheel", () => {
    let seen: WheelGesture | undefined;
    const node = mount(true, (g) => {
      seen = g;
      return true;
    });
    fireEvent(node, wheelEvent({ deltaY: -20, clientX: 100, clientY: 60, ctrlKey: true }));
    expect(seen!.pinch).toBe(true);
  });

  it("claims the page's scroll only for a gesture the handler acted on", () => {
    // A map already at its limit must hand the very next notch back to the page.
    const node = mount(true, (g) => g.deltaY < 0);
    const zoomedIn = wheelEvent({ deltaY: -100, clientX: 100, clientY: 60 });
    fireEvent(node, zoomedIn);
    expect(zoomedIn.defaultPrevented).toBe(true);

    const refused = wheelEvent({ deltaY: 100, clientX: 100, clientY: 60 });
    fireEvent(node, refused);
    expect(refused.defaultPrevented).toBe(false);
  });

  it("does not subscribe at all while inactive, so a non-zoomable chart is untouched", () => {
    let calls = 0;
    const node = mount(false, () => {
      calls += 1;
      return true;
    });
    fireEvent(node, wheelEvent({ deltaY: 100, clientX: 100, clientY: 60 }));
    expect(calls).toBe(0);
  });

  it("anchors at the node's centre when the event carries no pointer position", () => {
    let seen: WheelGesture | undefined;
    const node = mount(true, (g) => {
      seen = g;
      return true;
    });
    fireEvent(node, wheelEvent({ deltaY: 100 }));
    expect(seen!.x).toBe(BOX.width / 2);
    expect(seen!.y).toBe(BOX.height / 2);
  });

  it("ignores a gesture on a node the browser has not laid out yet", () => {
    let calls = 0;
    render(
      <Probe
        active
        onWheel={() => {
          calls += 1;
          return true;
        }}
      />,
    );
    // No getBoundingClientRect override: happy-dom reports a zero box, exactly as a
    // browser does before layout, and there is nothing to anchor a zoom to.
    fireEvent(screen.getByTestId("probe"), wheelEvent({ deltaY: 100, clientX: 10, clientY: 10 }));
    expect(calls).toBe(0);
  });
});
