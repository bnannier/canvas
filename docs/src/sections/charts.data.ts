import { PLATFORM_COPY } from "../data/platform-copy";
// The Charts section page's sample data, read off the hand-off's own drawings
// (`Canvas v4.0.0 Charts.dc.html`: each card's SVG geometry and its script's SPARKS, HEAT,
// UPT, SVC and GEO tables) and handed to the kit charts as data. Plain data with no React
// import; docs/src/sections/charts.tsx renders it.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const months = (count: number) => MONTHS.slice(0, count) as unknown as string[];

/** A drawn polyline's heights above its baseline: the hand-off's `y` read back to a value. */
const above = (base: number, ys: readonly number[]) => ys.map((y) => base - y);

// c-chart: twelve weekly-signup bars (heights as a share of the peak, 1,204) and the
// sessions lines (this month over last).
const BAR_SHARE = [34, 52, 41, 66, 58, 74, 63, 88, 71, 95, 82, 100];
export const SIGNUPS = BAR_SHARE.map((share, i) => ({ label: "JFMAMJJASOND"[i]!, value: Math.round((share / 100) * 1204) }));
export const SESSIONS = {
  labels: months(11),
  series: [
    { label: "This month", values: above(180, [130, 118, 110, 92, 98, 72, 66, 48, 44, 30, 22]) },
    { label: "Last month", values: above(180, [120, 112, 124, 100, 108, 90, 96, 70, 78, 52, 60]) },
  ],
};

// c-area-chart: the three stacked bands, each band's own thickness.
const AREA_IOS = [110, 106, 108, 100, 96, 98, 90, 84, 86, 80, 74];
const AREA_ANDROID = [90, 84, 82, 76, 68, 66, 60, 50, 48, 44, 34];
const AREA_WEB = [76, 68, 67, 58, 48, 47, 38, 26, 25, 18, 6];
export const PLATFORM_AREA = {
  labels: months(11),
  series: [
    { label: "iOS", values: above(140, AREA_IOS) },
    { label: PLATFORM_COPY.samplePlatform, values: AREA_IOS.map((y, i) => y - AREA_ANDROID[i]!) },
    { label: "Web", values: AREA_ANDROID.map((y, i) => y - AREA_WEB[i]!) },
  ],
};

// c-range-area-chart: the year's daily high, mid and low temperature, in degrees.
const RANGE_HIGH = [40, 36, 42, 30, 26, 34, 28, 20, 24, 18, 22, 16];
const RANGE_MID = [65, 61, 68, 55, 51, 59, 53, 45, 48, 42, 46, 40];
const RANGE_LOW = [90, 86, 94, 80, 76, 84, 78, 70, 72, 66, 70, 64];
const degrees = (y: number) => 140 - y;
export const TEMPERATURE = {
  labels: [...MONTHS],
  data: RANGE_HIGH.map((y, i) => ({ high: degrees(y), mid: degrees(RANGE_MID[i]!), low: degrees(RANGE_LOW[i]!) })),
};

// c-composed-chart: revenue bars, a target line and last year's area.
export const REVENUE_COMPOSED = {
  labels: months(8),
  series: [
    { label: "Revenue", values: [60, 72, 58, 84, 90, 76, 98, 110] },
    { label: "Target", values: above(140, [70, 66, 62, 58, 54, 50, 46, 42]), line: true, dashed: true },
    { label: "Last year", values: above(140, [100, 90, 96, 84, 80, 82, 76, 70]), area: true },
  ],
};

/** c-sparkline: the three rows (the hand-off's SPARKS). */
export const SPARKS = [
  { label: "Signups", value: "1,204", values: [30, 42, 38, 50, 46, 58, 52, 64, 60, 72, 78, 92], tone: "primary" },
  { label: "Uptime", value: "99.94%", values: [99.2, 99.6, 99.4, 99.9, 99.7, 99.8, 100, 99.9, 99.5, 100, 99.9, 100], tone: "success" },
  { label: "Errors", value: "312", values: [20, 24, 22, 30, 28, 26, 40, 38, 52, 48, 66, 84], tone: "destructive" },
] as const;

/**
 * c-histogram: response-time samples between 110 and 250 ms, as many in each 10 ms bin as
 * the hand-off's bars are tall (180-190 ms holds the most).
 */
const BIN_HEIGHTS = [6.4, 12.8, 22.4, 38.4, 60.8, 89.6, 112, 121.6, 108.8, 83.2, 57.6, 35.2, 19.2, 9.6];
export const LATENCY_SAMPLES = BIN_HEIGHTS.flatMap((h, bin) =>
  Array.from({ length: Math.round(h / 1.6) }, (_, k) => 110 + bin * 10 + ((k * 7) % 10)),
);

/** c-box-plot: screen load times, five screens, Inbox the slowest. */
export const SCREEN_LOAD = [
  { label: "Home", values: [80, 92, 98, 104, 110, 120, 130, 150] },
  { label: "Search", values: [56, 72, 80, 86, 92, 100, 108, 30] },
  { label: "Inbox", values: [118, 126, 134, 140, 150, 160, 166, 176] },
  { label: "Profile", values: [52, 66, 72, 78, 84, 92, 100] },
  { label: "Settings", values: [64, 80, 86, 92, 98, 106, 114, 30] },
];

/** Authored box summaries in plot units; the prototype's whiskers are illustrative. */
export const BOX_SUMMARIES = [
  [30, 50, 62, 76, 100, 16], [44, 60, 70, 82, 104, 116],
  [24, 40, 52, 64, 86, 12], [50, 66, 74, 86, 110], [36, 54, 66, 78, 96, 116],
].map(([high, q3, median, q1, low, outlier]) => ({
  min: 150 - low!, q1: 150 - q1!, median: 150 - median!,
  q3: 150 - q3!, max: 150 - high!, outliers: outlier == null ? [] : [150 - outlier],
}));

/** c-scatter-plot: frame time against load, glass on and solid. */
export const FRAME_TIME = [
  { label: "Glass on", points: [[30, 110], [45, 98], [60, 104], [72, 88], [90, 84], [104, 70], [118, 76], [132, 62], [150, 58], [166, 48], [180, 52], [196, 38], [214, 34], [232, 26]].map(([x, y]) => ({ x: x! / 40, y: (150 - y!) * 3 })) },
  { label: "Solid", points: [[40, 124], [58, 118], [76, 120], [94, 108], [110, 112], [128, 100], [146, 96], [162, 90], [180, 92], [198, 80], [216, 82], [234, 70], [252, 66]].map(([x, y]) => ({ x: x! / 40, y: (150 - y!) * 3 })) },
];

/** c-waterfall-chart: Q1 to Q2, the hand-off's steps. */
export const QUARTER_BRIDGE = [
  { label: "Q1", value: 120, total: true },
  { label: "New", value: 40 },
  { label: "Churn", value: -25 },
  { label: "Expand", value: 30 },
  { label: "Refund", value: -15 },
  { label: "Q2", total: true },
];

/** c-pie-chart: 24.8k sessions by platform (42, 28, 18 and 12%). */
export const SESSIONS_BY_PLATFORM = [
  { label: "iOS", value: 10416 },
  { label: PLATFORM_COPY.samplePlatform, value: 6944 },
  { label: "Web", value: 4464 },
  { label: "Desktop", value: 2976 },
];

/** c-treemap: usage by platform. */
export const USAGE_TREEMAP = [
  { label: "Web", value: 42 },
  { label: "iOS", value: 28 },
  { label: PLATFORM_COPY.samplePlatform, value: 18 },
  { label: "Desktop", value: 7 },
  { label: "CLI", value: 3 },
  { label: "Other", value: 2 },
];

/** c-stacked-bar: storage by kind, this month and last. */
export const STORAGE_NOW = [
  { label: "Media", value: 38 },
  { label: "Docs", value: 22 },
  { label: "Code", value: 14 },
  { label: "Other", value: 8 },
];
export const STORAGE_LAST = [
  { label: "Media", value: 30 },
  { label: "Docs", value: 18 },
  { label: "Code", value: 11 },
  { label: "Other", value: 5 },
];

/** c-funnel-chart: visit to paid. */
export const CONVERSION = [
  { label: "Visited", value: 12400 },
  { label: "Signed up", value: 7900 },
  { label: "Activated", value: 4980 },
  { label: "Paid", value: 2610 },
];

/** c-radial-bar-chart: installs by platform against an 80k goal. */
export const INSTALLS_BY_PLATFORM = [
  { label: "iOS", value: 64 },
  { label: PLATFORM_COPY.samplePlatform, value: 41 },
  { label: "Web", value: 23 },
];

/** c-bullet-chart: three measures against their targets. */
export const TARGETS = [
  { label: "Revenue", value: 72, target: 85, ranges: [50, 80, 100] },
  { label: "Retention", value: 91, target: 88, ranges: [60, 85, 100], success: true },
  { label: "NPS", value: 48, target: 60, ranges: [40, 70, 100], warning: true, formatValue: String },
];

/** c-radar-chart: v4 against the v1 skin on six axes (the hand-off's polygons, out of 10). */
export const SKIN_RADAR = {
  axes: ["Speed", "Contrast", "Motion", "Density", "Reach", "A11y"],
  series: [
    { label: "Canvas v4.0.0", values: [9, 7, 8, 6, 7.5, 5] },
    { label: "v1 skin", values: [6, 8.5, 5, 8, 4.5, 7] },
  ],
};

/** c-metric-breakdown: October installs. */
export const INSTALLS = {
  value: "48.2k",
  label: "Installs · October",
  rate: "+12.4%",
  spark: [30, 42, 38, 50, 46, 58, 52, 64, 60, 72, 78, 92],
  breakdown: [
    { label: "Web", value: 54 },
    { label: "iOS", value: 31 },
    { label: PLATFORM_COPY.samplePlatform, value: 15 },
  ],
};

/** c-bar-list: top pages over seven days. */
export const TOP_PAGES = [
  { label: "/components", value: 4820, delta: "+12%" },
  { label: "/tokens", value: 3140, delta: "+4%" },
  { label: "/charts", value: 2210, delta: "−3%", down: true },
  { label: "/docs/theming", value: 1480, delta: "+22%" },
  { label: "/templates", value: 920, delta: "0%", steady: true },
];

/** c-depth-chart: the order book either side of a 0.12% spread around 42,105. */
export const ORDER_BOOK = {
  bids: [14, 14, 14, 18, 20, 36].map((size, i) => ({ price: 41980 + i * 20, size })),
  asks: [36, 20, 18, 14, 14, 14].map((size, i) => ({ price: 42110 + i * 20, size })),
};

/** c-candlestick-chart: a trading day in half-hours, with a volume pane and the MA 20. */
const CANDLE_TOP = [70, 70, 60, 52, 52, 58, 54, 44, 44, 36, 36, 30, 30, 34, 32, 22];
const CANDLE_BOTTOM = [80, 74, 74, 60, 58, 66, 66, 54, 48, 48, 40, 40, 34, 42, 42, 32];
const CANDLE_HIGH = [64, 62, 56, 46, 48, 54, 50, 40, 38, 32, 30, 24, 26, 28, 28, 16];
const CANDLE_LOW = [86, 78, 78, 64, 62, 70, 70, 58, 52, 52, 46, 44, 40, 46, 46, 36];
const CANDLE_UP = [true, false, true, true, false, false, true, true, false, true, false, true, false, false, true, true];
const priceAt = (y: number) => 42600 - 10 * y;
export const TRADING_DAY = {
  labels: ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "15:45", "15:50", "15:55"],
  candles: CANDLE_TOP.map((top, i) => ({
    open: priceAt(CANDLE_UP[i] ? CANDLE_BOTTOM[i]! : top),
    close: priceAt(CANDLE_UP[i] ? top : CANDLE_BOTTOM[i]!),
    high: priceAt(CANDLE_HIGH[i]!), low: priceAt(CANDLE_LOW[i]!),
  })),
  volume: [12, 8, 20, 16, 10, 14, 22, 26, 9, 24, 11, 28, 10, 15, 18, 30],
  ma: [76, 74, 70, 62, 58, 60, 60, 54, 50, 46, 42, 38, 35, 36, 34, 30].map(priceAt),
};

/**
 * c-heatmap: 34 weeks of commits ending Sunday 25 October 2026, the hand-off's seeded
 * generator (HEAT) replayed so the calendar matches its total.
 */
export const COMMITS = (() => {
  const end = new Date(2026, 9, 25);
  const start = new Date(end);
  start.setDate(end.getDate() - 34 * 7 + 1);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const cells: { value: number; count: number; date: string }[] = [];
  let total = 0;
  for (let w = 0; w < 34; w++) {
    for (let k = 0; k < 7; k++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + k);
      const n = Math.max(0, Math.floor(rnd() * (0.4 + (w / 34) * 0.6) * (k >= 5 ? 0.45 : 1) * 13 - 1));
      total += n;
      const level = n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 9 ? 3 : 4;
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      cells.push({ value: level / 4, count: n, date: iso });
    }
  }
  return { cells, total };
})();

/** c-uptime-bar: 60 days ending today, one unknown day, two degraded, one outage. */
export const API_UPTIME = Array.from({ length: 60 }, (_, i) => (i === 3 ? { unknown: true } : i === 17 || i === 41 ? { degraded: true } : i === 52 ? { down: true } : {}));

/** c-uptime-bar's ServiceHealthList (the hand-off's SVC). */
export const SERVICES = [
  { label: "API", detail: "99.98%", periods: Array.from({ length: 30 }, () => ({})) },
  { label: "Web app", detail: "100%", periods: Array.from({ length: 30 }, () => ({})) },
  { label: "Push notifications", detail: "98.21%", degraded: true, periods: Array.from({ length: 30 }, (_, j) => ([22, 26, 27, 29].includes(j) ? { degraded: true } : {})) },
  { label: `${PLATFORM_COPY.samplePlatform} capture module`, detail: "96.40%", down: true, periods: Array.from({ length: 30 }, (_, j) => (j === 29 ? { down: true } : [12, 24, 25].includes(j) ? { degraded: true } : {})) },
];

/** c-geo-map: sessions in ten cities over the last 24 hours (the hand-off's GEO). */
export const CITY_SESSIONS = [
  { label: "San Francisco", lng: -122.42, lat: 37.77, count: 2400 },
  { label: "New York", lng: -74.0, lat: 40.71, count: 3100 },
  { label: "São Paulo", lng: -46.63, lat: -23.55, count: 1300 },
  { label: "London", lng: -0.13, lat: 51.51, count: 2650 },
  { label: "Berlin", lng: 13.4, lat: 52.52, count: 1920 },
  { label: "Lagos", lng: 3.38, lat: 6.52, count: 640 },
  { label: "Mumbai", lng: 72.88, lat: 19.08, count: 1480 },
  { label: "Singapore", lng: 103.82, lat: 1.35, count: 1210 },
  { label: "Tokyo", lng: 139.69, lat: 35.69, count: 2280 },
  { label: "Sydney", lng: 151.21, lat: -33.87, count: 1390 },
];
