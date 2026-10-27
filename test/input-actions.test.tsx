import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { Input as InputWeb } from "../src/atoms/input/input.tsx";
import { Input as InputIOS } from "../src/atoms/input/input.ios.tsx";
import { Input as InputAndroid } from "../src/atoms/input/input.android.tsx";
import { iosSkin, webSkin, androidSkin } from "../src/atoms/input/input.styles.ts";

// The trailing action glyphs the iOS input-field reference draws (its Password and
// Search fields): `passwordToggle` reveals and re-masks a secure value, `clearable`
// empties the field. Both are shell behaviour shared by the three skins, so each
// is asserted on every skin; the state-tinted glyph is an iOS skin decision and is
// asserted on the skin objects.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

const SKINS = [
  ["web", InputWeb],
  ["ios", InputIOS],
  ["android", InputAndroid],
] as const;

describe("Input passwordToggle", () => {
  for (const [plat, Input] of SKINS) {
    it(`${plat}: starts masked and the eye reveals then re-masks the value`, () => {
      ui(<Input label="Password" secureTextEntry passwordToggle defaultValue="hunter2" />);
      const field = screen.getByLabelText("Password") as HTMLInputElement;
      expect(field.type).toBe("password");
      const eye = screen.getByRole("button", { name: "Show password" });
      fireEvent.click(eye);
      expect(field.type).toBe("text");
      expect(screen.getByRole("button", { name: "Hide password" })).toBe(eye);
      fireEvent.click(eye);
      expect(field.type).toBe("password");
    });
  }

  // The literal-titled journey the interaction registry (tools/interactions) cites.
  it("the eye reveals a masked password and re-masks it", () => {
    ui(<InputWeb label="Password" secureTextEntry passwordToggle defaultValue="hunter2" />);
    const field = screen.getByLabelText("Password") as HTMLInputElement;
    expect(field.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(field.type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(field.type).toBe("password");
  });

  it("renders no eye without secureTextEntry (nothing to reveal)", () => {
    ui(<InputWeb label="Name" passwordToggle defaultValue="Ada" />);
    expect(screen.queryByRole("button", { name: /password/ })).toBeNull();
  });
});

describe("Input clearable", () => {
  for (const [plat, Input] of SKINS) {
    it(`${plat}: the clear button appears with text, empties the field, and reports ""`, () => {
      const seen: string[] = [];
      ui(<Input label="Search" clearable defaultValue="canvas" onChangeText={(v) => seen.push(v)} />);
      const field = screen.getByLabelText("Search") as HTMLInputElement;
      const clear = screen.getByRole("button", { name: "Clear text" });
      fireEvent.click(clear);
      expect(seen).toEqual([""]);
      expect(field.value).toBe("");
      // Nothing left to clear: the button goes away until the field has text again.
      expect(screen.queryByRole("button", { name: "Clear text" })).toBeNull();
      fireEvent.change(field, { target: { value: "c" } });
      expect(screen.getByRole("button", { name: "Clear text" })).toBeTruthy();
    });
  }

  // The literal-titled journey the interaction registry (tools/interactions) cites.
  it("the clear button empties the field and reports an empty value", () => {
    const seen: string[] = [];
    ui(<InputWeb label="Search" clearable defaultValue="canvas" onChangeText={(v) => seen.push(v)} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear text" }));
    expect(seen).toEqual([""]);
    expect((screen.getByLabelText("Search") as HTMLInputElement).value).toBe("");
  });

  it("stays hidden on an empty field and on a read-only one", () => {
    ui(
      <>
        <InputWeb label="Empty" clearable />
        <InputWeb label="Locked" clearable readOnly defaultValue="fixed" />
      </>,
    );
    expect(screen.queryByRole("button", { name: "Clear text" })).toBeNull();
  });

  it("clears a controlled field through onChangeText", () => {
    const seen: string[] = [];
    ui(<InputWeb label="Search" clearable value="canvas" onChangeText={(v) => seen.push(v)} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear text" }));
    expect(seen).toEqual([""]);
  });
});

describe("the iOS glyph follows the field state", () => {
  const t = lightColors;
  it("rests on the subtle ink for a passive glyph and `muted-foreground` for an action glyph", () => {
    expect(iosSkin.iconColor(t, { focused: false, error: false, action: false })).toBe(t["subtle-foreground"]);
    expect(iosSkin.iconColor(t, { focused: false, error: false, action: true })).toBe(t["muted-foreground"]);
  });
  it("turns `ring` on focus and `destructive` on error, error winning", () => {
    expect(iosSkin.iconColor(t, { focused: true, error: false, action: false })).toBe(t.ring);
    expect(iosSkin.iconColor(t, { focused: false, error: true, action: true })).toBe(t.destructive);
    expect(iosSkin.iconColor(t, { focused: true, error: true, action: false })).toBe(t.destructive);
  });
  it("is a 20px glyph on iOS and Android and 16px on the web", () => {
    expect(iosSkin.iconSize).toBe(20);
    expect(webSkin.iconSize).toBe(16);
    expect(androidSkin.iconSize).toBe(20);
  });
  it("keeps the web glyphs subtle and the Android glyphs muted in every state", () => {
    for (const focused of [true, false]) for (const error of [true, false]) {
      expect(webSkin.iconColor(t, { focused, error, action: true })).toBe(t["subtle-foreground"]);
      expect(androidSkin.iconColor(t, { focused, error, action: true })).toBe(t["muted-foreground"]);
    }
  });
});

describe("the web field box follows the v4 hand-off", () => {
  const t = lightColors;
  const d = darkColors;
  it("is the 40px sunken well with a 400 14px value and the 500 13px label", () => {
    expect(webSkin.bareBox("base").height).toBe(40);
    expect(webSkin.bareBox("small").height).toBe(32);
    expect(webSkin.bareBox("large").height).toBe(48);
    expect(webSkin.groupedHeight("base")).toBe(40);
    expect(webSkin.text(t, "base")).toMatchObject({ fontSize: 14, fontWeight: "400" });
    expect(webSkin.text(t, "small")).toMatchObject({ fontSize: 13, fontWeight: "400" });
    expect(webSkin.labelAbove(t, "base")).toMatchObject({ fontSize: 13, fontWeight: "500", color: t["muted-foreground"] });
    expect(webSkin.bareField(t, "input", false, false)).toMatchObject({ borderRadius: 10, backgroundColor: t["surface-sunken"] });
    expect(webSkin.placeholder(t)).toBe(t["subtle-foreground"]);
    expect(webSkin.disabledOpacity).toBe(0.45);
  });
  it("rests on `field-border`, hovers on the subtle ink, focuses on `ring`, errors on `destructive`", () => {
    expect(webSkin.bareField(t, "input", false, false).borderColor).toBe(t["field-border"]);
    expect(webSkin.groupContainer(t, "input", false, false).borderColor).toBe(t["field-border"]);
    expect(webSkin.bareField(t, "subtle-foreground", false, false).borderColor).toBe(t["subtle-foreground"]);
    expect(webSkin.bareField(t, "ring", true, false).borderColor).toBe(t.ring);
    expect(webSkin.bareField(t, "destructive", false, true).borderColor).toBe(t.destructive);
  });
  it("haloes a focused field in the accent at the hand-off's ion-ring alpha, an errored one in its soft wash", () => {
    // ion-ring is the accent at 35% dark and 28% light: 0.7 of the glow's 50% and 40%.
    expect(webSkin.focusHalo!(d, false)).toEqual({ boxShadow: `0 0 0 4px ${d.glow!.replace(/0\.5\)$/, "0.35)")}` });
    expect(webSkin.focusHalo!(t, false)).toEqual({ boxShadow: `0 0 0 4px ${t.glow!.replace(/0\.4\)$/, "0.28)")}` });
    expect(webSkin.focusHalo!(t, true)).toEqual({ boxShadow: `0 0 0 4px ${t["destructive-soft"]}` });
  });
  it("draws read-only as a dashed edge on no fill", () => {
    expect(webSkin.readOnlyField!(t)).toEqual({ borderStyle: "dashed", backgroundColor: "transparent" });
  });
});

describe("the iOS field box", () => {
  const t = lightColors;
  it("rests on `field-border`, focuses on `ring`, errors on `destructive` with the wash", () => {
    const rest = iosSkin.bareField(t, "input", false, false);
    const focus = iosSkin.bareField(t, "ring", true, false);
    const error = iosSkin.bareField(t, "destructive", false, true);
    expect(rest.borderColor).toBe(t["field-border"]);
    expect(rest.backgroundColor).toBe(t.card);
    expect(focus.borderColor).toBe(t.ring);
    expect(error.borderColor).toBe(t.destructive);
    expect(error.backgroundColor).not.toBe(t.card);
    expect(rest.borderRadius).toBe(8);
  });
});

describe("the clear button follows the hand-off", () => {
  const t = lightColors;
  it("is a 20px `surface-raised` disc under an 11px muted x on the web", () => {
    const d = webSkin.clearDisc!;
    expect([d.size, d.glyph, d.fill(t), d.ink(t)]).toEqual([20, 11, t["surface-raised"], t["muted-foreground"]]);
  });
  it("is a 17pt disc of the foreground at 32% under an 11pt `card` x on iOS, in a box no smaller than the glyphs", () => {
    const d = iosSkin.clearDisc!;
    expect([d.size, d.glyph, d.ink(t)]).toEqual([17, 11, t.card]);
    expect(d.fill(t)).toMatch(/0\.32\)$/);
    // The disc sits centered in the 20pt glyph box, so the 44pt target geometry holds.
    expect(Math.max(iosSkin.iconSize, d.size)).toBe(iosSkin.iconSize);
  });
  it("stays the circled-x glyph on Android", () => {
    expect(androidSkin.clearDisc).toBeUndefined();
  });
  it("renders the disc inside the clear button on the web and iOS, and none on Android", () => {
    for (const [plat, Input] of SKINS) {
      const { unmount } = ui(<Input clearable defaultValue="canvas" accessibilityLabel="Field" />);
      const button = screen.getByRole("button", { name: "Clear text" });
      const disc = [...button.querySelectorAll("div")].find((n) => (n as HTMLElement).style.borderRadius !== "");
      if (plat === "android") expect(disc).toBeUndefined();
      else expect((disc as HTMLElement).style.width).toBe(`${(plat === "web" ? webSkin : iosSkin).clearDisc!.size}px`);
      unmount();
    }
  });
});

describe("the trailing order follows the renderer", () => {
  const before = (a: Element, b: Element) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  for (const [plat, Input] of [["web", InputWeb], ["android", InputAndroid]] as const) {
    it(`${plat}: the passive suffix comes before the clear button`, () => {
      ui(<Input suffix=".canvas.dev" clearable defaultValue="northwind" accessibilityLabel="Workspace URL" />);
      expect(before(screen.getByText(".canvas.dev"), screen.getByRole("button", { name: "Clear text" }))).toBe(true);
    });
  }
  it("ios: the clear button comes before the boxed suffix segment", () => {
    ui(<InputIOS suffix=".canvas.dev" clearable defaultValue="northwind" accessibilityLabel="Workspace URL" />);
    expect(before(screen.getByRole("button", { name: "Clear text" }), screen.getByText(".canvas.dev"))).toBe(true);
  });
  it("keeps the action suffix last on every skin", () => {
    for (const [, Input] of SKINS) {
      const { unmount } = ui(<Input suffix="Copy" action clearable defaultValue="cnv_3f9a" accessibilityLabel="Key" />);
      expect(before(screen.getByRole("button", { name: "Clear text" }), screen.getByText("Copy"))).toBe(true);
      unmount();
    }
  });
});

describe("the Android error glyph", () => {
  it("is declared on Android only", () => {
    expect(androidSkin.errorGlyph).toBe(true);
    expect(webSkin.errorGlyph).toBeFalsy();
    expect(iosSkin.errorGlyph).toBeFalsy();
  });
  it("trails an errored field, bare (keeping its floating label) and grouped, in place of a clear button", () => {
    // The test renderer draws each Icon as an empty aria-hidden node.
    const glyphs = (n: ReactNode) => {
      const { container, unmount } = ui(n);
      const count = [...container.querySelectorAll('[aria-hidden="true"]')].filter((el) => el.childElementCount === 0).length;
      unmount();
      return count;
    };
    expect(glyphs(<InputAndroid label="Workspace" />)).toBe(0);
    expect(glyphs(<InputAndroid label="Workspace" error />)).toBe(1);
    expect(glyphs(<InputAndroid suffix="GB" error accessibilityLabel="Storage" />)).toBe(1);
    // A clear button takes the alert's place, as in the renderer: its circled x is the one glyph.
    expect(glyphs(<InputAndroid clearable error defaultValue="x" accessibilityLabel="Field" />)).toBe(1);
    expect(glyphs(<InputWeb label="Workspace" error />)).toBe(0);
  });
});

describe("the Android read-only frame", () => {
  const t = lightColors;
  it("draws a dashed `field-border` frame with a subtle underline over a fill-less field", () => {
    const { frame, underline } = androidSkin.readOnlyFrame!(t);
    expect(frame).toMatchObject({ borderWidth: 1, borderStyle: "dashed", borderColor: t["field-border"] });
    expect(underline).toMatchObject({ position: "absolute", bottom: 0, height: 1, backgroundColor: t["subtle-foreground"] });
  });
  it("clears the field's own resting indicator for the frame's underline, and keeps it on focus and error", () => {
    expect(androidSkin.readOnlyField!(t, { focused: false, error: false })).toEqual({ backgroundColor: "transparent", borderBottomColor: "transparent" });
    expect(androidSkin.readOnlyField!(t, { focused: true, error: false })).toEqual({ backgroundColor: "transparent" });
    expect(androidSkin.readOnlyField!(t, { focused: false, error: true })).toEqual({ backgroundColor: "transparent" });
  });
  it("never changes the field's border or padding, so the content box and the label stay put", () => {
    for (const focused of [false, true]) {
      const look = androidSkin.readOnlyField!(t, { focused, error: false });
      for (const key of Object.keys(look)) expect(key).toMatch(/^(backgroundColor|borderBottomColor)$/);
    }
  });
});

describe("the iOS action suffix", () => {
  it("labels in the hand-off's 600 15pt brand ink", () => {
    expect(iosSkin.actionText(lightColors)).toMatchObject({ fontSize: 15, fontWeight: "600" });
  });
});
