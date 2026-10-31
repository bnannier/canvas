import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { PieChart } from "../src/charts/pie-chart/pie-chart.tsx";
import { RadialBarChart } from "../src/charts/radial-bar-chart/radial-bar-chart.tsx";
import { FunnelChart } from "../src/charts/funnel-chart/funnel-chart.tsx";
import { ProgressRing } from "../src/charts/progress-ring/progress-ring.tsx";
import { StackedBar } from "../src/charts/stacked-bar/stacked-bar.tsx";
import { partitionTiles } from "../src/charts/treemap/treemap.shared.tsx";
import { funnelTrapezoid } from "../src/charts/funnel-chart/funnel-chart.shared.tsx";

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const data = [{ label: "Phone", value: 64 }, { label: "Web", value: 16 }];

describe("v4 composition examples", () => {
  it("ordered partitions preserve every datum's area and fill the plot", () => {
    const values = [42, 28, 18, 7, 3, 2];
    const tiles = partitionTiles(values, 400, 180);
    expect(tiles[0]).toEqual({ x: 0, y: 0, w: 168, h: 180 });
    expect(tiles[1].x).toBe(168);
    expect(tiles[1].h).toBeCloseTo(180 * 28 / 58);
    tiles.forEach((tile, i) => expect(tile.w * tile.h / (400 * 180)).toBeCloseTo(values[i] / 100));
    expect(tiles.reduce((sum, tile) => sum + tile.w * tile.h, 0)).toBeCloseTo(400 * 180);
  });

  it("funnel stage geometry centers both ends and narrows to the next stage", () => {
    expect(funnelTrapezoid(200, 36, 1, .6)).toBe("M 0 0 L 200 0 L 160 36 L 40 36 Z");
    expect(funnelTrapezoid(200, 36, .6, .3)).toBe("M 40 0 L 160 0 L 130 36 L 70 36 Z");
    expect(funnelTrapezoid(200, 36, .5, 2)).toBe("M 50 0 L 150 0 L 150 36 L 50 36 Z");
  });

  it("detailed pie legends expose names and exact shares separately", () => {
    const { container } = ui(<PieChart detailed donut label="Sessions" slices={data} />);
    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getByText("20%")).toBeTruthy();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Sessions: Phone 80%, Web 20%");
  });

  it("composition inspection works from the keyboard and can clear selection", () => {
    const selections: Array<number | null> = [];
    const { container } = ui(<PieChart detailed donut slices={data} onSelect={(i) => selections.push(i)} />);
    const plot = container.querySelector('[role="img"]')!;
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "End" });
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(selections).toEqual([0, 1, null]);
  });

  it("detailed radial legends share a formatted max while naming attainment", () => {
    const { container } = ui(<RadialBarChart detailed data={data} max={80} formatValue={(v) => `${v}k`} />);
    expect(screen.getByText("max 80k")).toBeTruthy();
    expect(screen.getByText("64k")).toBeTruthy();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Radial bar chart: Phone 80%, Web 20%");
  });

  it("tapered funnels show counts and conversion from the preceding stage", () => {
    const { container } = ui(<FunnelChart tapered stages={[{ label: "Visited", value: 12400 }, { label: "Signed up", value: 7900 }, { label: "Paid", value: 2610 }]} />);
    expect(screen.getByText("12,400")).toBeTruthy();
    expect(screen.getByText("63.7%")).toBeTruthy();
    expect(screen.getByText("33.0%")).toBeTruthy();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("Paid 2,610 (33% of Signed up)");
  });

  it("compact stacked rings retain their readable values and completion names", () => {
    const { container } = ui(<ProgressRing compact stacked value={64} label="Tokens" />);
    expect(screen.getByText("64%")).toBeTruthy();
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Tokens: 64%");
    expect([...container.querySelectorAll<HTMLElement>('[style]')].some((el) => el.style.width === "78px" && el.style.height === "78px")).toBe(true);
  });

  it("detailed capacity legends keep percentages relative to capacity", () => {
    ui(<StackedBar detailed max={100} segments={data} />);
    expect(screen.getByText("64%")).toBeTruthy();
    expect(screen.getByText("16%")).toBeTruthy();
  });
});
