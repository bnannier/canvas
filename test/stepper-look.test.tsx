import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/stepper/stepper.styles.ts";
import { lightColors } from "../src/style/tokens.ts";

// The hand-off's stepper (`K.def('stepper')` in tools/v4/handoff/cv-kit-controls.js, and its
// platform rows `K.PF.stepper` in cv-kit-platform.js).

afterEach(cleanup);

describe("Stepper takes the hand-off's look", () => {
  it("web: one 40px box at the 10px corner, the raised fill inside the field border, square cells, no dividers", () => {
    const group = webSkin.group(lightColors, "base", false, false);
    expect(group).toMatchObject({ height: 40, borderWidth: 1, borderRadius: 10, backgroundColor: lightColors.popover, borderColor: lightColors["field-border"] });
    expect(webSkin.group(lightColors, "small", false, false).height).toBe(32);
    expect(webSkin.group(lightColors, "large", false, false).height).toBe(48);
    expect(webSkin.button(lightColors, "base", "left", false, false).width).toBe(38);
    expect(webSkin.divider).toBeNull();
    expect(webSkin.field(lightColors, "base", false)).toMatchObject({ fontSize: 14, fontWeight: "500", width: 40 });
    expect(webSkin.field(lightColors, "large", false).fontSize).toBe(16);
    expect(webSkin.glyph(lightColors, "base", false)).toEqual({ color: lightColors.foreground, size: 15 });
    expect(webSkin.buttonHover!(lightColors)).toEqual({ backgroundColor: lightColors.secondary });
    expect(webSkin.labelAbove(lightColors, "large")).toMatchObject({ fontSize: 13, fontWeight: "500", color: lightColors["muted-foreground"] });
    expect(webSkin.disabledOpacity).toBe(0.4);
  });

  it("iOS: the capsule pill with the 52pt value column, 0.5 disabled", () => {
    expect(iosSkin.group(lightColors, "base", false, false)).toMatchObject({ height: 32, borderRadius: 9999, backgroundColor: lightColors.secondary });
    expect(iosSkin.field(lightColors, "base", false)).toMatchObject({ fontSize: 17, width: 52, textAlign: "right", paddingRight: 10 });
    expect(iosSkin.disabledOpacity).toBe(0.5);
  });

  it("Android: outlined circles in the field border with accent-ink glyphs, a 56dp value, 0.38 disabled", () => {
    expect(androidSkin.button(lightColors, "base", "left", false, false)).toMatchObject({ width: 40, height: 40, borderWidth: 1, borderColor: lightColors["field-border"] });
    expect(androidSkin.glyph(lightColors, "base", false)).toEqual({ color: lightColors["primary-text"], size: 20 });
    expect(androidSkin.glyph(lightColors, "base", true).color).toBe(lightColors["subtle-foreground"]);
    expect(androidSkin.field(lightColors, "base", false)).toMatchObject({ fontSize: 16, width: 56 });
    expect(androidSkin.disabledOpacity).toBe(0.38);
  });

  it("sets the label above the control and the description under it", () => {
    render(<ThemeProvider><Stepper label="Spacing" description="In grid units" defaultValue={2} /></ThemeProvider>);
    const label = screen.getByText("Spacing");
    const description = screen.getByText("In grid units");
    const value = screen.getByDisplayValue("2");
    const order = (a: Node, b: Node) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(order(label, value)).toBeTruthy();
    expect(order(value, description)).toBeTruthy();
  });
});
