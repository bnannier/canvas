import { useState } from "react";
import { View, Pressable, Text, useTheme, GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import { root, rootLifted, type SelectSkin, type Size } from "./select.styles.js";

// Shared Select shell. The structure (the stacked label + the trigger row with
// its optional leading icon, value/placeholder and trailing chevron, plus the
// inline open option list with its selectable rows), the public boolean-prop
// API, the size precedence, the controlled/uncontrolled open state, the
// select/close handlers, the disabled handling, and accessibility all live here
// once. A platform file supplies only its skin (trigger shape/fill/border, the
// chevron glyph, the menu surface, the row tint, where the selection indicator
// renders, and the press feedback) and calls createSelect.

export interface SelectProps {
  /** The currently selected option label. Empty shows the placeholder. */
  value?: string;
  /** The list of selectable option labels. */
  options?: string[];
  /** Optional stacked field label rendered above the trigger. */
  label?: string;
  /** Renders a leading globe glyph inside the trigger, indented so the value clears it. */
  icon?: boolean;
  /** Prompt shown in the trigger when no value is selected. */
  placeholder?: string;
  /**
   * Whether the option list is open. Defaults to true so the open state is
   * visible inline (the docs render it this way; there is no portal/Modal).
   */
  open?: boolean;
  /** Fired when the open state changes (trigger press, select). */
  onOpenChange?: (open: boolean) => void;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Called with the chosen option label when a row is pressed. */
  onSelect?: (option: string) => void;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: SelectProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

/** Build a Select component from a platform skin. */
export function createSelect(skin: SelectSkin) {
  return function Select(props: SelectProps) {
    const {
      value,
      options = [],
      label,
      icon,
      placeholder = "Select an option",
      open: openProp,
      onOpenChange,
      disabled,
      onSelect,
      style,
    } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Uncontrolled by default: the trigger opens/closes the list, a select closes
    // it; a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const hasValue = value != null && value !== "";
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <View style={[root, open ? rootLifted : null, style]}>
        {label != null && label !== "" ? (
          <Text style={skin.label(tokens, size)}>{label}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            skin.trigger(tokens, size, open),
            disabled ? { opacity: skin.disabledOpacity } : null,
            skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          ]}
          disabled={disabled}
          onPress={() => setOpen(!open)}
          android_ripple={ripple}
          accessibilityRole="button"
          aria-expanded={open}
        >
          <View style={skin.triggerValue}>
            {icon ? <Icon globe muted size={14} /> : null}
            <Text style={skin.valueText(tokens, size, hasValue)}>{hasValue ? value : placeholder}</Text>
          </View>
          <Text style={skin.chevron(tokens, size, open)}>{skin.chevronGlyph}</Text>
        </Pressable>

        {open ? (
          <GlassSurface style={skin.panel(tokens)}>
            {options.map((option, i) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    skin.optionRow(tokens, selected),
                    // iOS draws a hairline group separator between rows (not above the
                    // first); a skin that omits rowSeparator keeps every row borderless.
                    i > 0 && skin.rowSeparator ? skin.rowSeparator(tokens) : null,
                    // Web/iOS tint the row on press here; Android uses the ripple instead.
                    skin.ripple == null && pressed ? skin.optionPressed(tokens) : null,
                  ]}
                  onPress={() => { onSelect?.(option); setOpen(false); }}
                  android_ripple={ripple}
                  accessibilityRole="button"
                >
                  {skin.selectedSide === "leading" ? (
                    <Text style={[skin.indicator(tokens, size), { width: 14 }]}>
                      {selected ? "✓" : " "}
                    </Text>
                  ) : null}
                  <Text style={[skin.optionText(tokens, size), { flexShrink: 1 }]}>
                    {option}
                  </Text>
                  {skin.selectedSide === "trailing" ? (
                    <Text style={skin.indicator(tokens, size)}>
                      {selected ? "✓" : ""}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </GlassSurface>
        ) : null}
      </View>
    );
  };
}
