import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { AccessibilityInfo, Text } from "react-native";
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

  it("renders the final frame immediately under Reduce Motion", () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    render(
      <Entrance anchor>
        <Text>reduced menu</Text>
      </Entrance>,
    );
    // Content is present with no animation gating it.
    expect(screen.getByText("reduced menu")).toBeDefined();
    spy.mockRestore();
  });
});
