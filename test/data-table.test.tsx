import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { DataTable, type DataTableSort } from "../src/organisms/data-table/data-table.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";

// DataTable behavior: the column model, sorting, row selection, pagination, and
// the loading/empty states. Rendering is react-native-web under happy-dom, so
// assertions read the DOM roles + aria aliases (the same thing a web screen
// reader sees).

let warnSpy: ReturnType<typeof spyOn>;
beforeEach(() => {
  resetDevWarnings();
  warnSpy = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
  cleanup();
});
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The data rows' visible text, in render order (skips the header row).
const rowTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[role="row"]'))
    .slice(1) // header row
    .map((r) => r.textContent ?? "");

const COLUMNS = ["Name", "Role"];
const ROWS: ReactNode[][] = [
  ["Bob", "PM"],
  ["Ada", "Eng"],
  ["Cat", "Ops"],
];

describe("DataTable columns", () => {
  it("accepts string and descriptor columns mixed", () => {
    const { container } = ui(
      <DataTable columns={["Name", { label: "Amount", numeric: true }]} rows={[["Ada", "12"]]} />,
    );
    expect(screen.getByText("Amount")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(2);
  });
});

describe("DataTable sorting", () => {
  it("cycles ascending, descending, off on header press (uncontrolled)", () => {
    const { container } = ui(<DataTable sortable columns={COLUMNS} rows={ROWS} />);
    const original = rowTexts(container);
    expect(original[0]).toContain("Bob");

    fireEvent.click(screen.getByText("Name"));
    expect(rowTexts(container)[0]).toContain("Ada"); // ascending
    const header = container.querySelector('[aria-sort="ascending"]');
    expect(header?.textContent).toContain("Name");

    fireEvent.click(screen.getByText("Name"));
    expect(rowTexts(container)[0]).toContain("Cat"); // descending
    expect(container.querySelector('[aria-sort="descending"]')).not.toBeNull();

    fireEvent.click(screen.getByText("Name"));
    expect(rowTexts(container)[0]).toContain("Bob"); // original order
  });

  it("starts from defaultSort and reports changes", () => {
    let last: DataTableSort | null | undefined;
    const { container } = ui(
      <DataTable
        sortable
        defaultSort={{ column: "Name", descending: true }}
        onSortChange={(s) => {
          last = s;
        }}
        columns={COLUMNS}
        rows={ROWS}
      />,
    );
    expect(rowTexts(container)[0]).toContain("Cat");
    fireEvent.click(screen.getByText("Name"));
    expect(last).toBeNull(); // desc -> off
  });

  it("keeps the order fixed under a controlled sort and only reports the next sort", () => {
    let next: DataTableSort | null | undefined;
    const { container } = ui(
      <DataTable
        sortable
        sort={{ column: "Name" }}
        onSortChange={(s) => {
          next = s;
        }}
        columns={COLUMNS}
        rows={ROWS}
      />,
    );
    fireEvent.click(screen.getByText("Name"));
    expect(next).toEqual({ column: "Name", descending: true });
    expect(rowTexts(container)[0]).toContain("Ada"); // still the controlled ascending order
  });

  it("sorts numerically-aware ('9' before '10')", () => {
    const { container } = ui(
      <DataTable sortable defaultSort={{ column: "N" }} columns={["N"]} rows={[["10"], ["9"], ["2"]]} />,
    );
    expect(rowTexts(container)).toEqual(["2", "9", "10"]);
  });

  it("sorts custom ReactNode cells through the column sortValue", () => {
    const rows: ReactNode[][] = [
      ["Ada", <Badge key="b">beta</Badge>],
      ["Bob", <Badge key="a">alpha</Badge>],
    ];
    const { container } = ui(
      <DataTable
        defaultSort={{ column: "Status" }}
        columns={["Name", { label: "Status", sortable: true, sortValue: (_cell, row) => (row[0] === "Ada" ? "beta" : "alpha") }]}
        rows={rows}
      />,
    );
    expect(rowTexts(container)[0]).toContain("Bob"); // alpha first
  });

  it("only marks sortable columns pressable when sortable is per-column", () => {
    const { container } = ui(
      <DataTable columns={[{ label: "Name", sortable: true }, "Role"]} rows={ROWS} />,
    );
    expect(container.querySelectorAll("[aria-sort]").length).toBe(1);
  });
});

describe("DataTable selection", () => {
  it("toggles a row through its checkbox and reports the keys (uncontrolled)", () => {
    let keys: Array<string | number> = [];
    const { container } = ui(
      <DataTable selectable columns={COLUMNS} rows={ROWS} onSelectionChange={(k) => (keys = k)} />,
    );
    const boxes = container.querySelectorAll('[role="checkbox"]');
    expect(boxes.length).toBe(4); // select-all + one per row
    fireEvent.click(boxes[1]!);
    expect(keys).toEqual([0]);
    expect(boxes[1]!.getAttribute("aria-checked")).toBe("true");
    // Partial selection marks the select-all indeterminate (mixed).
    expect(boxes[0]!.getAttribute("aria-checked")).toBe("mixed");
  });

  it("selects and clears every row through the select-all checkbox", () => {
    let keys: Array<string | number> = [];
    const { container } = ui(
      <DataTable
        selectable
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(row) => String(row[0])}
        onSelectionChange={(k) => (keys = k)}
      />,
    );
    const all = container.querySelector('[aria-label="Select all rows"]')!;
    fireEvent.click(all);
    expect(keys).toEqual(["Bob", "Ada", "Cat"]);
    expect(all.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(all);
    expect(keys).toEqual([]);
  });

  it("toggles selection on a row press when there is no onRowPress", () => {
    let keys: Array<string | number> = [];
    ui(<DataTable selectable columns={COLUMNS} rows={ROWS} onSelectionChange={(k) => (keys = k)} />);
    fireEvent.click(screen.getByText("Ada"));
    expect(keys).toEqual([1]);
  });

  it("keeps the checkbox press isolated from onRowPress", () => {
    let pressed = -1;
    let keys: Array<string | number> | null = null;
    const { container } = ui(
      <DataTable
        selectable
        columns={COLUMNS}
        rows={ROWS}
        onRowPress={(_row, i) => {
          pressed = i;
        }}
        onSelectionChange={(k) => (keys = k)}
      />,
    );
    const boxes = container.querySelectorAll('[role="checkbox"]');
    fireEvent.click(boxes[1]!);
    expect(keys).toEqual([0]);
    expect(pressed).toBe(-1); // the checkbox tap must not also fire the row action
    fireEvent.click(screen.getByText("Ada"));
    expect(pressed).toBe(1);
  });

  it("honors a controlled selection", () => {
    const { container } = ui(
      <DataTable selectable selectedKeys={[0, 2]} columns={COLUMNS} rows={ROWS} />,
    );
    const boxes = container.querySelectorAll('[role="checkbox"]');
    expect(boxes[1]!.getAttribute("aria-checked")).toBe("true");
    expect(boxes[2]!.getAttribute("aria-checked")).toBe("false");
    expect(boxes[3]!.getAttribute("aria-checked")).toBe("true");
  });
});

describe("DataTable pagination", () => {
  const MANY = Array.from({ length: 25 }, (_, i) => [`Item ${i + 1}`, `r${i + 1}`]);

  it("slices rows to the page and shows the item range", () => {
    ui(<DataTable paginated columns={COLUMNS} rows={MANY} />);
    expect(screen.getByText("Item 1")).toBeDefined();
    expect(screen.queryByText("Item 11")).toBeNull();
    expect(screen.getByText("Showing 1-10 of 25")).toBeDefined();
  });

  it("navigates through the footer pagination (uncontrolled)", () => {
    const { container } = ui(<DataTable paginated pageSize={10} columns={COLUMNS} rows={MANY} />);
    fireEvent.click(container.querySelector('[aria-label="Next page"]')!);
    expect(screen.getByText("Item 11")).toBeDefined();
    expect(screen.queryByText("Item 1")).toBeNull();
    expect(screen.getByText("Showing 11-20 of 25")).toBeDefined();
  });

  it("sorts across the whole data set before paging", () => {
    ui(
      <DataTable
        paginated
        sortable
        defaultSort={{ column: "Name", descending: true }}
        columns={COLUMNS}
        rows={MANY}
      />,
    );
    expect(screen.getByText("Item 25")).toBeDefined(); // the global maximum leads page 1
    expect(screen.queryByText("Item 1")).toBeNull();
  });

  it("shows the selection count in the footer", () => {
    ui(
      <DataTable paginated selectable defaultSelectedKeys={[0, 1]} columns={COLUMNS} rows={MANY} />,
    );
    expect(screen.getByText("2 of 25 selected")).toBeDefined();
  });
});

describe("DataTable loading and empty states", () => {
  it("renders skeleton placeholder rows instead of data while loading", () => {
    const { container } = ui(<DataTable loading columns={COLUMNS} rows={ROWS} />);
    expect(screen.queryByText("Ada")).toBeNull();
    // 5 placeholder rows x 2 columns, each a progressbar-role Skeleton line.
    expect(container.querySelectorAll('[role="progressbar"]').length).toBe(10);
  });

  it("renders the emptyMessage centered under the header when there are no rows", () => {
    ui(<DataTable columns={COLUMNS} rows={[]} emptyMessage="No users found." />);
    expect(screen.getByText("No users found.")).toBeDefined();
    expect(screen.getByText("Name")).toBeDefined(); // header intact
  });

  it("renders nothing extra when rows are empty and no emptyMessage is given", () => {
    ui(<DataTable columns={COLUMNS} rows={[]} />);
    expect(screen.queryByText("No users found.")).toBeNull();
  });
});
