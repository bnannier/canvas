import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { StackedList } from "../src/molecules/stacked-lists/stacked-lists.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { Feed } from "../src/molecules/feeds/feeds.tsx";
import { GridList } from "../src/molecules/grid-lists/grid-lists.tsx";

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
const canvasWarnings = () => warnSpy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("[canvas]"));

const PEOPLE = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Person ${i}`, detail: `p${i}@x.co` }));

describe("StackedList virtualization", () => {
  it("renders every row eagerly by default (no warning)", () => {
    const { getByText } = ui(<StackedList items={PEOPLE} />);
    expect(getByText("Person 0")).toBeTruthy();
    expect(getByText("Person 4")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("renders through a windowed list when virtualized with a bounded height", () => {
    const { getByText } = ui(<StackedList virtualized items={PEOPLE} style={{ maxHeight: 300 }} />);
    // A short list fits within the initial window, so the rows still render.
    expect(getByText("Person 0")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("warns and falls back to eager rendering when virtualized without a bounded height", () => {
    const { getByText } = ui(<StackedList virtualized items={PEOPLE} />);
    expect(getByText("Person 0")).toBeTruthy();
    expect(canvasWarnings().some((m) => m.includes("bounded height"))).toBe(true);
  });
});

describe("DataTable virtualization", () => {
  const COLUMNS = ["Name", "Email"];
  const ROWS = Array.from({ length: 5 }, (_, i) => [`Name ${i}`, `n${i}@x.co`]);

  it("renders every row eagerly by default and keeps the header", () => {
    const { getByText } = ui(<DataTable columns={COLUMNS} rows={ROWS} />);
    expect(getByText("Name")).toBeTruthy(); // header
    expect(getByText("Name 0")).toBeTruthy();
    expect(getByText("Name 4")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("keeps the header fixed and windows the body when virtualized with a bounded height", () => {
    const { getByText } = ui(<DataTable virtualized columns={COLUMNS} rows={ROWS} style={{ maxHeight: 300 }} />);
    expect(getByText("Name")).toBeTruthy(); // header still present
    expect(getByText("Name 0")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("warns when virtualized without a bounded height", () => {
    ui(<DataTable virtualized columns={COLUMNS} rows={ROWS} />);
    expect(canvasWarnings().some((m) => m.includes("bounded height"))).toBe(true);
  });
});

const EVENTS = Array.from({ length: 5 }, (_, i) => ({ id: i, actor: `Actor ${i}`, action: "did something", time: "1h" }));

describe("Feed virtualization", () => {
  it("renders every event eagerly by default", () => {
    const { getByText } = ui(<Feed items={EVENTS} />);
    expect(getByText("Actor 0")).toBeTruthy();
    expect(getByText("Actor 4")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("windows the events when virtualized with a bounded height", () => {
    const { getByText } = ui(<Feed virtualized items={EVENTS} style={{ maxHeight: 300 }} />);
    expect(getByText("Actor 0")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("warns when virtualized without a bounded height", () => {
    ui(<Feed virtualized items={EVENTS} />);
    expect(canvasWarnings().some((m) => m.includes("bounded height"))).toBe(true);
  });
});

const TILES = Array.from({ length: 6 }, (_, i) => ({ title: `Tile ${i}`, subtitle: `sub ${i}` }));

describe("GridList virtualization", () => {
  it("renders every tile eagerly by default", () => {
    const { getByText } = ui(<GridList items={TILES} />);
    expect(getByText("Tile 0")).toBeTruthy();
    expect(getByText("Tile 5")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("windows the tiles when virtualized with a bounded height", () => {
    const { getByText } = ui(<GridList virtualized items={TILES} style={{ maxHeight: 400 }} />);
    expect(getByText("Tile 0")).toBeTruthy();
    expect(canvasWarnings()).toEqual([]);
  });

  it("warns when virtualized without a bounded height", () => {
    ui(<GridList virtualized items={TILES} />);
    expect(canvasWarnings().some((m) => m.includes("bounded height"))).toBe(true);
  });
});
