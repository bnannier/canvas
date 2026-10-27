import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Divider as DividerWeb } from "../src/atoms/divider/divider.tsx";
import { Divider as DividerIOS } from "../src/atoms/divider/divider.ios.tsx";
import { Divider as DividerAndroid } from "../src/atoms/divider/divider.android.tsx";
import { emphasisOf, type DividerProps } from "../src/atoms/divider/divider.shared.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";

// Divider's semantics, on every entry (the shell is shared, so each skin must keep it):
// a separator announces its orientation when it is not the horizontal default, and a
// labelled separator is named by its label, because ARIA makes a separator's children
// presentational (the "OR" inside it was never read). The action pattern, whose child is
// a control, carries no separator role at all. These run the iOS and Android entries in
// the browser runtime, so they pin the props each entry hands React Native; how VoiceOver
// and TalkBack read a labelled separator is a device check still owed
// (audit/components/divider.md).

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

const SKINS: [string, ComponentType<DividerProps>][] = [
  ["web", DividerWeb],
  ["ios", DividerIOS],
  ["android", DividerAndroid],
];

for (const [platform, Divider] of SKINS) {
  describe(`Divider on ${platform}`, () => {
    it("says a vertical rule is vertical, and leaves the horizontal default unsaid", () => {
      ui(
        <>
          <Divider vertical testID="v" />
          <Divider testID="h" />
        </>,
      );
      expect(screen.getByTestId("v").getAttribute("role")).toBe("separator");
      expect(screen.getByTestId("v").getAttribute("aria-orientation")).toBe("vertical");
      expect(screen.getByTestId("h").getAttribute("role")).toBe("separator");
      expect(screen.getByTestId("h").getAttribute("aria-orientation")).toBeNull();
    });

    it("names a labelled separator after its label, text or number", () => {
      ui(
        <>
          <Divider>OR</Divider>
          <Divider>{3}</Divider>
        </>,
      );
      expect(screen.getByRole("separator", { name: "OR" })).toBeTruthy();
      expect(screen.getByRole("separator", { name: "3" })).toBeTruthy();
    });

    it("points each labelled separator at its own label", () => {
      ui(
        <>
          <Divider testID="a">Section A</Divider>
          <Divider testID="b">Section B</Divider>
        </>,
      );
      const a = screen.getByTestId("a").getAttribute("aria-labelledby");
      const b = screen.getByTestId("b").getAttribute("aria-labelledby");
      expect(a).not.toBe(b);
      expect(document.getElementById(a!)?.textContent).toBe("Section A");
      expect(document.getElementById(b!)?.textContent).toBe("Section B");
    });

    it("gives the action pattern no separator role, so the control is what is announced", () => {
      ui(
        <Divider testID="d">
          <Button small outline>Load more</Button>
        </Divider>,
      );
      expect(screen.getByTestId("d").getAttribute("role")).toBeNull();
      expect(screen.getByTestId("d").getAttribute("aria-labelledby")).toBeNull();
      expect(screen.queryByRole("separator")).toBeNull();
      expect(screen.getByRole("button", { name: "Load more" })).toBeTruthy();
    });
  });
}

// The rule itself, the hand-off's Divider renderer (`K.def('divider')`): the hairline
// `border` (--ln) by default, `field-border` (--ln2) when strong, the hairline at 60% when
// soft; and `inset`, the docs pill's separator, a 1 x 18 px rule centred in its row with
// 4 px on each side instead of one stretched to the row.
describe("Divider rule (the hand-off renderer)", () => {
  const flat = (v: string) => v.replace(/\s/g, "");
  const rule = (node: HTMLElement) => flat(node.style.backgroundColor);
  const rgba = (c: string) => flat(c);

  it("resolves no emphasis to the default hairline, and soft before strong", () => {
    expect(emphasisOf({})).toBe("default");
    expect(emphasisOf({ strong: true })).toBe("strong");
    expect(emphasisOf({ soft: true })).toBe("soft");
    expect(emphasisOf({ soft: true, strong: true })).toBe("soft");
  });

  for (const [scheme, t] of [["dark", darkColors], ["light", lightColors]] as const) {
    it(`paints border, field-border and the 60% hairline in ${scheme}`, () => {
      render(
        <ThemeProvider dark={scheme === "dark"} light={scheme === "light"} solid>
          <DividerWeb testID="d" />
          <DividerWeb strong testID="s" />
          <DividerWeb soft testID="o" />
        </ThemeProvider>,
      );
      expect(rule(screen.getByTestId("d"))).toBe(rgba(t.border));
      expect(rule(screen.getByTestId("s"))).toBe(rgba(t["field-border"]!));
      // react-native-web writes the alpha to two places.
      const alphaOf = (c: string) => Number(/,([\d.]+)\)$/.exec(flat(c))![1]);
      expect(alphaOf(screen.getByTestId("o").style.backgroundColor)).toBeCloseTo(alphaOf(t.border) * 0.6, 2);
    });
  }

  it("draws an inset vertical rule 18 px long, centred, 4 px from each neighbour", () => {
    ui(
      <>
        <DividerWeb vertical inset testID="i" />
        <DividerWeb vertical testID="v" />
      </>,
    );
    const inset = screen.getByTestId("i").style;
    expect([inset.width, inset.height, inset.alignSelf, inset.marginLeft, inset.marginRight]).toEqual(["1px", "18px", "center", "4px", "4px"]);
    const full = screen.getByTestId("v").style;
    expect([full.alignSelf, full.height, full.marginLeft]).toEqual(["stretch", "", ""]);
  });

  it("leaves a horizontal rule full width under inset", () => {
    ui(<DividerWeb inset testID="h" />);
    expect(screen.getByTestId("h").style.width).toBe("100%");
    expect(screen.getByTestId("h").style.height).toBe("1px");
  });
  it("sets a text label in the hand-off's mono caption, in the subtle ink, on every skin", () => {
    for (const [, D] of SKINS) {
      cleanup();
      for (const [dark, t] of [[true, darkColors], [false, lightColors]] as const) {
        render(<ThemeProvider scheme={dark ? "dark" : "light"}><D>or</D></ThemeProvider>);
        const s = screen.getByText("or").style;
        expect([s.fontSize, s.lineHeight, s.fontWeight, s.letterSpacing, s.textTransform]).toEqual(["11px", "15px", "500", "0.88px", "uppercase"]);
        expect(s.fontFamily).toContain("monospace");
        const hex = t["subtle-foreground"]!;
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
        expect(flat(s.color)).toBe(`rgba(${r},${g},${b},1.00)`);
        cleanup();
      }
    }
  });
});
