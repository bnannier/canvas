import { destructiveText } from "../../style/destructive-text.js";
import { scrimFill } from "../../style/scrim.js";
import { primaryText } from "../../style/primary-text.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, widths, shape } from "../../style/index.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type GlassLayer } from "../../style/glass-surface/glass-surface-props.js";

// Co-located AlertDialog skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). The card is OPAQUE on every
// theming surface: `popover` is an opaque token in both schemes and glass mode
// never rewrites it, so the prompt that stops the user to confirm a destructive
// action is never see-through. The BRAND survives on every platform (the `primary`
// confirm and the `destructive` red); only the native SHAPE, sizing, title
// alignment, action layout, and press feedback change per OS:
//   iOS (the v4 hand-off's iOS row, the UIAlertController alert): a 256pt card at the
//     iOS alert corner in the overlay material, CENTERED text (a 17 / 600 title over a
//     13 / 1.4 muted message) inset 18 / 16 / 14, and a 44pt two-cell action row under
//     a hairline, the cells split by one: Cancel at 400 and the confirm at 600, both in
//     the accent's ink, a destructive confirm in `destructive-text`. Press = opacity
//     dim (~0.85). The body confirmation field renders the iOS-styled Input.
//   Android (the hand-off's Android row): the web card at the Material 3 dialog corner,
//     in Roboto.
//   Web (the hand-off's AlertDialog renderer): the overlay material (`popover` fill,
//     the `field-border` hairline, the lg shadow) at the dialog corner, 24 padding; a
//     40 soft tone tile (a trash glyph on the destructive wash, else info on the
//     accent's, no ring), 16 above a 20px display title, its 14 / 1.5 muted description 6
//     under it, the confirmation field whose placeholder is the instruction, and 16 below
//     them two equal Buttons side by side: a secondary Cancel and a primary/destructive
//     confirm. Under glass the panel floats on the functional layer, as every web
//     floating surface does (design-language item 7, the hand-off's `--gl`).

export type Width = "narrow" | "small" | "medium" | "large";

// Panel width per width axis, drawn from the shared width scale (xs..lg), each the
// step nearest the hand-off's renderer (narrow 320, small 360, the default 380, large
// 520): the default and `small` share the sm step. Shared by every platform; the axis
// mapping is one source of truth. The panel is a floating container (a bounds provider
// for its own content): it spans its definite backdrop and caps at the step.
export const panelWidth: Record<Width, ViewStyle> = {
  narrow: { width: "100%", maxWidth: widths.xs },
  small: { width: "100%", maxWidth: widths.sm },
  medium: { width: "100%", maxWidth: widths.sm },
  large: { width: "100%", maxWidth: widths.lg },
};

// How the action row is structured. "buttons" renders the shell's Button-based
// right-aligned row (web/Android); "capsule" renders the iOS side-by-side pair of
// pill buttons drawn by the skin's own action styles (no divider).
export type ActionLayout = "buttons" | "capsule";

// The contract a platform skin fulfills. The shell renders the wrapper, the dim
// backdrop, the card, the title/description, the optional confirmation field, and
// the action row; the skin maps the active platform's shape/fill/sizing/type/
// feedback onto each piece.
export interface AlertDialogSkin {
  /** The contained dim scrim that centers the card within the preview area. */
  backdrop: (t: ColorTokens) => ViewStyle;
  /** The card base: shape, border (or lack of), padding, shadow. tokens drive fill. */
  card: (t: ColorTokens) => ViewStyle;
  /** Title type + alignment (centered on iOS, left on Android/web). */
  title: (t: ColorTokens) => TextStyle;
  /** Description type + alignment + color. */
  description: (t: ColorTokens) => TextStyle;
  /** The tone tile over the title (a trash glyph on the destructive wash, else info on
   *  the accent's): its space below, or null where the platform draws none. */
  emblem: ViewStyle | null;
  /** The panel's width cap on this platform, over the width axis (the iOS alert's 270). */
  panelWidth?: ViewStyle;
  /** The text block's inset inside the card, where the card itself is unpadded so the
   *  action row runs to its edges (the iOS alert); null where the card pads it all. */
  content: ViewStyle | null;
  /** The glass layer the panel takes under glass: the functional layer on the web (a
   *  floating surface, the hand-off's `--gl`), the dense layer on native. */
  glassLayer: GlassLayer;
  /** The confirmation field's block (its space above). */
  inputBlock: ViewStyle;
  /** Which action structure the shell renders. */
  actionLayout: ActionLayout;
  // --- "buttons" layout (web/Android): a right-aligned row of shell Buttons ----
  /** The right-aligned Button row container (the "buttons" layout). */
  actions: ViewStyle;
  /** The size prop passed to the shell's Cancel/Confirm Buttons. */
  buttonSmall: boolean;
  /** The intent props for the Cancel Button (web = secondary). */
  cancelButton: { outline?: boolean; ghost?: boolean; secondary?: boolean };
  /** The two Buttons share the row equally (each `block`), as the hand-off's grid. */
  blockButtons?: boolean;
  // --- "capsule" layout (iOS): two side-by-side pill buttons, no divider --------
  /** The action row that holds the two equal-width capsules with a gap. */
  capsuleRow: ViewStyle | null;
  /** A single capsule cell base (shape/sizing); fill comes from the *Fill helpers.
   *  The iOS alert's cells are its two halves of a hairline-topped action row. */
  capsuleCell: ViewStyle | null;
  /** The Cancel (gray) capsule fill. */
  cancelFill: ((t: ColorTokens) => ViewStyle) | null;
  /** The row's own colours (the iOS alert's hairline above the actions). */
  capsuleRowColor?: (t: ColorTokens) => ViewStyle;
  /** The Confirm capsule fill. Non-destructive = filled `primary`; destructive
   *  keeps the gray `secondary` fill (the kit fills only the primary confirm). */
  confirmFill: ((t: ColorTokens, destructive: boolean) => ViewStyle) | null;
  /** The Cancel capsule label (regular 400 weight, on-secondary color). */
  cancelLabelStyle: ((t: ColorTokens) => TextStyle) | null;
  /** The Confirm capsule label (semibold 600; white on the filled primary fill,
   *  `destructive-text` over the gray fill when destructive). */
  confirmLabelStyle: ((t: ColorTokens, destructive: boolean) => TextStyle) | null;
  /** iOS/web dim on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the action cells; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared layout fragments (identical across platforms) -------------------

// The outer wrapper fills its container's width so the modal panel can cap to the
// width actually available (see panelWidth): a narrow container (a phone screen, the
// docs preview cell) then shrinks the panel to fit instead of letting its fixed
// per-size width overflow the screen. `minWidth: 0` lets it shrink below the panel's
// content width when it is a flex item in a row. The trigger is wrapped in
// `triggerWrap` so it keeps its natural width rather than stretching to this width.
// The overlay presentation: fills the nearest OverlayProvider rather than taking
// part in page flow, so the scrim covers the page behind it and `aria-modal` is
// a true statement. The scrim is square: it covers the whole layer, so the skin's
// corner (which frames the card in a contained preview) does not apply.
export const backdropOverlay: ViewStyle = {
  borderRadius: 0,
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  minWidth: 0,
};

export const root: ViewStyle = { width: "100%", minWidth: 0 };

// An embedded specimen grows into the height its parent gives it, its scrim with it, so a
// stage that sizes the specimen is the specimen's well.
export const embeddedFill: ViewStyle = { flexGrow: 1 };

// Keeps the optional trigger button at its natural (content) width and leading-aligned,
// so the full-width `root` above does not stretch it across the container.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// Gap between the trigger button and the modal when the trigger renders above it.
export const triggerGap: ViewStyle = { marginTop: 12 };

// The card is full-width within its max-width; the per-platform skin supplies the
// shape/fill/padding/shadow on top of this.
export const cardBase: ViewStyle = { width: "100%" };

// ---------- Web: the v4 hand-off's alert ----------
const WEB_TITLE: TextStyle = { fontFamily: DISPLAY_FONT, fontSize: 20, lineHeight: 25, fontWeight: "600", letterSpacing: -0.3 };
const webCard = (t: ColorTokens): ViewStyle => ({
  borderRadius: platformShape.web.alertDialog,
  borderWidth: 1,
  borderColor: t["field-border"],
  backgroundColor: t.popover,
  padding: 24,
  ...shadow("lg", t),
});
export const webSkin: AlertDialogSkin = {
  backdrop: (t) => ({
    alignItems: "center",
    justifyContent: "center",
    borderRadius: platformShape.web.alertDialog,
    backgroundColor: scrimFill(t, 0.6),
    padding: 32,
  }),
  card: webCard,
  title: (t) => ({ ...WEB_TITLE, color: t["popover-foreground"] }),
  description: (t) => ({ marginTop: 6, fontSize: 14, lineHeight: 21, color: t["muted-foreground"] }),
  emblem: { marginBottom: 16 },
  content: null,
  glassLayer: "functional",
  inputBlock: { marginTop: 16 },
  actionLayout: "buttons",
  actions: { flexDirection: "row", gap: 8, marginTop: 16 },
  buttonSmall: false,
  cancelButton: { secondary: true },
  blockButtons: true,
  capsuleRow: null,
  capsuleCell: null,
  cancelFill: null,
  confirmFill: null,
  cancelLabelStyle: null,
  confirmLabelStyle: null,
  pressedOpacity: null,
  ripple: null,
};

// ---------- iOS (the UIAlertController alert, as the hand-off's iOS row draws it) ----------
// A 256pt card at the iOS alert corner in the overlay material, unpadded so the action
// row meets its edges; its text block inset 18 / 16 / 14 and centered: a 17 / 600 title
// over a 13 / 1.4 muted message 4 under it. The two 44pt actions share a row under a
// `field-border` hairline, split by another: Cancel at 400 and the confirm at 600 in the
// accent's ink, a destructive confirm in `destructive-text`. Press = opacity dim (~0.85).
const IOS_RADIUS = platformShape.ios.alertDialog;
export const iosSkin: AlertDialogSkin = {
  backdrop: (t) => ({
    alignItems: "center",
    justifyContent: "center",
    borderRadius: IOS_RADIUS,
    backgroundColor: scrimFill(t, 0.4),
    padding: 32,
  }),
  card: (t) => ({
    borderRadius: IOS_RADIUS,
    borderWidth: 1,
    borderColor: t["field-border"],
    backgroundColor: t.popover,
    overflow: "hidden",
    ...shadow("lg", t),
  }),
  title: (t) => ({ fontSize: 17, lineHeight: 21, fontWeight: "600", letterSpacing: -0.26, textAlign: "center", color: t["popover-foreground"] }),
  description: (t) => ({ marginTop: 4, fontSize: 13, lineHeight: 18, textAlign: "center", color: t["muted-foreground"] }),
  emblem: null,
  // The UIAlertController's fixed width at every width axis: the width scale's xxs step
  // (the hand-off draws 270).
  panelWidth: { width: "100%", maxWidth: widths.xxs },
  content: { paddingTop: 18, paddingHorizontal: 16, paddingBottom: 14 },
  glassLayer: "dense",
  inputBlock: { marginTop: 10 },
  actionLayout: "capsule",
  // Unused in the capsule layout, but the contract requires concrete values.
  actions: { flexDirection: "row" },
  buttonSmall: true,
  cancelButton: {},
  capsuleRow: { flexDirection: "row", borderTopWidth: 1 },
  capsuleRowColor: (t) => ({ borderTopColor: t["field-border"] }),
  capsuleCell: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 44, borderRadius: 0 },
  cancelFill: (t) => ({ borderRightWidth: 1, borderRightColor: t["field-border"] }),
  confirmFill: () => ({ backgroundColor: "rgba(0, 0, 0, 0)" }),
  cancelLabelStyle: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "400", color: primaryText(t) }),
  confirmLabelStyle: (t, destructive) => ({
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    color: destructive ? destructiveText(t) : primaryText(t),
  }),
  pressedOpacity: 0.85,
  ripple: null,
};

// ---------- Android: the web alert at the Material 3 dialog corner ----------
// The hand-off's Android row draws the web alert (its tone tile, its two equal
// Buttons) at the Material 3 dialog corner, in Roboto; a press ripples through the
// Button's own native feedback.
const ANDROID_RADIUS = shape.android.dialog;
export const androidSkin: AlertDialogSkin = {
  ...webSkin,
  glassLayer: "dense",
  backdrop: (t) => ({ ...webSkin.backdrop(t), borderRadius: ANDROID_RADIUS, backgroundColor: scrimFill(t, 0.32) }),
  card: (t) => ({ ...webCard(t), borderRadius: ANDROID_RADIUS }),
  title: (t) => ({ ...WEB_TITLE, fontFamily: undefined, color: t["popover-foreground"] }),
};
