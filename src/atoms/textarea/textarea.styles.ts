import { type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located Textarea skins, one per platform. The field is a multiline
// TextInput, so every fragment is a TextStyle. The BRAND survives on every
// platform (the focus/active cue is always the indigo `ring`/`primary` token,
// the error cue the `destructive` token, never a platform default); only the
// native SHAPE, fill, border/underline, and focus feedback change per OS:
//   iOS (HIG, iOS 27 / Liquid Glass): the PLAIN multiline text view, a fully
//     transparent field with NO fill and NO box, carrying only a subtle bottom
//     hairline rule (the `input` token at rest), so it reads like the iOS 27
//     plain text field rather than a filled gray capsule. The hairline brightens
//     to the brand `primary` on focus and `destructive` on error; the brand
//     cursor/selection is the indigo `primary` (set on the shell, never a system
//     blue).
//   Android (Material 3 filled): a subtle fill with a flat bottom active
//     indicator (underline). Top corners ~4, square bottom. The indicator is a
//     1px resting line that thickens to 2px indigo on focus (destructive on
//     error).
//   Web: the established Canvas look (lifted verbatim) — full-width, 6 radius,
//     1px border, on the background fill; border is error > focus(ring) > input.

export type Size = "small" | "base" | "large";

// State the shell resolves and hands to the skin's field builder.
export interface TextareaFieldState {
  /** Error/validation state (error or invalid prop). */
  error: boolean;
  /** The field currently holds keyboard focus. */
  focused: boolean;
}

// The only thing a platform skin owns: the field surface for a given state.
// `sizeText` and `minHeight` are shared (the brand type scale and the rows math
// are identical across platforms), so the shell composes them around the skin.
export interface TextareaSkin {
  field: (tokens: ColorTokens, state: TextareaFieldState) => TextStyle;
}

// --- shared, platform-neutral fragments -------------------------------------

// Text scale per size; mirrors the height the larger control reads as. Default
// is the base text-sm field (no size prop). Shared across platforms.
export function sizeText(size: Size): TextStyle {
  if (size === "large") return { fontSize: 16, lineHeight: 24 }; // text-base
  if (size === "small") return { fontSize: 12, lineHeight: 16 }; // text-xs
  return { fontSize: 14, lineHeight: 20 }; // text-sm
}

// Derived min height from the row count: each row ~22px plus the vertical
// padding. Falls back to the 80px floor when no rows are given. The field still
// grows with content past this floor. Shared across platforms.
export function minHeight(rows?: number): TextStyle {
  return { minHeight: rows == null ? 80 : rows * 22 + 16 };
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// Full width, bordered, padded, on the background fill, with the foreground
// text color. Border resolves error > focus(ring) > default input.
export const webSkin: TextareaSkin = {
  field: (t, st) => ({
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: st.error ? t.destructive : st.focused ? t.ring : t.input,
    backgroundColor: t.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: t.foreground,
  }),
};

// ---------- iOS (HIG, iOS 27 / Liquid Glass): plain transparent field, bottom hairline ----------
// The iOS 27 plain multiline text view: no fill, no box, a transparent field
// with a single subtle bottom hairline rule. The rule is the `input` token at
// rest (1pt), brightening to the brand `primary` on focus and `destructive` on
// error, mirroring the new plain single-line input. Horizontal padding drops to
// 0 so the text and the rule align to the field's edges like the reference.
export const iosSkin: TextareaSkin = {
  field: (t, st) => ({
    width: "100%",
    backgroundColor: "transparent",
    // The only chrome: a bottom hairline that carries focus/error.
    borderBottomWidth: 1,
    borderBottomColor: st.error ? t.destructive : st.focused ? t.primary : t.input,
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 8,
    color: t.foreground,
  }),
};

// ---------- Android (Material 3 filled): subtle fill + active indicator ------
// A subtle fill (~8% of the muted-foreground hue over the surface) with rounded
// top corners (~4) and a square bottom, carrying a bottom active indicator
// (underline). The indicator is a 1px resting line (the input token) that
// thickens to 2px indigo `primary` on focus, or destructive on error.
export const androidSkin: TextareaSkin = {
  field: (t, st) => ({
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: alpha(t["muted-foreground"], 0.08),
    // The active indicator: only the bottom edge is drawn.
    borderBottomWidth: st.focused || st.error ? 2 : 1,
    // Rest baseline must read clearly (on-surface-variant ~ muted-foreground) so the
    // M3 filled field is distinct from the iOS lineless capsule.
    borderBottomColor: st.error ? t.destructive : st.focused ? t.primary : t["muted-foreground"],
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    color: t.foreground,
  }),
};
