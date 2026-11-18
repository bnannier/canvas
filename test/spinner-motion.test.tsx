import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { AccessibilityInfo, Animated } from "react-native";
import { Spinner } from "../src/atoms/spinner/spinner.tsx";
import { Spinner as IOSSpinner } from "../src/atoms/spinner/spinner.ios.tsx";
import { Spinner as AndroidSpinner } from "../src/atoms/spinner/spinner.android.tsx";
import { SpinnerAnimationContext } from "../src/atoms/spinner/spinner.shared.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

function ring(name: string): HTMLElement {
  return screen.getByRole("progressbar", { name }).firstElementChild!.firstElementChild as HTMLElement;
}

describe("Spinner motion ownership", () => {
  it("pauses only the decorative web ring, leaves it visible, and resumes it", () => {
    const tree = (enabled: boolean) => <ThemeProvider solid>
      <Spinner accessibilityLabel="Application loading" />
      <SpinnerAnimationContext.Provider value={enabled}>
        <Spinner accessibilityLabel="Specimen loading" />
      </SpinnerAnimationContext.Provider>
    </ThemeProvider>;
    const view = render(tree(true));
    expect(ring("Application loading").className).toMatch(/animationKeyframes/);
    expect(ring("Specimen loading").className).toMatch(/animationKeyframes/);
    view.rerender(tree(false));
    expect(ring("Application loading").className).toMatch(/animationKeyframes/);
    expect(ring("Specimen loading").className).not.toMatch(/animationKeyframes/);
    const frozen = ring("Specimen loading").style.transform;
    expect(frozen).toMatch(/rotate\(/);
    expect(ring("Specimen loading").style.width).toBe("20px");
    view.rerender(tree(false));
    expect(ring("Specimen loading").style.transform).toBe(frozen);
    view.rerender(tree(true));
    expect(ring("Specimen loading").className).toMatch(/animationKeyframes/);
  });

  for (const [platform, NativeSpinner] of [["iOS", IOSSpinner], ["Android", AndroidSpinner]] as const) {
    it(`${platform}: starts normally and stops/resumes with internal participation`, () => {
      let starts = 0;
      let stops = 0;
      const loop = spyOn(Animated, "loop").mockImplementation(() => ({
        start: () => { starts++; }, stop: () => { stops++; }, reset: () => {},
      }));
      try {
        const tree = (enabled: boolean) => <ThemeProvider solid>
          <SpinnerAnimationContext.Provider value={enabled}><NativeSpinner /></SpinnerAnimationContext.Provider>
        </ThemeProvider>;
        const view = render(tree(true));
        expect(starts).toBe(1);
        view.rerender(tree(false));
        expect(stops).toBe(1);
        expect(screen.getByRole("progressbar", { name: "Loading" })).not.toBeNull();
        view.rerender(tree(true));
        expect(starts).toBe(2);
        view.unmount();
        expect(stops).toBe(2);
      } finally {
        cleanup();
        loop.mockRestore();
      }
    });
  }

  it("honors initial and live Reduced Motion on every skin while preserving visible indicators", async () => {
    let starts = 0;
    let stops = 0;
    let changeMotion: (enabled: boolean) => void = () => {};
    const loop = spyOn(Animated, "loop").mockImplementation(() => ({
      start: () => { starts++; }, stop: () => { stops++; }, reset: () => {},
    }));
    const read = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    const original = AccessibilityInfo.addEventListener;
    const events = spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event, handler) => {
      if (event !== "reduceMotionChanged") return original(event, handler);
      changeMotion = handler as (enabled: boolean) => void;
      return { remove: () => {} };
    });
    try {
      render(<ThemeProvider solid>
        <Spinner accessibilityLabel="Web loading" />
        <IOSSpinner accessibilityLabel="iOS loading" />
        <AndroidSpinner accessibilityLabel="Android loading" />
      </ThemeProvider>);
      await waitFor(() => expect(ring("Web loading").className).not.toMatch(/animationKeyframes/));
      expect(starts - stops).toBe(0);
      expect(screen.getAllByRole("progressbar")).toHaveLength(3);
      const beforeResume = starts;
      act(() => changeMotion(false));
      expect(starts).toBe(beforeResume + 2);
      expect(ring("Web loading").className).toMatch(/animationKeyframes/);
      act(() => changeMotion(true));
      expect(starts - stops).toBe(0);
      expect(ring("Web loading").className).not.toMatch(/animationKeyframes/);
      expect(screen.getAllByRole("progressbar")).toHaveLength(3);
    } finally {
      cleanup();
      events.mockRestore();
      read.mockRestore();
      loop.mockRestore();
    }
  });
});
