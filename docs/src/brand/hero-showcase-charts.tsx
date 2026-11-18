import {
  AreaChart, BarList, BoxPlot, BulletChart, CandlestickChart, Chart, Column,
  ComposedChart, DepthChart, FunnelChart, Gauge, GeoMap, Heatmap, Histogram,
  LineChart, MetricBreakdown, PieChart, ProgressRing, RadarChart, RadialBarChart,
  RangeAreaChart, ScatterPlot, ServiceHealthList, Sparkline, StackedBar, Treemap,
  Typography, UptimeBar, WaterfallChart, type UptimePeriod,
} from "@nannier/canvas";
import { useDemonstrationStep } from "./hero-showcase-activity";

export const HERO_CHART_KINDS = [
  "chart", "line-chart", "area-chart", "pie-chart", "scatter-plot",
  "candlestick-chart", "depth-chart", "sparkline", "stacked-bar", "gauge",
  "heatmap", "bar-list", "metric-breakdown", "uptime-bar", "service-health-list",
  "bullet-chart", "progress-ring", "composed-chart", "range-area-chart",
  "histogram", "box-plot", "waterfall-chart", "radial-bar-chart", "funnel-chart",
  "radar-chart", "treemap", "geo-map",
] as const;

export type HeroChartKind = typeof HERO_CHART_KINDS[number];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOLLARS = (value: number) => `$${value}`;
const THOUSANDS = (value: number) => `${value < 0 ? "-" : ""}$${Math.abs(value)}k`;
const PERCENT = (value: number) => `${value}%`;
const MILLISECONDS = (value: number) => `${value} ms`;
const TEMPERATURES: [low: number, high: number][] = [
  [12, 21], [11, 24], [13, 26], [14, 25], [17, 29], [17, 27], [15, 24],
];
const LATENCY_SAMPLES = [
  28, 31, 35, 37, 39, 41, 41, 42, 43, 44, 45, 45, 47, 48, 48, 49,
  49, 50, 50, 51, 51, 52, 52, 52, 53, 53, 54, 55, 55, 56, 58, 59,
  60, 60, 61, 64, 65, 67, 68, 72, 73, 75, 79, 84, 93, 101,
];

function uptimeHistory(degradedDay: number): UptimePeriod[] {
  return Array.from({ length: 30 }, (_, i) => ({
    label: i === 29 ? "Today" : `${29 - i} days ago`,
    degraded: i === degradedDay,
  }));
}

/** The center artwork uses the public chart APIs with illustrative data. */
export function HeroChartSpecimen({ kind }: { kind: HeroChartKind }) {
  const step = useDemonstrationStep(1250);
  const phase = step % 4;
  const change = [0, 5, -3, 8][phase]!;
  const testID = `hero-chart-${kind}`;

  switch (kind) {
    case "chart":
      return <Chart compact title="Quarterly revenue" max={100} formatValue={THOUSANDS} data={[
        { label: "Q1", value: 46 }, { label: "Q2", value: 62 },
        { label: "Q3", value: 54 + change }, { label: "Q4", value: 82 + change },
      ]} testID={testID} />;
    case "line-chart":
      return <LineChart compact curved dots title="Weekly profile visits" labels={WEEK} max={100} series={[
        { label: "Visits", values: [33, 48, 42, 57, 51 + change, 72, 66 + 2 * change] },
      ]} testID={testID} />;
    case "area-chart":
      return <AreaChart compact curved title="Workspace activity" labels={MONTHS} max={120} series={[
        { label: "Projects", values: [24, 38, 34, 51, 67 - change, 79 + change] },
        { label: "Teams", values: [12, 19, 24, 28, 42 + change, 47 - change] },
      ]} testID={testID} />;
    case "pie-chart":
      return <PieChart label="Readers" donut detailed slices={[
        { label: "Search", value: 430 + change * 10 },
        { label: "Direct", value: 270 - change * 10 },
        { label: "Referral", value: 180 },
        { label: "Newsletter", value: 120 },
      ]} testID={testID} />;
    case "scatter-plot":
      return <ScatterPlot compact title="Study hours and scores" series={[
        { label: "Group A", points: [
          { x: 1, y: 47 }, { x: 2, y: 57 }, { x: 3, y: 54 },
          { x: 4, y: 72 + change }, { x: 5, y: 75 }, { x: 7, y: 89 },
          { x: 8, y: 93 + change / 2 },
        ] },
        { label: "Group B", points: [
          { x: 1.5, y: 53 }, { x: 3, y: 62 }, { x: 4, y: 65 - change },
          { x: 5.5, y: 77 }, { x: 6.5, y: 84 + change }, { x: 8, y: 87 },
        ] },
      ]} testID={testID} />;
    case "candlestick-chart":
      return <CandlestickChart compact title="Six trading sessions" labels={["May 4", "5", "6", "7", "8", "11"]} formatValue={DOLLARS} min={88} max={124} candles={[
        { open: 93, high: 103, low: 90, close: 100 },
        { open: 101, high: 106, low: 98, close: 104 },
        { open: 103, high: 108, low: 96, close: 98 },
        { open: 98, high: 112, low: 97, close: 110 },
        { open: 110, high: 115, low: 102, close: 105 },
        { open: 105, high: 118 + phase, low: 103, close: 112 + change / 2 },
      ]} volume={[30, 42, 35, 62, 46, 57 + change]} testID={testID} />;
    case "depth-chart":
      return <DepthChart title="Order book depth" spread="$2 spread" bids={[
        { price: 94, size: 15 }, { price: 95, size: 24 },
        { price: 96, size: 10 }, { price: 97, size: 28 + change },
        { price: 98, size: 12 }, { price: 99, size: 7 },
      ]} asks={[
        { price: 101, size: 8 }, { price: 102, size: 16 },
        { price: 103, size: 14 }, { price: 104, size: 25 - change },
        { price: 105, size: 11 }, { price: 106, size: 21 },
      ]} testID={testID} />;
    case "sparkline": {
      const latest = [1840, 1912, 1856, 1978][phase]!;
      return <Column loose pad>
        <Column tight>
          <Typography small muted>Daily downloads</Typography>
          <Typography metricValue>{latest.toLocaleString("en-US")}</Typography>
        </Column>
        <Sparkline tall line track values={[426, 708, 590, 925, 810, 1140, 1020, 1342, 1268, 1520, 1452, latest]} accessibilityLabel="Downloads over the last 12 days" testID={testID} />
      </Column>;
    }
    case "stacked-bar":
      return <Column relaxed pad>
        <Column tight>
          <Typography h4>Workspace storage</Typography>
          <Typography small muted>{76 + change} of 100 GB used</Typography>
        </Column>
        <StackedBar tall detailed label="Workspace storage" max={100} segments={[
          { label: "Images", value: 34 + change }, { label: "Video", value: 24 },
          { label: "Documents", value: 12 }, { label: "Other", value: 6 },
        ]} testID={testID} />
      </Column>;
    case "gauge":
      return <Column alignCenter pad>
        <Gauge large success value={84 + change} label="Target attainment" testID={testID} />
      </Column>;
    case "heatmap":
      return <Heatmap label="26 weeks of contributions" values={Array.from({ length: 182 }, (_, i) => {
        const activity = (i * 17 + i * i + (i >= 154 ? 7 * phase : 0)) % 29;
        return activity < 7 ? 0 : activity / 28;
      })} testID={testID} />;
    case "bar-list":
      return <BarList title="Top templates this week" items={[
        { label: "Project brief", value: 1840 + change * 20, delta: "+12%" },
        { label: "Design review", value: 1280 - change * 15, delta: "+8%" },
        { label: "Launch plan", value: 950 + change * 10, delta: "+24%" },
        { label: "Research notes", value: 640, delta: "+4%" },
        { label: "Team retro", value: 412, delta: "+6%" },
      ]} testID={testID} />;
    case "metric-breakdown":
      return <MetricBreakdown label="Library downloads" value={`${(18.4 + change / 10).toFixed(1)}k`}
        rate="+12.4%" rateLabel="vs. last month" rateSuccess
        spark={[22, 35, 30, 44, 38, 52, 57, 53, 61 + change]}
        breakdown={[
          { label: "Components", value: 12100 + change * 100 },
          { label: "Templates", value: 4200 },
          { label: "Icons", value: 2100 },
        ]} testID={testID} />;
    case "uptime-bar":
      return <Column loose pad>
        <Typography h4>Service uptime</Typography>
        <UptimeBar detailed label="Public API" caption={`${[99.98, 99.99, 99.97, 99.99][phase]}% uptime`}
          startLabel="29 days ago" endLabel="Today" periods={uptimeHistory(9 + 3 * phase)} testID={testID} />
      </Column>;
    case "service-health-list":
      return <ServiceHealthList detailed title="Platform services" items={[
        { label: "Web app", detail: "100%", periods: uptimeHistory(-1) },
        { label: "Public API", detail: "99.98%", periods: uptimeHistory(9 + 3 * phase) },
        { label: "Media uploads", detail: "99.2%", degraded: true, periods: uptimeHistory(29) },
      ]} testID={testID} />;
    case "bullet-chart":
      return <BulletChart detailed title="Quarterly goals" max={100} formatValue={PERCENT} data={[
        { label: "Revenue", value: 88 + change, target: 85, ranges: [50, 75, 100], success: true },
        { label: "Retention", value: 74 - change, target: 85, ranges: [50, 75, 100], warning: true },
        { label: "Activation", value: 63 + change, target: 75, ranges: [50, 75, 100] },
      ]} testID={testID} />;
    case "progress-ring":
      return <Column alignCenter pad>
        <ProgressRing stacked primary value={[76, 88, 97, 100][phase]!} label="Migration complete" testID={testID} />
      </Column>;
    case "composed-chart":
      return <ComposedChart compact dots title="Orders and forecast" labels={MONTHS} max={120} series={[
        { label: "Orders", values: [35, 57, 43, 62, 76 + change, 82 + 2 * change] },
        { label: "Forecast", line: true, dashed: true, values: [40, 46, 52, 61, 72, 84] },
      ]} testID={testID} />;
    case "range-area-chart":
      return <RangeAreaChart title="Daily temperature outlook" label="Temperature" curved labels={WEEK}
        data={TEMPERATURES.map(([low, high], i) => {
          const revisedHigh = high + (i >= 4 ? change / 2 : 0);
          return { low, high: revisedHigh, mid: (low + revisedHigh) / 2 };
        })} formatValue={value => `${Math.round(value)}°C`} testID={testID} />;
    case "histogram":
      return <Histogram title="API response times (ms)" label="Response samples" bins={8}
        values={LATENCY_SAMPLES.map((value, i) => value + (i % 4 === 0 ? change : 0))}
        testID={testID} />;
    case "box-plot":
      return <BoxPlot title="Response time by region" formatValue={MILLISECONDS} data={[
        { label: "Americas", values: [34, 44, 46, 53, 55, 61, 64, 82] },
        { label: "Europe", values: [29, 34, 36, 44 + change, 53 + change, 60, 62, 74] },
        { label: "Asia Pacific", values: [42, 51, 54, 63 - change, 71 - change, 76, 80, 97] },
      ]} testID={testID} />;
    case "waterfall-chart":
      return <WaterfallChart title="From revenue to profit" formatValue={THOUSANDS} steps={[
        { label: "Revenue", value: 92 + change },
        { label: "Materials", value: -24 },
        { label: "Labor", value: -19 },
        { label: "Overhead", value: -11 },
        { label: "Profit", total: true },
      ]} testID={testID} />;
    case "radial-bar-chart":
      return <RadialBarChart label="Learning paths completed" detailed max={100} formatValue={PERCENT} data={[
        { label: "Design", value: 88 + change },
        { label: "Research", value: 72 + change },
        { label: "Engineering", value: 63 + change },
        { label: "Leadership", value: 44 + change },
      ]} testID={testID} />;
    case "funnel-chart":
      return <FunnelChart tapered share title="Signup funnel" stages={[
        { label: "Visited", value: 8400 },
        { label: "Signed up", value: 6300 + change * 65 },
        { label: "Activated", value: 3800 + change * 80 },
        { label: "Upgraded", value: 1900 + change * 55 },
      ]} testID={testID} />;
    case "radar-chart":
      return <RadarChart compact spokes title="Team skills" axes={["Research", "Design", "Writing", "Build", "Test"]} max={100} series={[
        { label: "Studio", values: [78, 96, 62 + change, 74, 85 - change] },
        { label: "Product", values: [91, 67 + change, 83, 96 - change, 72] },
      ]} testID={testID} />;
    case "treemap":
      return <Treemap title="Engineering time by area" partitioned outlined formatValue={value => `${value} h`} data={[
        { label: "Product", value: 42 + change },
        { label: "Platform", value: 26 - change },
        { label: "Reliability", value: 18 },
        { label: "Tooling", value: 14 },
      ]} testID={testID} />;
    case "geo-map":
      return <GeoMap title="Readers around the world" points={[
        { label: "San Francisco", lat: 37.77, lng: -122.42, count: 620 + change * 30 },
        { label: "Toronto", lat: 43.65, lng: -79.38, count: 380 },
        { label: "São Paulo", lat: -23.55, lng: -46.63, count: 290 + change * 15 },
        { label: "London", lat: 51.51, lng: -0.13, count: 560 - change * 20 },
        { label: "Cape Town", lat: -33.92, lng: 18.42, count: 190 },
        { label: "Singapore", lat: 1.35, lng: 103.82, count: 340 + change * 25 },
        { label: "Tokyo", lat: 35.68, lng: 139.69, count: 490 },
        { label: "Sydney", lat: -33.87, lng: 151.21, count: 210 },
      ]} testID={testID} />;
  }
}
