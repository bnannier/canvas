import Svg, { Circle, G, Line, Path, Polyline, Rect } from "react-native-svg";
import { View, useTheme, alpha } from "@nannier/canvas";
import type { CatTile } from "./tile";

// Catalog tiles for the Charts tier: one small hand-authored vignette per
// chart type, drawn with the theme tokens so light/dark follow the app.
// These are docs-only preview mockups (the tile stage is far smaller than a
// real chart's standard width); each links to the component's full page.

const W = 200;
const H = 64;

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: W, maxWidth: "100%" }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {children}
      </Svg>
    </View>
  );
}

function BarsPreview() {
  const { tokens } = useTheme();
  const values = [26, 38, 20, 44, 32, 52, 58];
  return (
    <Stage>
      {values.map((v, i) => (
        <Rect key={i} x={8 + i * 27} y={H - v} width={18} height={v} rx={3} fill={tokens.primary} />
      ))}
    </Stage>
  );
}

function LinePreview() {
  const { tokens } = useTheme();
  return (
    <Stage>
      <Polyline
        points={`0,${H - 14} 30,${H - 26} 60,${H - 20} 90,${H - 40} 120,${H - 34} 150,${H - 52} ${W},${H - 46}`}
        fill="none"
        stroke={tokens["chart-1"]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points={`0,${H - 6} 30,${H - 12} 60,${H - 10} 90,${H - 22} 120,${H - 18} 150,${H - 30} ${W},${H - 26}`}
        fill="none"
        stroke={tokens["chart-2"]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Stage>
  );
}

function AreaPreview() {
  const { tokens } = useTheme();
  const top = `0,${H - 30} 40,${H - 44} 80,${H - 34} 120,${H - 52} 160,${H - 44} ${W},${H - 56}`;
  return (
    <Stage>
      <Path d={`M${top.split(" ").join(" L")} L${W},${H} L0,${H} Z`} fill={alpha(tokens["chart-1"], 0.3)} />
      <Polyline points={top} fill="none" stroke={tokens["chart-1"]} strokeWidth={2.5} strokeLinejoin="round" />
    </Stage>
  );
}

function PiePreview() {
  const { tokens } = useTheme();
  const cx = W / 2;
  const cy = H / 2;
  const r = 26;
  // Three fixed sectors (~50% / ~30% / ~20%), drawn clockwise from 12 o'clock.
  return (
    <Stage>
      <Path d={`M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 1 1 ${cx - r},${cy} Z`} fill={tokens["chart-1"]} stroke={tokens.card} strokeWidth={2} />
      <Path d={`M${cx},${cy} L${cx - r},${cy} A${r},${r} 0 0 1 ${cx - r * 0.31},${cy - r * 0.95} Z`} fill={tokens["chart-2"]} stroke={tokens.card} strokeWidth={2} />
      <Path d={`M${cx},${cy} L${cx - r * 0.31},${cy - r * 0.95} A${r},${r} 0 0 1 ${cx},${cy - r} Z`} fill={tokens["chart-3"]} stroke={tokens.card} strokeWidth={2} />
    </Stage>
  );
}

function ScatterPreview() {
  const { tokens } = useTheme();
  const a = [
    [20, 44], [50, 36], [85, 40], [120, 24], [160, 18],
  ] as const;
  const b = [
    [35, 54], [70, 48], [105, 34], [145, 30], [180, 38],
  ] as const;
  return (
    <Stage>
      {a.map(([x, y], i) => (
        <Circle key={`a${i}`} cx={x} cy={y} r={4} fill={tokens["chart-1"]} />
      ))}
      {b.map(([x, y], i) => (
        <Circle key={`b${i}`} cx={x} cy={y} r={4} fill={tokens["chart-2"]} />
      ))}
    </Stage>
  );
}

function CandlestickPreview() {
  const { tokens } = useTheme();
  // [x, wickTop, wickBottom, bodyTop, bodyBottom, up]
  const candles: Array<[number, number, number, number, number, boolean]> = [
    [20, 10, 54, 20, 40, true],
    [55, 6, 48, 12, 30, true],
    [90, 14, 58, 22, 46, false],
    [125, 8, 50, 16, 36, true],
    [160, 4, 44, 10, 28, false],
  ];
  return (
    <Stage>
      {candles.map(([x, wt, wb, bt, bb, up], i) => {
        const color = up ? tokens.success : tokens.destructive;
        return (
          <G key={i}>
            <Line x1={x} y1={wt} x2={x} y2={wb} stroke={color} strokeWidth={1.5} />
            <Rect x={x - 6} y={bt} width={12} height={bb - bt} rx={1.5} fill={color} />
          </G>
        );
      })}
    </Stage>
  );
}

function DepthPreview() {
  const { tokens } = useTheme();
  return (
    <Stage>
      <Path d={`M0,10 L0,22 L30,22 L30,34 L60,34 L60,46 L86,46 L86,${H} L0,${H} Z`} fill={alpha(tokens.success, 0.3)} />
      <Path d={`M0,10 L0,22 L30,22 L30,34 L60,34 L60,46 L86,46`} fill="none" stroke={tokens.success} strokeWidth={2} />
      <Path d={`M114,46 L144,46 L144,32 L170,32 L170,16 L${W},16 L${W},${H} L114,${H} Z`} fill={alpha(tokens.destructive, 0.3)} />
      <Path d={`M114,46 L144,46 L144,32 L170,32 L170,16 L${W},16`} fill="none" stroke={tokens.destructive} strokeWidth={2} />
    </Stage>
  );
}

function StackedBarPreview() {
  const { tokens } = useTheme();
  const widths = [80, 56, 36, 28];
  let x = 0;
  return (
    <Stage>
      {widths.map((w, i) => {
        const r = <Rect key={i} x={x} y={H / 2 - 6} width={w - 2} height={12} rx={i === 0 || i === widths.length - 1 ? 6 : 0} fill={tokens[`chart-${i + 1}` as "chart-1"]} />;
        x += w;
        return r;
      })}
    </Stage>
  );
}

function GaugePreview() {
  const { tokens } = useTheme();
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <Stage>
      <Circle cx={W / 2} cy={H / 2} r={r} stroke={tokens.muted} strokeWidth={7} fill="none" />
      <Circle
        cx={W / 2}
        cy={H / 2}
        r={r}
        stroke={tokens.primary}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * 0.28}
        transform={`rotate(-90 ${W / 2} ${H / 2})`}
      />
    </Stage>
  );
}

function HeatmapPreview() {
  const { tokens } = useTheme();
  const intensities = [0.2, 0.5, 0.85, 0.35, 0.65, 1, 0.25, 0.45, 0.75, 0.3, 0.9, 0.55, 0.15, 0.6, 0.4, 0.8, 0.5, 0.7];
  return (
    <Stage>
      {intensities.map((t, i) => (
        <Rect
          key={i}
          x={28 + (i % 6) * 25}
          y={4 + Math.floor(i / 6) * 20}
          width={17}
          height={16}
          rx={3}
          fill={alpha(tokens.primary, Math.max(0.12, t))}
        />
      ))}
    </Stage>
  );
}

function BarListPreview() {
  const { tokens } = useTheme();
  // Three ranked rows: swatch, label line, and a shortening track bar.
  const rows = [
    { w: 150, fill: tokens["chart-1"] },
    { w: 104, fill: tokens["chart-2"] },
    { w: 62, fill: tokens["chart-3"] },
  ];
  return (
    <Stage>
      {rows.map((r, i) => (
        <G key={i}>
          <Rect x={8} y={6 + i * 20} width={6} height={6} rx={1.5} fill={r.fill} />
          <Rect x={20} y={7.5 + i * 20} width={46} height={3} rx={1.5} fill={alpha(tokens["muted-foreground"], 0.4)} />
          <Rect x={8} y={15 + i * 20} width={W - 16} height={3} rx={1.5} fill={alpha(tokens["muted-foreground"], 0.18)} />
          <Rect x={8} y={15 + i * 20} width={r.w} height={3} rx={1.5} fill={r.fill} />
        </G>
      ))}
    </Stage>
  );
}

function MetricBreakdownPreview() {
  const { tokens } = useTheme();
  return (
    <Stage>
      {/* Headline block and rate. */}
      <Rect x={8} y={6} width={44} height={8} rx={2} fill={tokens.foreground} />
      <Rect x={8} y={18} width={28} height={4} rx={1.5} fill={alpha(tokens["muted-foreground"], 0.6)} />
      <Rect x={W - 34} y={6} width={26} height={5} rx={1.5} fill={alpha(tokens.destructive, 0.8)} />
      {/* Tiny trend. */}
      <Polyline
        points={`8,${34} 40,${31} 72,${32} 104,${28} 136,${29} 168,${26} ${W - 8},${27}`}
        fill="none"
        stroke={tokens["chart-1"]}
        strokeWidth={1.5}
      />
      {/* Two share rows. */}
      <Rect x={8} y={44} width={W - 16} height={3} rx={1.5} fill={alpha(tokens["muted-foreground"], 0.18)} />
      <Rect x={8} y={44} width={128} height={3} rx={1.5} fill={tokens["chart-1"]} />
      <Rect x={8} y={54} width={W - 16} height={3} rx={1.5} fill={alpha(tokens["muted-foreground"], 0.18)} />
      <Rect x={8} y={54} width={74} height={3} rx={1.5} fill={tokens["chart-2"]} />
    </Stage>
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
];
