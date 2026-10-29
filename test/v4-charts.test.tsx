import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsFor, type Palette } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import { CHART_LOOK, axisLabel, title, titleDefault, titleCompact } from "../src/charts/shared/charts.styles.ts";
import { tileLook } from "../src/charts/treemap/treemap.shared.tsx";
import { gaugeArc } from "../src/charts/gauge/gauge.shared.tsx";
import { ringDash } from "../src/charts/progress-ring/progress-ring.shared.tsx";
import { FunnelChart } from "../src/charts/funnel-chart/funnel-chart.tsx";
import { ServiceHealthList } from "../src/charts/service-health-list/service-health-list.tsx";
import { BarList } from "../src/charts/bar-list/bar-list.tsx";
import { StackedBar } from "../src/charts/stacked-bar/stacked-bar.tsx";

// The v4 hand-off's chart renderers (tools/v4/handoff/cv-kit-charts.js), pinned: the
// frame (`fr`), the axes (`axes`), the legend (`leg`), the mark corners, and the numbers
// of the charts whose anatomy the hand-off redrew (funnel rows, the service row's
// inline strip, the bar list's wash). Geometry the harness cannot see (the svg stub)
// is pinned through the exported pure helpers.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const styles = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>("[style]")].map((el) => el.getAttribute("style") ?? "");

describe("v4 chart frame, axes and legend", () => {
  it("CHART_LOOK carries the hand-off's frame, axis, stroke and legend numbers", () => {
    expect(CHART_LOOK.pad).toEqual({ default: 16, compact: 12 });
    expect(CHART_LOOK.gap).toEqual({ default: 12, compact: 8 });
    expect([CHART_LOOK.titleSize, CHART_LOOK.titleLine]).toEqual([14, 20]);
    expect(CHART_LOOK.gridDash).toBe("2,4");
    expect([CHART_LOOK.leadStroke, CHART_LOOK.stroke]).toEqual([2.2, 2]);
    expect([CHART_LOOK.dotRadius, CHART_LOOK.dotStroke]).toEqual([3, 2]);
    expect([CHART_LOOK.areaLead, CHART_LOOK.area, CHART_LOOK.fadeTop]).toEqual([0.28, 0.3, 0.35]);
    expect([CHART_LOOK.swatch, CHART_LOOK.swatchGap, CHART_LOOK.legendRowGap, CHART_LOOK.legendColumnGap]).toEqual([8, 6, 6, 14]);
    expect([CHART_LOOK.legendSize, CHART_LOOK.legendLine]).toEqual([12, 15]);
  });

  it("the title is 500 14 and the axis labels mono in the subtle ink", () => {
    const t = colorsFor("violet", "dark");
    expect(title(t).fontWeight).toBe("500");
    expect([titleDefault.fontSize, titleDefault.marginBottom, titleCompact.marginBottom]).toEqual([14, 12, 8]);
    const a = axisLabel(t);
    expect(a.fontFamily).toBe(MONO_FONT);
    expect(a.color).toBe(t["subtle-foreground"]);
  });

  it("the chart marks read their corners from the web row", () => {
    const w = platformShape.web;
    expect([w.bar, w.mark, w.cell, w.candle]).toEqual([3, 4, 2, 1.5]);
    expect([w.chartTile, w.heatCell, w.sparkTrack, w.funnelBar, w.listBar, w.stripBar]).toEqual([8, 2.5, 6, 6, 8, 1]);
  });
});

describe("v4 chart geometry", () => {
  it("the gauge is the hand-off's radius-80 semicircle in a 200 x 116 view", () => {
    expect(gaugeArc(0).d).toBe("M 20 104 A 80 80 0 0 1 180 104");
    expect(gaugeArc(100).dasharray).toBe(`${Math.PI * 80} ${Math.PI * 80}`);
  });

  it("the progress ring defaults to 168 with a 14 stroke", () => {
    // The hand-off's ring: r 70 in the 168 box (inset by the stroke).
    const r = 70;
    expect(ringDash(100).dasharray).toBe(`${2 * Math.PI * r} ${2 * Math.PI * r}`);
  });

  it("every treemap tile takes the renderer's near-black ink over its 70% mix", () => {
    // The owner's 2026-10-28 pixel-exact rule: the renderer prints #0a0a0f on every tile.
    // The tiles where that falls under 4.5:1 are an accessibility note in treemap.shared.tsx.
    const palettes: Palette[] = ["violet", "cyan", "mint", "rose", "amber"];
    for (const p of palettes) {
      for (const scheme of ["light", "dark"] as const) {
        const t = colorsFor(p, scheme);
        for (let i = 1; i <= 8; i++) {
          const { fill, ink } = tileLook(t.card, t[`chart-${i}` as "chart-1"]);
          expect(ink).toBe("#0a0a0f");
          expect(fill).toMatch(/^#|^rgb/);
        }
      }
    }
  });
});

describe("v4 chart rows", () => {
  it("funnel stages are 26 px bars at the funnel-bar corner, centered at their share of the first", () => {
    const { container } = ui(
      <FunnelChart
        stages={[
          { label: "Visits", value: 1000 },
          { label: "Paid", value: 250 },
        ]}
      />,
    );
    const bars = styles(container).filter((s) => s.includes("height: 26px") && s.includes("border-radius: 6px"));
    expect(bars.length).toBe(2);
    expect(bars.some((s) => s.includes("width: 25%"))).toBe(true);
  });

  it("a service row draws its latest 14 periods as 4 x 16 bars at the strip corner", () => {
    const { container } = ui(
      <ServiceHealthList items={[{ label: "API", detail: "99.98%", periods: Array.from({ length: 30 }, () => ({})) }]} />,
    );
    const bars = styles(container).filter((s) => s.includes("width: 4px") && s.includes("height: 16px"));
    expect(bars.length).toBe(14);
    expect(bars.every((s) => s.includes("border-radius: 1px"))).toBe(true);
  });

  it("a bar list row is 32 px with its share washed at the list-bar corner", () => {
    const { container } = ui(
      <BarList
        items={[
          { label: "/pricing", value: 200 },
          { label: "/docs", value: 100 },
        ]}
      />,
    );
    const all = styles(container);
    expect(all.filter((s) => s.includes("height: 32px")).length).toBeGreaterThanOrEqual(2);
    expect(all.filter((s) => s.includes("border-radius: 8px") && s.includes("width: 50%")).length).toBe(1);
  });

  it("the stacked bar's default strip is an 8 px pill with 2 px between segments", () => {
    const { container } = ui(
      <StackedBar
        segments={[
          { label: "A", value: 1 },
          { label: "B", value: 1 },
        ]}
      />,
    );
    const all = styles(container);
    expect(all.some((s) => s.includes("height: 8px") && s.includes("border-radius: 9999px"))).toBe(true);
    expect(all.some((s) => s.includes("gap: 2px"))).toBe(true);
  });
});
