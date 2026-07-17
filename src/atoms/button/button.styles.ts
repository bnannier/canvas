import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Button skins, one per platform. The BRAND survives on every platform
// (fills/labels use the indigo `primary` and the semantic tokens, never a platform
// default); only the native SHAPE, sizing, label weight, and press feedback change:
//   iOS (HIG / iOS 26+ Liquid Glass): capsule (fully rounded), semibold SF-scale label, dim-on-press.
//   Android (Material 3): fully-rounded pill, medium label, flat, ripple.
//   Web: the established Canvas look (rounded-md, medium label, opacity press).

export type Intent = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
export type Size = "small" | "base" | "large";

export interface ButtonSkinOpts {
  icon: boolean;
  block: boolean;
  /** disabled or loading: dim the control. */
  dim: boolean;
}

export interface ButtonSkin {
  container: (t: ColorTokens, intent: Intent, size: Size, opts: ButtonSkinOpts) => ViewStyle;
  label: (t: ColorTokens, intent: Intent, size: Size) => TextStyle;
  /** iOS/web dim the fill on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  ripple: ((t: ColorTokens, intent: Intent) => { color: string; borderless: boolean }) | null;
  /**
   * The rounded shape the shell's `<RippleClip>` parent clips the bounded ripple to (the
   * same corner radii `container` draws). Only the Android skin sets it — a bounded ripple
   * is Android-only; iOS/web omit it so no clip wrapper is applied. See src/style/ripple-clip.
   */
  rippleClipShape?: (size: Size, opts: ButtonSkinOpts) => ViewStyle;
  /**
   * Platform minimum touch target in pt/dp (iOS HIG 44pt, Android M3 48dp). When set,
   * the shell measures the rendered control and extends the TOUCH area with hitSlop on
   * whichever axis falls short (e.g. the 36pt iOS / 30dp Android `small` text button and
   * the sub-minimum icon squares). hitSlop never affects layout, so the visual size is
   * untouched. null (web) skips the measurement entirely: pointer targets stay visual.
   */
  minTarget: number | null;
}

// --- shared brand mapping (identical across platforms) ----------------------

/** Foreground token per intent: the label color and the loading-spinner color. */
export const FG_TOKEN: Record<Intent, keyof ColorTokens> = {
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  destructive: "destructive-foreground",
  outline: "foreground",
  ghost: "foreground",
  link: "primary",
};

const DARK_FILL = new Set<Intent>(["primary", "destructive"]);

// Container fill/border per intent (brand colors, shared by all platforms).
function fill(t: ColorTokens, intent: Intent): ViewStyle {
  switch (intent) {
    case "primary": return { backgroundColor: t.primary };
    case "secondary": return { backgroundColor: t.secondary };
    case "destructive": return { backgroundColor: t.destructive };
    case "outline": return { backgroundColor: "transparent", borderWidth: 1, borderColor: t.input };
    case "ghost": return { backgroundColor: "transparent" };
    case "link": return { backgroundColor: "transparent" };
  }
}

// Label color per intent (brand, shared by all platforms). The link UNDERLINE is a web
// idiom only: iOS and Android text buttons are tint-colored with no underline, so the
// underline lives in webSkin.label, not here.
function labelColor(t: ColorTokens, intent: Intent): TextStyle {
  switch (intent) {
    case "primary": return { color: t["primary-foreground"] };
    case "secondary": return { color: t["secondary-foreground"] };
    case "destructive": return { color: t["destructive-foreground"] };
    case "outline": return { color: t.foreground };
    case "ghost": return { color: t.foreground };
    case "link": return { color: t.primary };
  }
}

// Android ripple over a fill: a light ripple on dark fills, a dark one on light/
// transparent fills, so the Material press feedback reads on every variant.
function androidRipple(_t: ColorTokens, intent: Intent) {
  return { color: DARK_FILL.has(intent) ? "rgba(255, 255, 255, 0.24)" : "rgba(0, 0, 0, 0.10)", borderless: false };
}

const ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center" };

// ---------- Web: the established Canvas look ----------
export const webSkin: ButtonSkin = {
  container: (t, intent, size, o) => ({
    ...ROW,
    gap: 8,
    borderRadius: 6,
    ...(o.icon
      ? sq(size === "small" ? 32 : size === "large" ? 48 : 40)
      : size === "small" ? { paddingHorizontal: 12, paddingVertical: 6 }
      : size === "large" ? { paddingHorizontal: 24, paddingVertical: 12 }
      : { paddingHorizontal: 16, paddingVertical: 8 }),
    ...fill(t, intent),
    // `block` (full width) lives on the shell's <RippleClip> wrapper, the outer node.
    ...(o.dim ? { opacity: 0.5 } : null),
  }),
  label: (t, intent, size) => ({
    fontWeight: "500",
    ...(size === "large" ? FS(16, 24) : size === "small" ? FS(12, 16) : FS(14, 20)),
    ...labelColor(t, intent),
    ...(intent === "link" ? { textDecorationLine: "underline" as const } : null), // web-only link underline
  }),
  pressedOpacity: 0.9,
  ripple: null,
  minTarget: null, // web is pointer-first: no touch-target extension, layout untouched
};

// ---------- iOS (HIG / iOS 26+ Liquid Glass): capsule, semibold, dim on press ----------
export const iosSkin: ButtonSkin = {
  container: (t, intent, size, o) => ({
    ...ROW,
    gap: 6,
    borderRadius: 9999, // iOS 27 prominent buttons are capsules (full pill at every size); icon = circle
    ...(o.icon
      ? sq(size === "small" ? 36 : size === "large" ? 52 : 44)
      // Heights: base ~50pt (lineHeight 22 + 2*14) = the iOS 27 prominent button; large ~58pt
      // for a clearly tiered ladder; small ~36pt. Capsule preserved at every size.
      : size === "small" ? { paddingHorizontal: 14, paddingVertical: 8 }
      : size === "large" ? { paddingHorizontal: 26, paddingVertical: 18 }
      : { paddingHorizontal: 20, paddingVertical: 14 }),
    ...fill(t, intent),
    // `block` (full width) lives on the shell's <RippleClip> wrapper, the outer node.
    ...(o.dim ? { opacity: 0.4 } : null), // iOS disabled control alpha (more muted than 0.5)
  }),
  label: (t, intent, size) => ({
    fontWeight: "600",
    ...(size === "small" ? FS(15, 20) : FS(17, 22)),
    ...labelColor(t, intent),
  }),
  pressedOpacity: 0.8,
  ripple: null,
  minTarget: 44, // HIG minimum tappable area 44x44pt (small = 36pt tall, extended via hitSlop)
};

// ---------- Android (Material 3 filled): pill, medium label, flat, ripple ----------
export const androidSkin: ButtonSkin = {
  container: (t, intent, size, o) => ({
    ...ROW,
    gap: 8,
    borderRadius: 9999, // M3 filled button = fully rounded (stadium); icon = circle
    // The Material ripple is clipped to this pill by the shell's <RippleClip> parent, NOT here:
    // a bounded android_ripple is the pressable's own rectangular-masked background, which a
    // same-node overflow:"hidden" cannot clip (RN only path-clips CHILDREN). See ripple-clip.tsx.
    ...(o.icon
      ? sq(size === "small" ? 32 : size === "large" ? 48 : 40)
      : size === "small" ? { paddingHorizontal: 16, paddingVertical: 6 }
      : size === "large" ? { paddingHorizontal: 24, paddingVertical: 13 }
      : { paddingHorizontal: 24, paddingVertical: 10 }),
    ...fill(t, intent),
    // `block` (full width) lives on the shell's <RippleClip> wrapper, the outer node.
    ...(o.dim ? { opacity: 0.38 } : null), // M3 disabled opacity
  }),
  label: (t, intent, size) => ({
    fontWeight: "500",
    ...(size === "small" ? FS(13, 18) : FS(14, 20)),
    ...labelColor(t, intent),
  }),
  pressedOpacity: null,
  ripple: androidRipple,
  // Clip the bounded ripple to the pill (icon = circle). Same 9999 radius as `container`, so
  // the <RippleClip> parent's rounded outline matches the button's own corners at every size.
  rippleClipShape: () => ({ borderRadius: 9999 }),
  minTarget: 48, // M3 minimum touch target 48x48dp (small = 30dp, base = 40dp; extended via hitSlop)
};

function sq(d: number): ViewStyle {
  return { width: d, height: d };
}
function FS(fontSize: number, lineHeight: number): TextStyle {
  return { fontSize, lineHeight };
}
