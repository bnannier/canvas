import { useState } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import * as s from "./select.styles.js";
import { type Size } from "./select.styles.js";

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

// First match wins when more than one size flag is passed.
function sizeOf(p: SelectProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

export function Select(props: SelectProps) {
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

  return (
    <View style={[s.root, style]}>
      {label != null && label !== "" ? (
        <Text style={s.labelText(tokens, size)}>{label}</Text>
      ) : null}
      <Pressable
        style={[s.trigger(tokens, size), disabled ? { opacity: 0.5 } : null]}
        disabled={disabled}
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
      >
        <View style={s.triggerValue}>
          {icon ? <Icon globe muted size={14} /> : null}
          <Text style={s.valueText(tokens, size, hasValue)}>{hasValue ? value : placeholder}</Text>
        </View>
        <Text style={s.chevron(tokens, size)}>▾</Text>
      </Pressable>

      {open ? (
        <View style={s.panel(tokens)}>
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  s.optionRow(tokens, selected),
                  pressed ? s.optionPressed(tokens) : null,
                ]}
                onPress={() => { onSelect?.(option); setOpen(false); }}
                accessibilityRole="button"
              >
                <Text style={[s.optionText(tokens, size), { width: 14 }]}>
                  {selected ? "✓" : " "}
                </Text>
                <Text style={s.optionText(tokens, size)}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
