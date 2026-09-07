import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { Platform, type AccessibilityActionEvent } from "react-native";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import type { stepperAccessibility } from "../src/atoms/stepper/stepper.accessibility.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Stepper accessible numeric entry", () => {
  it("names the bare field and groups its three independently accessible controls", () => {
    const { getByRole, queryByRole } = ui(<Stepper defaultValue={2} />);
    const group = getByRole("group", { name: "Number" });
    const field = within(group).getByRole("spinbutton", { name: "Number" });
    expect(field.tagName).toBe("INPUT");
    expect(within(group).getByRole("button", { name: "Decrease" })).toBeDefined();
    expect(within(group).getByRole("button", { name: "Increase" })).toBeDefined();
    expect(group.hasAttribute("aria-valuenow")).toBe(false);
    expect(group.hasAttribute("tabindex")).toBe(false);
    expect(queryByRole("slider")).toBeNull();
  });

  it("connects the visible label and description to the field and group", () => {
    const { getByRole } = ui(<Stepper label="Quantity" description="Number of seats" required />);
    const group = getByRole("group", { name: "Quantity" });
    const field = getByRole("spinbutton", { name: "Quantity" });
    for (const element of [group, field]) {
      expect(document.getElementById(element.getAttribute("aria-labelledby")!)?.textContent).toContain("Quantity");
      expect(document.getElementById(element.getAttribute("aria-describedby")!)?.textContent).toBe("Number of seats");
    }
    expect(field.getAttribute("aria-required")).toBe("true");
    expect(group.hasAttribute("aria-required")).toBe(false);
  });

  it("does not reference a description that has no visible label anatomy", () => {
    const { getByRole } = ui(<Stepper description="Not rendered without a label" />);
    for (const role of ["group", "spinbutton"]) {
      const element = getByRole(role, { name: "Number" });
      expect(element.hasAttribute("aria-describedby")).toBe(false);
      expect(element.hasAttribute("aria-labelledby")).toBe(false);
      expect(element.hasAttribute("aria-required")).toBe(false);
    }
  });

  it("adjusts exact decimal values from the focused field and stops at bounds", () => {
    const values: number[] = [];
    const { getByRole } = ui(<Stepper step={0.1} max={0.3} onChange={(next) => values.push(next)} />);
    const field = getByRole("spinbutton", { name: "Number" }) as HTMLInputElement;
    act(() => field.focus());
    for (const next of [0.1, 0.2, 0.3]) {
      expect(fireEvent.keyDown(field, { key: "ArrowUp" })).toBe(false);
      expect(field.value).toBe(String(next));
      expect(field.getAttribute("aria-valuenow")).toBe(String(next));
      expect(document.activeElement).toBe(field);
    }
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(getByRole("button", { name: "Increase" }).getAttribute("aria-disabled")).toBe("true");
    for (const next of [0.2, 0.1, 0]) {
      expect(fireEvent.keyDown(field, { key: "ArrowDown" })).toBe(false);
      expect(field.value).toBe(String(next));
    }
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(getByRole("button", { name: "Decrease" }).getAttribute("aria-disabled")).toBe("true");
    expect(values).toEqual([0.1, 0.2, 0.3, 0.2, 0.1, 0]);
    expect(document.activeElement).toBe(field);
  });

  it("supports Home and End without rounding an off-grid bound", () => {
    const values: number[] = [];
    const { getByRole } = ui(<Stepper defaultValue={0.1} min={-0.05} max={0.25} step={0.1}
      onChange={(next) => values.push(next)} />);
    const field = getByRole("spinbutton") as HTMLInputElement;
    expect(fireEvent.keyDown(field, { key: "End" })).toBe(false);
    expect(field.value).toBe("0.25");
    expect(fireEvent.keyDown(field, { key: "Home" })).toBe(false);
    expect(field.value).toBe("-0.05");
    expect(values).toEqual([0.25, -0.05]);
  });

  it("replaces typed and transient drafts when a key adjusts the value", () => {
    const values: number[] = [];
    const { getByRole } = ui(<Stepper step={0.1} onChange={(next) => values.push(next)} />);
    const field = getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "0.055" } });
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(field.value).toBe("0.155");
    fireEvent.blur(field);
    expect(field.value).toBe("0.155");
    fireEvent.change(field, { target: { value: "-" } });
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(field.value).toBe("0.055");
    fireEvent.blur(field);
    expect(field.value).toBe("0.055");
    expect(values).toEqual([0.055, 0.155, 0.055]);
  });

  it("leaves composition, modifier shortcuts, and text navigation alone", () => {
    const values: number[] = [];
    const { getByRole } = ui(<Stepper defaultValue={5} onChange={(next) => values.push(next)} />);
    const field = getByRole("spinbutton") as HTMLInputElement;
    for (const event of [
      { key: "ArrowUp", isComposing: true },
      { key: "ArrowUp", keyCode: 229 },
      { key: "ArrowUp", ctrlKey: true },
      { key: "ArrowDown", altKey: true },
      { key: "Home", metaKey: true },
      { key: "End", shiftKey: true },
      { key: "ArrowLeft" },
      { key: "ArrowRight" },
      { key: "Backspace" },
    ]) expect(fireEvent.keyDown(field, event)).toBe(true);
    expect(field.value).toBe("5");
    expect(values).toEqual([]);
  });

  it("exposes disabled state and blocks every adjustment key", () => {
    const values: number[] = [];
    const { getByRole } = ui(<Stepper disabled defaultValue={5} max={10} onChange={(next) => values.push(next)} />);
    const field = getByRole("spinbutton") as HTMLInputElement;
    expect(field.getAttribute("aria-disabled")).toBe("true");
    expect(field.readOnly).toBe(true);
    for (const key of ["ArrowUp", "ArrowDown", "Home", "End"]) fireEvent.keyDown(field, { key });
    expect(field.value).toBe("5");
    expect(values).toEqual([]);
  });

  it("reports controlled keyboard changes while retaining the parent-owned value", () => {
    const values: number[] = [];
    const view = (value: number) => <ThemeProvider><Stepper value={value} step={0.1}
      onChange={(next) => values.push(next)} /></ThemeProvider>;
    const { getByRole, rerender } = render(view(0.05));
    const field = getByRole("spinbutton") as HTMLInputElement;
    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(values).toEqual([0.15]);
    expect(field.value).toBe("0.05");
    expect(field.getAttribute("aria-valuenow")).toBe("0.05");
    rerender(view(0.15));
    expect(field.value).toBe("0.15");
    expect(field.getAttribute("aria-valuenow")).toBe("0.15");
  });
});

describe("Stepper runtime accessibility metadata", () => {
  for (const platform of ["ios", "android"] as const) {
    it(`retains the native adjustable View and its action callbacks on ${platform}`, () => {
      type Metadata = ReturnType<typeof stepperAccessibility>;
      let metadata: Metadata | undefined;
      // RNW's Platform.select always selects web, even if Platform.OS is changed.
      // Select the actual native branch and observe the props produced by the
      // real Stepper render. This validates props and handlers, not native AT.
      const select = spyOn(Platform, "select").mockImplementation((specifics) => {
        const selected = specifics[platform] ?? specifics.native ?? specifics.default;
        const candidate = selected as Metadata | undefined;
        if (candidate?.group?.accessibilityRole === "adjustable") metadata = candidate;
        return selected;
      });
      try {
        const values: number[] = [];
        const view = (disabled = false) => <ThemeProvider><Stepper defaultValue={0.2}
          min={0} max={0.3} step={0.1} disabled={disabled} required
          onChange={(next) => values.push(next)} /></ThemeProvider>;
        const { getByRole, queryByRole, rerender } = render(view());
        const field = getByRole("textbox", { name: "Number" }) as HTMLInputElement;
        const group = getByRole("slider", { name: "Number" });
        expect(group.contains(field)).toBe(true);
        expect(queryByRole("spinbutton")).toBeNull();
        expect(metadata?.group.role).toBeUndefined();
        expect(metadata?.group.accessibilityActions).toEqual([{ name: "increment" }, { name: "decrement" }]);
        expect(metadata?.group.accessibilityValue).toEqual({ min: 0, max: 0.3, now: 0.2 });
        expect(metadata?.group["aria-valuemin"]).toBe(0);
        expect(metadata?.group["aria-valuemax"]).toBe(0.3);
        expect(metadata?.group["aria-valuenow"]).toBe(0.2);
        expect(metadata?.group["aria-required"]).toBe(true);
        expect(metadata?.field.accessibilityRole).toBeUndefined();
        expect(metadata?.field.onAccessibilityAction).toBeUndefined();
        const adjust = (actionName: string) => act(() => metadata!.group.onAccessibilityAction!({
          nativeEvent: { actionName },
        } as AccessibilityActionEvent));
        adjust("increment");
        expect(field.value).toBe("0.3");
        expect(metadata?.group.accessibilityValue?.now).toBe(0.3);
        adjust("increment");
        adjust("decrement");
        expect(field.value).toBe("0.2");
        expect(values).toEqual([0.3, 0.2]);
        rerender(view(true));
        expect(metadata?.group.accessibilityState).toEqual({ disabled: true });
        expect(metadata?.group["aria-disabled"]).toBe(true);
        adjust("increment");
        adjust("decrement");
        expect(values).toEqual([0.3, 0.2]);
      } finally {
        cleanup();
        select.mockRestore();
      }
    });
  }
});
