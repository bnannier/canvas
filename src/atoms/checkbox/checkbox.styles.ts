import { type ViewStyle, type TextStyle } from "react-native";
import { shape, type ColorTokens } from "../../style/index.js";
import { type CheckboxSkin, type Size } from "./checkbox.shared.js";

// Co-located Checkbox skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (tools/v4/handoff/cv-kit-controls.js, its `cbx` renderer and the K.PF rows). The
// filled box is always the accent (`primary`) with a check or dash glyph in the accent's
// own ink (`primary-foreground`); an empty box is the `input` boundary (solved to 3:1,
// where the hand-off's hairline is about 1.5:1) over nothing. Each corner is the
// platform's `shape.checkbox`:
//   Web: a 16/18/22px box per size at the web checkbox corner with a 1.5px edge; a hovering
//     pointer rings the box in the accent's soft wash (6px).
//   iOS (HIG): no native checkbox, so a one-setting Checkbox is the iOS switch (the
//     entry passes it as the Standalone part) and the box drawn here is only ever a
//     SELECTION: the edit-mode selection circle, 22pt at every size with a 1.5pt edge;
//     press = opacity dim (~0.8).
//   Android (Material 3): a 16/18/22dp box at the Material 3 checkbox corner with a 2dp edge; press =
//     android_ripple over a 40dp state layer.
// The glyph is the kit's check (or minus) Icon at the box less 6, from the web's box
// steps on every platform, as the hand-off sizes it. Every skin dims the row to 0.4 when
// disabled.

// Box dimensions per size.
const BOX: Record<Size, number> = { small: 16, base: 18, large: 22 };
const IOS_BOX = 22;

// Label type, the same at every size (only the box scales): the hand-off's 500 14px
// title at its 1.3 line, and the 12px description in the subtle ink at its 1.45 line,
// both rounded up to a whole pixel. `flexShrink` lets a long label wrap within the row.
const LABEL_TYPE: TextStyle = { fontSize: 14, lineHeight: 19, fontWeight: "500" };
const DESCRIPTION_TYPE: TextStyle = { fontSize: 12, lineHeight: 18, fontWeight: "400" };
function label(tokens: ColorTokens): TextStyle {
  return { ...LABEL_TYPE, flexShrink: 1, color: tokens.foreground };
}
// The whole row already dims when disabled, so the description keeps its ink in either state.
function description(tokens: ColorTokens): TextStyle {
  return { ...DESCRIPTION_TYPE, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

function glyph(tokens: ColorTokens, size: Size) {
  return { color: tokens["primary-foreground"], size: BOX[size] - 6 };
}

// Box base: a square, centered. Per-platform corner and edge are layered on by each skin.
function boxBase(box: number): ViewStyle {
  return { flexShrink: 0, alignItems: "center", justifyContent: "center", width: box, height: box };
}
function fill(t: ColorTokens, filled: boolean): ViewStyle {
  return filled
    ? { borderColor: t.primary, backgroundColor: t.primary }
    : { borderColor: t.input, backgroundColor: "transparent" };
}

const DISABLED_OPACITY = 0.4;

// ---------- Web: an 18px box at the base size with the 5px corner ----------
export const webSkin: CheckboxSkin = {
  box: (t, filled, size) => ({
    ...boxBase(BOX[size]),
    borderRadius: shape.web.checkbox,
    borderWidth: 1.5,
    ...fill(t, filled),
  }),
  hover: (t) => ({ boxShadow: `0px 0px 0px 6px ${t["primary-soft"] ?? t.accent}` }),
  glyph,
  label,
  description,
  disabledOpacity: DISABLED_OPACITY,
  pressedOpacity: 0.9,
  ripple: null,
};

// ---------- iOS (HIG): the edit-mode selection circle, dim on press ----------
export const iosSkin: CheckboxSkin = {
  box: (t, filled) => ({
    ...boxBase(IOS_BOX),
    // A full round on the square box: the selection circle at every size.
    borderRadius: shape.ios.checkbox,
    borderWidth: 1.5,
    ...fill(t, filled),
  }),
  glyph,
  label,
  description,
  disabledOpacity: DISABLED_OPACITY,
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3): the 2dp corner and edge, ripple ----------
export const androidSkin: CheckboxSkin = {
  box: (t, filled, size) => ({
    ...boxBase(BOX[size]),
    borderRadius: shape.android.checkbox,
    borderWidth: 2,
    ...fill(t, filled),
  }),
  glyph,
  label,
  description,
  disabledOpacity: DISABLED_OPACITY,
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: t.primary, borderless: true, radius: 20 }), // 40dp state layer
};
