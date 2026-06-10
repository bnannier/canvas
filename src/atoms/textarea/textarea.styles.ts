import { type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Textarea styles. The field is a multiline TextInput, so every
// fragment is a TextStyle. Layout-only parts are static objects; the surface
// (which reads the background, foreground, and the resolved border color) is a
// function of the active tokens, so it follows light/dark and the glass surface.

type SizeProps = { small?: boolean; large?: boolean };

// Text scale per size; mirrors the height the larger control reads as. Default
// is the base text-sm field (no size prop).
export function sizeText(p: SizeProps): TextStyle {
  if (p.large) return { fontSize: 16, lineHeight: 24 }; // text-base
  if (p.small) return { fontSize: 12, lineHeight: 16 }; // text-xs
  return { fontSize: 14, lineHeight: 20 }; // text-sm
}

// Derived min height from the row count: each row ~22px plus the vertical
// padding. Falls back to the 80px floor when no rows are given. The field still
// grows with content past this floor.
export function minHeight(rows?: number): TextStyle {
  return { minHeight: rows == null ? 80 : rows * 22 + 16 };
}

// The field surface: full width, bordered, padded, on the background fill, with
// the foreground text color. The border color is resolved by the component
// (error > focus > default) and passed in.
export function field(tokens: ColorTokens, borderColor: string): TextStyle {
  return {
    width: "100%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor,
    backgroundColor: tokens.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: tokens.foreground,
  };
}
