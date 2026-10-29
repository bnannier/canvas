import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { Button } from "../src/atoms/button/button.tsx";
import { Button as IOSButton } from "../src/atoms/button/button.ios.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { androidSkin, iosSkin, webSkin, foregroundOf, webBodyOf } from "../src/atoms/button/button.styles.ts";
import { LoadingArc, PlatformLoader } from "../src/atoms/button/button-loader.tsx";
import { Swatch } from "../src/atoms/swatch/swatch.tsx";

// The Button looks the v4 hand-off's component page is judged on: the loading arc (`K.btn`,
// tools/v4/handoff/cv-kit.js line 44: a 14 px, 2 px `currentColor` ring with its right edge
// open, `spin .8s linear infinite`), the plain accent link (Component.dc.html line 158, the
// props panel's `font:500 12px ... color:var(--ion-tx)` Reset, and line 241, the props
// table's `font:500 13px` show-all row) and the theme choice's 32 px box around its 20 px
// disc (cv-kit-code.js line 69).

afterEach(cleanup);

const t = lightColors;
const base = { icon: false, block: false, dim: false };
/** How react-native-web spells `transparent` (a zero-alpha black), or nothing at all. */
const CLEAR = /^(transparent|rgba\(0, 0, 0, 0(\.00?)?\))?$/;

describe("a loading web Button draws the hand-off's open arc", () => {
  it("is a 14 px pill with a 2 px edge in the label's ink, open on the right, hidden from assistive tech", () => {
    render(<ThemeProvider light solid><Button primary loading>Saving</Button></ThemeProvider>);
    const button = screen.getByRole("button", { name: "Saving" });
    const arc = button.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(arc).not.toBeNull();
    expect(arc.style.width).toBe("14px");
    expect(arc.style.height).toBe("14px");
    expect(arc.style.borderTopWidth).toBe("2px");
    expect(arc.style.borderRadius).toBe("9999px");
    // react-native-web spells `transparent` as a zero-alpha black.
    expect(arc.style.borderRightColor).toMatch(CLEAR);
    // The label's ink: a primary button's label is the accent's ink.
    const ink = webSkin.label(t, "primary", "base", base).color as string;
    expect(foregroundOf(t, "primary", base)).toBe(ink);
    expect(arc.style.borderTopColor).not.toBe("");
    expect(arc.style.borderTopColor).toBe(arc.style.borderLeftColor);
    // It turns on the loop primitive: a compiled keyframe animation, no React commit per frame.
    expect(arc.className).toMatch(/animationKeyframes/);
    expect(button.querySelector('[role="progressbar"]')).toBeNull();
  });

  it("takes a special body's own ink, as the hand-off's `currentColor` does", () => {
    // A theme choice's label is the foreground, not its (default, primary) intent's ink.
    expect(foregroundOf(t, "primary", { ...base, themeChoice: true })).toBe(t.foreground);
    expect(foregroundOf(t, "primary", { ...base, plainLink: true })).toBe(primaryText(t));
    expect(foregroundOf(t, "primary", base)).toBe(webSkin.label(t, "primary", "base", base).color);
  });

  it("is the skin's choice: the arc on the web, the platform's activity indicator on iOS and Android", () => {
    expect(webSkin.loader).toBe(LoadingArc);
    expect(iosSkin.loader).toBe(PlatformLoader);
    expect(androidSkin.loader).toBe(PlatformLoader);
    for (const Component of [IOSButton, AndroidButton]) {
      const { container, unmount } = render(<ThemeProvider light solid><Component primary loading>Saving</Component></ThemeProvider>);
      expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
      unmount();
    }
  });
});

describe("the plain accent link", () => {
  const plain = { ...base, plainLink: true };

  it("is a body of its own that the underlined inline link wins over", () => {
    expect(webBodyOf(plain)).toBe("plainLink");
    expect(webBodyOf({ ...plain, inlineLink: true })).toBe("link");
  });

  it("has no box, no fill and no underline, a 500 label in the accent text ink at 13 px, 12 with small", () => {
    const box = webSkin.container(t, "primary", "base", plain);
    expect(box.borderWidth).toBe(0);
    expect(box.padding).toBe(0);
    expect(box.backgroundColor).toBe("transparent");
    const label = webSkin.label(t, "primary", "base", plain);
    expect(label).toMatchObject({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: primaryText(t) });
    expect(label.textDecorationLine).toBeUndefined();
    expect(webSkin.label(t, "primary", "small", plain)).toMatchObject({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: primaryText(t) });
    expect(webSkin.surface("primary", plain)).toBe(false);
    expect(webSkin.lift?.("primary", plain)).toBeNull();
  });

  it("brightens its label to the foreground ink under the pointer, with no wash", () => {
    expect(webSkin.hover?.({ tokens: t, surface: "solid" } as never, "primary", plain, false)).toBeNull();
    expect(webSkin.hoverLabel?.(t, plain)).toEqual({ color: t.foreground });
    render(<ThemeProvider light solid><Button plainLink small onPress={() => {}}>Reset</Button></ThemeProvider>);
    const button = screen.getByRole("button", { name: "Reset" });
    const label = button.querySelector("div[dir]") as HTMLElement;
    expect(label.textContent).toBe("Reset");
    const resting = label.style.color;
    expect(button.style.backgroundColor).toMatch(CLEAR);
    // The hover is read on the wrapper (src/style/hover.tsx), the outermost node.
    fireEvent.pointerEnter(button.parentElement!, { pointerType: "mouse" });
    expect(button.style.backgroundColor).toMatch(CLEAR);
    expect(button.style.filter).toBe("");
    expect(label.style.color).not.toBe(resting);
    fireEvent.pointerLeave(button.parentElement!);
    expect(label.style.color).toBe(resting);
  });

  it("is the platform's own tint-coloured text button on iOS and Android", () => {
    const ios = iosSkin.label(t, "primary", "base", plain);
    const android = androidSkin.label(t, "primary", "base", plain);
    expect(ios).toMatchObject({ fontSize: 17, fontWeight: "600", color: primaryText(t) });
    expect(android).toMatchObject({ fontSize: 14, fontWeight: "500", color: primaryText(t) });
    expect(iosSkin.container(t, "primary", "base", plain).borderWidth).toBe(0);
    expect(iosSkin.surface("primary", plain)).toBe(false);
  });
});

describe("the theme choice", () => {
  it("carries its decorative disc without doubling its name", () => {
    render(<ThemeProvider light solid><Button themeChoice ghost steadyPress iconLeft={<Swatch tiny ring circle decorative color="#f1a6b0" />}>blush</Button></ThemeProvider>);
    const button = screen.getByRole("button", { name: "blush" });
    expect(screen.queryByRole("img")).toBeNull();
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("is the hand-off's 32 px border box with room for its 20 px disc", () => {
    const box = webSkin.container(t, "ghost", "base", { ...base, themeChoice: true });
    expect(box.height).toBe(32);
    expect(box.paddingVertical).toBe(0);
    expect(box.paddingLeft).toBe(6);
    expect(box.paddingRight).toBe(12);
    expect(box.gap).toBe(8);
    expect(box.borderWidth).toBe(1);
  });
});
