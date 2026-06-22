import { type ColorTokens, alpha, shadow, FOCUS_RESET } from "../../style/index.js";
import { type CarouselSkin } from "./carousel.shared.js";

// Co-located Carousel skins, one per platform. The shell resolves the paging,
// the controlled/uncontrolled current index, the viewport measurement, and the
// accessibility; the skin supplies only the native SHAPE: the slide corner
// radius, the arrow button shape/feedback, and the dot indicator look (size,
// shape, the active-dot widening + brand tint). The BRAND survives on every
// platform (the indigo `primary` token, never a platform default), so each
// follows light/dark.
//
//   iOS: the App Store paged-card idiom with a UIPageControl dot strip. Small
//     circular dots (7px): the active one fills brand `primary`, inactive ones
//     are `muted-foreground` at low alpha. Slide radius 12. Arrows are present
//     but subtle (a translucent circular chip); press = opacity dim ~0.8.
//   Android M3: the M3 carousel feel. Rounded slide corners (16), and an M3
//     position indicator whose ACTIVE dot widens to a brand `primary` pill while
//     inactive dots stay small `muted-foreground`/alpha circles. Arrows are flat
//     `card` chips with a hairline border; press = android_ripple (no shadow).
//   Web (Embla/shadcn): visible circular OUTLINE arrow buttons (32px, radius
//     9999, `card` fill + 1px `border`) overlaid on the left/right edges, with a
//     small drop shadow; the dot strip sits below (active = wider `primary`
//     pill, inactive = `muted-foreground` alpha). Press = opacity dim.

// =============================================================================
// Web (Embla / shadcn): outline circular arrow buttons + dot strip below.
// =============================================================================

export const webSkin: CarouselSkin = {
  pressedOpacity: 0.9,
  ripple: null,
  focusOutlineReset: FOCUS_RESET,

  slide(tokens) {
    return {
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: tokens.card,
    };
  },

  // shadcn CarouselPrevious/Next: variant="outline" size="icon" -> size-8
  // (32px), rounded-full, a 1px border over the `card` fill, with a small lift.
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
      ...shadow("sm"),
    };
  },
  arrowIconSize: 18,
  arrowInset: 8,

  dotsRow() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 12,
    };
  },
  // Active dot widens to a `primary` pill; inactive dots are muted alpha circles.
  dot(tokens, active) {
    return {
      height: 8,
      width: active ? 18 : 8,
      borderRadius: 9999,
      backgroundColor: active ? tokens.primary : alpha(tokens["muted-foreground"], 0.4),
    };
  },

  slideText(tokens) {
    return { fontSize: 16, lineHeight: 24, fontWeight: "500", color: tokens.foreground };
  },
};

// =============================================================================
// iOS: App Store paged cards with a UIPageControl dot strip. Small round dots,
// active filled brand `primary`, inactive muted-alpha; subtle translucent
// arrows; slide radius 12. Press = opacity dim.
// =============================================================================

export const iosSkin: CarouselSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,
  focusOutlineReset: FOCUS_RESET,

  slide(tokens) {
    return {
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: tokens.card,
    };
  },

  // Subtle translucent chip (no border, no shadow), so the arrows read as a
  // light affordance over the card rather than a prominent button.
  arrow(tokens) {
    return {
      width: 30,
      height: 30,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: alpha(tokens.card, 0.7),
    };
  },
  arrowIconSize: 18,
  arrowInset: 8,

  dotsRow() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingTop: 12,
    };
  },
  // UIPageControl-style: equal small round dots; active fills brand `primary`,
  // inactive sit at low alpha. No widening (the fill is the affordance).
  dot(tokens, active) {
    return {
      height: 7,
      width: 7,
      borderRadius: 9999,
      backgroundColor: active ? tokens.primary : alpha(tokens["muted-foreground"], 0.35),
    };
  },

  slideText(tokens) {
    return { fontSize: 17, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
  },
};

// =============================================================================
// Android (Material 3): rounded slide corners, flat `card` arrow chips with a
// hairline border (ripple on press, no shadow), and an M3 position indicator
// whose active dot widens to a brand `primary` pill.
// =============================================================================

export const androidSkin: CarouselSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => ({ color: alpha(tokens.foreground, 0.12), borderless: true }),

  slide(tokens) {
    return {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: tokens.card,
    };
  },

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
  arrowInset: 8,

  dotsRow() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 12,
    };
  },
  // M3 carousel position indicator: the active item widens to a brand `primary`
  // pill, inactive items stay small muted-alpha circles.
  dot(tokens, active) {
    return {
      height: 8,
      width: active ? 20 : 8,
      borderRadius: 9999,
      backgroundColor: active ? tokens.primary : alpha(tokens["muted-foreground"], 0.4),
    };
  },

  slideText(tokens) {
    return { fontSize: 16, lineHeight: 24, fontWeight: "500", color: tokens.foreground };
  },
};
