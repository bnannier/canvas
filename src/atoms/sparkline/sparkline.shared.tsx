import { View, useTheme, alpha, palette, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";
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

    // Bar height maps its value against the series max (finite values only), with
    // a 2px floor so a zero/empty bucket still reads as a bar.
    const finite = values.filter((v) => Number.isFinite(v));
    const max = Math.max(1, ...finite);

    return (
      <View
        role="img"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        testID={testID}
        style={[{ flexDirection: "row", alignItems: "flex-end", gap: skin.gap, height: plot }, style]}
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
