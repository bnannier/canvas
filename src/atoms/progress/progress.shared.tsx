import { useEffect, useRef, useState } from "react";
import { Animated, Easing, type LayoutChangeEvent } from "react-native";
import { View, useTheme, type ColorTokens, type ViewStyle, type StyleProp } from "../../style/index.js";

// Shared Progress shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via useTheme, so the track/fill colors follow
// light/dark. The shared structure (the rounded full-width track + filled bar, the
// determinate vs. indeterminate logic, the value clamp, the accessibility contract, and
// the sliding-bar animation) lives here once; a platform file supplies only its measured
// shape (a ProgressSkin) and calls createProgress. Styles are plain RN objects, which work
// on iOS, Android, and web alike.
//
// Progress is OUTPUT-ONLY: it reports task completion, so there is no onChange and the
// control is never interactive (no Pressable, no press feedback).
//
//   Determinate  (default): the fill width is `value`, clamped to 0..1.
//   Indeterminate (`indeterminate`): `value` is ignored and a short bar slides and loops
//     across the track.

export interface ProgressProps {
  /** Completion as a 0..1 fraction (clamped). Ignored when `indeterminate`. Defaults to 0. */
  value?: number;
  /** Indeterminate mode: ignore `value` and animate a sliding bar. */
  indeterminate?: boolean;
  // Size axis (track thickness; pick one, default is the medium track).
  small?: boolean;
  large?: boolean;
  /** Accessible description of what is progressing. */
  accessibilityLabel?: string;
  /** Extra style on the track, applied last. */
  style?: StyleProp<ViewStyle>;
}

export type Size = "small" | "base" | "large";

// Size precedence within the axis: large > small > default (first match wins).
function sizeOf(p: ProgressProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// Clamp the value to a 0..1 fraction (the public contract). NaN/undefined collapse to 0.
function clampValue(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

// What a platform skin owns: the track height + radius per size, the track (inactive)
// fill, the active fill, and the fraction of the track width the sliding indeterminate
// bar occupies. Everything else (structure, value logic, animation, a11y) is the shell.
export interface ProgressSkin {
  /** Track thickness (px) per size. */
  height: Record<Size, number>;
  /** Corner radius (px) per size for both the track and the fill. */
  radius: Record<Size, number>;
  /** Inactive track fill. */
  trackColor: (tokens: ColorTokens) => string;
  /** Active (filled) bar color. */
  fillColor: (tokens: ColorTokens) => string;
  /** Width of the sliding indeterminate bar as a fraction (0..1) of the track. */
  indeterminateWidth: number;
}

/** Build a Progress component from a platform skin. */
export function createProgress(skin: ProgressSkin) {
  return function Progress(props: ProgressProps) {
    const { value, indeterminate, accessibilityLabel, style } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);

    const height = skin.height[size];
    const radius = skin.radius[size];
    const trackColor = skin.trackColor(tokens);
    const fillColor = skin.fillColor(tokens);
    const fraction = clampValue(value);

    // Measured track width, needed to slide the indeterminate bar in absolute px (a
    // translateX is the cross-platform-safe way to move it; animating `left`/`width` is
    // not). Held in state so the interpolation re-derives once the layout reports a real
    // width (a ref alone would never re-render, leaving the bar parked at 0), matching the
    // slider atom's measured-track pattern.
    const [trackWidth, setTrackWidth] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;

    const onLayout = (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w !== trackWidth) setTrackWidth(w);
    };

    // One sweep (the bar enters from the left edge and exits the right) per ~1100ms,
    // looping forever while in indeterminate mode. Re-armed when the mode or the measured
    // width changes. The loop runs on the JS driver (useNativeDriver:false) on every
    // platform: the native driver's looping is unreliable (Animated.loop +
    // useNativeDriver:true runs one pass then freezes on react-native-web, and does not loop
    // under the New Architecture on iOS). A slow 1100ms sweep is cheap on the JS thread.
    // This matches the spinner atom's loop convention.
    useEffect(() => {
      if (!indeterminate || trackWidth <= 0) return;
      progress.setValue(0);
      const loop = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      );
      loop.start();
      return () => loop.stop();
    }, [indeterminate, trackWidth, progress]);

    const barWidth = trackWidth * skin.indeterminateWidth;
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-barWidth, trackWidth],
    });

    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={
          indeterminate ? { min: 0, max: 100 } : { min: 0, max: 100, now: Math.round(fraction * 100) }
        }
        // Cross-platform ARIA value props (RNW renders aria-valuemin/max/now; native maps
        // them to accessibilityValue). Indeterminate omits `now`.
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(fraction * 100)}
        onLayout={onLayout}
        style={[
          { width: "100%", height, borderRadius: radius, backgroundColor: trackColor, overflow: "hidden" },
          style,
        ]}
      >
        {indeterminate ? (
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: `${skin.indeterminateWidth * 100}%`,
              borderRadius: radius,
              backgroundColor: fillColor,
              transform: [{ translateX }],
            }}
          />
        ) : (
          <View
            style={{
              height: "100%",
              width: `${fraction * 100}%`,
              borderRadius: radius,
              backgroundColor: fillColor,
            }}
          />
        )}
      </View>
    );
  };
}
