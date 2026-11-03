import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../src/style/anatomy.tsx";
import { Sparkline } from "../src/charts/sparkline/sparkline.tsx";
import { PieChart } from "../src/charts/pie-chart/pie-chart.tsx";
import { Treemap } from "../src/charts/treemap/treemap.tsx";
import { StackedBar } from "../src/charts/stacked-bar/stacked-bar.tsx";
import { FunnelChart } from "../src/charts/funnel-chart/funnel-chart.tsx";
import { Gauge } from "../src/charts/gauge/gauge.tsx";
import { ProgressRing } from "../src/charts/progress-ring/progress-ring.tsx";
import { RadialBarChart } from "../src/charts/radial-bar-chart/radial-bar-chart.tsx";
import { BulletChart } from "../src/charts/bullet-chart/bullet-chart.tsx";
import { RadarChart } from "../src/charts/radar-chart/radar-chart.tsx";
import { MetricBreakdown } from "../src/charts/metric-breakdown/metric-breakdown.tsx";
import { BarList } from "../src/charts/bar-list/bar-list.tsx";
import { Heatmap } from "../src/charts/heatmap/heatmap.tsx";
import { UptimeBar } from "../src/charts/uptime-bar/uptime-bar.tsx";
import { ServiceHealthList } from "../src/charts/service-health-list/service-health-list.tsx";
import { GeoMap } from "../src/charts/geo-map/geo-map.tsx";

// The parts each chart in this batch registers with an AnatomyProvider (src/style/anatomy.tsx),
// rendered with props that draw every part the component can. The charts that size
// themselves from their own width draw nothing until measured, so every layout handler
// fires with a real box, as often as new nodes mount.

afterEach(cleanup);

async function parts(specimen: ReactElement): Promise<string[]> {
  const reports: AnatomyRects[] = [];
  render(
    <ThemeProvider dark solid>
      <AnatomyProvider onMeasure={(measured) => reports.push(measured)}>{specimen}</AnatomyProvider>
    </ThemeProvider>,
  );
  for (let pass = 0; pass < 3; pass++) {
    for (const node of [document.body, ...document.body.querySelectorAll("*")]) {
      const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
      if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 150 } }, timeStamp: 1 }));
    }
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
  }
  return Object.keys(reports.at(-1) ?? {}).sort();
}

const sorted = (names: string[]) => [...names].sort();
const SEGMENTS = [
  { label: "iOS", value: 46 },
  { label: "Android", value: 31 },
  { label: "Web", value: 18 },
  { label: "Other", value: 5 },
];
const TREE = [
  { label: "Charts", value: 27 },
  { label: "Inputs", value: 18 },
  { label: "Layout", value: 12 },
];
const PERIODS = [{}, { degraded: true }, {}, {}];

describe("chart anatomy parts", () => {
  it("Sparkline: the line variant draws its line, wash and end marker", async () => {
    expect(await parts(<Sparkline line values={[4, 8, 6, 12, 10, 16, 14]} />)).toEqual(sorted(["Line", "Fill", "End marker"]));
  });

  it("Sparkline: the bar strip is the line and its latest bar the end marker", async () => {
    expect(await parts(<Sparkline values={[4, 8, 6, 12, 10]} />)).toEqual(sorted(["Line", "End marker"]));
  });

  it("PieChart", async () => {
    expect(await parts(<PieChart donut label="Installs" slices={SEGMENTS} />)).toEqual(sorted(["Chart frame", "Slice", "Center value", "Legend"]));
  });

  it("Treemap", async () => {
    expect(await parts(<Treemap data={TREE} />)).toEqual(sorted(["Chart frame", "Tile", "Label", "Value"]));
  });

  it("StackedBar: everything but the total readout it does not draw", async () => {
    expect(await parts(<StackedBar label="Installs" segments={SEGMENTS} />)).toEqual(sorted(["Strip", "Segment", "Legend"]));
  });

  it("FunnelChart", async () => {
    const stages = [{ label: "Visited docs", value: 12400 }, { label: "Installed", value: 6200 }, { label: "Shipped", value: 1900 }];
    expect(await parts(<FunnelChart stages={stages} />)).toEqual(sorted(["Chart frame", "Stage bar", "Stage label", "Value"]));
  });

  it("Gauge", async () => {
    expect(await parts(<Gauge value={72} label="of Q4 adoption goal" />)).toEqual(sorted(["Track", "Fill arc", "Value", "Scale labels"]));
  });

  it("ProgressRing", async () => {
    expect(await parts(<ProgressRing value={64} label="Synced" />)).toEqual(sorted(["Track", "Value arc", "Value", "Label"]));
  });

  it("ProgressRing: a complete ring's check is its value", async () => {
    expect(await parts(<ProgressRing value={100} label="Synced" />)).toContain("Value");
  });

  it("RadialBarChart", async () => {
    expect(await parts(<RadialBarChart data={SEGMENTS.slice(0, 3)} />)).toEqual(sorted(["Chart frame", "Bar", "Track", "Legend"]));
  });

  it("BulletChart", async () => {
    const data = [{ label: "Coverage", value: 72, target: 80, ranges: [50, 80, 100] }, { label: "Docs", value: 61, target: 75, ranges: [50, 80, 100] }];
    expect(await parts(<BulletChart data={data} />)).toEqual(sorted(["Frame", "Measure", "Target marker", "Ranges"]));
  });

  it("RadarChart", async () => {
    const series = [{ label: "Canvas", values: [90, 80, 70, 60, 85, 75] }, { label: "Other", values: [60, 70, 80, 70, 50, 65] }];
    expect(await parts(<RadarChart axes={["Speed", "A11y", "Size", "Docs", "Tests", "DX"]} series={series} />)).toEqual(sorted(["Chart frame", "Series", "Axis labels", "Legend", "Grid"]));
  });

  it("BarList: the share meter look registers its bar, value and label too", async () => {
    expect(await parts(<BarList share items={[{ label: "Button", value: 1840 }, { label: "Input", value: 1210 }]} />)).toEqual(sorted(["Frame", "Bar", "Value", "Label"]));
  });

  it("MetricBreakdown: a nested Sparkline and Chip register nothing of their own", async () => {
    const rows = [{ label: "Web", value: 61 }, { label: "iOS", value: 24 }];
    const names = await parts(
      <MetricBreakdown value="48.2k" label="Installs" rate="+12.4%" rateLabel="vs. Sep" spark={[3, 5, 4, 8, 9]} breakdown={rows} chips={[{ label: "E401", count: 3 }]} />,
    );
    expect(names).toEqual(sorted(["Frame", "Value", "Rate", "Breakdown rows"]));
  });

  it("BarList", async () => {
    expect(await parts(<BarList items={[{ label: "Button", value: 1840 }, { label: "Input", value: 1210 }]} />)).toEqual(sorted(["Frame", "Bar", "Value", "Label"]));
  });

  it("Heatmap: the calendar draws a title, grid, cell and legend", async () => {
    const values = Array.from({ length: 28 }, (_, i) => ({ value: (i % 5) / 4, count: i % 5, date: `2026-0${1 + Math.floor(i / 14)}-${String((i % 14) + 1).padStart(2, "0")}` }));
    expect(await parts(<Heatmap calendar caption="Commits, last 6 months" values={values} />)).toEqual(sorted(["Grid", "Cell", "Title", "Legend"]));
  });

  it("Heatmap: the wrapping grid has no title", async () => {
    expect(await parts(<Heatmap values={[0.1, 0.5, 0.9, 0.3]} />)).toEqual(sorted(["Grid", "Cell", "Legend"]));
  });

  it("UptimeBar: the plain strip's pills register through the shared StatusStrip", async () => {
    expect(await parts(<UptimeBar periods={PERIODS} label="API" startLabel="45 days ago" endLabel="Today" />)).toEqual(sorted(["Strip", "Degraded period", "Healthy period", "Range labels"]));
  });

  it("UptimeBar: the docs example's props draw all four parts", async () => {
    const periods = Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : i === 78 ? { degraded: true } : {}));
    expect(await parts(<UptimeBar label="API uptime" caption="99.98% uptime" startLabel="90 days ago" endLabel="Today" periods={periods} />)).toEqual(sorted(["Strip", "Degraded period", "Healthy period", "Range labels"]));
  });

  it("UptimeBar: the detailed marks draw the degraded and healthy periods", async () => {
    expect(await parts(<UptimeBar detailed periods={PERIODS} label="API" startLabel="45 days ago" endLabel="Today" />)).toEqual(sorted(["Strip", "Degraded period", "Healthy period", "Range labels"]));
  });

  it("ServiceHealthList", async () => {
    const items = [{ label: "API", detail: "99.98%", periods: PERIODS }, { label: "Auth", detail: "99.9%", degraded: true }];
    expect(await parts(<ServiceHealthList items={items} />)).toEqual(sorted(["List", "Status dot", "Service", "Uptime"]));
  });

  it("GeoMap", async () => {
    const points = [{ label: "Berlin", lat: 52.5, lng: 13.4, count: 40 }, { label: "Tokyo", lat: 35.7, lng: 139.7, count: 25 }];
    expect(await parts(<GeoMap zoomable points={points} />)).toEqual(sorted(["Map", "Point", "Region outline", "Zoom control"]));
  });
});
