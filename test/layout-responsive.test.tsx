// The responsive layout primitives: Row `stacks` (container-measured with a
// viewport seed; happy-dom never fires onLayout, so these exercise the seed
// path) and Grid's auto-fit column math (pure functions plus the rendered
// cell assignment).
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { Grid, GridItem, gridColumns, gridCellWidth } from "../src/atoms/grid/grid.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const rootOf = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

describe("Row stacks", () => {
  it("stays a row at desktop widths and keeps wrap", () => {
    ui(
      <Row stacks wrap testID="r">
        <Badge>a</Badge>
        <Badge>b</Badge>
      </Row>,
    );
    expect(rootOf("r").style.flexDirection).toBe("row");
    expect(rootOf("r").style.flexWrap).toBe("wrap");
  });

  it("renders as a column at phone widths, with wrap inert", () => {
    resizeViewport(375);
    ui(
      <Row stacks wrap testID="r">
        <Badge>a</Badge>
        <Badge>b</Badge>
      </Row>,
    );
    expect(rootOf("r").style.flexDirection).toBe("column");
    expect(rootOf("r").style.flexWrap).not.toBe("wrap");
  });

  it("honors stackBreakpoint", () => {
    resizeViewport(900); // at/below lg (1024), above sm (640)
    ui(
      <Row stacks stackBreakpoint="lg" testID="lg-row">
        <Badge>a</Badge>
      </Row>,
    );
    expect(rootOf("lg-row").style.flexDirection).toBe("column");
  });

  it("is ignored on Column (still a column, no crash)", () => {
    ui(
      <Column stacks testID="c">
        <Badge>a</Badge>
      </Column>,
    );
    expect(rootOf("c").style.flexDirection).toBe("column");
  });
});

describe("gridColumns / gridCellWidth (pure)", () => {
  it("fits as many tiles of minTileWidth as the width allows", () => {
    expect(gridColumns(1280, 240, 8, undefined)).toBe(5); // floor(1288/248)
    expect(gridColumns(1280, 240, 8, 3)).toBe(3); // capped
    expect(gridColumns(500, 240, 8, 3)).toBe(2);
    expect(gridColumns(375, 240, 8, 3)).toBe(1);
    expect(gridColumns(100, 240, 8, undefined)).toBe(1); // never below 1
  });

  it("resolves an unmeasured width to the cap (desktop-first), else one column", () => {
    expect(gridColumns(0, 240, 8, 3)).toBe(3);
    expect(gridColumns(0, 240, 8, undefined)).toBe(1);
  });

  it("splits the width minus gaps into equal cells", () => {
    expect(gridCellWidth(1280, 3, 8)).toBe(421); // floor((1280-16)/3)
    expect(gridCellWidth(375, 1, 8)).toBe(375);
  });
});

describe("Grid rendering", () => {
  // Real children, not one wrapping Fragment: Children.toArray counts a
  // Fragment as a single child, exactly as it would at a consumer call site.
  const tiles = [<Badge key="1">one</Badge>, <Badge key="2">two</Badge>, <Badge key="3">three</Badge>];

  it("assigns equal cell widths from the (seeded) container width", () => {
    ui(
      <Grid minTileWidth={240} columns={3} testID="g">
        {tiles}
      </Grid>,
    );
    const cells = Array.from(rootOf("g").children) as HTMLElement[];
    expect(cells.length).toBe(3);
    for (const cell of cells) expect(cell.style.width).toBe("421px"); // floor((1280-16)/3)
  });

  it("collapses to one full-width column at phone widths", () => {
    resizeViewport(375);
    ui(
      <Grid minTileWidth={240} columns={3} testID="g">
        {tiles}
      </Grid>,
    );
    const cells = Array.from(rootOf("g").children) as HTMLElement[];
    for (const cell of cells) expect(cell.style.width).toBe("375px");
  });

  it("GridItem wide spans two cells (only in a multi-column grid)", () => {
    ui(
      <Grid minTileWidth={240} columns={3} testID="g">
        <GridItem wide>
          <Badge>hero</Badge>
        </GridItem>
        {tiles}
      </Grid>,
    );
    const cells = Array.from(rootOf("g").children) as HTMLElement[];
    expect(cells[0]!.style.width).toBe("850px"); // 2*421 + 8
    expect(cells[1]!.style.width).toBe("421px");
  });
});
