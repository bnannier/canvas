import { useId, useRef } from "react";
import { type Role } from "react-native";
import { View, Pressable, Text, useTheme, useControllableState, useEscapeKey, useFieldWidth, AnchoredOverlay, useMeasuredWidth, FloatingLabel, LabelContent, RippleClip, cornerRadii, type FieldWidthProps, type StyleProp, type ViewStyle } from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the option-list
// container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { Icon } from "../icon/icon.js";
import { root, rootLifted, PANEL_ANCHOR, type SelectSkin, type Size } from "./select.styles.js";

// Shared Select shell. The structure (the stacked label + the trigger row with
// its optional leading icon, value/placeholder and trailing chevron, plus the
// open option list with its selectable rows), the public boolean-prop
// API, the size precedence, the controlled/uncontrolled value and open state,
// the select/close handlers, the disabled handling, and accessibility all live
// here once. A platform file supplies only its skin (trigger shape/fill/border,
// the chevron glyph, the menu surface, the row tint, where the selection
// indicator renders, and the press feedback) and calls createSelect.
//
// Overlay note: the open option list renders through AnchoredOverlay. When an
// OverlayProvider is mounted (an app root, or a docs example stage) the list is
// portaled over the page, anchored below the trigger, and a tap anywhere off it
// dismisses it, so it escapes any overflow-clipping ancestor (e.g. the docs'
// horizontal preview scroller), identically on iOS, Android, and web, with no
// Platform.OS branch. With no provider it falls back to an inline card positioned
// absolutely below the trigger (the kit's pre-portal behavior). AnchoredOverlay
// owns the card surface, so the listbox is passed to it directly; the panel asks
// for the OPAQUE one (`opaque`), an option list being a card of rows rather than
// one of the kit's glass overlays.

/**
 * An option whose stored value differs from the text shown for it, for lists
 * keyed by id (a project id, a region slug, a workspace name). Passing bare
 * strings stays supported and means the value and the label are the same.
 */
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends FieldWidthProps {
  /**
   * Controlled selection; omit for uncontrolled use. Empty shows the placeholder.
   * With plain string options this is the option itself; with `SelectOption`
   * objects it is the option's `value`, and the trigger shows its `label`.
   */
  value?: string;
  /** Initial selection for uncontrolled use (a bare <Select options /> picks on its own). */
  defaultValue?: string;
  /**
   * The selectable options: bare strings, or `{ value, label }` objects when the
   * stored value differs from the text shown for it.
   */
  options?: Array<string | SelectOption>;
  /**
   * The field's persistent label. Its placement is platform-adaptive: iOS and web
   * render it ABOVE the trigger; Android renders the Material 3 in-container
   * FLOATING label (centered like a placeholder at rest, floating to the top once
   * the menu opens or a value is selected). The label names the field for a11y.
   */
  label?: string;
  /**
   * Places the `label` as a LEADING cluster INSIDE the trigger row (a toolbar-style
   * labeled select) instead of the persistent above/floating placement. Takes effect
   * only alongside `label`. The inline label still names the trigger (accessibilityLabel
   * / aria-labelledby) and shares its tap target, since it lives inside the trigger
   * Pressable. Pairs with `fit` for a content-hugging toolbar cluster.
   */
  inline?: boolean;
  /**
   * Marks the field as required: appends a destructive "*" to the label (hidden
   * from the accessible name) and sets aria-required on the trigger. Takes effect
   * only alongside `label`.
   */
  required?: boolean;
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
  /** Called with the chosen option's value when a row is pressed (both modes). */
  onSelect?: (option: string) => void;
  /** E2E hook forwarded to the trigger pressable. */
  testID?: string;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: SelectProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Read a numeric style value (the Android trigger height), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

/** Build a Select component from a platform skin. */
export function createSelect(skin: SelectSkin) {
  return function Select(props: SelectProps) {
    const {
      options = [],
      label,
      required,
      icon,
      placeholder = "Select an option",
      onOpenChange,
      disabled,
      onSelect,
      style,
    } = props;
    const size = sizeOf(props);
    // One shape internally: a bare string is an option whose value is its label.
    const items: SelectOption[] = options.map((o) =>
      typeof o === "string" ? { value: o, label: o } : o,
    );
    const { tokens } = useTheme();
    const widthCap = useFieldWidth(props);
    // One collision-free id for the label so the floated label carries a nativeID.
    const labelId = useId();
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

    // Escape closes the open option list on web (no-op natively).
    useEscapeKey(open, () => setOpen(false));

    // Anchor the floating option list to the trigger: its measured width is the
    // list's minimum width when portaled over the page (a wider row can grow past
    // it), and AnchoredOverlay reads the trigger's box to place the list below it.
    const triggerRef = useRef<View>(null);
    const { width: triggerWidth, onLayout: onTriggerLayout } = useMeasuredWidth();

    const hasValue = value !== "";
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // Label placement: iOS/web render it ABOVE the trigger; the Android skin FLOATS
    // it inside the container (M3). The float signal is the menu being open (the
    // select's focus equivalent) OR a value being selected; the trigger's resting
    // placeholder text is hidden while the floating label is the placeholder.
    const hasLabel = label != null && label !== "";
    // `inline` routes the label into the trigger row as a leading cluster; it
    // overrides both the above (iOS/web) and floating (Android) placements, so a
    // toolbar-style labeled select owns its label instead of a hand-composed row.
    const inline = hasLabel && !!props.inline;
    const floating = hasLabel && !inline && skin.floatingLabel;
    const above = hasLabel && !inline && !floating;
    const triggerHeight = asNum((skin.trigger(tokens, size, open) as { height?: unknown }).height, 56);
    // Floating label owns the resting placeholder: show nothing until the menu opens
    // (matching the M3 Input); a selected value always shows.
    const selectedLabel = items.find((o) => o.value === value)?.label ?? value;
    const displayText = hasValue ? selectedLabel : floating && !open ? "" : placeholder;

    return (
      <View style={[root, open ? rootLifted : null, widthCap, style]}>
        {above ? (
          <Text nativeID={labelId} style={skin.label(tokens, size)}>
            <LabelContent label={label!} required={required} starColor={tokens.destructive} />
          </Text>
        ) : null}
        {/* The trigger's bounded Android ripple is clipped to its rounded (top-corner)
            outline by this RippleClip parent; the ripple is the Pressable's OWN background,
            which its same-node overflow:"hidden" cannot clip. See src/style/ripple-clip.
            `alignSelf:"stretch"` keeps the wrapper (and the trigger inside it) filling the
            field's standard width, which lives on the root View. */}
        <RippleClip shape={cornerRadii(skin.trigger(tokens, size, open))} style={{ alignSelf: "stretch" }}>
        <Pressable
          ref={triggerRef}
          onLayout={onTriggerLayout}
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
          // Required is surfaced programmatically (aria-required), omitted when optional.
          aria-required={required || undefined}
          // Name the trigger by its label on both channels so a screen reader
          // announces the field's name, not just the selected value/placeholder.
          accessibilityLabel={hasLabel ? label : undefined}
          aria-label={hasLabel ? label : undefined}
          // The inline label lives inside this Pressable, so link it by nativeID
          // (RNW forwards aria-labelledby to the DOM) as the trigger's name too.
          aria-labelledby={inline ? labelId : undefined}
        >
          <View
            style={[
              skin.triggerValue,
              // Android floating label: the reserve (top padding that lets the value
              // clear the floated label, mirroring the M3 Input) belongs to the VALUE
              // cluster only, not the whole trigger row. Stretched to full height, the
              // cluster centers its value within the space below the reserve, while the
              // trailing chevron stays vertically centered in the full field (M3 centers
              // a trailing dropdown icon in the container, unaffected by the label).
              floating ? [{ alignSelf: "stretch" as const }, skin.labelReserve!(size)] : null,
            ]}
          >
            {inline ? (
              <Text nativeID={labelId} style={skin.inlineLabel(tokens, size)}>
                <LabelContent label={label!} required={required} starColor={tokens.destructive} />
              </Text>
            ) : null}
            {icon ? <Icon globe muted size={14} /> : null}
            <Text style={skin.valueText(tokens, size, hasValue)}>{displayText}</Text>
          </View>
          <Text style={skin.chevron(tokens, size, open)}>{skin.chevronGlyph}</Text>
          {floating ? (
            <FloatingLabel
              styles={skin}
              size={size}
              tokens={tokens}
              label={label!}
              required={required}
              labelId={labelId}
              focused={open}
              populated={hasValue}
              isError={false}
              height={triggerHeight}
            />
          ) : null}
        </Pressable>
        </RippleClip>

        <AnchoredOverlay
          open={open}
          onDismiss={() => setOpen(false)}
          triggerRef={triggerRef}
          gap={4}
          cardStyle={[skin.panel(tokens), { minWidth: triggerWidth }]}
          inlineStyle={PANEL_ANCHOR}
          // An option list is a card of rows, so the panel stays an OPAQUE card
          // in glass mode too (the skin's own `popover` fill, no material):
          // options a user reads and picks from must not have the page showing
          // through between them.
          opaque
          // A controlled `open` with no onOpenChange can never actually close, so
          // the hosted dismiss backdrop is skipped (it would only block the page).
          dismissable={props.open === undefined || onOpenChange !== undefined}
        >
            {/* The option rows have no radius of their own and sit inside the rounded
                (4dp) `panel` card, which has NO overflow clip; this RippleClip parent clips
                their bounded Android ripples to the panel's corners. See src/style/ripple-clip. */}
            <RippleClip shape={cornerRadii(skin.panel(tokens))}>
            <View role={LISTBOX}>
            {items.map((option, i) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    skin.optionRow(tokens, selected),
                    // iOS draws a hairline group separator between rows (not above the
                    // first); a skin that omits rowSeparator keeps every row borderless.
                    i > 0 && skin.rowSeparator ? skin.rowSeparator(tokens) : null,
                    // Web/iOS tint the row on press here; Android uses the ripple instead.
                    skin.ripple == null && pressed ? skin.optionPressed(tokens) : null,
                  ]}
                  onPress={() => { setValue(option.value); setOpen(false); }}
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
                    {option.label}
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
            </RippleClip>
        </AnchoredOverlay>
      </View>
    );
  };
}
