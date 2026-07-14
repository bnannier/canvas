import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { FilterPanel } from "../src/organisms/filter-panel/filter-panel.tsx";

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
