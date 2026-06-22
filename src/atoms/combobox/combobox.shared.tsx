import { useState } from "react";
import { type Role } from "react-native";
import { View, Pressable, Text, useTheme, GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the option-list
// container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { wrapper, wrapperLifted } from "./combobox.styles.js";
import { type ComboboxSkin, type Size } from "./combobox.styles.js";

// Shared Combobox shell. A Combobox is a searchable single-select: it mirrors
// Select's structure (a field plus an open option list) and adds text filtering
// — the field shows the typed query, and the list narrows to options matching
// that query as you type.
//
// The structure (the field, the open/close state machine, the query filtering,
// the highlighted selected/active option, the helper text), the public
// boolean-prop API, the size precedence, accessibility, and handlers all live
// here once. A platform file supplies only its skin (field shape, fill,
// border/underline, popover elevation, row layout, press feedback) and calls
// createCombobox.
//
// Like Select, the open state is rendered inline (the docs render it this way;
// there is no portal/Modal). The list is closed by default in the uncontrolled
// case; pass `open` to render the floating list inline. The selected option
// carries a leading "✓" and an accent surface; an empty filtered list shows a
// muted "No results" row.

export interface ComboboxProps {
  /** The text typed into the field. Filters the option list when set. */
  query?: string;
  /** The full list of selectable option labels. */
  options?: string[];
  /** The currently selected option label, marked with a check in the list. */
  value?: string;
  /** Prompt shown in the field when there is no query or value. */
  placeholder?: string;
  /**
   * Whether the option list is open. Uncontrolled and closed by default; the
   * field tap toggles it. Pass `open` to render the list open inline (the docs
   * render it this way; there is no portal/Modal). A disabled control stays
   * closed regardless.
   */
  open?: boolean;
  /** Fired when the open state changes (field tap, select). */
  onOpenChange?: (open: boolean) => void;
  /** Optional stacked field label rendered above the field. */
  label?: string;
  /** Optional muted helper line rendered below the option list. */
  helperText?: string;
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
function sizeOf(p: ComboboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

/** Build a Combobox component from a platform skin. */
export function createCombobox(skin: ComboboxSkin) {
  return function Combobox(props: ComboboxProps) {
    const {
      query,
      options = [],
      value,
      label,
      helperText,
      placeholder = "Search…",
      open: openProp,
      onOpenChange,
      disabled,
      onSelect,
      style,
    } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();
    // Uncontrolled by default: the field opens/closes the list, a select closes it.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // What the field shows: the typed query, then the selected value, else the
    // placeholder. The first two read as foreground text; the placeholder is muted.
    const hasQuery = query != null && query !== "";
    const hasValue = value != null && value !== "";
    const fieldText = hasQuery ? query : hasValue ? value : placeholder;
    const fieldMuted = !hasQuery && !hasValue;

    // Filter the list by the query (case-insensitive). With no query, show all.
    const q = hasQuery ? (query as string).toLowerCase() : "";
    const matches = hasQuery
      ? options.filter((o) => o.toLowerCase().includes(q))
      : options;

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <View style={[wrapper, open ? wrapperLifted : null, style]}>
        {label != null && label !== "" ? (
          <Text style={skin.label(tokens, size)}>{label}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            skin.field(tokens, size, open),
            skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            disabled ? { opacity: skin.disabledOpacity } : null,
          ]}
          disabled={disabled}
          onPress={() => setOpen(!open)}
          android_ripple={ripple}
          accessibilityRole="button"
          // accessibilityState is the NATIVE disclosure/disabled channel (iOS/Android);
          // RNW drops it on the web, so aria-expanded/aria-disabled alias it there.
          accessibilityState={{ expanded: open, disabled: !!disabled }}
          aria-expanded={open}
          aria-disabled={!!disabled}
          // Tie the visible stacked label to the field so a screen reader announces
          // the field's name (not just the inner value/placeholder) on both channels.
          accessibilityLabel={label != null && label !== "" ? label : undefined}
          aria-label={label != null && label !== "" ? label : undefined}
        >
          <Text style={skin.fieldText(tokens, size, fieldMuted)}>{fieldText}</Text>
          <Text style={skin.chevron(tokens, size)}>▾</Text>
        </Pressable>

        {open && !disabled ? (
          <GlassSurface style={skin.popover(tokens)}>
            {matches.length === 0 ? (
              <View style={skin.emptyRow}>
                <Text style={skin.emptyText(tokens, size)}>No results</Text>
              </View>
            ) : (
              <View role={LISTBOX}>
              {matches.map((option, index) => {
                const selected = option === value;
                const separator = index > 0 && skin.rowSeparator ? skin.rowSeparator(tokens) : null;
                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      skin.row,
                      separator,
                      selected ? skin.rowSelected(tokens) : null,
                      pressed ? skin.rowPressed(tokens) : null,
                    ]}
                    onPress={() => {
                      onSelect?.(option);
                      setOpen(false);
                    }}
                    android_ripple={ripple}
                    role="option"
                    // accessibilityState carries the native selected trait (iOS/Android);
                    // RNW drops it on the web, so aria-selected aliases it there.
                    accessibilityState={{ selected }}
                    aria-selected={selected}
                  >
                    <Text style={skin.check(tokens, size)}>{selected ? "✓" : " "}</Text>
                    <Text style={skin.optionText(tokens, size)}>{option}</Text>
                  </Pressable>
                );
              })}
              </View>
            )}
          </GlassSurface>
        ) : null}

        {helperText != null && helperText !== "" ? (
          <Text style={skin.helper(tokens)}>{helperText}</Text>
        ) : null}
      </View>
    );
  };
}
