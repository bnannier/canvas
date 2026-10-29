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
  FunnelChart,
  Gauge,
  GeoMap,
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
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";
import {
  API_UPTIME,
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
// live kit chart fed the hand-off's numbers (docs/src/sections/charts.data.ts); where a
// card's drawing carries something the chart has no prop for (a hover readout pinned
// open, a hand-drawn axis caption) the card shows the chart as it renders, and the
// difference is recorded in the Phase 5 report.

/** The weekly-downloads line the vignette draws, the hand-off's points read back. */
const DOWNLOADS = [20, 34, 30, 54, 48, 72, 66, 90, 84, 108, 102];

/** The hero's still frame: the downloads area beside the bars and the donut. */
export function Vignette() {
  return (
    <VignetteStage>
      <Row cozy>
        <Column span={7}>
          <AreaChart compact hideLegend title="Weekly downloads" labels={DOWNLOADS.map((_, i) => `W${i + 1}`)} series={[{ label: "Downloads", values: DOWNLOADS }]} />
        </Column>
        <Column span={5}>
          <Column cozy>
            <Chart compact hideLegend data={[40, 62, 48, 80, 66, 92].map((value, i) => ({ label: `D${i + 1}`, value }))} max={100} />
            <PieChart donut compact hideLegend slices={[{ label: "Ion", value: 96 }, { label: "Mint", value: 56 }, { label: "Rest", value: 37 }]} />
          </Column>
        </Column>
      </Row>
    </VignetteStage>
  );
}

/** c-chart: weekly signups as bars beside sessions as two lines. */
function ChartCard() {
  return (
    <ShowcaseCard id="c-chart" split>
      <Column relaxed>
        <Row between cozy>
          <Typography eyebrow subtle>Bar chart · weekly signups</Typography>
          <Typography eyebrow subtle>chart-1</Typography>
        </Row>
        <Chart plain defaultSelected={SIGNUPS.length - 1} data={SIGNUPS} />
      </Column>
      <Column relaxed>
        <Row between cozy>
          <Column shrink><Typography eyebrow subtle>Line · sessions vs. last month</Typography></Column>
          <Column shrink><Typography eyebrow subtle right>chart-1 · chart-2</Typography></Column>
        </Row>
        <LineChart plain labels={SESSIONS.labels} series={SESSIONS.series} />
      </Column>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <Column chapter>
      <ShowcaseGrid minTileWidth={300}>
        <GridItem full><ChartCard /></GridItem>
        <ShowcaseCard id="c-area-chart" caption="<AreaChart stacked> · running-sum bands, overlap by default">
          <AreaChart plain stacked hideAxes labels={PLATFORM_AREA.labels} series={PLATFORM_AREA.series} />
        </ShowcaseCard>
        <ShowcaseCard id="c-range-area-chart" caption="<RangeAreaChart> · y hugs the data, never anchored at zero">
          <RangeAreaChart plain label="High · mid · low" labels={TEMPERATURE.labels} data={TEMPERATURE.data} formatValue={(v) => `${v}°`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-composed-chart" caption="series pick a mark with line or area · bars by default">
          <ComposedChart plain hideAxes labels={REVENUE_COMPOSED.labels} series={REVENUE_COMPOSED.series} />
        </ShowcaseCard>
        <ShowcaseCard id="c-sparkline" caption="<Sparkline values={…} success /> · tone booleans, no hand-built bar rows">
          {SPARKS.map((spark) => (
            <Row key={spark.label} between alignEnd cozy>
              <Column tight>
                <Typography rowLabel>{spark.label}</Typography>
                <Typography rowValue tabular>{spark.value}</Typography>
              </Column>
              <Sparkline values={[...spark.values]} {...{ [spark.tone]: true }} />
            </Row>
          ))}
        </ShowcaseCard>
        <ShowcaseCard id="c-histogram" caption="<Histogram values={samples}> · bins override the rule">
          <Histogram plain label="Response time · ms" values={LATENCY_SAMPLES} />
        </ShowcaseCard>
        <ShowcaseCard id="c-box-plot" caption="quartiles by interpolation · whiskers at 1.5 IQR · outliers as rings">
          <BoxPlot plain data={SCREEN_LOAD} formatValue={(v) => `${Math.round(v)} ms`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-scatter-plot" caption="<ScatterPlot> · numeric x and y, nice ticks on both">
          <ScatterPlot plain series={FRAME_TIME} />
        </ShowcaseCard>
        <ShowcaseCard id="c-waterfall-chart" caption="steps float by their signed value · a total step snapshots from zero">
          <WaterfallChart plain steps={QUARTER_BRIDGE} />
        </ShowcaseCard>
        <ShowcaseCard id="c-pie-chart" caption="<PieChart donut> · pressing a slice dims the others">
          <PieChart donut label="sessions" slices={SESSIONS_BY_PLATFORM} />
        </ShowcaseCard>
        <ShowcaseCard id="c-treemap" caption="area ∝ value · labels render only where they fit">
          <Treemap plain data={USAGE_TREEMAP} formatValue={(v) => `${v}%`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-stacked-bar" caption="segments keep chart-1…8 order even when one is zero">
          <Column snug>
            <Row between>
              <Typography small medium>Storage · 82.4 of 100 GB</Typography>
              <Typography small mono tabular>82%</Typography>
            </Row>
            <StackedBar track label="Storage this month" segments={STORAGE_NOW} hideLegend />
          </Column>
          <Column snug>
            <Row between>
              <Typography small muted>Last month</Typography>
              <Typography small mono muted tabular>64%</Typography>
            </Row>
            <StackedBar track label="Storage last month" segments={STORAGE_LAST} />
          </Column>
        </ShowcaseCard>
        <ShowcaseCard id="c-funnel-chart" caption="each trapezoid narrows to the next stage · conversion from the stage above">
          <FunnelChart plain stages={CONVERSION} />
        </ShowcaseCard>
        <ShowcaseCard id="c-gauge" caption={"<Gauge value={72} label=\"…\" /> · tone booleans recolor the arc"}>
          <Gauge value={72} label="of Q4 adoption goal" />
        </ShowcaseCard>
        <ShowcaseCard id="c-progress-ring" caption="Gauge's sibling · clockwise from 12 · rounded caps">
          <Row around wrap cozy>
            <ProgressRing compact value={64} label="Tokens" />
            <ProgressRing compact value={100} success label="Icons" />
            <ProgressRing compact value={28} warning label="Docs" />
          </Row>
        </ShowcaseCard>
        <ShowcaseCard id="c-radial-bar-chart" caption="every ring sweeps against one max · press a ring to isolate it">
          <RadialBarChart label="Installs" max={80} data={INSTALLS_BY_PLATFORM} formatValue={(v) => `${v}k`} />
        </ShowcaseCard>
        <ShowcaseCard id="c-bullet-chart" caption="<BulletChart ranges={[…]}> · tone follows the target">
          <BulletChart plain data={TARGETS} />
        </ShowcaseCard>
        <ShowcaseCard id="c-radar-chart" caption="rings at nice fractions · values align to axes by index">
          <RadarChart plain axes={SKIN_RADAR.axes} series={SKIN_RADAR.series} max={10} />
        </ShowcaseCard>
        <ShowcaseCard id="c-metric-breakdown" caption="October · USD · net of refunds">
          <MetricBreakdown
            plain
            value={INSTALLS.value}
            label={INSTALLS.label}
            rate={INSTALLS.rate}
            rateSuccess
            spark={INSTALLS.spark}
            breakdown={INSTALLS.breakdown}
            formatValue={(v) => `${v}%`}
          />
        </ShowcaseCard>
        <ShowcaseCard id="c-bar-list" caption="labels truncate, values never do · track ∝ value">
          <BarList plain items={TOP_PAGES} />
        </ShowcaseCard>
        <ShowcaseCard id="c-depth-chart" caption="spread 0.12%">
          <DepthChart plain bids={ORDER_BOOK.bids} asks={ORDER_BOOK.asks} />
        </ShowcaseCard>
      </ShowcaseGrid>
      <ShowcaseGrid minTileWidth={560}>
        <ShowcaseCard id="c-heatmap" caption="<Heatmap calendar> is the kit's activity calendar · without it, a free cell grid of any density">
          <Row snug baseline>
            <Typography headlineValue tabular>{COMMITS.total.toLocaleString("en-US")}</Typography>
            <Typography small muted>commits to bnannier/canvas</Typography>
          </Row>
          <Heatmap calendar label="Commits" values={COMMITS.cells} />
        </ShowcaseCard>
        <ShowcaseCard id="c-candlestick-chart" caption="direction from success / destructive · MA 20 as an overlay series">
          <CandlestickChart plain
            labels={TRADING_DAY.labels}
            candles={TRADING_DAY.candles}
            volume={TRADING_DAY.volume}
            overlays={[{ label: "MA 20", values: TRADING_DAY.ma }]}
            formatValue={(v) => Math.round(v).toLocaleString("en-US")}
          />
        </ShowcaseCard>
        <ShowcaseCard id="c-uptime-bar" caption="<UptimeBar> per-period pills · <ServiceHealthList> status by precedence: down › degraded › operational">
          <UptimeBar label="api.canvas.app" caption="99.94% uptime" startLabel="60 days ago" endLabel="today" periods={API_UPTIME} />
          <ServiceHealthList plain items={SERVICES} />
        </ShowcaseCard>
        <ShowcaseCard id="c-geo-map" caption="<GeoMap zoomable> · geometry pre-projected at build time · crowded places merge and split as you zoom">
          <Row comfortable baseline>
            <Typography headlineValue tabular>18.4k</Typography>
            <Typography small subtle>{`sessions in ${CITY_SESSIONS.length} cities, last 24h`}</Typography>
          </Row>
          <GeoMap plain zoomable points={CITY_SESSIONS} formatValue={(v) => `${v.toLocaleString("en-US")} sessions`} />
        </ShowcaseCard>
      </ShowcaseGrid>
    </Column>
  );
}
