import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { AccessibilityInfo, Platform, Text } from "react-native";
import { useIncreasedContrast, useReducedTransparency } from "../src/style/a11y-preferences.ts";
import { useReducedMotion } from "../src/style/motion.ts";

afterEach(cleanup);

function deferred() {
  let resolve!: (value: boolean) => void;
  const promise = new Promise<boolean>((settle) => { resolve = settle; });
  return { promise, resolve };
}

// These probes exercise preference hooks directly, without a ThemeProvider that
// would itself subscribe to transparency/contrast and add unrelated native reads.
function Probe({ usePreference, id = "preference" }: { usePreference: () => boolean; id?: string }) {
  return <Text testID={id}>{usePreference() ? "on" : "off"}</Text>;
}

const cases = [
  { name: "reduced motion", hook: useReducedMotion, query: "isReduceMotionEnabled", events: ["reduceMotionChanged"], os: "web" },
  { name: "reduced transparency", hook: useReducedTransparency, query: "isReduceTransparencyEnabled", events: ["reduceTransparencyChanged"], os: "ios" },
  { name: "iOS increased contrast", hook: useIncreasedContrast, query: "isDarkerSystemColorsEnabled", events: ["darkerSystemColorsChanged", "highTextContrastChanged"], os: "ios" },
  { name: "Android increased contrast", hook: useIncreasedContrast, query: "isHighTextContrastEnabled", events: ["darkerSystemColorsChanged", "highTextContrastChanged"], os: "android" },
] as const;

function nativePreferences(testCase: typeof cases[number]) {
  const ai = AccessibilityInfo as unknown as Record<string, unknown>;
  const originalQuery = Object.getOwnPropertyDescriptor(ai, testCase.query);
  const originalOS = Object.getOwnPropertyDescriptor(Platform, "OS")!;
  const reads: ReturnType<typeof deferred>[] = [];
  const handlers = new Map<string, (value: boolean) => void>();
  const removers: ReturnType<typeof mock>[] = [];
  Object.defineProperty(Platform, "OS", { configurable: true, value: testCase.os });
  Object.defineProperty(ai, testCase.query, {
    configurable: true,
    value: () => {
      const read = deferred();
      reads.push(read);
      return read.promise;
    },
  });
  const add = spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event, callback) => {
    handlers.set(event, callback as (value: boolean) => void);
    const remove = mock(() => { handlers.delete(event); });
    removers.push(remove);
    return { remove };
  });
  return {
    reads,
    removers,
    add,
    fire(value: boolean, event: string = testCase.events[0]) {
      act(() => { handlers.get(event)?.(value); });
    },
    async settle(index: number, value: boolean) {
      await act(async () => { reads[index].resolve(value); });
    },
    restore() {
      // Unsubscribe while the mock is still installed and reset the shared motion
      // store before the next test mounts a consumer.
      cleanup();
      add.mockRestore();
      if (originalQuery) Object.defineProperty(ai, testCase.query, originalQuery);
      else delete ai[testCase.query];
      Object.defineProperty(Platform, "OS", originalOS);
    },
  };
}

for (const testCase of cases) {
  describe(`${testCase.name} preference races`, () => {
    it("keeps a live event when the initial query resolves later", async () => {
      const native = nativePreferences(testCase);
      try {
        render(<Probe usePreference={testCase.hook} />);
        expect(screen.getByTestId("preference").textContent).toBe("off");
        native.fire(true);
        expect(screen.getByTestId("preference").textContent).toBe("on");
        await native.settle(0, false);
        expect(screen.getByTestId("preference").textContent).toBe("on");
        // Both native contrast events must invalidate the read and stay live.
        native.fire(false, testCase.events[testCase.events.length - 1]);
        expect(screen.getByTestId("preference").textContent).toBe("off");
      } finally {
        native.restore();
      }
    });

    it("invalidates the initial query even when an event repeats the current value", async () => {
      const native = nativePreferences(testCase);
      try {
        render(<Probe usePreference={testCase.hook} />);
        native.fire(false, testCase.events[testCase.events.length - 1]);
        await native.settle(0, true);
        expect(screen.getByTestId("preference").textContent).toBe("off");
      } finally {
        native.restore();
      }
    });

    it("removes its listeners and ignores an old query after remount", async () => {
      const native = nativePreferences(testCase);
      try {
        const first = render(<Probe usePreference={testCase.hook} />);
        first.unmount();
        expect(native.removers).toHaveLength(testCase.events.length);
        for (const remove of native.removers) expect(remove).toHaveBeenCalledTimes(1);

        const second = render(<Probe usePreference={testCase.hook} />);
        await native.settle(0, true);
        expect(screen.getByTestId("preference").textContent).toBe("off");
        await native.settle(1, true);
        expect(screen.getByTestId("preference").textContent).toBe("on");
        second.unmount();
        expect(native.removers).toHaveLength(testCase.events.length * 2);
        for (const remove of native.removers) expect(remove).toHaveBeenCalledTimes(1);
      } finally {
        native.restore();
      }
    });
  });
}

it("shares motion events and invalidates pending reads for all consumers until the last unmount", async () => {
  const native = nativePreferences(cases[0]);
  try {
    const first = render(<Probe id="first" usePreference={useReducedMotion} />);
    const second = render(<Probe id="second" usePreference={useReducedMotion} />);
    expect(native.reads).toHaveLength(2);
    expect(native.add).toHaveBeenCalledTimes(1);
    native.fire(true);
    await native.settle(0, false);
    expect(screen.getByTestId("first").textContent).toBe("on");
    expect(screen.getByTestId("second").textContent).toBe("on");

    first.unmount();
    expect(native.removers[0]).not.toHaveBeenCalled();
    native.fire(false);
    await native.settle(1, true);
    expect(screen.getByTestId("second").textContent).toBe("off");
    second.unmount();
    expect(native.removers[0]).toHaveBeenCalledTimes(1);
  } finally {
    native.restore();
  }
});
