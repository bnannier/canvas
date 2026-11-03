import { describe, it, expect, afterEach } from "bun:test";
import type { ReactElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../src/style/anatomy.tsx";
import { Chart } from "../src/charts/chart/chart.tsx";
import { LineChart } from "../src/charts/line-chart/line-chart.tsx";
import { AreaChart } from "../src/charts/area-chart/area-chart.tsx";
import { RangeAreaChart } from "../src/charts/range-area-chart/range-area-chart.tsx";
import { ComposedChart } from "../src/charts/composed-chart/composed-chart.tsx";
import { ScatterPlot } from "../src/charts/scatter-plot/scatter-plot.tsx";
import { CandlestickChart } from "../src/charts/candlestick-chart/candlestick-chart.tsx";
import { DepthChart } from "../src/charts/depth-chart/depth-chart.tsx";
import { Histogram } from "../src/charts/histogram/histogram.tsx";
import { BoxPlot } from "../src/charts/box-plot/box-plot.tsx";
import { WaterfallChart } from "../src/charts/waterfall-chart/waterfall-chart.tsx";

// The anatomy parts the cartesian charts register with an AnatomyProvider: the docs demos
// (each chart's first example) report every part their hand-off `an` list names that the
// chart draws, through the shared frame and legend (src/charts/shared/chart-anatomy.tsx).

afterEach(cleanup);

// The charts draw nothing until their frame is measured, and the shared anatomyParts
// fixture reports a zero width: report a chart-sized width to every host layout handler
// (twice, so the plot that mounts on the first measure is measured too), as a browser
// laying the specimen out would.
function fireLayouts(root: Element) {
  for (const node of [root, ...root.querySelectorAll("*")]) {
    const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
    if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 200 } }, timeStamp: 1 }));
  }
}

async function chartParts(specimen: ReactElement): Promise<string[]> {
  const reports: AnatomyRects[] = [];
  render(
    <ThemeProvider dark solid>
      <AnatomyProvider onMeasure={(parts) => reports.push(parts)}>{specimen}</AnatomyProvider>
    </ThemeProvider>,
  );
  fireLayouts(document.body);
  fireLayouts(document.body);
  await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
  return Object.keys(reports.at(-1) ?? {}).sort();
}

const CARTESIAN = ["Axis labels", "Chart frame", "Gridlines", "Legend", "Series"];
const labels = ["Jan", "Feb", "Mar", "Apr"];
const twoSeries = [
  { label: "Web", values: [119, 122, 131, 147] },
  { label: "Mobile", values: [63, 93, 101, 121] },
];

describe("cartesian chart anatomy parts", () => {
  it("Chart (grouped, so its legend is drawn)", async () => {
    expect(await chartParts(<Chart title="Signups" labels={labels} series={twoSeries} />)).toEqual(CARTESIAN);
  });

  it("Chart's single-series demo draws no legend", async () => {
    const data = [{ label: "Mon", value: 45 }, { label: "Tue", value: 60 }];
    expect(await chartParts(<Chart title="Signups" data={data} max={100} />)).toEqual(["Axis labels", "Chart frame", "Gridlines", "Series"]);
  });

  it("Chart horizontal", async () => {
    const data = [{ label: "Mon", value: 45 }, { label: "Tue", value: 60 }];
    expect(await chartParts(<Chart horizontal data={data} />)).toEqual(["Axis labels", "Chart frame", "Series"]);
  });

  it("LineChart", async () => {
    expect(await chartParts(<LineChart title="Active users" labels={labels} series={twoSeries} />)).toEqual(CARTESIAN);
  });

  it("AreaChart", async () => {
    expect(await chartParts(<AreaChart labels={labels} series={twoSeries} />)).toEqual(CARTESIAN);
  });

  it("RangeAreaChart (draws no legend)", async () => {
    const data = labels.map((_, i) => ({ low: 40 + i, high: 110 + i, mid: 60 + i }));
    expect(await chartParts(<RangeAreaChart label="p50 to p99" labels={labels} data={data} />)).toEqual(["Axis labels", "Chart frame", "Gridlines", "Series"]);
  });

  it("ComposedChart", async () => {
    const series = [twoSeries[0], { ...twoSeries[1], line: true }];
    expect(await chartParts(<ComposedChart title="Revenue and margin" labels={labels} series={series} />)).toEqual(CARTESIAN);
  });

  it("ScatterPlot", async () => {
    const series = [
      { label: "us-east", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }] },
      { label: "eu-west", points: [{ x: 114, y: 33 }, { x: 227, y: 52 }] },
    ];
    expect(await chartParts(<ScatterPlot title="Load vs latency" series={series} />)).toEqual(CARTESIAN);
  });

  it("CandlestickChart", async () => {
    const candles = [
      { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
      { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
      { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    ];
    expect(await chartParts(<CandlestickChart title="OLY" labels={["D1", "D2", "D3"]} candles={candles} volume={[31, 27, 35]} />)).toEqual(CARTESIAN);
  });

  it("DepthChart", async () => {
    const bids = [{ price: 191.3, size: 80 }, { price: 191.15, size: 120 }];
    const asks = [{ price: 191.6, size: 90 }, { price: 191.75, size: 122 }];
    expect(await chartParts(<DepthChart title="OLY order book" bids={bids} asks={asks} />)).toEqual(["Asks", "Bids", "Chart frame", "Gridlines", "Legend"]);
  });

  it("Histogram", async () => {
    const values = [42, 38, 51, 44, 47, 39, 58, 62, 44, 41, 49, 53, 46, 43, 71, 48];
    expect(await chartParts(<Histogram title="Response times" label="Latency ms" values={values} />)).toEqual(["Axis labels", "Baseline", "Bins", "Chart frame", "Gridlines"]);
  });

  it("BoxPlot", async () => {
    const data = [
      { label: "us-east", values: [42, 38, 51, 44, 47, 39, 96] },
      { label: "eu-west", values: [55, 61, 58, 64, 57, 63] },
    ];
    expect(await chartParts(<BoxPlot title="Latency by region" data={data} />)).toEqual(["Axis labels", "Box", "Chart frame", "Gridlines", "Median"]);
  });

  it("WaterfallChart", async () => {
    const steps = [
      { label: "Q2", value: 4200, total: true },
      { label: "New", value: 980 },
      { label: "Churn", value: -540 },
      { label: "Q3", total: true },
    ];
    expect(await chartParts(<WaterfallChart title="Q3 revenue bridge" steps={steps} />)).toEqual(["Axis labels", "Change bar", "Chart frame", "Gridlines", "Total bar"]);
  });

  it("hidden furniture registers nothing, and the inspection flag adds no parts", async () => {
    expect(await chartParts(<LineChart hideGrid hideAxes hideLegend defaultSelected={1} labels={labels} series={twoSeries} />)).toEqual(["Chart frame", "Series"]);
  });
});
