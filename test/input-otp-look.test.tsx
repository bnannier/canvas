import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, act, screen } from "@testing-library/react";
import { createRef } from "react";
import type { TextInput } from "react-native";

import { ThemeProvider } from "../src/style/theme.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/input-otp/input-otp.styles.ts";
import { webSkin as inputWeb } from "../src/atoms/input/input.styles.ts";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";

// The v4 hand-off's code field (tools/v4/handoff/cv-kit-inputs.js `K.def('input-otp')`):
// separated sunken cells 8 apart, w x round(w * 1.18), the mono digit at round(w * 0.45),
// the active cell's ring edge and the Input's accent halo, a 12 wide dash, a 1.5 wide
// accent caret 40% of the cell, disabled at 0.45. iOS and Android ship no code control,
// so they draw the same cells at their own field corner.

afterEach(cleanup);

const rest = { active: false, filled: false, groupStart: true, groupEnd: true };

describe("the InputOTP cells follow the hand-off", () => {
  const t = lightColors;
  it("sizes the cells 36, 44 and 52 wide at 1.18 times as tall, 8 apart", () => {
    for (const [size, w, h] of [["small", 36, 42], ["base", 44, 52], ["large", 52, 61]] as const) {
      expect(webSkin.cell(t, size, rest)).toMatchObject({ width: w, height: h });
      expect(webSkin.gap(size)).toBe(8);
    }
  });
  it("is the sunken well with the field hairline, at each platform's field corner", () => {
    expect(webSkin.cell(t, "base", rest)).toMatchObject({ backgroundColor: t["surface-sunken"], borderWidth: 1, borderColor: t["field-border"], borderRadius: 10 });
    expect(iosSkin.cell(t, "base", rest)).toMatchObject({ borderRadius: 8, borderCurve: "continuous", backgroundColor: t["surface-sunken"] });
    expect(androidSkin.cell(t, "base", rest)).toMatchObject({ borderRadius: 4, backgroundColor: t["surface-sunken"] });
  });
  it("rounds every cell's corners, inner seams included, since the cells are separated", () => {
    const inner = webSkin.cell(t, "base", { active: false, filled: false, groupStart: false, groupEnd: false });
    expect(inner.borderRadius).toBe(10);
  });
  it("paints the active cell's ring edge with the Input's accent halo", () => {
    for (const c of [lightColors, darkColors]) {
      const active = webSkin.cell(c, "base", { ...rest, active: true });
      expect(active.borderColor).toBe(c.ring);
      expect(active.boxShadow).toBe(inputWeb.focusHalo!(c, false)!.boxShadow);
    }
    expect(webSkin.cell(t, "base", rest).boxShadow).toBeUndefined();
  });
  it("sets the digit in the mono face at 500 and 0.45 of the cell", () => {
    expect(webSkin.digit(t, "small")).toMatchObject({ fontFamily: MONO_FONT, fontWeight: "500", fontSize: 16 });
    expect(webSkin.digit(t, "base").fontSize).toBe(20);
    expect(webSkin.digit(t, "large").fontSize).toBe(23);
  });
  it("draws the dash in a 12 wide slot in the subtle ink", () => {
    expect(webSkin.separator(t, "base")).toMatchObject({ width: 12, textAlign: "center", color: t["subtle-foreground"] });
  });
  it("draws a 1.5 wide accent caret 40% of the cell, static on the web and blinking natively", () => {
    expect(webSkin.caret(t, "base")).toEqual({ width: 1.5, height: "40%", backgroundColor: t.primary });
    expect([webSkin.caretBlink, iosSkin.caretBlink, androidSkin.caretBlink]).toEqual([false, true, true]);
  });
  it("dims to 0.45 when disabled on every platform", () => {
    expect([webSkin.disabledOpacity, iosSkin.disabledOpacity, androidSkin.disabledOpacity]).toEqual([0.45, 0.45, 0.45]);
  });
});

describe("the rendered InputOTP", () => {
  it("forwards the original input with its focus, blur and isFocused methods", () => {
    const ref = createRef<TextInput>();
    render(<ThemeProvider light solid><InputOTP ref={ref} /></ThemeProvider>);
    expect(ref.current).toBe(screen.getByLabelText("One-time code") as unknown as TextInput);
    expect(ref.current?.isFocused()).toBe(false);
    act(() => ref.current?.focus());
    expect(ref.current?.isFocused()).toBe(true);
    act(() => ref.current?.blur());
    expect(ref.current?.isFocused()).toBe(false);
  });

  it("lays the cells and the group dash out 8 apart", () => {
    const { container } = render(
      <ThemeProvider light solid>
        <InputOTP length={6} groups={3} testID="otp" />
      </ThemeProvider>,
    );
    expect(screen.getByText("–")).toBeTruthy();
    const row = screen.getByTestId("otp").firstElementChild as HTMLElement;
    expect(row.style.gap).toBe("8px");
    expect(container.querySelectorAll('[style*="width: 44px"]').length).toBe(6);
  });
  it("rings the cell the next digit lands in", () => {
    render(
      <ThemeProvider light solid>
        <InputOTP length={4} defaultValue="48" testID="otp" />
      </ThemeProvider>,
    );
    const input = screen.getByLabelText("One-time code");
    act(() => (input as HTMLInputElement).focus());
    const cells = [...screen.getByTestId("otp").querySelectorAll('[style*="width: 44px"]')] as HTMLElement[];
    const ringed = cells.filter((c) => c.style.boxShadow !== "");
    expect(ringed).toHaveLength(1);
    expect(cells.indexOf(ringed[0]!)).toBe(2);
  });
});
