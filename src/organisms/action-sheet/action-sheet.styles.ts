import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, shadow } from "../../style/index.js";

// Co-located ActionSheet skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when
// `popover` is swapped translucent at the theming level). ActionSheet is a
// platform-forward "Full" treatment: the BRAND survives on every platform (the
// indigo `primary` action tint and the `destructive` red), only the native SHAPE,
// structure, sizing, type, and press feedback change per OS:
//
//   iOS (iOS 27 / HIG action sheet): TWO separated rounded-14 cards anchored to
//     the bottom — an "actions" card (an optional centered 13pt gray title/message
//     header over a hairline divider, then the action rows separated by hairlines,
//     ~17pt brand-tinted labels, red `destructive`) and a SEPARATE rounded-14 card
//     below it holding a single bold (600) Cancel row. ~8pt gap between the cards,
//     ~8pt side inset. Press = opacity dim (~0.8).
//   Android (Material 3 modal bottom sheet): a SINGLE rounded-top (28dp) sheet that
//     spans the width, a 32x4 drag handle at the top, then left-aligned list items
//     at 16sp; the destructive item tints its label red. Cancel is the LAST row in
//     the same sheet (M3 has no separate cancel card). Flat (the sheet's own
//     elevation comes from the scrim), press = android_ripple (neutral state layer).
//   Web: the established Canvas look = the iOS action sheet (two separated rounded
//     cards), since no web library ships an action sheet and the iOS idiom reads
//     cleanly on the web. Press = opacity dim.

// The destructive tint and brand action tint are read from tokens so light/dark
// (and glass) keep working; the skin never hard-codes the iOS system blue.

// How the Cancel affordance is structured. "separateCard" (iOS/web) renders a
// second rounded card below the actions card holding a bold Cancel row;
// "lastRow" (Android) folds Cancel into the single sheet as its final list row.
export type CancelLayout = "separateCard" | "lastRow";

// The contract a platform skin fulfills. The shell owns the full-screen Modal, the
// dimmed scrim, the bottom-anchored stack, the header (title/message), the action
// rows, the Cancel affordance, the open/close state, and the a11y wiring; the skin
// maps the active platform's shape/structure/sizing/type/feedback onto each piece,
// reading the tokens so light/dark keep working.
export interface ActionSheetSkin {
  /** The scrim dimming alpha behind the sheet (iOS/web ~0.4, Android ~0.32). */
  scrimOpacity: number;
  /** Where the Cancel affordance lives: a separate card (iOS/web) or the last row (Android). */
  cancelLayout: CancelLayout;
  /** The bottom-anchored stack container (side inset + gap between the cards). */
  stack: ViewStyle;
  /** The actions card surface shape (radius, fill, shadow); fed to GlassSurface. */
  actionsCard: (t: ColorTokens) => ViewStyle;
  /** The separate Cancel card surface shape (iOS/web only); null on Android. */
  cancelCard: ((t: ColorTokens) => ViewStyle) | null;
  /** An optional drag handle at the top of the sheet (Android); null elsewhere. */
  handle: ((t: ColorTokens) => ViewStyle) | null;
  /** The title/message header block container (padding + alignment). */
  header: ViewStyle;
  /** The header title type (centered gray on iOS/web, left on Android). */
  headerTitle: (t: ColorTokens) => TextStyle;
  /** The header message type. */
  headerMessage: (t: ColorTokens) => TextStyle;
  /** A hairline divider drawn between the header and rows, and between rows (iOS/web). */
  divider: ((t: ColorTokens) => ViewStyle) | null;
  /** A single action row container (sizing + alignment). */
  row: ViewStyle;
  /** An action row label; `destructive` tints it red, `disabled` dims it. */
  rowLabel: (t: ColorTokens, destructive: boolean, disabled: boolean) => TextStyle;
  /** The Cancel row container (its own card on iOS/web; the last list row on Android). */
  cancelRow: ViewStyle;
  /** The Cancel row label (bold on iOS/web; a plain list label on Android). */
  cancelLabel: (t: ColorTokens) => TextStyle;
  /** iOS/web dim-on-press opacity; null on Android (the ripple carries press). */
  pressedOpacity: number | null;
  /** Android ripple over the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared scrim (identical across platforms) ------------------------------

// The full-screen scrim that fills the Modal and lays the stack against the
// bottom edge. A tap on it (wired in the shell) dismisses the sheet. The dimming
// alpha is the only per-OS value, supplied by the skin.
export function scrim(opacity: number): ViewStyle {
  return { flex: 1, flexDirection: "column", justifyContent: "flex-end", backgroundColor: `rgba(0,0,0,${opacity})` };
}

// ---------- Web: the established Canvas look (= the iOS action sheet) ----------
// No web library ships an action sheet, so the kit's web look is the iOS idiom:
// two separated rounded-14 cards anchored to the bottom, a centered gray header,
// hairline-divided ~17pt brand action rows, a red destructive label, and a
// separate bold Cancel card. Press = opacity dim.
const WEB_RADIUS = 14;
export const webSkin: ActionSheetSkin = {
  scrimOpacity: 0.4,
  cancelLayout: "separateCard",
  stack: { paddingHorizontal: 8, paddingTop: 8, gap: 8 },
  actionsCard: (t) => ({ borderRadius: WEB_RADIUS, backgroundColor: t.popover, ...shadow("lg") }),
  cancelCard: (t) => ({ borderRadius: WEB_RADIUS, backgroundColor: t.popover, ...shadow("lg") }),
  handle: null,
  header: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  headerTitle: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t["muted-foreground"], textAlign: "center" }),
  headerMessage: (t) => ({ marginTop: 2, fontSize: 13, lineHeight: 18, color: t["muted-foreground"], textAlign: "center" }),
  divider: (t) => ({ height: 1, backgroundColor: t.border }),
  row: { minHeight: 57, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  rowLabel: (t, destructive, disabled) => ({
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
    textAlign: "center",
    color: destructive ? t.destructive : t.primary,
    opacity: disabled ? 0.4 : 1,
  }),
  cancelRow: { minHeight: 57, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  cancelLabel: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", textAlign: "center", color: t.primary }),
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- iOS 27 (HIG action sheet): two separated rounded-14 cards ----------
// Apple's modal action sheet: two cards anchored to the bottom over a dimmed
// scrim. The actions card carries an optional centered 13pt gray title/message
// header over a hairline divider, then the action rows separated by hairlines
// (~17pt rows; the brand tint replaces the iOS system blue, red `destructive`).
// A SEPARATE rounded-14 card below it holds a single bold (600) Cancel row, with
// an ~8pt gap between the cards. ~8pt side inset. Press = opacity dim (~0.8).
const IOS_RADIUS = 14;
export const iosSkin: ActionSheetSkin = {
  scrimOpacity: 0.4,
  cancelLayout: "separateCard",
  stack: { paddingHorizontal: 8, paddingTop: 8, gap: 8 },
  actionsCard: (t) => ({ borderRadius: IOS_RADIUS, backgroundColor: t.popover, ...shadow("lg") }),
  cancelCard: (t) => ({ borderRadius: IOS_RADIUS, backgroundColor: t.popover, ...shadow("lg") }),
  handle: null,
  header: { paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  headerTitle: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t["muted-foreground"], textAlign: "center" }),
  headerMessage: (t) => ({ marginTop: 2, fontSize: 13, lineHeight: 18, color: t["muted-foreground"], textAlign: "center" }),
  divider: (t) => ({ height: 1, backgroundColor: t.border }),
  row: { minHeight: 57, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  rowLabel: (t, destructive, disabled) => ({
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
    textAlign: "center",
    color: destructive ? t.destructive : t.primary,
    opacity: disabled ? 0.4 : 1,
  }),
  cancelRow: { minHeight: 57, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  cancelLabel: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", textAlign: "center", color: t.primary }),
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 modal bottom sheet): one rounded-top sheet ----------
// M3 has no action sheet; the equivalent is a modal bottom sheet of list items. A
// SINGLE sheet spans the width and rounds its top corners 28dp, with a 32x4 drag
// handle at the top. The header sits left-aligned, then left-aligned list items at
// 16sp (the destructive item tints its label red). Cancel folds into the SAME
// sheet as its last list row (no separate cancel card). Press = android_ripple
// (neutral state layer); the sheet is flat (the scrim supplies the separation).
const ANDROID_RADIUS = 28;
export const androidSkin: ActionSheetSkin = {
  scrimOpacity: 0.32,
  cancelLayout: "lastRow",
  stack: {},
  actionsCard: (t) => ({
    borderTopLeftRadius: ANDROID_RADIUS,
    borderTopRightRadius: ANDROID_RADIUS,
    backgroundColor: t.popover,
    paddingBottom: 8,
  }),
  cancelCard: null,
  // The M3 drag handle: a 32x4 rounded bar, centered at the top, in the on-surface
  // color at low alpha (the M3 "surfaceContainerHighest on-surface variant" cue).
  handle: (t) => ({
    width: 32,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: alpha(t["muted-foreground"], 0.4),
  }),
  header: { paddingTop: 8, paddingBottom: 12, paddingHorizontal: 24, alignItems: "flex-start" },
  headerTitle: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "500", color: t["popover-foreground"] }),
  headerMessage: (t) => ({ marginTop: 4, fontSize: 14, lineHeight: 20, color: t["muted-foreground"] }),
  // M3 list items are flush (no hairline rules between rows).
  divider: null,
  row: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 },
  rowLabel: (t, destructive, disabled) => ({
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    color: destructive ? t.destructive : t["popover-foreground"],
    opacity: disabled ? 0.38 : 1,
  }),
  cancelRow: { minHeight: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 },
  cancelLabel: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "400", color: t["popover-foreground"] }),
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),
};
