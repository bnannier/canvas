import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Avatar } from "../src/atoms/avatar/avatar.tsx";
import { initialsDisc } from "../src/atoms/avatar/avatar.shared.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/avatar/avatar.styles.ts";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { alpha, oklchHex } from "../src/style/color.ts";

// The hand-off's avatar (`K.def('avatar')` in tools/v4/handoff/cv-kit-controls.js): 20/28/40/56
// discs, a `rounded` square at 28% of the disc, initials at 600 and 38% of the disc over the
// hue's 22% wash, and the glow a 2px page gap inside an 18px accent glow.

afterEach(cleanup);

const box = (el: HTMLElement) => [el.style.width, el.style.height];

describe("Avatar takes the hand-off's look", () => {
  it("draws the four discs at 20, 28, 40 and 56", () => {
    render(<ThemeProvider light solid>
      <Avatar tiny name="Ada Byron" testID="tiny" />
      <Avatar small name="Ada Byron" testID="small" />
      <Avatar name="Ada Byron" testID="base" />
      <Avatar large name="Ada Byron" testID="large" />
    </ThemeProvider>);
    expect(box(screen.getByTestId("tiny"))).toEqual(["20px", "20px"]);
    expect(box(screen.getByTestId("small"))).toEqual(["28px", "28px"]);
    expect(box(screen.getByTestId("base"))).toEqual(["40px", "40px"]);
    expect(box(screen.getByTestId("large"))).toEqual(["56px", "56px"]);
  });

  it("rounds the `rounded` square at 28% of the disc", () => {
    expect((["tiny", "small", "default", "large"] as const).map((size) => webSkin.roundedRadius[size])).toEqual([20, 28, 40, 56].map((d) => Math.round(d * 0.28)));
    render(<ThemeProvider light solid><Avatar large rounded name="Ada Byron" testID="sq" /></ThemeProvider>);
    expect(screen.getByTestId("sq").style.borderRadius).toBe("16px");
  });

  it("sets the initials at 600, 38% of the disc on the 10px source floor, one line tall, on every platform", () => {
    for (const skin of [webSkin, iosSkin, androidSkin]) {
      expect(skin.labelType.tiny).toEqual({ fontWeight: "600", fontSize: 10, lineHeight: 10 });
      expect(skin.labelType.small).toEqual({ fontWeight: "600", fontSize: 11, lineHeight: 11 });
      expect(skin.labelType.default).toEqual({ fontWeight: "600", fontSize: 15, lineHeight: 15 });
      expect(skin.labelType.large).toEqual({ fontWeight: "600", fontSize: 21, lineHeight: 21 });
    }
  });

  it("paints the hue's 22% wash, keeps the hand-off's ink where it reads and darkens it on the light page", () => {
    const dark = initialsDisc(285, darkColors.background, true);
    expect(dark.wash).toBe(alpha(oklchHex(0.72, 0.14, 285), 0.22));
    expect(dark.ink).toBe(oklchHex(0.82, 0.12, 285));
    const light = initialsDisc(285, lightColors.background, false);
    expect(light.wash).toBe(dark.wash);
    expect(light.ink).not.toBe(dark.ink);
    render(<ThemeProvider dark solid><Avatar name="Ada Byron" hue={285} testID="disc" /></ThemeProvider>);
    const disc = screen.getByTestId("disc");
    expect(disc.style.backgroundColor).toBeTruthy();
    expect(within(disc).getByText("AB")).toBeDefined();
  });

  it("glows with a 2px page gap inside an 18px accent glow", () => {
    render(<ThemeProvider dark solid><Avatar glow name="Ada Byron" testID="glow" /></ThemeProvider>);
    expect(screen.getByTestId("glow").style.boxShadow).toBe(`0 0 0 2px ${darkColors.background}, 0 0 18px ${darkColors.glow}`);
  });
});
