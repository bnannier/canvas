import { forwardRef, useState } from "react";
import { type Role, type TextInput as RNTextInput } from "react-native";
import {
  View,
  Pressable,
  Text,
  TextInput,
  useTheme,
  useControllableState,
  useEscapeKey,
  GlassSurface,
  FOCUS_RESET,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the option-list
// container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { wrapper, wrapperLifted } from "./combobox.styles.js";
import { type ComboboxSkin, type Size } from "./combobox.styles.js";

// Shared Combobox shell. A Combobox is a searchable single-select: it mirrors
// Select's structure (a field plus an open option list) and adds text
// filtering. The field is a REAL text input: typing edits the query
// (controlled via `query`, self-managed via `defaultQuery`, the standard
// library contract) and the list narrows to options matching that query as
// you type; the trailing chevron toggles the list.
//
// The structure (the editable field, the open/close state machine, the query
// filtering, the highlighted selected/active option, the helper text), the
// public boolean-prop API, the size precedence, accessibility, refs, and
// handlers all live here once. A platform file supplies only its skin (field
// shape, fill, border/underline, popover elevation, row layout, press
// feedback) and calls createCombobox.
//
// Like Select, the open state is rendered inline (the docs render it this way;
// there is no portal/Modal). The list is closed by default in the uncontrolled
// case; focusing or typing opens it, the chevron toggles it, and a select
// closes it. The selected option carries a leading "✓" and an accent surface;
// an empty filtered list shows a muted "No results" row.

export interface ComboboxProps {
  /**
   * The text typed into the field (controlled). Filters the option list. Omit
   * and use `defaultQuery` for uncontrolled use: a bare Combobox is typeable
   * out of the box.
   */
  query?: string;
  /** Initial query for uncontrolled use. */
  defaultQuery?: string;
  /**
   * Fired with the new query on each keystroke, and with "" when a select
   * resets the filter (both modes).
   */
  onQueryChange?: (query: string) => void;
  /** The full list of selectable option labels. */
  options?: string[];
  /** The currently selected option label, marked with a check in the list. */
  value?: string;
  /** Prompt shown in the field when there is no query or value. */
  placeholder?: string;
  /**
   * Whether the option list is open. Uncontrolled and closed by default;
   * focusing or typing in the field opens it, the chevron toggles it. Pass
   * `open` to render the list open inline (the docs render it this way; there
   * is no portal/Modal). A disabled control stays closed regardless.
   */
  open?: boolean;
  /** Fired when the open state changes (focus, typing, chevron, select). */
  onOpenChange?: (open: boolean) => void;
  /** Optional stacked field label rendered above the field. */
  label?: string;
  /** Optional muted helper line rendered below the option list. */
  helperText?: string;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Called with the chosen option label when a row is pressed. */
  onSelect?: (option: string) => void;
  /** E2E hook forwarded to the text field. */
  testID?: string;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// First match wins when more than one size flag is passed.
function sizeOf(p: ComboboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// The editable slice of the field row: fill the space before the chevron and
// drop the platform's default inner padding, so the skin's field box (height,
// gutter) governs the footprint exactly as it did around the old static text.
const fieldInput: TextStyle = { flex: 1, paddingVertical: 0, paddingHorizontal: 0 };

// Full-height touch target for the chevron toggle. It centers the glyph
// without moving it from where the static chevron sat in the field row.
const chevronHit: ViewStyle = { alignSelf: "stretch", justifyContent: "center" };

/** Build a Combobox component from a platform skin. */
export function createCombobox(skin: ComboboxSkin) {
  const Combobox = forwardRef<RNTextInput, ComboboxProps>(function Combobox(props, ref) {
    const {
      options = [],
      value,
      label,
      helperText,
      placeholder = "Search…",
      open: openProp,
      onOpenChange,
      disabled,
      onSelect,
      onQueryChange,
      style,
    } = props;
    const size = sizeOf(props);
    const { tokens } = useTheme();

    // Controlled when `query` is provided, self-managed otherwise, so a bare
    // <Combobox /> filters as you type (the standard library contract).
    const [query, setQuery] = useControllableState<string>(
      props.query,
      props.defaultQuery ?? "",
      onQueryChange,
    );

    // Uncontrolled by default: focus/typing opens the list, the chevron
    // toggles it, a select closes it.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Escape closes the open option list on web (no-op natively). A disabled
    // control renders no list, so it never subscribes.
    useEscapeKey(open && !disabled, () => setOpen(false));

    // What the field shows: the typed query, then the selected value, else the
    // placeholder (rendered natively by the input, in the skin's muted color).
    const hasQuery = query !== "";
    const hasValue = value != null && value !== "";
    const fieldValue = hasQuery ? query : hasValue ? (value as string) : "";

    // Filter the list by the query (case-insensitive). With no query, show all.
    const q = query.toLowerCase();
    const matches = hasQuery
      ? options.filter((o) => o.toLowerCase().includes(q))
      : options;

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <View style={[wrapper, open ? wrapperLifted : null, style]}>
        {label != null && label !== "" ? (
          <Text style={skin.label(tokens, size)}>{label}</Text>
        ) : null}
        <View
          style={[
            skin.field(tokens, size, open),
            disabled ? { opacity: skin.disabledOpacity } : null,
          ]}
        >
          <TextInput
            ref={ref}
            // The field paints its own focus state (the skin's open border), so
            // the RNW default outline is suppressed; no-op on native.
            style={[skin.fieldText(tokens, size, false), fieldInput, FOCUS_RESET]}
            value={fieldValue}
            onChangeText={(text) => {
              setQuery(text);
              if (!open) setOpen(true); // typing re-opens a closed list
            }}
            onFocus={() => {
              if (!open) setOpen(true);
            }}
            placeholder={placeholder}
            placeholderTextColor={skin.fieldText(tokens, size, true).color}
            editable={!disabled}
            selectionColor={tokens.primary} // brand cursor / selection on every platform
            testID={props.testID}
            role="combobox"
            // accessibilityState is the NATIVE disclosure/disabled channel (iOS/Android);
            // RNW drops it on the web, so aria-expanded/aria-disabled alias it there.
            accessibilityState={{ expanded: open, disabled: !!disabled }}
            aria-expanded={open}
            aria-disabled={!!disabled}
            // Tie the visible stacked label to the field so a screen reader announces
            // the field's name (not just the inner value/placeholder) on both channels.
            accessibilityLabel={label != null && label !== "" ? label : undefined}
            aria-label={label != null && label !== "" ? label : undefined}
          />
          <Pressable
            style={({ pressed }) => [
              chevronHit,
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
            onPress={() => setOpen(!open)}
            disabled={disabled}
            android_ripple={ripple}
            accessibilityRole="button"
            accessibilityLabel="Toggle options"
            aria-label="Toggle options"
            accessibilityState={{ expanded: open, disabled: !!disabled }}
            aria-expanded={open}
            aria-disabled={!!disabled}
          >
            <Text style={skin.chevron(tokens, size)}>▾</Text>
          </Pressable>
        </View>

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
                      // Reset the filter so the field falls back to showing the
                      // selected value and the next open lists every option.
                      setQuery("");
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
  });
  Combobox.displayName = "Combobox";
  return Combobox;
}
