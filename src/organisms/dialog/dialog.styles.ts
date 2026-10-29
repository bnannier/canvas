import { destructiveText } from "../../style/destructive-text.js";
import { scrimFill } from "../../style/scrim.js";
import { primaryText } from "../../style/primary-text.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha, widths, shape } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";

// Co-located Dialog skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when the
// shell renders the panel through GlassSurface, which strips the skin's fill and
// paints the active material over its own `glass-tint`; the `popover` token itself
// is opaque in both modes and glass never rewrites it). The BRAND
// survives on every platform (the `primary` confirm action, the
// `destructive` red for an irreversible confirm); only the native SHAPE, sizing,
// title alignment, body type, footer layout, and backdrop dimming change per OS:
//   iOS (iOS 27 / Liquid Glass alert): a centered card (the iOS dialog corner,
//     `popover` fill, NO border, soft lg shadow) over a ~0.30 black backdrop; a LEFT-aligned
//     ~20pt/700 title, a ~15pt muted LEFT body, and a side-by-side row of CAPSULE
//     action buttons (a gray `secondary` Cancel capsule + a `primary`
//     Confirm capsule; a destructive confirm is a gray capsule with `destructive`
//     red text), NO hairline dividers; press = opacity dim (~0.8).
//   Android (Material 3 basic dialog, as the v4 hand-off's Android row draws it): the
//     web panel at the Material 3 dialog corner over a ~0.32 black scrim, the web
//     heading in Roboto, and TEXT-button actions (no fill) bottom-RIGHT in a row
//     (Cancel then Confirm) in `primary-text`, an android_ripple on each, no dividers.
//   Web: the v4 hand-off's panel: the overlay material (`popover` fill, the
//     `field-border` hairline, the lg shadow) at the dialog corner, 22 padding, an 18px
//     display heading (600, -0.015em) over its 14/1.5 muted description, 14 between
//     the parts, and a right-aligned action row of a ghost Cancel + a primary/destructive
//     Confirm Button; a form's close is the renderer's bare 28 px ghost box with a 16 px x.

export type Size = "xs" | "small" | "medium" | "default" | "large" | "wide";

// The dialog card's max width per size, narrowest to widest, drawn from the
// shared width scale (src/style/tokens.ts `widths`), each the step nearest the v4
// hand-off's width (xs 300, small 360, the default 420, medium 440, large 520, wide
// 600): the default and `medium` share the md step.
export const PANEL_MAX_WIDTH: Record<Size, number> = {
  xs: widths.xs,
  small: widths.sm,
  medium: widths.md,
  default: widths.md,
  large: widths.lg,
  wide: widths.xl,
};

// How the footer renders its actions. The web/Android footer is a horizontal
// row of Buttons (web) / text buttons (Android); iOS renders a side-by-side row
// of CAPSULE buttons (the iOS 27 alert: a gray Cancel capsule + a primary
// Confirm capsule, no dividers). The shell reads this to pick the footer
// structure.
export type FooterKind = "buttons" | "capsules";

// The contract a platform skin fulfills. The shell renders the backdrop, the
// centered card (shape/fill/border/shadow from the skin), the title, the body,
// the optional data-driven form, and the footer; the skin maps each piece onto
// the active platform's look. The footer kind picks between a Button row
// (web/Android) and iOS's side-by-side capsule row.
export interface DialogSkin {
  /** Structured application form treatment; platform alert defaults remain separate. */
  form?: {
    card: (t: ColorTokens) => ViewStyle;
    title: (t: ColorTokens) => TextStyle;
    description: (t: ColorTokens) => TextStyle;
  };
  /** The form's close as the platform draws it: the kit's bare 28 px ghost icon Button
   *  (`compactIcon`) with this glyph size and ink. Omitted, the close is the kit's round
   *  ghost icon Button. */
  close?: { iconSize: number; color: (t: ColorTokens) => string };
  /** The space between the `icon` tile and the title under it. */
  iconGap: number;
  /** The dim backdrop behind the card (full black at the per-platform opacity). */
  backdrop: (t: ColorTokens) => ViewStyle;
  /** The card layout box: shape, fill, border (or lack of), shadow, padding. The
   *  shell supplies the per-size maxWidth inline. */
  card: (t: ColorTokens) => ViewStyle;
  /** The title type: size, weight, alignment, color. */
  title: (t: ColorTokens) => TextStyle;
  /** The body/description type: size, color, alignment. */
  body: (t: ColorTokens) => TextStyle;
  /** Whether the footer is a Button row or iOS's side-by-side capsule row. */
  footerKind: FooterKind;
  /** The footer container (the action row). */
  footer: (t: ColorTokens) => ViewStyle;
  // --- capsule (iOS) footer pieces; null on the Button-row platforms ---------
  /** A single capsule action button's box (shape/padding); each capsule grows to
   *  share the row evenly. `confirm` true for the primary/confirm capsule. */
  capsule: ((t: ColorTokens, confirm: boolean, destructive: boolean) => ViewStyle) | null;
  /** The label inside a capsule; `confirm` true for the primary confirm action
   *  (drawn on the `primary` fill), `destructive` true for an irreversible confirm
   *  (red text on a gray capsule). */
  capsuleLabel: ((t: ColorTokens, confirm: boolean, destructive: boolean) => TextStyle) | null;
  /** Opacity applied to a pressed capsule (iOS dims; null elsewhere). */
  capsulePressedOpacity: number | null;
  // --- text-button (Android) footer pieces; null elsewhere -------------------
  /** An Android text-button touch target (no fill, a `primary-text` label). */
  textButton: ViewStyle | null;
  /** The Android text-button label; `destructive` reds an irreversible confirm. */
  textButtonLabel: ((t: ColorTokens, destructive: boolean) => TextStyle) | null;
  /** The Android ripple over a text button; null on the other platforms. */
  textButtonRipple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  // --- data-driven body form (Amount + Reason) -------------------------------
  /** Wrapper above the form fields. */
  formBody: ViewStyle;
  /** A field label above an input. */
  fieldLabel: (t: ColorTokens) => TextStyle;
  /** Extra top inset for the second field label. */
  fieldLabelGap: ViewStyle;
  /** The Amount row (currency glyph + input). */
  amountRow: ViewStyle;
  /** The leading currency glyph; the Amount input beside it is FILL and takes the rest of the row. */
  currency: (t: ColorTokens) => TextStyle;
}

// --- outer shell (identical across platforms) -------------------------------

// The outermost wrapper fills its container's width so the modal panel can cap to
// the width actually available (see cardWidth): a narrow container (a phone screen,
// the docs preview cell) then shrinks the panel to fit instead of letting its fixed
// per-size width overflow the screen. `minWidth: 0` lets it shrink below the panel's
// content width when it is a flex item in a row. The trigger button is wrapped in
// `triggerWrap` so it keeps its natural width rather than stretching to this full width.
export const root: ViewStyle = { width: "100%", minWidth: 0 };

// An embedded specimen grows into the height its parent gives it, its scrim with it, so a
// stage that sizes the specimen is the specimen's well.
export const embeddedFill: ViewStyle = { flexGrow: 1 };

// Keeps the optional trigger button at its natural (content) width and leading-aligned,
// so the full-width `root` above does not stretch it across the container.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// Inset between the trigger button and the backdrop when a trigger is rendered.
export const backdropTriggerGap: ViewStyle = { marginTop: 12 };

// The contained backdrop sizing (centered, with presence in the docs preview via
// an explicit minHeight). The per-platform fill/radius come from the skin.
// `minWidth: 0` lets the backdrop shrink below the card's content width so a narrow
// container caps the panel (the card's maxWidth:"100%") instead of overflowing.
// The overlay presentation: fills the nearest OverlayProvider rather than
// taking part in page flow, so the scrim genuinely covers the page behind it and
// `aria-modal` is a true statement. No minHeight here, the layer supplies it. The
// scrim is square: it covers the whole layer, so the skin's corner (which frames the
// card in a contained preview) does not apply.
export const backdropOverlay: ViewStyle = {
  borderRadius: 0,
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  minWidth: 0,
};

export const backdropLayout: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  minHeight: 220,
  minWidth: 0,
};

// The card layout box (width up to its per-size cap). Shape/fill/shadow come
// from the skin; this owns the box-model that every platform shares.
export const cardLayout: ViewStyle = { width: "100%", padding: 24, flexShrink: 1, minHeight: 0 };

// The sizing box around the card: it fills the centered backdrop (up to cardWidth's
// cap) and may shrink to the backdrop's height, so the card and its content region
// shrink with it when the overlay bounds the content. The card appears in place with
// no motion; its own padding stays on cardLayout, inside this box.
export const cardSizing: ViewStyle = { width: "100%", maxHeight: "100%", flexShrink: 1, minHeight: 0 };
export const contentSizing: ViewStyle = { flexShrink: 1, minHeight: 0 };
// Workspace forms have a measured viewport height, leaving the card's inner
// content with a definite flex bound for a separately scrolling child.
export const workspaceSizing = (height: number, compact = false): ViewStyle =>
  compact ? { maxHeight: height } : { height, maxHeight: height };
export const workspaceHeight = (windowHeight: number, topInset = 0, bottomInset = 0): number =>
  Math.max(0, windowHeight - topInset - bottomInset - 40);
export const workspaceCard: ViewStyle = { flex: 1, minHeight: 0 };
export const workspaceContent: ViewStyle = { flex: 1, minHeight: 0 };
export const workspaceHeader: ViewStyle = { flexShrink: 0, marginTop: 18 };
// Preserve the content's intrinsic height through every wrapper. The outer
// viewport maximum can still shrink the chain, so a child's scrollport gets the
// remaining space while its composer and the dialog header/footer stay fixed.
export const compactWorkspaceContent: ViewStyle = { flexGrow: 0, flexShrink: 1, flexBasis: "auto", minHeight: 0 };
export const workspaceBody: ViewStyle = { flex: 1, minHeight: 0, marginTop: 18 };
export const workspaceFooter: ViewStyle = { flexShrink: 0, marginTop: 18 };
// The `banded` form (the Wizard's panel): the panel takes no padding and draws three bands
// split by hairline rules, the header padded 20 20 16 over its rule (its rows 16 apart),
// the body padded 20, the footer padded 14 20 under its rule.
export const bandedCard: ViewStyle = { padding: 0, overflow: "hidden" };
export const bandedHeader: ViewStyle = { flexShrink: 0, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, gap: 16, borderBottomWidth: 1 };
export const bandedBody: ViewStyle = { flex: 1, minHeight: 0, padding: 20 };
export const bandedFooter: ViewStyle = { flexShrink: 0, paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: 1 };
export const dismissBackdrop: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };

// Per-size panel width: a dialog is a floating container (a bounds provider for
// its own content), so it spans its backdrop and caps at its size's step of the
// width scale. The backdrop is definite (the viewport, a host, the docs stage),
// which is what lets `width:"100%"` resolve; a content-sized parent would
// collapse it, and the docs stage stopped being one for exactly that reason.
export function cardWidth(size: Size): ViewStyle {
  return { width: "100%", maxWidth: PANEL_MAX_WIDTH[size] };
}

// ---------- Web: the v4 hand-off's panel ----------
// Its Dialog renderer: the overlay material at the dialog corner, 22 padding and a 14
// gap; the heading is ttl(18): the display face at 600 with -0.015em tracking on its
// 1.25 line; the description dsc(): 14/1.5 in the muted ink, 4 under the heading.
const WEB_TITLE: TextStyle = { fontFamily: DISPLAY_FONT, fontSize: 18, lineHeight: 22.5, fontWeight: "600", letterSpacing: -0.27 };
const WEB_BODY: TextStyle = { fontSize: 14, lineHeight: 21, fontWeight: "400" };
const webPanel = (t: ColorTokens): ViewStyle => ({
  borderRadius: shape.web.dialog,
  borderWidth: 1,
  borderColor: t["field-border"],
  backgroundColor: t.popover,
  padding: 22,
  ...shadow("lg", t),
});
export const webSkin: DialogSkin = {
  // The renderer's close: a bare 28 px ghost box holding the 16 px x in the third ink.
  close: {
    iconSize: 16,
    color: (t) => t["subtle-foreground"] ?? t["muted-foreground"],
  },
  iconGap: 20,
  form: {
    card: webPanel,
    title: (t) => ({ ...WEB_TITLE, color: t["popover-foreground"] }),
    description: (t) => ({ ...WEB_BODY, color: t["muted-foreground"] }),
  },
  backdrop: (t) => ({ borderRadius: shape.web.dialog, backgroundColor: scrimFill(t, 0.6) }),
  card: webPanel,
  title: (t) => ({ ...WEB_TITLE, color: t["popover-foreground"] }),
  body: (t) => ({ ...WEB_BODY, color: t["muted-foreground"], marginTop: 4 }),
  footerKind: "buttons",
  footer: () => ({ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 14 }),
  capsule: null,
  capsuleLabel: null,
  capsulePressedOpacity: null,
  textButton: null,
  textButtonLabel: null,
  textButtonRipple: null,
  // The hand-off's form field: a 13 / 500 muted label 6 over its field, 14 under the text.
  formBody: { marginTop: 14 },
  fieldLabel: (t) => ({ fontSize: 13, lineHeight: 17, fontWeight: "500", color: t["muted-foreground"], marginBottom: 6 }),
  fieldLabelGap: { marginTop: 14 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currency: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"], marginEnd: 8 }),
};

// ---------- iOS (iOS 27 alert): rounded card, no border, side-by-side capsules ----------
// iOS 27 (iOS 26+ / Liquid Glass) alert: a centered card (28pt radius) over the
// `popover` fill with NO border and a soft shadow, on a ~0.30 black backdrop; a
// LEFT-aligned 20pt/700 title, a 15pt muted LEFT body, and a side-by-side row of
// CAPSULE action buttons, a gray `secondary` Cancel capsule + a `primary`
// Confirm capsule, with NO hairline dividers. A destructive confirm keeps
// the gray `secondary` capsule but draws its label in the `destructive` red. Each
// capsule shares the row evenly; a pressed capsule dims (no ripple) at 0.8.
const IOS_RADIUS = shape.ios.dialog;
const IOS_CAPSULE_RADIUS = shape.ios.control;
export const iosSkin: DialogSkin = {
  iconGap: 16,
  backdrop: (t) => ({ borderRadius: IOS_RADIUS, backgroundColor: scrimFill(t, 0.3) }),
  card: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    ...shadow("lg", t),
  }),
  title: (t) => ({
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: t["popover-foreground"],
    textAlign: "left",
  }),
  body: (t) => ({
    fontSize: 15,
    lineHeight: 20,
    color: t["muted-foreground"],
    textAlign: "left",
    marginTop: 8,
  }),
  footerKind: "capsules",
  footer: () => ({ flexDirection: "row", gap: 12, marginTop: 20 }),
  // A capsule sized to share the row evenly. The Confirm capsule fills with the
  // `primary`; Cancel and a destructive Confirm both fill with the gray
  // `secondary` surface (the destructive variant only reds its label).
  capsule: (t, confirm, destructive) => ({
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    borderRadius: IOS_CAPSULE_RADIUS,
    backgroundColor: confirm && !destructive ? t.primary : t.secondary,
  }),
  capsuleLabel: (t, confirm, destructive) => ({
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: destructive
      ? destructiveText(t)
      : confirm
        ? t["primary-foreground"]
        : t["secondary-foreground"],
    textAlign: "center",
  }),
  capsulePressedOpacity: 0.8,
  textButton: null,
  textButtonLabel: null,
  textButtonRipple: null,
  formBody: { marginTop: 16 },
  fieldLabel: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "500", color: t.foreground, marginBottom: 6 }),
  fieldLabelGap: { marginTop: 14 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currency: (t) => ({ fontSize: 15, lineHeight: 20, color: t["muted-foreground"], marginEnd: 8 }),
};

// ---------- Android (Material 3 basic dialog): the web panel at 28, a text-button row ----------
// The hand-off's Android row: the web panel and heading (in Roboto) at the Material 3
// dialog corner on a ~0.32 black scrim, and TEXT-button actions (no fill) bottom-RIGHT in
// a row (Cancel then Confirm): 40 high, 12 in, 14 / 500 in `primary-text`, an
// android_ripple on each, and NO dividers.
const ANDROID_RADIUS = shape.android.dialog;
export const androidSkin: DialogSkin = {
  iconGap: 16,
  backdrop: (t) => ({ borderRadius: ANDROID_RADIUS, backgroundColor: scrimFill(t, 0.32) }),
  card: (t) => ({ ...webPanel(t), borderRadius: ANDROID_RADIUS }),
  title: (t) => ({ ...WEB_TITLE, fontFamily: undefined, color: t["popover-foreground"] }),
  body: (t) => ({ ...WEB_BODY, color: t["muted-foreground"], marginTop: 4 }),
  footerKind: "buttons",
  footer: () => ({ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 14 }),
  capsule: null,
  capsuleLabel: null,
  capsulePressedOpacity: null,
  // A flat text-button: no fill, comfortable touch target, rounded for the ripple.
  textButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    // An M3 text button: the control role, a stadium.
    borderRadius: shape.android.control,
    // clip the Material ripple to the rounded outline (else it bleeds past the corners as a rectangle)
    overflow: "hidden",
    minHeight: 40,
  },
  textButtonLabel: (t, destructive) => ({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.1,
    color: destructive ? destructiveText(t) : primaryText(t),
  }),
  textButtonRipple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
  formBody: { marginTop: 14 },
  fieldLabel: (t) => ({ fontSize: 13, lineHeight: 17, fontWeight: "500", color: t["muted-foreground"], marginBottom: 6 }),
  fieldLabelGap: { marginTop: 14 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currency: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"], marginEnd: 8 }),
};
