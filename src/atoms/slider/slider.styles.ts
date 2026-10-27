import { type TextStyle } from "react-native";
import { alpha, tabularNums, MONO_FONT, type ColorTokens } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type SliderSkin, type Size } from "./slider.shared.js";

// Co-located Slider skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (`K.def('slider')` in tools/v4/handoff/cv-kit-controls.js, and its iOS and Android rows
// `K.PF.slider` in cv-kit-platform.js). The filled range is always the accent (`primary`),
// never a platform default; only the native SHAPE changes per OS:
//   Web: a 4/6/8px rail in the raised neutral fill, the accent range glowing (a 14px
//     halo of the accent's glow), and a 16/20/26px white thumb with a soft drop shadow
//     that a hovering or pressing pointer rings in the accent's soft wash (8px). The
//     header is a 500 13px title in the secondary ink with the value in the 500 13px mono
//     face, 12px above the rail. Disabled at 0.4.
//   iOS (iOS 27 kit, Sliders symbol group): a 5/6/7pt capsule rail with Apple's smooth
//     (continuous) corner curve in the raised neutral fill, and a 37x24pt capsule knob
//     (borderCurve continuous, a two-layer soft shadow), the accent range on the rail. On
//     iOS 26+ the knob "transforms into liquid glass during interaction" (WWDC25): it
//     renders through GlassSurface, so it is a real Apple Liquid Glass puck refracting the
//     rail, and it stays opaque on press rather than dimming. Under solid surface /
//     Reduce Transparency / Increase Contrast it degrades to the opaque WHITE CAPSULE.
//     Stepped sliders show small tick dots along the rail, under the fill. The header
//     sits 6pt above the rail. Disabled at 0.5.
//   Android (M3 Expressive sliders, m3.material.io/components/sliders/specs): the
//     THICK-track redesign. XS (default): a 16dp track split into an active (accent) and
//     an inactive (raised neutral) segment, outer ends at 8dp and inner ends at 2dp, a
//     4dp-wide x 44dp-tall BAR handle in the accent inset by an 8dp gap from BOTH
//     segments, and a 4dp stop indicator dot in the inactive track end. The `large` size
//     maps to M3 S (24dp track, same 44dp handle). Flat, no shadow, and NO circular thumb
//     or state-layer disc (Expressive dropped both). The header sits 4dp above the
//     track. Disabled at 0.38.
// A disabled native range and handle soften to the subtle ink.
// The native header steps with the size (a 500 title at 12/16, 14/20 or 16/24 in the
// foreground, the value in the secondary ink with tabular figures), and every platform's
// description is the 12px subtle line.

// iOS soft knob shadow (the iOS 27 kit floats the knob just off the rail).
const IOS_THUMB_SHADOW = `0px 1px 3px ${alpha("#000000", 0.18)}, 0px 6px 14px -4px ${alpha("#000000", 0.22)}`;

// ----- Header type. The native title steps with the size; the web's is one 13px line.
const NATIVE_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  base: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 16, lineHeight: 24 },
};
const WEB_TYPE: TextStyle = { fontSize: 13, lineHeight: 17 };
const DESCRIPTION_TYPE: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "400" };

function nativeLabel(tokens: ColorTokens, size: Size): TextStyle {
  return { fontWeight: "500", flexShrink: 1, color: tokens.foreground, ...NATIVE_TYPE[size] };
}
function nativeValue(tokens: ColorTokens, size: Size): TextStyle {
  return { fontWeight: "500", color: tokens["muted-foreground"], ...tabularNums(), ...NATIVE_TYPE[size] };
}
function description(tokens: ColorTokens): TextStyle {
  return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"], ...DESCRIPTION_TYPE };
}
const railFill = (t: ColorTokens) => t["surface-raised"] ?? t.secondary;
const subtle = (t: ColorTokens) => t["subtle-foreground"] ?? t["muted-foreground"];

// ----- iOS (iOS 27 kit): capsule rail, 37x24pt capsule knob -----
const IOS_TRACK_H: Record<Size, number> = { small: 5, base: 6, large: 7 };
// Knob: the kit's Knob symbol is a 37x24pt horizontal capsule (NOT a circle);
// small/large scale it proportionally, radius = height / 2.
const IOS_KNOB: Record<Size, { w: number; h: number }> = {
  small: { w: 32, h: 21 },
  base: { w: 37, h: 24 },
  large: { w: 42, h: 27 },
};

export const iosSkin: SliderSkin = {
  trackHeight: (size) => IOS_TRACK_H[size],
  thumbWidth: (size) => IOS_KNOB[size].w,
  thumbHeight: (size) => IOS_KNOB[size].h,
  // HIG minimum touch target: the interactive row is never shorter than 44pt.
  minRowHeight: 44,
  headerGap: 6,
  descriptionGap: 6,
  disabledOpacity: 0.5,
  track: (t, size) => ({
    width: "100%",
    height: IOS_TRACK_H[size],
    borderRadius: 9999,
    borderCurve: "continuous",
    overflow: "visible",
    backgroundColor: railFill(t),
  }),
  fill: (t, size, disabled) => ({
    position: "absolute",
    left: 0,
    top: 0,
    height: IOS_TRACK_H[size],
    borderRadius: 9999,
    borderCurve: "continuous",
    backgroundColor: disabled ? subtle(t) : t.primary,
  }),
  thumb: (_t, size) => {
    const k = IOS_KNOB[size];
    return {
      position: "absolute",
      width: k.w,
      height: k.h,
      borderRadius: 9999,
      borderCurve: "continuous",
      // The shell sets `top` to vertically center the knob on the rail.
      backgroundColor: "#ffffff",
      borderWidth: 0.5,
      borderColor: alpha("#000000", 0.04),
      boxShadow: IOS_THUMB_SHADOW,
      // No pressed OPACITY treatment: the iOS knob stays opaque through a drag. This white
      // fill is what the knob degrades back to under solid surface / Reduce Transparency.
    };
  },
  // iOS 26 slider handles "transform into liquid glass during interaction" (WWDC25):
  // route the knob through GlassSurface so on iOS 26+ (glass is the platform default)
  // it becomes an Apple Liquid Glass puck that refracts the rail.
  // An OPAQUE white under-fill so the knob reads as a BRIGHT puck, matching the real
  // iOS handle (a bright white knob whose glass is the lit edge + interactive refraction,
  // not a see-through frost). This is deliberately not translucent: verified on the iOS
  // 26.3 sim, the GlassView "regular" material adaptively darkens ANY translucent backing
  // toward the content behind it, so a translucent white knob renders as a dim gray
  // lozenge over a dark UI (reads as inactive). A solid white backing keeps it bright on
  // every renderer (iOS GlassView, web/Android frost), while the GlassView still supplies
  // the real Liquid Glass edge-lensing, specular, and `isInteractive` response on top,
  // the way iOS 26 "transforms controls into liquid glass during interaction".
  glassTint: () => "#ffffff",
  // Stepped sliders: small tick dots along the rail (the kit's Ticks layer
  // sits UNDER the Fill, so the filled side covers its dots).
  tick: (t) => ({ backgroundColor: t["muted-foreground"] }),
  label: nativeLabel,
  description,
  value: nativeValue,
};

// ----- Android (M3 Expressive): thick split track, 4x44dp bar handle -----
// XS (default): track 16dp; `large` maps to S: track 24dp (M3 has no size below XS, so
// `small` also renders the XS anatomy). Handle is a 4dp-wide x 44dp-tall accent bar at
// every mapped size, inset by an 8dp gap from both track segments; the inactive end
// carries a 4dp stop indicator dot.
const M3_TRACK_H: Record<Size, number> = { small: 16, base: 16, large: 24 };
const M3_TRACK_R = platformShape.android.sliderTrack; // outer track shape (XS + S), the M3 small shape
const M3_INNER_R = platformShape.android.sliderTrackInner; // the segment edge facing the handle gap
const M3_HANDLE_W = 4;
const M3_HANDLE_H = 44;

export const androidSkin: SliderSkin = {
  trackHeight: (size) => M3_TRACK_H[size],
  thumbWidth: () => M3_HANDLE_W,
  thumbHeight: () => M3_HANDLE_H,
  // The Expressive gap between the handle and BOTH track segments.
  trackGap: 8,
  // M3 minimum touch target: the interactive row is never shorter than 48dp.
  minRowHeight: 48,
  headerGap: 4,
  descriptionGap: 4,
  disabledOpacity: 0.38,
  // The 4dp stop indicator dot in the inactive track end.
  endStop: true,
  tickSize: 4,
  track: (t) => ({
    // Inactive segment: the raised neutral fill.
    backgroundColor: railFill(t),
    // Outer end fully shaped (8dp), inner edge lightly rounded toward the gap.
    borderTopLeftRadius: M3_INNER_R,
    borderBottomLeftRadius: M3_INNER_R,
    borderTopRightRadius: M3_TRACK_R,
    borderBottomRightRadius: M3_TRACK_R,
  }),
  fill: (t, _size, disabled) => ({
    // Active segment: the accent (M3 active track = primary).
    backgroundColor: disabled ? subtle(t) : t.primary,
    borderTopLeftRadius: M3_TRACK_R,
    borderBottomLeftRadius: M3_TRACK_R,
    borderTopRightRadius: M3_INNER_R,
    borderBottomRightRadius: M3_INNER_R,
  }),
  thumb: (t, _size, disabled) => ({
    position: "absolute",
    width: M3_HANDLE_W,
    height: M3_HANDLE_H,
    borderRadius: 9999,
    // The shell sets `top` to vertically center the bar handle on the track.
    backgroundColor: disabled ? subtle(t) : t.primary,
    // Flat and static: M3 Expressive dropped the drop shadow AND the pressed
    // state-layer disc (the handle is plain accent in every state).
  }),
  // Stop indicator roles: on-primary over the active segment, the subtle ink over the
  // inactive one.
  tick: (t, _size, _disabled, onActive) => ({
    backgroundColor: onActive ? t["primary-foreground"] : subtle(t),
  }),
  label: nativeLabel,
  description,
  value: nativeValue,
};

// ----- Web: the thin glowing rail and the white thumb -----
const WEB_TRACK_H: Record<Size, number> = { small: 4, base: 6, large: 8 };
const WEB_THUMB: Record<Size, number> = { small: 16, base: 20, large: 26 };
const WEB_THUMB_SHADOW = `0px 2px 6px ${alpha("#000000", 0.35)}`;

export const webSkin: SliderSkin = {
  trackHeight: (size) => WEB_TRACK_H[size],
  thumbWidth: (size) => WEB_THUMB[size],
  thumbHeight: (size) => WEB_THUMB[size],
  // The row is the thumb's own height: the header sits 12px above it.
  rowPadding: 0,
  headerGap: 12,
  descriptionGap: 4,
  disabledOpacity: 0.4,
  track: (t, size) => ({
    width: "100%",
    borderRadius: 9999,
    overflow: "visible",
    height: WEB_TRACK_H[size],
    backgroundColor: railFill(t),
  }),
  fill: (t, size) => ({
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9999,
    height: WEB_TRACK_H[size],
    backgroundColor: t.primary,
    boxShadow: `0px 0px 14px ${t.glow ?? t.ring}`,
  }),
  thumb: (t, size, _disabled, active) => {
    const d = WEB_THUMB[size];
    return {
      position: "absolute",
      borderRadius: 9999,
      width: d,
      height: d,
      // The shell sets `top` to vertically center the thumb on the rail.
      backgroundColor: "#ffffff",
      // A hovering or pressing pointer rings the thumb in the accent's soft wash. Keyboard
      // focus is not this ring but the kit's focus ring, which the shell draws.
      boxShadow: active ? `${WEB_THUMB_SHADOW}, 0px 0px 0px 8px ${t["primary-soft"] ?? t.accent}` : WEB_THUMB_SHADOW,
    };
  },
  // The hand-off's thumb is white on either scheme, so the glass knob keeps the white under-fill.
  glassTint: () => "#ffffff",
  label: (t) => ({ fontWeight: "500", flexShrink: 1, color: t["muted-foreground"], ...WEB_TYPE }),
  description,
  value: (t) => ({ fontWeight: "500", fontFamily: MONO_FONT, color: t.foreground, ...WEB_TYPE }),
};
