import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { type ComponentProps, type ReactNode, StrictMode, forwardRef, useContext } from "react";
import { act, render, cleanup, screen, fireEvent, waitFor } from "@testing-library/react";
import { AccessibilityInfo, Animated, StyleSheet, Text, TextInput, type View } from "react-native";
import { Entrance, entranceTranslation, type EntranceProps } from "../src/style/entrance.tsx";
import { EntranceReadinessContext } from "../src/style/entrance-readiness.ts";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutElement } from "./entrance-layout.ts";

// These tests render the actual component through RNW and deliver native layout
// events explicitly. Native material pixels and hit testing have a separate device
// acceptance check; the optional glass peers are stubs in this harness.
afterEach(cleanup);

type HostProps = ComponentProps<typeof Animated.View>;
type Completion = Parameters<Animated.CompositeAnimation["start"]>[0];
type SpringRun = {
  value: Animated.Value;
  configuration: Animated.SpringAnimationConfig;
  stopped: boolean;
  completion?: Completion;
};
type VisualStyle = {
  opacity: number;
  transform: [
    { translateX: Animated.AnimatedInterpolation<number> },
    { translateY: Animated.AnimatedInterpolation<number> },
    { scale: Animated.AnimatedInterpolation<number> },
  ];
};

async function withHost(check: (host: {
  props: () => HostProps;
  visual: () => VisualStyle;
  layout: (width: number, height: number) => void;
  motion: (reduced: boolean) => void;
  runs: SpringRun[];
}) => Promise<void> | void, initialReduced = false) {
  let props: HostProps | undefined;
  const OriginalView = Animated.View;
  const originalDescriptor = Object.getOwnPropertyDescriptor(Animated, "View")!;
  const ObservedView = forwardRef<View, HostProps>((next, ref) => {
    props = next;
    return <OriginalView {...next} ref={ref} />;
  });
  Object.defineProperty(Animated, "View", { configurable: true, value: ObservedView });
  const runs: SpringRun[] = [];
  const spring = spyOn(Animated, "spring").mockImplementation((value, configuration) => {
    // Entrance uses a Value, never ValueXY. Keep the real value/derived graph so
    // setValue and its public listeners exercise the rendered transform algebra.
    expect(value).toBeInstanceOf(Animated.Value);
    const run: SpringRun = { value: value as Animated.Value, configuration, stopped: false };
    runs.push(run);
    return {
      start(completion) { run.completion = completion; },
      stop() { run.stopped = true; run.completion?.({ finished: false }); },
      reset() {},
    };
  });
  const motion = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(initialReduced);
  const originalListener = AccessibilityInfo.addEventListener;
  const motionListeners = new Set<(reduced: boolean) => void>();
  const listener = spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event, callback) => {
    if (event !== "reduceMotionChanged") return originalListener(event, callback);
    motionListeners.add(callback);
    return { remove() { motionListeners.delete(callback); } };
  });
  const current = () => {
    if (!props) throw new Error("Entrance has not rendered its Animated.View");
    return props;
  };
  try {
    const checked = check({
      props: current,
      visual: () => StyleSheet.flatten(current().style) as VisualStyle,
      layout: (width, height) => layoutElement(wrapper(), { width, height }),
      motion: reduced => act(() => motionListeners.forEach(notify => notify(reduced))),
      runs,
    });
    if (checked) await checked;
  } finally {
    cleanup();
    listener.mockRestore();
    motion.mockRestore();
    spring.mockRestore();
    Object.defineProperty(Animated, "View", originalDescriptor);
  }
}

function Probe() {
  const ready = useContext(EntranceReadinessContext);
  return <><Text testID="readiness">{ready ? "ready" : "held"}</Text><TextInput accessibilityLabel="Draft" defaultValue="original" /></>;
}
function ui(props: Omit<EntranceProps, "children"> = {}, inherited = true): ReactNode {
  return <ThemeProvider light solid><EntranceReadinessContext.Provider value={inherited}>
    <Entrance {...props}><Probe /></Entrance>
  </EntranceReadinessContext.Provider></ThemeProvider>;
}
const wrapper = () => screen.getByTestId("readiness").parentElement as HTMLElement;
const readiness = () => screen.getByTestId("readiness").textContent;

// Observe the public nodes. Reading private Animated internals would only mirror
// implementation details and would not prove that the real graph propagates.
function observeTransform(style: VisualStyle) {
  const result = { x: NaN, y: NaN, scale: NaN };
  const x = style.transform[0].translateX;
  const y = style.transform[1].translateY;
  const scale = style.transform[2].scale;
  const subscriptions = [
    [x, x.addListener(({ value }) => { result.x = value; })],
    [y, y.addListener(({ value }) => { result.y = value; })],
    [scale, scale.addListener(({ value }) => { result.scale = value; })],
  ] as const;
  return { result, remove() { subscriptions.forEach(([node, id]) => node.removeListener(id)); } };
}

describe("entranceTranslation", () => {
  it("pins either trigger corner and scales with the measured size", () => {
    const top = entranceTranslation({ width: 100, height: 60 }, 0.85);
    expect(top.x).toBeCloseTo(-7.5, 10);
    expect(top.y).toBeCloseTo(-4.5, 10);
    const bottom = entranceTranslation({ width: 200, height: 100 }, 0.9, true);
    expect(bottom.x).toBeCloseTo(-10, 10);
    expect(bottom.y).toBeCloseTo(5, 10);
  });

  it("does not translate a final-size surface", () => {
    const result = entranceTranslation({ width: 320, height: 200 }, 1);
    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });
});

describe("Entrance", () => {
  it("opens a default-ready center without a size event, keeping alpha one", () => withHost(({ props, visual, runs }) => {
    render(ui());
    expect(readiness()).toBe("ready");
    expect(props().pointerEvents).toBe("auto");
    expect(wrapper().getAttribute("aria-hidden")).not.toBe("true");
    expect(visual().opacity).toBe(1);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.configuration).toMatchObject({ toValue: 1, stiffness: 500, damping: 44, mass: 1, useNativeDriver: false });
  }));

  it("holds anchored content outside hit testing and accessibility until finite positive layout", () => withHost(({ props, layout, runs }) => {
    render(ui({ anchor: true }));
    for (const [width, height] of [[0, 60], [-1, 60], [Infinity, 60], [100, NaN], [100, 0]]) {
      layout(width!, height!);
      expect(readiness()).toBe("held");
      expect(wrapper().getAttribute("aria-hidden")).toBe("true");
      expect(props().accessibilityElementsHidden).toBe(true);
      expect(props().importantForAccessibility).toBe("no-hide-descendants");
      expect(props().pointerEvents).toBe("none");
      expect(runs).toHaveLength(0);
    }
    layout(100, 60);
    expect(readiness()).toBe("ready");
    expect(props().pointerEvents).toBe("auto");
    expect(props().accessibilityElementsHidden).toBe(false);
    expect(props().importantForAccessibility).toBe("auto");
    expect(runs).toHaveLength(1);
    expect(runs[0]!.configuration).toMatchObject({ stiffness: 550, damping: 38, mass: 1 });
    layout(0, 60);
    expect(readiness()).toBe("held");
    expect(runs[0]!.stopped).toBe(true);
  }));

  it("preserves corner pinning through progress and overshoot for both anchor directions", () => withHost(({ layout, visual, runs }) => {
    const view = render(ui({ anchor: true }));
    layout(100, 60);
    const observation = observeTransform(visual());
    try {
      for (const bottom of [false, true]) {
        view.rerender(ui({ anchor: true, anchorBottom: bottom }));
        for (const progress of [0, 0.5, 1, 1.05]) {
          act(() => runs[0]!.value.setValue(progress));
          expect(observation.result.scale).toBeCloseTo(0.85 + 0.15 * progress, 10);
          expect(observation.result.x).toBeCloseTo(-7.5 * (1 - progress), 10);
          expect(observation.result.y).toBeCloseTo((bottom ? 4.5 : -4.5) * (1 - progress), 10);
        }
      }
      expect(runs).toHaveLength(1);
    } finally { observation.remove(); }
  }));

  it("closes the gate before reset and changed coefficients, retaining host, graph and input on rehold", () => withHost(({ layout, visual, runs }) => {
    const view = render(ui({ anchor: true, ready: false }));
    layout(100, 60);
    expect(runs).toHaveLength(0);
    view.rerender(ui({ anchor: true }));
    const host = wrapper();
    const input = screen.getByLabelText("Draft") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "retained draft" } });
    const transform = visual().transform;
    const first = runs[0]!;
    const heldTransform = observeTransform(visual());
    const events: Array<{ kind: "set" | "stop"; node: Animated.Value; value?: number }> = [];
    const originalSet = Animated.Value.prototype.setValue;
    const originalStop = Animated.Value.prototype.stopAnimation;
    const set = spyOn(Animated.Value.prototype, "setValue").mockImplementation(function (this: Animated.Value, value) {
      events.push({ kind: "set", node: this, value });
      return originalSet.call(this, value);
    });
    const stop = spyOn(Animated.Value.prototype, "stopAnimation").mockImplementation(function (this: Animated.Value, callback) {
      events.push({ kind: "stop", node: this });
      return originalStop.call(this, callback);
    });
    try {
      view.rerender(ui({ anchor: true, ready: false, anchorBottom: true }));
      expect(events[0]?.kind).toBe("set");
      expect(events[0]?.value).toBe(0);
      expect(events[0]?.node).not.toBe(first.value);
      const reset = events.findIndex(event => event.kind === "set" && event.node === first.value);
      expect(reset).toBeGreaterThan(events.findIndex(event => event.kind === "stop" && event.node === first.value));
      expect(events.findIndex(event => event.kind === "set" && event.value !== undefined && Math.abs(event.value - 4.5) < 1e-10)).toBeGreaterThan(reset);
      expect(first.stopped).toBe(true);
      expect(readiness()).toBe("held");
      expect(heldTransform.result.scale).toBe(0);
      layout(320, 220);
      expect(heldTransform.result.scale).toBe(0);
      expect(runs).toHaveLength(1);
      view.rerender(ui({ anchor: true, anchorBottom: true }));
      expect(runs).toHaveLength(2);
      expect(wrapper()).toBe(host);
      expect(screen.getByLabelText("Draft")).toBe(input);
      expect(input.value).toBe("retained draft");
      expect(visual().transform).toBe(transform);
      expect(runs[1]!.value).toBe(first.value);
      const observation = observeTransform(visual());
      try {
        act(() => runs[1]!.value.setValue(0));
        expect(observation.result.x).toBeCloseTo(-24, 10);
        expect(observation.result.y).toBeCloseTo(16.5, 10);
      } finally { observation.remove(); }
    } finally { heldTransform.remove(); set.mockRestore(); stop.mockRestore(); }
  }));

  it("keeps the graph and spring on ordinary rerenders and visible size changes", () => withHost(({ layout, visual, runs }) => {
    const view = render(ui({ anchor: true }));
    layout(100, 60);
    const host = wrapper();
    const transform = visual().transform;
    view.rerender(ui({ anchor: true, style: { width: 320 } }));
    layout(320, 220);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.stopped).toBe(false);
    expect(wrapper()).toBe(host);
    expect(visual().transform).toBe(transform);
    expect(visual().opacity).toBe(1);
  }));

  it("reveals a measured reduced-motion surface at final size with no spring", () => withHost(async ({ layout, visual, runs }) => {
    await act(async () => { render(ui({ anchor: true })); });
    const observation = observeTransform(visual());
    try {
      layout(100, 60);
      expect(runs).toHaveLength(0);
      expect(readiness()).toBe("ready");
      expect(observation.result.x).toBeCloseTo(0, 10);
      expect(observation.result.y).toBeCloseTo(0, 10);
      expect(observation.result.scale).toBe(1);
      await waitFor(() => expect(wrapper().style.transform).toContain("scale(1)"));
    } finally { observation.remove(); }
  }, true));

  it("stops an active spring when reduced motion changes without replaying when it changes back", () => withHost(async ({ motion, visual, runs }) => {
    await act(async () => { render(ui()); });
    const transform = visual().transform;
    const observation = observeTransform(visual());
    try {
      motion(true);
      expect(runs[0]!.stopped).toBe(true);
      expect(observation.result.scale).toBe(1);
      motion(false);
      expect(runs).toHaveLength(1);
      expect(visual().transform).toBe(transform);
    } finally { observation.remove(); }
  }));

  it("aggregates inherited focus readiness without holding its own animation", () => withHost(({ runs }) => {
    const view = render(ui({}, false));
    expect(readiness()).toBe("held");
    expect(wrapper().getAttribute("aria-hidden")).not.toBe("true");
    expect(runs).toHaveLength(1);
    view.rerender(ui());
    expect(readiness()).toBe("ready");
    expect(runs).toHaveLength(1);
  }));

  it("restarts after StrictMode effect cleanup on the retained host", () => withHost(({ runs }) => {
    const view = render(<StrictMode>{ui()}</StrictMode>);
    expect(readiness()).toBe("ready");
    expect(runs).toHaveLength(2);
    expect(runs[0]!.stopped).toBe(true);
    expect(runs[1]!.stopped).toBe(false);
    expect(runs[1]!.value).toBe(runs[0]!.value);
    const host = wrapper();
    view.rerender(<StrictMode>{ui({ style: { width: 320 } })}</StrictMode>);
    expect(wrapper()).toBe(host);
    expect(runs).toHaveLength(2);
    view.unmount();
    expect(runs[1]!.stopped).toBe(true);
  }));

  it("ignores a canceled spring completion so cleanup still stops the new run", () => withHost(({ runs }) => {
    const view = render(ui());
    const staleCompletion = runs[0]!.completion;
    view.rerender(ui({ ready: false }));
    view.rerender(ui());
    expect(runs).toHaveLength(2);
    act(() => staleCompletion?.({ finished: true }));
    view.unmount();
    expect(runs[1]!.stopped).toBe(true);
  }));
});
