import { describe, it, expect, afterEach } from "bun:test";
import { act, render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { FilterPanel } from "../src/organisms/filter-panel/filter-panel.tsx";
import { FilterPanel as FilterPanelIOS } from "../src/organisms/filter-panel/filter-panel.ios.tsx";
import { FilterPanel as FilterPanelAndroid } from "../src/organisms/filter-panel/filter-panel.android.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

const GROUPS = [
  { title: "Status", options: [{ label: "Open", value: "open" }, { label: "Closed", value: "closed" }] },
  { title: "Kind", options: [{ label: "Bug", value: "bug" }] },
];

describe("FilterPanel", () => {
  it("toggles an option uncontrolled and reports both the toggle and the full selection", () => {
    let selection: string[] | null = null;
    let last: [number, number, boolean] | null = null;
    ui(
      <FilterPanel
        groups={GROUPS}
        onSelectionChange={(s) => { selection = s; }}
        onChange={(g, o, n) => { last = [g, o, n]; }}
      />,
    );
    const open = screen.getByLabelText("Open");
    expect(open.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(open);
    expect(open.getAttribute("aria-checked")).toBe("true");
    expect(selection).toEqual(["open"]);
    expect(last).toEqual([0, 0, true]);
  });

  it("seeds from defaultValue and empties on Clear", () => {
    let selection: string[] | null = null;
    let cleared = false;
    ui(
      <FilterPanel
        groups={GROUPS}
        defaultValue={["open", "bug"]}
        onSelectionChange={(s) => { selection = s; }}
        onClear={() => { cleared = true; }}
      />,
    );
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("true");
    expect(screen.getByLabelText("Bug").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByText("Clear"));
    expect(cleared).toBe(true);
    expect(selection).toEqual([]);
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("false");
  });

  it("is controlled by value: the parent drives the checked rows", () => {
    let selection: string[] | null = null;
    const { rerender } = ui(
      <FilterPanel groups={GROUPS} value={["open"]} onSelectionChange={(s) => { selection = s; }} />,
    );
    const closed = screen.getByLabelText("Closed");
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("true");
    expect(closed.getAttribute("aria-checked")).toBe("false");
    // A toggle reports the full next set but does not self-update: the parent owns `value`.
    fireEvent.click(closed);
    expect(selection).toEqual(["open", "closed"]);
    expect(closed.getAttribute("aria-checked")).toBe("false");
    // Once the parent syncs `value`, the row reflects it.
    rerender(
      <ThemeProvider>
        <FilterPanel groups={GROUPS} value={["open", "closed"]} onSelectionChange={(s) => { selection = s; }} />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Closed").getAttribute("aria-checked")).toBe("true");
  });
});


for (const [platform, Component] of [["web", FilterPanel], ["ios", FilterPanelIOS], ["android", FilterPanelAndroid]] as const) {
  describe(`${platform} FilterPanel option accessibility`, () => {
    const groups = [{ title: "Status", options: [
      { label: "Active", value: "active", count: "128" },
      { label: "Archived", value: "archived", count: "42" },
    ] }];

    it("exposes one named checkbox and tab stop per option with inert visuals", () => {
      const { container, getAllByRole, getByRole } = ui(<Component groups={groups} />);
      expect(getAllByRole("checkbox")).toHaveLength(2);
      expect(container.querySelectorAll('[role="checkbox"]')).toHaveLength(2);
      for (const name of ["Active, 128", "Archived, 42"]) {
        const row = getByRole("checkbox", { name });
        expect(row.tabIndex).toBe(0);
        expect(row.querySelector('[tabindex], button, input, select, textarea, a[href], [contenteditable="true"]')).toBeNull();
        expect(row.querySelector('[aria-hidden="true"]')).not.toBeNull();
      }
    });

    it("toggles once on Space release and once on Enter, while retaining focus", () => {
      const changes: string[][] = [];
      const toggles: [number, number, boolean][] = [];
      const { getByRole } = ui(<Component groups={groups}
        onSelectionChange={(next) => changes.push(next)} onChange={(g, o, next) => toggles.push([g, o, next])} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      expect(fireEvent.keyDown(row, { key: " " })).toBe(false);
      fireEvent.keyDown(row, { key: " ", repeat: true });
      expect(changes).toEqual([]);
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([["active"]]);
      expect(toggles).toEqual([[0, 0, true]]);
      expect(row.getAttribute("aria-checked")).toBe("true");
      fireEvent.keyDown(row, { key: "Enter" });
      fireEvent.keyUp(row, { key: "Enter" });
      expect(changes).toEqual([["active"], []]);
      expect(toggles).toEqual([[0, 0, true], [0, 0, false]]);
      expect(row.getAttribute("aria-checked")).toBe("false");
      expect(document.activeElement).toBe(row);
    });

    it("uses one selection path for the visible label, count and row body", () => {
      const changes: string[][] = [];
      const { getByRole } = ui(<Component groups={groups} onSelectionChange={(next) => changes.push(next)} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      fireEvent.click(within(row).getByText("Active"));
      expect(changes).toEqual([["active"]]);
      fireEvent.click(within(row).getByText("128"));
      expect(changes).toEqual([["active"], []]);
      fireEvent.click(row);
      expect(changes).toEqual([["active"], [], ["active"]]);
      expect(getByRole("checkbox", { name: "Active, 128" })).toBe(row);
    });

    it("keeps a focused stable-value row and its held Space sequence through reordering", () => {
      const changes: string[][] = [];
      const toggles: [number, number, boolean][] = [];
      const view = (reversed: boolean) => <ThemeProvider><Component
        groups={[{ title: "Status", options: reversed ? [...groups[0].options].reverse() : groups[0].options }]}
        onSelectionChange={(next) => changes.push(next)} onChange={(g, o, next) => toggles.push([g, o, next])} /></ThemeProvider>;
      const { getByRole, rerender } = render(view(false));
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      fireEvent.keyDown(row, { key: " " });
      rerender(view(true));
      expect(getByRole("checkbox", { name: "Active, 128" })).toBe(row);
      expect(document.activeElement).toBe(row);
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([["active"]]);
      expect(toggles).toEqual([[0, 1, true]]);
      expect(row.getAttribute("aria-checked")).toBe("true");
    });

    it("cancels a held Space when focus leaves the row", () => {
      const changes: string[][] = [];
      const { getByRole } = ui(<Component groups={groups} onSelectionChange={(next) => changes.push(next)} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      fireEvent.keyDown(row, { key: " " });
      act(() => getByRole("checkbox", { name: "Archived, 42" }).focus());
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([]);
    });
  });
}
