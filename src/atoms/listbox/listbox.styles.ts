import { type ViewStyle, type TextStyle } from "react-native";
import { surfaceRipple, type ColorTokens } from "../../style/index.js";
import { type ListboxSkin, type Size } from "./listbox.shared.js";

// Co-located Listbox skins, one per platform. Layout-only fragments are static
// objects; anything that reads a color is a function of the active tokens (so the
// bordered surface, the selected/press fill, and the label/detail colors follow
// light/dark and the glass surface via tokens.popover/accent).
//
// Listbox is a "Shared" platform treatment: iOS has no native listbox control
// (selecting one option from a list is a pop-up button / picker menu there) and
// Material 3 has no listbox either (the exposed dropdown menu is the select
// idiom), so the single web look (Catalyst's listbox) is correct everywhere. The
// iosSkin and androidSkin are therefore the SAME object as webSkin. The Android
// ripple is wired here (`android_ripple` is a harmless no-op on iOS/web, so it can
// stay set on the shared skin without changing the iOS/web appearance), and no
// opacity dim is applied (the accent press fill carries the press feedback,
// exactly as the previous single-file look did).

// A bordered container reads as a content card: rounded card, hairline border, solid
// `card` fill, and a 4px inset so rows don't touch the edge. Listbox is an inline,
// in-page list (the CONTENT layer, not a floating overlay), so it uses the solid `card`
// token, NOT `popover` — `card` stays opaque under glass (Apple: don't put Liquid Glass
// in the content layer). In solid mode `card` and `popover` are identical, so this is a
// no-op there and only fixes the translucent-with-no-material bug under glass.
function containerBordered(tokens: ColorTokens): ViewStyle {
  return { borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 4 };
}

// Each row: a horizontal Pressable with a leading control, the label/detail
// stack, and (added by the shell) a subtle press-state fill. Size adds the
// vertical padding.
// overflow:hidden clips the Material ripple to the rounded outline (borderRadius)
// so the bounded ripple does not bleed past the rounded corners on Android.
const rowBase: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, overflow: "hidden" };

// Per-row padding by size: small reads like the legacy h-8 trigger, medium like
// h-9, large like h-10.
const rowSize: Record<Size, ViewStyle> = {
  small: { paddingHorizontal: 8, paddingVertical: 6 },
  medium: { paddingHorizontal: 8, paddingVertical: 8 },
  large: { paddingHorizontal: 8, paddingVertical: 10 },
};

// The accent fill used for a selected single-select row and the press state.
function rowSelected(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// Single-select checkmark column: a fixed-width gutter reserved on every row so
// labels stay aligned whether or not the row is selected.
function checkmark(tokens: ColorTokens): TextStyle {
  return { width: 16, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The label/detail stack grows to fill the remaining row width.
const textStack: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Label type per size (small is smaller; medium and large share the body size).
const LABEL_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  medium: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 14, lineHeight: 20 },
};

function label(tokens: ColorTokens, size: Size): TextStyle {
  return { color: tokens.foreground, ...LABEL_TYPE[size] };
}

function detail(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// The single shared skin. Web is the established Canvas look; iOS and Android
// reuse the same object (Shared treatment), so all three platforms render
// identically. The ripple stays set (a no-op off Android) and pressedOpacity is
// null (the accent press fill is the feedback), matching the prior look exactly.
export const webSkin: ListboxSkin = {
  containerBordered,
  rowBase,
  rowSize,
  rowSelected,
  checkmark,
  textStack,
  label,
  detail,
  ripple: (tokens) => surfaceRipple(tokens),
  pressedOpacity: null,
};

export const iosSkin: ListboxSkin = webSkin;
export const androidSkin: ListboxSkin = webSkin;
