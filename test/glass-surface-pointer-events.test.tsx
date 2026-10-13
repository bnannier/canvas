import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Text, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { PlainSurface } from "../src/style/glass-surface/glass-surface.shared.tsx";

// GlassSurface's `pointerEvents` reaches the DOM as React Native's four values mean it.
// React Native Web compiles box-none and box-only (the box itself, or only its children,
// passing taps through) for registered styles alone; an inline value is written to CSS as
// is, where `box-none` and `box-only` are not values, so the browser dropped them and the
// surface took every tap. Each value is read off the box and its child as the browser
// computes them, in glass (the material path) and in solid, and on PlainSurface, the
// opaque card AnchoredOverlay renders.

afterEach(cleanup);

const expected = {
  "box-none": { box: "none", child: "auto" },
  "box-only": { box: "auto", child: "none" },
  none: { box: "none", child: "none" },
  auto: { box: "auto", child: "auto" },
} as const;

function computed(id: string) {
  const box = screen.getByTestId(id) as HTMLElement;
  const child = screen.getByTestId(`${id}-child`) as HTMLElement;
  // An element no rule names computes to the initial value, `auto` (happy-dom leaves it empty).
  const of = (node: HTMLElement) => getComputedStyle(node).pointerEvents || "auto";
  return { box: of(box), child: of(child), inline: box.getAttribute("style") ?? "" };
}

describe("GlassSurface pointerEvents", () => {
  for (const [value, want] of Object.entries(expected) as [keyof typeof expected, (typeof expected)[keyof typeof expected]][]) {
    for (const surface of ["glass", "solid"] as const) {
      it(`${value} in ${surface}: the box ${want.box}, its child ${want.child}`, () => {
        render(
          <ThemeProvider light glass={surface === "glass"} solid={surface === "solid"}>
            <GlassSurface testID="surface" pointerEvents={value} style={{ borderRadius: 12, padding: 8 }}>
              <View testID="surface-child"><Text>Content</Text></View>
            </GlassSurface>
          </ThemeProvider>,
        );
        const got = computed("surface");
        expect(got.box).toBe(want.box);
        expect(got.child).toBe(want.child);
        // Never an inline value: that is the path the browser drops box-none and box-only on.
        expect(got.inline).not.toContain("pointer-events");
      });
    }

    it(`${value} on PlainSurface: the box ${want.box}, its child ${want.child}`, () => {
      render(
        <PlainSurface testID="plain" pointerEvents={value}>
          <View testID="plain-child" />
        </PlainSurface>,
      );
      const got = computed("plain");
      expect(got.box).toBe(want.box);
      expect(got.child).toBe(want.child);
      expect(got.inline).not.toContain("pointer-events");
    });
  }
});
