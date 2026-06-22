import { type ViewStyle } from "react-native";
import { alpha } from "../../style/index.js";
import { type SliderSkin, type Size } from "./slider.shared.js";

// Co-located Slider skins, one per platform, all driven by the brand tokens (passed
// in from useTheme so they follow light/dark). The BRAND survives on every platform:
// the filled range is always the indigo `primary`, never a platform default (no iOS
// system blue, no M3 default). Only the native SHAPE changes per OS:
//   iOS (HIG / iOS 27 kit Sliders): a THIN ~4pt rounded rail, a large ~28pt WHITE
//     circular knob with a soft drop shadow and a hairline border, brand fill. Press
//     dims the knob slightly (iOS opacity feedback), it does not grow.
//   Android (Material 3): a ~4pt rounded track, a SMALLER ~20pt circular thumb that
//     gains a translucent primary state-layer ring on press (the M3 handle state
//     layer), brand fill. Flat (no drop shadow), per M3. The ripple-style feedback is
//     the state-layer ring here rather than an android_ripple, because the parent
//     PanResponder owns the whole drag/tap gesture (see slider.shared.tsx).
//   Web: the established Canvas look, an iOS-like thin rail with a small bordered
//     white thumb (matched to shadcn's slider: h-1.5 bg-muted track, bg-primary
//     range, a size-4 white thumb with a primary border and a soft shadow).
// Disabled dims the whole control (opacity in the shell) and softens the fill toward
// `muted` here.

const RAIL: ViewStyle = { width: "100%", borderRadius: 999, overflow: "visible" };
const FILL_BASE: ViewStyle = { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999 };
const THUMB_BASE: ViewStyle = { position: "absolute", borderRadius: 999 };

// iOS soft knob shadow (HIG sliders float the knob just off the rail).
const IOS_THUMB_SHADOW: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.18,
  shadowRadius: 3,
  elevation: 3,
};

// ----- iOS (HIG): thin 4pt rail, ~28pt white circular knob -----
const IOS_TRACK_H: Record<Size, number> = { small: 3, base: 4, large: 5 };
const IOS_THUMB: Record<Size, number> = { small: 24, base: 28, large: 32 };

export const iosSkin: SliderSkin = {
  trackHeight: (size) => IOS_TRACK_H[size],
  thumbSize: (size) => IOS_THUMB[size],
  track: (t, size) => ({
    ...RAIL,
    height: IOS_TRACK_H[size],
    // The iOS inactive rail is a light fill; `muted` reads correctly on both schemes.
    backgroundColor: t.muted,
  }),
  fill: (t, size, disabled) => ({
    ...FILL_BASE,
    height: IOS_TRACK_H[size],
    backgroundColor: disabled ? t["muted-foreground"] : t.primary,
  }),
  thumb: (_t, size, _disabled, pressed) => {
    const d = IOS_THUMB[size];
    return {
      ...THUMB_BASE,
      width: d,
      height: d,
      // The shell sets `top` to vertically center the thumb on the rail.
      backgroundColor: "#ffffff",
      borderWidth: 0.5,
      borderColor: alpha("#000000", 0.04),
      ...IOS_THUMB_SHADOW,
      // iOS press feedback: a subtle opacity dim on the knob (no growth).
      opacity: pressed ? 0.85 : 1,
    };
  },
};

// ----- Android (Material 3): 4pt track, ~20pt thumb, state-layer ring on press -----
const M3_TRACK_H: Record<Size, number> = { small: 4, base: 4, large: 6 };
const M3_THUMB: Record<Size, number> = { small: 18, base: 20, large: 24 };
// The state layer is the M3 pressed ring: a translucent disc behind the thumb. We
// emulate it by widening the thumb's border (a ring of the primary at low alpha)
// when pressed, since the shell positions a single thumb node.
const M3_STATE_RING = 5;

export const androidSkin: SliderSkin = {
  trackHeight: (size) => M3_TRACK_H[size],
  thumbSize: (size) => M3_THUMB[size],
  track: (t, size) => ({
    ...RAIL,
    height: M3_TRACK_H[size],
    // M3 inactive track is the surface-variant tint; `muted` is the closest token.
    backgroundColor: t.muted,
  }),
  fill: (t, size, disabled) => ({
    ...FILL_BASE,
    height: M3_TRACK_H[size],
    backgroundColor: disabled ? t["muted-foreground"] : t.primary,
  }),
  thumb: (t, size, disabled, pressed) => {
    const d = M3_THUMB[size];
    const fill = disabled ? t["muted-foreground"] : t.primary;
    return {
      ...THUMB_BASE,
      width: d,
      height: d,
      // The shell sets `top` to vertically center the thumb on the rail.
      backgroundColor: fill,
      // M3 is flat (no drop shadow). The pressed state layer is a translucent
      // primary ring around the thumb.
      ...(pressed && !disabled
        ? { borderWidth: M3_STATE_RING, borderColor: alpha(t.primary, 0.2) }
        : { borderWidth: 0 }),
    };
  },
};

// ----- Web: the established Canvas look (shadcn-matched) -----
const WEB_TRACK_H: Record<Size, number> = { small: 5, base: 6, large: 8 };
const WEB_THUMB: Record<Size, number> = { small: 14, base: 16, large: 20 };

export const webSkin: SliderSkin = {
  trackHeight: (size) => WEB_TRACK_H[size],
  thumbSize: (size) => WEB_THUMB[size],
  track: (t, size) => ({
    ...RAIL,
    height: WEB_TRACK_H[size],
    backgroundColor: t.muted,
  }),
  fill: (t, size, disabled) => ({
    ...FILL_BASE,
    height: WEB_TRACK_H[size],
    backgroundColor: disabled ? t["muted-foreground"] : t.primary,
  }),
  thumb: (t, size, disabled, pressed) => {
    const d = WEB_THUMB[size];
    return {
      ...THUMB_BASE,
      width: d,
      height: d,
      // The shell sets `top` to vertically center the thumb on the rail.
      backgroundColor: t.background,
      borderWidth: 1,
      borderColor: disabled ? t["muted-foreground"] : t.primary,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      // Web press feedback: a faint primary focus ring grows on press (hover:ring-4 /
      // focus-visible:ring-4 in shadcn).
      ...(pressed && !disabled ? { borderColor: alpha(t.primary, 0.5), borderWidth: 4 } : null),
    };
  },
};
