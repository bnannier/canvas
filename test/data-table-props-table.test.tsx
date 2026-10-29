import { type ReactNode } from "react";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, within } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { lightColors } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { DataTable as AndroidDataTable } from "../src/organisms/data-table/data-table.android.tsx";
import { DataTable as IosDataTable } from "../src/organisms/data-table/data-table.ios.tsx";
import { Button } from "../src/atoms/button/button.tsx";

// The three looks the v4 props table adds to DataTable (Component.dc.html lines 233-241):
// `eyebrowHeader`, the column headings as the page's small uppercase mono label on an
// unfilled header row; `alignTop`, every cell at the top of its row; and `footer`, a 44 px
// row inside the frame under the last row with its content centered.

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
const dataRow = (text: string) => screen.getByText(text).closest('[role="row"]') as HTMLElement;
const bg = (el: HTMLElement) => el.style.backgroundColor.replace(/\s/g, "");

describe("DataTable eyebrowHeader", () => {
  it("keeps the band's sentence-case label on the popover fill by default", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} />);
    expect(headerLabel().style.fontSize).toBe("12px");
    expect(headerLabel().style.textTransform).toBe("");
    expect(bg(headerRow())).toBe(rgb(lightColors.popover));
  });

  it("sets the headings as the 11 px uppercase letter-spaced mono label in the subtle ink, on a row with no fill", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} eyebrowHeader />);
    const label = headerLabel();
    expect(label.style.fontFamily).toContain(MONO_FONT.split(",")[0]!.trim());
    expect(label.style.fontSize).toBe("11px");
    expect(label.style.lineHeight).toBe("11px");
    expect(label.style.fontWeight).toBe("500");
    expect(label.style.letterSpacing).toBe("0.88px");
    expect(label.style.textTransform).toBe("uppercase");
    expect(label.style.color.replace(/\s/g, "")).toBe(rgb(lightColors["subtle-foreground"]!));
    expect(bg(headerRow())).toBe("");
    // One rule between the header and the first row: the header's own, as the band's.
    expect(headerRow().style.borderBottomWidth).toBe("1px");
  });

  it("pads the header 12 px above and below whatever the density", () => {
    ui(<DataTable testID="table" columns={COLUMNS} rows={ROWS} eyebrowHeader compact />);
    expect(headerRow().style.paddingTop).toBe("12px");
    expect(headerRow().style.paddingBottom).toBe("12px");
  });

  it("draws the same header on Android, the web table in Roboto", () => {
    ui(<AndroidDataTable testID="table" columns={COLUMNS} rows={ROWS} eyebrowHeader />);
    expect(headerLabel().style.textTransform).toBe("uppercase");
    expect(headerLabel().style.fontSize).toBe("11px");
  });

  it("changes nothing on iOS, whose table keeps its own column headings", () => {
    ui(<IosDataTable testID="table" columns={COLUMNS} rows={ROWS} eyebrowHeader />);
    expect(headerLabel().style.textTransform).toBe("");
    expect(headerLabel().style.fontSize).toBe("13px");
    expect(headerRow().style.paddingTop).toBe("8px");
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
