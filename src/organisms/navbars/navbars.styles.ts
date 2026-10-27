import { type ViewStyle } from "react-native";
import { primaryText } from "../../style/primary-text.js";
import { shadow, alpha, shape } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { webHover } from "../../style/hover.js";
import { type NavbarSkin } from "./navbars.shared.js";

// Co-located Navbar skins, one per platform. The shell resolves the surface axis
// (default / bordered / floating), the brand + link cluster, and the action +
// avatar cluster; the skin supplies only the native SHAPE, sizing, label weight,
// fill, separator, and press feedback. The BRAND survives on every platform (the
// `primary` token and the semantic tokens, never a platform default), so
// each follows light/dark and the glass surface.
//
//   iOS (iOS 26+ / Liquid Glass navigation bar): a slim 44pt bar with a 1px
//     hairline bottom separator (no heavy shadow); the brand reads as a ~17pt
//     weight-600 SF title. Bar-button items are CIRCULAR tinted toolbar buttons
//     (a translucent neutral `secondary` circle), the glyph/label tints the
//     brand `primary`; the active item reads as a brand-FILLED circle. Press =
//     opacity dim 0.8.
//   Android (M3 top app bar): a 64dp bar with a ~22sp weight-500 LEADING title;
//     no hairline border, a flat `background` surface (soft elevation only when
//     `floating`); nav links use a tonal `primary` active fill; press =
//     android_ripple.
//   Web (the v4 hand-off's Navbar renderer, `K.def('navbars')`): a 56px bar with a
//     16px gutter and 20px between its clusters, resting on a bottom hairline, boxed
//     in a 14px outline, or lifted as a floating pill (the docs' own top bar). Links are
//     32px capsules in the 13px interface face; the active one and a hovered one fill
//     `secondary` with the foreground ink.
//
// The density axis (`compact`) tightens the bar on every platform. On the web it is
// the hand-off's docs pill: a 44px bar with a 5px inset and 2px between every item.

export type Surface = "default" | "bordered" | "floating";
export type Density = "default" | "compact";

// The row every bar lays out as; the skins add the height, gutter and gap.
const BAR_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between" };
const ROW: ViewStyle = { flexDirection: "row", alignItems: "center" };

// =============================================================================
// Web: the hand-off's bar.
// =============================================================================

export const webSkin: NavbarSkin = {
  // The original bar dims links on press (active:opacity-90); no ripple.
  pressedOpacity: 0.9,
  ripple: null,

  // The hand-off renderer's bar: 56px tall, a 16px gutter, 20px between the brand, the
  // links and the actions. Compact is the docs pill: 44px (a 32px tile, a 5px inset and
  // the 1px rim on each side), 5px in, 2px between every item.
  bar(_tokens, density) {
    return density === "compact"
      ? { ...BAR_ROW, height: 44, paddingHorizontal: 5, gap: 2 }
      : { ...BAR_ROW, height: 56, paddingHorizontal: 16, gap: 20 };
  },
  // The page fill (token-driven, follows the scheme; GlassSurface strips it under glass).
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // The surface axis. default rests flush on the `border` hairline; bordered boxes it in
  // the hand-off's 14px outline of the stronger 16% hairline (`field-border`, its
  // `--ln2`); floating lifts it as the docs pill: a capsule on that hairline, the md
  // shade (the hand-off's `--sh-md`) and, in solid, the `popover` fill (its `--sf2`).
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return { borderBottomWidth: 1, borderColor: tokens.border };
      case "bordered":
        return { borderRadius: platformShape.web.navBar, borderWidth: 1, borderColor: tokens["field-border"] };
      case "floating":
        return { borderRadius: shape.web.pill, borderWidth: 1, borderColor: tokens["field-border"], backgroundColor: tokens.popover, ...shadow("md", tokens) };
    }
  },

  leftGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 2 : 20 };
  },
  // The brand lockup: the mark 8px before the wordmark. In the compact pill the lockup
  // is a 32px cell with a 12px inset, like the docs pill's home link.
  brandGroup(_tokens, density) {
    return density === "compact" ? { ...ROW, gap: 8, height: 32, paddingHorizontal: 12 } : { ...ROW, gap: 8 };
  },
  // The wordmark: the display face at 600, 15px (14px with -0.01em in the compact pill).
  brand(tokens, density) {
    return density === "compact"
      ? { fontFamily: DISPLAY_FONT, fontSize: 14, lineHeight: 18, fontWeight: "600", letterSpacing: -0.14, color: tokens.foreground }
      : { fontFamily: DISPLAY_FONT, fontSize: 15, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
  },
  linksRow(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 2 : 4 };
  },
  // A 32px capsule with a 10px inset; the active one fills `secondary` (the hand-off's
  // `--sf3`).
  linkTile(tokens, active) {
    return {
      height: 32,
      paddingHorizontal: 10,
      borderRadius: shape.web.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: active ? tokens.secondary : "transparent",
    };
  },
  // 500 13px; active reads in the foreground, a resting link in the muted ink.
  linkLabel(tokens, active) {
    return {
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "500",
      color: active ? tokens.foreground : tokens["muted-foreground"],
    };
  },
  // A hovered link takes the active look at once (the hand-off's `--sf3` with `--tx`).
  linkHover: webHover((tokens) => ({ tile: { backgroundColor: tokens.secondary }, label: { color: tokens.foreground } })),
  linkSelection: "tint",

  rightGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 2 : 10 };
  },
};

// =============================================================================
// iOS (iOS 26+ / Liquid Glass): a slim navigation bar. A 44pt bar with a 1px
// hairline bottom separator and no heavy shadow; the brand is a ~17pt weight-600
// SF title. Bar-button items are CIRCULAR tinted toolbar buttons: a translucent
// neutral `secondary` circle that the brand `primary` glyph/label sits on; the
// active destination reads as a brand-FILLED circle. Press = opacity dim 0.8.
// =============================================================================

export const iosSkin: NavbarSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,
  // Slim 44pt bar. iOS navigation bars are shorter than the Canvas web bar; compact
  // keeps the 44pt height and pulls the gutter and the gaps in.
  bar(_tokens, density) {
    return { ...BAR_ROW, height: 44, paddingHorizontal: density === "compact" ? 8 : 16, ...(density === "compact" ? { gap: 4 } : null) };
  },
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // default: a 1px hairline bottom separator only (no shadow). bordered keeps the
  // rounded outline at the card corner; floating lifts a light card (HIG keeps
  // elevation subtle).
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return { borderBottomWidth: 1, borderColor: tokens.border };
      case "bordered":
        return { borderRadius: shape.ios.card, borderWidth: 1, borderColor: tokens.border };
      case "floating":
        return { borderRadius: shape.ios.card, borderWidth: 1, borderColor: tokens.border, ...shadow("sm", tokens) };
    }
  },

  leftGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 16 };
  },
  // The brand lockup takes the cluster's own gap, as the mark and title did as siblings.
  brandGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 16 };
  },
  // ~17pt SF title, weight 600 (iOS inline navigation title).
  brand(tokens) {
    return { fontSize: 17, lineHeight: 22, fontWeight: "600", color: tokens.foreground };
  },
  linksRow(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 8 };
  },
  // iOS 26 bar-button items are CIRCULAR tinted toolbar buttons. Each chip is a
  // 32pt fully-rounded pill on a translucent neutral `secondary` fill; the active
  // destination flips to a solid brand `primary` fill (the filled-circle state).
  // minWidth == height keeps a single short label reading as a true circle while
  // a longer label grows the pill horizontally, matching the iOS capsule.
  linkTile(tokens, active) {
    return {
      height: 32,
      minWidth: 32,
      borderRadius: shape.ios.control,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: active ? tokens.primary : alpha(tokens.secondary, 0.9),
    };
  },
  // The glyph/label tints the brand `primary` on the neutral chip; on the active
  // filled circle it reads in the contrasting `primary-foreground`.
  linkLabel(tokens, active) {
    return {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "center",
      color: active ? tokens["primary-foreground"] : primaryText(tokens),
    };
  },
  // Native pointer hover waits on the owner (CLAUDE.md, Motion).
  linkHover: null,
  linkSelection: "brand",

  rightGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 8 };
  },
};

// =============================================================================
// Android (Material 3): a top app bar. A 64dp bar with a ~22sp weight-500
// LEADING title and no hairline border; the surface is flat `background` (soft
// elevation only when floating). Nav links use a tonal `primary` active fill.
// Press = android_ripple.
// =============================================================================

export const androidSkin: NavbarSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),

  // 64dp M3 small top app bar (M3 container height; Material 2 was 56dp). Compact is
  // 48dp, the M3 minimum touch row, with the gutter and the gaps pulled in.
  bar(_tokens, density) {
    return density === "compact"
      ? { ...BAR_ROW, height: 48, paddingHorizontal: 8, gap: 4 }
      : { ...BAR_ROW, height: 64, paddingHorizontal: 16 };
  },
  surface(tokens) {
    return { backgroundColor: tokens.background };
  },
  // M3 small top app bar is borderless and flat at rest; we rely on the
  // background fill. bordered/floating keep a container so those layouts still
  // box (floating gets the M3 elevated-surface shadow on scroll).
  surfaceContainer(tokens, surface) {
    switch (surface) {
      case "default":
        return {}; // flat, no hairline; the background fill carries the bar
      case "bordered":
        return { borderRadius: shape.android.card, borderWidth: 1, borderColor: tokens.border };
      case "floating":
        return { borderRadius: shape.android.card, ...shadow("md", tokens) };
    }
  },

  leftGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 16 };
  },
  // The brand lockup takes the cluster's own gap, as the mark and title did as siblings.
  brandGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 16 };
  },
  // M3 titleLarge ~22sp, weight 500, leading.
  brand(tokens) {
    return { fontSize: 22, lineHeight: 28, fontWeight: "500", color: tokens.foreground };
  },
  linksRow(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 2 : 4 };
  },
  // M3 active destination carries a tonal `primary` fill (secondaryContainer ~
  // alpha(primary, .12)); inactive sits flat with a muted label.
  linkTile(tokens, active) {
    return {
      borderRadius: shape.android.control,
      // clip the Material ripple to the rounded outline (without this, the bounded
      // android_ripple paints a rectangle past the pill corners).
      overflow: "hidden",
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: active ? alpha(tokens.primary, 0.12) : "transparent",
    };
  },
  linkLabel(tokens, active) {
    return {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: active ? primaryText(tokens) : tokens["muted-foreground"],
    };
  },
  // Native pointer hover waits on the owner (CLAUDE.md, Motion).
  linkHover: null,
  linkSelection: "tint",

  rightGroup(_tokens, density) {
    return { ...ROW, gap: density === "compact" ? 4 : 8 };
  },
};
