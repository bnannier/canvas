import { useState } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./combobox.styles.js";
import { type Size } from "./combobox.styles.js";

// Combobox: a searchable single-select. It mirrors Select's structure (a field
// plus an open option list) and adds text filtering: the field shows the typed
// query, and the list narrows to options matching that query as you type.
//
// Like Select, the open state is rendered inline (the docs render it this way;
// there is no portal/Modal). `open` defaults to true so the floating list is
// visible. The selected option carries a leading "✓" and an accent surface; an
// empty filtered list shows a muted "No results" row.

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
   * Whether the option list is open. Defaults to true so the open state is
   * visible inline (the docs render it this way; there is no portal/Modal).
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

export function Combobox(props: ComboboxProps) {
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

  return (
    <View style={[s.wrapper, style]}>
      {label != null && label !== "" ? (
        <Text style={s.label(tokens, size)}>{label}</Text>
      ) : null}
      <Pressable
        style={[s.field(tokens, size), disabled ? { opacity: 0.5 } : null]}
        disabled={disabled}
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
      >
        <Text style={s.fieldText(tokens, size, fieldMuted)}>{fieldText}</Text>
        <Text style={s.chevron(tokens, size)}>▾</Text>
      </Pressable>

      {open ? (
        <View style={s.popover(tokens)}>
          {matches.length === 0 ? (
            <View style={s.emptyRow}>
              <Text style={s.emptyText(tokens, size)}>No results</Text>
            </View>
          ) : (
            matches.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    s.row,
                    selected || pressed ? s.rowAccent(tokens) : null,
                  ]}
                  onPress={() => {
                    onSelect?.(option);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={s.check(tokens, size)}>{selected ? "✓" : " "}</Text>
                  <Text style={s.optionText(tokens, size)}>{option}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}

      {helperText != null && helperText !== "" ? (
        <Text style={s.helper(tokens)}>{helperText}</Text>
      ) : null}
    </View>
  );
}
