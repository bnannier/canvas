import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { act, render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text, TextInput as RNTextInput, type TextInputProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrances } from "./entrance-layout.ts";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { AvatarMenu } from "../src/atoms/avatar/avatar.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Badge, BadgeGroup } from "../src/atoms/badge/badge.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";

// react-native-web forwards NEITHER accessibilityState NOR accessibilityValue to
// the DOM (verified empirically). The kit therefore carries the cross-platform
// aria-* aliases (RN 0.71+ accepts them; RNW forwards them; native maps them back).
// These tests lock in that every interactive state actually reaches a web screen
// reader, across each state type (checked / selected / expanded) and atomic layer.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const attr = (c: HTMLElement, sel: string, a: string) => c.querySelector(sel)?.getAttribute(a);

describe("web a11y state (aria aliases for RNW-dropped accessibilityState)", () => {
  it("Listbox announces selected options and checked multi-select rows", () => {
    const items = [{ label: "One" }, { label: "Two" }];
    const { getAllByRole, rerender } = ui(<Listbox items={items} selected={1} />);
    expect(getAllByRole("option").map((row) => row.getAttribute("aria-selected"))).toEqual(["false", "true"]);
    rerender(<ThemeProvider><Listbox multi items={items} selected={[0]} /></ThemeProvider>);
    expect(getAllByRole("checkbox").map((row) => row.getAttribute("aria-checked"))).toEqual(["true", "false"]);
  });

  it("Stepper carries the numeric state on the named editable spinbutton", () => {
    const { getByRole } = ui(<Stepper label="Quantity" value={2} min={1} max={5} disabled />);
    const field = getByRole("spinbutton", { name: "Quantity" });
    expect(field.getAttribute("aria-valuenow")).toBe("2");
    expect(field.getAttribute("aria-valuemin")).toBe("1");
    expect(field.getAttribute("aria-valuemax")).toBe("5");
    expect(field.getAttribute("aria-disabled")).toBe("true");
  });

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

  it("Dropdown trigger announces the menu popup, and aria-disabled when it is inert", () => {
    const items = [{ label: "One" }, { label: "Two" }];
    const enabled = ui(<Dropdown trigger="Menu" items={items} />);
    expect(attr(enabled.container, "[aria-expanded]", "aria-haspopup")).toBe("menu");
    // Not disabled: the alias is absent rather than announced as false.
    expect(attr(enabled.container, "[aria-expanded]", "aria-disabled")).toBeNull();
    cleanup();

    const off = ui(<Dropdown trigger="Menu" disabled items={items} />);
    expect(attr(off.container, "[aria-expanded]", "aria-disabled")).toBe("true");
    expect(attr(off.container, "[aria-expanded]", "aria-expanded")).toBe("false");
  });

  it("AvatarMenu's pill names the account and announces a menu popup", () => {
    const { container } = ui(
      <AvatarMenu name="Rachel Chen" email="rachel@example.com" items={[{ label: "Profile" }]} />,
    );
    // The trigger is a button that announces the popup it opens and its state.
    expect(attr(container, '[aria-haspopup="menu"]', "aria-expanded")).toBe("false");
    // The capsule carries the account's name, so the button it labels reads as the
    // person rather than an unnamed "button".
    expect(attr(container, "[aria-label]", "aria-label")).toBe("Rachel Chen, rachel@example.com");
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
    layoutEntrances(container, { width: 320, height: 144 });
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
    layoutEntrances(container, { width: 320, height: 144 });
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
    layoutEntrances(container, { width: 240, height: 96 });
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

describe("Badge: a name needs a role it can legally sit on", () => {
  // ARIA prohibits naming a generic element, so an aria-label on a bare View is
  // discarded rather than announced. Which role fixes that depends on what the badge
  // contains, and the wrong choice trades one defect for a worse one: img is a LEAF
  // role, so putting it on a badge that also renders text would replace that text in
  // the accessibility tree with the label.
  it("names a bare status dot as an image", () => {
    const { container } = ui(<Badge status success />);
    const badge = container.querySelector('[aria-label="success"]');
    expect(badge?.getAttribute("role")).toBe("img");
  });

  it("names a badge that also carries text as a group, keeping the text", () => {
    const { container } = ui(
      <Badge status error accessibilityLabel="3 failing checks">
        Failed
      </Badge>,
    );
    const badge = container.querySelector('[aria-label="3 failing checks"]');
    expect(badge?.getAttribute("role")).toBe("group");
    expect(badge?.textContent).toBe("Failed");
  });

  it("leaves an unnamed badge generic, since its own text is the name", () => {
    const { container } = ui(<Badge status warning>Pending</Badge>);
    const labelled = container.querySelector("[aria-label]");
    expect(labelled).toBeNull();
    expect(container.textContent).toBe("Pending");
  });

  // BadgeGroup carries the same rule: its name sat on a role-less View, where it was
  // discarded (axe only flags that for review, since the group always holds text).
  it("names a labelled BadgeGroup as a group, keeping its badges' text", () => {
    const { container } = ui(
      <BadgeGroup accessibilityLabel="Rachel Chen's roles" testID="g">
        <Badge>Admin</Badge>
        <Badge status success>Active</Badge>
      </BadgeGroup>,
    );
    const group = container.querySelector('[data-testid="g"]') as HTMLElement;
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe("Rachel Chen's roles");
    expect(group.textContent).toBe("AdminActive");
  });

  it("leaves an unlabelled BadgeGroup a plain row, with no role and no name", () => {
    const { container } = ui(
      <BadgeGroup testID="g">
        <Badge>Admin</Badge>
      </BadgeGroup>,
    );
    const group = container.querySelector('[data-testid="g"]') as HTMLElement;
    expect(group.getAttribute("role")).toBeNull();
    expect(group.getAttribute("aria-label")).toBeNull();
  });
});

describe("text fields: disabled is disabled, read-only stays reachable", () => {
  // `editable={false}` alone reaches the browser as readonly only: a disabled field stayed
  // a Tab stop and was read as read-only. Every kit field now says disabled through
  // aria-disabled too, which react-native-web turns into the native disabled attribute,
  // and through accessibilityState, the channel VoiceOver and TalkBack read
  // (src/style/text-entry-state.ts).
  const DISABLED: [string, ReactNode][] = [
    ["Input", <Input label="Email" disabled />],
    ["grouped Input", <Input label="Price" prefix="$" disabled />],
    ["Android Input, floating label", <AndroidInput label="Email" disabled />],
    ["Textarea", <Textarea label="Notes" disabled />],
    ["PhoneInput", <PhoneInput label="Phone" disabled />],
    ["Autocomplete", <Autocomplete label="Owner" options={["Ada Lovelace"]} disabled />],
    ["InputOTP", <InputOTP disabled />],
  ];

  for (const [name, node] of DISABLED) {
    it(`${name} reaches the browser disabled and takes no focus`, () => {
      const { container } = ui(node);
      const field = container.querySelector<HTMLInputElement>("input, textarea")!;
      expect(field.disabled).toBe(true);
      expect(field.getAttribute("aria-disabled")).toBe("true");
      act(() => field.focus());
      expect(document.activeElement).not.toBe(field);
    });
  }

  it("hands VoiceOver and TalkBack the disabled state on every field", () => {
    // accessibilityState is the native channel react-native-web drops from the DOM, so
    // read it where React Native receives it: the props of its TextInput.
    const component = RNTextInput as unknown as { render: (props: TextInputProps, ref: unknown) => ReactNode };
    const seen: TextInputProps[] = [];
    const original = component.render;
    const spy = spyOn(component, "render").mockImplementation((props, ref) => {
      seen.push(props);
      return original(props, ref);
    });
    try {
      for (const [name, node] of DISABLED) {
        seen.length = 0;
        ui(node);
        const fields = seen.filter((props) => props.editable === false);
        expect(fields.length, name).toBeGreaterThan(0);
        for (const props of fields) expect(props.accessibilityState?.disabled, name).toBe(true);
        cleanup();
      }
    } finally { spy.mockRestore(); }
  });

  it("leaves an enabled field's markup without a disabled state", () => {
    const { container } = ui(<><Input label="Email" /><Textarea label="Notes" /><PhoneInput label="Phone" /></>);
    for (const field of container.querySelectorAll<HTMLInputElement>("input, textarea")) {
      expect(field.disabled).toBe(false);
      expect(field.hasAttribute("aria-disabled")).toBe(false);
      expect(field.readOnly).toBe(false);
    }
  });

  for (const [name, node] of [
    ["Input", <Input label="Email" readOnly defaultValue="ada@acme.dev" />],
    ["PhoneInput", <PhoneInput label="Phone" readOnly defaultValue="5551234567" />],
  ] as const) {
    it(`a read-only ${name} stays focusable and is not announced disabled`, () => {
      const { container } = ui(node);
      const field = container.querySelector<HTMLInputElement>("input")!;
      expect(field.readOnly).toBe(true);
      expect(field.disabled).toBe(false);
      expect(field.hasAttribute("aria-disabled")).toBe(false);
      act(() => field.focus());
      expect(document.activeElement).toBe(field);
    });
  }
});
