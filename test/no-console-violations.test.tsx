import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Toast } from "../src/organisms/toast/toast.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";

// A console-error gate: React DOM (which react-native-web renders through) logs a
// DOM-nesting violation whenever one interactive element ends up inside another —
// e.g. RNW turns a button-roled `Pressable` into a real <button>, so a Pressable
// row nested in a button-roled Pressable produces "<button> cannot be a descendant
// of <button>" / "cannot contain a nested <button>". That is both invalid HTML and
// an a11y bug (an ambiguous, doubly-focusable control). It surfaces only as a
// console.error at render time, so it slips past assertion-based tests.
//
// This suite renders a representative spread of the kit's interactive + overlay
// components (the places where interactive nesting is most likely) and fails if any
// nesting-style violation is logged during render. It regression-locks the
// ActionSheet fix (its dismiss target is now an EMPTY sibling Pressable behind the
// sheet, not a wrapper around the action rows) and guards the rest of the set.

afterEach(cleanup);

// Matches React's DOM-nesting diagnostics across phrasings/versions:
//   "In HTML, <button> cannot be a descendant of <button>."
//   "<button> cannot contain a nested <button>."
//   legacy: "validateDOMNesting(...): <x> cannot appear as a descendant of <y>"
const NESTING_RE = /cannot be a descendant|cannot appear as a descendant|cannot contain a nested|validateDOMNesting/i;

// Render `node` while intercepting console.error, and return every logged message
// that looks like a DOM-nesting violation. console.error is always restored (even
// if render throws) so one failing case can't leak the spy into later tests.
function nestingViolationsDuringRender(node: ReactNode): string[] {
  const original = console.error;
  const violations: string[] = [];
  console.error = (...args: unknown[]) => {
    const message = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
    if (NESTING_RE.test(message)) violations.push(message);
    // Keep forwarding so genuinely-unexpected errors still show up in the run log.
    original(...(args as []));
  };
  try {
    render(<ThemeProvider>{node}</ThemeProvider>);
  } finally {
    console.error = original;
  }
  return violations;
}

describe("no DOM-nesting console violations at render", () => {
  it("ActionSheet (open) renders no nested interactive elements", () => {
    const violations = nestingViolationsDuringRender(
      <ActionSheet
        open
        onOpenChange={() => {}}
        title="Move to"
        message="Choose a destination"
        actions={[
          { label: "Archive", onPress: () => {} },
          { label: "Delete", destructive: true, onPress: () => {} },
          { label: "Report", disabled: true, onPress: () => {} },
        ]}
      />,
    );
    expect(violations).toEqual([]);
  });

  it("ActionSheet's dismiss target is a sibling of the rows, not their ancestor", () => {
    // The specific shape the fix guarantees: the button-roled scrim/dismiss control
    // must not be an ANCESTOR of any other button (that is the nesting bug). RNW
    // portals the Modal onto document.body, so query there.
    render(
      <ThemeProvider>
        <ActionSheet
          open
          onOpenChange={() => {}}
          actions={[{ label: "One", onPress: () => {} }, { label: "Two", onPress: () => {} }]}
        />
      </ThemeProvider>,
    );
    const buttons = Array.from(document.querySelectorAll("button"));
    expect(buttons.length).toBeGreaterThan(0);
    const anyButtonInsideButton = buttons.some((b) => b.parentElement?.closest("button") != null);
    expect(anyButtonInsideButton).toBe(false);
  });

  it("a representative spread of interactive + overlay components renders clean", () => {
    const violations = nestingViolationsDuringRender(
      <>
        <Dialog open onOpenChange={() => {}} title="Delete file?" description="This cannot be undone." />
        <RowMenu
          open
          onOpenChange={() => {}}
          items={[{ label: "Edit" }, { label: "Duplicate" }, { label: "Delete", destructive: true }]}
        />
        <Toast message="Changes saved" action={{ label: "Undo", onPress: () => {} }} onDismiss={() => {}} />
        <Select open options={["Low", "Medium", "High"]} value="Medium" onSelect={() => {}} />
        <Combobox open options={["Apple", "Banana"]} value="Banana" onSelect={() => {}} />
        <Dropdown label="Actions" items={[{ label: "Rename" }, { label: "Move" }]} />
        <Command open active={0} groups={[{ items: [{ label: "New file" }, { label: "Open" }] }]} onSelect={() => {}} />
        <TabBar
          items={[
            { key: "home", label: "Home", icon: () => <Text>h</Text> },
            { key: "search", label: "Search", icon: () => <Text>s</Text> },
          ]}
          active="home"
          onSelect={() => {}}
        />
        <Tabs tabs={["Overview", "Activity", "Settings"]} active={0} />
        <DataTable
          columns={["Name", "Role"]}
          rows={[["Ada", "Eng"], ["Bob", "PM"]]}
          onRowPress={() => {}}
        />
        <Pagination page={2} total={5} onChange={() => {}} />
        <ButtonGroup items={["Day", "Week", "Month"]} active={0} onSelect={() => {}} />
        <Listbox items={[{ label: "One", selected: true }, { label: "Two" }]} onSelect={() => {}} />
      </>,
    );
    expect(violations).toEqual([]);
  });
});
