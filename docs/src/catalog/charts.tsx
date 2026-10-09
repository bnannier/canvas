import { AreaChart, BarList, BoxPlot, BulletChart, CandlestickChart, Chart, ComposedChart, Container, DepthChart, FunnelChart, Gauge, Heatmap, Histogram, LineChart, MetricBreakdown, PieChart, ProgressRing, RadarChart, RadialBarChart, RangeAreaChart, ScatterPlot, ServiceHealthList, StackedBar, Treemap, UptimeBar, WaterfallChart } from "@nannier/canvas";
import type { CatTile } from "./tile";

// Real chart components with the same representative data as their usage examples.
// The catalog grid supplies their bounds; each chart owns its responsive geometry.

function BarsPreview() {
  return (
    <Chart
      title="Signups"
      data={[
        { label: "Mon", value: 45 },
        { label: "Tue", value: 60 },
        { label: "Wed", value: 35 },
        { label: "Thu", value: 70 },
        { label: "Fri", value: 55 },
        { label: "Sat", value: 80 },
        { label: "Sun", value: 95 }
      ]}
      max={100}
    />
  );
}

function LinePreview() {
  return (
    <LineChart
      title="Active users"
      labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
      series={[
        { label: "Web", values: [119, 122, 131, 147, 157, 176, 182] },
        { label: "Mobile", values: [63, 93, 101, 121, 162, 207, 251] }
      ]}
    />
  );
}

function AreaPreview() {
  return (
    <AreaChart
      labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
      series={[
        { label: "Total", values: [120, 138, 151, 149, 168, 184, 197, 212] },
        { label: "Paid", values: [42, 51, 58, 63, 71, 84, 92, 104] }
      ]}
    />
  );
}

function PiePreview() {
  return (
    <PieChart
      label="Traffic"
      slices={[
        { label: "Direct", value: 42 },
        { label: "Organic search", value: 28 },
        { label: "Social", value: 18 },
        { label: "Other", value: 12 }
      ]}
    />
  );
}

function ScatterPreview() {
  return (
    <ScatterPlot
      title="Load vs latency"
      series={[
        { label: "us-east", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }, { x: 339, y: 63 }, { x: 446, y: 71 }, { x: 596, y: 99 }, { x: 741, y: 115 }] },
        { label: "eu-west", points: [{ x: 114, y: 33 }, { x: 227, y: 52 }, { x: 340, y: 92 }, { x: 455, y: 111 }, { x: 579, y: 129 }, { x: 737, y: 141 }] },
        { label: "ap-south", points: [{ x: 133, y: 45 }, { x: 251, y: 72 }, { x: 377, y: 102 }, { x: 492, y: 135 }, { x: 613, y: 161 }, { x: 740, y: 171 }] }
      ]}
    />
  );
}

function CandlestickPreview() {
  return (
    <CandlestickChart
      title="OLY"
      labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"]}
      candles={[
        { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
        { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
        { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
        { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
        { open: 64.2, high: 64.4, low: 64.0, close: 64.2 },
        { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
        { open: 64.4, high: 65.4, low: 63.8, close: 64.4 },
        { open: 64.4, high: 64.5, low: 62.6, close: 63.8 },
        { open: 63.8, high: 65.8, low: 63.6, close: 64.7 },
        { open: 64.7, high: 65.1, low: 63.9, close: 64.6 }
      ]}
      volume={[31, 27, 35, 29, 18, 33, 26, 41, 38, 24]}
    />
  );
}

function DepthPreview() {
  return (
    <DepthChart
      title="OLY order book"
      bids={[
        { price: 191.3, size: 80 },
        { price: 191.15, size: 120 },
        { price: 191.0, size: 116 },
        { price: 190.85, size: 118 },
        { price: 190.7, size: 176 },
        { price: 190.55, size: 190 },
        { price: 190.4, size: 210 },
        { price: 190.25, size: 236 }
      ]}
      asks={[
        { price: 191.6, size: 90 },
        { price: 191.75, size: 122 },
        { price: 191.9, size: 110 },
        { price: 192.05, size: 154 },
        { price: 192.2, size: 154 },
        { price: 192.35, size: 210 },
        { price: 192.5, size: 222 },
        { price: 192.65, size: 240 }
      ]}
    />
  );
}

function StackedBarPreview() {
  return (
    <StackedBar
      segments={[
        { label: "Direct", value: 42 },
        { label: "Organic search", value: 28 },
        { label: "Social", value: 18 }
      ]}
    />
  );
}

function GaugePreview() {
  return (
    <Gauge value={72} label="Uptime" />
  );
}

function HeatmapPreview() {
  return (
    <Container xs>
      <Heatmap values={[0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7]} />
    </Container>
  );
}

function BarListPreview() {
  return (
    <BarList
      title="Top pages"
      items={[
        { label: "/pricing", value: 18400, delta: "+12%" },
        { label: "/docs", value: 12100, delta: "+4%" },
        { label: "/blog/launch", value: 8700, delta: "-2%", down: true },
      ]}
    />
  );
}

function MetricBreakdownPreview() {
  return (
    <MetricBreakdown
      value="3,771"
      label="Tokens issued"
      breakdown={[
        { label: "authorization_code", value: 1842, delta: "+12%" },
        { label: "refresh_token", value: 1264, delta: "+4%" },
        { label: "client_credentials", value: 618, delta: "-3%", down: true },
      ]}
    />
  );
}

function UptimeBarPreview() {
  return (
    <UptimeBar
      label="API uptime"
      caption="99.98% uptime"
      startLabel="90 days ago"
      endLabel="Today"
      periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : i === 78 ? { degraded: true } : {}))}
    />
  );
}

function ServiceHealthPreview() {
  return (
    <ServiceHealthList
      title="System status"
      items={[
        { label: "API", detail: "99.98%", periods: Array.from({ length: 45 }, () => ({})) },
        { label: "Dashboard", detail: "99.92%", periods: Array.from({ length: 45 }, (_, i) => (i === 30 ? { degraded: true } : {})), degraded: true },
        { label: "Webhooks", detail: "97.10%", periods: Array.from({ length: 45 }, (_, i) => (i > 40 ? { down: true } : {})), down: true }
      ]}
    />
  );
}

function BulletPreview() {
  return (
    <BulletChart
      title="Q3 targets"
      data={[
        { label: "Revenue", value: 275, target: 300, ranges: [200, 350, 500] },
        { label: "Profit", value: 42, target: 35, ranges: [30, 50, 70] },
        { label: "NPS", value: 61, target: 70, ranges: [40, 60, 80] },
      ]}
    />
  );
}

function ProgressRingPreview() {
  return (
    <ProgressRing value={72} label="Complete" />
  );
}

function ComposedPreview() {
  return (
    <ComposedChart
      title="Revenue and margin"
      labels={["Q1", "Q2", "Q3", "Q4"]}
      series={[
        { label: "Revenue", values: [420, 510, 480, 620] },
        { label: "Margin", values: [110, 170, 150, 240], line: true }
      ]}
    />
  );
}

function RangeAreaPreview() {
  return (
    <RangeAreaChart
      label="p50 to p99"
      labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
      data={[
        { low: 42, high: 118, mid: 61 },
        { low: 38, high: 102, mid: 55 },
        { low: 44, high: 131, mid: 66 },
        { low: 40, high: 95, mid: 52 },
        { low: 47, high: 144, mid: 71 },
        { low: 36, high: 88, mid: 49 },
        { low: 34, high: 81, mid: 46 },
      ]}
    />
  );
}

function HistogramPreview() {
  return (
    <Histogram
      title="Response times"
      label="Latency ms"
      values={[42, 38, 51, 44, 47, 39, 58, 62, 44, 41, 49, 53, 46, 43, 71, 48]}
    />
  );
}

function BoxPlotPreview() {
  return (
    <BoxPlot
      title="Latency by region"
      data={[
        { label: "us-east", values: [42, 38, 51, 44, 47, 39, 96] },
        { label: "eu-west", values: [55, 61, 58, 64, 57, 63] },
        { label: "ap-south", values: [71, 78, 74, 83, 76, 124] },
      ]}
    />
  );
}

function WaterfallPreview() {
  return (
    <WaterfallChart
      title="Q3 revenue bridge"
      steps={[
        { label: "Q2", value: 4200, total: true },
        { label: "New", value: 980 },
        { label: "Expansion", value: 460 },
        { label: "Churn", value: -540 },
        { label: "FX", value: -120 },
        { label: "Q3", total: true },
      ]}
    />
  );
}

function RadialBarPreview() {
  return (
    <RadialBarChart
      label="Platform activation"
      max={100}
      data={[
        { label: "iOS", value: 64 },
        { label: "Android", value: 48 },
        { label: "Web", value: 82 }
      ]}
    />
  );
}

function FunnelPreview() {
  return (
    <FunnelChart
      stages={[
        { label: "Visits", value: 12400 },
        { label: "Signups", value: 4200 },
        { label: "Activated", value: 1850 },
        { label: "Paid", value: 480 },
      ]}
    />
  );
}

function RadarPreview() {
  return (
    <RadarChart
      title="Candidate comparison"
      axes={["Coding", "Design", "Comms", "Ops", "Product"]}
      series={[
        { label: "Casey", values: [8, 6, 9, 5, 7] },
        { label: "Jordan", values: [6, 9, 7, 8, 5] },
      ]}
    />
  );
}

function TreemapPreview() {
  return (
    <Treemap
      title="Storage by service"
      data={[
        { label: "Media", value: 620 },
        { label: "Backups", value: 340 },
        { label: "Logs", value: 180 },
        { label: "Search index", value: 120 },
        { label: "Thumbnails", value: 90 },
        { label: "Exports", value: 45 },
        { label: "Other", value: 25 }
      ]}
    />
  );
}

export const CHARTS_TILES: CatTile[] = [
  { title: "Chart", href: "/components/chart", Preview: BarsPreview },
  { title: "LineChart", href: "/components/line-chart", Preview: LinePreview },
  { title: "AreaChart", href: "/components/area-chart", Preview: AreaPreview },
  { title: "PieChart", href: "/components/pie-chart", Preview: PiePreview },
  { title: "ScatterPlot", href: "/components/scatter-plot", Preview: ScatterPreview },
  { title: "CandlestickChart", href: "/components/candlestick-chart", Preview: CandlestickPreview },
  { title: "DepthChart", href: "/components/depth-chart", Preview: DepthPreview },
  { title: "StackedBar", href: "/components/stacked-bar", Preview: StackedBarPreview },
  { title: "Gauge", href: "/components/gauge", Preview: GaugePreview },
  { title: "Heatmap", href: "/components/heatmap", Preview: HeatmapPreview },
  { title: "BarList", href: "/components/bar-list", Preview: BarListPreview },
  { title: "MetricBreakdown", href: "/components/metric-breakdown", Preview: MetricBreakdownPreview },
  { title: "UptimeBar", href: "/components/uptime-bar", Preview: UptimeBarPreview },
  { title: "ServiceHealthList", href: "/components/service-health-list", Preview: ServiceHealthPreview },
  { title: "BulletChart", href: "/components/bullet-chart", Preview: BulletPreview },
  { title: "ProgressRing", href: "/components/progress-ring", Preview: ProgressRingPreview },
  { title: "ComposedChart", href: "/components/composed-chart", Preview: ComposedPreview },
  { title: "RangeAreaChart", href: "/components/range-area-chart", Preview: RangeAreaPreview },
  { title: "Histogram", href: "/components/histogram", Preview: HistogramPreview },
  { title: "BoxPlot", href: "/components/box-plot", Preview: BoxPlotPreview },
  { title: "WaterfallChart", href: "/components/waterfall-chart", Preview: WaterfallPreview },
  { title: "RadialBarChart", href: "/components/radial-bar-chart", Preview: RadialBarPreview },
  { title: "FunnelChart", href: "/components/funnel-chart", Preview: FunnelPreview },
  { title: "RadarChart", href: "/components/radar-chart", Preview: RadarPreview },
  { title: "Treemap", href: "/components/treemap", Preview: TreemapPreview },
];
