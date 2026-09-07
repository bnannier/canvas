import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";

afterEach(cleanup);

const items = [{ label: "Backend" }, { label: "Frontend", detail: "Web applications" }, { label: "Design" }];
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const focus = (node: HTMLElement) => act(() => node.focus());
const keyPress = (node: HTMLElement, key: string) => {
  fireEvent.keyDown(node, { key });
  fireEvent.keyUp(node, { key });
};

describe("Listbox accessible structure", () => {
  it("names the single-select list and retains option selection states", () => {
    const { getByRole, getAllByRole, rerender } = ui(<Listbox items={items} defaultSelected={1} />);
    const list = getByRole("listbox", { name: "Options" });
    const options = getAllByRole("option");
    expect([...list.children]).toEqual(options);
    expect(options.map((row) => row.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    expect(getByRole("option", { name: "Frontend, Web applications" })).toBe(options[1]);
    rerender(<ThemeProvider><Listbox items={items} accessibilityLabel="Teams" /></ThemeProvider>);
    expect(getByRole("listbox", { name: "Teams" })).toBe(list);
    rerender(<ThemeProvider><Listbox items={items} accessibilityLabel="  " /></ThemeProvider>);
    expect(getByRole("listbox", { name: "Options" })).toBe(list);
  });

  it("exposes multi-select as a named group containing only the row checkboxes", () => {
    const { getByRole, getAllByRole, queryByRole } = ui(
      <Listbox multi items={items} accessibilityLabel="Teams" defaultSelected={[0, 2]} />,
    );
    const group = getByRole("group", { name: "Teams" });
    const rows = getAllByRole("checkbox");
    expect(queryByRole("listbox")).toBeNull();
    expect([...group.children]).toEqual(rows);
    expect(rows).toHaveLength(items.length);
    expect(getByRole("checkbox", { name: "Frontend, Web applications" })).toBe(rows[1]);
    expect(rows.map((row) => row.getAttribute("aria-checked"))).toEqual(["true", "false", "true"]);
    expect(group.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

    // An aria-hidden wrapper alone does not remove a nested control from the tab
    // order. The glyph subtree must contain no interactive or focusable host.
    const indicators = group.querySelectorAll('[aria-hidden="true"]');
    expect(indicators).toHaveLength(items.length);
    for (const indicator of indicators) {
      expect(indicator.querySelector('[role], [tabindex], button, input, select, textarea, a[href], [contenteditable="true"]')).toBeNull();
    }
  });

  it("provides a fallback name for a bare multi-select group", () => {
    const { getByRole } = ui(<Listbox multi items={items} />);
    expect(getByRole("group", { name: "Options" })).toBeDefined();
  });

  it("toggles once when pressing the indicator within a checkbox row", () => {
    const changes: (number | number[])[] = [];
    const picks: number[] = [];
    const { getByRole } = ui(
      <Listbox multi items={items} onChange={(next) => changes.push(next)} onSelect={(index) => picks.push(index)} />,
    );
    const row = getByRole("checkbox", { name: "Backend" });
    fireEvent.click(row.querySelector('[aria-hidden="true"]')!);
    expect(changes).toEqual([[0]]);
    expect(picks).toEqual([0]);
    expect(row.getAttribute("aria-checked")).toBe("true");
  });

  it("keeps disabled rows out of the tab order and ignores pointer and keyboard activation", () => {
    const changes: (number | number[])[] = [];
    const picks: number[] = [];
    const { getByRole, getAllByRole } = ui(
      <Listbox multi disabled items={items} onChange={(next) => changes.push(next)} onSelect={(index) => picks.push(index)} />,
    );
    const group = getByRole("group", { name: "Options" });
    const rows = getAllByRole("checkbox");
    expect(group.querySelector('[tabindex="0"]')).toBeNull();
    for (const row of rows) {
      expect(row.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(row);
      keyPress(row, "Enter");
      keyPress(row, " ");
    }
    expect(changes).toEqual([]);
    expect(picks).toEqual([]);
    expect(rows.every((row) => row.getAttribute("aria-checked") === "false")).toBe(true);
  });
});

describe("Listbox complete keyboard presses", () => {
  for (const key of ["Enter", " ", "Spacebar"]) {
    it(`toggles a multi-select row exactly once per ${JSON.stringify(key)} press`, () => {
      const changes: (number | number[])[] = [];
      const picks: number[] = [];
      const { getByRole } = ui(
        <Listbox multi items={items} onChange={(next) => changes.push(next)} onSelect={(index) => picks.push(index)} />,
      );
      const row = getByRole("checkbox", { name: "Backend" });
      focus(row);
      keyPress(row, key);
      expect(row.getAttribute("aria-checked")).toBe("true");
      expect(changes).toEqual([[0]]);
      expect(picks).toEqual([0]);
      keyPress(row, key);
      expect(row.getAttribute("aria-checked")).toBe("false");
      expect(changes).toEqual([[0], []]);
      expect(picks).toEqual([0, 0]);
    });
  }

  for (const key of ["Enter", " "]) {
    it(`selects once in single-select mode with ${JSON.stringify(key)}`, () => {
      const changes: (number | number[])[] = [];
      const picks: number[] = [];
      const { getByRole } = ui(
        <Listbox items={items} onChange={(next) => changes.push(next)} onSelect={(index) => picks.push(index)} />,
      );
      const row = getByRole("option", { name: "Backend" });
      focus(row);
      keyPress(row, key);
      expect(row.getAttribute("aria-selected")).toBe("true");
      expect(changes).toEqual([0]);
      expect(picks).toEqual([0]);
    });
  }

  it("does not toggle repeatedly while Space is held", () => {
    const changes: (number | number[])[] = [];
    const { getByRole } = ui(<Listbox multi items={items} onChange={(next) => changes.push(next)} />);
    const row = getByRole("checkbox", { name: "Backend" });
    focus(row);
    fireEvent.keyDown(row, { key: " " });
    fireEvent.keyDown(row, { key: " ", repeat: true });
    fireEvent.keyDown(row, { key: " ", repeat: true });
    fireEvent.keyUp(row, { key: " " });
    expect(changes).toEqual([[0]]);
    expect(row.getAttribute("aria-checked")).toBe("true");
  });

  it("emits one controlled update and waits for the parent to accept it", () => {
    const changes: (number | number[])[] = [];
    const picks: number[] = [];
    const onChange = (next: number | number[]) => changes.push(next);
    const onSelect = (index: number) => picks.push(index);
    const { getByRole, rerender } = ui(
      <Listbox multi items={items} selected={[]} onChange={onChange} onSelect={onSelect} />,
    );
    const row = getByRole("checkbox", { name: "Backend" });
    focus(row);
    keyPress(row, "Enter");
    expect(changes).toEqual([[0]]);
    expect(picks).toEqual([0]);
    expect(row.getAttribute("aria-checked")).toBe("false");
    rerender(<ThemeProvider><Listbox multi items={items} selected={[0]} onChange={onChange} onSelect={onSelect} /></ThemeProvider>);
    expect(row.getAttribute("aria-checked")).toBe("true");
    keyPress(row, "Enter");
    expect(changes).toEqual([[0], []]);
    expect(picks).toEqual([0, 0]);
    expect(row.getAttribute("aria-checked")).toBe("true");
  });

  it("moves real focus with arrows and Home/End without changing multi-selection", () => {
    const changes: (number | number[])[] = [];
    const { getAllByRole, getByRole } = ui(
      <Listbox multi items={items} defaultSelected={[1]} onChange={(next) => changes.push(next)} />,
    );
    const rows = getAllByRole("checkbox");
    const group = getByRole("group", { name: "Options" });
    focus(rows[1]);
    for (const [key, index] of [["ArrowDown", 2], ["ArrowDown", 0], ["End", 2], ["Home", 0]] as const) {
      keyPress(document.activeElement as HTMLElement, key);
      expect(document.activeElement).toBe(rows[index]);
      expect(group.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
      expect(rows[index].getAttribute("tabindex")).toBe("0");
    }
    expect(changes).toEqual([]);
    expect(rows.map((row) => row.getAttribute("aria-checked"))).toEqual(["false", "true", "false"]);
  });
});
