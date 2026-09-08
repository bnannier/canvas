import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { DataTable, type DataTableColumn, type DataTableProps } from "../src/organisms/data-table/data-table.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[role="row"]')).slice(1).map((row) =>
    row.querySelector('[role="cell"]')?.textContent,
  );

describe("DataTable data-derived work", () => {
  it("does not re-sort or scan selection during local edits, delete arming, or paging", () => {
    let sortReads = 0;
    let keyReads = 0;
    const rows: ReactNode[][] = Array.from({ length: 3_000 }, (_, index) => {
      const id = 2_999 - index;
      return [`Person ${id}`, String(id)];
    });
    rows.forEach(Object.freeze);
    Object.freeze(rows);
    const columns: Array<string | DataTableColumn> = [
      { label: "Name", sortValue: (_cell, row) => { sortReads += 1; return Number(row[1]); } },
      "Score",
    ];
    columns.forEach(Object.freeze);
    Object.freeze(columns);
    const rowKey = (row: ReactNode[]) => { keyReads += 1; return String(row[0]); };
    const props: DataTableProps = {
      columns, rows, rowKey, selectable: true, paginated: true, pageSize: 10,
      sort: { column: "Name" }, inlineEdit: true,
      onCellCommit: () => {}, onRowEdit: () => {}, onRowCommit: () => {}, onRowDelete: () => {},
    };
    const { container, rerender } = ui(<DataTable {...props} />);
    expect(sortReads).toBe(rows.length);
    expect(screen.getByText("Person 0")).toBeTruthy();

    const localChange = (change: () => void) => {
      keyReads = 0;
      change();
      expect(sortReads).toBe(rows.length);
      // Visible rows still need React/selection keys. Offscreen rows do not.
      expect(keyReads).toBeLessThan(rows.length / 10);
    };
    localChange(() => fireEvent.click(screen.getByLabelText("Edit Person 0")));
    localChange(() => fireEvent.change(screen.getByDisplayValue("Person 0"), { target: { value: "Updated" } }));
    localChange(() => fireEvent.change(screen.getByDisplayValue("Updated"), { target: { value: "Updated again" } }));
    localChange(() => fireEvent.click(screen.getByLabelText("Cancel editing Person 0")));
    localChange(() => fireEvent.click(screen.getByText("Person 0")));
    localChange(() => fireEvent.change(screen.getByDisplayValue("Person 0"), { target: { value: "Draft" } }));
    localChange(() => fireEvent.keyDown(screen.getByDisplayValue("Draft"), { key: "Escape" }));
    localChange(() => fireEvent.click(screen.getByLabelText("Delete Person 0")));
    expect(screen.getByLabelText("Confirm delete Person 0")).toBeTruthy();
    localChange(() => fireEvent.click(screen.getByLabelText("Next page")));
    expect(screen.getByText("Person 10")).toBeTruthy();
    localChange(() => rerender(<ThemeProvider><DataTable {...props} compact sort={{ column: "Name", descending: false }} /></ThemeProvider>));

    // A changed selection must update its summary, but still must not re-sort.
    fireEvent.click(container.querySelectorAll('[role="checkbox"]')[1]!);
    expect(container.querySelector('[aria-label="Select all rows"]')?.getAttribute("aria-checked")).toBe("mixed");
    expect(sortReads).toBe(rows.length);
    localChange(() => fireEvent.click(screen.getByLabelText("Edit Person 10")));
  });

  it("does not inspect offscreen row keys when selection is disabled", () => {
    let keyReads = 0;
    const rows = Array.from({ length: 3_000 }, (_, index) => [`Person ${index}`]);
    ui(<DataTable
      columns={["Name"]} rows={rows} paginated
      rowKey={(row) => { keyReads += 1; return String(row[0]); }}
    />);
    expect(screen.getByText("Person 0")).toBeTruthy();
    expect(keyReads).toBeLessThan(rows.length / 10);
  });

  it("invalidates ordering for immutable data, column, callback, and sort changes", () => {
    let sortReads = 0;
    const score: DataTableColumn = {
      label: "Score", sortValue: (cell) => {
        sortReads += 1;
        return /^[0-9]+$/.test(String(cell)) ? Number(cell) : -String(cell).charCodeAt(0);
      },
    };
    const columns = ["Name", score];
    const rows: ReactNode[][] = [["C", "3"], ["A", "1"], ["B", "2"]];
    rows.forEach(Object.freeze);
    Object.freeze(rows);
    Object.freeze(score);
    Object.freeze(columns);
    const { container, rerender } = ui(<DataTable columns={columns} rows={rows} sort={{ column: "Score" }} />);
    const update = (props: Partial<DataTableProps>) => rerender(
      <ThemeProvider><DataTable columns={columns} rows={rows} sort={{ column: "Score" }} {...props} /></ThemeProvider>,
    );
    expect(names(container)).toEqual(["A", "B", "C"]);
    expect(sortReads).toBe(3);
    update({ sort: { column: "Score", descending: true } });
    expect(names(container)).toEqual(["C", "B", "A"]);
    update({ sort: { column: "Name" } });
    expect(names(container)).toEqual(["A", "B", "C"]);
    update({ sort: null });
    expect(names(container)).toEqual(["C", "A", "B"]);
    const changedRows = rows.map((row) => row[0] === "C" ? ["C", "0"] : row);
    changedRows.forEach(Object.freeze);
    Object.freeze(changedRows);
    update({ rows: changedRows });
    expect(names(container)).toEqual(["C", "A", "B"]);
    update({ columns: ["Name", { ...score, sortValue: (cell) => -Number(cell) }] });
    expect(names(container)).toEqual(["C", "B", "A"]);
    // Moving the same sorted descriptor changes which cell is sorted.
    update({ columns: [score, "Name"] });
    expect(names(container)).toEqual(["C", "B", "A"]);
    expect(rows).toEqual([["C", "3"], ["A", "1"], ["B", "2"]]);
  });

  it("reorders a committed immutable edit and preserves original callback indices", () => {
    const commits: Array<[number, number, string]> = [];
    const presses: number[] = [];
    const deletions: number[] = [];
    const columns = ["Name", "Score"];
    function Editable() {
      const [rows, setRows] = useState<ReactNode[][]>([["C", "3"], ["A", "1"], ["B", "2"]]);
      return <DataTable
        columns={columns} rows={rows} defaultSort={{ column: "Score" }}
        inlineEdit onRowPress={(_row, index) => presses.push(index)} onRowDelete={(index) => deletions.push(index)}
        onCellCommit={(r, c, next) => {
          commits.push([r, c, next]);
          setRows((current) => current.map((row, i) => i === r ? row.map((cell, j) => j === c ? next : cell) : row));
        }}
      />;
    }
    const { container } = ui(<Editable />);
    expect(names(container)).toEqual(["A", "B", "C"]);
    fireEvent.click(screen.getByText("3"));
    fireEvent.change(screen.getByDisplayValue("3"), { target: { value: "0" } });
    fireEvent.keyDown(screen.getByDisplayValue("0"), { key: "Enter" });
    expect(commits).toEqual([[0, 1, "0"]]);
    expect(names(container)).toEqual(["C", "A", "B"]);
    fireEvent.click(screen.getByLabelText("A, 1"));
    expect(presses).toEqual([1]);
    fireEvent.click(screen.getByLabelText("Delete A"));
    fireEvent.click(screen.getByLabelText("Confirm delete A"));
    expect(deletions).toEqual([1]);
  });

  it("updates selection summaries when controlled keys, rows, or rowKey change", () => {
    const rows = [["A"], ["B"]];
    const columns = ["Name"];
    const key = (row: ReactNode[]) => String(row[0]);
    const props: DataTableProps = { rows, columns, rowKey: key, selectable: true, selectedKeys: ["A", "B"] };
    const { container, rerender } = ui(<DataTable {...props} />);
    const state = () => container.querySelector('[aria-label="Select all rows"]')?.getAttribute("aria-checked");
    const update = (next: Partial<DataTableProps>) => rerender(<ThemeProvider><DataTable {...props} {...next} /></ThemeProvider>);
    expect(state()).toBe("true");
    update({ selectedKeys: ["B"] });
    expect(state()).toBe("mixed");
    update({ rows: [...rows, ["C"]] });
    expect(state()).toBe("mixed");
    update({ rowKey: (_row, i) => i });
    expect(state()).toBe("false");
    update({ rows: [] });
    expect(state()).toBe("false");
  });

  it("keeps equal values stable and missing sort values last in both directions", () => {
    const rows: ReactNode[][] = [["A", 2], ["B", null], ["C", 1], ["D", 1], ["E", undefined]];
    rows.forEach(Object.freeze);
    Object.freeze(rows);
    const columns: Array<string | DataTableColumn> = [
      "Name", { label: "Score", sortValue: (cell) => typeof cell === "number" ? cell : null },
    ];
    const { container, rerender } = ui(<DataTable columns={columns} rows={rows} sort={{ column: "Score" }} />);
    expect(names(container)).toEqual(["C", "D", "A", "B", "E"]);
    rerender(<ThemeProvider><DataTable columns={columns} rows={rows} sort={{ column: "Score", descending: true }} /></ThemeProvider>);
    expect(names(container)).toEqual(["A", "C", "D", "B", "E"]);
    expect(rows.map((row) => row[0])).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("updates cached page membership for page size, clamping, and pagination changes", () => {
    let sortReads = 0;
    const rows = [["F"], ["E"], ["D"], ["C"], ["B"], ["A"]];
    const columns = [{ label: "Name", sortValue: (cell: ReactNode) => { sortReads += 1; return String(cell); } }];
    const props: DataTableProps = { rows, columns, paginated: true, page: 2, pageSize: 2, sort: { column: "Name" } };
    const { container, rerender } = ui(<DataTable {...props} />);
    const update = (next: Partial<DataTableProps>) => rerender(<ThemeProvider><DataTable {...props} {...next} /></ThemeProvider>);
    expect(names(container)).toEqual(["C", "D"]);
    expect(sortReads).toBe(6);
    update({ pageSize: 3 });
    expect(names(container)).toEqual(["D", "E", "F"]);
    update({ paginated: false });
    expect(names(container)).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(sortReads).toBe(6);
    update({ rows: [["B"], ["A"]] });
    expect(names(container)).toEqual(["A", "B"]);
    expect(screen.getByText("Showing 1-2 of 2")).toBeTruthy();
    expect(sortReads).toBe(8);
  });
});
