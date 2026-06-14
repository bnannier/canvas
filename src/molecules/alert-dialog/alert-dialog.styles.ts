import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located AlertDialog skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and read as glass when
// tokens.popover is swapped translucent at the theming level). The BRAND survives
// on every platform (the `primary` confirm and the `destructive` red); only the
// native SHAPE, sizing, title alignment, action layout, and press feedback change
// per OS:
//   iOS (iOS 27 / Liquid Glass alert): a rounded card (~28 radius, `popover`
//     fill, soft shadow, no border), a LEFT-aligned bold title and a left-aligned
//     `muted-foreground` message; exactly two actions rendered as two CAPSULES
//     side by side (no divider) — a gray Cancel capsule (`secondary` fill) and a
//     filled Confirm capsule (`primary`, or `destructive` when destructive) with
//     a white label. Press = opacity dim (~0.85).
//   Android (Material 3 AlertDialog): an elevated surface (28 radius, `popover`
//     fill, soft shadow), a LEFT-aligned title and left-aligned body; two M3 TEXT
//     buttons bottom-right (Cancel then Confirm/Delete), the confirm tinted with
//     the brand `primary` and a destructive confirm in the `destructive` red.
//     Press = android_ripple (brand state layer).
//   Web: the established Canvas look (the current alert-dialog, lifted verbatim) —
//     a bordered, dim-backed card (8 radius, 1px `border`, `popover` fill,
//     shadow-xl, padding 24), a left-aligned 16pt/600 title and 14pt
//     `muted-foreground` description, with a right-aligned action row of an
//     `outline` Cancel Button plus a `primary`/`destructive` confirm Button.

export type Width = "narrow" | "small" | "medium" | "large";

// Panel max-width per width axis (mirroring Tailwind's max-w-xs..lg). Shared by
// every platform; the native skins narrow the medium/large footprint a touch but
// the axis mapping is one source of truth.
export const panelWidth: Record<Width, ViewStyle> = {
  narrow: { maxWidth: 320 },
  small: { maxWidth: 384 },
  medium: { maxWidth: 448 },
  large: { maxWidth: 512 },
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
  backdrop: ViewStyle;
  /** The card base: shape, border (or lack of), padding, shadow. tokens drive fill. */
  card: (t: ColorTokens) => ViewStyle;
  /** Title type + alignment (centered on iOS, left on Android/web). */
  title: (t: ColorTokens) => TextStyle;
  /** Description type + alignment + color. */
  description: (t: ColorTokens) => TextStyle;
  /** The confirmation-field block container ("Type DELETE to confirm" + input). */
  inputBlock: ViewStyle;
  /** The confirmation-field label. */
  inputLabel: (t: ColorTokens) => TextStyle;
  /** Which action structure the shell renders. */
  actionLayout: ActionLayout;
  // --- "buttons" layout (web/Android): a right-aligned row of shell Buttons ----
  /** The right-aligned Button row container (the "buttons" layout). */
  actions: ViewStyle;
  /** The size prop passed to the shell's Cancel/Confirm Buttons. */
  buttonSmall: boolean;
  /** The intent props for the Cancel Button (web = outline; Android = ghost/text). */
  cancelButton: { outline?: boolean; ghost?: boolean };
  // --- "capsule" layout (iOS): two side-by-side pill buttons, no divider --------
  /** The action row that holds the two equal-width capsules with a gap. */
  capsuleRow: ViewStyle | null;
  /** A single capsule cell base (shape/sizing); fill comes from the *Fill helpers. */
  capsuleCell: ViewStyle | null;
  /** The Cancel (gray) capsule fill. */
  cancelFill: ((t: ColorTokens) => ViewStyle) | null;
  /** The Confirm capsule fill; `destructive` swaps `primary` for `destructive`. */
  confirmFill: ((t: ColorTokens, destructive: boolean) => ViewStyle) | null;
  /** The Cancel capsule label (regular weight, on-secondary color). */
  cancelLabelStyle: ((t: ColorTokens) => TextStyle) | null;
  /** The Confirm capsule label (weight 600, on-fill foreground). */
  confirmLabelStyle: ((t: ColorTokens, destructive: boolean) => TextStyle) | null;
  /** iOS/web dim on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the action cells; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// --- shared layout fragments (identical across platforms) -------------------

// The outer wrapper aligns the dialog (and its optional trigger) to the start.
export const root: ViewStyle = { alignSelf: "flex-start" };

// Gap between the trigger button and the modal when the trigger renders above it.
export const triggerGap: ViewStyle = { marginTop: 12 };

// The card is full-width within its max-width; the per-platform skin supplies the
// shape/fill/padding/shadow on top of this.
export const cardBase: ViewStyle = { width: "100%" };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current alert-dialog: a contained dim scrim (rounded-md, black/50) centering
// a bordered card (rounded-md border bg-popover p-6 shadow-xl); a left-aligned
// 16pt/600 title and 14pt muted description; a right-aligned action row (gap-2,
// mt-6) of an outline Cancel Button plus a primary/destructive confirm Button.
export const webSkin: AlertDialogSkin = {
  backdrop: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: alpha("#000000", 0.5),
    padding: 32,
  },
  card: (t) => ({
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.popover,
    padding: 24,
    ...shadow("xl"),
  }),
  title: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "600", color: t["popover-foreground"] }),
  description: (t) => ({ marginTop: 8, fontSize: 14, lineHeight: 20, color: t["muted-foreground"] }),
  inputBlock: { marginTop: 16 },
  inputLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  actionLayout: "buttons",
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 },
  buttonSmall: true,
  cancelButton: { outline: true },
  capsuleRow: null,
  capsuleCell: null,
  cancelFill: null,
  confirmFill: null,
  cancelLabelStyle: null,
  confirmLabelStyle: null,
  pressedOpacity: null,
  ripple: null,
};

// ---------- iOS 27 (Liquid Glass alert): rounded card, left text, capsule actions ----------
// iOS 26+/27 alert (per Apple's design kit): a rounded card (~28pt radius) over the
// `popover` fill with a soft shadow and NO border; a LEFT-aligned bold title and a
// LEFT-aligned `muted-foreground` message. The two actions are CAPSULES side by
// side (no hairline divider): a gray Cancel capsule (`secondary` fill,
// `secondary-foreground` text) and a filled Confirm capsule (`primary`, or
// `destructive` when destructive) with white/`*-foreground` label. The brand
// survives: the iOS system blue becomes the indigo `primary` token. Press = opacity
// dim (~0.85).
const IOS_RADIUS = 28;
const IOS_CAPSULE_RADIUS = 999;
export const iosSkin: AlertDialogSkin = {
  backdrop: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: alpha("#000000", 0.4),
    padding: 32,
  },
  // Rounded card with content padding; no border, soft shadow.
  card: (t) => ({
    borderRadius: IOS_RADIUS,
    backgroundColor: t.popover,
    padding: 24,
    ...shadow("lg"),
  }),
  title: (t) => ({
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: t["popover-foreground"],
  }),
  description: (t) => ({
    marginTop: 8,
    fontSize: 16,
    lineHeight: 21,
    color: t["muted-foreground"],
  }),
  inputBlock: { marginTop: 16 },
  inputLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 18, fontWeight: "600", color: t.foreground }),
  actionLayout: "capsule",
  // Unused in the capsule layout, but the contract requires concrete values.
  actions: { flexDirection: "row" },
  buttonSmall: true,
  cancelButton: {},
  // Two equal-width capsules side by side, separated by a gap (no divider).
  capsuleRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  capsuleCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    borderRadius: IOS_CAPSULE_RADIUS,
  },
  cancelFill: (t) => ({ backgroundColor: t.secondary }),
  confirmFill: (t, destructive) => ({ backgroundColor: destructive ? t.destructive : t.primary }),
  cancelLabelStyle: (t) => ({ fontSize: 17, lineHeight: 22, fontWeight: "600", color: t["secondary-foreground"] }),
  confirmLabelStyle: (t, destructive) => ({
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: destructive ? t["destructive-foreground"] : t["primary-foreground"],
  }),
  pressedOpacity: 0.85,
  ripple: null,
};

// ---------- Android (Material 3 AlertDialog): elevated surface, text buttons ----------
// M3 basic dialog: an elevated surface (28dp radius) over `popover` with a soft
// shadow; a LEFT-aligned 24sp/headline-small title and a left-aligned 14sp body in
// `muted-foreground`. Two M3 TEXT buttons sit bottom-right (Cancel then Confirm/
// Delete) — the confirm carries the brand `primary`, a destructive confirm the
// `destructive` red. The shell renders these with its ghost (text) Buttons; press =
// android_ripple, supplied here as the brand state layer.
export const androidSkin: AlertDialogSkin = {
  backdrop: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: alpha("#000000", 0.32),
    padding: 32,
  },
  card: (t) => ({
    borderRadius: 28,
    backgroundColor: t.popover,
    padding: 24,
    ...shadow("md"),
  }),
  title: (t) => ({ fontSize: 24, lineHeight: 32, fontWeight: "400", color: t["popover-foreground"] }),
  description: (t) => ({ marginTop: 16, fontSize: 14, lineHeight: 20, color: t["muted-foreground"] }),
  inputBlock: { marginTop: 16 },
  inputLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  actionLayout: "buttons",
  // M3 places the action buttons bottom-right with 8dp gap and 24dp above.
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 },
  buttonSmall: true,
  // M3 dialog actions are text (ghost) buttons, not outlined.
  cancelButton: { ghost: true },
  capsuleRow: null,
  capsuleCell: null,
  cancelFill: null,
  confirmFill: null,
  cancelLabelStyle: null,
  confirmLabelStyle: null,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
