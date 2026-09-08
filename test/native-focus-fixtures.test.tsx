import { afterEach, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as React from "react";
import * as JSX from "react/jsx-runtime";
import ts from "typescript";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Column, Row } from "../src/atoms/layout/layout.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Radio } from "../src/atoms/radio/radio.tsx";
import { RadioGroup } from "../src/atoms/radio/radio-group.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { DescriptionList } from "../src/molecules/description-lists/description-lists.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const root = resolve(import.meta.dir, "..");

// Evaluate the actual shared public-API fixture with real Canvas components in
// the RNW harness. This verifies fixture state/callback wiring, not native hover
// or spoken feedback, which require the identified device candidate.
function fixture<Props extends object>(name: string, exported: string) {
  const source = readFileSync(resolve(root, `examples/starter/smoke/fixtures/${name}.tsx`), "utf8");
  const modules: Record<string, unknown> = {
    react: React,
    "react/jsx-runtime": JSX,
    "@nannier-com/canvas": {
      ActionSheet, Autocomplete, Button, Checkbox, Column, Command, DataTable,
      DescriptionList, Dialog, Drawer, Dropdown, Listbox, Radio, RadioGroup,
      Row, Select, Slider, Switch, Tabs, Typography,
    },
  };
  const exports: Record<string, React.ComponentType<Props>> = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "exports", compiled)((name: string) => {
    if (!(name in modules)) throw new Error(`Unexpected fixture import ${name}`);
    return modules[name];
  }, exports);
  return exports[exported]!;
}

const TabsBody = fixture<{ disabled?: boolean }>("tabs", "TabsBody");
const ListboxBody = fixture<{ controlled?: boolean; disabled?: boolean }>("listbox", "ListboxBody");
const EscapeLayersBody = fixture<{ scenario?: string }>("escape-layers", "EscapeLayersBody");
const ControlRefsBody = fixture("control-refs", "ControlRefsBody");
const text = (id: string) => screen.getByTestId(id).textContent;

test("Tabs fixture reports the actual inactive selection once and keeps disabled items inert", async () => {
  await act(async () => { render(<ThemeProvider><TabsBody /></ThemeProvider>); });
  const activity = screen.getByRole("tab", { name: "Activity" });
  expect(activity.getAttribute("aria-selected")).toBe("false");
  fireEvent.click(activity);
  expect(activity.getAttribute("aria-selected")).toBe("true");
  expect(text("tabs-selection")).toBe("Selected tab: Activity");
  expect(text("tabs-change-count")).toBe("Changes: 1");
  const disabled = screen.getByRole("tab", { name: "Unavailable" });
  expect(disabled.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(disabled);
  expect(disabled.getAttribute("aria-selected")).toBe("false");
  expect(text("tabs-selection")).toBe("Selected tab: Activity");
  expect(text("tabs-change-count")).toBe("Changes: 1");
});

test("a fresh disabled Tabs scenario preserves its default selection and zero callbacks", () => {
  const view = render(<ThemeProvider><TabsBody key="enabled" /></ThemeProvider>);
  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
  view.rerender(<ThemeProvider><TabsBody key="disabled" disabled /></ThemeProvider>);
  for (const tab of screen.getAllByRole("tab")) {
    expect(tab.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(tab);
  }
  expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true");
  expect(text("tabs-selection")).toBe("Selected tab: Overview");
  expect(text("tabs-change-count")).toBe("Changes: 0");
});

for (const controlled of [false, true]) {
  test(`${controlled ? "controlled" : "uncontrolled"} Listbox fixtures expose single and multi callback counts`, () => {
    render(<ThemeProvider><ListboxBody controlled={controlled} /></ThemeProvider>);
    const single = within(screen.getByTestId("primary-team")).getByRole("option", { name: "Frontend, Web applications" });
    expect(single.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(single);
    expect(single.getAttribute("aria-selected")).toBe("true");
    expect(text("single-change-count")).toBe("Changes: 1");
    expect(text("single-pick-count")).toBe("Picks: 1");
    const multi = within(screen.getByTestId("project-teams")).getByRole("checkbox", { name: "Frontend, Web applications" });
    for (const [count, checked] of [[1, "true"], [2, "false"]] as const) {
      fireEvent.click(multi);
      expect(multi.getAttribute("aria-checked")).toBe(checked);
      expect(text("multi-change-count")).toBe(`Changes: ${count}`);
      expect(text("multi-pick-count")).toBe(`Picks: ${count}`);
    }
  });

  test(`${controlled ? "controlled" : "uncontrolled"} disabled Listbox fixtures retain state and zero callback counts`, () => {
    render(<ThemeProvider><ListboxBody controlled={controlled} disabled /></ThemeProvider>);
    for (const [id, role, state] of [["primary-team", "option", "aria-selected"], ["project-teams", "checkbox", "aria-checked"]] as const) {
      const rows = within(screen.getByTestId(id)).getAllByRole(role);
      const before = rows.map((row) => row.getAttribute(state));
      rows.forEach((row) => {
        expect(row.getAttribute("aria-disabled")).toBe("true");
        fireEvent.click(row);
      });
      expect(rows.map((row) => row.getAttribute(state))).toEqual(before);
    }
    expect(text("single-change-count")).toBe("Changes: 0");
    expect(text("single-pick-count")).toBe("Picks: 0");
    expect(text("multi-change-count")).toBe("Changes: 0");
    expect(text("multi-pick-count")).toBe("Picks: 0");
  });
}

for (const disabled of [false, true]) {
  test(`Drawer fixture records Archive identity and only enabled selection callbacks (disabled=${disabled})`, async () => {
    const original = Element.prototype.getBoundingClientRect;
    // The hosted card requires real nonzero layout before it mounts. Await that
    // state rather than assuming a fixed sleep completes its measurement chain.
    Element.prototype.getBoundingClientRect = () => ({
      x: 10, y: 20, width: 288, height: 44, top: 20, left: 10, right: 298, bottom: 64, toJSON: () => ({}),
    });
    try {
      render(<ThemeProvider><EscapeLayersBody scenario={disabled ? "drawer-disabled" : "drawer"} /></ThemeProvider>);
      fireEvent.click(screen.getByRole("button", { name: "Open drawer" }));
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      const archive = await screen.findByRole("menuitem", { name: "Archive" });
      expect(archive.getAttribute("aria-disabled") === "true").toBe(disabled);
      fireEvent.click(archive);
      expect(text("menu-selected")).toBe(`Selected: ${disabled ? "None" : "Archive"}`);
      expect(text("menu-select-count")).toBe(`Selections: ${disabled ? 0 : 1}`);
      expect(screen.getByText("Drawer content")).toBeDefined();
      if (disabled) expect(screen.getByRole("menuitem", { name: "Rename" })).toBeDefined();
      else await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Rename" })).toBeNull());
    } finally {
      cleanup();
      Element.prototype.getBoundingClientRect = original;
    }
  });
}

test("the reused refs fixture counts unchecked Radio changes and keeps a disabled group inert", () => {
  render(<ThemeProvider><ControlRefsBody /></ThemeProvider>);
  const daily = screen.getByRole("radio", { name: "Daily" });
  const weekly = screen.getByRole("radio", { name: "Weekly" });
  expect(weekly.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(weekly);
  expect(weekly.getAttribute("aria-checked")).toBe("true");
  expect(text("ref-changes")).toBe("Changes: 1");
  fireEvent.click(screen.getByRole("button", { name: "Disable controls" }));
  expect(daily.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(daily);
  expect(daily.getAttribute("aria-checked")).toBe("false");
  expect(text("ref-changes")).toBe("Changes: 1");
  fireEvent.click(screen.getByRole("button", { name: "Enable controls" }));
  fireEvent.click(daily);
  expect(daily.getAttribute("aria-checked")).toBe("true");
  expect(text("ref-changes")).toBe("Changes: 2");
});
