import { type Role } from "react-native";
import { View, Pressable, Text, useTheme, useControllableState, GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the option-list
// container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { Icon } from "../icon/icon.js";
import { root, rootLifted, type SelectSkin, type Size } from "./select.styles.js";

// Shared Select shell. The structure (the stacked label + the trigger row with
// its optional leading icon, value/placeholder and trailing chevron, plus the
// inline open option list with its selectable rows), the public boolean-prop
// API, the size precedence, the controlled/uncontrolled value and open state,
// the select/close handlers, the disabled handling, and accessibility all live
// here once. A platform file supplies only its skin (trigger shape/fill/border,
// the chevron glyph, the menu surface, the row tint, where the selection
// indicator renders, and the press feedback) and calls createSelect.

export interface SelectProps {
  /** Controlled selected option label; omit for uncontrolled use. Empty shows the placeholder. */
  value?: string;
  /** Initial selection for uncontrolled use (a bare <Select options /> picks on its own). */
  defaultValue?: string;
  /** The list of selectable option labels. */
  options?: string[];
  /** Optional stacked field label rendered above the trigger. */
  label?: string;
  /** Renders a leading globe glyph inside the trigger, indented so the value clears it. */
  icon?: boolean;
  /** Prompt shown in the trigger when no value is selected. */
  placeholder?: string;
  /** Controlled open state of the option list; omit for uncontrolled use. */
  open?: boolean;
  /** Initial open state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fired when the open state changes (trigger press, select), in both modes. */
  onOpenChange?: (open: boolean) => void;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Called with the chosen option label when a row is pressed (both modes). */
  onSelect?: (option: string) => void;
  /** E2E hook forwarded to the trigger pressable. */
  testID?: string;
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
      options = [],
      label,
      icon,
      placeholder = "Select an option",
      onOpenChange,
      disabled,
      onSelect,
      style,
    } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Controlled when `open`/`value` are provided, self-managed otherwise, so a
    // bare <Select options /> opens and picks out of the box (the standard
    // library contract): the trigger opens/closes the list, a select stores the
    // choice and closes it, and the callbacks fire in both modes.
    const [open, setOpen] = useControllableState<boolean>(
      props.open,
      props.defaultOpen ?? false,
      onOpenChange,
    );
    const [value, setValue] = useControllableState<string>(
      props.value,
      props.defaultValue ?? "",
      onSelect,
    );

    const hasValue = value !== "";
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
          testID={props.testID}
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
            <View role={LISTBOX}>
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
                  onPress={() => { setValue(option); setOpen(false); }}
                  android_ripple={ripple}
                  role="option"
                  aria-selected={selected}
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
            </View>
          </GlassSurface>
        ) : null}
      </View>
    );
  };
}
