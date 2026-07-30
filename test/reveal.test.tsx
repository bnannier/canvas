import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { AccessibilityInfo, Animated, Text, View } from "react-native";
import { isRectInView, inViewTickerActive } from "../src/style/in-view.ts";
import { revealTravel, revealDelay } from "../src/atoms/reveal/reveal.shared.tsx";
import { Reveal } from "../src/atoms/reveal/reveal.tsx";
import { RevealGroup } from "../src/atoms/reveal/reveal-group.tsx";

// Reveal plays a one-shot content entrance when the element reaches the viewport.
// Three things carry the weight and are tested here directly: the in-view predicate
// (pure), the travel/stagger maths (pure), and the wiring between them (does an
// element below the fold stay put, does it fire once it scrolls up, does Reduce Motion
// skip the whole mechanism, and does RevealGroup hand out increasing ordinals without
// introducing a layout box).
//
// The harness renders through react-native-web, whose measureInWindow reads
// getBoundingClientRect, so a stubbed rect is exactly how a scroll position is
// simulated. The test viewport is happy-dom's stubbed 1280x800 (see test/setup.ts), so
// the window height every assertion below reasons against is 800.

afterEach(cleanup);

const WINDOW = 800;

/** Stub every element's window rect, i.e. put the whole tree at a scroll position. */
function stubRect(top: number) {
  return spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    left: 0,
    right: 300,
    bottom: top + 100,
    width: 300,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

/** A no-op Animated composite, so a spied timing can be asserted without running. */
function stubAnimation() {
  return { start: () => {}, stop: () => {}, reset: () => {} } as unknown as Animated.CompositeAnimation;
}

describe("isRectInView", () => {
  it("is false while the element sits below the trigger line", () => {
    // Top at 900 in an 800-tall window: entirely below the fold.
    expect(isRectInView({ y: 900, width: 300, height: 100 }, WINDOW, 48)).toBe(false);
  });

  it("is true once the top edge crosses the line", () => {
    // The line sits at 800 - 48 = 752.
    expect(isRectInView({ y: 753, width: 300, height: 100 }, WINDOW, 48)).toBe(false);
    expect(isRectInView({ y: 751, width: 300, height: 100 }, WINDOW, 48)).toBe(true);
  });

  it("is true for an element already scrolled past the top of the window", () => {
    // Landing mid-page (a deep link, a restored scroll) must not strand content above
    // the viewport invisible.
    expect(isRectInView({ y: -400, width: 300, height: 100 }, WINDOW, 48)).toBe(true);
  });

  it("a deeper inset holds the reveal longer", () => {
    // The same rect: past the shallow line (752), short of the deep one (660).
    const rect = { y: 700, width: 300, height: 100 };
    expect(isRectInView(rect, WINDOW, 48)).toBe(true);
    expect(isRectInView(rect, WINDOW, 140)).toBe(false);
  });

  it("clamps an oversized inset to the window instead of moving the line off it", () => {
    // Inset 5000 in an 800 window clamps to 800, putting the line at y = 0.
    expect(isRectInView({ y: 10, width: 300, height: 100 }, WINDOW, 5000)).toBe(false);
    expect(isRectInView({ y: -1, width: 300, height: 100 }, WINDOW, 5000)).toBe(true);
  });

  it("fails open on a zero-by-zero rect (not laid out, so not judgeable)", () => {
    expect(isRectInView({ y: 5000, width: 0, height: 0 }, WINDOW, 48)).toBe(true);
  });

  it("fails open on a missing rect, a non-finite rect, and a dead window", () => {
    expect(isRectInView(null, WINDOW, 48)).toBe(true);
    expect(isRectInView(undefined, WINDOW, 48)).toBe(true);
    expect(isRectInView({ y: Number.NaN, width: 300, height: 100 }, WINDOW, 48)).toBe(true);
    expect(isRectInView({ y: 900, width: 300, height: 100 }, 0, 48)).toBe(true);
    expect(isRectInView({ y: 900, width: 300, height: 100 }, Number.NaN, 48)).toBe(true);
  });

  it("treats a non-finite inset as no inset rather than a NaN comparison", () => {
    expect(isRectInView({ y: 799, width: 300, height: 100 }, WINDOW, Number.NaN)).toBe(true);
    expect(isRectInView({ y: 801, width: 300, height: 100 }, WINDOW, Number.NaN)).toBe(false);
  });
});

describe("revealTravel", () => {
  it("defaults to rising from below when no direction is passed", () => {
    expect(revealTravel({}, 16)).toEqual({ axis: "y", from: 16 });
  });

  it("maps each direction to one signed axis", () => {
    expect(revealTravel({ fromBelow: true }, 16)).toEqual({ axis: "y", from: 16 });
    expect(revealTravel({ fromAbove: true }, 16)).toEqual({ axis: "y", from: -16 });
    expect(revealTravel({ fromLeft: true }, 16)).toEqual({ axis: "x", from: -16 });
    expect(revealTravel({ fromRight: true }, 16)).toEqual({ axis: "x", from: 16 });
  });

  it("resolves conflicts by the documented precedence, first match wins", () => {
    expect(revealTravel({ fromBelow: true, fromRight: true }, 16)).toEqual({ axis: "y", from: 16 });
    expect(revealTravel({ fromAbove: true, fromLeft: true }, 16)).toEqual({ axis: "y", from: -16 });
    expect(revealTravel({ fromLeft: true, fromRight: true }, 16)).toEqual({ axis: "x", from: -16 });
  });

  it("carries the resolved distance, so pronounced travels further", () => {
    expect(revealTravel({ fromBelow: true }, 40)).toEqual({ axis: "y", from: 40 });
  });
});

describe("revealDelay", () => {
  it("is zero for the first item and linear after it", () => {
    expect(revealDelay(0, 60, 10)).toBe(0);
    expect(revealDelay(1, 60, 10)).toBe(60);
    expect(revealDelay(3, 60, 10)).toBe(180);
  });

  it("caps the step count so a long group's tail stays in rhythm", () => {
    expect(revealDelay(10, 60, 10)).toBe(600);
    expect(revealDelay(40, 60, 10)).toBe(600);
  });

  it("collapses nonsense ordinals to no delay rather than a NaN duration", () => {
    expect(revealDelay(-3, 60, 10)).toBe(0);
    expect(revealDelay(Number.NaN, 60, 10)).toBe(0);
    expect(revealDelay(2.7, 60, 10)).toBe(120);
  });
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <Text>revealed body</Text>
      </Reveal>,
    );
    expect(screen.getByText("revealed body")).toBeDefined();
  });

  it("does not animate while the element is below the fold", async () => {
    const rect = stubRect(2000);
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <Reveal>
          <Text>pending body</Text>
        </Reveal>,
      );
      // The measure callback is async (a queued task), so give it room to land and
      // then assert nothing started.
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(timing).not.toHaveBeenCalled();
      // Still pending, so the shared ticker is running for it.
      expect(inViewTickerActive()).toBe(true);
    } finally {
      timing.mockRestore();
      rect.mockRestore();
    }
  });

  it("animates once the element scrolls into view, and stops the ticker after", async () => {
    const rect = stubRect(2000);
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <Reveal>
          <Text>arriving body</Text>
        </Reveal>,
      );
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(timing).not.toHaveBeenCalled();

      // Scroll it up into view; the next ticker sample (100ms) picks it up.
      rect.mockRestore();
      const scrolled = stubRect(200);
      try {
        await waitFor(() => expect(timing).toHaveBeenCalled());
        const config = timing.mock.calls[0]?.[1] as { duration?: number; delay?: number };
        expect(config.duration).toBe(460);
        expect(config.delay).toBe(0);
        // Latched: the element resolved, so the shared timer is gone entirely.
        expect(inViewTickerActive()).toBe(false);
      } finally {
        scrolled.mockRestore();
      }
    } finally {
      timing.mockRestore();
    }
  });

  it("shortens the duration with brisk", async () => {
    const rect = stubRect(100);
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <Reveal brisk>
          <Text>brisk body</Text>
        </Reveal>,
      );
      await waitFor(() => expect(timing).toHaveBeenCalled());
      const config = timing.mock.calls[0]?.[1] as { duration?: number };
      expect(config.duration).toBe(260);
    } finally {
      timing.mockRestore();
      rect.mockRestore();
    }
  });

  it("skips detection and animation entirely under Reduce Motion, rendering the final frame", async () => {
    // Park the element far below the fold: without the Reduce Motion branch it would
    // stay invisible forever, so opacity reaching 1 can only come from that branch.
    const rect = stubRect(5000);
    const motion = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <Reveal fromLeft pronounced>
          <Text>reduced body</Text>
        </Reveal>,
      );
      const wrapper = screen.getByText("reduced body").parentElement as HTMLElement;
      await waitFor(() => expect(wrapper.style.opacity).toBe("1"));
      expect(timing).not.toHaveBeenCalled();
      // No pending element, so no timer: the feature costs nothing when opted out.
      expect(inViewTickerActive()).toBe(false);
    } finally {
      timing.mockRestore();
      motion.mockRestore();
      rect.mockRestore();
    }
  });
});

describe("RevealGroup", () => {
  it("renders no host element of its own, so a grid still lays out the items", () => {
    const rect = stubRect(5000);
    try {
      render(
        <View testID="grid">
          <RevealGroup>
            <Reveal>
              <Text>one</Text>
            </Reveal>
            <Reveal>
              <Text>two</Text>
            </Reveal>
            <Reveal>
              <Text>three</Text>
            </Reveal>
          </RevealGroup>
        </View>,
      );
      // Three Reveals in, three children out: no wrapper box was inserted between the
      // container and the items.
      const grid = screen.getByTestId("grid");
      expect(grid.children.length).toBe(3);
    } finally {
      rect.mockRestore();
    }
  });

  it("hands out increasing ordinals, which become increasing delays", async () => {
    const rect = stubRect(100);
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <RevealGroup>
          <Reveal>
            <Text>first</Text>
          </Reveal>
          <Reveal>
            <Text>second</Text>
          </Reveal>
          <Reveal>
            <Text>third</Text>
          </Reveal>
        </RevealGroup>,
      );
      await waitFor(() => expect(timing.mock.calls.length).toBe(3));
      const delays = timing.mock.calls.map((c) => (c[1] as { delay?: number }).delay);
      expect(delays).toEqual([0, 60, 120]);
    } finally {
      timing.mockRestore();
      rect.mockRestore();
    }
  });

  it("leaves a lone Reveal at ordinal zero, so it needs no group", async () => {
    const rect = stubRect(100);
    const timing = spyOn(Animated, "timing").mockReturnValue(stubAnimation());
    try {
      render(
        <Reveal>
          <Text>ungrouped</Text>
        </Reveal>,
      );
      await waitFor(() => expect(timing).toHaveBeenCalled());
      expect((timing.mock.calls[0]?.[1] as { delay?: number }).delay).toBe(0);
    } finally {
      timing.mockRestore();
      rect.mockRestore();
    }
  });

  it("ignores ordinals under Reduce Motion: a static frame is never delayed", async () => {
    const rect = stubRect(100);
    const motion = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    try {
      render(
        <RevealGroup>
          <Reveal>
            <Text>r-first</Text>
          </Reveal>
          <Reveal>
            <Text>r-second</Text>
          </Reveal>
        </RevealGroup>,
      );
      // Both are fully visible immediately; the second is not held back by its ordinal.
      const second = screen.getByText("r-second").parentElement as HTMLElement;
      await waitFor(() => expect(second.style.opacity).toBe("1"));
      const first = screen.getByText("r-first").parentElement as HTMLElement;
      expect(first.style.opacity).toBe("1");
    } finally {
      motion.mockRestore();
      rect.mockRestore();
    }
  });
});
