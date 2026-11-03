import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { type ReactNode } from "react";
import Svg, { Polyline } from "react-native-svg";
import { View, Pressable, Text, StyleSheet, RippleClip, cornerRadii, useTheme, useMeasuredWidth, type ColorTokens, type ViewStyle, type TextStyle, type LayoutStyle, useFillStyle, GlassSurface, GlassPane, paneStyle, paneRipple, innerFill, isGlass, innerFillAlpha, alpha } from "../../style/index.js";
import { AnatomyScope, useAnatomyPart, withPartLayout, type AnatomyTarget } from "../../style/anatomy.js";
import { useHover } from "../../style/hover.js";
import { Icon } from "../../atoms/icon/icon.js";
import { type StackedSegment } from "../../charts/shared/types.js";
import { SPARK, deltaTone, headerRow, headerTrailing, item as itemLayout, labelCluster, row, shareBar, shareColumn, shareDot, shareLegend, shareLegendItem, shareLegendText, sparkPoints, swatch, tileFloor, valueRow, type Surface } from "./stats.styles.js";
import { MEASURE_ROUNDING, gridCellWidth, gridColumns } from "../../atoms/grid/grid.shared.js";

// Shared Stats shell. The structure (a wrapping row/grid of metric stacks, each a
// small label, a large headline value, and an optional delta), the boolean-prop
// axes, the data-shape types, the a11y, and the semantic delta-tone logic live
// here once; a platform file supplies only its skin (surface shape/padding/shadow,
// row density, title/label/value/delta type, and press feedback) and calls
// createStats.
//
// Two surfaces, after the v4 hand-off's code-driven renderer (cv-kit-code3.js `stats`):
//
// 1. Group (the default, and `plain`): the metrics sit edge to edge in one bordered
//    surface, a hairline between each, so a row of metrics reads as one panel.
// 2. Framed (`framed`): each metric is its own bordered tile, 12 apart.
//
// The dense surfaces (`compact`, `large`) are the base renderer's (cv-kit-data.js
// `K.def('stats')`): value-first tiles under the small shadow.
//
// Layout is the hand-off's auto-fit grid: as many equal columns of at least the floor
// as the row's own width holds, so a group reflows from a single row on desktop down to
// a stack on a phone without any per-breakpoint props.
//
// Boolean-prop API: one boolean per option, first-match precedence within an axis
// (mirrors Button's intentOf). `items` carries the plain data; each item's `down`
// flag colors its delta red instead of the default green.
//
// A metric's trend (`spark`) draws as a small line beside its value, a decline in the
// error color and anything else in the accent; its composition (`share`) draws under the
// delta as a thin proportional bar over a legend.
//
// Stats draws the hand-off's tile on every platform: one structure and one set of
// (semantic) colors, with per-OS touches limited to the face and the press feedback, so
// the skin carries only those, not the colors or the layout contract.

export interface StatItem {
  /** Small caption above the value (e.g. "Total users"). */
  label: string;
  /** The headline figure, pre-formatted (e.g. "12,847", "$48.2k", "3.6%"). */
  value: string;
  /** Optional change indicator (e.g. "+12.5%"). Omit to hide. */
  delta?: string;
  /** Muted supporting line beneath a dense metric label. */
  description?: string;
  /** Color the delta red (a decline) instead of the default green (a rise). */
  down?: boolean;
  /** Render the delta MUTED rather than as a rise or a decline, for a line that
   *  qualifies the value instead of reporting a change ("last 30 days",
   *  "3 M2M / 1 user"). Green would read as good news that is not being claimed.
   *  Takes precedence over `down`. */
  steady?: boolean;
  /** Optional trend series; when set (and non-empty), the metric renders a
   *  Sparkline strip below the value that plots these points. Omit for no trend. */
  spark?: number[];
  /** What the trend strip plots, as its accessible name. Defaults to the
   *  metric's own label ("Revenue trend"), which is right whenever the strip is
   *  the VALUE's history. Set it when the strip plots the supporting line
   *  instead ("Sign-ins per hour, last 24 hours" under a live-sessions count),
   *  so a screen reader is not told the strip is something it is not. */
  sparkLabel?: string;
  /** Optional composition of the value, drawn in the SAME slot as `spark` as a
   *  proportional strip over a muted rail: the metric that decomposes but has no
   *  trend to plot (a verified share, a queue by status) still fills its card,
   *  so a row mixing the two reads as one finished set rather than as tiles that
   *  came out half empty. Segments summing to zero draw the bare rail, which is
   *  the honest picture of a metric at zero. Ignored when `spark` is set. */
  share?: StackedSegment[];
  /** A glyph shown opposite the label, naming what the metric counts. */
  icon?: ReactNode;
  /** A control in the metric's header, opposite the label (a period selector, a
   *  filter). Sits beside `icon` when both are given. */
  actions?: ReactNode;
  /** Accent for the headline value, drawn from the categorical chart ramp so a
   *  dashboard's tiles are tellable apart at a glance.
   *
   *  Mutually exclusive; first match wins in the order listed. Omit for the
   *  default foreground, which is what every existing call site gets. The slots
   *  are the same eight the charts use, so a metric and the series it summarises
   *  can carry one identity. */
  chart1?: boolean;
  chart2?: boolean;
  chart3?: boolean;
  chart4?: boolean;
  chart5?: boolean;
  chart6?: boolean;
  chart7?: boolean;
  chart8?: boolean;
}

export interface StatsProps {
  /** The metrics to render, in order. */
  items: StatItem[];
  // Surface (pick one; default is bordered cards).
  /** Borderless metric stacks on a shared surface, for nesting inside a card. */
  plain?: boolean;
  /** Dense value-first tile for a navigation rail: a 12px inset and a 20px headline. */
  compact?: boolean;
  /** Value-first dashboard tile with a 36px headline. */
  large?: boolean;
  /** Optional heading shown above the metrics (mainly for the plain surface). */
  title?: string;
  /** Draw every metric's strip on a muted track, in one bounded band.
   *
   *  For a ROW of metrics, where the strips are read against each other. Without
   *  it each strip draws only its marks, so a metric with a quiet series shows a
   *  near-empty band beside one with a full bar and the row's densities range
   *  from blank to solid with nothing tying them together; the eye lands on the
   *  fullest tile rather than scanning the row. The track gives every strip the
   *  same frame whatever its data, so a flat series reads as a chart sitting at
   *  zero and the fill is the only thing that varies. */
  framed?: boolean;
  /** Make each metric a tappable target (drill into the underlying detail). When
   *  set, every metric renders as a Pressable with a button role and a pressed
   *  affordance, so a tappable stat needs no hand-rolled Pressable. */
  onPressItem?: (index: number) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The per-OS-varying style pieces a platform skin fulfills. Everything else (the
// structure, the metric layout, the semantic delta color) is shared.
export interface StatsSkin {
  /** The bordered card surface each metric sits in (shape, border, padding, shadow). */
  cardSurface: (tokens: ColorTokens) => ViewStyle;
  denseCard: (tokens: ColorTokens, large: boolean) => ViewStyle;
  denseValue: (tokens: ColorTokens, large: boolean) => TextStyle;
  denseLabel: (tokens: ColorTokens, large: boolean) => TextStyle;
  denseDescription: (tokens: ColorTokens) => TextStyle;
  /** The parent surface the plain variant nests on. */
  plainContainer: (tokens: ColorTokens) => ViewStyle;
  /** A plain metric's own inset and rhythm, and the rule before every metric but the first. */
  plainItem: (tokens: ColorTokens, first: boolean) => ViewStyle;
  /** Row gap by surface (cards pack tighter, plain stacks sit roomier). */
  rowGap: Record<Surface, ViewStyle>;
  /** Title type + spacing, by surface. */
  title: (tokens: ColorTokens, surface: Surface) => TextStyle;
  /** The small caption above the value. */
  labelText: (tokens: ColorTokens) => TextStyle;
  /** The headline figure type. */
  valueText: (tokens: ColorTokens) => TextStyle;
  /** The delta type base (the tone color is layered on top by the shell). */
  deltaBase: TextStyle;
  /** The dense surfaces' delta type base (compact and large). */
  denseDeltaBase: TextStyle;
  /** iOS/web dim on a pressed tappable item; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a tappable item; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** Whether a tappable metric under the pointer takes the secondary wash (the web only); null elsewhere. */
  hoverWash: true | null;
}

// Surface precedence when more than one is passed, first match wins. The dense surfaces
// keep a tile per metric unless `plain`; otherwise `framed` separates the tiles and the
// default (and `plain`) is the one bordered group.
export function surfaceOf(p: StatsProps): Surface {
  if (p.compact || p.large) return p.plain ? "plain" : "card";
  return p.framed ? "card" : "plain";
}

// Accent precedence, first match wins. Returns the chart token name its swatch paints,
// or null for no swatch.
export function accentOf(item: StatItem): string | null {
  if (item.chart1) return "chart-1";
  if (item.chart2) return "chart-2";
  if (item.chart3) return "chart-3";
  if (item.chart4) return "chart-4";
  if (item.chart5) return "chart-5";
  if (item.chart6) return "chart-6";
  if (item.chart7) return "chart-7";
  if (item.chart8) return "chart-8";
  return null;
}

// Delta precedence, first match wins: `steady` (muted, neither a rise nor a decline)
// over `down` (a decline); otherwise a rise.
export function deltaOf(item: Pick<StatItem, "steady" | "down">): "steady" | "down" | "up" {
  if (item.steady) return "steady";
  if (item.down) return "down";
  return "up";
}

// The handlers of the parts a metric draws, handed to the first metric only.
interface StatParts {
  stat: AnatomyTarget | undefined;
  label: AnatomyTarget | undefined;
  value: AnatomyTarget | undefined;
  delta: AnatomyTarget | undefined;
}

// A pass-through box over a GlassSurface (which has no ref), measured as a docs AnatomyProvider part.
const MEASURE_BOX = StyleSheet.create({ box: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" } }).box;

export function createStats(skin: StatsSkin) {
  // One metric: label, value, optional delta. Tappable when an onPress is given.
  function StatItemView({ item, surface, onPress, dense, large, first, parts, cellWidth, count }: { item: StatItem; surface: Surface; onPress?: () => void; dense?: boolean; large?: boolean; first: boolean; parts?: StatParts; cellWidth?: number; count: number }): ReactNode {
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const { hovered, target: hoverTarget } = useHover(skin.hoverWash != null && onPress != null);
    // Under glass a tile is a CONTENT-layer pane (the material rides inside the pressable
    // so the tap, ripple and dim stay on the Pressable). Split the surface shape
    // (radius/border/fill/padding) from the outer flex sizing: the shape stays on the
    // tappable node, the sizing rides the RippleClip wrapper.
    const cardShape = surface === "card" ? dense ? skin.denseCard(tokens, !!large) : skin.cardSurface(tokens) : null;
    const metricLayout = dense ? { flexGrow: 1, flexShrink: 1, flexBasis: "0%" as const, minWidth: 0 } : cellWidth != null ? { width: cellWidth, minWidth: 0 } : itemLayout(count);
    // A metric in the group carries its own inset and the rule that separates it from the one before.
    const plainShape = surface === "plain" ? skin.plainItem(tokens, first) : null;
    const container = [cardShape ?? plainShape, metricLayout];
    // The accent is a swatch before the label, never a recolor of the value or the delta:
    // the delta keeps its own rise/decline semantics.
    const accent = accentOf(item);
    const deltaKind = deltaOf(item);
    // The header row exists only when the metric has something beside its label, so a
    // bare metric's tree is a label Text.
    const trailing = item.actions ?? (onPress && !dense ? <Icon chevronRight subtle decorative size={14} /> : null);
    const leading = accent != null || item.icon != null;
    const labelText = <Text ref={parts?.label?.ref} onLayout={parts?.label?.onLayout} style={dense ? skin.denseLabel(tokens, !!large) : skin.labelText(tokens)}>{item.label}</Text>;
    const label = leading ? (
      <View style={labelCluster}>
        {accent != null ? <View style={[swatch, { backgroundColor: tokens[accent as keyof typeof tokens] }]} /> : null}
        {item.icon}
        {labelText}
      </View>
    ) : labelText;
    const valueText = <Text ref={parts?.value?.ref} onLayout={parts?.value?.onLayout} style={dense ? skin.denseValue(tokens, !!large) : skin.valueText(tokens)}>{item.value}</Text>;
    const spark = item.spark != null && item.spark.length > 1 ? (
      <View accessibilityRole="image" aria-label={item.sparkLabel ?? `${item.label} trend`} accessibilityLabel={item.sparkLabel ?? `${item.label} trend`}>
        <Svg width={SPARK.width} height={SPARK.height} viewBox={`0 0 ${SPARK.width} ${SPARK.height}`} style={{ overflow: "visible" }}>
          <Polyline points={sparkPoints(item.spark.map(Number))} fill="none" stroke={item.down ? tokens.destructive : tokens.primary} strokeWidth={SPARK.stroke} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    ) : null;
    const inner = (
      <>
        {dense ? valueText : null}
        {trailing != null ? (
          <View style={headerRow}>
            {label}
            <View style={headerTrailing}>{trailing}</View>
          </View>
        ) : label}
        {dense ? spark : spark != null ? <View style={valueRow}>{valueText}{spark}</View> : valueText}
        {item.description ? <Text style={skin.denseDescription(tokens)}>{item.description}</Text> : null}
        {item.delta != null && item.delta !== "" ? (
          <Text ref={parts?.delta?.ref} onLayout={parts?.delta?.onLayout} style={[dense ? skin.denseDeltaBase : skin.deltaBase, deltaKind === "steady" ? { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] } : deltaTone(tokens, deltaKind === "down")]}>
            {/* The hand-off's direction arrow leads a rise or a decline; the signed figure already says it, so the arrow is hidden from assistive tech. */}
            {!dense && deltaKind !== "steady" ? <Text aria-hidden accessibilityElementsHidden importantForAccessibility="no">{deltaKind === "down" ? "↓ " : "↑ "}</Text> : null}
            {item.delta}
          </Text>
        ) : null}
        {spark == null && item.share != null && item.share.length > 0 ? <ShareStrip label={item.label} segments={item.share} /> : null}
      </>
    );
    if (onPress) {
      // The card's pane is a child of this Pressable: where it renders, the ripple draws in
      // the foreground, over it (`paneRipple`).
      const android_ripple = paneRipple(cardShape ? theme : false, skin.ripple ? skin.ripple(tokens) : undefined);
      const hoverFill = hovered ? { backgroundColor: innerFill(theme, "secondary", "faint") } : null;
      return (
        // Android: the bounded card ripple is clipped to the tile's outline by this
        // RippleClip parent (a node can't clip its own ripple). The outer flex sizing
        // rides the wrapper so the tile keeps its grid footprint; the shape, padding,
        // fill, and pressed-dim stay on the Pressable.
        <RippleClip shape={cornerRadii(cardShape)} style={metricLayout}>
          <Pressable
            ref={parts?.stat?.ref}
            onLayout={parts?.stat?.onLayout}
            accessibilityRole="button"
            onPress={onPress}
            android_ripple={android_ripple}
            {...hoverTarget}
            style={({ pressed }) => [cardShape ? paneStyle(theme, cardShape) : plainShape, hoverFill, pressed && skin.pressedOpacity != null ? { opacity: skin.pressedOpacity } : null]}
          >
            {cardShape ? <GlassPane layer="content" shape={cardShape} /> : null}
            {inner}
          </Pressable>
        </RippleClip>
      );
    }
    // GlassSurface has no ref, so under a docs AnatomyProvider the Stat part is a pass-through fill measuring its box.
    const statBox = parts?.stat && cardShape ? <View ref={parts.stat.ref} onLayout={parts.stat.onLayout} style={MEASURE_BOX} /> : null;
    return cardShape ? <GlassSurface layer="content" style={container}>{statBox}{inner}</GlassSurface> : <View ref={parts?.stat?.ref} onLayout={parts?.stat?.onLayout} style={container}>{inner}</View>;
  }

  // A metric's composition: the proportional bar (named for the screen reader with each
  // segment's share) over its legend, which repeats the names and so is hidden from it.
  function ShareStrip({ label, segments }: { label: string; segments: StackedSegment[] }): ReactNode {
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const total = segments.reduce((sum, seg) => sum + (Number(seg.value) || 0), 0) || 1;
    const share = (seg: StackedSegment) => (Number(seg.value) || 0) / total;
    const name = `${label}: ${segments.map((seg) => `${seg.label} ${Math.round(share(seg) * 100)}%`).join(", ")}`;
    // The first segment in the accent, the rest in the raised surface (an ink tint under glass).
    const rest = isGlass(theme) ? alpha(tokens.foreground, innerFillAlpha(theme, "firm")) : tokens["surface-raised"];
    const fill = (k: number) => (k === 0 ? tokens.primary : rest);
    return (
      <View style={shareColumn}>
        <View accessibilityRole="image" aria-label={name} accessibilityLabel={name} style={shareBar}>
          {segments.map((seg, k) => <View key={k} style={{ flexGrow: share(seg), flexShrink: 1, flexBasis: 0, backgroundColor: fill(k) }} />)}
        </View>
        <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={shareLegend}>
          {segments.map((seg, k) => (
            <View key={k} style={shareLegendItem}>
              <View style={[shareDot, { backgroundColor: fill(k) }]} />
              <Text style={shareLegendText(tokens)}>{seg.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return function Stats(props: StatsProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Group, Stat, Label, Value, Delta. The Stat and its text parts are
    // the first metric's; the scope keeps the Sparkline and StackedBar inside from naming any.
    const groupPart = useAnatomyPart("Group");
    const firstParts: StatParts = { stat: useAnatomyPart("Stat"), label: useAnatomyPart("Label"), value: useAnatomyPart("Value"), delta: useAnatomyPart("Delta") };
    const { items, title, testID, style, onPressItem } = props;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);

    // The framed (and dense) surface lays its tiles directly in a wrapping, gapped row. The
    // group wraps the metrics in one shared bordered surface.
    const isPlain = surface === "plain";
    // FILL: the group spans the parent it is given; the items flex-wrap inside it.
    const fill = useFillStyle("Stats");
    // The group's shared surface is a CONTENT-layer pane under glass (GlassSurface is the
    // plain View in solid mode); the framed surface lays its own panes per tile and the
    // row itself paints nothing.
    const Root = isPlain ? GlassSurface : View;
    // The hand-off's auto-fit grid, measured on the row itself (its OWN width, never the
    // window): as many columns of at least the floor as fit, never more than there are
    // metrics (auto-fit collapses the empty tracks), each the same cell width so a wrapped
    // last row keeps its column. The dense surfaces share one row and need no cells.
    const { width: rowWidth, measured, onLayout: onRowLayout } = useMeasuredWidth();
    const dense = !!(props.compact || props.large);
    const gap = (StyleSheet.flatten(skin.rowGap[surface]) as ViewStyle).gap;
    const gapPx = typeof gap === "number" ? gap : 0;
    const cols = Math.min(items.length, gridColumns(rowWidth, tileFloor(items.length), gapPx));
    const cellWidth = !dense && measured && rowWidth > 0 ? gridCellWidth(rowWidth - (cols > 1 ? MEASURE_ROUNDING : 0), cols, gapPx) : undefined;

    const heading = title != null && title !== "" ? <Text style={skin.title(tokens, surface)}>{title}</Text> : null;
    const metrics = (
      <View ref={groupPart?.ref} onLayout={withPartLayout(groupPart, onRowLayout)} style={[row, skin.rowGap[surface]]}>
        {items.map((item, i) => (
          <StatItemView key={i} item={item} surface={surface} dense={dense} large={props.large && !props.compact} first={i === 0} cellWidth={cellWidth} count={items.length} parts={i === 0 ? firstParts : undefined} onPress={onPressItem ? () => onPressItem(i) : undefined} />
        ))}
      </View>
    );
    // A title sits above the tiles, so a titled group stands its one box under the title
    // rather than drawing the title inside the box.
    if (isPlain && heading) {
      return (
        <AnatomyScope>
        <View testID={testID} style={[fill, style]}>
          {heading}
          <Root style={[skin.plainContainer(tokens), fill]} layer="content">{metrics}</Root>
        </View>
        </AnatomyScope>
      );
    }
    return (
      <AnatomyScope>
      <Root testID={testID} style={[isPlain ? skin.plainContainer(tokens) : null, fill, style]} {...(isPlain ? { layer: "content" as const } : null)}>
        {heading}
        {metrics}
      </Root>
      </AnatomyScope>
    );
  };
}
