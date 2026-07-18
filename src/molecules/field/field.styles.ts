import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, MONO_FONT } from "../../style/index.js";

// Co-located Field skins, one per platform. Field is a "Light" platform
// treatment: ONE structure (read-only label/value rows in display mode, and a
// label/Input/message stack in control mode) and one set of semantic colors
// (those live in field.shared.tsx, driven by the active tokens so light/dark and
// the glass surface keep working). Only small per-OS touches shift here: type
// tracking, row/stack density and gaps, the label column width, and the avatar
// overflow chip radius. The BRAND survives on every platform; nothing here
// substitutes a platform default color.
//
// Field has no pressable surface of its OWN: the only interactive bits are the
// composed atoms (the ghost Copy Button, the Input), which already bring their
// own per-OS press feedback (Android ripple / iOS opacity dim) from their skins.
// So this molecule's skin does not declare press feedback.
//
//   Web: the established Canvas look (lifted verbatim) — a 180px muted label
//     column, 14/20 medium-weight value text, 12px row gap / 16px label gap, a
//     fully-round (9999) avatar overflow chip, RN's "monospace" face for mono.
//     This is Catalyst's read-only term/value (DescriptionList) look the kit
//     already ships.
//   iOS (HIG / SwiftUI LabeledContent rows): the same structure with SF Pro
//     Text tracking on the label and value text (letterSpacing -0.15 at 14pt,
//     0 at the 12pt chip, per Apple's SF tracking table) and a hair more row
//     breathing room (14px row gap) matching iOS inset-list row density. iOS
//     has no native read-only field control, so only HIG type/density
//     conventions are applied, nothing invented.
//   Android (Material 3 list/text-field rows): M3 type roles (muted term label
//     = body-medium 14/20/400/+0.25, value = label-large 14/20/500/+0.1,
//     supporting text = body-small 12/16/+0.4), a touch more row spacing
//     (16px) for M3 list-row density, and the more-rounded M3 shape on the
//     overflow chip.

// The contract a platform skin fulfills. The shell renders the display rows and
// the control stack; the skin maps each platform's type tracking, density, and
// the overflow-chip shape onto the pieces. Color comes from the shared layer.
export interface FieldSkin {
  // --- display mode (read-only label/value rows) ----------------------------
  /** Outer stack of label/value rows: the inter-row gap differs per OS. */
  displayStack: ViewStyle;
  /** One display row: the label-to-value gap and vertical alignment. */
  displayRow: ViewStyle;
  /** Left-column muted label term (width / type / tracking; color is shared). */
  fieldLabel: (t: ColorTokens) => TextStyle;
  /** The default value shape (type / tracking; color is shared). */
  fieldValue: (t: ColorTokens) => TextStyle;
  /** The trailing "+N" avatar overflow chip shape (radius differs per OS). */
  overflowChip: (t: ColorTokens) => ViewStyle;
  /** The "+N" overflow chip label type (tracking differs per OS). */
  overflowText: (t: ColorTokens) => TextStyle;
  // --- control mode (label / Input / message) -------------------------------
  /** Outer stack of label / control / message: the inter-element gap. */
  controlStack: ViewStyle;
  /** The control's label above the Input (type / tracking; color is shared). */
  label: (t: ColorTokens) => TextStyle;
  /** The helper / error message line below the control (type; color is shared). */
  message: (t: ColorTokens, error: boolean) => TextStyle;
  /** The monospace face requested by `mono` rows (RN cross-platform alias). */
  monoStyle: TextStyle;
}

// --- shared layout fragments (identical across platforms) -------------------

// The value column grows to fill the row beside the fixed label column.
export const valueFill: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Display-mode label column override for phone widths (sm and below): the
// desktop 180px column would starve the value into hard wraps there.
export const labelNarrow: TextStyle = { width: 120 };

// An overlapping avatar stack row.
export const avatarRow: ViewStyle = { flexDirection: "row", alignItems: "center" };

// Each avatar after the first overlaps the previous one.
export const avatarOverlap: ViewStyle = { marginStart: -8 };

// A copyable value: the value text followed by a ghost Copy button.
export const copyRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// The copy row's value must yield to the Copy button in a tight row (RN Text
// defaults to flexShrink 0, which would push the button out of the card).
export const copyValueText: TextStyle = { flexShrink: 1 };

// The dimmed look applied to the whole field when disabled.
export const dimmed: ViewStyle = { opacity: 0.5 };

// RN's cross-platform monospace alias (the same technique Badge uses for `mono`).
const MONO: TextStyle = { fontFamily: MONO_FONT };

// Shared overflow-chip box (everything but the per-OS radius).
const CHIP_BOX: ViewStyle = {
  marginStart: -8,
  height: 28,
  width: 28,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
};

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current Field: a fixed 180px muted label column, 14/20 medium-weight value
// text, a 12px row gap and 16px label-to-value gap, the resting-helper / error
// message line, and a fully-round (9999) avatar overflow chip.
export const webSkin: FieldSkin = {
  displayStack: { flexDirection: "column", gap: 12 },
  displayRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  fieldLabel: (t) => ({
    width: 180,
    // In a narrow parent (a sidebar card), cap the label column so the value and
    // any trailing Copy control stay inside the row instead of overflowing it.
    maxWidth: "45%",
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 20,
    color: t["muted-foreground"],
  }),
  fieldValue: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  overflowChip: (t) => ({
    ...CHIP_BOX,
    borderRadius: 9999,
    borderColor: t.background,
    backgroundColor: t.muted,
  }),
  overflowText: (t) => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] }),
  controlStack: { flexDirection: "column", gap: 6 },
  label: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  message: (t, error) => ({ fontSize: 12, lineHeight: 16, color: error ? t.destructive : t["muted-foreground"] }),
  monoStyle: MONO,
};

// ---------- iOS (HIG / SwiftUI LabeledContent rows) ----------
// Same structure; SF Pro Text tracking on the label and value text (Apple's SF
// tracking table: -0.15 at 14pt, 0 at the 12pt overflow chip) and a hair more
// row breathing room (14px row gap) for iOS inset-list row density. Keeps the
// same 9999 overflow-chip radius (iOS avatars stay fully round).
export const iosSkin: FieldSkin = {
  displayStack: { flexDirection: "column", gap: 14 },
  displayRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  fieldLabel: (t) => ({
    width: 180,
    // In a narrow parent (a sidebar card), cap the label column so the value and
    // any trailing Copy control stay inside the row instead of overflowing it.
    maxWidth: "45%",
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: t["muted-foreground"],
  }),
  fieldValue: (t) => ({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: -0.15,
    color: t.foreground,
  }),
  overflowChip: (t) => ({
    ...CHIP_BOX,
    borderRadius: 9999,
    borderColor: t.background,
    backgroundColor: t.muted,
  }),
  overflowText: (t) => ({
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0,
    color: t["muted-foreground"],
  }),
  controlStack: { flexDirection: "column", gap: 6 },
  label: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: -0.15, color: t.foreground }),
  message: (t, error) => ({ fontSize: 12, lineHeight: 16, color: error ? t.destructive : t["muted-foreground"] }),
  monoStyle: MONO,
};

// ---------- Android (Material 3 list / text-field rows) ----------
// Same structure; M3 type roles (muted term label = body-medium 14/20/400/+0.25,
// value and control label = label-large 14/20/500/+0.1, supporting text =
// body-small 12/16/+0.4, overflow chip = label-medium 12/16/500/+0.5), a touch
// more row spacing (16px) for M3 list-row density, and the more-rounded M3 shape
// (radius 8) on the overflow chip.
export const androidSkin: FieldSkin = {
  displayStack: { flexDirection: "column", gap: 16 },
  displayRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  fieldLabel: (t) => ({
    width: 180,
    // In a narrow parent (a sidebar card), cap the label column so the value and
    // any trailing Copy control stay inside the row instead of overflowing it.
    maxWidth: "45%",
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: t["muted-foreground"],
  }),
  fieldValue: (t) => ({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.1,
    color: t.foreground,
  }),
  overflowChip: (t) => ({
    ...CHIP_BOX,
    borderRadius: 8,
    borderColor: t.background,
    backgroundColor: t.muted,
  }),
  overflowText: (t) => ({
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: t["muted-foreground"],
  }),
  controlStack: { flexDirection: "column", gap: 6 },
  label: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1, color: t.foreground }),
  message: (t, error) => ({
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: error ? t.destructive : t["muted-foreground"],
  }),
  monoStyle: MONO,
};
