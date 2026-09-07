import { View, Text, useTheme, type ColorTokens, type ViewStyle } from "../../../style/index.js";
import type { CheckboxSkin, Size } from "../checkbox.shared.js";

// Shared by the interactive Checkbox and its private decorative counterpart, so
// removing a nested control does not change the indicator's layout or skin.
export const CHECKBOX_ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 8 };

// Keep the glyph out of flow. Native Android otherwise measures the square from
// the Text's width instead of honoring the skin's explicit box width.
const GLYPH_LAYER: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

/** Private visual anatomy, with no press handler, role, or focusable host. */
export function CheckboxIndicatorBox({ skin, tokens, size, checked, indeterminate, nudge }: {
  skin: CheckboxSkin;
  tokens: ColorTokens;
  size: Size;
  checked?: boolean;
  indeterminate?: boolean;
  nudge: boolean;
}) {
  const filled = !!(indeterminate || checked);
  return (
    <View style={skin.box(tokens, filled, size, nudge)}>
      {filled ? (
        <View style={GLYPH_LAYER}>
          <Text style={skin.glyph(tokens, size)}>{indeterminate ? "–" : "✓"}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** A label-less Checkbox's appearance for a parent that owns its interaction. */
export function createCheckboxIndicator(skin: CheckboxSkin) {
  return function CheckboxIndicator({ checked, disabled }: { checked?: boolean; disabled?: boolean }) {
    const { tokens } = useTheme();
    return (
      <View style={[CHECKBOX_ROW, disabled ? { opacity: skin.disabledOpacity } : null]}>
        <CheckboxIndicatorBox skin={skin} tokens={tokens} size="base" checked={checked} nudge={false} />
      </View>
    );
  };
}
