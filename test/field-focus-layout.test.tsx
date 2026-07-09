import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import type { ViewStyle, TextStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors as t } from "../src/style/tokens.ts";

import { webSkin as selectWeb, iosSkin as selectIos, androidSkin as selectAndroid } from "../src/atoms/select/select.styles.ts";
import { webSkin as comboWeb, iosSkin as comboIos, androidSkin as comboAndroid } from "../src/atoms/combobox/combobox.styles.ts";
import { webSkin as inputWeb, iosSkin as inputIos, androidSkin as inputAndroid } from "../src/atoms/input/input.styles.ts";

import { Input } from "../src/atoms/input/input.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { NumberInput } from "../src/atoms/number-input/number-input.tsx";

// ---------------------------------------------------------------------------
// Part A: the active indicator must not reflow the value text.
//
// The M3/iOS field thickens its bottom active-indicator when it becomes active
// (Select/Combobox on open, Input on focus). Each such field has a fixed height,
// box-sizing:border-box, and vertically-centered content, so any change to the
// total vertical border+padding shifts the centered value text. The fix reserves
// a constant amount below the content (border + compensating padding); this test
// locks that: the total vertical inset must be identical in the rest and active
// states, for every size and skin. (Textarea is intentionally excluded: its
// content is top-aligned, so a bottom-border change never moves the text.)
// ---------------------------------------------------------------------------

const SIZES = ["small", "default", "large"] as const;

const num = (v: unknown): number => (typeof v === "number" ? v : 0);

// Total top+bottom border + padding an element reserves. Constant across states
// => content box (and the centered value text) does not move.
function vInset(s: ViewStyle | TextStyle): number {
  const st = s as Record<string, unknown>;
  const pv = num(st.paddingVertical);
  const pt = st.paddingTop != null ? num(st.paddingTop) : pv;
  const pb = st.paddingBottom != null ? num(st.paddingBottom) : pv;
  const bw = num(st.borderWidth);
  const bt = st.borderTopWidth != null ? num(st.borderTopWidth) : bw;
  const bb = st.borderBottomWidth != null ? num(st.borderBottomWidth) : bw;
  return pt + pb + bt + bb;
}

describe("field active indicator: content box stays fixed across the active state", () => {
  for (const [plat, skin] of [["web", selectWeb], ["ios", selectIos], ["android", selectAndroid]] as const) {
    for (const size of SIZES) {
      it(`Select ${plat} ${size} trigger`, () => {
        expect(vInset(skin.trigger(t, size, true))).toBe(vInset(skin.trigger(t, size, false)));
      });
    }
  }

  for (const [plat, skin] of [["web", comboWeb], ["ios", comboIos], ["android", comboAndroid]] as const) {
    for (const size of SIZES) {
      it(`Combobox ${plat} ${size} field`, () => {
        expect(vInset(skin.field(t, size, true))).toBe(vInset(skin.field(t, size, false)));
      });
    }
  }

  // Input's active state is `focused || error`; the shell passes borderColor "ring"
  // + focused=true when active, "input" + false at rest. Bare and grouped both
  // carry the indicator (bare on the field, grouped on the container).
  for (const [plat, skin] of [["web", inputWeb], ["ios", inputIos], ["android", inputAndroid]] as const) {
    it(`Input ${plat} bareField`, () => {
      expect(vInset(skin.bareField(t, "ring", true, false))).toBe(vInset(skin.bareField(t, "input", false, false)));
    });
    it(`Input ${plat} groupContainer`, () => {
      expect(vInset(skin.groupContainer(t, "ring", true, false))).toBe(vInset(skin.groupContainer(t, "input", false, false)));
    });
  }
});

// ---------------------------------------------------------------------------
// Part B: the browser's default focus outline must be suppressed on web.
//
// react-native-web paints its default focus outline on the <input>/<textarea>.
// Every field skin paints its own focus affordance (web border -> ring, iOS
// hairline, Android indicator), so the shared FOCUS_RESET suppresses the browser
// outline. This locks that the field shells apply it on every rendered field
// (the bare/multiline Input path was the one that regressed).
// ---------------------------------------------------------------------------

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
afterEach(cleanup);

// RNW writes the reset as an inline style on the element; assert the outline is
// explicitly zeroed rather than left at the UA default.
function assertOutlineSuppressed(el: HTMLElement | null) {
  expect(el).not.toBeNull();
  const inline = el!.style;
  const zeroed = inline.outlineStyle === "none" || inline.outlineWidth === "0px" || inline.outline === "none";
  expect(zeroed).toBe(true);
}

describe("field focus outline is suppressed on web", () => {
  it("Input (bare single-line)", () => {
    const { container } = ui(<Input placeholder="x" />);
    assertOutlineSuppressed(container.querySelector("input"));
  });

  it("Input (multiline / text area)", () => {
    const { container } = ui(<Input multiline placeholder="x" />);
    assertOutlineSuppressed(container.querySelector("textarea"));
  });

  it("Input (grouped with addon)", () => {
    const { container } = ui(<Input prefix="$" placeholder="x" />);
    assertOutlineSuppressed(container.querySelector("input"));
  });

  it("Combobox", () => {
    const { container } = ui(<Combobox placeholder="x" options={["Ada", "Grace"]} />);
    assertOutlineSuppressed(container.querySelector("input"));
  });

  it("Textarea", () => {
    const { container } = ui(<Textarea placeholder="x" />);
    assertOutlineSuppressed(container.querySelector("textarea"));
  });

  it("NumberInput", () => {
    const { container } = ui(<NumberInput placeholder="x" />);
    assertOutlineSuppressed(container.querySelector("input"));
  });
});
