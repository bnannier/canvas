import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { EscapeLayerProvider, useEscapeLayer } from "../../style/escape-layer.js";
import { forwardRef, useId, useRef } from "react";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { View, Pressable, Text, useControllableState, useFillStyle, AnchoredOverlay, useOverlayHost, useMeasuredWidth, FloatingLabel, LabelContent, labelA11y, useFloatingLabelRoom, RippleClip, cornerRadii, FOCUS_RESET, type LayoutStyle, type MeasureProps, type StyleProp, type ViewStyle, type PressableProps, GlassPane, paneStyle, paneRipple, panePlaced, isGlass, withInnerFill } from "../../style/index.js";
import { useRowFocus } from "../../style/use-row-focus.js";
import { OverlayScrollView } from "../../style/overlay-scroll.js";
import { LISTBOX } from "../../style/listbox-role.js";

import { useHover, hoverFill } from "../../style/hover.js";
import { useFocusFrame } from "../../style/focus-frame.js";
import { Icon } from "../icon/icon.js";
import { root, rootLifted, PANEL_ANCHOR, type SelectDisclosure, type SelectSkin, type Size } from "./select.styles.js";

// The option list is a SCROLLPORT inside the card's `maxHeight` cap. The cap bounds
// the CARD, so without this the list would keep its full content height and the
// card's clip would simply cut the overflow rows off, unreachable. React Native
// Views default to `flexShrink: 0`, so the list has to be told it may shrink to the
// capped card; the rows past the cap then scroll into view instead of disappearing.
const optionScroll: ViewStyle = { flexShrink: 1 };
const floatingLabelLayer: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" };

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
// for the DENSE layer (`dense`), an option list being a card of rows that must stay
// legible over the page rather than a sheer functional-layer overlay.

/**
 * An option whose stored value differs from the text shown for it, for lists
 * keyed by id (a project id, a region slug, a workspace name). Passing bare
 * strings stays supported and means the value and the label are the same.
 */
export interface SelectOption {
  value: string;
  label: string;
  /**
   * A short leading glyph shown before the label in the trigger and in the option
   * row: a flag emoji for a country list ("🇺🇸"), a currency sign, a unit. Content,
   * not styling; it inherits the row's type and colour.
   */
  leading?: string;
}

export interface SelectProps extends MeasureProps {
  /**
   * Controlled selection; omit for uncontrolled use. Empty shows the placeholder.
   * With plain string options this is the option itself; with `SelectOption`
   * objects it is the option's `value`, and the trigger shows its `label`.
   */
  value?: string;
  /** Initial selection for uncontrolled use (a bare <Select options/> picks on its own). */
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
  /** Accessible purpose for the trigger and option list. Overrides the visible
   * label for assistive technology; otherwise the label or placeholder names them. */
  accessibilityLabel?: string;
  /**
   * Places the `label` as a LEADING cluster INSIDE the trigger row (a toolbar-style
   * labeled select) instead of the persistent above/floating placement. Takes effect
   * only alongside `label`. The inline label still names the trigger (accessibilityLabel
   * / aria-labelledby) and shares its tap target, since it lives inside the trigger
   * Pressable. Pairs with `fit` for a content-hugging toolbar cluster.
   */
  inline?: boolean;
  /**
   * Marks the field as required and announces "required" with the trigger name.
   * A visible label also gets a decorative destructive "*".
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
  /** Use the compact content-sized web field with a drawn disclosure chevron. */
  dense?: boolean;
  /** Use the compact application eyebrow above a web field. */
  eyebrow?: boolean;
  /** Use the brand field fill instead of the card fill. */
  soft?: boolean;
  /** Text-only options: selected ink and a pointer wash, without a check gutter. */
  plainOptions?: boolean;
  /** Keep the resting fill and opacity during a press. */
  steadyPress?: boolean;
  /** Announce a selection field as a combobox rather than a menu button. */
  combobox?: boolean;
  /** Width of the floating menu, clamped within the overlay outlet. */
  menuWidth?: number;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Size precedence when more than one is passed: first match wins.
export function sizeOf(p: SelectProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

/** Web field density is independent of the menu anatomy. */
export function fieldOf(p: SelectProps): "dense" | "standard" {
  return p.dense ? "dense" : "standard";
}
// The selection mark is decorative: the row's selected state carries the meaning, so
// the glyph is hidden from every platform's accessibility tree (aria-hidden on the web,
// the element hiding props natively) and stays out of the option's name.
const DECORATIVE_MARK = {
  "aria-hidden": true,
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants",
} as const;

/** An option row's accessible name: its visible text (the leading glyph and the label), never the mark. */
function optionName(option: SelectOption): string {
  return option.leading ? `${option.leading} ${option.label}` : option.label;
}

/** A plain option list has selected ink rather than the platform check gutter. */
export function optionsOf(p: SelectProps): "plain" | "standard" {
  return p.plainOptions ? "plain" : "standard";
}

const OptionPressable = forwardRef<View, Omit<PressableProps, "style"> & { rowStyle: StyleProp<ViewStyle>; pressedStyle?: StyleProp<ViewStyle>; hoverFill?: string }>(function OptionPressable({ hoverFill: wash, rowStyle, pressedStyle, disabled, ...props }, ref) {
  const { hovered, target } = useHover(wash != null);
  return <Pressable {...props} {...target} role="option" disabled={disabled} ref={ref} style={({ pressed }) => [rowStyle, pressed ? pressedStyle : null, hovered ? { backgroundColor: wash } : null]} />;
});

// Read a numeric style value (the Android trigger height), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

// The trailing disclosure: a chevron glyph, or the Material drop-down triangle (a 10x5
// wedge drawn from borders, centered in its box), turned over while open where the skin
// says so. Decorative: the trigger's expanded state names it. Autocomplete's toggle
// draws the same disclosure.
export function Disclosure({ spec, size, color, open, style }: { spec: SelectDisclosure; size: number; color: string; open: boolean; style?: StyleProp<ViewStyle> }) {
  const turn = spec.flips && open ? { transform: [{ rotate: "180deg" }] } : null;
  if (spec.glyph === "triangle") {
    return (
      <View {...DECORATIVE_MARK} style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, turn, style]}>
        <View style={{ width: 0, height: 0, borderStartWidth: 5, borderEndWidth: 5, borderTopWidth: 5, borderStartColor: "transparent", borderEndColor: "transparent", borderTopColor: color }} />
      </View>
    );
  }
  const glyph = spec.glyph === "chevronsUpDown" ? { chevronsUpDown: true } : { chevronDown: true };
  return (
    <View {...DECORATIVE_MARK} style={[turn, style]}>
      <Icon {...glyph} color={color} size={size} decorative />
    </View>
  );
}

/** Build a Select component from a platform skin.
 * @ref Ref to the interactive trigger, preserving overlay measurement. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs.
 */
export function createSelect(skin: SelectSkin) {
  const Select = forwardRef<View, SelectProps>(function Select(props, ref) {
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
    const dense = fieldOf(props) === "dense" && skin.reference != null;
    const plain = optionsOf(props) === "plain" && skin.reference != null;
    // One shape internally: a bare string is an option whose value is its label.
    const items: SelectOption[] = options.map((o) =>
      typeof o === "string" ? { value: o, label: o } : o,
    );
    const theme = useMaterialTheme({ layer: "control" });
    const { tokens } = theme;
    // A Select's content is its value, so a bare Column in a Row (the `.col-auto`
    // toolbar cell) hugs it legitimately: no hugging-cell warning.
    const widthCap = useFillStyle("Select", props, { hugsInCell: true });
    // One collision-free id for the label so the floated label carries a nativeID.
    const labelId = useId();
    const listId = `${labelId}-options`;
    // Controlled when `open`/`value` are provided, self-managed otherwise, so a
    // bare <Select options/> opens and picks out of the box (the standard
    // library contract): the trigger opens/closes the list, a select stores the
    // choice and closes it, and the callbacks fire in both modes.
    const [storedOpen, setStoredOpen] = useControllableState<boolean>(
      props.open,
      props.defaultOpen ?? false,
      onOpenChange,
    );
    const [value, setValue] = useControllableState<string>(
      props.value,
      props.defaultValue ?? "",
      onSelect,
    );

    // Disabled suppresses the menu without changing either owned state axis.
    // Re-enabling restores the stored open state, matching Dropdown, and prop
    // changes never synthesize interaction callbacks.
    const open = !disabled && storedOpen;
    const setOpen = (next: boolean) => {
      if (disabled) return;
      setStoredOpen(next);
    };
    const selectOption = (next: string) => {
      if (disabled) return;
      setValue(next);
      setOpen(false);
    };

    // Escape closes the open option list via browser Escape or native accessibility escape.
    const escapeScope = useEscapeLayer(open, () => setOpen(false));

    // Anchor the floating option list to the trigger: its measured width is the
    // list's minimum width when portaled over the page (a wider row can grow past
    // it), and AnchoredOverlay reads the trigger's box to place the list below it.
    const triggerRef = useRef<View>(null);
    const host = useOverlayHost();
    // Keyboard focus, read the way the browser's :focus-visible marks it, for a skin that
    // draws its own focus edge and halo (the web); the hover edge likewise.
    const focusFrame = useFocusFrame();
    const hover = useHover(!!skin.hover && !disabled);
    const hostRef = useComposedRefs(triggerRef, ref, focusFrame.target.ref);
    const { ref: _frameRef, ...frameEvents } = focusFrame.target;
    const { width: triggerWidth, onLayout: onTriggerLayout } = useMeasuredWidth();

    const hasValue = value !== "";
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    // The option rows: the WAI-ARIA listbox keyboard model (src/style/use-row-focus.ts).
    // Focus enters at the selected option (the first when nothing is selected) when the
    // card is revealed, the screen reader's natively; the arrows, Home and End move
    // among the options, Enter and Space choose one, Tab out of the list closes it, and
    // focus returns to the trigger.
    const rows = useRowFocus(items.length);
    const enterList = () => rows.enter(Math.max(0, items.findIndex((option) => option.value === value)));

    // Label placement: iOS/web render it ABOVE the trigger; the Android skin FLOATS
    // it inside the container (M3). The float signal is the menu being open (the
    // select's focus equivalent) OR a value being selected; the trigger's resting
    // placeholder text is hidden while the floating label is the placeholder.
    const hasLabel = label != null && label !== "";
    const fieldName = props.accessibilityLabel?.trim() || label?.trim() || placeholder.trim() || "Select an option";
    const triggerName = required ? `${fieldName}, required` : fieldName;
    // The trigger names itself from the label unless the caller named it, so natively the
    // label is then hidden beside it (labelA11y).
    const labelNames = !props.accessibilityLabel?.trim();
    // `inline` routes the label into the trigger row as a leading cluster; it
    // overrides both the above (iOS/web) and floating (Android) placements, so a
    // toolbar-style labeled select owns its label instead of a hand-composed row.
    const inline = hasLabel && !!props.inline;
    const floating = hasLabel && !inline && skin.floatingLabel;
    const above = hasLabel && !inline && !floating;
    const keyFocused = !!skin.focusHalo && focusFrame.focused && !disabled;
    const softLook = props.soft ? (skin.soft ? skin.soft(tokens) : { backgroundColor: tokens["field-fill"] ?? tokens.card }) : null;
    const baseTrigger = dense ? skin.reference!.trigger(tokens, open, hover.hovered, keyFocused) : skin.trigger(tokens, size, open, hover.hovered, keyFocused);
    // `soft` drops the resting edge, never a state edge: keyboard focus and the open list
    // keep the ring-coloured edge the skin resolved, or a soft field would show no ring.
    const triggerShape = { ...baseTrigger, ...softLook, ...(softLook && (keyFocused || open) ? { borderColor: baseTrigger.borderColor } : null) };
    // Keyboard focus turns the edge to the ring and adds the halo. While the list is open
    // the edge is the ring already, so focus could not change it and the faint halo alone
    // would be the cue: then the trigger wears the kit's keyboard ring outside its box in
    // place of the halo, as an errored Input does when its red edge holds the border.
    const halo = keyFocused && !open ? skin.focusHalo!(tokens) : null;
    const openRing = keyFocused && open ? focusFrame.ring(triggerShape) : null;
    const panelShape = skin.panel(tokens);
    // The trigger's height: its floor where it grows with the text size (Android), else its height.
    const triggerHeight = asNum(triggerShape.minHeight ?? triggerShape.height, 56);
    // The room the Android floating label takes, which follows the user's text size.
    const room = useFloatingLabelRoom(skin, tokens, size);
    // The floating label stays clear of the trailing disclosure: the trigger's end padding,
    // the disclosure's box and the row's gap to it.
    const disclosureSize = dense ? skin.reference!.chevron : skin.disclosure.size(size);
    const labelEnd =
      asNum(triggerShape.paddingEnd ?? triggerShape.paddingHorizontal, 16) +
      disclosureSize +
      asNum(triggerShape.columnGap ?? triggerShape.gap, 0);
    // Under glass the trigger is a CONTROL-layer puck: a GlassPane paints the material
    // behind the row (the Pressable keeps its tap, ripple and dim), the box drops its
    // fill and resting hairline, and keeps only its OPEN border (the iOS/web `ring`)
    // as state; the Android skin's bottom indicator is a side colour, which the
    // shorthand reset leaves alone. Solid mode is untouched.
    const glass = isGlass(theme);
    const glassTrigger: ViewStyle | null = glass ? { backgroundColor: "transparent", borderColor: open || keyFocused ? triggerShape.borderColor : "transparent" } : null;
    // Floating label owns the resting placeholder: show nothing until the menu opens
    // (matching the M3 Input); a selected value always shows.
    const selected = items.find((o) => o.value === value);
    const selectedLabel = selected?.label ?? value;
    const displayText = hasValue ? selectedLabel : floating && !open ? "" : placeholder;
    // The selected option's leading glyph rides in the trigger before the value.
    const selectedLeading = hasValue ? selected?.leading : undefined;
    // The selection mark: its ink and the check glyph's size.
    const mark = skin.indicator(tokens, size);
    const markSize = asNum(mark.fontSize, 14);

    return (
      <View style={[root, open && !host ? rootLifted : null, widthCap, style]}>
        {above ? (
          <Text nativeID={labelId} style={props.eyebrow && skin.reference ? skin.reference.label(tokens) : skin.label(tokens, size)} {...labelA11y(label!, labelNames)}>
            <LabelContent label={label!} required={required} starColor={tokens.destructive} />
          </Text>
        ) : null}
        {/* The trigger's bounded Android ripple is clipped to its rounded (top-corner)
            outline by this RippleClip parent; the ripple is the Pressable's OWN background,
            which its same-node overflow:"hidden" cannot clip. See src/style/ripple-clip.
            `alignSelf:"stretch"` keeps the wrapper (and the trigger inside it) filling the
            field's standard width, which lives on the root View. */}
        <RippleClip shape={cornerRadii(triggerShape)} style={{ alignSelf: "stretch" }}>
        <Pressable
          {...(skin.focusHalo ? frameEvents : null)}
          ref={hostRef}
          {...hover.target}
          onLayout={onTriggerLayout}
          style={({ pressed }) => [
            paneStyle(theme, triggerShape, open || keyFocused),
            glassTrigger,
            skin.focusHalo ? FOCUS_RESET : null,
            halo,
            openRing,
            !glass && disabled ? { opacity: skin.disabledOpacity } : null,
            !props.steadyPress && !glass && skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          ]}
          disabled={disabled}
          onPress={() => setOpen(!open)}
          // The trigger's pane is a child of this Pressable: where it renders, the ripple
          // draws in the foreground, over it (`paneRipple`).
          android_ripple={paneRipple(theme, ripple)}
          testID={props.testID}
          accessibilityRole={props.combobox ? "combobox" : "button"}
          accessibilityState={{ expanded: open, disabled: !!disabled }}
          aria-expanded={open}
          aria-disabled={!!disabled}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          // Name the trigger by its label on both channels so a screen reader
          // announces the field's name, not just the selected value/placeholder.
          accessibilityLabel={triggerName}
          aria-label={triggerName}
          // The inline label lives inside this Pressable, so link it by nativeID
          // (RNW forwards aria-labelledby to the DOM) as the trigger's name too.
          aria-labelledby={inline && !props.accessibilityLabel && !required ? labelId : undefined}
        >
          {({ pressed }) => {
            const ink = glass ? { opacity: disabled ? skin.disabledOpacity : pressed && !props.steadyPress && skin.pressedOpacity != null ? skin.pressedOpacity : 1 } : null;
            return <>
              <GlassPane layer="control" shape={triggerShape} stateBorder={open || keyFocused} />
              <View
                style={[
                  skin.triggerValue,
                  dense ? { flex: 1, minWidth: 0 } : null,
                  // Android floating label: the reserve (top padding that lets the value
                  // clear the floated label, mirroring the M3 Input) belongs to the VALUE
                  // cluster only, not the whole trigger row. Stretched to full height, the
                  // cluster centers its value within the space below the reserve, while the
                  // trailing chevron stays vertically centered in the full field (M3 centers
                  // a trailing dropdown icon in the container, unaffected by the label).
                  floating ? [{ alignSelf: "stretch" as const }, room.reserve] : null,
                  ink,
                ]}
              >
                {inline ? (
                  <Text nativeID={labelId} style={skin.inlineLabel(tokens, size)} {...labelA11y(label!, labelNames)}>
                    <LabelContent label={label!} required={required} starColor={tokens.destructive} />
                  </Text>
                ) : null}
                {icon ? <Icon globe color={skin.icon.color(tokens)} size={skin.icon.size} decorative /> : null}
                {selectedLeading != null ? <Text style={skin.valueText(tokens, size, true)}>{selectedLeading}</Text> : null}
                <Text numberOfLines={dense ? 1 : undefined} style={dense ? [skin.reference!.value(tokens), { flex: 1 }] : skin.valueText(tokens, size, hasValue)}>{displayText}</Text>
              </View>
              <Disclosure spec={skin.disclosure} size={disclosureSize} color={skin.disclosure.color(tokens, open)} open={open} style={ink} />
              {floating ? (
                <View style={[panePlaced(theme, triggerShape, floatingLabelLayer, open), ink]}>
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
                    end={labelEnd}
                    names={labelNames}
                    onLine={room.onLine}
                  />
                </View>
              ) : null}
            </>;
          }}
        </Pressable>
        </RippleClip>

        <AnchoredOverlay
          onAccessibilityEscape={escapeScope.onAccessibilityEscape}
          ownsScroll
          open={open}
          onDismiss={() => setOpen(false)}
          triggerRef={triggerRef}
          gap={skin.panelGap}
          cardWidth={props.menuWidth ?? skin.panelWidth}
          cardStyle={[panelShape, (props.menuWidth ?? skin.panelWidth) == null ? { minWidth: triggerWidth } : { width: props.menuWidth ?? skin.panelWidth }]}
          inlineStyle={PANEL_ANCHOR}
          // An option list is a card of rows, so under glass the panel takes the
          // DENSE layer: the material under the model's densest tint, so options a
          // user reads and picks from never have the page showing through between
          // them while the card still takes the material.
          dense
          // A controlled `open` with no onOpenChange can never actually close, so
          // the hosted dismiss backdrop is skipped (it would only block the page).
          dismissable={props.open === undefined || onOpenChange !== undefined}
          onCardMount={enterList}
          dismissOnTab
        >
          <EscapeLayerProvider scope={escapeScope}>
            {/* The Android option rows have no radius of their own and sit inside the
                rounded `panel` card, so RippleClip rounds their bounded ripples to the
                card's corners: a view cannot clip its own ripple, and the card's own clip
                does not reach them through the card's padding. See src/style/ripple-clip. */}
            <OverlayScrollView style={optionScroll} bounces={false}>
            <RippleClip shape={cornerRadii(panelShape)}>
            <View nativeID={listId} role={LISTBOX} accessibilityLabel={fieldName} aria-label={fieldName} aria-required={required || undefined}>
            {items.map((option, i) => {
              const selected = option.value === value;
              return (
                <OptionPressable
                  hoverFill={plain ? hoverFill(tokens) : undefined}
                  key={option.value}
                  {...(rows.rowProps(i, () => selectOption(option.value)) as object)}
                  rowStyle={[
                    withInnerFill(theme, dense ? skin.reference!.row(tokens, selected) : skin.optionRow(tokens, selected), "firm"),
                    // iOS draws a hairline group separator between rows (not above the
                    // first); a skin that omits rowSeparator keeps every row borderless.
                    i > 0 && skin.rowSeparator ? skin.rowSeparator(tokens) : null,
                  ]}
                  pressedStyle={!props.steadyPress && skin.ripple == null ? withInnerFill(theme, skin.optionPressed(tokens), "firm") : undefined}
                  onPress={() => selectOption(option.value)}
                  disabled={disabled}
                  android_ripple={ripple}
                  role="option"
                  // The row's name is its visible text alone: the selection mark is
                  // decorative (the selected state already announces it), so it never
                  // joins the name a platform would otherwise merge from the children.
                  accessibilityLabel={optionName(option)}
                  aria-label={optionName(option)}
                  accessibilityState={{ selected, disabled: !!disabled }}
                  aria-selected={selected}
                  aria-disabled={!!disabled}
                >
                  {!plain && skin.selectedSide === "leading" ? (
                    <View {...DECORATIVE_MARK} style={{ width: skin.markSlot ?? markSize, alignItems: "center" }}>
                      {selected ? <Icon check color={mark.color as string} size={markSize} decorative /> : null}
                    </View>
                  ) : null}
                  {option.leading != null ? (
                    <Text style={skin.optionText(tokens, size)}>{option.leading}</Text>
                  ) : null}
                  <Text style={[dense ? skin.reference!.option(tokens, selected) : skin.optionText(tokens, size), { flex: 1, flexShrink: 1 }]}>
                    {option.label}
                  </Text>
                  {!plain && skin.selectedSide === "trailing" && selected ? (
                    <View {...DECORATIVE_MARK}>
                      <Icon check color={mark.color as string} size={markSize} decorative />
                    </View>
                  ) : null}
                </OptionPressable>
              );
            })}
            </View>
            </RippleClip>
            </OverlayScrollView>
        </EscapeLayerProvider>
        </AnchoredOverlay>
      </View>
    );
  });
  Select.displayName = "Select";
  return Select;
}
