import { ChartPresentationProvider } from "../../../src/charts/shared/chart-presentation";
import { SectionVignette } from "../ui/showcase/section-vignette";
import { useShowcaseDemo } from "../ui/showcase/demo";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  AreaChart,
  BarList,
  BoxPlot,
  BulletChart,
  CandlestickChart,
  Chart,
  Column,
  ComposedChart,
  DepthChart,
  Divider,
  FunnelChart,
  Gauge,
  GeoMap,
  Grid,
  GridItem,
  Heatmap,
  Histogram,
  LineChart,
  MetricBreakdown,
  PieChart,
  ProgressRing,
  RadarChart,
  RadialBarChart,
  RangeAreaChart,
  Row,
  ScatterPlot,
  ServiceHealthList,
  Sparkline,
  StackedBar,
  Treemap,
  Typography,
  UptimeBar,
  WaterfallChart,
  type ScatterSelection,
} from "@nannier/canvas";
import { ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import {
  API_UPTIME,
  BOX_SUMMARIES,
  CITY_SESSIONS,
  COMMITS,
  CONVERSION,
  FRAME_TIME,
  INSTALLS,
  INSTALLS_BY_PLATFORM,
  LATENCY_SAMPLES,
  ORDER_BOOK,
  PLATFORM_AREA,
  QUARTER_BRIDGE,
  REVENUE_COMPOSED,
  SCREEN_LOAD,
  SERVICES,
  SESSIONS,
  SESSIONS_BY_PLATFORM,
  SIGNUPS,
  SKIN_RADAR,
  SPARKS,
  STORAGE_LAST,
  STORAGE_NOW,
  TARGETS,
  TEMPERATURE,
  TOP_PAGES,
  TRADING_DAY,
  USAGE_TREEMAP,
} from "./charts.data";

// The Charts section page (`Canvas v4.0.0 Charts.dc.html`): its hero vignette, the
// full-width bar and line card, one card per chart in the hand-off's order on the 300 px
// grid, then Heatmap, Candlestick, Uptime and GeoMap on the 560 px grid. Every mark is a
// live kit chart fed the hand-off's numbers (docs/src/sections/charts.data.ts). The
// internal presentation provider keeps the section's authored plot geometry while the
// same chart components retain their interactive and accessible behavior.

/** The animated hero: the downloads area beside the bars and the donut. */
export function Vignette() {
  return <SectionVignette kind="charts" />;
}

/** Whole numbers with thousands separators, as the hand-off's renderers print them. */
const thousands = (v: number) => v.toLocaleString("en-US");

/** c-metric-breakdown's meta pills (the hand-off's chip row in place of a foot caption). */
const METRIC_CHIPS = [{ label: "October" }, { label: "USD" }, { label: "net of refunds" }];

/** c-geo-map's pinned city. */
const BERLIN = CITY_SESSIONS.findIndex((c) => c.label === "Berlin");

interface ChartDemoProps<T> {
  id: string;
  caption?: string;
  tinyCaption?: boolean;
  split?: boolean;
  frames: readonly T[];
  interval?: number;
  children: (value: T, setValue: Dispatch<SetStateAction<T>>, stop: () => void) => ReactNode;
}

/** Let each plot advance independently and confine its renders to its own card. */
function ChartDemo<T>({ id, caption, tinyCaption, split, frames, interval, children }: ChartDemoProps<T>) {
  const { value, setValue, stop } = useShowcaseDemo(id, frames, { interval });
  return <ShowcaseCard id={id} caption={caption} tinyCaption={tinyCaption} split={split}>{children(value, setValue, stop)}</ShowcaseCard>;
}

const TRAFFIC_FRAMES: Array<{ signup: number | null; session: number | null }> = [
  { signup: 11, session: null },
  { signup: 3, session: 3 },
  { signup: 5, session: 5 },
  { signup: 7, session: 7 },
  { signup: 9, session: 9 },
  { signup: 11, session: 10 },
];

const SELECTIONS = {
  area: [null, 3, 5, 7, 9, 10],
  range: [7, 3, 5, 8, 10],
  composed: [null, 1, 3, 5, 7],
  histogram: [7, 3, 5, 8, 10],
  box: [2, 0, 1, 3, 4],
  waterfall: [null, 1, 2, 3, 4, 5],
  pie: [null, 0, 1, 2, 3],
  treemap: [null, 0, 1, 2, 3],
  funnel: [null, 0, 1, 2, 3],
  radial: [null, 0, 1, 2],
  candles: [11, 4, 7, 10, 13],
  map: [BERLIN, 1, 2, 5, 0],
} satisfies Record<string, Array<number | null>>;

const SCATTER_FRAMES: Array<ScatterSelection | null> = [
  { series: 0, point: 9 },
  { series: 1, point: 3 },
  { series: 0, point: 5 },
  { series: 1, point: 8 },
  { series: 0, point: 11 },
];

const SPARK_FRAMES = [
  SPARKS,
  [
    { ...SPARKS[0], value: "1,268", values: [42, 38, 50, 46, 58, 52, 64, 60, 72, 78, 92, 104] },
    { ...SPARKS[1], value: "99.96%", values: [99.6, 99.4, 99.9, 99.7, 99.8, 100, 99.9, 99.5, 100, 99.9, 100, 100] },
    { ...SPARKS[2], value: "336", values: [24, 22, 30, 28, 26, 40, 38, 52, 48, 66, 84, 96] },
  ],
  [
    { ...SPARKS[0], value: "1,331", values: [38, 50, 46, 58, 52, 64, 60, 72, 78, 92, 104, 110] },
    { ...SPARKS[1], value: "99.90%", values: [99.4, 99.9, 99.7, 99.8, 100, 99.9, 99.5, 100, 99.9, 100, 100, 99.2] },
    { ...SPARKS[2], value: "364", values: [22, 30, 28, 26, 40, 38, 52, 48, 66, 84, 96, 110] },
  ],
];

function withValues<T extends { value: number }>(data: readonly T[], values: readonly number[]) {
  return data.map((entry, index) => ({ ...entry, value: values[index] ?? entry.value }));
}

const STORAGE_FRAMES = [
  { used: "82.4", percent: 82, segments: STORAGE_NOW },
  { used: "88.0", percent: 88, segments: withValues(STORAGE_NOW, [42, 23, 15, 8]) },
  { used: "94.0", percent: 94, segments: withValues(STORAGE_NOW, [46, 24, 16, 8]) },
  { used: "76.0", percent: 76, segments: withValues(STORAGE_NOW, [30, 23, 15, 8]) },
];

const GAUGE_FRAMES = [72, 77, 83, 90, 96, 100];
const RING_FRAMES = [
  { tokens: 64, icons: 100, docs: 28 },
  { tokens: 76, icons: 100, docs: 41 },
  { tokens: 89, icons: 100, docs: 68 },
  { tokens: 100, icons: 100, docs: 91 },
  { tokens: 100, icons: 100, docs: 100 },
];

const BULLET_FRAMES = [
  TARGETS,
  withValues(TARGETS, [79, 93, 51]),
  withValues(TARGETS, [86, 94, 57]),
  withValues(TARGETS, [91, 96, 62]),
];

const RADAR_FRAMES = [
  SKIN_RADAR.series,
  [{ ...SKIN_RADAR.series[0]!, values: [9, 7.5, 8.5, 6.5, 8, 6.5] }, SKIN_RADAR.series[1]!],
  [{ ...SKIN_RADAR.series[0]!, values: [9.5, 8, 9, 7.5, 9, 8] }, SKIN_RADAR.series[1]!],
];

const INSTALL_FRAMES = [
  INSTALLS,
  { ...INSTALLS, value: "49.1k", rate: "+14.5%", spark: [...INSTALLS.spark.slice(1), 98], breakdown: withValues(INSTALLS.breakdown, [53, 32, 15]) },
  { ...INSTALLS, value: "50.3k", rate: "+17.3%", spark: [...INSTALLS.spark.slice(2), 98, 110], breakdown: withValues(INSTALLS.breakdown, [51, 33, 16]) },
];

const PAGE_FRAMES = [
  TOP_PAGES,
  withValues(TOP_PAGES, [4910, 3400, 2670, 1560, 1110]),
  withValues(TOP_PAGES, [5240, 3580, 3310, 1930, 1280]),
  withValues(TOP_PAGES, [5400, 3850, 3820, 2200, 1450]),
];

const BOOK_FRAMES = [
  ORDER_BOOK,
  {
    bids: ORDER_BOOK.bids.map((level, i) => ({ ...level, size: level.size + [0, 4, 8, 3, 9, 18][i]! })),
    asks: ORDER_BOOK.asks.map((level, i) => ({ ...level, size: level.size - [12, 7, 4, 1, 0, 0][i]! })),
  },
  {
    bids: ORDER_BOOK.bids.map((level, i) => ({ ...level, size: level.size - [4, 3, 0, 4, 6, 14][i]! })),
    asks: ORDER_BOOK.asks.map((level, i) => ({ ...level, size: level.size + [16, 8, 2, 5, 1, 0][i]! })),
  },
];

const COMMIT_FRAMES = [COMMITS, ...[1, 2, 3, 4].map((step) => {
  let total = COMMITS.total;
  const cells = COMMITS.cells.map((cell, i) => {
    if (i < COMMITS.cells.length - step * 2) return cell;
    const added = i % 3 + 3;
    const count = cell.count + added;
    total += added;
    return { ...cell, count, value: count < 3 ? 0.25 : count < 6 ? 0.5 : count < 9 ? 0.75 : 1 };
  });
  return { total, cells };
})];

const UPTIME_FRAMES = [
  { uptime: API_UPTIME, caption: "99.94% uptime", summary: "1 incident · 2 degraded days", services: SERVICES },
  {
    uptime: [...API_UPTIME.slice(0, -1), { degraded: true }],
    caption: "99.91% uptime",
    summary: "1 incident · 3 degraded days",
    services: SERVICES.map((service, i) => i === 0
      ? { ...service, degraded: true, detail: "99.89%", periods: [...service.periods.slice(0, -1), { degraded: true }] }
      : service),
  },
  {
    uptime: [...API_UPTIME.slice(0, -1), { degraded: true }],
    caption: "99.91% uptime",
    summary: "1 incident · 3 degraded days",
    services: SERVICES.map((service, i) => i === 3
      ? { ...service, down: false, degraded: true, detail: "96.40%", periods: [...service.periods.slice(0, -1), { degraded: true }] }
      : service),
  },
];

/** c-chart: weekly signups as bars beside sessions as two lines. */
function ChartCard() {
  return (
    <ChartDemo id="c-chart" split frames={TRAFFIC_FRAMES}>
      {(value, setValue) => [
        <Column key="signups" relaxed>
          <Row between cozy>
            <Typography pageLabel mono muted>Bar chart · weekly signups</Typography>
            <Typography pageLabel mono muted>chart-1</Typography>
          </Row>
          <ChartPresentationProvider kind="chart">
            <Chart
              plain
              selected={value.signup}
              onSelect={(signup) => setValue((current) => ({ ...current, signup }))}
              data={SIGNUPS}
              formatValue={thousands}
              testID="section-demo-signups"
            />
          </ChartPresentationProvider>
        </Column>,
        <Column key="sessions" relaxed>
          <Row between cozy>
            <Column shrink><Typography pageLabel mono muted>Line · sessions vs. last month</Typography></Column>
            <Column shrink><Typography pageLabel mono muted>chart-1 · chart-2</Typography></Column>
          </Row>
          <ChartPresentationProvider kind="line">
            <LineChart
              plain fade
              selected={value.session}
              onSelect={(session) => setValue((current) => ({ ...current, session }))}
              labels={SESSIONS.labels}
              series={SESSIONS.series}
              testID="section-demo-sessions"
            />
          </ChartPresentationProvider>
        </Column>,
      ]}
    </ChartDemo>
  );
}

export function Cards() {
  return (
    <Column chapter>
      <ShowcaseGrid minTileWidth={300}>
        <GridItem full><ChartCard /></GridItem>
        <ChartDemo<number | null> id="c-area-chart" frames={SELECTIONS.area} tinyCaption caption="<AreaChart stacked> · running-sum bands, overlap by default">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="area"><AreaChart selected={selected} onSelect={onSelect} testID="section-demo-area-chart" plain stacked hideAxes labels={PLATFORM_AREA.labels} series={PLATFORM_AREA.series} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-range-area-chart" frames={SELECTIONS.range} tinyCaption caption="<RangeAreaChart> · y hugs the data, never anchored at zero">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="range" annotation={{ index: 7, lines: ["High 24°", "Mid 18°", "Low 11°"] }}><RangeAreaChart plain selected={selected} onSelect={onSelect} testID="section-demo-range-area-chart" label="High · mid · low" labels={TEMPERATURE.labels} data={TEMPERATURE.data} formatValue={(v) => `${Math.round(v / 4.9)}°`} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-composed-chart" frames={SELECTIONS.composed} tinyCaption caption="series pick a mark with line or area · bars by default">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="composed"><ComposedChart selected={selected} onSelect={onSelect} testID="section-demo-composed-chart" plain hideAxes labels={REVENUE_COMPOSED.labels} series={REVENUE_COMPOSED.series} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo id="c-sparkline" frames={SPARK_FRAMES} tinyCaption caption="<Sparkline values={…} success /> · tone booleans, no hand-built bar rows">
          {(value) => (
            <>
              {/* The hand-off's rows: 8 above and below each, the later rows under a hairline. */}
              <Column roomy>
                {value.map((spark, i) => (
                  <Column key={spark.label} flush>
                    {i > 0 ? <Divider /> : null}
                    <Row between alignEnd cozy style={{ paddingVertical: 8 }}>
                      <Column compact>
                        <Typography rowLabel mono muted>{spark.label}</Typography>
                        <Typography rowValue tabular>{spark.value}</Typography>
                      </Column>
                      <Column style={{ width: "46%" }}><Sparkline tall values={[...spark.values]} {...{ [spark.tone]: true }} /></Column>
                    </Row>
                  </Column>
                ))}
              </Column>
            </>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-histogram" frames={SELECTIONS.histogram} tinyCaption caption="<Histogram values={samples}> · bins override the rule">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="histogram"><Histogram plain bins={14} selected={selected} onSelect={onSelect} testID="section-demo-histogram" label="Response time · ms" values={LATENCY_SAMPLES} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-box-plot" frames={SELECTIONS.box} tinyCaption caption="quartiles by interpolation · whiskers at 1.5 IQR · outliers as rings">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="box" boxSummaries={BOX_SUMMARIES}><BoxPlot plain selected={selected} onSelect={onSelect} testID="section-demo-box-plot" data={SCREEN_LOAD} formatValue={(v) => `${Math.round(v)} ms`} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<ScatterSelection | null> id="c-scatter-plot" frames={SCATTER_FRAMES} tinyCaption caption="<ScatterPlot> · numeric x and y, nice ticks on both">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="scatter" annotation={{ index: 9, lines: ["x 4.2 s", "y 312 ms"] }}><ScatterPlot plain selected={selected} onSelect={onSelect} testID="section-demo-scatter-plot" series={FRAME_TIME} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-waterfall-chart" frames={SELECTIONS.waterfall} tinyCaption caption="steps float by their signed value · a total step snapshots from zero">
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="waterfall"><WaterfallChart selected={selected} onSelect={onSelect} testID="section-demo-waterfall-chart" plain steps={QUARTER_BRIDGE} /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-pie-chart" frames={SELECTIONS.pie} tinyCaption caption="<PieChart donut> · pressing a slice dims the others">
          {(selected, onSelect) => (
            <PieChart selected={selected} onSelect={onSelect} testID="section-demo-pie-chart" detailed donut label="sessions" slices={SESSIONS_BY_PLATFORM} />
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-treemap" frames={SELECTIONS.treemap} tinyCaption caption="area ∝ value · labels render only where they fit">
          {(selected, onSelect) => (
            <Treemap selected={selected} onSelect={onSelect} testID="section-demo-treemap" partitioned outlined plain data={USAGE_TREEMAP} formatValue={(v) => `${v}%`} />
          )}
        </ChartDemo>
        <ChartDemo id="c-stacked-bar" frames={STORAGE_FRAMES} tinyCaption caption="segments keep chart-1…8 order even when one is zero">
          {(value) => (
            <>
              <Column snug>
                <Row between>
                  <Typography caption subtle style={{ lineHeight: 15 }}>{`Storage · ${value.used} of 100 GB`}</Typography>
                  <Typography caption mono medium tabular style={{ lineHeight: 16 }}>{value.percent}%</Typography>
                </Row>
                <StackedBar testID="section-demo-stacked-bar" tall label="Storage this month" max={100} segments={value.segments} hideLegend />
              </Column>
              <Column snug>
                <Row between>
                  <Typography caption muted style={{ lineHeight: 15 }}>Last month</Typography>
                  <Typography caption mono medium muted tabular style={{ lineHeight: 16 }}>64%</Typography>
                </Row>
                <StackedBar detailed subtle legendSegments={STORAGE_NOW} label="Storage last month" max={100} segments={STORAGE_LAST} />
              </Column>
            </>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-funnel-chart" frames={SELECTIONS.funnel} interval={2400} tinyCaption caption="each trapezoid narrows to the next stage · conversion from the stage above">
          {(selected, onSelect) => (
            <FunnelChart selected={selected} onSelect={onSelect} testID="section-demo-funnel-chart" tapered plain stages={CONVERSION} />
          )}
        </ChartDemo>
        <ChartDemo id="c-gauge" frames={GAUGE_FRAMES} tinyCaption caption={"<Gauge value={72} label=\"…\" /> · tone booleans recolor the arc"}>
          {(value) => (
            <Row center style={{ marginTop: 6 }}>
              <Gauge testID="section-demo-gauge" large value={value} label="of Q4 adoption goal" />
            </Row>
          )}
        </ChartDemo>
        <ChartDemo id="c-progress-ring" frames={RING_FRAMES} tinyCaption caption="Gauge's sibling · clockwise from 12 · rounded caps">
          {(value) => (
            <Grid columns={3} minTileWidth={78} snug style={{ paddingVertical: 6 }}>
              <ProgressRing compact stacked value={value.tokens} label="Tokens" />
              <ProgressRing compact stacked value={value.icons} success label="Icons" />
              <ProgressRing compact stacked value={value.docs} warning label="Docs" />
            </Grid>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-radial-bar-chart" frames={SELECTIONS.radial} tinyCaption caption="every ring sweeps against one max · press a ring to isolate it">
          {(selected, onSelect) => (
            <RadialBarChart selected={selected} onSelect={onSelect} testID="section-demo-radial-bar-chart" detailed label="Installs" max={80} data={INSTALLS_BY_PLATFORM} formatValue={(v) => `${v}k`} />
          )}
        </ChartDemo>
        <ChartDemo id="c-bullet-chart" frames={BULLET_FRAMES} tinyCaption caption="<BulletChart ranges={[…]}> · tone follows the target">
          {(value) => (
            <BulletChart testID="section-demo-bullet-chart" detailed plain data={value} formatValue={(v) => `${v}%`} />
          )}
        </ChartDemo>
        <ChartDemo id="c-radar-chart" frames={RADAR_FRAMES} interval={2400} tinyCaption caption="rings at nice fractions · values align to axes by index">
          {(value) => (
            <RadarChart testID="section-demo-radar-chart" compact spokes plain axes={SKIN_RADAR.axes} series={value} max={10} />
          )}
        </ChartDemo>
        <ChartDemo id="c-metric-breakdown" frames={INSTALL_FRAMES}>
          {(value) => (
            <MetricBreakdown testID="section-demo-metric-breakdown" detailed
              plain
              hideSparkTag
              chips={METRIC_CHIPS}
              value={value.value}
              label={INSTALLS.label}
              rate={value.rate}
              rateLabel="vs. Sep"
              rateSuccess
              spark={value.spark}
              breakdown={value.breakdown}
              formatValue={(v) => `${v}%`}
            />
          )}
        </ChartDemo>
        <ChartDemo id="c-bar-list" frames={PAGE_FRAMES} tinyCaption caption="labels truncate, values never do · track ∝ value">
          {(value) => (
            <BarList testID="section-demo-bar-list" plain items={value} formatValue={thousands} />
          )}
        </ChartDemo>
        <ChartDemo id="c-depth-chart" frames={BOOK_FRAMES}>
          {(value) => (
            <ChartPresentationProvider kind="depth"><DepthChart testID="section-demo-depth-chart" plain spread="spread 0.12%" bids={value.bids} asks={value.asks} /></ChartPresentationProvider>
          )}
        </ChartDemo>
      </ShowcaseGrid>
      <ShowcaseGrid minTileWidth={560}>
        <ChartDemo id="c-heatmap" frames={COMMIT_FRAMES} interval={2400} tinyCaption caption="<Heatmap calendar> is the kit's activity calendar · without it, a free cell grid of any density">
          {(value) => (
            <>
              <Row comfortable baseline>
                <Typography headlineValue tabular>{thousands(value.total)}</Typography>
                <Typography small subtle style={{ lineHeight: 16.25 }}>commits to bnannier/canvas</Typography>
              </Row>
              <Heatmap testID="section-demo-heatmap" detailed calendar label="Commits" values={value.cells} />
            </>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-candlestick-chart" frames={SELECTIONS.candles}>
          {(selected, onSelect) => (
            <ChartPresentationProvider kind="candlestick" annotation={{ index: 11, lines: ["O 42,180 · H 42,410", "L 41,960 · C 42,330", "vol 2.8k"] }}><CandlestickChart plain
              selected={selected} onSelect={onSelect} testID="section-demo-candlestick-chart"
              legendCaption="direction from success / destructive"
              labels={TRADING_DAY.labels}
              candles={TRADING_DAY.candles}
              volume={TRADING_DAY.volume}
              overlays={[{ label: "MA 20", values: TRADING_DAY.ma }]}
              formatValue={(v) => Math.round(v).toLocaleString("en-US")}
            /></ChartPresentationProvider>
          )}
        </ChartDemo>
        <ChartDemo id="c-uptime-bar" frames={UPTIME_FRAMES} interval={2400} tinyCaption caption="<UptimeBar> per-period pills · <ServiceHealthList> status by precedence: down › degraded › operational">
          {(value) => (
            <>
              <UptimeBar testID="section-demo-uptime-bar" detailed label="api.canvas.app" caption={value.caption} startLabel="60 days ago" midLabel={value.summary} endLabel="today" periods={value.uptime} />
              <ServiceHealthList detailed plain items={value.services} />
            </>
          )}
        </ChartDemo>
        <ChartDemo<number | null> id="c-geo-map" frames={SELECTIONS.map} interval={2400} tinyCaption caption="<GeoMap zoomable> · geometry pre-projected at build time · crowded places merge and split as you zoom">
          {(selected, onSelect, stop) => (
            <>
              <Row comfortable baseline>
                <Typography headlineValue tabular>18.4k</Typography>
                <Typography small subtle style={{ lineHeight: 16.25 }}>{`sessions in ${CITY_SESSIONS.length} cities, last 24h`}</Typography>
              </Row>
              <GeoMap detailed plain zoomable onZoomChange={stop} selected={selected} onSelect={onSelect} testID="section-demo-geo-map" points={CITY_SESSIONS} formatValue={(v) => `${v.toLocaleString("en-US")} sessions`} />
            </>
          )}
        </ChartDemo>
      </ShowcaseGrid>
    </Column>
  );
}
