import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Icon styles. A single glyph is a bare SVG with no surrounding box,
// so it has no fragments here; these cover the `set` gallery only. Layout-only
// parts are static objects; the label color reads the active tokens (so it
// follows light/dark).

// The gallery grid: full width, glyphs flowing left-to-right and wrapping.
// (w-full flex-row flex-wrap)
export const setGrid: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  flexWrap: "wrap",
};

// One gallery cell: a fixed-width column centering the glyph over its label.
// (items-center gap-1.5 rounded-lg px-1 py-2.5; the 80px width stays inline.)
export const setCell: ViewStyle = {
  alignItems: "center",
  gap: 6,
  borderRadius: 8,
  paddingHorizontal: 4,
  paddingVertical: 10,
};

// The cell label color. (text-muted-foreground; the 10px size stays inline.)
export function setLabel(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}
