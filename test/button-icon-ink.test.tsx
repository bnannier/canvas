import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { darkColors, lightColors, type ColorTokens } from "../src/style/tokens.ts";
import { actionInk } from "../src/style/action.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { InkProvider, useInk } from "../src/style/ink.tsx";
import { useTheme } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Button as IOSButton } from "../src/atoms/button/button.ios.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { strokeOf, type IconProps } from "../src/atoms/icon/icon.shared.tsx";
import { androidSkin, iosSkin, webSkin } from "../src/atoms/button/button.styles.ts";

// A Button's icon slots take the button's label ink (src/style/ink.tsx): the v4 hand-off
// sets one colour on a button's root and its `<cv-icon>` glyphs paint in currentColor
// (`K.btn` in tools/v4/handoff/cv-kit.js, canvas-assets.js), so a sparkles glyph on a
// primary button is the primary's contrast ink, not the page foreground. An Icon with a
// tone of its own keeps it, and a disabled button's glyph is the label's ink inside the
// dimmed box.
//
// The harness stubs react-native-svg (tools/rnw-preload.ts), so the glyph's stroke is not
// in the DOM: a probe in the slot reads what an Icon there reads (`useInk`) and resolves
// it the way Icon does (`strokeOf(props, tokens, ink)`), the one line Icon joins them on.
// The rendered stroke is measured on the shipped docs page.

afterEach(cleanup);

/** What an Icon with `props` in this slot paints: the slot's ink through Icon's precedence. */
const seen: Record<string, string> = {};
function Probe({ id, ...props }: IconProps & { id: string }) {
  const { tokens } = useTheme();
  seen[id] = strokeOf(props, tokens, useInk());
  return null;
}
const opts = (disabled = false) => ({ icon: false, block: false, dim: disabled, disabled });

describe("a Button's icon slots take its label ink", () => {
  it("paints a bare Icon in the primary's contrast ink on a primary button, in both schemes", () => {
    for (const [scheme, t] of [["light", lightColors], ["dark", darkColors]] as const) {
      const { unmount } = render(
        <ThemeProvider {...{ [scheme]: true }} solid>
          <Button primary iconLeft={<Probe id="left" sparkles />} iconRight={<Probe id="right" chevronDown />}>Save changes</Button>
        </ThemeProvider>,
      );
      expect(seen.left, scheme).toBe(actionInk(t));
      expect(seen.right, scheme).toBe(actionInk(t));
      // The bug this closes: the page foreground is black on the light primary.
      expect(actionInk(t), scheme).not.toBe(t.foreground);
      unmount();
    }
  });

  it("follows the intent, emphasis and body: the web skin's label colour", () => {
    const t = lightColors;
    const cases: { props: Record<string, boolean>; ink: string }[] = [
      { props: { secondary: true }, ink: t["secondary-foreground"] },
      { props: { outline: true }, ink: t.foreground },
      { props: { ghost: true }, ink: t.foreground },
      { props: { destructive: true }, ink: t["destructive-foreground"] },
      { props: { link: true }, ink: primaryText(t) },
      { props: { outline: true, quiet: true }, ink: t["muted-foreground"] },
      { props: { outline: true, inverse: true }, ink: "#ffffff" },
      { props: { ghost: true, filterTrigger: true }, ink: t["muted-foreground"] },
      { props: { ghost: true, scopeTrigger: true }, ink: t.foreground },
    ];
    for (const { props, ink } of cases) {
      const { unmount } = render(
        <ThemeProvider light solid>
          <Button {...props} iconLeft={<Probe id="g" sparkles />}>Label</Button>
        </ThemeProvider>,
      );
      expect(seen.g, JSON.stringify(props)).toBe(ink);
      unmount();
    }
  });

  it("keeps an explicit tone or colour over the button's ink", () => {
    const t = lightColors;
    render(
      <ThemeProvider light solid>
        <Button primary iconLeft={<Probe id="toned" trash2 destructive />} iconRight={<Probe id="muted" chevronDown muted />}>Delete</Button>
      </ThemeProvider>,
    );
    expect(seen.toned).toBe(t.destructive);
    // `muted` is the third ink (the hand-off's --tx3, Foundations icon.09).
    expect(seen.muted).toBe(t["subtle-foreground"]);
    // Icon's precedence: the tone, then the kit-internal `color`, then the ink, then the foreground.
    expect(strokeOf({ primary: true }, t, "#abcdef")).toBe(primaryText(t));
    expect(strokeOf({ color: "#123456" }, t, "#abcdef")).toBe("#123456");
    expect(strokeOf({}, t, "#abcdef")).toBe("#abcdef");
    expect(strokeOf({}, t)).toBe(t.foreground);
    expect(strokeOf({}, t, undefined)).toBe(t.foreground);
  });

  it("gives a disabled button's Icon the disabled label ink, inside the skin's dimmed box", () => {
    const t = lightColors;
    const { container } = render(
      <ThemeProvider light solid>
        <Button primary disabled testID="btn" iconLeft={<Probe id="g" sparkles />}>Save changes</Button>
      </ThemeProvider>,
    );
    expect(seen.g).toBe(webSkin.label(t, "primary", "base", opts(true)).color as string);
    expect(seen.g).toBe(webSkin.foreground(t, "primary", opts(true)));
    expect(webSkin.container(t, "primary", "base", opts(true)).opacity).toBe(0.4);
    expect((container.querySelector('[data-testid="btn"]') as HTMLElement).getAttribute("aria-disabled")).toBe("true");
  });

  it("paints the icon-only body's glyph in the ink too", () => {
    render(
      <ThemeProvider light solid>
        <Button primary icon accessibilityLabel="Add item" iconLeft={<Probe id="g" plus />} />
      </ThemeProvider>,
    );
    expect(seen.g).toBe(actionInk(lightColors));
  });

  it("hands the same ink on iOS and Android, from each skin's own label", () => {
    const t = lightColors;
    for (const [name, Native, skin] of [["ios", IOSButton, iosSkin], ["android", AndroidButton, androidSkin]] as const) {
      const { unmount } = render(
        <ThemeProvider light solid>
          <Native primary iconLeft={<Probe id="p" sparkles />}>Save</Native>
          <Native outline quiet iconLeft={<Probe id="q" sparkles />}>Save</Native>
        </ThemeProvider>,
      );
      expect(seen.p, name).toBe(skin.label(t, "primary", "base", opts()).color as string);
      expect(seen.q, name).toBe(t["muted-foreground"]);
      unmount();
    }
  });

  it("costs an Icon on the page nothing: no provider, the foreground", () => {
    const t: ColorTokens = lightColors;
    render(
      <ThemeProvider light solid>
        <Probe id="page" sparkles />
        <InkProvider ink={undefined}><Probe id="unset" sparkles /></InkProvider>
        <InkProvider ink="#ff0000"><Probe id="set" sparkles /></InkProvider>
      </ThemeProvider>,
    );
    expect(seen.page).toBe(t.foreground);
    expect(seen.unset).toBe(t.foreground);
    expect(seen.set).toBe("#ff0000");
  });
});
