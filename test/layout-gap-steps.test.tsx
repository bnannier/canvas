// The gap steps the v4 hand-off's section pages add to Row, Column and Grid: `ample`
// (40, the step between a section page's hero and its body and between the hero's
// halves, `gap:28px 40px` with `margin-bottom:40px`) under `broad` (48, the Library
// hero's grid), and `rowsPanel` (28), the vertical gap of a wrapped or stacked row apart
// from its main gap. A stacked Row is a column, so its children sit the row gap apart.
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { gapOf, rowGapOf } from "../src/atoms/layout/layout.shared.tsx";
import { Grid } from "../src/atoms/grid/grid.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { DEFAULT_VIEWPORT, resizeViewport } from "./viewport.ts";

afterEach(() => {
  cleanup();
  resizeViewport(DEFAULT_VIEWPORT.width);
});

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const rootOf = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

describe("Layout ample and rowsPanel", () => {
  it("ample is 40 on Row, Column and Grid, between apart and broad", () => {
    expect(gapOf({ ample: true })).toBe("ample");
    expect(gapOf({ ample: true, apart: true, page: true })).toBe("ample");
    expect(gapOf({ broad: true, ample: true })).toBe("broad");
    expect(gapOf({ chapter: true, ample: true })).toBe("chapter");
    ui(
      <>
        <Row ample testID="row"><Badge>a</Badge><Badge>b</Badge></Row>
        <Column ample testID="column"><Badge>a</Badge><Badge>b</Badge></Column>
        <Grid ample testID="grid"><Badge>a</Badge><Badge>b</Badge></Grid>
        <Row apart testID="apart"><Badge>a</Badge></Row>
        <Row broad testID="broad"><Badge>a</Badge></Row>
      </>,
    );
    expect(rootOf("row").style.gap).toBe("40px");
    expect(rootOf("column").style.gap).toBe("40px");
    expect(rootOf("grid").style.gap).toBe("40px");
    expect(rootOf("apart").style.gap).toBe("32px");
    expect(rootOf("broad").style.gap).toBe("48px");
  });

  it("rowsPanel sets a 28 row gap apart from the main gap, the widest row-gap step", () => {
    expect(rowGapOf({ rowsPanel: true })).toBe(28);
    expect(rowGapOf({ rowsPanel: true, rowsSection: true, rowsTight: true })).toBe(28);
    expect(rowGapOf({})).toBeNull();
    ui(
      <Row wrap ample rowsPanel testID="r">
        <Badge>a</Badge>
        <Badge>b</Badge>
      </Row>,
    );
    expect(rootOf("r").style.gap).toBe("40px");
    expect(rootOf("r").style.rowGap).toBe("28px");
  });

  it("a stacked Row lays its children down the row gap: 40 apart beside each other, 28 stacked", () => {
    resizeViewport(700); // at or below md (768), the section hero's stack point
    ui(
      <Row stacks stackBreakpoint="md" ample rowsPanel testID="hero">
        <Column span={6}><Badge>text</Badge></Column>
        <Column span={6}><Badge>vignette</Badge></Column>
      </Row>,
    );
    expect(rootOf("hero").style.flexDirection).toBe("column");
    expect(rootOf("hero").style.gap).toBe("40px");
    expect(rootOf("hero").style.rowGap).toBe("28px");
  });
});
