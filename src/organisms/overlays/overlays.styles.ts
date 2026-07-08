import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located Overlay skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when
// tokens.popover is swapped translucent at the theming level). The BRAND
// survives on every platform (the indigo `primary` Done action stays the same);
// only the native SHAPE, sizing, surface treatment, and the grabber/handle change
// per OS:
//   iOS (iOS 27 / Liquid Glass sheet): a sheet with the TOP corners rounded ~38
//     presenting from the bottom (flat bottom), a small grabber handle (a ~36x5
//     rounded `muted-foreground` pill) centered at the top, and an iOS 27 header
//     toolbar directly below it: a leading CIRCULAR tinted button holding the close
//     (X) glyph, a centered title, and a trailing CIRCULAR action button (a filled
//     `primary` accent circle holding the action glyph) — both are ~40pt circles,
//     not bare icons. The centered `modal` becomes a rounded form-sheet card
//     (~13 radius). Press feedback on the surface is none (the surface itself is
//     not pressable); the circular header buttons keep the Button's iOS press =
//     opacity dim.
//   Android (Material 3 bottom sheet): the `sheet` has its TOP corners rounded 28
//     with a centered drag handle (~32x4 rounded `muted-foreground` pill), the
//     `popover` surface, and M3 elevation; the `drawer` and `modal` keep the M3
//     low-radius/elevated treatment.
//   Web: the established Canvas look (the current overlay, lifted verbatim) — the
//     contained dim scrim with the drawer (right, full height, border-l), sheet
//     (bottom, rounded-t-lg, border-t), and modal (centered card, rounded-lg
//     border) surfaces, each `popover` filled with a border and shadow-xl.

export type Placement = "drawer" | "sheet" | "modal";

// The contract a platform skin fulfills. The shell renders the contained dim
// backdrop, the surface positioned inside it per placement, an optional top
// grabber/drag handle (sheet only), the title, the description, and the footer
// action row; the skin maps the active platform's shape/fill/sizing onto each
// piece. `backdrop` and the contents type styles read the tokens so light/dark/
// glass keep working.
export interface OverlaySkin {
  /** The overlay surface per placement: shape, fill, border, padding, shadow. */
  surface: (t: ColorTokens, placement: Placement) => ViewStyle;
  /** The top grabber/drag handle rendered on the `sheet` placement only. Null on
   *  platforms that do not draw one (web). The shell centers it; this is the pill. */
  handle: ((t: ColorTokens) => ViewStyle) | null;
  /** The title type/color. */
  title: (t: ColorTokens) => TextStyle;
  /** The description type/color. */
  description: (t: ColorTokens) => TextStyle;
  /** The footer action row layout. */
  footer: ViewStyle;

  // --- iOS 27 sheet header (optional; iOS skin only) ------------------------
  // When a skin supplies `sheetHeader`, the shell renders an iOS 27 sheet header
  // toolbar on the `sheet` placement instead of the title/description/footer
  // stack: a leading CIRCULAR close (X) button, a centered title, and a trailing
  // CIRCULAR action button. Web/Android leave these undefined and keep the plain
  // title/description/footer layout byte-for-byte.

  /** The header toolbar row (3-column: leading circle, centered title, trailing
   *  circle). Present only on platforms that draw the iOS 27 sheet header. */
  sheetHeader?: ViewStyle;
  /** The circular tinted header button (a ~40pt `muted` circle behind a glyph). */
  headerButton?: (t: ColorTokens) => ViewStyle;
  /** The filled-accent trailing header button (a ~40pt `primary` circle). */
  headerButtonAccent?: (t: ColorTokens) => ViewStyle;
  /** The centered header title type/color (the iOS 27 sheet navigation title). */
  headerTitle?: (t: ColorTokens) => TextStyle;
}

// --- outer wrapper + trigger (identical across platforms) -------------------

// w-full: the overlay occupies the full width of its slot.
export const root: ViewStyle = { width: "100%" };

// self-start: the trigger button hugs the leading edge.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// --- backdrop (identical across platforms) ----------------------------------

// The contained dim scrim: relative w-full overflow-hidden rounded-lg bg-black/50.
// (mt-3 is applied conditionally by the shell when a trigger is present.)
export function backdrop(): ViewStyle {
  return {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: alpha("#000000", 0.5),
  };
}

// mt-3: gap below the trigger button, applied only when a trigger is rendered.
export const backdropWithTrigger: ViewStyle = { marginTop: 12 };

// The backdrop's alignment per placement. The modal centers its card; the
// drawer and sheet let the absolutely-positioned surface anchor itself.
export const backdropPlacement: Record<Placement, ViewStyle> = {
  drawer: {},
  sheet: {},
  // items-center justify-center
  modal: { alignItems: "center", justifyContent: "center" },
};

// The grabber/handle row: centered at the top of the sheet surface. The skin
// supplies the pill dimensions/color; this centers it and spaces it from the
// content below.
export const handleWrap: ViewStyle = { alignItems: "center", marginBottom: 12 };

// The centered title slot in the iOS 27 sheet header toolbar: it flexes to fill
// the space between the two equal-size circular controls so the title stays
// optically centered in the row. Used by the shell only when the active skin
// draws the iOS sheet header.
export const sheetHeaderTitleWrap: ViewStyle = { flex: 1, alignItems: "center", paddingHorizontal: 8 };

// --- shared surface fragments -----------------------------------------------

// The drawer anchors to the right edge, full height. Shared anchoring; the skin
// owns fill/border/radius/padding/shadow.
const DRAWER_ANCHOR: ViewStyle = { position: "absolute", top: 0, end: 0, bottom: 0, width: 300 };

// The sheet anchors to the bottom edge, spanning the width. Shared anchoring.
const SHEET_ANCHOR: ViewStyle = { position: "absolute", start: 0, end: 0, bottom: 0 };

// The modal is a self-centered floating card.
const MODAL_BOX: ViewStyle = { alignSelf: "center", marginVertical: 48, width: "100%", maxWidth: 420 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current overlay surfaces: the drawer (absolute top-0 right-0 bottom-0
// w-[300px] bg-popover border-l border-border p-5 shadow-xl), the sheet (absolute
// left-0 right-0 bottom-0 bg-popover border-t border-border rounded-t-lg p-5
// shadow-xl), and the modal (self-center my-12 w-full max-w-[420px] bg-popover
// border border-border rounded-lg p-6 shadow-xl). No grabber handle on the web.
export const webSkin: OverlaySkin = {
  surface: (t, placement) => {
    switch (placement) {
      case "drawer":
        return {
          ...DRAWER_ANCHOR,
          backgroundColor: t.popover,
          borderStartWidth: 1,
          borderColor: t.border,
          padding: 20,
          ...shadow("xl"),
        };
      case "sheet":
        return {
          ...SHEET_ANCHOR,
          backgroundColor: t.popover,
          borderTopWidth: 1,
          borderColor: t.border,
          borderTopStartRadius: 8,
          borderTopEndRadius: 8,
          padding: 20,
          ...shadow("xl"),
        };
      case "modal":
        return {
          ...MODAL_BOX,
          backgroundColor: t.popover,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: 8,
          padding: 24,
          ...shadow("xl"),
        };
    }
  },
  handle: null,
  // text-base font-semibold text-popover-foreground
  title: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "600", color: t["popover-foreground"] }),
  // text-sm text-muted-foreground mt-2
  description: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"], marginTop: 8 }),
  // flex-row justify-end mt-6
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
};

// ---------- iOS 27 (Liquid Glass sheet): top corners ~38, grabber + header toolbar ----------
// The iOS 27 sheet presents from the bottom with the TOP corners rounded ~38 (the
// large continuous-corner radius of the Liquid Glass sheet) and a flat bottom; a
// small grabber (a ~36x5 rounded muted-foreground pill) is centered at the top,
// and an iOS 27 header toolbar sits directly below it: a leading CIRCULAR close (X)
// button, a centered title, and a trailing CIRCULAR action button (a filled
// `primary` accent circle). The right `drawer` keeps the lineless rounded-left
// treatment; the centered `modal` becomes a rounded form-sheet card (~13 radius).
// The iOS sheet is lineless: no visible border, a soft elevation.
const IOS_SHEET_RADIUS = 38;
const IOS_CARD_RADIUS = 13;
// The header toolbar's circular control: a ~40pt circle behind the glyph.
const IOS_HEADER_BUTTON = 40;
export const iosSkin: OverlaySkin = {
  surface: (t, placement) => {
    switch (placement) {
      case "drawer":
        return {
          ...DRAWER_ANCHOR,
          backgroundColor: t.popover,
          // The leading edge rounds (the panel slides in from the right edge).
          borderTopStartRadius: IOS_SHEET_RADIUS,
          borderBottomStartRadius: IOS_SHEET_RADIUS,
          padding: 20,
          ...shadow("xl"),
        };
      case "sheet":
        return {
          ...SHEET_ANCHOR,
          backgroundColor: t.popover,
          // Top corners rounded ~38, flat bottom (presents from the bottom edge).
          borderTopStartRadius: IOS_SHEET_RADIUS,
          borderTopEndRadius: IOS_SHEET_RADIUS,
          paddingHorizontal: 16,
          // A little more top padding to seat the grabber above the header toolbar.
          paddingTop: 8,
          paddingBottom: 24,
          ...shadow("xl"),
        };
      case "modal":
        return {
          ...MODAL_BOX,
          // The iOS form sheet is a rounded card, lineless.
          backgroundColor: t.popover,
          borderRadius: IOS_CARD_RADIUS,
          padding: 24,
          ...shadow("xl"),
        };
    }
  },
  // The grabber: a ~36x5 rounded muted-foreground pill centered at the top.
  handle: (t) => ({ width: 36, height: 5, borderRadius: 2.5, backgroundColor: t["muted-foreground"] }),
  // SF-scale title: 17pt semibold (the iOS body emphasized).
  title: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", color: t["popover-foreground"] }),
  // 15pt secondary text.
  description: (t) => ({ fontSize: 15, lineHeight: 20, color: t["muted-foreground"], marginTop: 8 }),
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
  // iOS 27 sheet header toolbar: a 3-column row seating the leading/trailing
  // circular controls and the centered title, just below the grabber.
  sheetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  // The circular tinted header button: a ~40pt `muted` circle centering its glyph.
  headerButton: (t) => ({
    width: IOS_HEADER_BUTTON,
    height: IOS_HEADER_BUTTON,
    borderRadius: IOS_HEADER_BUTTON / 2,
    backgroundColor: t.muted,
    alignItems: "center",
    justifyContent: "center",
  }),
  // The filled-accent trailing header button: a ~40pt brand-`primary` circle.
  headerButtonAccent: (t) => ({
    width: IOS_HEADER_BUTTON,
    height: IOS_HEADER_BUTTON,
    borderRadius: IOS_HEADER_BUTTON / 2,
    backgroundColor: t.primary,
    alignItems: "center",
    justifyContent: "center",
  }),
  // The centered header title: 17pt semibold, the iOS 27 sheet navigation title.
  headerTitle: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", color: t["popover-foreground"] }),
};

// ---------- Android (Material 3 bottom sheet): top corners 28, drag handle ----------
// M3 modal bottom sheet: the `sheet` has its TOP corners rounded 28 (the M3
// extra-large shape) with a centered drag handle (a ~32x4 rounded
// muted-foreground pill), the `popover` surface, and M3 elevation. The right
// `drawer` (navigation-drawer-like) keeps a large trailing radius; the centered
// `modal` is the M3 dialog shape (28 radius, elevated, no border).
const ANDROID_SHEET_RADIUS = 28;
const ANDROID_DIALOG_RADIUS = 28;
export const androidSkin: OverlaySkin = {
  surface: (t, placement) => {
    switch (placement) {
      case "drawer":
        return {
          ...DRAWER_ANCHOR,
          backgroundColor: t.popover,
          // M3 navigation drawer: the trailing (leading-in) edge gets the large radius.
          borderTopStartRadius: ANDROID_SHEET_RADIUS,
          borderBottomStartRadius: ANDROID_SHEET_RADIUS,
          padding: 24,
          ...shadow("lg"),
        };
      case "sheet":
        return {
          ...SHEET_ANCHOR,
          backgroundColor: t.popover,
          // Top corners radius 28, flat bottom (M3 modal bottom sheet).
          borderTopStartRadius: ANDROID_SHEET_RADIUS,
          borderTopEndRadius: ANDROID_SHEET_RADIUS,
          paddingHorizontal: 24,
          // Top padding seats the drag handle; M3 bottom-sheet content inset.
          paddingTop: 16,
          paddingBottom: 24,
          ...shadow("lg"),
        };
      case "modal":
        return {
          ...MODAL_BOX,
          // M3 dialog shape: 28 radius, elevated, no border.
          backgroundColor: t.popover,
          borderRadius: ANDROID_DIALOG_RADIUS,
          padding: 24,
          ...shadow("lg"),
        };
    }
  },
  // The M3 drag handle: a ~32x4 rounded muted-foreground pill centered at the top.
  handle: (t) => ({ width: 32, height: 4, borderRadius: 2, backgroundColor: alpha(t["muted-foreground"], 0.4) }),
  // M3 title: title-large-ish, 16sp medium on the surface.
  title: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "500", color: t["popover-foreground"] }),
  // M3 body-medium supporting text.
  description: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"], marginTop: 8 }),
  footer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
};
