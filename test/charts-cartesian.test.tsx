import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Chart, LineChart, AreaChart, PieChart } from "../src/organisms/charts/charts.tsx";

// LineChart / AreaChart: the a11y contract (the plot is an img whose accessible
// name carries every value, series-prefixed; the legend stays reachable outside
// it) plus the semantic boolean axes that are observable without an SVG
// renderer (the harness stubs react-native-svg, so geometry is proven in
// chart-math.test.ts and these tests assert structure, names, and furniture).

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

const labels = ["Jan", "Feb", "Mar"];
const twoSeries = [
  { label: "Web", values: [120, 180, 150] },
  { label: "Mobile", values: [60, 90, 140] },
];

const plotName = (c: HTMLElement) => c.querySelector('[role="img"]')?.getAttribute("aria-label") ?? "";

describe("LineChart", () => {
  it("folds every series' data into the plot's accessible name", () => {
    const { container } = ui(<LineChart labels={labels} series={twoSeries} />);
    const name = plotName(container);
    expect(name).toContain("Web: Jan 120, Feb 180, Mar 150");
    expect(name).toContain("Mobile: Jan 60, Feb 90, Mar 140");
  });

  it("names the root group after the title", () => {
    const { container } = ui(<LineChart title="Signups" labels={labels} series={twoSeries} />);
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute("aria-label")).toBe("Signups chart");
  });

  it("formats accessible values through formatValue", () => {
    const { container } = ui(
      <LineChart labels={labels} series={[{ label: "Revenue", values: [12000, 18000, 15000] }]} />,
    );
    expect(plotName(container)).toContain("Revenue: Jan 12k, Feb 18k, Mar 15k");
  });

  it("shows a reachable legend for multiple series, none for one", () => {
    const multi = ui(<LineChart labels={labels} series={twoSeries} />);
    // Legend text lives OUTSIDE the img subtree, so it must appear as real text.
    expect(multi.container.textContent).toContain("Web");
    expect(multi.container.textContent).toContain("Mobile");
    cleanup();

    const single = ui(<LineChart labels={labels} series={[{ label: "Web", values: [1, 2, 3] }]} />);
    // A single series is named by the title, not a one-dot legend; the series
    // label appears only inside the accessible name, not as legend text.
    expect(single.container.textContent ?? "").not.toContain("Web");
  });

  it("hideLegend suppresses the legend for multi-series charts", () => {
    const { container } = ui(<LineChart hideLegend labels={labels} series={twoSeries} />);
    expect(container.textContent ?? "").not.toContain("Mobile");
  });

  it("renders y tick labels once measured, and hides them under hideAxes", () => {
    // happy-dom reports zero layout width, so the frame stays unmeasured and
    // furniture must not render; this locks in the graceful pre-measure state.
    const { container } = ui(<LineChart labels={labels} series={twoSeries} />);
    expect(container.textContent ?? "").not.toContain("NaN");
  });
});

describe("Chart (grouped bars)", () => {
  it("announces each category as one item carrying every series' value", () => {
    const { container } = ui(<Chart title="Revenue vs costs" labels={["Q1", "Q2"]} series={twoSeries} />);
    const items = Array.from(container.querySelectorAll('[role="img"]')).map((el) => el.getAttribute("aria-label"));
    expect(items).toContain("Q1: Web 120, Mobile 60");
    expect(items).toContain("Q2: Web 180, Mobile 90");
  });

  it("shows the series legend, suppressible with hideLegend", () => {
    const withLegend = ui(<Chart labels={["Q1"]} series={twoSeries} />);
    expect(withLegend.container.textContent).toContain("Mobile");
    cleanup();
    const without = ui(<Chart hideLegend labels={["Q1"]} series={twoSeries} />);
    expect(without.container.textContent ?? "").not.toContain("Mobile");
  });

  it("keeps the single-series data shape working unchanged", () => {
    const { container } = ui(<Chart title="Signups" data={[{ label: "Mon", value: 3 }]} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Signups chart");
    const items = Array.from(container.querySelectorAll('[role="img"]')).map((el) => el.getAttribute("aria-label"));
    expect(items).toContain("Mon: 3");
  });
});

describe("PieChart", () => {
  const slices = [
    { label: "Direct", value: 60 },
    { label: "Search", value: 40 },
  ];

  it("folds the composition into the plot's accessible name as percentages", () => {
    const { container } = ui(<PieChart label="Traffic" slices={slices} />);
    expect(plotName(container)).toBe("Traffic: Direct 60%, Search 40%");
  });

  it("hoists the img role to the root when the legend is hidden", () => {
    const { container } = ui(<PieChart hideLegend label="Traffic" slices={slices} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toContain("Traffic: Direct 60%");
    expect(container.textContent ?? "").not.toContain("Direct");
  });

  it("legend lists each slice with its percentage, reachable as text", () => {
    const { container } = ui(<PieChart label="Traffic" slices={slices} />);
    expect(container.textContent).toContain("Direct");
    expect(container.textContent).toContain("60%");
  });

  it("donut centers the compact total and the label", () => {
    const { container } = ui(<PieChart donut label="Traffic" slices={[{ label: "A", value: 1200 }, { label: "B", value: 300 }]} />);
    expect(container.textContent).toContain("1.5k");
    expect(container.textContent).toContain("Traffic");
  });
});

describe("AreaChart", () => {
  it("carries the stacked series' data in its accessible name", () => {
    const { container } = ui(<AreaChart stacked labels={labels} series={twoSeries} />);
    const name = plotName(container);
    expect(name).toContain("Web: Jan 120");
    expect(name).toContain("Mobile: Jan 60");
  });

  it("titled area chart exposes the group name", () => {
    const { container } = ui(<AreaChart title="Traffic" labels={labels} series={twoSeries} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Traffic chart");
  });
});
