import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";

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

  it("DataTable forwards aria-sort on sortable headers and mixed on a partial select-all", () => {
    const { container } = ui(
      <DataTable
        sortable
        selectable
        defaultSort={{ column: "Name" }}
        defaultSelectedKeys={[0]}
        columns={["Name", "Role"]}
        rows={[["Ada", "Eng"], ["Bob", "PM"]]}
      />,
    );
    expect(attr(container, '[role="columnheader"][aria-sort]', "aria-sort")).toBe("ascending");
    expect(attr(container, '[aria-label="Select all rows"]', "aria-checked")).toBe("mixed");
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

  it("Tabs marks a per-item disabled trigger aria-disabled and unpressable", () => {
    let picked = -1;
    const { container } = ui(
      <Tabs
        tabs={["One", { label: "Two", disabled: true }, "Three"]}
        active={0}
        onSelect={(i) => { picked = i; }}
      />,
    );
    const triggers = container.querySelectorAll('[role="tab"]');
    expect(triggers[1].getAttribute("aria-disabled")).toBe("true");
    expect(triggers[0].getAttribute("aria-disabled")).toBeNull();
    // A press on the disabled trigger never fires the selection callback.
    fireEvent.click(triggers[1]);
    expect(picked).toBe(-1);
    // Its enabled siblings stay operable.
    fireEvent.click(triggers[2]);
    expect(picked).toBe(2);
  });

  it("Dropdown trigger exposes aria-expanded (collapsed by default)", () => {
    const { container } = ui(<Dropdown label="Menu" items={[{ label: "One" }, { label: "Two" }]} />);
    expect(attr(container, "[aria-expanded]", "aria-expanded")).toBe("false");
  });

  it("Chip (tappable) forwards aria-pressed reflecting the active (primary) tone", () => {
    const { container, rerender } = ui(<Chip onPress={() => {}}>Filter</Chip>);
    expect(attr(container, '[role="button"]', "aria-pressed")).toBe("false");
    rerender(<ThemeProvider><Chip primary onPress={() => {}}>Filter</Chip></ThemeProvider>);
    expect(attr(container, '[role="button"]', "aria-pressed")).toBe("true");
  });

  it("Chip's remove button names the specific chip it removes", () => {
    const { container } = ui(<Chip onRemove={() => {}}>Design</Chip>);
    expect(container.querySelector('[aria-label="Remove Design"]')).not.toBeNull();
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

  it("Autocomplete: role=listbox + role=option rows carry aria-selected", () => {
    const { container } = ui(<Autocomplete open options={["A", "B"]} value="B" onSelect={() => {}} />);
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(2);
    expect(opts[1].getAttribute("aria-selected")).toBe("true");
  });

  it("Autocomplete: the field is a real text input with role=combobox + aria-expanded", () => {
    const { container } = ui(<Autocomplete options={["A", "B"]} />);
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

  it("RowMenu: a disabled item forwards aria-disabled and does not fire onSelect", () => {
    const picked: string[] = [];
    // No OverlayProvider, so the open menu renders its inline fallback card with the rows.
    const { container } = ui(
      <RowMenu
        open
        items={[{ label: "Edit" }, { label: "Clear column", disabled: true }]}
        onSelect={(item) => picked.push(item.label)}
      />,
    );
    const rows = Array.from(container.querySelectorAll('[role="menuitem"]'));
    expect(rows.length).toBe(2);
    // Only the disabled row carries the aria-disabled alias.
    expect(rows[0].getAttribute("aria-disabled")).toBeNull();
    expect(rows[1].getAttribute("aria-disabled")).toBe("true");
    // Clicking the disabled row is inert; clicking the enabled row fires onSelect.
    fireEvent.click(rows[1]);
    expect(picked).toEqual([]);
    fireEvent.click(rows[0]);
    expect(picked).toEqual(["Edit"]);
  });
});
