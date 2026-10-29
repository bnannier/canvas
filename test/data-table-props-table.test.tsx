import { type ReactNode } from "react";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { lightColors } from "../src/style/tokens.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { channelsOf } from "../src/style/color.ts";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { DataTable as AndroidDataTable } from "../src/organisms/data-table/data-table.android.tsx";
import { DataTable as IosDataTable } from "../src/organisms/data-table/data-table.ios.tsx";
import { Button } from "../src/atoms/button/button.tsx";

// The three looks the v4 props table adds to DataTable (Component.dc.html lines 233-241):
// `reference`, the reference sheet (the column headings as the page's small uppercase mono
// label on an unfilled header row, rows 10 above and below ruled above, the columns 16
// apart and 16 in, the panel corner on the `border` hairline); `alignTop`, every cell at
// the top of its row; and `footer`, a 44 px row inside the frame under the last row with
// its content centered.

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

const COLUMNS = ["Prop", "Type", "Default"];
const ROWS: ReactNode[][] = [
  ["primary", "boolean", "false"],
  ["small", "boolean", "false"],
];

const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},1.00)`;
};
const headerRow = () => screen.getByText("Prop").closest('[role="row"]') as HTMLElement;
const headerLabel = () => screen.getByText("Prop") as HTMLElement;
const headerCell = () => screen.getByText("Prop").closest('[role="columnheader"]') as HTMLElement;
const dataRow = (text: string) => screen.getByText(text).closest('[role="row"]') as HTMLElement;
const dataCell = (text: string) => screen.getByText(text).closest('[role="cell"]') as HTMLElement;
const bg = (el: HTMLElement) => el.style.backgroundColor.replace(/\s/g, "");

describe("DataTable reference", () => {
  it("keeps the band's sentence-case label on the popover fill, 16 px cell insets and the table frame by default", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} />);
    expect(headerLabel().style.fontSize).toBe("12px");
    expect(headerLabel().style.textTransform).toBe("");
    expect(bg(headerRow())).toBe(rgb(lightColors.popover));
    expect(headerCell().style.paddingLeft).toBe("16px");
    expect(dataCell("primary").style.paddingLeft).toBe("16px");
    expect(dataCell("primary").style.paddingTop).toBe("12px");
    expect(dataRow("primary").style.borderBottomWidth).toBe("1px");
    expect(screen.getByTestId("table").style.borderRadius).toBe(`${platformShape.web.tableFrame}px`);
  });

  it("sets the headings as the 11 px uppercase letter-spaced mono label in the subtle ink, on a row with no fill and no rule", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference />);
    const label = headerLabel();
    expect(label.style.fontFamily).toContain(MONO_FONT.split(",")[0]!.trim());
    expect(label.style.fontSize).toBe("11px");
    expect(label.style.lineHeight).toBe("11px");
    expect(label.style.fontWeight).toBe("500");
    expect(label.style.letterSpacing).toBe("0.88px");
    expect(label.style.textTransform).toBe("uppercase");
    expect(label.style.color.replace(/\s/g, "")).toBe(rgb(lightColors["subtle-foreground"]!));
    expect(bg(headerRow())).toBe("");
    // The rule between the header and the first row is the row's own, above it.
    expect(headerRow().style.borderBottomWidth).toBe("");
    expect(dataRow("primary").style.borderTopWidth).toBe("1px");
    expect(dataRow("primary").style.borderBottomWidth).toBe("");
  });

  it("pads the header 12 px above and below whatever the density, and the rows 10", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference compact />);
    expect(headerRow().style.paddingTop).toBe("12px");
    expect(headerRow().style.paddingBottom).toBe("12px");
    expect(dataCell("primary").style.paddingTop).toBe("10px");
    expect(dataCell("primary").style.paddingBottom).toBe("10px");
  });

  it("spaces the columns with the row's 16 px gap and 16 px side inset, so no cell carries an inset of its own", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference />);
    expect(headerRow().style.paddingLeft).toBe("16px");
    expect(headerRow().style.columnGap).toBe("16px");
    // The header cell zeroes its own inset; a data cell carries none.
    expect(headerCell().getAttribute("style")).toContain("padding-left: 0px");
    expect(dataRow("primary").style.paddingLeft).toBe("16px");
    expect(dataRow("primary").style.columnGap).toBe("16px");
    expect(dataCell("primary").style.paddingLeft).toBe("");
  });

  it("carries the gap on a `stacks` table's cell group while it is side by side", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference stacks />);
    const group = dataCell("primary").parentElement as HTMLElement;
    expect(group).not.toBe(dataRow("primary"));
    expect(group.style.columnGap).toBe("16px");
    expect(group.style.paddingLeft).toBe("");
  });

  it("frames the sheet at the panel corner on the border hairline over the card fill, firmed by bordered and dropped by attached", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference />);
    const table = screen.getByTestId("table");
    expect(table.style.borderRadius).toBe(`${platformShape.web.panel}px`);
    expect(table.style.borderTopWidth).toBe("1px");
    expect(channelsOf(table.style.borderTopColor)).toEqual(channelsOf(lightColors.border));
    expect(bg(table)).toBe(rgb(lightColors.card));
    cleanup();
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference bordered />);
    expect(screen.getByTestId("table").style.borderRadius).toBe(`${platformShape.web.panel}px`);
    expect(channelsOf(screen.getByTestId("table").style.borderTopColor)).toEqual(channelsOf(lightColors["field-border"]!));
    cleanup();
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference attached />);
    expect(screen.getByTestId("table").style.borderTopWidth).toBe("");
    expect(screen.getByTestId("table").style.borderRadius).toBe("");
  });

  it("rules a group band above itself and never beneath", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={[]} groups={[{ label: "Intent", rows: ROWS }]} reference />);
    const band = screen.getByText("Intent").closest('[role="row"]') as HTMLElement;
    expect(band.style.borderTopWidth).toBe("1px");
    expect(band.style.borderBottomWidth).toBe("");
    expect(band.style.paddingTop).toBe("12px");
    expect(band.style.paddingBottom).toBe("8px");
    expect((screen.getByText("Intent") as HTMLElement).style.lineHeight).toBe("16px");
  });

  it("draws the same sheet on Android, the web table in Roboto", () => {
    ui(<AndroidDataTable testID="table" columns={COLUMNS} rows={ROWS} reference />);
    expect(headerLabel().style.textTransform).toBe("uppercase");
    expect(headerLabel().style.fontSize).toBe("11px");
    expect(screen.getByTestId("table").style.borderRadius).toBe(`${platformShape.web.panel}px`);
  });

  it("changes nothing on iOS, whose table keeps its own look", () => {
    ui(<IosDataTable testID="table" columns={COLUMNS} rows={ROWS} reference />);
    expect(headerLabel().style.textTransform).toBe("");
    expect(headerLabel().style.fontSize).toBe("13px");
    expect(headerRow().style.paddingTop).toBe("8px");
    expect(dataCell("primary").style.paddingLeft).toBe("16px");
  });
});

describe("DataTable alignTop", () => {
  it("centers the cells in their row by default", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} />);
    expect(dataRow("primary").style.alignItems).toBe("center");
  });

  it("holds every cell at the top of its row", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} alignTop />);
    expect(dataRow("primary").style.alignItems).toBe("flex-start");
    expect(dataRow("small").style.alignItems).toBe("flex-start");
  });

  it("centers the selection box and the row actions on the first line of cell text", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} alignTop selectable onRowEdit={() => {}} />);
    const row = dataRow("primary");
    const cells = within(row).getAllByRole("cell");
    // The web skin's regular density: 12 px above and below an 18 px line.
    expect(cells[0]!.style.height).toBe("42px");
    expect(cells[cells.length - 1]!.style.height).toBe("42px");
    // The data cells keep their own height.
    expect(cells[1]!.style.height).toBe("");
  });

  it("centers them on the sheet's 10 px rows", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference alignTop selectable />);
    const cells = within(dataRow("primary")).getAllByRole("cell");
    expect(cells[0]!.style.height).toBe("38px");
  });

  it("holds a `stacks` table's cell group at the top while it is side by side (the docs' props table)", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} alignTop stacks />);
    const row = dataRow("primary");
    expect(row.style.alignItems).toBe("flex-start");
    const group = screen.getByText("primary").closest('[role="cell"]')!.parentElement as HTMLElement;
    expect(group).not.toBe(row);
    expect(group.style.alignItems).toBe("flex-start");
  });

  it("holds the row's press area at the top too, beside the row actions", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} alignTop onRowEdit={() => {}} onRowPress={() => {}} />);
    const row = dataRow("primary");
    expect(row.style.alignItems).toBe("flex-start");
    expect((row.firstElementChild as HTMLElement).style.alignItems).toBe("flex-start");
  });
});

describe("DataTable footer", () => {
  const footer = () => screen.getByText("Show all 58 props").closest('[data-testid="footer"]') as HTMLElement;
  // The slot is the 44 px band the footer content sits in (the Button wraps its own node).
  const slot = () => {
    let el = footer().parentElement;
    while (el && el.style.minHeight !== "44px") el = el.parentElement;
    if (!el) throw new Error("No footer slot around the footer");
    return el;
  };

  it("draws the footer inside the table's frame under the last row, 44 px tall and centered, with no rule of its own", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    const table = screen.getByTestId("table");
    expect(table.contains(footer())).toBe(true);
    expect(table.lastElementChild).toBe(slot());
    // After the last row in the table's own order.
    expect(dataRow("small").compareDocumentPosition(slot()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(slot().style.minHeight).toBe("44px");
    expect(slot().style.justifyContent).toBe("center");
    expect(slot().style.alignItems).toBe("center");
    // The last row draws the rule already.
    expect(dataRow("small").style.borderBottomWidth).toBe("1px");
    expect(slot().style.borderTopWidth).toBe("");
  });

  it("draws its own rule on the sheet, whose rows rule above themselves (the hand-off's show-all row)", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} reference footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(dataRow("small").style.borderBottomWidth).toBe("");
    expect(slot().style.borderTopWidth).toBe("1px");
  });

  it("draws its own rule under the pagination bar, which draws none", () => {
    ui(<DataTable testID="table" paginated pageSize={1} columns={COLUMNS} rows={ROWS} footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(slot().style.borderTopWidth).toBe("1px");
    expect(screen.getByTestId("table").lastElementChild).toBe(slot());
  });

  it("draws its own rule under the empty message, and none under the header band's rule", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={[]} emptyMessage="Nothing yet" footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(slot().style.borderTopWidth).toBe("1px");
    cleanup();
    ui(<DataTable testID="table" columns={COLUMNS} rows={[]} footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(slot().style.borderTopWidth).toBe("");
  });

  it("draws the iOS hairline under an iOS header, which carries no rule", () => {
    ui(<IosDataTable testID="table" columns={COLUMNS} rows={[]} footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(slot().style.borderTopWidth).toBe("0.5px");
    cleanup();
    ui(<IosDataTable testID="table" columns={COLUMNS} rows={ROWS} footer={<Button testID="footer" link small>Show all 58 props</Button>} />);
    expect(slot().style.borderTopWidth).toBe("");
  });

  it("renders nothing extra without a footer", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} />);
    const table = screen.getByTestId("table");
    expect((table.lastElementChild as HTMLElement).style.minHeight).toBe("");
  });
});
