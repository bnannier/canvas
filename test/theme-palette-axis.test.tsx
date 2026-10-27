import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { PALETTES, colorsFor, darkColors, lightColors, type Palette } from "../src/style/tokens.ts";
import { WEB_TINTS } from "../src/style/glass-surface/web-frost.ts";
import { Button } from "../src/atoms/button/button.tsx";
import { getPalette, setPalette } from "../src/theme.ts";

// The palette axis: the v4 hand-off's five accent palettes in the boolean grammar
// (<ThemeProvider cyan>, violet when omitted). A palette is one accent hue, so it applies
// in both schemes: `dark` and a palette combine rather than one winning, as `.dark` and
// `[data-palette]` combine in the CSS hand-off. The glass is the scheme's alone; no palette
// moves it. `ssrPalette` is the ssrScheme contract on this axis.

afterEach(cleanup);

const NON_DEFAULT = PALETTES.filter((p) => p !== "violet");
const flag = (palette: Palette) => ({ [palette]: true });

function Probe() {
  const { palette, scheme, tokens, glass } = useTheme();
  return <Text>{`palette:${palette}|scheme:${scheme}|primary:${tokens.primary}|background:${tokens.background}|shell:${glass["glass-tint"]}`}</Text>;
}

const probe = (palette: string, scheme: string, tokens: { primary: string; background: string }, shell: string) =>
  `palette:${palette}|scheme:${scheme}|primary:${tokens.primary}|background:${tokens.background}|shell:${shell}`;

describe("ThemeProvider palette axis", () => {
  it("omitting a palette paints violet, the default, in both schemes", () => {
    render(
      <>
        <ThemeProvider light><Probe /></ThemeProvider>
        <ThemeProvider dark><Probe /></ThemeProvider>
      </>,
    );
    expect(screen.getByText(probe("violet", "light", lightColors, WEB_TINTS.light["glass-tint"]))).toBeTruthy();
    expect(screen.getByText(probe("violet", "dark", darkColors, WEB_TINTS.dark["glass-tint"]))).toBeTruthy();
    expect(colorsFor("violet", "light")).toBe(lightColors);
    expect(colorsFor("violet", "dark")).toBe(darkColors);
  });

  it("each palette paints its own accent over the scheme's neutrals and frost, light and dark", () => {
    for (const palette of NON_DEFAULT) {
      for (const scheme of ["light", "dark"] as const) {
        const view = render(<ThemeProvider {...flag(palette)} {...{ [scheme]: true }}><Probe /></ThemeProvider>);
        const tokens = colorsFor(palette, scheme);
        expect(screen.getByText(probe(palette, scheme, tokens, WEB_TINTS[scheme]["glass-tint"]))).toBeTruthy();
        // The accent moves; the page does not.
        const base = scheme === "dark" ? darkColors : lightColors;
        expect(tokens.primary).not.toBe(base.primary);
        expect(tokens.background).toBe(base.background);
        view.unmount();
      }
    }
  });

  it("resolves conflicting palette flags by the documented precedence: cyan, mint, rose, amber, then violet", () => {
    render(<ThemeProvider light mint rose cyan><Probe /></ThemeProvider>);
    expect(screen.getByText(probe("cyan", "light", colorsFor("cyan", "light"), WEB_TINTS.light["glass-tint"]))).toBeTruthy();
  });

  it("merges a rebrand over a palette's base, and a primary-only rebrand repaints the action", () => {
    function Tokens() {
      const { tokens } = useTheme();
      return <Text>{`${tokens.primary}|${tokens.background}|${tokens.action}|${tokens["inverse-primary"]}`}</Text>;
    }
    const mint = colorsFor("mint", "light");
    render(<ThemeProvider light mint tokens={{ primary: "#123456" }}><Tokens /></ThemeProvider>);
    // The rebrand leaves inverse-primary alone (ColorTokens documents it: name it too).
    expect(screen.getByText(`#123456|${mint.background}|#123456|${mint["inverse-primary"]}`)).toBeTruthy();
  });

  it("paints kit components in the palette's roles", () => {
    const rose = colorsFor("rose", "light");
    render(
      <ThemeProvider light rose solid>
        <Button primary testID="cta">Save</Button>
        <Button link>Details</Button>
      </ThemeProvider>,
    );
    const cta = screen.getByTestId("cta");
    expect(channelsOf(cta.style.backgroundColor)).toBe(channelsOf(rose.action!));
    expect(channelsOf(screen.getByText("Details").style.color)).toBe(channelsOf(rose["primary-text"]!));
  });
});

describe("ThemeProvider ssrPalette", () => {
  it("pins the server render to ssrPalette even when the palette flag disagrees", () => {
    const html = renderToString(<ThemeProvider light amber ssrPalette="violet"><Probe /></ThemeProvider>);
    expect(html).toContain(probe("violet", "light", lightColors, WEB_TINTS.light["glass-tint"]));
    expect(html).not.toContain(colorsFor("amber", "light").primary);
  });

  it("applies the requested palette after mount on the client", () => {
    render(<ThemeProvider light amber ssrPalette="violet"><Probe /></ThemeProvider>);
    // Effects have flushed by the time render() returns.
    expect(screen.getByText(probe("amber", "light", colorsFor("amber", "light"), WEB_TINTS.light["glass-tint"]))).toBeTruthy();
  });

  it("holds the requested scheme through hydration when only the palette is pinned", () => {
    const html = renderToString(<ThemeProvider dark amber ssrPalette="violet"><Probe /></ThemeProvider>);
    expect(html).toContain(probe("violet", "dark", darkColors, WEB_TINTS.dark["glass-tint"]));
  });
});

describe("the web palette switch", () => {
  afterEach(() => {
    delete document.documentElement.dataset.palette;
    try { localStorage.removeItem("canvas-palette"); } catch {}
  });

  it("marks the root element for every non-default palette and clears it for violet", () => {
    for (const palette of NON_DEFAULT) {
      setPalette(palette);
      expect(document.documentElement.dataset.palette).toBe(palette);
      expect(getPalette()).toBe(palette);
    }
    setPalette("violet");
    expect(document.documentElement.dataset.palette).toBeUndefined();
    expect(getPalette()).toBe("violet");
  });

  it("persists the choice, so it survives the attribute being gone (a reload)", () => {
    setPalette("rose");
    expect(localStorage.getItem("canvas-palette")).toBe("rose");
    delete document.documentElement.dataset.palette;
    expect(getPalette()).toBe("rose");
    setPalette("violet");
    expect(localStorage.getItem("canvas-palette")).toBe("violet");
  });

  it("reads the root element when nothing is stored, and ignores a name that is not a palette", () => {
    try { localStorage.removeItem("canvas-palette"); } catch {}
    document.documentElement.dataset.palette = "cyan";
    expect(getPalette()).toBe("cyan");
    document.documentElement.dataset.palette = "blush";
    expect(getPalette()).toBe("violet");
  });
});

/** The r,g,b channels of a #rrggbb or of the rgb()/rgba() string the DOM prints. */
function channelsOf(color: string): string {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
  return m ? `${m[1]},${m[2]},${m[3]}` : color;
}
