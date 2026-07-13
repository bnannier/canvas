import { useEffect, useRef, useState, type ComponentType } from "react";
import { Animated, Easing, type LayoutChangeEvent } from "react-native";
import { View, useTheme, useFieldWidth, type ColorTokens, type FieldWidthProps, type ViewStyle, type StyleProp } from "../../style/index.js";

// Shared Progress shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via useTheme, so the track/fill colors follow
// light/dark. The shared structure (the rounded track + filled bar, the determinate vs.
// indeterminate logic, the value clamp, the accessibility contract, the standard field
// width axis, and the sliding-bar animation) lives here once; a platform file supplies
// only its measured shape (a ProgressSkin) plus any per-OS parts and calls
// createProgress. Styles are plain RN objects, which work on iOS, Android, and web alike.
//
// Progress is OUTPUT-ONLY: it reports task completion, so there is no onChange and the
// control is never interactive (no Pressable, no press feedback).
//
//   Determinate  (default): the fill width is `value`, clamped to 0..1.
//   Indeterminate (`indeterminate`): `value` is ignored and a short bar slides and loops
//     across the track (on iOS the entry threads the kit Spinner instead: iOS has no
//     linear indeterminate idiom, the activity indicator is the unknown-duration control).
//
// Width: Progress sits on the standard field width axis (src/style/field-width.ts): the
// bar RENDERS AT 320 (240 `narrow` / 480 `wide`) and shrinks inside narrower parents via
// maxWidth:"100%"; `block` restores the skin's fill-the-container width:"100%". The
// explicit width is load-bearing: in a content-sized context (a centered stage, a row)
// width:"100%" collapses to the siblings' natural width.

export interface ProgressProps extends FieldWidthProps {
  /** Completion as a 0..1 fraction (clamped). Ignored when `indeterminate`. Defaults to 0. */
  value?: number;
  /** Indeterminate mode: ignore `value` and animate a sliding bar (a spinner on iOS). */
  indeterminate?: boolean;
  // Size axis (track thickness; pick one, default is the medium track).
  small?: boolean;
  large?: boolean;
  /** Accessible description of what is progressing. */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
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
// fill, the active fill, the fraction of the track width the sliding indeterminate
// bar occupies, and the optional M3 segmented anatomy (active/track gap + stop
// indicator). Everything else (structure, value logic, animation, a11y) is the shell.
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
  /**
   * M3 anatomy (Android): the gap (dp) between the active indicator's trailing edge
   * and the inactive track, so the two read as separate segments. Omit (or 0) for the
   * continuous single-track structure (iOS/web). Determinate only: the indeterminate
   * sweep keeps the continuous rail.
   */
  trackGap?: number;
  /**
   * M3 anatomy (Android): render the stop indicator, a 4x4dp dot in the active color
   * pinned at the track's trailing edge (vertically centered, so it sits 2dp in from
   * the edge of the 8dp-thick large track). Determinate only, per M3.
   */
  stopIndicator?: boolean;
}

// The per-OS pieces a platform entry threads in beside its skin (the empty-state
// pattern, where entry files pass their platform's Button). iOS swaps the indeterminate
// visual for the kit Spinner (the UIActivityIndicatorView idiom; the iOS 27 kit's only
// indeterminate progress symbols are spinners), so progress.ios.tsx passes the iOS
// Spinner here. Web/Android pass nothing and keep the sliding-bar indeterminate.
export interface ProgressParts {
  IndeterminateSpinner?: ComponentType<{
    small?: boolean;
    large?: boolean;
    accessibilityLabel?: string;
    testID?: string;
  }>;
}

/** Build a Progress component from a platform skin (plus optional per-OS parts). */
export function createProgress(skin: ProgressSkin, parts: ProgressParts = {}) {
  return function Progress(props: ProgressProps) {
    const { value, indeterminate, accessibilityLabel, testID, style } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);
    // Standard field width axis: appended after the skin's width:"100%" so the bar
    // renders AT 320 (240 narrow / 480 wide); `block` resolves to null and the skin's
    // fill-the-container width applies.
    const widthStyle = useFieldWidth(props);

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
      const _l = e.nativeEvent.layout; if (!_l) return; const w = _l.width;
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

    // iOS indeterminate idiom: iOS has no linear indeterminate bar (the iOS 27 kit's
    // unknown-duration control is the activity indicator), so when the entry threads a
    // Spinner the skin path swaps the visual while the cross-platform `indeterminate`
    // prop stays. The Spinner announces itself (progressbar role, "Loading" default
    // label); the wrapper stays presentational and only carries the width axis so the
    // control keeps its slot in a form column.
    const IndeterminateSpinner = parts.IndeterminateSpinner;
    if (indeterminate && IndeterminateSpinner) {
      return (
        <View testID={testID} style={[{ alignItems: "center" }, widthStyle, style]}>
          <IndeterminateSpinner small={props.small} large={props.large} accessibilityLabel={accessibilityLabel} />
        </View>
      );
    }

    // M3 segmented anatomy (Android determinate): active indicator, a `trackGap` gap,
    // the inactive track, and the stop indicator dot at the trailing edge. Indeterminate
    // keeps the continuous rail (the sliding bar needs the full track, and M3's
    // indeterminate has no stop indicator).
    const gap = skin.trackGap ?? 0;
    const segmented = !indeterminate && gap > 0;
    const stopSize = !indeterminate && skin.stopIndicator ? Math.min(4, height) : 0;
    const stopInset = (height - stopSize) / 2;

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
        testID={testID}
        onLayout={onLayout}
        style={[
          { width: "100%", height, borderRadius: radius },
          // The continuous structure paints the inactive track as the container fill and
          // clips the sliding/filled bar; the segmented (M3) structure draws its own
          // track segment, so the container stays transparent.
          segmented ? null : { backgroundColor: trackColor, overflow: "hidden" as const },
          widthStyle,
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
        ) : segmented ? (
          <>
            {/* Inactive track segment: from (active edge + gap) to the trailing end.
                Percent `start` + marginStart render without waiting for measurement;
                at 100% the over-constrained box resolves to zero width. At 0 there is
                no active bar, so the track spans the full rail with no gap. */}
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                start: `${fraction * 100}%`,
                end: 0,
                marginStart: fraction > 0 ? gap : 0,
                borderRadius: radius,
                backgroundColor: trackColor,
              }}
            />
            {fraction > 0 ? (
              <View
                style={{
                  height: "100%",
                  width: `${fraction * 100}%`,
                  borderRadius: radius,
                  backgroundColor: fillColor,
                }}
              />
            ) : null}
            {stopSize > 0 ? (
              // M3 stop indicator: a 4x4dp dot in the active color pinned at the
              // trailing edge (vertically centered: flush on the 4dp base track, 2dp
              // in from the edge of the 8dp large track).
              <View
                style={{
                  position: "absolute",
                  top: stopInset,
                  end: stopInset,
                  width: stopSize,
                  height: stopSize,
                  borderRadius: stopSize / 2,
                  backgroundColor: fillColor,
                }}
              />
            ) : null}
          </>
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
