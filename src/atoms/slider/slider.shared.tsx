import { useRef, useState } from "react";
import {
  PanResponder,
  type LayoutChangeEvent,
  type GestureResponderEvent,
  type AccessibilityActionEvent,
} from "react-native";
import { View, useTheme, useControllableState, FOCUS_RESET, type ColorTokens, type ViewProps, type ViewStyle, type StyleProp } from "../../style/index.js";

// Shared Slider shell. Uses React Native's primitives DIRECTLY (no engine className
// layer) and reads the active brand tokens via useTheme, so the track/fill/thumb
// follow light/dark and the glass surface. The shared structure (the track + filled
// range + draggable thumb, the geometry math, the PanResponder drag, tap-to-jump,
// and the full adjustable accessibility) lives here once; a platform file supplies
// only its track + thumb styles (a SliderSkin) and calls createSlider. PanResponder
// is React Native's gesture system and works on iOS, Android, and react-native-web
// alike, so the drag is one cross-platform code path (no Platform.OS branch).

export interface SliderProps {
  /** Controlled value; omit for uncontrolled use. The thumb sits at this value (clamped to [min, max]). */
  value?: number;
  /** Initial value for uncontrolled use (a bare <Slider /> drags out of the box). Default `min`. */
  defaultValue?: number;
  /** Lower bound of the range. Default 0. */
  min?: number;
  /** Upper bound of the range. Default 100. */
  max?: number;
  /** Snap increment. Default 1. Set to a fraction for finer control. */
  step?: number;
  /** Fired with the next (clamped, snapped) value as the thumb is dragged or the track tapped (both modes). */
  onChange?: (value: number) => void;
  /** E2E hook forwarded to the slider container. */
  testID?: string;
  // Size (pick one; default is the standard track + thumb).
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Accessible name for the slider (e.g. "Volume"). */
  accessibilityLabel?: string;
  /** Extra style on the slider container, applied last. */
  style?: StyleProp<ViewStyle>;
}

export type Size = "small" | "base" | "large";

// Size precedence within the axis: large > small > default (first match wins),
// matching the other atoms.
function sizeOf(p: SliderProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The only thing a platform skin owns: the track geometry (height + radius), the
// thumb (diameter + border + shadow), and the press/state feedback, all built from
// the active tokens for a given size and pressed state. The fill is always the brand
// `primary` (dimmed via `muted` when disabled); the skin never injects a platform
// default color.
export interface SliderSkin {
  /** Track height for a size, used by the shell for hit geometry and to center the thumb. */
  trackHeight: (size: Size) => number;
  /** Thumb diameter for a size, used by the shell to position the thumb on the track. */
  thumbSize: (size: Size) => number;
  /** The full-width track (rounded rail) style. */
  track: (tokens: ColorTokens, size: Size, disabled: boolean) => ViewStyle;
  /** The filled portion from min to the value (its width is set by the shell). */
  fill: (tokens: ColorTokens, size: Size, disabled: boolean) => ViewStyle;
  /** The draggable circular thumb (its left/top offset is set by the shell). */
  thumb: (tokens: ColorTokens, size: Size, disabled: boolean, pressed: boolean) => ViewStyle;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Snap a raw value to the step grid, anchored at `min`, then clamp to [min, max].
function snap(raw: number, min: number, max: number, step: number): number {
  if (step <= 0) return clamp(raw, min, max);
  const steps = Math.round((raw - min) / step);
  const snapped = min + steps * step;
  // Round off floating-point drift from non-integer steps (e.g. 0.1).
  const decimals = (String(step).split(".")[1] ?? "").length;
  const fixed = decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;
  return clamp(fixed, min, max);
}

/** Build a Slider component from a platform skin. */
export function createSlider(skin: SliderSkin) {
  return function Slider(props: SliderProps) {
    const { min = 0, max = 100, step = 1, onChange, disabled, accessibilityLabel, style } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);

    // Controlled when `value` is provided, self-managed otherwise, so a bare
    // <Slider /> drags out of the box (the standard library contract).
    const [value, setValue] = useControllableState<number>(
      props.value,
      props.defaultValue ?? min,
      onChange,
    );

    // Treat a NaN value as "no value": fall back to `min` rather than letting NaN
    // flow through clamp (Math.min/max propagate NaN) and poison the geometry
    // (fillWidth/thumbLeft) and the announced aria-valuenow/accessibilityValue.
    const raw = Number.isNaN(value) ? min : value;
    const current = clamp(raw, min, max);
    const fraction = max > min ? (current - min) / (max - min) : 0;

    const trackHeight = skin.trackHeight(size);
    const thumb = skin.thumbSize(size);

    // The measured track width (excluding the thumb's own travel, see below). Kept in
    // a ref for the gesture handlers (which capture once) and in state to trigger a
    // re-render that paints the fill/thumb at the right spot once measured.
    const [trackWidth, setTrackWidth] = useState(0);
    const widthRef = useRef(0);
    const [pressed, setPressed] = useState(false);
    // Web keyboard focus: paint the thumb's focus ring (the same ring the drag
    // shows) while the slider holds focus. Stays false on native touch usage.
    const [focused, setFocused] = useState(false);

    const onLayout = (e: LayoutChangeEvent) => {
      const _l = e.nativeEvent.layout; if (!_l) return; const w = _l.width;
      widthRef.current = w;
      setTrackWidth(w);
    };

    // The thumb travels along the rail inset by its own radius on each end, so its
    // center reaches min at the left edge and max at the right edge. Convert a local
    // touch x (relative to the track's left edge) into a value over that travel span.
    const valueFromX = (localX: number): number => {
      const w = widthRef.current;
      const travel = Math.max(1, w - thumb);
      const f = clamp((localX - thumb / 2) / travel, 0, 1);
      return snap(min + f * (max - min), min, max, step);
    };

    const emit = (next: number) => {
      if (next !== current) setValue(next);
    };

    // Refs so the once-created PanResponder always calls the freshest closures
    // (which capture the current value, geometry, and the disabled flag). They are
    // declared BEFORE the PanResponder so its handlers can read them.
    const emitRef = useRef(emit);
    emitRef.current = emit;
    const valueFromXRef = useRef(valueFromX);
    valueFromXRef.current = valueFromX;
    const disabledRef = useRef(disabled);
    disabledRef.current = disabled;

    // One PanResponder drives both the tap (jump to the touch point) and the drag
    // (track the finger). It is created once per mount; the handlers read live refs,
    // so they always see the latest geometry and props without re-subscribing.
    const pan = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponder: () => !disabledRef.current,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          if (disabledRef.current) return;
          setPressed(true);
          emitRef.current(valueFromXRef.current(e.nativeEvent.locationX));
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          if (disabledRef.current) return;
          emitRef.current(valueFromXRef.current(e.nativeEvent.locationX));
        },
        onPanResponderRelease: () => setPressed(false),
        onPanResponderTerminate: () => setPressed(false),
      }),
    ).current;

    // Keyboard / switch-control / VoiceOver adjust: increment and decrement by one step.
    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const name = event.nativeEvent.actionName;
      if (name === "increment") emit(snap(current + step, min, max, step));
      else if (name === "decrement") emit(snap(current - step, min, max, step));
    };

    // Web keyboard operability (the WAI-ARIA slider pattern): arrows nudge by one
    // step, PageUp/PageDown by a coarse page (10 steps), Home/End jump to the ends;
    // snap clamps every result to [min, max]. react-native-web forwards `onKeyDown`
    // to the DOM node, but View's RN prop types omit it (it is web-only), so the
    // handler rides in through a cast; natively View has no onKeyDown and never
    // invokes it, so this is a no-op there — additive web-only EVENT handling, the
    // same pattern as useEscapeKey, NOT a web-only render branch.
    const pageStep = step * 10;
    const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
      if (disabled) return;
      let next: number;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp": next = current + step; break;
        case "ArrowLeft":
        case "ArrowDown": next = current - step; break;
        case "PageUp": next = current + pageStep; break;
        case "PageDown": next = current - pageStep; break;
        case "Home": next = min; break;
        case "End": next = max; break;
        default: return; // let every other key through (Tab, etc.)
      }
      // Swallow the key so Arrow/Page/Home/End don't also scroll the page.
      event.preventDefault();
      emit(snap(next, min, max, step));
    };
    const webKeyboardProps = { onKeyDown } as unknown as ViewProps;

    // Fill spans from the left edge to the thumb center.
    const fillWidth = thumb / 2 + fraction * Math.max(0, trackWidth - thumb);
    // Thumb left so its center lands on the value point.
    const thumbLeft = fraction * Math.max(0, trackWidth - thumb);
    // Vertically center the thumb on the rail: the container is `rowHeight` tall and
    // centers the track, so the rail's center sits at rowHeight/2; the absolutely
    // positioned thumb (height `thumb`) must have its center there too.
    const rowHeight = Math.max(thumb, trackHeight) + 16;
    const thumbTop = rowHeight / 2 - thumb / 2;

    return (
      <View
        {...pan.panHandlers}
        {...webKeyboardProps}
        onLayout={onLayout}
        testID={props.testID}
        // A keyboard tab-stop on the web (RNW maps `focusable` to tabIndex 0/-1); the
        // arrow/page/home/end keys then drive it through onKeyDown above. Disabled drops
        // it out of the tab order.
        focusable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: current }}
        // Cross-platform ARIA value props: map to accessibilityValue on native, and RNW
        // renders them as aria-valuemin/max/now (which RNW does NOT derive from
        // accessibilityValue), so web screen readers announce the value too.
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        accessibilityState={{ disabled: !!disabled }}
        // RNW forwards neither accessibilityState nor accessibilityValue to the DOM,
        // so pair the disabled state with an aria-disabled alias (matching the
        // aria-valuemin/max/now aliases above) for web screen readers.
        aria-disabled={!!disabled}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={onAccessibilityAction}
        style={[
          {
            width: "100%",
            justifyContent: "center",
            // Give the touch area a comfortable height around the thin rail.
            height: rowHeight,
            opacity: disabled ? 0.5 : 1,
          },
          // The thumb paints the focus ring, so suppress RNW's default outline on the
          // focused container (no-op on native).
          FOCUS_RESET,
          style,
        ]}
      >
        {/* The rail. */}
        <View style={skin.track(tokens, size, !!disabled)}>
          {/* The filled range, from the left edge to the value. */}
          <View style={[skin.fill(tokens, size, !!disabled), { width: fillWidth }]} />
        </View>
        {/* The thumb. The parent View's PanResponder owns the whole gesture (tapping the
            track to jump AND dragging the thumb), so the thumb is a plain View that only
            PAINTS the value position and the per-OS press feedback (the iOS opacity dim,
            the Android M3 state-layer ring, the web focus ring), driven by `pressed` from
            the PanResponder OR web keyboard `focused`. It carries pointerEvents="none" so
            it never competes with the parent for the touch responder, keeping the drag/jump
            on one code path. */}
        <View
          pointerEvents="none"
          style={[skin.thumb(tokens, size, !!disabled, pressed || focused), { left: thumbLeft, top: thumbTop }]}
        />
      </View>
    );
  };
}
