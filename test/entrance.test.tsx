import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { type ForwardedRef, type ReactNode, StrictMode, useContext } from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { Animated, StyleSheet, Text, TextInput, View, type ViewProps } from "react-native";
import { Entrance, type EntranceProps } from "../src/style/entrance.tsx";
import { EntranceReadinessContext } from "../src/style/entrance-readiness.ts";
import { ThemeProvider } from "../src/style/theme.tsx";
import { pointerEventsOf } from "./entrance-layout.ts";

// Entrance is a hold, not a motion: the card is in the tree and measurable while
// its owner is not ready, invisible and inert until it is, and it appears in place
// with no animation.
afterEach(cleanup);

function Probe() {
  const ready = useContext(EntranceReadinessContext);
  return <><Text testID="readiness">{ready ? "ready" : "held"}</Text><TextInput accessibilityLabel="Draft" defaultValue="original" /></>;
}
function ui(props: Omit<EntranceProps, "children"> = {}, inherited = true): ReactNode {
  return <ThemeProvider light solid><EntranceReadinessContext.Provider value={inherited}>
    <Entrance {...props}><Probe /></Entrance>
  </EntranceReadinessContext.Provider></ThemeProvider>;
}
const wrapper = () => screen.getByTestId("readiness").parentElement as HTMLElement;
const readiness = () => screen.getByTestId("readiness").textContent;
const held = () => ({
  ariaHidden: wrapper().getAttribute("aria-hidden") === "true",
  opacity: wrapper().style.opacity,
  pointerEvents: pointerEventsOf(wrapper()),
});

// The props Entrance hands React Native's View, as a native build receives them: the web
// test renders through react-native-web, which drops the native-only ones.
function withViewProps(run: (props: () => ViewProps) => void) {
  const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
  const original = component.render;
  let last: ViewProps | undefined;
  const spy = spyOn(component, "render").mockImplementation((props, ref) => {
    if ("accessibilityElementsHidden" in props) last = props;
    return original(props, ref);
  });
  try {
    run(() => last!);
  } finally {
    spy.mockRestore();
  }
}

describe("Entrance", () => {
  it("shows a default-ready card at once, visible and interactive", () => {
    render(ui());
    expect(readiness()).toBe("ready");
    expect(held()).toEqual({ ariaHidden: false, opacity: "", pointerEvents: "auto" });
    expect(wrapper().style.transform).toBe("");
  });

  it("holds an unready card outside hit testing and accessibility, and releases it in place", () => {
    const view = render(ui({ ready: false }));
    expect(readiness()).toBe("held");
    expect(held()).toEqual({ ariaHidden: true, opacity: "0", pointerEvents: "none" });
    const input = screen.getByLabelText("Draft") as HTMLInputElement;
    view.rerender(ui({ ready: true }));
    expect(readiness()).toBe("ready");
    expect(held()).toEqual({ ariaHidden: false, opacity: "", pointerEvents: "auto" });
    // The same host and the same input survive the release and a re-hold: nothing remounts.
    expect(screen.getByLabelText("Draft")).toBe(input);
    view.rerender(ui({ ready: false }));
    expect(readiness()).toBe("held");
    expect(held().ariaHidden).toBe(true);
    expect(screen.getByLabelText("Draft")).toBe(input);
  });

  it("holds its own host while an ancestor holds, and releases with it", () => {
    // In one tree the ancestor's hold already hides this card; the same rule keeps a hosted
    // card, which renders outside its logical ancestor, hidden (test/entrance-readiness).
    const view = render(ui({}, false));
    expect(readiness()).toBe("held");
    expect(held()).toEqual({ ariaHidden: true, opacity: "0", pointerEvents: "none" });
    view.rerender(ui());
    expect(readiness()).toBe("ready");
    expect(held()).toEqual({ ariaHidden: false, opacity: "", pointerEvents: "auto" });
    view.rerender(ui({ ready: false }, true));
    expect(readiness()).toBe("held");
    view.rerender(ui({ ready: true }, false));
    expect(readiness()).toBe("held");
    expect(held().ariaHidden).toBe(true);
  });

  it("holds touches through its style, never the deprecated pointerEvents prop", () => {
    withViewProps((props) => {
      const view = render(ui({ ready: false }));
      expect("pointerEvents" in props()).toBe(false);
      expect(StyleSheet.flatten(props().style).pointerEvents).toBe("none");
      view.rerender(ui({ ready: true }));
      expect("pointerEvents" in props()).toBe(false);
      expect(StyleSheet.flatten(props().style).pointerEvents).toBeUndefined();
    });
  });

  it("keeps a covered card hidden from VoiceOver and TalkBack once React Native resolves aria-hidden", () => {
    // React Native 0.86's View (Libraries/Components/View/View.js) resolves aria-hidden over
    // the native props: a defined value overwrites accessibilityElementsHidden, and true
    // also sets importantForAccessibility. A false aria-hidden would undo `obscured` on iOS.
    const resolved = (props: ViewProps) => {
      const ariaHidden = props["aria-hidden"];
      return {
        accessibilityElementsHidden: ariaHidden !== undefined ? ariaHidden : props.accessibilityElementsHidden,
        importantForAccessibility: ariaHidden === true ? "no-hide-descendants" : props.importantForAccessibility,
      };
    };
    const hiddenNatively = { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" };
    const exposed = { accessibilityElementsHidden: false, importantForAccessibility: "auto" };
    withViewProps((props) => {
      const view = render(ui({ obscured: true }));
      expect(props()["aria-hidden"]).toBeUndefined();
      expect(resolved(props())).toEqual(hiddenNatively);
      // Obscured is natively hidden only: the web keeps the card, so it stays out of aria-hidden.
      expect(held()).toEqual({ ariaHidden: false, opacity: "", pointerEvents: "auto" });
      view.rerender(ui({ obscured: true, ready: false }));
      expect(resolved(props())).toEqual(hiddenNatively);
      view.rerender(ui({ ready: false }));
      expect(resolved(props())).toEqual(hiddenNatively);
      view.rerender(ui());
      expect(props()["aria-hidden"]).toBeUndefined();
      expect(resolved(props())).toEqual(exposed);
      view.rerender(ui({ accessibilityViewIsModal: true }));
      expect(props().accessibilityViewIsModal).toBe(true);
      expect(resolved(props())).toEqual(exposed);
    });
  });

  it("never starts an animation", () => {
    const spring = spyOn(Animated, "spring");
    const timing = spyOn(Animated, "timing");
    try {
      const view = render(ui({ ready: false }));
      view.rerender(ui({ ready: true }));
      view.rerender(ui({ ready: false }));
      view.rerender(ui({ ready: true }));
      expect(spring).not.toHaveBeenCalled();
      expect(timing).not.toHaveBeenCalled();
      expect(wrapper().style.transform).toBe("");
    } finally {
      spring.mockRestore();
      timing.mockRestore();
    }
  });

  it("survives StrictMode's replayed effects on the retained host", () => {
    render(<StrictMode>{ui()}</StrictMode>);
    const input = screen.getByLabelText("Draft") as HTMLInputElement;
    expect(readiness()).toBe("ready");
    expect(screen.getByLabelText("Draft")).toBe(input);
  });
});
