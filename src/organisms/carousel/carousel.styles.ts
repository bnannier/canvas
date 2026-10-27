import { alpha, controlRipple, shape } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type CarouselSkin } from "./carousel.shared.js";

// Co-located Carousel skins, one per platform. The shell resolves the paging,
// the controlled/uncontrolled current index, the viewport measurement, and the
// accessibility; the skin supplies only the SHAPE: the slide corner radius,
// hairline and text inset, the arrow button shape/feedback and its gutters beside
// the slides, and the dot indicator look (size, shape, the active-dot widening +
// brand tint). Every colour is the hand-off's semantic token, so each follows
// light/dark.
//
//   Web (the Canvas v4 hand-off's carousel, cv-kit-code3.js `O('carousel')`, with
//     `K.def('carousel')` in cv-kit-data.js): the slide is a card-corner panel on a
//     `border` hairline over the `popover` fill (the hand-off's sf2), a string slide
//     set centred in 500 22 display type, 20 in. The arrows are 32 px circles on a
//     `field-border` hairline over the `card` fill (the control-layer glass under
//     glass) with a 16 px chevron in the foreground, dimmed to 0.35 at a closed end.
//     The dots sit 10 under the slides, 6 apart: 6 px circles in `surface-raised`
//     (the hand-off's sf4), the current one an 18 px accent pill.
//   iOS: iOS ships no carousel control (PLATFORM-REFERENCES.md), so the web skin's
//     parts in SF Pro, the arrows' slop and the dots' targets held to 44 pt. Touch
//     pages by swipe, so the dots show by default and the arrows opt in.
//   Android M3 (the platform's own carousel): rounded slide corners (28dp, extra-large
//     on every M3 layout) with snap-scroll navigation. The M3 carousel anatomy is
//     container + items ONLY, so there are NO arrows and NO position/dot indicator:
//     both default OFF here, and `showArrows`/`showDots` opt them back in for a
//     common Android pager, in the hand-off's colours.
//
// Every skin keeps its arrows off the slides: `arrowInset` holds the arrow's touch
// slop inside the carousel, `arrowGap` holds it off the slides (both at least the
// horizontal hitSlop), and a plain-string slide is inset by `slidePadding`.

// =============================================================================
// Web: the v4 hand-off's carousel.
// =============================================================================

export const webSkin: CarouselSkin = {
  pressedOpacity: 0.9,
  ripple: null,

  // Web (pointer): both arrows and dots show by default, and a
  // mouse has no minimum touch target, so no hitSlop padding.
  defaultShowArrows: true,
  defaultShowDots: true,
  dotTarget: { minWidth: 24, height: 24, alignItems: "center", justifyContent: "center" },

  // The slide: the card corner on a `border` hairline over the `popover` fill (under
  // glass the material's rim replaces the hairline). No shadow: the viewport clips it.
  slide(tokens) {
    return {
      borderRadius: shape.web.card,
      overflow: "hidden",
      backgroundColor: tokens.popover,
      borderWidth: 1,
      borderColor: tokens.border,
    };
  },
  slidePadding: 20,

  // A 32 px circle on a `field-border` hairline over the `card` fill. The focus ring
  // draws outside the arrow (the browser's ring at FOCUS_RING_OFFSET 2), so the 4px
  // inset keeps it inside the carousel where a clipping parent sits flush with it.
  arrow(tokens) {
    return {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.card,
      borderWidth: 1,
      borderColor: tokens["field-border"] ?? tokens.border,
    };
  },
  arrowIconSize: 16,
  arrowInset: 4,
  arrowGap: 12,

  dotsRow() {
    return {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 10,
    };
  },
  // The current dot widens to an 18 px accent pill; the rest are 6 px raised circles.
  dot(tokens, active) {
    return {
      height: 6,
      width: active ? 18 : 6,
      borderRadius: 9999,
      backgroundColor: active ? tokens.primary : tokens["surface-raised"] ?? alpha(tokens["muted-foreground"], 0.4),
    };
  },

  // 500 22 in the display face, centred.
  slideText(tokens) {
    return { fontFamily: DISPLAY_FONT, fontSize: 22, lineHeight: 28, fontWeight: "500", textAlign: "center", color: tokens.foreground };
  },
};

// =============================================================================
// iOS: no carousel control, so the web skin's parts in SF Pro, with the arrows'
// touch slop and the dots' targets held to the HIG's 44 pt. Press = opacity dim.
// =============================================================================

export const iosSkin: CarouselSkin = {
  ...webSkin,
  pressedOpacity: 0.8, // HIG: dim on press
  // Touch pages by swipe: the dots show (UIPageControl's place), the arrows opt in.
  defaultShowArrows: false,
  // The 44 pt dot targets already part the dots, so the row adds no gap.
  dotsRow(tokens) {
    return { ...webSkin.dotsRow(tokens), gap: 0 };
  },
  // The 6pt slop (32 + 2 * 6 = 44) stays inside the carousel and off the slides.
  arrowHitSlop: 6,
  arrowInset: 6,
  dotTarget: { minWidth: 44, height: 44, alignItems: "center", justifyContent: "center" },
  // The web type in the platform face.
  slideText(tokens) {
    return { fontSize: 22, lineHeight: 28, fontWeight: "500", textAlign: "center", color: tokens.foreground };
  },
};

// =============================================================================
// Android (Material 3): rounded slide corners + snap-scroll. Per the M3 carousel
// anatomy (container + items only) there are NO arrows and NO position/dot
// indicator, so both default OFF. When opted in, arrows are flat `card` chips
// with a hairline border (controlRipple on press, no shadow) and the active dot
// widens to a brand `primary` pill.
// =============================================================================

export const androidSkin: CarouselSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => controlRipple(tokens), // borderless 12%-alpha foreground ripple

  // M3 carousel anatomy = container + items ONLY: no arrows and no
  // position/dot indicator. Both default OFF; `showArrows`/`showDots` opt them
  // back in for a common Android pager.
  defaultShowArrows: false,
  defaultShowDots: false,
  // Keep the opt-in dots inside real, non-overlapping Material touch targets.
  arrowHitSlop: 8,
  dotTarget: { minWidth: 48, height: 48, alignItems: "center", justifyContent: "center" },

  slide(tokens) {
    return {
      borderRadius: platformShape.android.carouselItem, // the M3 carousel item corner (extra-large, all layouts)
      overflow: "hidden",
      backgroundColor: tokens.card,
      // M3's outlined-card edge: the viewport clips an elevation shadow, and a slide on
      // a surface of its own colour needs a boundary.
      borderWidth: 1,
      borderColor: tokens.border,
    };
  },
  // M3's 16dp content inset. The item masks its content to the 28dp shape, so a
  // framed child (a Card, 12dp) would lose its edge near the corners: the slide is
  // the card, and a string slide is inset inside it.
  slidePadding: 16,

  // Flat M3 chip: `card` fill, hairline border, NO shadow (the ripple carries
  // the press feedback).
  arrow(tokens) {
    return {
      width: 32,
      height: 32,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tokens.card,
      borderWidth: 1,
      borderColor: tokens.border,
      overflow: "hidden",
    };
  },
  arrowIconSize: 20,
  // The 8dp slop (32 + 2 * 8 = 48) stays inside the carousel and off the slides.
  arrowInset: 8,
  arrowGap: 12,

  dotsRow() {
    return {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 12,
    };
  },
  // Off-anatomy for M3 (which defines no position indicator), so `showDots`
  // defaults off; when opted in, the active item widens to a brand `primary`
  // pill and inactive items stay small muted-alpha circles (a common Android pager).
  dot(tokens, active) {
    return {
      height: 8,
      width: active ? 20 : 8,
      borderRadius: 9999,
      backgroundColor: active ? tokens.primary : tokens["surface-raised"] ?? alpha(tokens["muted-foreground"], 0.4),
    };
  },

  // M3 title-medium: 16/24/500 with +0.15 tracking.
  slideText(tokens) {
    return { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15, color: tokens.foreground };
  },
};
