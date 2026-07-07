import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";

// react-native-web forwards NEITHER accessibilityState NOR accessibilityValue to
// the DOM (verified empirically). The kit therefore carries the cross-platform
// aria-* aliases (RN 0.71+ accepts them; RNW forwards them; native maps them back).
// These tests lock in that every interactive state actually reaches a web screen
// reader, across each state type (checked / selected / expanded) and atomic layer.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const attr = (c: HTMLElement, sel: string, a: string) => c.querySelector(sel)?.getAttribute(a);

describe("web a11y state (aria aliases for RNW-dropped accessibilityState)", () => {
  it("Checkbox forwards aria-checked, including the mixed (indeterminate) state", () => {
    const { container, rerender } = ui(<Checkbox checked />);
    expect(attr(container, '[role="checkbox"]', "aria-checked")).toBe("true");
    rerender(<ThemeProvider><Checkbox indeterminate /></ThemeProvider>);
    expect(attr(container, '[role="checkbox"]', "aria-checked")).toBe("mixed");
  });

  it("Switch forwards aria-checked", () => {
    const { container } = ui(<Switch checked />);
    expect(attr(container, '[role="switch"]', "aria-checked")).toBe("true");
  });

  it("TabBar marks exactly the active tab aria-selected", () => {
    const items = [
      { key: "a", label: "A", icon: () => <Text>a</Text> },
      { key: "b", label: "B", icon: () => <Text>b</Text> },
    ];
    const { container } = ui(<TabBar items={items} active="b" onSelect={() => {}} />);
    const selected = Array.from(container.querySelectorAll('[role="tab"]')).map((t) => t.getAttribute("aria-selected"));
    expect(selected.filter((s) => s === "true").length).toBe(1);
    expect(selected.filter((s) => s === "false").length).toBe(1);
  });

  it("Tabs marks exactly one trigger aria-selected", () => {
    const { container } = ui(<Tabs tabs={["One", "Two", "Three"]} active={0} />);
    const sel = Array.from(container.querySelectorAll("[aria-selected]")).map((t) => t.getAttribute("aria-selected"));
    expect(sel.filter((s) => s === "true").length).toBe(1);
  });

  it("Dropdown trigger exposes aria-expanded (collapsed by default)", () => {
    const { container } = ui(<Dropdown label="Menu" items={[{ label: "One" }, { label: "Two" }]} />);
    expect(attr(container, "[aria-expanded]", "aria-expanded")).toBe("false");
  });
});

describe("listbox a11y (options announce as a selectable list, operably)", () => {
  it("Select: role=listbox + role=option rows carry aria-selected and stay operable", () => {
    let picked = "";
    const { container } = ui(<Select open options={["A", "B", "C"]} value="A" onSelect={(o) => { picked = o; }} />);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(3);
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
    expect(opts[1].getAttribute("aria-selected")).toBe("false");
    fireEvent.click(opts[1]);
    expect(picked).toBe("B");
  });

  it("Combobox: role=listbox + role=option rows carry aria-selected", () => {
    const { container } = ui(<Combobox open options={["A", "B"]} value="B" onSelect={() => {}} />);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(2);
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
  });

  it("Combobox: the field is a real text input with role=combobox + aria-expanded", () => {
    const { container } = ui(<Combobox options={["A", "B"]} />);
    const field = container.querySelector('input[role="combobox"]');
    expect(field).not.toBeNull();
    expect(field?.getAttribute("aria-expanded")).toBe("false");
  });

  it("Command: role=listbox + role=option rows, the active row aria-selected", () => {
    const { container } = ui(
      <Command open active={0} groups={[{ items: [{ label: "X" }, { label: "Y" }] }]} onSelect={() => {}} />,
    );
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(2);
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
  });
});
