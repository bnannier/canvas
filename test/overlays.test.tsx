import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Tooltip } from "../src/atoms/tooltip/tooltip.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Select } from "../src/atoms/select/select.tsx";

// Open/close/dismiss/select contract for the kit's overlay surfaces. Each test
// drives the component the way a user does — open via the trigger, assert the
// floating content mounts, invoke an item/close affordance, assert it unmounts —
// and locks the role/aria the surface exposes to assistive tech. (Dialog is
// covered in its own suite; the listbox mechanics of Select/Combobox forced
// `open` live in a11y-state.test.tsx — here we cover the trigger-driven flows.)
//
// react-native-web renders a Modal by portaling into document.body rather than
// null-ing out, so the Drawer's content is queried through `screen` (whose base
// element is document.body) and is absent from the render container. Every other
// overlay here renders inline (its open card sits next to the trigger), so the
// per-render `container` sees it directly.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

describe("Drawer (full-screen Modal overlay)", () => {
  it("renders nothing until opened, then mounts the panel via its trigger", () => {
    ui(
      <Drawer trigger="Open menu">
        <Text>Drawer body</Text>
      </Drawer>,
    );
    // Closed: the Modal is not visible, so RNW mounts none of its content.
    expect(screen.queryByText("Drawer body")).toBeNull();
    // The uncontrolled trigger opens it.
    fireEvent.click(screen.getByText("Open menu"));
    expect(screen.getByText("Drawer body")).toBeDefined();
  });

  it("marks the overlay aria-modal so content behind it reads as inert", () => {
    ui(
      <Drawer open>
        <Text>Drawer body</Text>
      </Drawer>,
    );
    expect(document.querySelector('[aria-modal="true"]')).not.toBeNull();
  });

  it("dismisses on a scrim tap, reporting the close through onOpenChange", () => {
    let openState: boolean | null = null;
    ui(
      <Drawer open onOpenChange={(o) => { openState = o; }}>
        <Text>Drawer body</Text>
      </Drawer>,
    );
    // The scrim is the drawer's dismiss backdrop: a full-screen pressable behind
    // the panel, intentionally accessible={false} (a backdrop, not a labelled
    // control). Reach it structurally from the panel content — Text -> panel ->
    // panelPos -> scrim — and confirm it is the semi-transparent backdrop before
    // tapping, so a structural drift fails loudly here instead of silently.
    const panel = screen.getByText("Drawer body");
    const scrim = panel.parentElement!.parentElement!.parentElement!;
    expect(scrim.style.backgroundColor).toContain("0, 0, 0");
    fireEvent.click(scrim);
    expect(openState).toBe(false);
  });
});

describe("ActionSheet (full-screen Modal overlay)", () => {
  it("renders nothing until opened, then mounts the sheet via its trigger", () => {
    ui(
      <ActionSheet
        trigger="Add photo"
        actions={[{ label: "Take Photo", onPress: () => {} }]}
      />,
    );
    // Closed: the Modal is not visible, so RNW mounts none of its rows.
    expect(screen.queryByText("Take Photo")).toBeNull();
    // The uncontrolled trigger opens it.
    fireEvent.click(screen.getByText("Add photo"));
    expect(screen.getByText("Take Photo")).toBeDefined();
  });
});

describe("Popover (anchored card)", () => {
  it("toggles the card from its trigger and exposes aria-expanded", () => {
    const { container } = ui(
      <Popover trigger="Details" title="Heads up" description="Some supporting copy." />,
    );
    const trigger = container.querySelector('[aria-expanded]')!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Heads up")).toBeNull();

    fireEvent.click(screen.getByText("Details"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Heads up")).toBeDefined();
    expect(screen.getByText("Some supporting copy.")).toBeDefined();
  });

  it("closes when the card's action button is pressed", () => {
    // Uncontrolled: open via the trigger, then let the card's action dismiss it.
    ui(<Popover trigger="Details" title="Heads up" actionLabel="Got it" />);
    fireEvent.click(screen.getByText("Details"));
    expect(screen.getByText("Heads up")).toBeDefined();
    fireEvent.click(screen.getByText("Got it"));
    expect(screen.queryByText("Heads up")).toBeNull();
  });
});

describe("Tooltip", () => {
  it("shows the tip as a live alert on trigger press, then hides on re-press", () => {
    const { container } = ui(<Tooltip trigger="Info" label="Extra context" />);
    const trigger = container.querySelector('[aria-expanded]')!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Extra context")).toBeNull();

    fireEvent.click(screen.getByText("Info"));
    const bubble = container.querySelector('[role="alert"]')!;
    expect(bubble).not.toBeNull();
    expect(bubble.getAttribute("aria-live")).toBe("polite");
    expect(bubble.textContent).toBe("Extra context");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByText("Info"));
    expect(screen.queryByText("Extra context")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("RowMenu", () => {
  it("opens the menu from the ⋯ trigger and reports the selected row, then closes", () => {
    let picked: { label: string; index: number } | null = null;
    const { container } = ui(
      <RowMenu
        sectionLabel="Manage"
        items={[{ label: "Rename" }, { label: "Delete", destructive: true }]}
        onSelect={(item, index) => { picked = { label: item.label, index }; }}
      />,
    );
    const trigger = screen.getByLabelText("More options");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Rename")).toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(2);

    fireEvent.click(screen.getByText("Delete"));
    expect(picked).toEqual({ label: "Delete", index: 1 });
    expect(screen.queryByText("Delete")).toBeNull();
  });
});

describe("Dropdown", () => {
  it("opens a role=menu from the trigger, selects a row, and closes", () => {
    let picked: { label: string; index: number } | null = null;
    const { container } = ui(
      <Dropdown
        trigger="Actions"
        items={[{ label: "Duplicate" }, { label: "Archive" }]}
        onSelect={(item, index) => { picked = { label: item.label, index }; }}
      />,
    );
    expect(screen.queryByText("Duplicate")).toBeNull();

    fireEvent.click(screen.getByText("Actions"));
    expect(container.querySelector('[role="menu"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(2);

    fireEvent.click(screen.getByText("Archive"));
    expect(picked).toEqual({ label: "Archive", index: 1 });
    expect(screen.queryByText("Archive")).toBeNull();
  });

  it("does not select or close on a disabled row", () => {
    let selected = false;
    const { container } = ui(
      <Dropdown
        trigger="Actions"
        items={[{ label: "Edit" }, { label: "Remove", disabled: true }]}
        onSelect={() => { selected = true; }}
      />,
    );
    fireEvent.click(screen.getByText("Actions"));
    const disabledRow = container.querySelectorAll('[role="menuitem"]')[1];
    expect(disabledRow.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(screen.getByText("Remove"));
    expect(selected).toBe(false);
    // Still open: a disabled row is a no-op, so the menu stays put.
    expect(screen.getByText("Edit")).toBeDefined();
  });
});

describe("Select (trigger-driven, uncontrolled)", () => {
  it("opens the listbox from the trigger, picks an option, then closes showing the value", () => {
    let chosen = "";
    const { container } = ui(
      <Select options={["Small", "Medium", "Large"]} placeholder="Choose a size" onSelect={(o) => { chosen = o; }} />,
    );
    const trigger = container.querySelector('[aria-expanded]')!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector('[role="listbox"]')).toBeNull();

    fireEvent.click(screen.getByText("Choose a size"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    const options = container.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);

    fireEvent.click(options[1]);
    expect(chosen).toBe("Medium");
    // Closed after select, and the trigger now shows the chosen value.
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    expect(container.querySelector('[aria-expanded]')!.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("Medium")).toBeDefined();
  });
});
