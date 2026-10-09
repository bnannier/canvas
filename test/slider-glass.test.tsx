import { describe, it, expect, afterEach } from "bun:test";
import { act, render, cleanup, fireEvent } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { createSlider } from "../src/atoms/slider/slider.shared.tsx";
import { iosSkin, androidSkin, webSkin } from "../src/atoms/slider/slider.styles.ts";
import { lightColors, darkColors } from "../src/style/tokens.ts";

// The thumb is a control-layer glass knob while each platform keeps its own shape.
// The rail is static glass and the iOS skin retains its bright native tint.

afterEach(cleanup);

const IOSSlider = createSlider(iosSkin);

function mount(ui: ReactNode, surface: "glass" | "solid") {
  return render(createElement(ThemeProvider, { surface }, ui));
}

const handle = (c: HTMLElement) => c.querySelector('[role="slider"]') as HTMLElement | null;

describe("Slider Liquid Glass handle", () => {
  for (const [name, skin] of [["web", webSkin], ["ios", iosSkin], ["android", androidSkin]] as const) {
    it(`${name} routes its native thumb geometry through the shared material`, () => {
      const Slider = createSlider(skin);
      const { container } = mount(<Slider testID="slider" defaultValue={50} />, "glass");
      const knob = container.querySelector('[data-testid="slider-thumb"]') as HTMLElement;
      expect(knob.style.width).toBe(`${skin.thumbWidth("base")}px`);
      expect(knob.style.height).toBe(`${skin.thumbHeight("base")}px`);
      expect(knob.querySelector('[style*="backdrop-filter"]')).not.toBeNull();
      expect(knob.style.transform).toBe("");
    });
  }

  it("tints the glass knob bright white (not the popover default) on both schemes", () => {
    // The under-fill is an opaque bright white, scheme-independent, so the knob reads as a
    // bright puck rather than a popover-tinted blob (and, verified on the iOS 26 sim, so
    // GlassView's adaptive darkening does not pull a translucent knob to dim gray). It must
    // differ from the popover token.
    const light = iosSkin.glassTint?.(lightColors);
    const dark = iosSkin.glassTint?.(darkColors);
    expect(light).toBe("#ffffff");
    expect(dark).toBe("#ffffff");
    // The case that matters: on DARK the popover token is near-black, which would make the
    // knob a dim dark blob; the bright white tint overrides it so the knob stays bright.
    // (On light, popover happens to be white too, so no inequality is asserted there.)
    expect(dark).not.toBe(darkColors.popover);
  });

  it("keeps the adjustable slider semantics under GLASS surface", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 60, min: 0, max: 100, accessibilityLabel: "Volume" }),
      "glass",
    );
    const h = handle(container);
    expect(h).toBeTruthy();
    expect(h!.getAttribute("aria-valuenow")).toBe("60");
    expect(h!.getAttribute("aria-valuemin")).toBe("0");
    expect(h!.getAttribute("aria-valuemax")).toBe("100");
  });

  it("keeps the same semantics under SOLID surface (the degraded capsule path)", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 60, min: 0, max: 100, accessibilityLabel: "Volume" }),
      "solid",
    );
    const h = handle(container);
    expect(h).toBeTruthy();
    expect(h!.getAttribute("aria-valuenow")).toBe("60");
  });

  it("still forwards the disabled state through the glass wrapper", () => {
    const { container } = mount(
      createElement(IOSSlider, { defaultValue: 30, disabled: true, accessibilityLabel: "Volume" }),
      "glass",
    );
    const h = handle(container);
    expect(h!.getAttribute("aria-disabled")).toBe("true");
  });
});

// A press shows where a skin draws it: the web knob grows a primary halo in its border,
// and that border is the press state, so it stays over the glass knob (a resting border
// gives way to the material's rim). iOS keeps its knob as it is, so its resting hairline
// still gives way under glass while pressed.
describe("Slider press feedback over the glass knob", () => {
  const press = (node: HTMLElement) => fireEvent.mouseDown(node, { button: 0, buttons: 1, clientX: 1, clientY: 1 });
  const release = (node: HTMLElement) => fireEvent.mouseUp(node, { button: 0, buttons: 0, clientX: 1, clientY: 1 });
  const transparent = /^rgba\(0, 0, 0, 0(\.0+)?\)$/;

  it("keeps the web knob's halo over the material while pressed, and clears its rim at rest", () => {
    const Slider = createSlider(webSkin);
    const { container } = mount(<Slider testID="slider" defaultValue={40} />, "glass");
    const root = handle(container)!;
    const knob = container.querySelector('[data-testid="slider-thumb"]') as HTMLElement;
    expect(knob.style.borderColor).toMatch(transparent);
    press(root);
    expect(knob.style.borderWidth).toBe("4px");
    expect(knob.style.borderColor).not.toMatch(transparent);
    release(root);
    expect(knob.style.borderWidth).toBe("1px");
    expect(knob.style.borderColor).toMatch(transparent);
  });

  it("lets the iOS knob's resting hairline give way to the material while pressed", () => {
    const { container } = mount(<IOSSlider testID="slider" defaultValue={40} />, "glass");
    const knob = container.querySelector('[data-testid="slider-thumb"]') as HTMLElement;
    press(handle(container)!);
    expect(knob.style.borderColor).toMatch(transparent);
  });

  it("leaves the solid knob's markup exactly as it was once keyboard focus moves on", () => {
    const Slider = createSlider(webSkin);
    const { container } = mount(<Slider testID="slider" defaultValue={40} />, "solid");
    const root = handle(container)!;
    const resting = container.innerHTML;
    act(() => { fireEvent.keyUp(root, { key: "Tab" }); });
    expect(container.innerHTML).not.toBe(resting);
    act(() => { fireEvent.pointerDown(root); });
    expect(container.innerHTML).toBe(resting);
  });
});
