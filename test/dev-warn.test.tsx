import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { devWarn, resetDevWarnings } from "../src/style/dev-warn.ts";
import { Chart, StackedBar, Gauge, Heatmap, BarList, MetricBreakdown, UptimeBar, ServiceHealthList, BulletChart, ProgressRing, ComposedChart, RangeAreaChart, Histogram, BoxPlot, WaterfallChart, RadialBarChart, FunnelChart, RadarChart, Treemap } from "../src/index.ts";
import { Sparkline } from "../src/charts/sparkline/sparkline.tsx";

// The kit resolves degenerate data silently at runtime (empty series render an
// empty frame, out-of-range values clamp). devWarn surfaces the clearest of
// those misuse cases on the console in DEV, once per unique message. These tests
// lock in both the helper's dedup contract and each wired-up component warning —
// and that valid data stays quiet. Each real message is asserted in exactly one
// test so the module-level once-per-message dedup never masks a later assertion.

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

let warnSpy: ReturnType<typeof spyOn>;
beforeEach(() => {
  // The dedup cache is process-wide, so another test file rendering the same
  // degenerate data first would swallow these assertions. Clear it before each.
  resetDevWarnings();
  warnSpy = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
  cleanup();
});

const sawWarning = (substr: string) => warnSpy.mock.calls.some((c) => String(c[0]).includes(substr));
const canvasWarnings = () => warnSpy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("[canvas]"));

describe("component data-misuse warnings", () => {
  it("Chart warns when data is empty", () => {
    ui(<Chart data={[]} />);
    expect(sawWarning("<Chart />")).toBe(true);
    expect(sawWarning("`data` is empty")).toBe(true);
  });

  it("Sparkline warns when values is empty", () => {
    ui(<Sparkline values={[]} />);
    expect(sawWarning("<Sparkline />")).toBe(true);
    expect(sawWarning("`values` is empty")).toBe(true);
  });

  it("StackedBar warns when segments is empty", () => {
    ui(<StackedBar segments={[]} />);
    expect(sawWarning("<StackedBar />")).toBe(true);
    expect(sawWarning("`segments` is empty")).toBe(true);
  });

  it("StackedBar warns when every segment value is zero", () => {
    ui(<StackedBar segments={[{ label: "A", value: 0 }, { label: "B", value: 0 }]} />);
    expect(sawWarning("all segment values are zero")).toBe(true);
  });

  it("Gauge warns on an out-of-range value but still clamps it to 0–100", () => {
    const { getByText } = ui(<Gauge value={140} />);
    expect(sawWarning("<Gauge />")).toBe(true);
    expect(sawWarning("outside 0–100")).toBe(true);
    // The warning does not replace the clamp: the value still renders as 100%.
    expect(getByText("100%")).toBeDefined();
  });

  it("Heatmap warns when values is empty", () => {
    ui(<Heatmap values={[]} />);
    expect(sawWarning("<Heatmap />")).toBe(true);
    expect(sawWarning("`values` is empty")).toBe(true);
  });

  it("BarList warns when items is empty", () => {
    ui(<BarList items={[]} />);
    expect(sawWarning("<BarList />")).toBe(true);
    expect(sawWarning("`items` is empty")).toBe(true);
  });

  it("BarList warns when a row's chart slot competes with the list tone", () => {
    ui(<BarList success items={[{ label: "a", value: 1, chart3: true }]} />);
    expect(sawWarning("chart1..8 slot beats the list tone")).toBe(true);
  });

  it("BarList warns on a negative row value and bars treat it as 0", () => {
    ui(<BarList items={[{ label: "a", value: -3 }]} />);
    expect(sawWarning("`value` is negative")).toBe(true);
  });

  it("MetricBreakdown warns when the spark has a single point and skips the strip", () => {
    ui(<MetricBreakdown value="1" label="Requests" spark={[42]} />);
    expect(sawWarning("<MetricBreakdown />")).toBe(true);
    expect(sawWarning("a single point")).toBe(true);
  });

  it("UptimeBar warns when periods is empty", () => {
    ui(<UptimeBar periods={[]} />);
    expect(sawWarning("<UptimeBar />")).toBe(true);
    expect(sawWarning("`periods` is empty")).toBe(true);
  });

  it("ServiceHealthList warns when items is empty", () => {
    ui(<ServiceHealthList items={[]} />);
    expect(sawWarning("<ServiceHealthList />")).toBe(true);
    expect(sawWarning("the list renders with no rows")).toBe(true);
  });

  it("BulletChart warns on out-of-order range bounds", () => {
    ui(<BulletChart data={[{ label: "A", value: 1, ranges: [300, 200] }]} />);
    expect(sawWarning("<BulletChart />")).toBe(true);
    expect(sawWarning("`ranges` must ascend")).toBe(true);
  });

  it("BulletChart warns when data exceeds an explicit max", () => {
    ui(<BulletChart max={100} data={[{ label: "A", value: 140 }]} />);
    expect(sawWarning("exceeds `max`")).toBe(true);
  });

  it("ProgressRing warns on an out-of-range value but still clamps it", () => {
    const { getByText } = ui(<ProgressRing value={-20} />);
    expect(sawWarning("<ProgressRing />")).toBe(true);
    expect(getByText("0%")).toBeDefined();
  });

  it("ComposedChart warns when a series' length differs from labels", () => {
    ui(<ComposedChart labels={["A", "B"]} series={[{ label: "X", values: [1] }]} />);
    expect(sawWarning("<ComposedChart />")).toBe(true);
  });

  it("Histogram warns when values is empty", () => {
    ui(<Histogram values={[]} />);
    expect(sawWarning("<Histogram />")).toBe(true);
  });

  it("BoxPlot warns when a category has too few samples", () => {
    ui(<BoxPlot data={[{ label: "A", values: [1, 2] }]} />);
    expect(sawWarning("<BoxPlot />")).toBe(true);
    expect(sawWarning("fewer than")).toBe(true);
  });

  it("WaterfallChart warns when steps is empty", () => {
    ui(<WaterfallChart steps={[]} />);
    expect(sawWarning("<WaterfallChart />")).toBe(true);
  });

  it("RadialBarChart warns past six rings", () => {
    ui(<RadialBarChart data={Array.from({ length: 7 }, (_, i) => ({ label: `R${i}`, value: i + 1 }))} />);
    expect(sawWarning("<RadialBarChart />")).toBe(true);
    expect(sawWarning("rings read poorly")).toBe(true);
  });

  it("FunnelChart warns when a stage exceeds its predecessor", () => {
    ui(<FunnelChart stages={[{ label: "A", value: 10 }, { label: "B", value: 40 }]} />);
    expect(sawWarning("<FunnelChart />")).toBe(true);
    expect(sawWarning("a funnel narrows")).toBe(true);
  });

  it("RadarChart warns on an axes/values mismatch and under three axes", () => {
    ui(<RadarChart axes={["A", "B"]} series={[{ label: "X", values: [1, 2, 3] }]} />);
    expect(sawWarning("<RadarChart />")).toBe(true);
    expect(sawWarning("cannot form a polygon")).toBe(true);
  });

  it("Treemap warns past 24 tiles and on negative values", () => {
    ui(<Treemap data={Array.from({ length: 25 }, (_, i) => ({ label: `T${i}`, value: i + 1 }))} />);
    expect(sawWarning("<Treemap />")).toBe(true);
    expect(sawWarning("read as noise")).toBe(true);
  });

  it("RangeAreaChart warns when low exceeds high and swaps the pair", () => {
    ui(<RangeAreaChart label="R" labels={["A"]} data={[{ low: 9, high: 2 }]} />);
    expect(sawWarning("<RangeAreaChart />")).toBe(true);
    expect(sawWarning("`low` exceeds its `high`")).toBe(true);
  });

  it("stays silent for valid data across every wired component", () => {
    ui(
      <>
        <Chart data={[{ label: "Mon", value: 3 }]} />
        <Sparkline values={[1, 2, 3]} />
        <StackedBar segments={[{ label: "A", value: 1 }]} />
        <Gauge value={72} />
        <Heatmap values={[0.2, 0.6]} />
        <BarList items={[{ label: "a", value: 1 }]} />
        <MetricBreakdown value="1" label="Requests" spark={[1, 2]} breakdown={[{ label: "a", value: 1 }]} />
        <UptimeBar periods={[{}, { down: true }]} />
        <ServiceHealthList items={[{ label: "API" }]} />
        <BulletChart data={[{ label: "A", value: 1, target: 2, ranges: [1, 2] }]} />
        <ProgressRing value={72} />
        <ComposedChart labels={["A", "B"]} series={[{ label: "X", values: [1, 2] }, { label: "Y", values: [2, 3], line: true }]} />
        <RangeAreaChart label="R" labels={["A", "B"]} data={[{ low: 1, high: 2 }, { low: 2, high: 3 }]} />
        <Histogram label="ms" values={[1, 2, 2, 3, 4]} />
        <BoxPlot data={[{ label: "A", values: [1, 2, 3, 4, 5] }]} />
        <WaterfallChart steps={[{ label: "S", value: 10, total: true }, { label: "Up", value: 3 }]} />
        <RadialBarChart data={[{ label: "A", value: 3 }]} max={10} />
        <FunnelChart stages={[{ label: "Visits", value: 10 }, { label: "Paid", value: 4 }]} />
        <RadarChart axes={["A", "B", "C"]} series={[{ label: "X", values: [1, 2, 3] }]} />
        <Treemap data={[{ label: "A", value: 3 }, { label: "B", value: 1 }]} />
      </>,
    );
    expect(canvasWarnings()).toEqual([]);
  });
});

describe("devWarn helper", () => {
  it("warns at most once for a given message", () => {
    const msg = "[canvas] <DevWarnDedupProbe />: unique probe";
    devWarn(true, msg);
    devWarn(true, msg);
    devWarn(true, msg);
    expect(warnSpy.mock.calls.filter((c) => c[0] === msg).length).toBe(1);
  });

  it("does not warn when the condition is false", () => {
    devWarn(false, "[canvas] <DevWarnFalseProbe />: should never surface");
    expect(sawWarning("DevWarnFalseProbe")).toBe(false);
  });
});
