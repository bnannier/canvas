import { ChartPresentationProvider } from "../../../src/charts/shared/chart-presentation";
import { SectionVignette } from "../ui/showcase/section-vignette";
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

/** c-chart: weekly signups as bars beside sessions as two lines. */
function ChartCard() {
  return (
    <ShowcaseCard id="c-chart" split>
      <Column relaxed>
        <Row between cozy>
          <Typography pageLabel mono muted>Bar chart · weekly signups</Typography>
          <Typography pageLabel mono muted>chart-1</Typography>
        </Row>
        <ChartPresentationProvider kind="chart"><Chart plain defaultSelected={SIGNUPS.length - 1} data={SIGNUPS} formatValue={thousands} /></ChartPresentationProvider>
      </Column>
      <Column relaxed>
        <Row between cozy>
          <Column shrink><Typography pageLabel mono muted>Line · sessions vs. last month</Typography></Column>
          <Column shrink><Typography pageLabel mono muted>chart-1 · chart-2</Typography></Column>
        </Row>
        <ChartPresentationProvider kind="line"><LineChart plain fade labels={SESSIONS.labels} series={SESSIONS.series} /></ChartPresentationProvider>
      </Column>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <Column chapter>
      <ShowcaseGrid minTileWidth={300}>
        <GridItem full><ChartCard /></GridItem>
        <ShowcaseCard id="c-area-chart" tinyCaption caption="<AreaChart stacked> · running-sum bands, overlap by default">
          <ChartPresentationProvider kind="area"><AreaChart plain stacked hideAxes labels={PLATFORM_AREA.labels} series={PLATFORM_AREA.series} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-range-area-chart" tinyCaption caption="<RangeAreaChart> · y hugs the data, never anchored at zero">
          <ChartPresentationProvider kind="range" annotation={{ index: 7, lines: ["High 24°", "Mid 18°", "Low 11°"] }}><RangeAreaChart plain defaultSelected={7} label="High · mid · low" labels={TEMPERATURE.labels} data={TEMPERATURE.data} formatValue={(v) => `${Math.round(v / 4.9)}°`} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-composed-chart" tinyCaption caption="series pick a mark with line or area · bars by default">
          <ChartPresentationProvider kind="composed"><ComposedChart plain hideAxes labels={REVENUE_COMPOSED.labels} series={REVENUE_COMPOSED.series} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-sparkline" tinyCaption caption="<Sparkline values={…} success /> · tone booleans, no hand-built bar rows">
          {/* The hand-off's rows: 8 above and below each, the later rows under a hairline. */}
          <Column roomy>
            {SPARKS.map((spark, i) => (
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
        </ShowcaseCard>
        <ShowcaseCard id="c-histogram" tinyCaption caption="<Histogram values={samples}> · bins override the rule">
          <ChartPresentationProvider kind="histogram"><Histogram plain bins={14} defaultSelected={7} label="Response time · ms" values={LATENCY_SAMPLES} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-box-plot" tinyCaption caption="quartiles by interpolation · whiskers at 1.5 IQR · outliers as rings">
          <ChartPresentationProvider kind="box" boxSummaries={BOX_SUMMARIES}><BoxPlot plain defaultSelected={2} data={SCREEN_LOAD} formatValue={(v) => `${Math.round(v)} ms`} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-scatter-plot" tinyCaption caption="<ScatterPlot> · numeric x and y, nice ticks on both">
          <ChartPresentationProvider kind="scatter" annotation={{ index: 9, lines: ["x 4.2 s", "y 312 ms"] }}><ScatterPlot plain defaultSelected={{ series: 0, point: 9 }} series={FRAME_TIME} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-waterfall-chart" tinyCaption caption="steps float by their signed value · a total step snapshots from zero">
          <ChartPresentationProvider kind="waterfall"><WaterfallChart plain steps={QUARTER_BRIDGE} /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-pie-chart" tinyCaption caption="<PieChart donut> · pressing a slice dims the others">
          <PieChart detailed donut label="sessions" slices={SESSIONS_BY_PLATFORM} />
        </ShowcaseCard>
        <ShowcaseCard id="c-treemap" tinyCaption caption="area ∝ value · labels render only where they fit">
          <Treemap partitioned outlined plain data={USAGE_TREEMAP} formatValue={(v) => `${v}%`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-stacked-bar" tinyCaption caption="segments keep chart-1…8 order even when one is zero">
          <Column snug>
            <Row between>
              <Typography caption subtle style={{ lineHeight: 15 }}>Storage · 82.4 of 100 GB</Typography>
              <Typography caption mono medium tabular style={{ lineHeight: 16 }}>82%</Typography>
            </Row>
            <StackedBar tall label="Storage this month" max={100} segments={STORAGE_NOW} hideLegend />
          </Column>
          <Column snug>
            <Row between>
              <Typography caption muted style={{ lineHeight: 15 }}>Last month</Typography>
              <Typography caption mono medium muted tabular style={{ lineHeight: 16 }}>64%</Typography>
            </Row>
            <StackedBar detailed subtle legendSegments={STORAGE_NOW} label="Storage last month" max={100} segments={STORAGE_LAST} />
          </Column>
        </ShowcaseCard>
        <ShowcaseCard id="c-funnel-chart" tinyCaption caption="each trapezoid narrows to the next stage · conversion from the stage above">
          <FunnelChart tapered plain stages={CONVERSION} />
        </ShowcaseCard>
        <ShowcaseCard id="c-gauge" tinyCaption caption={"<Gauge value={72} label=\"…\" /> · tone booleans recolor the arc"}>
          <Row center style={{ marginTop: 6 }}>
            <Gauge large value={72} label="of Q4 adoption goal" />
          </Row>
        </ShowcaseCard>
        <ShowcaseCard id="c-progress-ring" tinyCaption caption="Gauge's sibling · clockwise from 12 · rounded caps">
          <Grid columns={3} minTileWidth={78} snug style={{ paddingVertical: 6 }}>
            <ProgressRing compact stacked value={64} label="Tokens" />
            <ProgressRing compact stacked value={100} success label="Icons" />
            <ProgressRing compact stacked value={28} warning label="Docs" />
          </Grid>
        </ShowcaseCard>
        <ShowcaseCard id="c-radial-bar-chart" tinyCaption caption="every ring sweeps against one max · press a ring to isolate it">
          <RadialBarChart detailed label="Installs" max={80} data={INSTALLS_BY_PLATFORM} formatValue={(v) => `${v}k`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-bullet-chart" tinyCaption caption="<BulletChart ranges={[…]}> · tone follows the target">
          <BulletChart detailed plain data={TARGETS} formatValue={(v) => `${v}%`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-radar-chart" tinyCaption caption="rings at nice fractions · values align to axes by index">
          <RadarChart compact spokes plain axes={SKIN_RADAR.axes} series={SKIN_RADAR.series} max={10} />
        </ShowcaseCard>
        <ShowcaseCard id="c-metric-breakdown">
          <MetricBreakdown detailed
            plain
            hideSparkTag
            chips={METRIC_CHIPS}
            value={INSTALLS.value}
            label={INSTALLS.label}
            rate={INSTALLS.rate}
            rateLabel="vs. Sep"
            rateSuccess
            spark={INSTALLS.spark}
            breakdown={INSTALLS.breakdown}
            formatValue={(v) => `${v}%`}
          />
        </ShowcaseCard>
        <ShowcaseCard id="c-bar-list" tinyCaption caption="labels truncate, values never do · track ∝ value">
          <BarList plain items={TOP_PAGES} formatValue={thousands} />
        </ShowcaseCard>
        <ShowcaseCard id="c-depth-chart">
          <ChartPresentationProvider kind="depth"><DepthChart plain spread="spread 0.12%" bids={ORDER_BOOK.bids} asks={ORDER_BOOK.asks} /></ChartPresentationProvider>
        </ShowcaseCard>
      </ShowcaseGrid>
      <ShowcaseGrid minTileWidth={560}>
        <ShowcaseCard id="c-heatmap" tinyCaption caption="<Heatmap calendar> is the kit's activity calendar · without it, a free cell grid of any density">
          <Row comfortable baseline>
            <Typography headlineValue tabular>{COMMITS.total.toLocaleString("en-US")}</Typography>
            <Typography small subtle style={{ lineHeight: 16.25 }}>commits to bnannier/canvas</Typography>
          </Row>
          <Heatmap detailed calendar label="Commits" values={COMMITS.cells} />
        </ShowcaseCard>
        <ShowcaseCard id="c-candlestick-chart">
          <ChartPresentationProvider kind="candlestick" annotation={{ index: 11, lines: ["O 42,180 · H 42,410", "L 41,960 · C 42,330", "vol 2.8k"] }}><CandlestickChart plain
            defaultSelected={11}
            legendCaption="direction from success / destructive"
            labels={TRADING_DAY.labels}
            candles={TRADING_DAY.candles}
            volume={TRADING_DAY.volume}
            overlays={[{ label: "MA 20", values: TRADING_DAY.ma }]}
            formatValue={(v) => Math.round(v).toLocaleString("en-US")}
          /></ChartPresentationProvider>
        </ShowcaseCard>
        <ShowcaseCard id="c-uptime-bar" tinyCaption caption="<UptimeBar> per-period pills · <ServiceHealthList> status by precedence: down › degraded › operational">
          <UptimeBar detailed label="api.canvas.app" caption="99.94% uptime" startLabel="60 days ago" midLabel="1 incident · 2 degraded days" endLabel="today" periods={API_UPTIME} />
          <ServiceHealthList detailed plain items={SERVICES} />
        </ShowcaseCard>
        <ShowcaseCard id="c-geo-map" tinyCaption caption="<GeoMap zoomable> · geometry pre-projected at build time · crowded places merge and split as you zoom">
          <Row comfortable baseline>
            <Typography headlineValue tabular>18.4k</Typography>
            <Typography small subtle style={{ lineHeight: 16.25 }}>{`sessions in ${CITY_SESSIONS.length} cities, last 24h`}</Typography>
          </Row>
          <GeoMap detailed plain zoomable defaultSelected={BERLIN} points={CITY_SESSIONS} formatValue={(v) => `${v.toLocaleString("en-US")} sessions`} />
        </ShowcaseCard>
      </ShowcaseGrid>
    </Column>
  );
}
