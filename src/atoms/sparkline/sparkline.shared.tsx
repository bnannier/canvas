import { useState } from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { View, useTheme, alpha, palette, devWarn, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type SparklineSkin } from "./sparkline.styles.js";

// Shared Sparkline shell. A compact trend strip: a row of thin bars whose heights
// track a series of values, so no call site hand-composes a row of
// `flexGrow` + `height` + `backgroundColor` Views to draw an inline trend (the
// recurring stat-card / dashboard sparkline). Pass `values`; the component sizes
// each bar against the series max and paints the tone.
//
// Sparkline is a "Shared" platform treatment: a token-colored bar strip is
// identical on iOS, Android, and the web, so the three skins carry the same
// bar radius / gap / heights.

export type Tone = "primary" | "success" | "destructive" | "muted";
export type Size = "compact" | "default" | "tall";

export interface SparklineProps {
  /** The series to plot; each value becomes one bar, sized against the max. */
  values: number[];
  // Tone (pick one; default `primary`). Colors the bars.
  primary?: boolean;
  success?: boolean;
  destructive?: boolean;
  muted?: boolean;
  // Height (pick one; default medium).
  compact?: boolean;
  tall?: boolean;
  // Shape: a continuous 2px trend line (the watchlist-row idiom) instead of
  // the default bar strip.
  line?: boolean;
  /** Accessible summary (e.g. "requests, last 11 days"). */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For sizing/composition only (e.g. maxWidth); not a styling escape hatch. */
  style?: StyleProp<ViewStyle>;
}

function toneOf(p: SparklineProps): Tone {
  if (p.success) return "success";
  if (p.destructive) return "destructive";
  if (p.muted) return "muted";
  return "primary";
}

function sizeOf(p: SparklineProps): Size {
  if (p.compact) return "compact";
  if (p.tall) return "tall";
  return "default";
}

// A soft wash of the tone color (matches the established sparkline look).
function barColor(tokens: ColorTokens, tone: Tone): string {
  switch (tone) {
    case "primary":
      return alpha(tokens.primary, 0.7);
    case "success":
      return alpha(palette["green-500"], 0.7);
    case "destructive":
      return alpha(tokens.destructive, 0.7);
    case "muted":
      return alpha(tokens["muted-foreground"], 0.5);
  }
}

/** Build a Sparkline from a platform skin. */
export function createSparkline(skin: SparklineSkin) {
  return function Sparkline(props: SparklineProps) {
    const { values, accessibilityLabel, testID, style } = props;
    const { tokens } = useTheme();
    const tone = toneOf(props);
    const plot = skin.height[sizeOf(props)];
    const fill = barColor(tokens, tone);

    // No values means no bars: warn so an empty series is not mistaken for a
    // flat trend.
    devWarn(values.length === 0, "[canvas] <Sparkline />: `values` is empty; the strip renders with no bars.");

    // Bar height maps its value against the series max (finite values only), with
    // a 2px floor so a zero/empty bucket still reads as a bar.
    const finite = values.filter((v) => Number.isFinite(v));
    const max = Math.max(1, ...finite);

    // The bars grow with `flexGrow`, so the strip needs a defined width or they
    // collapse to 0 and render blank. Give it the skin's intrinsic width unless
    // the caller already sizes it via `width` or `flex`/`flexBasis`/`flexGrow`.
    const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
    const sized = flat.width != null || flat.flex != null || flat.flexBasis != null || flat.flexGrow != null;
    const root: ViewStyle = { flexDirection: "row", alignItems: "flex-end", gap: skin.gap, height: plot };
    if (!sized) root.width = skin.defaultWidth;

    // The line variant plots one continuous 2px polyline through the values;
    // it needs a measured pixel width (the bar strip flexes instead).
    const [lineWidth, setLineWidth] = useState(0);
    if (props.line) {
      const pad = 1.5; // half the stroke, so the line never clips at the edges
      const min = Math.min(...(finite.length ? finite : [0]));
      const span = Math.max(1e-9, max - min);
      const points = values.map((v, i) => {
        const value = Number.isFinite(v) ? v : 0;
        const x = values.length > 1 ? (i / (values.length - 1)) * (lineWidth - pad * 2) + pad : lineWidth / 2;
        const y = plot - pad - ((value - min) / span) * (plot - pad * 2);
        return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
      });
      return (
        <View
          role="img"
          accessibilityLabel={accessibilityLabel}
          aria-label={accessibilityLabel}
          testID={testID}
          onLayout={(e) => setLineWidth(e.nativeEvent.layout.width)}
          style={[root, style]}
        >
          {lineWidth > 0 && values.length > 0 ? (
            <Svg width={lineWidth} height={plot}>
              <Path
                d={`M${points[0]} ${points
                  .slice(1)
                  .map((p) => `L${p}`)
                  .join(" ")}`}
                stroke={fill}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </Svg>
          ) : null}
        </View>
      );
    }

    return (
      <View
        role="img"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        testID={testID}
        style={[root, style]}
      >
        {values.map((v, i) => {
          const value = Number.isFinite(v) ? v : 0;
          const h = Math.max(2, Math.round((value / max) * plot));
          return (
            <View
              key={i}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: skin.barRadius, backgroundColor: fill, height: h }}
            />
          );
        })}
      </View>
    );
  };
}
