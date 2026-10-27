import { tabularNums } from "../src/style/numerals";
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { Textarea as TextareaWeb } from "../src/atoms/textarea/textarea.tsx";
import { Textarea as TextareaIOS } from "../src/atoms/textarea/textarea.ios.tsx";
import { Textarea as TextareaAndroid } from "../src/atoms/textarea/textarea.android.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/textarea/textarea.styles.ts";
import { webSkin as inputWeb } from "../src/atoms/input/input.styles.ts";

// The Textarea skins pinned to the Canvas v4 hand-off (cv-kit-inputs.js `K.def('textarea')`,
// the iOS and Android rows `P.textarea` in cv-kit-platform.js, the flush override in
// cv-kit-code2.js).

afterEach(cleanup);
const t = lightColors;
const d = darkColors;
const ui = (n: ReactNode) => render(<ThemeProvider light solid>{n}</ThemeProvider>);

describe("the web Textarea is the hand-off's sunken well", () => {
  it("sits on `surface-sunken` at the 10px field corner, inset 10 by 12", () => {
    expect(webSkin.field(t, { focused: false, error: false })).toMatchObject({ borderRadius: 10, borderWidth: 1, backgroundColor: t["surface-sunken"], paddingVertical: 10, paddingHorizontal: 12 });
  });
  it("rests on `field-border`, hovers on the subtle ink, focuses on `ring`, errors on `destructive`", () => {
    expect(webSkin.field(t, { focused: false, error: false }).borderColor).toBe(t["field-border"]);
    expect(webSkin.field(t, { focused: false, error: false, hovered: true }).borderColor).toBe(t["subtle-foreground"]);
    expect(webSkin.field(t, { focused: true, error: false, hovered: true }).borderColor).toBe(t.ring);
    expect(webSkin.field(t, { focused: true, error: true }).borderColor).toBe(t.destructive);
    expect(webSkin.hover).toBe(true);
  });
  it("draws the Input's accent halo on focus, errored or not", () => {
    expect(webSkin.focusHalo!(d)).toEqual(inputWeb.focusHalo!(d, false)!);
    expect(webSkin.focusHalo!(t)).toEqual(inputWeb.focusHalo!(t, false)!);
  });
  it("sets 400 type at 13/14/16 on a 1.55 line", () => {
    expect(webSkin.text("small")).toEqual({ fontSize: 13, lineHeight: 20.15, fontWeight: "400" });
    expect(webSkin.text("base")).toEqual({ fontSize: 14, lineHeight: 21.7, fontWeight: "400" });
    expect(webSkin.text("large")).toEqual({ fontSize: 16, lineHeight: 24.8, fontWeight: "400" });
  });
  it("is rows x 22 (25 large) + 20 tall, 4 rows by default, at least one row", () => {
    expect(webSkin.minHeight(undefined, "base")).toEqual({ minHeight: 108 });
    expect(webSkin.minHeight(3, "small")).toEqual({ minHeight: 86 });
    expect(webSkin.minHeight(4, "large")).toEqual({ minHeight: 120 });
    expect(webSkin.minHeight(0, "base")).toEqual({ minHeight: 42 });
  });
  it("titles the field in the 500 13px label role, muted, 6 above, and dims to 0.45", () => {
    expect(webSkin.labelAbove(t, "base")).toMatchObject({ fontSize: 13, fontWeight: "500", color: t["muted-foreground"] });
    expect(webSkin.labelGap).toBe(6);
    expect(webSkin.placeholder(t)).toBe(t["subtle-foreground"]);
    expect(webSkin.disabledOpacity).toBe(0.45);
  });
  it("counts in 400 11px mono, subtle, 6 under the field, as N / max", () => {
    expect(webSkin.count(t, false)).toMatchObject({ fontSize: 11, fontWeight: "400", color: t["subtle-foreground"] });
    expect(webSkin.count(t, false).fontFamily).toBeTruthy();
    expect(webSkin.countRow).toEqual({ gap: 6, inset: 0 });
    expect(webSkin.countJoin).toBe(" / ");
  });
  it("drops the frame and fill when flush, for a 12 by 14 inset", () => {
    expect(webSkin.flushInset).toEqual({ paddingHorizontal: 14, paddingVertical: 12 });
  });
});

describe("the iOS Textarea is the hand-off's iOS field box", () => {
  it("is the Input's card box at the 8pt corner with the error wash", () => {
    expect(iosSkin.field(t, { focused: false, error: false })).toMatchObject({ borderRadius: 8, backgroundColor: t.card, borderColor: t["field-border"], paddingVertical: 10, paddingHorizontal: 12 });
    expect(iosSkin.field(t, { focused: false, error: true }).backgroundColor).not.toBe(t.card);
    expect(iosSkin.hover).toBeFalsy();
    expect(iosSkin.focusHalo).toBeUndefined();
  });
  it("takes the iOS field type ladder and rows x the line + 20", () => {
    expect(iosSkin.text("small")).toEqual({ fontSize: 13, lineHeight: 16 });
    expect(iosSkin.text("base")).toEqual({ fontSize: 16, lineHeight: 24 });
    expect(iosSkin.text("large")).toEqual({ fontSize: 17, lineHeight: 26 });
    expect(iosSkin.minHeight(undefined, "base")).toEqual({ minHeight: 116 });
  });
  it("counts in 13pt tabular figures, subtle, 8 under the field, as N/max", () => {
    expect(iosSkin.count(t, false)).toMatchObject({ ...tabularNums(), fontSize: 13, color: t["subtle-foreground"] });
    expect(iosSkin.countRow).toEqual({ gap: 8, inset: 0 });
    expect(iosSkin.countJoin).toBe("/");
    expect(iosSkin.labelGap).toBe(8);
    expect(iosSkin.disabledOpacity).toBe(0.5);
  });
});

describe("the Android Textarea is the hand-off's M3 filled field", () => {
  it("is a muted box inset 16, 8 on top, inside a constant 10dp indicator band", () => {
    const rest = androidSkin.field(t, { focused: false, error: false });
    const active = androidSkin.field(t, { focused: true, error: false });
    expect(rest).toMatchObject({ backgroundColor: t.muted, paddingHorizontal: 16, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: t["muted-foreground"], borderTopStartRadius: 4 });
    expect(active).toMatchObject({ borderBottomWidth: 2, borderBottomColor: t.ring });
    expect((rest.borderBottomWidth as number) + (rest.paddingBottom as number)).toBe(10);
    expect((active.borderBottomWidth as number) + (active.paddingBottom as number)).toBe(10);
    expect(androidSkin.field(t, { focused: true, error: true }).borderBottomColor).toBe(t.destructive);
  });
  it("takes body-large per size and rows x the line + 34", () => {
    expect(androidSkin.text("base")).toMatchObject({ fontSize: 16, lineHeight: 24 });
    expect(androidSkin.labelRest!(t, "small")).toMatchObject({ fontSize: 14, lineHeight: 20 });
    expect(androidSkin.minHeight(undefined, "base")).toEqual({ minHeight: 130 });
    expect(androidSkin.labelReserve!("large")).toEqual({ paddingTop: 24 });
    expect(androidSkin.labelInset).toBe(16);
  });
  it("counts in the supporting-text row, 4 under the field and 16 in", () => {
    expect(androidSkin.count(t, false)).toMatchObject({ fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] });
    expect(androidSkin.countRow).toEqual({ gap: 4, inset: 16 });
    expect(androidSkin.disabledOpacity).toBe(0.38);
  });
});

describe("the rendered Textarea", () => {
  it("draws the web count as N / max and the iOS one as N/max", () => {
    ui(<TextareaWeb showCount maxLength={280} defaultValue="hello" accessibilityLabel="Notes" />);
    expect(screen.getByText("5 / 280")).toBeTruthy();
    cleanup();
    ui(<TextareaIOS showCount maxLength={280} defaultValue="hello" accessibilityLabel="Notes" />);
    expect(screen.getByText("5/280")).toBeTruthy();
  });
  it("sits the labelled web count 6 under the field and the Android count 4 under it, 16 in", () => {
    ui(<TextareaWeb label="Notes" showCount defaultValue="hi" />);
    const web = screen.getByText("2").parentElement as HTMLElement;
    expect(web.style.marginTop).toBe("0px");
    expect((web.parentElement as HTMLElement).style.gap).toBe("6px");
    cleanup();
    ui(<TextareaAndroid label="Notes" showCount defaultValue="hi" />);
    const android = screen.getByText("2").parentElement as HTMLElement;
    expect(android.style.marginTop).toBe("4px");
    expect(android.style.paddingLeft).toBe("16px");
  });
  it("haloes the focused web field", () => {
    ui(<TextareaWeb accessibilityLabel="Notes" />);
    const field = screen.getByRole("textbox", { name: "Notes" }) as HTMLElement;
    expect(field.style.boxShadow).toBe("");
    fireEvent.focus(field);
    expect(field.style.boxShadow).toMatch(/^0 0 0 4px /);
  });
  it("dims a disabled field to the skin's opacity", () => {
    const { container } = ui(<TextareaWeb disabled accessibilityLabel="Notes" />);
    expect((container.querySelector("textarea")!.parentElement!.parentElement as HTMLElement).style.opacity).toBe("0.45");
  });
  it("drops the flush field's fill and takes the 12 by 14 inset", () => {
    ui(<TextareaWeb flush accessibilityLabel="Notes" />);
    const field = screen.getByRole("textbox", { name: "Notes" }) as HTMLElement;
    expect(field.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    expect(field.style.padding).toBe("12px 14px");
  });
});
