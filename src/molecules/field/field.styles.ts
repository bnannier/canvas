import { destructiveText } from "../../style/destructive-text.js";
import { typeRoles } from "../../style/type-scale.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Field skins, one per platform, drawn to the Canvas v4 hand-off
// (tools/v4/handoff/cv-kit-inputs.js `K.def('field')` and its `msg` line, and the iOS and
// Android field rows `P.input` in cv-kit-platform.js, whose title and message a Field
// heads and closes there). Field is a "Light" platform treatment: ONE structure (a label
// above, the control, then one message line) in field.shared.tsx; only the type, inks and
// rhythm of the label and the message shift here. Field paints no surface and owns no
// pressable: the control it wraps brings its own per-OS look and press feedback.
//
//   Web: the hand-off's 500 13px `label` role in `muted-foreground`, a 6px stack, and the
//     400 12px message (line 1.4) in the subtle ink; an error message leads with the 13px
//     circled alert, 6px from its text, in the destructive ink.
//   iOS: the hand-off's iOS field row: the 14pt regular secondary title (SF Pro Text
//     tracking -0.15) 8 above the box, and the 13pt message (-0.08) 8 below it, in the
//     subtle ink, red when it is the error. No glyph.
//   Android (Material 3): a label that stays above is the field's resting body-large type
//     at medium weight (the Input's above label); the supporting text is body-small 12/16
//     at +0.4 in `muted-foreground`, 4dp under the box and, under a filled field the label
//     was delegated into, inset 16dp to the field's text edge.
export interface FieldSkin {
  /** Outer stack of label / control / message: the inter-element gap. */
  stack: ViewStyle;
  /** The static label above the control, used when the label is NOT delegated. */
  label: (t: ColorTokens) => TextStyle;
  /** The helper or error line below the control. `error` swaps the helper ink for destructive. */
  message: (t: ColorTokens, error: boolean) => TextStyle;
  /** The error message's leading alert glyph: its size and its gap to the text (web). */
  errorGlyph?: { size: number; gap: number };
  /** The message's start inset under a delegated filled field (Android's text edge). */
  delegatedInset?: number;
}

/** The hand-off's tx3: the helper and placeholder ink. */
function subtleInk(t: ColorTokens): string {
  return t["subtle-foreground"] ?? t["muted-foreground"];
}

export const webSkin: FieldSkin = {
  stack: { flexDirection: "column", gap: 6 },
  label: (t) => ({ ...typeRoles.label, color: t["muted-foreground"] }),
  message: (t, error) => ({
    fontSize: 12,
    lineHeight: 16.8,
    fontWeight: "400",
    color: error ? destructiveText(t) : subtleInk(t),
  }),
  errorGlyph: { size: 13, gap: 6 },
};

export const iosSkin: FieldSkin = {
  stack: { flexDirection: "column", gap: 8 },
  label: (t) => ({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: -0.15,
    color: t["muted-foreground"],
  }),
  message: (t, error) => ({
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.08,
    color: error ? destructiveText(t) : subtleInk(t),
  }),
};

export const androidSkin: FieldSkin = {
  stack: { flexDirection: "column", gap: 4 },
  label: (t) => ({
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: t.foreground,
  }),
  message: (t, error) => ({
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0.4,
    color: error ? destructiveText(t) : t["muted-foreground"],
  }),
  delegatedInset: 16,
};
