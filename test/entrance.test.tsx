import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { AccessibilityInfo, Animated, Text } from "react-native";
import { Entrance, entranceTranslation } from "../src/style/entrance.tsx";

// Entrance animates glass overlays open (menus pop from the trigger corner; dialogs
// scale-fade). The corner-pin math is the load-bearing piece; the rest is a render
// smoke since opacity/transform are not observable through the DOM harness.

afterEach(cleanup);

describe("entranceTranslation", () => {
  it("pins the top-left corner: -(size/2)*(1-startScale) at progress 0", () => {
    // A 100x60 surface scaling from 0.85 about its center: the corner would drift
    // by (50, 30)*0.15, so the compensating translate is the negative of that.
    const t = entranceTranslation({ width: 100, height: 60 }, 0.85);
    expect(t.x).toBeCloseTo(-7.5, 10);
    expect(t.y).toBeCloseTo(-4.5, 10);
  });

  it("is zero when there is no scale (startScale 1)", () => {
    const t = entranceTranslation({ width: 320, height: 200 }, 1);
    expect(t.x).toBeCloseTo(0, 10);
    expect(t.y).toBeCloseTo(0, 10);
  });

  it("scales with size", () => {
    const t = entranceTranslation({ width: 200, height: 100 }, 0.9);
    expect(t.x).toBeCloseTo(-10, 10);
    expect(t.y).toBeCloseTo(-5, 10);
  });
});

describe("Entrance", () => {
  it("renders its children in center mode", () => {
    render(
      <Entrance>
        <Text>panel body</Text>
      </Entrance>,
    );
    expect(screen.getByText("panel body")).toBeDefined();
  });

  it("renders its children in anchor mode", () => {
    render(
      <Entrance anchor>
        <Text>menu item</Text>
      </Entrance>,
    );
    expect(screen.getByText("menu item")).toBeDefined();
  });

  it("skips the spring and renders the final frame under Reduce Motion", async () => {
    const motion = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    // Neuter the spring: with it mocked to a no-op, opacity can ONLY reach 1 through
    // the Reduce Motion branch (progress.setValue(1)). If that branch were removed,
    // the wrapper would stay at opacity 0 forever and this waitFor would time out.
    const spring = spyOn(Animated, "spring").mockReturnValue({
      start: () => {},
      stop: () => {},
      reset: () => {},
    } as unknown as Animated.CompositeAnimation);
    try {
      render(
        <Entrance>
          <Text>reduced panel</Text>
        </Entrance>,
      );
      const wrapper = screen.getByText("reduced panel").parentElement as HTMLElement;
      await waitFor(() => expect(wrapper.style.opacity).toBe("1"));
    } finally {
      motion.mockRestore();
      spring.mockRestore();
    }
  });

  it("springs the entrance open when motion is allowed", async () => {
    const spring = spyOn(Animated, "spring").mockReturnValue({
      start: () => {},
      stop: () => {},
      reset: () => {},
    } as unknown as Animated.CompositeAnimation);
    try {
      render(
        <Entrance>
          <Text>animated panel</Text>
        </Entrance>,
      );
      await waitFor(() => expect(spring).toHaveBeenCalled());
      // Center (panel) mode uses the settle spring — no visible overshoot.
      const config = spring.mock.calls[0]?.[1] as { stiffness?: number; damping?: number };
      expect(config.stiffness).toBe(500);
      expect(config.damping).toBe(44);
    } finally {
      spring.mockRestore();
    }
  });
});
