import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { StyleSheet } from "react-native";
import { Line, Path } from "react-native-svg";
import {
  View,
  Text,
  alpha,
  devWarn,
  type LayoutStyle,
  GlassPane,
  paneStyle,
  isGlass,
} from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import {
  CartesianFrame,
  CHART_ROOT,
  type CartesianLayout,
} from "../shared/chart-frame.js";
import { useChartPresentation } from "../shared/chart-presentation.js";
import { MONO_FONT } from "../../style/mono.js";
import { ChartLegend } from "../shared/chart-legend.js";
import {
  cumulativeDepth,
  formatCompact,
  stepAreaPath,
  type DepthLevel,
} from "../shared/chart-math.js";

// DepthChart: the order-book view. Cumulative bid and ask step areas mirrored
// around the spread - bids in the success tone accumulating left of the best
// bid, asks in the destructive tone accumulating right of the best ask - on a
// numeric price axis. A "Shared" platform treatment like the rest of the
// Chart family.

export type { DepthLevel } from "../shared/chart-math.js";

export interface DepthChartProps {
  /** Bid levels (any order; sorted internally). */
  bids: DepthLevel[];
  /** Ask levels (any order; sorted internally). */
  asks: DepthLevel[];
  /** Optional heading shown above the plot. */
  title?: string;
  // Density (omit for the default plot size).
  compact?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  // Furniture visibility.
  hideLegend?: boolean;
  hideGrid?: boolean;
  hideAxes?: boolean;
  /** Formats tick labels and accessible values (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /**
   * The spread's label ("spread 0.12%"): drawn as a dashed guide midway between the best
   * bid and the best ask, with this label in a pill at its top. Omit for no guide.
   */
  spread?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

const PLOT_HEIGHT = { default: 180, compact: 120 } as const;
// The spread pill (the section card): 22 tall, 8 px sides, 6 under the plot's top, its
// label 500 10 px mono on a 20 px line in the secondary ink.
const SPREAD = { top: 6, height: 22, padH: 8 } as const;
const SPREAD_TYPE = {
  fontFamily: MONO_FONT,
  fontSize: 10,
  lineHeight: 20,
  fontWeight: "500" as const,
};

// pointerEvents must come from StyleSheet.create on react-native-web.
const styles = StyleSheet.create({ passthrough: { pointerEvents: "none" } });

/** Build a DepthChart from a platform skin. */
export function createDepthChart(skin: ChartSkin) {
  return function DepthChart(props: DepthChartProps) {
    const { bids, asks, title, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;
    const specimen = useChartPresentation()?.kind === "depth";
    const formatValue = props.formatValue ?? formatCompact;

    const bidDepth = cumulativeDepth(bids, "bids");
    const askDepth = cumulativeDepth(asks, "asks");

    devWarn(
      bidDepth.length === 0 && askDepth.length === 0,
      "[canvas] <DepthChart />: `bids` and `asks` are empty; the chart renders with no depth."
    );
    const bestBid = bidDepth[bidDepth.length - 1];
    const bestAsk = askDepth[0];
    devWarn(
      bestBid != null && bestAsk != null && bestBid.price > bestAsk.price,
      "[canvas] <DepthChart />: the best bid is priced above the best ask (crossed book); the sides will overlap."
    );

    // The spread's midpoint, where its guide stands.
    const mid = (layout: CartesianLayout): number | null =>
      specimen
        ? layout.plotW / 2
        : bestBid != null && bestAsk != null
        ? (layout.x(bestBid.price) + layout.x(bestAsk.price)) / 2
        : null;

    const prices = [...bidDepth, ...askDepth].map((p) => p.price);
    const xDomain: [number, number] = prices.length
      ? [Math.min(...prices), Math.max(...prices)]
      : [0, 1];
    const maxDepth = Math.max(
      1,
      ...bidDepth.map((p) => p.depth),
      ...askDepth.map((p) => p.depth)
    );

    // The accessible name summarizes the book (best bid/ask, level counts,
    // totals) rather than every level - the contract's pre-aggregation rule
    // for dense data.
    const bidTotal = bidDepth.length ? bidDepth[0].depth : 0;
    const askTotal = askDepth.length ? askDepth[askDepth.length - 1].depth : 0;
    const name = `${title ?? "Depth"}: best bid ${
      bestBid ? formatValue(bestBid.price) : "none"
    }, best ask ${bestAsk ? formatValue(bestAsk.price) : "none"}; ${
      bidDepth.length
    } bid levels totalling ${formatValue(bidTotal)}, ${
      askDepth.length
    } ask levels totalling ${formatValue(askTotal)}`;

    return (
      <View
        {...(title != null && title !== ""
          ? {
              role: "group" as const,
              accessibilityLabel: `${title} chart`,
              "aria-label": `${title} chart`,
            }
          : {})}
        testID={testID}
        style={[
          props.plain
            ? null
            : paneStyle(theme, [
                surfaceShape,
                compact ? s.surfacePadCompact : s.surfacePadDefault,
              ]),
          CHART_ROOT,
          style,
        ]}
      >
        {/* The chart frame is a CONTENT-layer pane under glass (nothing in solid mode). */}
        {glass && !props.plain ? (
          <GlassPane layer="content" shape={surfaceShape} />
        ) : null}
        {title != null && title !== "" ? (
          <Text
            style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}
          >
            {title}
          </Text>
        ) : null}

        <View
          accessible
          accessibilityRole="image"
          role="img"
          accessibilityLabel={name}
          aria-label={name}
        >
          <CartesianFrame
            yExtent={[0, maxDepth]}
            xDomain={xDomain}
            plotHeight={PLOT_HEIGHT[compact ? "compact" : "default"]}
            compact={compact}
            hideGrid={props.hideGrid}
            hideAxes={props.hideAxes}
            formatValue={formatValue}
            overlay={(layout) =>
              props.spread && mid(layout) != null ? (
                // The section card's spread pill, centred on the guide 6 below the plot's top.
                <View
                  style={[
                    styles.passthrough,
                    {
                      position: "absolute",
                      top: SPREAD.top,
                      left: 0,
                      right: 0,
                      alignItems: "center",
                    },
                  ]}
                >
                  <View
                    style={{
                      height: SPREAD.height,
                      paddingHorizontal: SPREAD.padH,
                      borderRadius: 9999,
                      borderWidth: 1,
                      borderColor: tokens["field-border"] ?? tokens.border,
                      backgroundColor: tokens.muted,
                      justifyContent: "center",
                      transform: [
                        {
                          translateX:
                            (mid(layout) as number) - layout.plotW / 2,
                        },
                      ],
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        ...SPREAD_TYPE,
                        color: tokens["muted-foreground"],
                      }}
                    >
                      {props.spread}
                    </Text>
                  </View>
                </View>
              ) : null
            }
          >
            {(layout) => {
              const toPts = (pts: { price: number; depth: number }[]) =>
                pts.map((p) => ({
                  x: layout.x(p.price),
                  y: layout.y(p.depth),
                }));
              // Extend each side's total-depth shelf to its plot edge, so the
              // outermost step has width instead of ending in a bare spike.
              const bidPts = toPts(bidDepth);
              if (bidPts.length) bidPts.unshift({ x: 0, y: bidPts[0].y });
              const askPts = toPts(askDepth);
              if (askPts.length)
                askPts.push({
                  x: layout.plotW,
                  y: askPts[askPts.length - 1].y,
                });
              if (specimen) {
                const sx = layout.plotW / 300;
                // The best price has an explicit zero-depth endpoint on each side.
                if (bidPts.length)
                  bidPts.push({ x: 144 * sx, y: layout.plotH });
                if (askPts.length)
                  askPts.unshift({ x: 156 * sx, y: layout.plotH });
                const step = (points: { x: number; y: number }[]) =>
                  points.length
                    ? `M${points[0].x},${points[0].y}` +
                      points
                        .slice(1)
                        .map((p, i) => ` H${p.x} V${p.y}`)
                        .join("")
                    : "";
                const bidLine = step(bidPts);
                const askLine = step(askPts);
                return (
                  <>
                    <Path
                      d={`${bidLine} L0,${layout.plotH}Z`}
                      fill={tokens.success}
                      fillOpacity={0.18}
                    />
                    <Path
                      d={bidLine}
                      fill="none"
                      stroke={tokens.success}
                      strokeWidth={1.8}
                    />
                    <Path
                      d={`${askLine} L${layout.plotW},${layout.plotH}Z`}
                      fill={tokens.destructive}
                      fillOpacity={0.16}
                    />
                    <Path
                      d={askLine}
                      fill="none"
                      stroke={tokens.destructive}
                      strokeWidth={1.8}
                    />
                    {props.spread ? (
                      <Line
                        x1={layout.plotW / 2}
                        x2={layout.plotW / 2}
                        y1={0}
                        y2={layout.plotH}
                        stroke={tokens["subtle-foreground"]}
                        strokeDasharray="3,4"
                      />
                    ) : null}
                  </>
                );
              }
              const guide = props.spread ? mid(layout) : null;
              return (
                <>
                  {guide != null ? (
                    <Line
                      x1={guide}
                      y1={0}
                      x2={guide}
                      y2={layout.plotH}
                      stroke={
                        tokens["subtle-foreground"] ??
                        tokens["muted-foreground"]
                      }
                      strokeWidth={1}
                      strokeDasharray={s.CHART_LOOK.guideDash}
                    />
                  ) : null}
                  {bidPts.length ? (
                    <>
                      <Path
                        d={stepAreaPath(bidPts, layout.plotH, true)}
                        fill={alpha(tokens.success, 0.25)}
                      />
                      <Path
                        d={stepAreaPath(bidPts, layout.plotH, true)}
                        fill="none"
                        stroke={tokens.success}
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                    </>
                  ) : null}
                  {askPts.length ? (
                    <>
                      <Path
                        d={stepAreaPath(askPts, layout.plotH)}
                        fill={alpha(tokens.destructive, 0.22)}
                      />
                      <Path
                        d={stepAreaPath(askPts, layout.plotH)}
                        fill="none"
                        stroke={tokens.destructive}
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                    </>
                  ) : null}
                </>
              );
            }}
          </CartesianFrame>
        </View>

        {props.hideLegend ? null : (
          <ChartLegend
            horizontal
            items={[
              { label: "Bids", color: tokens.success },
              { label: "Asks", color: tokens.destructive },
            ]}
          />
        )}
      </View>
    );
  };
}
