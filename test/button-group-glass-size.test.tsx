import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { createButtonGroup } from "../src/atoms/button-group/button-group.shared.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/button-group/button-group.styles.ts";

// ButtonGroup is the same size in solid and glass (glass-surface-button-group-size-1, the
// owner's GP-1 decision: "a control is the same size in glass and solid"). Under glass it
// used to swap its skin's track and cells for a shared geometry, a padded pill track with
// borderless cells, so a page reflowed when the surface mode changed (the web's segmented
// Day | Week | Month 8.3 px narrower and 2 px shorter, Android's segmented track 4 px taller
// in an overlay, the steppers narrower). Now every kind hands the skin's own box to
// `paneStyle`, which turns a resting border into padding: for each kind on each platform
// skin, the track and every cell keep their insets (border plus padding on every side),
// height, gap and margins, and every label its weight, in light and dark.
//
// happy-dom computes no layout, so the boxes are read from the computed style the browser
// lays out from.

afterEach(cleanup);

const SIDES = ["top", "right", "bottom", "left"] as const;
const px = (value: string) => (value === "" ? 0 : Number.parseFloat(value));

/** What a box contributes to the layout: everything but its paint. */
function box(node: Element) {
  const style = getComputedStyle(node);
  const value = (name: string) => style.getPropertyValue(name);
  return {
    insets: SIDES.map((side) => px(value(`border-${side}-width`)) + px(value(`padding-${side}`))),
    margins: SIDES.map((side) => value(`margin-${side}`) || "0px"),
    height: value("height"),
    width: value("width"),
    gap: [value("row-gap"), value("column-gap"), value("gap")].join("/"),
  };
}

/** The track (the group's root), every pressable cell, its layout wrapper, and every label's weight. */
function measure(container: Element) {
  const root = container.querySelector('[data-testid="group"]')!;
  const cells = Array.from(root.querySelectorAll('[role="tab"], [role="button"]'));
  const labels = Array.from(root.querySelectorAll('[dir="auto"]'));
  const middle = labels.map((label) => label.parentElement!).filter((parent) => parent.getAttribute("role") == null && parent !== root);
  return {
    track: box(root),
    cells: cells.map((cell) => ({ cell: box(cell), wrapper: box(cell.parentElement!) })),
    middle: middle.map(box),
    weights: labels.map((label) => getComputedStyle(label).getPropertyValue("font-weight")),
  };
}

const SKINS = [["web", webSkin], ["iOS", iosSkin], ["Android", androidSkin]] as const;
const KINDS: { name: string; props: Record<string, unknown> }[] = [
  { name: "segmented", props: { items: ["Day", "Week", "Month"], defaultActive: 1, accessibilityLabel: "Range" } },
  { name: "segmented, small, icons only", props: { small: true, iconsOnly: true, items: [{ label: "List", icon: "list" }, { label: "Grid", icon: "grid" }], accessibilityLabel: "View" } },
  { name: "spaced", props: { spaced: true, items: ["Copy", "Paste"] } },
  { name: "stepper", props: { stepper: true, items: ["Mon", "Tue", "Wed"] } },
  { name: "split", props: { split: true, items: ["Save"] } },
];

describe("ButtonGroup keeps its solid size under glass", () => {
  for (const [platform, skin] of SKINS) {
    const ButtonGroup = createButtonGroup(skin);
    for (const { name, props } of KINDS) {
      for (const dark of [false, true]) {
        it(`${platform} ${name}, ${dark ? "dark" : "light"}`, () => {
          const ui = (glass: boolean): ReactElement => (
            <ThemeProvider light={!dark} dark={dark} glass={glass} solid={!glass}>
              <ButtonGroup testID="group" {...props} />
            </ThemeProvider>
          );
          const solid = measure(render(ui(false)).container);
          cleanup();
          const glassRender = render(ui(true));
          // The material rendered: this is the glass geometry, not a solid fallback.
          expect(glassRender.container.querySelector('[data-testid="glass-material"]')).not.toBeNull();
          expect(measure(glassRender.container)).toEqual(solid);
        });
      }
    }
  }
});
