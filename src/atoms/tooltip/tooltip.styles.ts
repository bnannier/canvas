import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, shape } from "../../style/index.js";
import { typeScale } from "../../style/type-scale.js";
import { platformShape } from "../../style/platform-shape.js";

// Co-located Tooltip skins, one per platform, all driven by the theme tokens (passed
// in from useTheme so they follow the palette, the scheme and the glass surface). A
// tooltip carries no brand fill of its own; the convention on every platform is an
// INVERSE label (a dark bubble in a light theme, painted on the `foreground` token with
// `background` text) so the tip reads against the page in either scheme. Dark Factory
// has no tooltip; its only dark bubble, the toast pill, keeps one colour in every theme,
// which would all but vanish on the dark page, so the bubble keeps the per-scheme inverse
// and takes Dark Factory's type and corners:
//   Web: a bubble at the tooltip corner (Dark Factory's chip step), 6 x 10 padding, a soft
//     `md` lift, the label in Dark Factory's 12px label weight (600) at its 1.3 line height.
//   iOS: no system tooltip, so the web skin.
//   Android (Material 3 plain tooltip): a small rounded rect (its extra-small corner), the
//     inverse fill, body-small 12sp, padding 8 x 4, flat (no elevation per M3 plain), a 24dp
//     minimum height.

export type Placement = "top" | "bottom" | "left" | "right";

// The contract a platform skin fulfills. Layout (the anchored placement, the gap
// between bubble and trigger) is shared and lives in the shell; the skin supplies only the bubble surface and the label
// type, both functions of the active tokens so the inverse fill follows
// light/dark automatically.
export interface TooltipSkin {
  /** The bubble surface: shape, radius, inverse fill, padding, elevation. */
  bubble: (t: ColorTokens) => ViewStyle;
  /** The tip label: size/weight, painted in the inverse text token. */
  label: (t: ColorTokens) => TextStyle;
}

// --- shared layout fragments (identical across platforms) -------------------

// The gap between the bubble and its trigger, on whichever side the bubble
// resolves to (the old `m{b,t,r,l}-1.5` = 6).
export const BUBBLE_GAP = 6;

// How long a tip outlives the pointer leaving its trigger or its bubble, so the
// pointer can cross the gap onto the bubble (which keeps it up) without the tip
// closing on the way. Long enough for that crossing, short enough that a pointer
// moving on across a row of triggers never sees two tips at once for long.
export const HOVER_GRACE_MS = 100;

// A skin's bubble split for the anchored card: the surface (shape, fill, elevation,
// minimum height) paints the card, and the padding goes on the content inside it, so
// the hover region and the live region span the whole bubble.
const PADDING_KEYS = ["padding", "paddingHorizontal", "paddingVertical", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingStart", "paddingEnd"] as const;
export function bubbleParts(bubble: ViewStyle): { surface: ViewStyle; padding: ViewStyle } {
  const surface: ViewStyle = { ...bubble };
  const padding: ViewStyle = {};
  for (const key of PADDING_KEYS) {
    if (bubble[key] !== undefined) {
      (padding as Record<string, unknown>)[key] = bubble[key];
      delete surface[key];
    }
  }
  return { surface, padding };
}

// The no-provider fallback (AnchoredOverlay's `inlineStyle`): with no OverlayProvider
// the bubble still floats, on an absolute anchor inside the root that hugs the
// trigger, so it takes no room. The anchor is a fixed-width band centered on the
// trigger's cross axis that only positions the bubble (it takes no pointer: `box-none`)
// so a short label sits on one line rather than wrapping to the trigger's width.
const ANCHOR_BAND = 240;
const band: ViewStyle = { position: "absolute", pointerEvents: "box-none", zIndex: 1 };
export const inlineAnchor: Record<Placement, ViewStyle> = {
  top: { ...band, bottom: "100%", marginBottom: BUBBLE_GAP, left: "50%", marginLeft: -ANCHOR_BAND / 2, width: ANCHOR_BAND, alignItems: "center" },
  bottom: { ...band, top: "100%", marginTop: BUBBLE_GAP, left: "50%", marginLeft: -ANCHOR_BAND / 2, width: ANCHOR_BAND, alignItems: "center" },
  left: { ...band, end: "100%", marginEnd: BUBBLE_GAP, top: 0, bottom: 0, width: ANCHOR_BAND, alignItems: "flex-end", justifyContent: "center" },
  right: { ...band, start: "100%", marginStart: BUBBLE_GAP, top: 0, bottom: 0, width: ANCHOR_BAND, alignItems: "flex-start", justifyContent: "center" },
};

// The icon trigger: a 40px square ghost button holding the settings glyph,
// matching a ghost icon Button. Press feedback is applied by the component's
// Pressable (opacity dim on iOS/web, ripple on Android).
export const iconTrigger: ViewStyle = {
  height: 40,
  width: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: shape.web.control,
};

// The text trigger: the `trigger` string rendered as a pressable inline word (a
// hover-text affordance) rather than a Button. A little padding gives it a
// comfortable tap target and rounds the press/ripple state layer. Press feedback
// (opacity dim on iOS/web, ripple on Android) is applied by the component's
// Pressable, matching the icon trigger; this is a shared Canvas affordance (no
// native tooltip-trigger control exists), so it is not per-platform skinned.
export const textTrigger: ViewStyle = {
  alignSelf: "flex-start",
  paddingHorizontal: 2,
  paddingVertical: 2,
  borderRadius: platformShape.web.key,
};

// The text-trigger label: the brand `foreground` ink at body size (14/20 medium)
// with a dotted underline so the word reads as an interactive tip affordance,
// not plain copy. Painted from tokens so it follows light/dark.
export const textTriggerLabel = (t: ColorTokens): TextStyle => ({
  fontSize: 14,
  lineHeight: 20,
  fontWeight: "500",
  color: t.foreground,
  textDecorationLine: "underline",
  textDecorationStyle: "dotted",
});

// ---------- Web: Dark Factory's type on the inverse bubble ----------
export const webSkin: TooltipSkin = {
  bubble: (t) => ({
    borderRadius: platformShape.web.tooltip,
    backgroundColor: t.foreground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...shadow("md", t),
  }),
  label: (t) => ({ ...typeScale.label, lineHeight: 16, color: t.background }),
};

// ---------- iOS: no system tooltip, so the web skin ----------
export const iosSkin: TooltipSkin = webSkin;

// ---------- Android (Material 3 plain tooltip): inverse-surface rounded rect ----------
// M3 plain tooltip: a small rounded rect with a tighter 4dp corner radius, an
// inverse-surface fill (dark in a light theme: `foreground` bg, `background`
// text), body-small ~12sp, padding 8x4, and FLAT (no elevation) per the M3 plain
// tooltip spec. A 24dp minimum height keeps single-line tips at the spec height.
export const androidSkin: TooltipSkin = {
  bubble: (t) => ({
    borderRadius: platformShape.android.tooltip,
    backgroundColor: t.foreground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 24,
    justifyContent: "center",
  }),
  label: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: t.background }),
};
