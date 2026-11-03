import { type ReactNode } from "react";
import { View, Text, useTheme, type ColorTokens, type ViewStyle } from "../../../style/index.js";
import { contrastStyle } from "../../../style/glass-surface/glass-surface.shared.js";
import { Icon } from "../../icon/icon.js";
import { AnatomyPart, type AnatomyTarget } from "../../../style/anatomy.js";
import type { CheckboxSkin, Size } from "../checkbox.shared.js";

/** The anatomy handlers a Checkbox takes (above its AnatomyScope) for the nodes drawn below it. */
export interface CheckboxAnatomy {
  box?: AnatomyTarget;
  mark?: AnatomyTarget;
  label?: AnatomyTarget;
  description?: AnatomyTarget;
}

// Shared by the interactive Checkbox and its private decorative counterpart, so
// removing a nested control does not change the indicator's layout or skin.
export const CHECKBOX_ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 12 };

// Keep the glyph out of flow, so the box is always the skin's explicit square.
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
export function CheckboxIndicatorBox({ skin, tokens, size, checked, indeterminate, hovered, anatomy }: {
  skin: CheckboxSkin;
  tokens: ColorTokens;
  size: Size;
  checked?: boolean;
  indeterminate?: boolean;
  hovered?: boolean;
  anatomy?: CheckboxAnatomy;
}) {
  const filled = !!(indeterminate || checked);
  // The box is a small mark inside content, not a surface: it draws the skin's own box and
  // glyph in every mode, glass included, with no pane and no rim (the owner's GS-5
  // decision), and takes the contrasting border under Increase Contrast.
  const theme = useTheme();
  const shape = skin.box(tokens, filled, size);
  const box = hovered && skin.hover ? { ...shape, ...skin.hover(tokens) } : shape;
  const glyph = skin.glyph(tokens, size);
  // The owning control announces checked state; the decorative glyph must never
  // become part of its accessible name when selection changes.
  return (
    <View ref={anatomy?.box?.ref} onLayout={anatomy?.box?.onLayout} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={contrastStyle(theme, box)}>
      {filled ? (
        <View style={GLYPH_LAYER}>
          <AnatomyPart part={anatomy?.mark}>
            {indeterminate ? <Icon minus size={glyph.size} color={glyph.color} /> : <Icon check size={glyph.size} color={glyph.color} />}
          </AnatomyPart>
        </View>
      ) : null}
    </View>
  );
}

/** Shared text and indicator anatomy, with no interaction or semantic role. */
export function CheckboxContent({ skin, tokens, size, checked, indeterminate, children, description, hovered, anatomy }: {
  skin: CheckboxSkin;
  tokens: ColorTokens;
  size: Size;
  checked?: boolean;
  indeterminate?: boolean;
  children?: ReactNode;
  description?: ReactNode;
  hovered?: boolean;
  anatomy?: CheckboxAnatomy;
}) {
  const hasText = children != null || description != null;
  return (
    <>
      <CheckboxIndicatorBox skin={skin} tokens={tokens} size={size} checked={checked}
        indeterminate={indeterminate} hovered={hovered} anatomy={anatomy} />
      {hasText ? (
        <View style={TEXT_COLUMN}>
          {children != null ? <Text ref={anatomy?.label?.ref} onLayout={anatomy?.label?.onLayout} style={skin.label(tokens, size)}>{children}</Text> : null}
          {description != null ? <Text ref={anatomy?.description?.ref} onLayout={anatomy?.description?.onLayout} style={skin.description(tokens, size)}>{description}</Text> : null}
        </View>
      ) : null}
    </>
  );
}

// The hand-off's text column: the title sits 1px below the box's top and the
// description follows it with no gap (the line heights carry the spacing). Shared by
// the interactive Checkbox and the private indicator, so compound controls stay in sync.
const TEXT_COLUMN: ViewStyle = { flexShrink: 1, minWidth: 0, paddingTop: 1 };

export interface CheckboxIndicatorProps {
  checked?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  description?: ReactNode;
}

/** Checkbox visuals for a parent that owns the full row's interaction and name. */
export function createCheckboxIndicator(skin: CheckboxSkin) {
  return function CheckboxIndicator({ checked, disabled, children, description }: CheckboxIndicatorProps) {
    const { tokens } = useTheme();
    return (
      <View style={[CHECKBOX_ROW, disabled ? { opacity: skin.disabledOpacity } : null]}>
        <CheckboxContent skin={skin} tokens={tokens} size="base" checked={checked} description={description}>
          {children}
        </CheckboxContent>
      </View>
    );
  };
}
