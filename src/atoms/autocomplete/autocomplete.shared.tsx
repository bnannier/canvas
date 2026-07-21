import { forwardRef, useId, useRef, useState } from "react";
import { type Role, type TextInput as RNTextInput } from "react-native";
import {
  View,
  Pressable,
  Text,
  TextInput,
  useTheme,
  useControllableState,
  useEscapeKey,
  useFieldWidth,
  AnchoredOverlay,
  FloatingLabel,
  LabelContent,
  FOCUS_RESET,
  RippleClip,
  cornerRadii,
  type FieldWidthProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the option-list
// container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { wrapper, wrapperLifted } from "./autocomplete.styles.js";
import { type AutocompleteSkin, type Size } from "./autocomplete.styles.js";

// Shared Autocomplete shell. An Autocomplete is a searchable single-select: it mirrors
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
// feedback) and calls createAutocomplete.
//
// The open list renders through AnchoredOverlay: when an OverlayProvider is
// mounted (an app root, or a docs example stage) it portals over the page,
// anchored below the field, so it escapes any overflow-clipping ancestor (e.g.
// the docs' horizontal preview scroller); with no provider it falls back to an
// inline absolute anchor below the field. The list is closed by default in the
// uncontrolled case; focusing or typing opens it, the chevron toggles it, and a
// select closes it. The selected option carries a leading "✓" and an accent
// surface; an empty filtered list shows a muted "No results" row.

export interface AutocompleteProps extends FieldWidthProps {
  /**
   * The text typed into the field (controlled). Filters the option list. Omit
   * and use `defaultQuery` for uncontrolled use: a bare Autocomplete is typeable
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
  /** The currently selected option label (CONTROLLED), marked with a check in the list. Omit for uncontrolled use. */
  value?: string;
  /** Initial selected option for uncontrolled use (selecting a row updates it). */
  defaultValue?: string;
  /** Prompt shown in the field when there is no query or value. */
  placeholder?: string;
  /**
   * Whether the option list is open (CONTROLLED). Uncontrolled and closed by
   * default; focusing or typing in the field opens it, the chevron toggles it.
   * Pass `open` to pin it open, or `defaultOpen` to render it open initially
   * while staying interactive. A disabled control stays closed regardless.
   */
  open?: boolean;
  /** Render the list open initially for uncontrolled use (selecting or the chevron closes it). */
  defaultOpen?: boolean;
  /** Fired when the open state changes (focus, typing, chevron, select). */
  onOpenChange?: (open: boolean) => void;
  /**
   * The field's persistent label. Its placement is platform-adaptive: iOS and web
   * render it ABOVE the field; Android renders the Material 3 in-container FLOATING
   * label (centered like a placeholder at rest, floating to the top once the list
   * opens or a value fills the field). The label names the field for assistive tech.
   */
  label?: string;
  /**
   * Marks the field as required: appends a destructive "*" to the label (hidden
   * from the accessible name) and sets aria-required on the field. Takes effect
   * only alongside `label`.
   */
  required?: boolean;
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
  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
  style?: StyleProp<ViewStyle>;
}

// First match wins when more than one size flag is passed.
function sizeOf(p: AutocompleteProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// The editable slice of the field row: fill the space before the chevron and
// drop the platform's default inner padding, so the skin's field box (height,
// gutter) governs the footprint exactly as it did around the old static text.
const fieldInput: TextStyle = { flex: 1, paddingVertical: 0, paddingHorizontal: 0 };

// Read a numeric style value (the Android field height), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

// Full-height touch target for the chevron toggle. It centers the glyph
// without moving it from where the static chevron sat in the field row.
const chevronHit: ViewStyle = { alignSelf: "stretch", justifyContent: "center" };

// The inline-fallback anchor: with no OverlayProvider mounted the option list
// renders in place, absolutely positioned below the field (the kit's pre-portal
// behavior). With a provider, AnchoredOverlay portals the card over the page and
// adds the outside-tap dismiss backdrop instead. `start:0,end:0` pins it to the
// field's width; the skin owns the card's shape/fill/shadow.
const POPOVER_ANCHOR: ViewStyle = { position: "absolute", top: "100%", start: 0, end: 0, zIndex: 50, marginTop: 4 };

/** Build an Autocomplete component from a platform skin. */
export function createAutocomplete(skin: AutocompleteSkin) {
  const Autocomplete = forwardRef<RNTextInput, AutocompleteProps>(function Autocomplete(props, ref) {
    const {
      options = [],
      label,
      required,
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
    const widthCap = useFieldWidth(props);
    // One collision-free id for the label so the floated label carries a nativeID.
    const labelId = useId();

    // Controlled when `query` is provided, self-managed otherwise, so a bare
    // <Autocomplete /> filters as you type (the standard library contract).
    const [query, setQuery] = useControllableState<string>(
      props.query,
      props.defaultQuery ?? "",
      onQueryChange,
    );

    // Controlled when `value` is provided, self-managed otherwise, so selecting
    // a row actually updates the shown selection instead of firing onSelect into
    // the void.
    const [value, setValue] = useControllableState<string | undefined>(
      props.value,
      props.defaultValue,
    );

    // Uncontrolled by default: focus/typing opens the list, the chevron
    // toggles it, a select closes it. `defaultOpen` seeds it open initially.
    const [internalOpen, setInternalOpen] = useState(props.defaultOpen ?? false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Anchor the floating option list to the FIELD (not the whole wrapper, which
    // also spans the label and helper text). Measured via onLayout so the list
    // takes at least the field's width when portaled over the page.
    const fieldRef = useRef<View>(null);
    const [triggerWidth, setTriggerWidth] = useState(0);

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

    // Label placement: iOS/web render it ABOVE the field; the Android skin FLOATS
    // it inside the container (M3). The float signal is the list being open (the
    // combobox's focus equivalent) OR the field holding a query/value; the native
    // placeholder is gated so the resting label is the sole placeholder there.
    const hasLabel = label != null && label !== "";
    const floating = hasLabel && skin.floatingLabel;
    const above = hasLabel && !floating;
    const populated = fieldValue !== "";
    const fieldHeight = asNum((skin.field(tokens, size, open) as { height?: unknown }).height, 56);

    return (
      <View style={[wrapper, open ? wrapperLifted : null, widthCap, style]}>
        {above ? (
          <Text nativeID={labelId} style={skin.label(tokens, size)}>
            <LabelContent label={label!} required={required} starColor={tokens.destructive} />
          </Text>
        ) : null}
        <View
          ref={fieldRef}
          onLayout={(e) => { const l = e.nativeEvent.layout; if (l) setTriggerWidth(l.width); }}
          style={[
            skin.field(tokens, size, open),
            disabled ? { opacity: skin.disabledOpacity } : null,
          ]}
        >
          <TextInput
            ref={ref}
            // The field paints its own focus state (the skin's open border), so
            // the RNW default outline is suppressed; no-op on native.
            textAlignVertical="center"
            style={[
              skin.fieldText(tokens, size, false),
              fieldInput,
              // Android floating label: the reserve (top padding that lets the value
              // clear the floated label, mirroring the M3 Input) belongs to the VALUE
              // field only, not the whole row. Stretched to full height, the field
              // centers its text below the reserve, while the trailing chevron toggle
              // stays vertically centered in the full field (M3 centers a trailing
              // dropdown icon in the container, unaffected by the label).
              floating ? [{ alignSelf: "stretch" as const }, skin.labelReserve!(size)] : null,
              FOCUS_RESET,
            ]}
            value={fieldValue}
            onChangeText={(text) => {
              setQuery(text);
              // Erasing the field to empty clears the committed selection, so the
              // value cannot snap back into the field through the display fallback
              // above. An uncontrolled value clears; a controlled `value` stays the
              // parent's to own.
              if (text === "" && hasValue) setValue(undefined);
              if (!open) setOpen(true); // typing re-opens a closed list
            }}
            onFocus={() => {
              if (!open) setOpen(true);
            }}
            // Floating label owns the resting placeholder: hide the native
            // placeholder until the list opens (matching the M3 Input).
            placeholder={floating && !open ? undefined : placeholder}
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
            // Required is surfaced programmatically (aria-required), omitted when optional.
            aria-required={required || undefined}
            // Tie the visible label to the field so a screen reader announces the
            // field's name (not just the inner value/placeholder) on both channels.
            accessibilityLabel={hasLabel ? label : undefined}
            aria-label={hasLabel ? label : undefined}
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
          {floating ? (
            <FloatingLabel
              styles={skin}
              size={size}
              tokens={tokens}
              label={label!}
              required={required}
              labelId={labelId}
              focused={open}
              populated={populated}
              isError={false}
              height={fieldHeight}
            />
          ) : null}
        </View>

        <AnchoredOverlay
          open={open && !disabled}
          onDismiss={() => setOpen(false)}
          triggerRef={fieldRef}
          gap={4}
          cardStyle={[skin.popover(tokens), { minWidth: triggerWidth }]}
          inlineStyle={POPOVER_ANCHOR}
          // A controlled `open` with no onOpenChange can never actually close, so
          // the hosted dismiss backdrop is skipped (it would only block the page).
          dismissable={openProp === undefined || onOpenChange !== undefined}
        >
            {matches.length === 0 ? (
              <View style={skin.emptyRow}>
                <Text style={skin.emptyText(tokens, size)}>No results</Text>
              </View>
            ) : (
              // The option rows have borderRadius:0 and sit inside the rounded `popover`
              // card, which has NO overflow clip; this RippleClip parent clips their bounded
              // Android ripples to the popover's corners. See src/style/ripple-clip.
              <RippleClip shape={cornerRadii(skin.popover(tokens))}>
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
                      setValue(option);
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
              </RippleClip>
            )}
        </AnchoredOverlay>

        {helperText != null && helperText !== "" ? (
          <Text style={skin.helper(tokens)}>{helperText}</Text>
        ) : null}
      </View>
    );
  });
  Autocomplete.displayName = "Autocomplete";
  return Autocomplete;
}
