import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { actionFill, actionInk } from "../src/style/action.ts";
import { primaryText } from "../src/style/primary-text.ts";
import { Button } from "../src/atoms/button/button.tsx";
import { Button as IOSButton } from "../src/atoms/button/button.ios.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { androidSkin, iosSkin, webSkin, type Intent, type Size } from "../src/atoms/button/button.styles.ts";

// The web Button is the v4 hand-off's control (`K.btn`, tools/v4/handoff/cv-kit.js): 32 / 40
// / 48 tall, the 10 control corner, 12 / 16 / 22 of side padding, 500 labels at 13 / 14 /
// 16, a 1px border on every intent but link, the lit top edge on the filled intents. The
// filled intents rise and brighten under the pointer, the others take the `secondary`
// wash; a press scales to 0.96 and darkens; a disabled button fades to 0.4. `raised` is the
// accent's glow under a primary. The iOS and Android skins keep their capsule and stadium
// in the same colours.

afterEach(cleanup);

const t = lightColors;
const opts = (disabled = false) => ({ icon: false, block: false, dim: disabled, disabled });
const look = (intent: Intent, size: Size = "base", disabled = false) => ({
  box: webSkin.container(t, intent, size, opts(disabled)),
  label: webSkin.label(t, intent, size, opts(disabled)),
});
const height = (skin: typeof webSkin, intent: Intent, size: Size) => {
  const box = skin.container(t, intent, size, opts());
  if (typeof box.height === "number") return box.height;
  const label = skin.label(t, intent, size, opts());
  return 2 * (box.paddingVertical as number) + (label.lineHeight as number) + 2 * (box.borderWidth as number);
};

describe("the web Button is the hand-off's control", () => {
  it("preserves Argus inverse, quiet and workflow action dimensions", () => {
    const base = opts();
    expect(webSkin.label(t, "outline", "small", { ...base, inverse: true }).color).toBe("#ffffff");
    expect(webSkin.container(t, "outline", "small", { ...base, inverse: true }).borderColor).toBe("rgba(255, 255, 255, 0.5)");
    expect(webSkin.label(t, "outline", "base", { ...base, quiet: true }).color).toBe(t["muted-foreground"]);
    expect(webSkin.container(t, "outline", "base", { ...base, quiet: true }).borderColor).toBe(t.border);
    expect(webSkin.container(t, "secondary", "small", { ...base, consistent: true }).minWidth).toBe(78);
    expect(webSkin.surround?.({ ...base, comfortable: true })).toEqual({ paddingHorizontal: 16, paddingVertical: 7 });
  });

  it("draws each intent in the hand-off's colours, at the control corner", () => {
    const expected: Record<Intent, { fill: string; border: string; label: string }> = {
      primary: { fill: actionFill(t), border: "transparent", label: actionInk(t) },
      destructive: { fill: t.destructive, border: "transparent", label: t["destructive-foreground"] },
      secondary: { fill: t.secondary, border: t.input, label: t["secondary-foreground"] },
      outline: { fill: "transparent", border: t.input, label: t.foreground },
      ghost: { fill: "transparent", border: "transparent", label: t.foreground },
      link: { fill: "transparent", border: "transparent", label: primaryText(t) },
    };
    for (const [intent, colours] of Object.entries(expected) as [Intent, (typeof expected)[Intent]][]) {
      const { box, label } = look(intent);
      expect({ fill: box.backgroundColor, border: box.borderColor, label: label.color }, intent).toEqual(colours);
      expect(box.borderRadius, intent).toBe(10);
      expect(box.borderWidth, intent).toBe(intent === "link" ? 0 : 1);
      expect(label.textDecorationLine, intent).toBe(intent === "link" ? "underline" : undefined);
    }
  });

  it("lights the top edge of the filled intents and the secondary well", () => {
    expect(look("primary").box.boxShadow).toBe("inset 0px 1px 0px rgba(255, 255, 255, 0.28)");
    expect(look("destructive").box.boxShadow).toBe("inset 0px 1px 0px rgba(255, 255, 255, 0.28)");
    expect(look("secondary").box.boxShadow).toBe(`inset 0px 1px 0px ${t.highlight}`);
    for (const intent of ["outline", "ghost", "link"] as const) expect(look(intent).box.boxShadow, intent).toBeUndefined();
  });

  it("sets every label in 500, at 13 / 14 / 16", () => {
    for (const intent of ["primary", "destructive", "secondary", "outline", "ghost", "link"] as const) {
      expect(look(intent).label.fontWeight, intent).toBe("500");
      expect(look(intent).label.letterSpacing, intent).toBeUndefined();
    }
    expect(look("primary", "small").label.fontSize).toBe(13);
    expect(look("primary").label.fontSize).toBe(14);
    expect(look("primary", "large").label.fontSize).toBe(16);
  });

  it("is 32, 40 and 48 tall with 12, 16 and 22 of side padding; the icon square is its height", () => {
    expect(height(webSkin, "outline", "small")).toBe(32);
    expect(height(webSkin, "primary", "base")).toBe(40);
    expect(height(webSkin, "secondary", "large")).toBe(48);
    expect(look("primary", "small").box.paddingHorizontal).toBe(12);
    expect(look("primary").box.paddingHorizontal).toBe(16);
    expect(look("primary", "large").box.paddingHorizontal).toBe(22);
    expect(look("primary").box.gap).toBe(8);
    expect(look("link").box).toMatchObject({ paddingVertical: 0, paddingHorizontal: 2 });
    for (const [size, side] of [["small", 32], ["base", 40], ["large", 48]] as const) {
      expect(webSkin.container(t, "primary", size, { ...opts(), icon: true }), size).toMatchObject({ width: side, height: side });
    }
  });

  it("fades a disabled button to 0.4 in its own colours; a loading one keeps its full look", () => {
    for (const intent of ["primary", "destructive", "secondary", "outline"] as const) {
      const { box, label } = look(intent, "base", true);
      expect(box.opacity, intent).toBe(0.4);
      expect(box.backgroundColor, intent).toBe(look(intent).box.backgroundColor);
      expect(label.color, intent).toBe(look(intent).label.color);
    }
    expect(webSkin.container(t, "primary", "base", { icon: false, block: false, dim: true, disabled: false }).opacity).toBeUndefined();
  });

  it("washes the unfilled looks at once on hover, raises a secondary well, and never while disabled", () => {
    render(
      <ThemeProvider light solid>
        <Button secondary onPress={() => {}}>Review</Button>
        <Button outline onPress={() => {}}>Details</Button>
        <Button ghost onPress={() => {}}>Cancel</Button>
        <Button link onPress={() => {}}>Learn more</Button>
        <Button outline disabled onPress={() => {}}>Pending</Button>
      </ThemeProvider>,
    );
    const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",\\s*");
    const wash = new RegExp(`rgba\\(${rgb(t.secondary)},\\s*1\\.00\\)`);
    const raised = new RegExp(`rgba\\(${rgb(t["surface-raised"]!)},\\s*1\\.00\\)`);
    for (const [name, fill] of [["Review", raised], ["Details", wash], ["Cancel", wash], ["Learn more", wash]] as const) {
      const button = screen.getByRole("button", { name });
      expect(button.style.getPropertyValue("transition-property"), name).toBe("");
      fireEvent.pointerEnter(button, { pointerType: "mouse" });
      expect(button.style.backgroundColor, name).toMatch(fill);
      fireEvent.pointerLeave(button);
      expect(button.style.backgroundColor, name).not.toMatch(fill);
    }
    const disabled = screen.getByRole("button", { name: "Pending" });
    fireEvent.pointerEnter(disabled, { pointerType: "mouse" });
    expect(disabled.style.backgroundColor).not.toMatch(wash);
  });

  it("brightens and lifts a filled button under the pointer, and scales and darkens it while pressed", async () => {
    render(<ThemeProvider light solid><Button primary onPress={() => {}}>Save</Button><Button destructive onPress={() => {}}>Delete</Button></ThemeProvider>);
    for (const name of ["Save", "Delete"]) {
      const button = screen.getByRole("button", { name });
      fireEvent.pointerEnter(button, { pointerType: "mouse" });
      expect(button.style.filter, name).toBe("brightness(1.07)");
      expect(button.style.transform, name).toBe("translateY(-1px)");
      fireEvent.mouseDown(button, { button: 0, buttons: 1, clientX: 1, clientY: 1 });
      await waitFor(() => expect(button.style.filter, name).toBe("brightness(0.92)"));
      expect(button.style.transform, name).toBe("scale(0.96)");
      fireEvent.mouseUp(button, { button: 0, buttons: 0, clientX: 1, clientY: 1 });
      fireEvent.pointerLeave(button);
      await waitFor(() => expect(button.style.filter, name).toBe(""));
    }
  });

  it("keeps a steady press still", async () => {
    render(<ThemeProvider light solid><Button ghost steadyPress onPress={() => {}}>Menu</Button><Button ghost onPress={() => {}}>Back</Button></ThemeProvider>);
    const moving = screen.getByRole("button", { name: "Back" });
    fireEvent.mouseDown(moving, { button: 0, buttons: 1, clientX: 1, clientY: 1 });
    await waitFor(() => expect(moving.style.transform).toBe("scale(0.96)"));
    fireEvent.mouseUp(moving, { button: 0, buttons: 0, clientX: 1, clientY: 1 });
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.mouseDown(button, { button: 0, buttons: 1, clientX: 1, clientY: 1 });
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(button.style.transform).toBe("");
    fireEvent.mouseUp(button, { button: 0, buttons: 0, clientX: 1, clientY: 1 });
  });
});

describe("the native Buttons keep their platform shapes in the hand-off's colours", () => {
  it("iOS is a capsule, 50 tall at base, with a 600 17pt label tracked -0.2", () => {
    const box = iosSkin.container(t, "primary", "base", opts());
    expect(box.borderRadius).toBe(9999);
    expect(box.backgroundColor).toBe(actionFill(t));
    expect(height(iosSkin, "primary", "base")).toBe(50);
    expect(height(iosSkin, "primary", "small")).toBe(32);
    expect(iosSkin.label(t, "primary", "base", opts())).toMatchObject({ fontSize: 17, fontWeight: "600", letterSpacing: -0.2 });
  });

  it("Android is a stadium, 32 / 40 / 48 tall, with a 500 label tracked 0.1", () => {
    expect(androidSkin.container(t, "primary", "base", opts()).borderRadius).toBe(9999);
    expect([height(androidSkin, "primary", "small"), height(androidSkin, "primary", "base"), height(androidSkin, "primary", "large")]).toEqual([32, 40, 48]);
    expect(androidSkin.label(t, "secondary", "base", opts())).toMatchObject({ fontSize: 14, fontWeight: "500", letterSpacing: 0.1, color: t["secondary-foreground"] });
    expect(androidSkin.container(t, "secondary", "base", opts())).toMatchObject({ backgroundColor: t.secondary, borderColor: t.input });
  });
});

describe("a raised Button rests on the accent's glow", () => {
  it("glows under a primary in the accent's glow on every platform, and nowhere else", () => {
    render(
      <ThemeProvider light solid>
        <Button primary raised onPress={() => {}}>Web</Button>
        <IOSButton primary raised onPress={() => {}}>iOS</IOSButton>
        <AndroidButton primary raised onPress={() => {}}>Android</AndroidButton>
        <Button secondary raised onPress={() => {}}>Secondary</Button>
        <Button primary raised disabled onPress={() => {}}>Disabled</Button>
        <Button primary onPress={() => {}}>Plain</Button>
      </ThemeProvider>,
    );
    const glow = (name: string) => screen.getByRole("button", { name }).style.boxShadow;
    for (const name of ["Web", "iOS"]) expect(glow(name), name).toMatch(/0px 10px 26px -8px/);
    // Android clips its ripple to the pill on the wrapper, which would cut a glow drawn
    // outside the button, so there the glow rests on the wrapper itself.
    const android = screen.getByRole("button", { name: "Android" });
    expect(android.style.boxShadow).not.toMatch(/26px/);
    expect(android.parentElement!.style.boxShadow).toMatch(/0px 10px 26px -8px/);
    for (const name of ["Secondary", "Disabled", "Plain"]) expect(glow(name), name).not.toMatch(/26px/);
  });
});

it("keeps Argus inverse and reference-link hover treatments", () => {
  render(<ThemeProvider light solid><Button outline inverse>Reject</Button><Button link softHover>Clear filters</Button></ThemeProvider>);
  const inverse = screen.getByRole("button", { name: "Reject" });
  fireEvent.pointerEnter(inverse, { pointerType: "mouse" });
  expect(inverse.style.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.12\)/);
  const link = screen.getByRole("button", { name: "Clear filters" });
  fireEvent.pointerEnter(link, { pointerType: "mouse" });
  expect(link.style.opacity).toBe("0.85");
});
