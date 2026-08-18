import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { BarList } from "../src/charts/bar-list/bar-list.tsx";
import { MetricBreakdown } from "../src/charts/metric-breakdown/metric-breakdown.tsx";
import { UptimeBar } from "../src/charts/uptime-bar/uptime-bar.tsx";
import { ServiceHealthList } from "../src/charts/service-health-list/service-health-list.tsx";
import { BulletChart } from "../src/charts/bullet-chart/bullet-chart.tsx";
import { ProgressRing } from "../src/charts/progress-ring/progress-ring.tsx";
import { ringDash, ringFill } from "../src/charts/progress-ring/progress-ring.shared.tsx";
import { RadialBarChart } from "../src/charts/radial-bar-chart/radial-bar-chart.tsx";
import { FunnelChart } from "../src/charts/funnel-chart/funnel-chart.tsx";
import { RadarChart } from "../src/charts/radar-chart/radar-chart.tsx";
import { Treemap } from "../src/charts/treemap/treemap.tsx";
import { rowAccessibleLabel, rowFill } from "../src/charts/shared/breakdown-rows.tsx";
import { periodStatus, statusSummary } from "../src/charts/shared/status-strip.tsx";
import { lightColors } from "../src/style/tokens.ts";

// The chart-buildout card/radial/layout charts: behavior and a11y specs.
// Cartesian buildout charts live in test/charts-cartesian.test.tsx; this file
// covers the composite cards and, in later phases, the radial and layout
// charts. Geometry is proven in test/chart-math.test.ts (the harness stubs
// react-native-svg, so nothing about paths is assertable from the DOM).

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const imgLabels = (c: HTMLElement) => [...c.querySelectorAll('[role="img"]')].map((el) => el.getAttribute("aria-label") ?? "");

describe("breakdown row engine (pure helpers)", () => {
  const fmt = (v: number) => String(v);

  it("rowAccessibleLabel folds value, share, and spelled-out delta direction", () => {
    expect(rowAccessibleLabel({ label: "GET", value: 8 }, null, fmt)).toBe("GET: 8");
    expect(rowAccessibleLabel({ label: "GET", value: 8 }, 62, fmt)).toBe("GET: 8, 62% of total");
    expect(rowAccessibleLabel({ label: "GET", value: 8, delta: "+8%" }, null, fmt)).toBe("GET: 8, up +8%");
    expect(rowAccessibleLabel({ label: "POST", value: 4, delta: "-2%", down: true }, null, fmt)).toBe("POST: 4, down -2%");
    // A steady delta is a qualifier, not a change claim: it reads verbatim.
    expect(rowAccessibleLabel({ label: "POST", value: 4, delta: "last 30 days", steady: true }, null, fmt)).toBe("POST: 4, last 30 days");
    // Non-finite values read as 0, matching the bar's treatment.
    expect(rowAccessibleLabel({ label: "X", value: NaN }, null, fmt)).toBe("X: 0");
  });

  it("rowFill resolves slot > tone > ramp-by-index", () => {
    const t = lightColors;
    expect(rowFill(t, { label: "a", value: 1, chart4: true }, 0, "success")).toBe(t["chart-4"]);
    expect(rowFill(t, { label: "a", value: 1 }, 0, "success")).not.toBe(t["chart-1"]);
    expect(rowFill(t, { label: "a", value: 1 }, 2, null)).toBe(t["chart-3"]);
    // Identity follows the row's index, never its rank.
    expect(rowFill(t, { label: "a", value: 1 }, 9, null)).toBe(t["chart-2"]);
  });
});

describe("BarList", () => {
  const items = [
    { label: "/pricing", value: 18400, delta: "+12%" },
    { label: "/docs", value: 12100, delta: "-4%", down: true },
    { label: "/blog", value: 8700 },
  ];

  it("each row is an accessible item carrying label, value, and delta", () => {
    const { container } = ui(<BarList title="Top pages" items={items} />);
    const labels = imgLabels(container);
    expect(labels).toContain("/pricing: 18.4k, up +12%");
    expect(labels).toContain("/docs: 12.1k, down -4%");
    expect(labels).toContain("/blog: 8.7k");
  });

  it("a title names the root group as a chart", () => {
    const { container } = ui(<BarList title="Top pages" items={items} />);
    const root = container.querySelector('[role="group"]');
    expect(root?.getAttribute("aria-label")).toBe("Top pages chart");
  });

  it("share mode folds the percent of total into each row's name and shows readouts", () => {
    const { container, getByText } = ui(<BarList share items={[{ label: "google", value: 3 }, { label: "email", value: 1 }]} />);
    expect(imgLabels(container)).toContain("google: 3, 75% of total");
    expect(getByText("75%")).toBeTruthy();
    expect(getByText("25%")).toBeTruthy();
  });

  it("formatValue reformats both the visible value and the accessible name", () => {
    const { container, getByText } = ui(
      <BarList items={[{ label: "a", value: 1840 }]} formatValue={(v) => `${v} reqs`} />,
    );
    expect(getByText("1840 reqs")).toBeTruthy();
    expect(imgLabels(container)).toContain("a: 1840 reqs");
  });

  it("onPressItem turns rows into buttons that report their index", () => {
    const pressed: number[] = [];
    const { container } = ui(<BarList items={items} onPressItem={(i) => pressed.push(i)} />);
    const buttons = [...container.querySelectorAll('[role="button"]')];
    expect(buttons.length).toBe(3);
    fireEvent.click(buttons[1]);
    expect(pressed).toEqual([1]);
    // Buttons carry the same composed name the static rows would.
    expect(buttons[1].getAttribute("aria-label")).toBe("/docs: 12.1k, down -4%");
  });

  it("plain strips the card surface", () => {
    const { container } = ui(<BarList plain items={items} testID="bl" />);
    const root = container.querySelector('[data-testid="bl"]') as HTMLElement;
    expect(getComputedStyle(root).borderWidth === "" || getComputedStyle(root).borderWidth === "0px").toBe(true);
  });
});

describe("MetricBreakdown", () => {
  it("renders the headline, caption, and toned rate as real text", () => {
    const { getByText } = ui(
      <MetricBreakdown value="3,771" label="Tokens issued" rate="1.39%" rateLabel="Error rate" rateDestructive />,
    );
    expect(getByText("3,771")).toBeTruthy();
    expect(getByText("Tokens issued")).toBeTruthy();
    expect(getByText("1.39%")).toBeTruthy();
    expect(getByText("Error rate")).toBeTruthy();
  });

  it("names the root group after the metric label", () => {
    const { container } = ui(<MetricBreakdown value="960" label="Sign-ups" />);
    const root = container.querySelector('[role="group"]');
    expect(root?.getAttribute("aria-label")).toBe("Sign-ups");
  });

  it("breakdown rows announce their share of the total", () => {
    const { container } = ui(
      <MetricBreakdown
        value="12"
        label="Requests"
        breakdown={[
          { label: "GET", value: 9 },
          { label: "POST", value: 3 },
        ]}
      />,
    );
    const labels = imgLabels(container);
    expect(labels).toContain("GET: 9, 75% of total");
    expect(labels).toContain("POST: 3, 25% of total");
  });

  it("the spark renders through Sparkline with a data-derived name and a latest-value tag", () => {
    const { container, getByText } = ui(
      <MetricBreakdown value="116" label="Requests" spark={[96, 104, 110, 116]} sparkUnit="req/s" />,
    );
    expect(imgLabels(container)).toContain("Requests trend");
    expect(getByText("116 req/s")).toBeTruthy();
    // The tag is presentational: the trend's name carries the data.
    expect(getByText("116 req/s").closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it("chips render as kit Chips with the count folded into the label", () => {
    const { getByText } = ui(
      <MetricBreakdown
        value="12"
        label="Requests"
        chipsLabel="Errors"
        chips={[{ label: "invalid_grant", count: 38, destructive: true }, { label: "404", warning: true }]}
      />,
    );
    expect(getByText("Errors")).toBeTruthy();
    expect(getByText("invalid_grant · 38")).toBeTruthy();
    expect(getByText("404")).toBeTruthy();
  });

  it("chipsLabel has no default: without it the footer renders chips alone", () => {
    const { queryByText, getByText } = ui(
      <MetricBreakdown value="12" label="Requests" chips={[{ label: "500", destructive: true }]} />,
    );
    expect(getByText("500")).toBeTruthy();
    expect(queryByText("Errors")).toBeNull();
  });

  it("every section is independently optional", () => {
    const { container, getByText } = ui(<MetricBreakdown value="960" label="Sign-ups" />);
    expect(getByText("960")).toBeTruthy();
    // No rate, no trend img beyond none, no rows, no chips.
    expect(imgLabels(container)).toEqual([]);
    expect(container.querySelectorAll('[role="button"]').length).toBe(0);
  });

  it("a single-point spark is skipped rather than drawn", () => {
    const { container } = ui(<MetricBreakdown value="1" label="Requests" spark={[42]} />);
    expect(imgLabels(container)).toEqual([]);
  });
});

describe("status strip (pure helpers)", () => {
  it("periodStatus resolves down > degraded > unknown > operational", () => {
    expect(periodStatus({})).toBe("operational");
    expect(periodStatus({ unknown: true })).toBe("unknown");
    expect(periodStatus({ degraded: true, unknown: true })).toBe("degraded");
    expect(periodStatus({ down: true, degraded: true, unknown: true })).toBe("down");
  });

  it("statusSummary tallies statuses and omits zero counts", () => {
    const periods = [{}, {}, { degraded: true }, { down: true }, {}];
    expect(statusSummary(periods, "API uptime")).toBe("API uptime, 5 periods: 3 operational, 1 degraded, 1 down");
    expect(statusSummary([{}], undefined)).toBe("Uptime, 1 period: 1 operational");
    expect(statusSummary([], "X")).toBe("X, 0 periods");
  });
});

describe("UptimeBar", () => {
  it("the strip is one image named by the status tally", () => {
    const { container } = ui(<UptimeBar label="API uptime" periods={[{}, { down: true }, {}]} />);
    expect(imgLabels(container)).toContain("API uptime, 3 periods: 2 operational, 1 down");
  });

  it("caption and edge labels are real text outside the image", () => {
    const { getByText } = ui(
      <UptimeBar label="API" caption="99.98% uptime" startLabel="90 days ago" endLabel="Today" periods={[{}]} />,
    );
    expect(getByText("99.98% uptime")).toBeTruthy();
    expect(getByText("90 days ago")).toBeTruthy();
    expect(getByText("Today")).toBeTruthy();
    // None of them sit inside the presentational strip image.
    expect(getByText("Today").closest('[role="img"]')).toBeNull();
  });
});

describe("ServiceHealthList", () => {
  const items = [
    { label: "API", detail: "99.98%" },
    { label: "Dashboard", detail: "99.92%", degraded: true },
    { label: "Webhooks", down: true, periods: [{}, { down: true }] },
  ];

  it("rows compose label, status, and detail into one accessible name", () => {
    const { container } = ui(<ServiceHealthList title="System status" items={items} />);
    const labels = imgLabels(container);
    expect(labels).toContain("API: operational, 99.98%");
    expect(labels).toContain("Dashboard: degraded, 99.92%");
    expect(labels).toContain("Webhooks: down");
  });

  it("an embedded strip carries its own tallying summary", () => {
    const { container } = ui(<ServiceHealthList items={items} />);
    expect(imgLabels(container)).toContain("Webhooks, 2 periods: 1 operational, 1 down");
  });

  it("compact hides the embedded strips", () => {
    const { container } = ui(<ServiceHealthList compact items={items} />);
    expect(imgLabels(container)).not.toContain("Webhooks, 2 periods: 1 operational, 1 down");
  });

  it("onPressItem turns rows into buttons reporting their index", () => {
    const pressed: number[] = [];
    const { container } = ui(<ServiceHealthList items={items} onPressItem={(i) => pressed.push(i)} />);
    const buttons = [...container.querySelectorAll('[role="button"]')];
    expect(buttons.length).toBe(3);
    fireEvent.click(buttons[2]);
    expect(pressed).toEqual([2]);
    expect(buttons[1].getAttribute("aria-label")).toBe("Dashboard: degraded, 99.92%");
  });

  it("a title names the root group as a chart", () => {
    const { container } = ui(<ServiceHealthList title="System status" items={items} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("System status chart");
  });
});

describe("BulletChart", () => {
  it("rows compose value and target into one accessible name", () => {
    const { container } = ui(
      <BulletChart
        title="Q3 targets"
        data={[
          { label: "Revenue", value: 275, target: 300, ranges: [200, 350] },
          { label: "NPS", value: 61 },
        ]}
      />,
    );
    const labels = imgLabels(container);
    expect(labels).toContain("Revenue: 275 of target 300");
    expect(labels).toContain("NPS: 61");
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Q3 targets chart");
  });

  it("formatValue flows into the row names", () => {
    const { container } = ui(
      <BulletChart data={[{ label: "Rev", value: 8200, target: 10000 }]} formatValue={(v) => `$${v / 1000}k`} />,
    );
    expect(imgLabels(container)).toContain("Rev: $8.2k of target $10k");
  });
});

describe("ProgressRing", () => {
  it("mirrors the Gauge contract: rounding split, clamp, and accessible name", () => {
    const { getByText, container } = ui(<ProgressRing value={72.5} label="Complete" />);
    // The readout and the name round; the arc keeps the fraction.
    expect(getByText("73%")).toBeTruthy();
    expect(container.querySelector('[aria-label="Complete: 73%"]')).toBeTruthy();
    const clamped = ui(<ProgressRing value={140} />);
    expect(clamped.getByText("100%")).toBeTruthy();
  });

  it("ringDash starts the reveal at 12 o'clock and scales with the value", () => {
    const arc = ringDash(50, 120);
    // The path starts at the top center of the 120 box (x=60, y=inset 10).
    expect(arc.d.startsWith("M 60 10 ")).toBe(true);
    // Half the value reveals half the circumference of the r=50 ring.
    const [revealed, circumference] = arc.dasharray.split(" ").map(Number);
    expect(circumference).toBeCloseTo(2 * Math.PI * 50, 5);
    expect(revealed).toBeCloseTo(Math.PI * 50, 5);
    // Zero and full values reveal nothing and everything.
    expect(Number(ringDash(0).dasharray.split(" ")[0])).toBe(0);
    expect(Number(ringDash(100).dasharray.split(" ")[0])).toBeCloseTo(2 * Math.PI * 50, 5);
  });

  it("ringFill resolves success > warning > destructive > primary, matching Gauge", () => {
    const t = lightColors;
    expect(ringFill(t, { value: 1, success: true, warning: true })).toBe(ringFill(t, { value: 1, success: true }));
    expect(ringFill(t, { value: 1 })).toBe(t.primary);
    expect(ringFill(t, { value: 1, warning: true })).not.toBe(t.primary);
  });
});

describe("RadialBarChart", () => {
  const data = [
    { label: "iOS", value: 64 },
    { label: "Web", value: 82 },
  ];

  it("the composition lives in the accessible name as shares of the sweep", () => {
    const { container } = ui(<RadialBarChart label="Activation" data={data} max={100} />);
    expect(imgLabels(container)).toContain("Activation: iOS 64%, Web 82%");
  });

  it("hideLegend hoists the img role to the root and drops the legend text", () => {
    const withLegend = ui(<RadialBarChart label="A" data={data} max={100} />);
    expect(withLegend.container.textContent).toContain("iOS");
    const without = ui(<RadialBarChart label="B" data={data} max={100} hideLegend />);
    expect(without.container.textContent ?? "").not.toContain("iOS");
    expect(imgLabels(without.container)).toContain("B: iOS 64%, Web 82%");
  });

  it("the legend carries formatted values as details", () => {
    const { getByText } = ui(<RadialBarChart data={[{ label: "Hot", value: 4200 }]} />);
    expect(getByText("4.2k")).toBeTruthy();
  });
});

describe("FunnelChart", () => {
  const stages = [
    { label: "Visits", value: 1000 },
    { label: "Signups", value: 400 },
    { label: "Paid", value: 120 },
  ];

  it("names every stage with its conversion from the previous stage", () => {
    const { container } = ui(<FunnelChart title="Signup funnel" stages={stages} />);
    const labels = imgLabels(container);
    expect(labels).toContain("Signup funnel: Visits 1k, Signups 400 (40% of Visits), Paid 120 (30% of Signups)");
  });

  it("share reads every stage against the first", () => {
    const { container } = ui(<FunnelChart share stages={stages} />);
    expect(imgLabels(container).join(" ")).toContain("Paid 120 (12% of Visits)");
  });

  it("names the root group after the title", () => {
    const { container } = ui(<FunnelChart title="Checkout" stages={stages} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Checkout chart");
  });
});

describe("RadarChart", () => {
  const axes = ["Coding", "Design", "Comms"];
  const series = [
    { label: "Casey", values: [8, 6, 9] },
    { label: "Jordan", values: [6, 9, 7] },
  ];

  it("folds every axis and value into the plot's accessible name", () => {
    const { container } = ui(<RadarChart axes={axes} series={series} max={10} />);
    const name = imgLabels(container).join("; ");
    expect(name).toContain("Casey: Coding 8, Design 6, Comms 9");
    expect(name).toContain("Jordan: Coding 6, Design 9, Comms 7");
  });

  it("shows a reachable legend for multiple series outside the plot image", () => {
    const { container } = ui(<RadarChart axes={axes} series={series} />);
    expect(container.textContent).toContain("Casey");
    expect(container.textContent).toContain("Jordan");
  });

  it("names the root group after the title", () => {
    const { container } = ui(<RadarChart title="Candidates" axes={axes} series={series} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Candidates chart");
  });
});

describe("Treemap", () => {
  const data = [
    { label: "Media", value: 620 },
    { label: "Backups", value: 340 },
    { label: "Logs", value: 40 },
  ];

  it("the composition lives in the accessible name with values and shares", () => {
    const { container } = ui(<Treemap title="Storage" data={data} />);
    const name = imgLabels(container).join("; ");
    expect(name).toContain("Storage: Media 620 (62%)");
    expect(name).toContain("Backups 340 (34%)");
    expect(name).toContain("Logs 40 (4%)");
  });

  it("names the root group after the title", () => {
    const { container } = ui(<Treemap title="Storage" data={data} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Storage chart");
  });

  it("negative and non-finite values read as zero-share tiles", () => {
    const { container } = ui(<Treemap data={[{ label: "A", value: 10 }, { label: "B", value: -5 }]} />);
    expect(imgLabels(container).join(" ")).toContain("B 0 (0%)");
  });
});
