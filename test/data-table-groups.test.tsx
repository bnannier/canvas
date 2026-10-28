import { type ComponentType, type ReactNode } from "react";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { act, render, cleanup, fireEvent, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { lightColors } from "../src/style/tokens.ts";
import { DataTable, type DataTableProps, type DataTableGroup } from "../src/organisms/data-table/data-table.tsx";
import { DataTable as AndroidDataTable } from "../src/organisms/data-table/data-table.android.tsx";
import { DataTable as IosDataTable } from "../src/organisms/data-table/data-table.ios.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { mockInPageFrost } from "./fixtures/material-platform.ts";

// DataTable `groups` (titled bands spanning every column above each group's rows) and
// the column weights (`grow`, `minWidth`) the v4 props table is laid out with:
// `minmax(150px, 1fr) minmax(150px, 1.2fr) 100px minmax(220px, 2.2fr)`.

let warnSpy: ReturnType<typeof spyOn>;
beforeEach(() => {
  resetDevWarnings();
  warnSpy = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
  cleanup();
});
const ui = (node: ReactNode, glass = false) => render(<ThemeProvider glass={glass}>{node}</ThemeProvider>);

type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
function measure(width: number) {
  const handler = (screen.getByTestId("table") as LayoutHost).__reactLayoutHandler;
  if (!handler) throw new Error("The table has no onLayout handler");
  act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width, height: 400 } }, timeStamp: 1 }));
}

const GROUPS: DataTableGroup[] = [
  {
    label: "Intent",
    adornment: <Badge testID="pick">pick one</Badge>,
    count: 3,
    rows: [
      ["primary", "b"],
      ["destructive", "c"],
      ["ghost", "a"],
    ],
  },
  { label: "State", count: 2, rows: [["loading", "z"], ["disabled", "y"]] },
  { label: "Empty", rows: [] },
];

// The rendered rows, a band reading as `band:<label>` and a data row as its first cell.
const order = () =>
  screen.getAllByRole("row").flatMap((row) => {
    if (within(row).queryAllByRole("columnheader").length > 0) return [];
    const cells = within(row).getAllByRole("cell");
    if (cells.length === 1 && cells[0]!.getAttribute("aria-colspan")) return [`band:${within(cells[0]!).getAllByText(/./)[0]!.textContent}`];
    return [cells[0]!.textContent];
  });

const ENTRIES = [["web", DataTable], ["android", AndroidDataTable], ["ios", IosDataTable]] as Array<[string, ComponentType<DataTableProps>]>;

for (const [platform, Table] of ENTRIES) {
  describe(`DataTable groups (${platform})`, () => {
    it("draws a band above each group with rows, carrying its label, adornment and count", () => {
      ui(<Table testID="table" columns={["Prop", "Key"]} groups={GROUPS} />);
      expect(order()).toEqual(["band:Intent", "primary", "destructive", "ghost", "band:State", "loading", "disabled"]);
      expect(screen.getByTestId("pick").textContent).toBe("pick one");
      expect(screen.getByText("3")).toBeTruthy();
      expect(screen.queryByText("Empty")).toBeNull();
    });

    it("spans the band's one cell across every column, the selection column included", () => {
      ui(<Table testID="table" selectable columns={["Prop", "Key"]} groups={GROUPS} />);
      const band = screen.getByText("Intent").closest('[role="cell"]')!;
      expect(band.getAttribute("aria-colspan")).toBe("3");
    });

    // The table is in-page material: the web keeps its complete solid skin under glass (the
    // v4 hand-off), and a platform whose in-page surfaces frost paints the band as an ink tint.
    it("paints the band on the sunken fill, kept on the web under glass, an ink tint where the table frosts", () => {
      const band = () => (screen.getByText("Intent").closest('[role="row"]') as HTMLElement).style.backgroundColor.replace(/\s/g, "");
      ui(<Table testID="table" columns={["Prop", "Key"]} groups={GROUPS} />);
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(lightColors["surface-sunken"]!.slice(i, i + 2), 16));
      expect(band()).toBe(`rgba(${r},${g},${b},1.00)`);
      cleanup();
      ui(<Table testID="table" columns={["Prop", "Key"]} groups={GROUPS} />, true);
      expect(band()).toBe(`rgba(${r},${g},${b},1.00)`);
      cleanup();
      const frost = mockInPageFrost();
      try {
        ui(<Table testID="table" columns={["Prop", "Key"]} groups={GROUPS} />, true);
        expect(band()).not.toBe(`rgba(${r},${g},${b},1.00)`);
      } finally { frost.mockRestore(); }
    });

    it("sorts rows within their group and never moves a group", () => {
      ui(<Table testID="table" sortable columns={["Prop", "Key"]} groups={GROUPS} />);
      fireEvent.click(screen.getByRole("columnheader", { name: /Key/ }));
      expect(order()).toEqual(["band:Intent", "ghost", "primary", "destructive", "band:State", "disabled", "loading"]);
    });

    it("reports row indices counted through the groups in order", () => {
      const pressed: number[] = [];
      ui(<Table testID="table" columns={["Prop", "Key"]} groups={GROUPS} onRowPress={(_row, i) => pressed.push(i)} />);
      fireEvent.click(screen.getByRole("button", { name: /loading/ }));
      expect(pressed).toEqual([3]);
    });

    it("draws the band of every group a page shows", () => {
      ui(<Table testID="table" paginated pageSize={2} columns={["Prop", "Key"]} groups={GROUPS} />);
      expect(order()).toEqual(["band:Intent", "primary", "destructive"]);
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
      expect(order()).toEqual(["band:Intent", "ghost", "band:State", "loading"]);
    });
  });
}

describe("DataTable column weights", () => {
  const COLUMNS = [
    { label: "Prop", minWidth: 150 },
    { label: "Type", grow: 1.2, minWidth: 150 },
    { label: "Default", width: 100 },
    { label: "Description", grow: 2.2, minWidth: 220 },
  ];
  const header = (label: string) => screen.getByText(label).closest('[role="columnheader"]') as HTMLElement;
  const cell = (text: string) => screen.getByText(text).closest('[role="cell"]') as HTMLElement;

  it("weights a column's share with `grow` and floors it with `minWidth`, beside a fixed width", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={[["primary", "boolean", "false", "The main action."]]} />);
    expect(header("Type").style.flexGrow).toBe("1.2");
    expect(header("Type").style.minWidth).toBe("150px");
    expect(header("Prop").style.flexGrow).toBe("1");
    expect(header("Default").style.width).toBe("100px");
    expect(header("Default").style.flexGrow).toBe("0");
    // The data cells take the same box as their header.
    expect(cell("The main action.").style.flexGrow).toBe("2.2");
    expect(cell("The main action.").style.minWidth).toBe("220px");
  });

  // The pan floor is on the scroller's content container (the table's parent).
  const panFloor = () => (screen.getByRole("table").parentElement as HTMLElement).style.minWidth;

  it("pans at any width once the declared floors exceed it", () => {
    // The hand-off's tracks with their 32 px of cell padding: 182 + 182 + 100 + 256 = 720.
    const floors = [
      { label: "Prop", minWidth: 182 },
      { label: "Type", grow: 1.2, minWidth: 182 },
      { label: "Default", width: 100 },
      { label: "Description", grow: 2.2, minWidth: 256 },
    ];
    ui(<DataTable testID="table" columns={floors} rows={[["primary", "boolean", "false", "The main action."]]} />);
    measure(1280);
    expect(panFloor()).toBe("");
    measure(720);
    expect(panFloor()).toBe("");
    measure(700);
    expect(panFloor()).toBe("720px");
  });

  it("keeps the sm-only pan for a table that declares no floor", () => {
    ui(<DataTable testID="table" columns={["A", "B", "C", "D", "E", "F", "G"]} rows={[["1", "2", "3", "4", "5", "6", "7"]]} />);
    measure(700);
    expect(panFloor()).toBe("");
    measure(500);
    expect(panFloor()).toBe("770px");
  });

  it("stacks over the weights under `stacks`", () => {
    ui(<DataTable testID="table" stacks columns={COLUMNS} rows={[["primary", "boolean", "false", "The main action."]]} />);
    measure(400);
    expect(cell("The main action.").style.minWidth).toBe("");
    expect(cell("The main action.").style.flexGrow).toBe("0");
  });
});
