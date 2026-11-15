import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { type ForwardedRef, type ReactNode } from "react";
import { I18nManager, PanResponder, StyleSheet, View, type AccessibilityActionEvent, type GestureResponderEvent, type PanResponderCallbacks, type PanResponderGestureState, type ViewProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Slider as IOSSlider } from "../src/atoms/slider/slider.ios.tsx";
import { Slider as AndroidSlider } from "../src/atoms/slider/slider.android.tsx";
import { iosSkin, androidSkin } from "../src/atoms/slider/slider.styles.ts";
import { Radio, RadioGroup } from "../src/atoms/radio/radio.tsx";
import { Chip, ChipGroup } from "../src/atoms/chip/chip.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { layoutElement } from "./entrance-layout.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider light solid>{node}</ThemeProvider>);

function withRTL(swap: boolean, run: () => void) {
  const constants = spyOn(I18nManager, "getConstants").mockReturnValue({ isRTL: true, doLeftAndRightSwapInRTL: swap });
  try { run(); } finally { cleanup(); constants.mockRestore(); }
}

describe("native RTL slider coordinates", () => {
  for (const [name, Slider, skin] of [["iOS", IOSSlider, iosSkin], ["Android", AndroidSlider, androidSkin]] as const) {
    for (const swap of [true, false]) it(`${name} mirrors paint and physical touch once with native style swapping ${swap ? "on" : "off"}`, () => withRTL(swap, () => {
      // Observe native View props before RNW renders them; happy-dom cannot run Yoga's
      // RTL style swapping. Exercise the actual responder and accessibility callbacks.
      const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
      const original = component.render;
      const hosts = new Map<string, ViewProps>();
      const paintedHosts: ViewProps[] = [];
      const observer = spyOn(component, "render").mockImplementation((props, ref) => {
        if (props.testID) hosts.set(props.testID, props);
        paintedHosts.push(props);
        return original(props, ref);
      });
      const originalCreate = PanResponder.create;
      const responders: PanResponderCallbacks[] = [];
      const responder = spyOn(PanResponder, "create").mockImplementation(config => {
        responders.push(config);
        return originalCreate(config);
      });
      try {
        const changes: number[] = [];
        const onChange = (value: number) => changes.push(value);
        const { getByRole, rerender } = ui(<Slider testID="rtl-slider" defaultValue={25} step={25} onChange={onChange} accessibilityLabel="Volume" />);
        const slider = getByRole("slider");
        paintedHosts.length = 0;
        layoutElement(slider, { width: 200, height: 48 });
        const thumbWidth = skin.thumbWidth("base");
        const thumbTravel = (200 - thumbWidth) * 0.25;
        const fillWidth = skin.trackGap ? Math.max(0, thumbTravel - skin.trackGap) : thumbWidth / 2 + thumbTravel;
        const fill = paintedHosts.map(props => StyleSheet.flatten(props.style)).find(style => style?.position === "absolute" && style.width === fillWidth);
        expect(fill).toBeDefined();
        expect(swap ? fill!.left : fill!.right).toBeUndefined();
        expect(swap ? fill!.right : fill!.left).toBe(200 - fillWidth);
        const painted = () => {
          const style = StyleSheet.flatten(hosts.get("rtl-slider-thumb")!.style);
          // Native swaps a right inset into a physical left inset. The other key
          // must be cleared, including a skin's resting left:0 on filled rails.
          expect(swap ? style.left : style.right).toBeUndefined();
          return swap ? style.right : style.left;
        };
        expect(painted()).toBe((200 - thumbWidth) * 0.75);
        const event = (locationX: number) => ({ nativeEvent: { locationX } }) as GestureResponderEvent;
        const gesture = {} as PanResponderGestureState;
        act(() => responders[0].onPanResponderGrant!(event(thumbWidth / 2), gesture));
        expect(changes.at(-1)).toBe(100);
        expect(slider.getAttribute("aria-valuenow")).toBe("100");
        expect(painted()).toBe(0);
        // A containing native ScrollView asks to take the responder once movement
        // starts. Only a retained gesture can deliver the remaining drag to min.
        const yieldsToParent = responders[0].onPanResponderTerminationRequest?.(event(200 - thumbWidth / 2), gesture) ?? true;
        act(() => {
          if (yieldsToParent) responders[0].onPanResponderTerminate?.(event(200 - thumbWidth / 2), gesture);
          else responders[0].onPanResponderMove!(event(200 - thumbWidth / 2), gesture);
        });
        expect(changes.at(-1)).toBe(0);
        expect(painted()).toBe(200 - thumbWidth);
        act(() => responders[0].onPanResponderRelease!(event(200 - thumbWidth / 2), gesture));
        // Native increment remains numerical increment in RTL, toward the left.
        act(() => hosts.get("rtl-slider")!.onAccessibilityAction!({ nativeEvent: { actionName: "increment" } } as AccessibilityActionEvent));
        expect(changes.at(-1)).toBe(25);
        expect(painted()).toBe((200 - thumbWidth) * 0.75);
        // Becoming disabled hands ownership back and the retained callbacks stop
        // changing the value, even though PanResponder was created while enabled.
        rerender(<ThemeProvider light solid><Slider testID="rtl-slider" defaultValue={25} step={25} onChange={onChange} accessibilityLabel="Volume" disabled /></ThemeProvider>);
        expect(responders[0].onPanResponderTerminationRequest?.(event(0), gesture)).toBe(true);
        const emitted = changes.length;
        act(() => responders[0].onPanResponderMove!(event(0), gesture));
        expect(changes.length).toBe(emitted);
      } finally { cleanup(); responder.mockRestore(); observer.mockRestore(); }
    }));
  }
});

describe("RTL composite arrows share the locale reader", () => {
  for (const kind of ["radio", "chip", "tabs"] as const) it(`${kind} reverses horizontal arrows and preserves vertical/Home/End navigation`, () => withRTL(false, () => {
    const { container } = ui(kind === "radio" ? (
      <RadioGroup defaultValue="a"><Radio value="a">A</Radio><Radio value="b" disabled>B</Radio><Radio value="c">C</Radio></RadioGroup>
    ) : kind === "chip" ? (
      <ChipGroup defaultValue="a"><Chip value="a">A</Chip><Chip value="b" disabled>B</Chip><Chip value="c">C</Chip></ChipGroup>
    ) : <Tabs tabs={["A", { label: "B", disabled: true }, "C"]} />);
    const controls = [...container.querySelectorAll(kind === "tabs" ? '[role="tab"]' : '[role="radio"]')];
    const selected = () => controls.findIndex(control => control.getAttribute(kind === "tabs" ? "aria-selected" : "aria-checked") === "true");
    fireEvent.keyDown(controls[0], { key: "ArrowLeft" });
    expect(selected()).toBe(2);
    expect(document.activeElement).toBe(controls[2]);
    fireEvent.keyDown(controls[2], { key: "ArrowRight" });
    expect(selected()).toBe(0);
    if (kind !== "tabs") {
      fireEvent.keyDown(controls[0], { key: "ArrowDown" });
      expect(selected()).toBe(2);
    }
    fireEvent.keyDown(controls[selected()], { key: "End" });
    expect(selected()).toBe(2);
    fireEvent.keyDown(controls[2], { key: "Home" });
    expect(selected()).toBe(0);
  }));
});
