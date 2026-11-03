import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useHover } from "../../style/hover.js";
import { useState } from "react";
import { Icon } from "../icon/icon.js";
import { View, Pressable, Text, useControllableState, useFillStyle, useRovingFocus, isRTL, type ColorTokens, type LayoutStyle, type MeasureProps, type StyleProp, type ViewStyle, type TextStyle, withInnerFill, GlassPane, paneStyle } from "../../style/index.js";
import { LISTBOX } from "../../style/listbox-role.js";
import { AnatomyScope, useAnatomyPart, type AnatomyTarget } from "../../style/anatomy.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";

// Shared Listbox shell. An inline, selectable list of options rendered directly
// (not a popover). Each row is a Pressable. Two selection modes, mutually
// exclusive:
//
// 1. Single-select (default): at most one row is the value.
// 2. Multi-select (`multi`): a named group of checkbox rows, and any number of rows
//    may be selected at once.
//
// Every chosen row, in both modes, sits on the skin's chosen fill with a trailing check
// (the hand-off's listbox). A multi-select row is a checkbox to assistive tech, a
// single-select row an option.
//
// The structure (rows, the check, label/detail stack), the boolean-prop axes (mode +
// size precedence, mirroring Button's intentOf), accessibility, and the semantic
// color logic live here once; a platform file supplies its skin and calls
// createListbox. Neither iOS nor Material 3 has a listbox control, so the look is
// the hand-off's on every platform.

export type Mode = "single" | "multi";
export type Size = "small" | "medium" | "large";

export interface ListboxItem {
  /** The option's primary text. */
  label: string;
  /** Optional secondary text shown under the label in a muted tone. */
  detail?: string;
  /** Whether this option is initially selected (uncontrolled seed; prefer the top-level `defaultSelected`). */
  selected?: boolean;
}

// Listbox is an input-like control, so it is FILL (src/style/sizing.ts) like Input,
// Select, Autocomplete and the rest: the parent layout container provides the
// bounds. That parent must be definite, and this is not cosmetic: each row is
// `checkmark(16) + a flexBasis:"0%" label stack`, and in a content-sized parent
// (a bare Column inside a Row) Yoga resolves the percentage basis against an
// indefinite width to 0 with no free space to grow into, so on iOS/Android every
// label collapses to zero and only the checkmark gutter shows. `useFillStyle`
// warns in development when the list lands in such a cell.
export interface ListboxProps extends MeasureProps {
  /** The options to render, top to bottom. */
  items: ListboxItem[];
  /** Accessible name of the option list or multi-select checkbox group. Defaults to "Options". */
  accessibilityLabel?: string;
  /**
   * Multi-select: each row is a checkbox
   * <!-- only: web -->
   * (a leading indicator on the web and Android, a trailing ✓ on iOS)
   * <!-- /only -->
   * <!-- only: ios -->
   * (a trailing ✓)
   * <!-- /only -->
   * <!-- only: android -->
   * (a leading indicator)
   * <!-- /only -->
   * instead of a single choice.
   */
  multi?: boolean;
  /** Wrap the list in a rounded, bordered content card with static glass in glass mode. */
  bordered?: boolean;
  // Size (pick one; default is medium).
  /** Tighter rows with smaller text. */
  small?: boolean;
  /** Taller rows. */
  large?: boolean;
  /** Dim the list and block selection. */
  disabled?: boolean;
  /**
   * Selected option index(es) (CONTROLLED): a single index in single-select, an
   * array of indices in multi-select. Omit for uncontrolled use.
   */
  selected?: number | number[];
  /**
   * Initial selection for uncontrolled use (a bare listbox selects on press).
   * Falls back to the `selected` flags on `items` when omitted.
   */
  defaultSelected?: number | number[];
  /** Fired with the full new selection (an index in single-select, an index array in multi). */
  onChange?: (selected: number | number[]) => void;
  /** Fired with the pressed option's index. */
  onSelect?: (index: number) => void;
  /** E2E hook forwarded to the root list view. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The per-OS style pieces a platform skin owns. Neither iOS nor Material 3 has a listbox
// control, so the look is the hand-off's on every platform and one skin serves them all.
// Color-bearing pieces are functions of the active tokens; layout-only fragments are
// static objects. `ripple` / `pressedOpacity` express the press feedback.
export interface ListboxSkin {
  /** A bordered container: rounded, hairline border, its fill and inset. */
  containerBordered: (tokens: ColorTokens) => ViewStyle;
  /** Each row: a horizontal flex shell with the label stack and the trailing check. */
  rowBase: ViewStyle;
  /** Per-row padding by size. */
  rowSize: Record<Size, ViewStyle>;
  /** The space between rows. */
  rowGap: number;
  /** The fill of a pressed row. */
  rowPressed: (tokens: ColorTokens) => ViewStyle;
  /** The instant look of a resting, unchosen row under the pointer; null where there is none. */
  rowHover: ((tokens: ColorTokens) => ViewStyle) | null;
  /** The fill of every chosen row, in single and multi select alike. */
  rowChosen: (tokens: ColorTokens) => ViewStyle;
  /** The trailing check a chosen row carries: its size (px) and ink. Its slot stays on every row. */
  check: { size: number; color: (tokens: ColorTokens) => string };
  /** Label/detail stack: grows to fill the remaining row width. */
  textStack: ViewStyle;
  /** Label type + color per size. */
  label: (tokens: ColorTokens, size: Size) => TextStyle;
  /** Muted detail line type + color. */
  detail: (tokens: ColorTokens) => TextStyle;
  /** Android press ripple (a no-op off Android; null disables it). */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** Pressed-row opacity dim (null leaves the look unchanged; the press fill carries the feedback). */
  pressedOpacity: number | null;
  /** Opacity of a disabled list. */
  disabledOpacity: number;
}

// Selection mode precedence when more than one axis prop is passed: first match
// wins. Only `multi` competes here; the default is single-select.
export function modeOf(p: ListboxProps): Mode {
  if (p.multi) return "multi";
  return "single";
}

// Size precedence when more than one is passed: first match wins (small over
// large). The default is medium.
export function sizeOf(p: ListboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

/** Build a Listbox component from a platform skin. */
export function createListbox(skin: ListboxSkin) {
  interface ListRowProps {
    item: ListboxItem;
    selected: boolean;
    mode: Mode;
    size: Size;
    disabled: boolean;
    roving: ReturnType<ReturnType<typeof useRovingFocus>["getItemProps"]> | undefined;
    onPress: () => void;
    /** This row's anatomy parts, on the first row (Option), the first chosen row (Selected check) and the first with a detail (Detail line). */
    parts: { option?: AnatomyTarget; check?: AnatomyTarget; detail?: AnatomyTarget };
  }

  // One row, its own component so the web's hover wash has a hook per row.
  function ListRow({ item, selected, mode, size, disabled, roving, onPress, parts }: ListRowProps) {
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const { hovered, target } = useHover(skin.rowHover != null && !disabled);
    // Name the row from its data so the title and detail stay separated,
    // and a selected option's decorative checkmark is not announced.
    const rowName = [item.label, item.detail].filter(Boolean).join(", ");
    const rowRef = useComposedRefs(roving?.ref, parts.option?.ref);

    // Pressable owns Enter activation on keyup. Handling it here as well
    // toggles a multi row twice. Its checkbox/option roles need an explicit
    // Space handler; arrows still use the shared roving-focus behavior.
    const onRowKeyDown = roving
      ? (e: { key: string; repeat?: boolean; preventDefault: () => void }) => {
          if (e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            if (!e.repeat) onPress();
            return;
          }
          roving.onKeyDown(e);
        }
      : undefined;
    const rovingProps = roving
      ? { focusable: roving.focusable, tabIndex: roving.tabIndex, onKeyDown: onRowKeyDown }
      : {};

    return (
      // Keep option/checkbox rows directly inside their listbox/group. The row clips its
      // own corners (overflow in the skin), so a rectangular ripple needs no clip parent.
      // See src/style/ripple-clip.
      <Pressable
        ref={rowRef}
        onLayout={parts.option?.onLayout}
        {...(rovingProps as object)}
        {...target}
        // Android shows the Material ripple (a no-op off Android). The press fill is
        // the skin's, applied only when enabled; a skin may also add an opacity dim via
        // pressedOpacity.
        android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
        style={({ pressed }) => [
          skin.rowBase,
          skin.rowSize[size],
          // The chosen wash is the accent's own translucent soft wash, a toned wash that
          // reads the same over the glass material, so it never trades for the ink tint.
          selected ? skin.rowChosen(tokens) : null,
          hovered && !selected && skin.rowHover ? skin.rowHover(tokens) : null,
          !disabled && pressed ? withInnerFill(theme, skin.rowPressed(tokens), "firm") : null,
          skin.pressedOpacity != null && !disabled && pressed ? { opacity: skin.pressedOpacity } : null,
        ]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        aria-disabled={!!disabled}
        // A multi-select row IS the checkbox (the indicator has no interactive
        // host), so its state is `checked`; a single-select
        // row is an `option`, whose state is `selected`. RNW forwards neither
        // accessibilityState key to the DOM, so each carries its aria alias.
        role={mode === "multi" ? "checkbox" : "option"}
        accessibilityLabel={rowName}
        aria-label={rowName}
        accessibilityState={
          mode === "multi"
            ? { checked: selected, disabled: !!disabled }
            : { selected, disabled: !!disabled }
        }
        {...(mode === "multi" ? { "aria-checked": selected } : { "aria-selected": selected })}
      >
        <View style={skin.textStack}>
          <Text style={skin.label(tokens, size)}>{item.label}</Text>
          {item.detail != null ? <Text ref={parts.detail?.ref} onLayout={parts.detail?.onLayout} style={skin.detail(tokens)}>{item.detail}</Text> : null}
        </View>
        {/* Decorative: the row's own state names the choice. The slot stays on an unchosen
            row, so choosing never reflows a label. */}
        <View ref={parts.check?.ref} onLayout={parts.check?.onLayout} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: skin.check.size, alignItems: "center" }}>
          {selected ? <Icon check color={skin.check.color(tokens)} size={skin.check.size} decorative /> : null}
        </View>
      </Pressable>
    );
  }

  return function Listbox(props: ListboxProps) {
    const { items, bordered, disabled, onSelect, style } = props;
    const mode = modeOf(props);
    const size = sizeOf(props);
    const accessibleName = props.accessibilityLabel?.trim() || "Options";
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    // FILL, applied to the root list View (see the note above the interface).
    const widthCap = useFillStyle("Listbox", props);
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Listbox, Option, Selected check, Detail line, each row part on
    // its first instance, taken before the tree's AnatomyScope.
    const listboxPart = useAnatomyPart("Listbox");
    const optionPart = useAnatomyPart("Option");
    const checkPart = useAnatomyPart("Selected check");
    const detailPart = useAnatomyPart("Detail line");

    // Normalize the single|multi selection to an index array so one code path
    // drives both modes. Controlled via `selected`; uncontrolled seeds from
    // `defaultSelected`, falling back to the items' own `selected` flags, so a
    // bare listbox is interactive out of the box instead of ignoring presses.
    const toArray = (v: number | number[] | undefined): number[] | undefined =>
      v === undefined ? undefined : Array.isArray(v) ? v : [v];
    const controlled = toArray(props.selected);
    const initial = toArray(props.defaultSelected)
      ?? items.reduce<number[]>((acc, it, i) => (it.selected ? [...acc, i] : acc), []);
    const [selectedArr, setSelectedArr] = useControllableState<number[]>(
      controlled,
      initial,
      (next) => props.onChange?.(mode === "single" ? (next[0] ?? -1) : next),
    );

    const press = (index: number) => {
      const next = mode === "single"
        ? [index]
        : selectedArr.includes(index)
          ? selectedArr.filter((i) => i !== index)
          : [...selectedArr, index];
      setSelectedArr(next);
      onSelect?.(index);
    };

    // Roving-focus keyboard navigation: one tab stop,
    // arrows move a focus cursor down/up. Single-select follows focus (arrowing
    // selects); multi-select moves focus only and toggles on Enter/Space. The cursor
    // starts on the first selected row (or the first row).
    const [focusedIndex, setFocusedIndex] = useState(() => selectedArr[0] ?? 0);
    const { getItemProps } = useRovingFocus({
      count: items.length,
      active: Math.min(focusedIndex, Math.max(0, items.length - 1)),
      onActivate: (i) => {
        if (disabled) return;
        setFocusedIndex(i);
        if (mode === "single") press(i);
      },
      orientation: "vertical",
      rtl: isRTL(),
    });

    const container: StyleProp<ViewStyle> = [
      // Base: fill the parent's width (explicit, so the list fills even a centered
      // parent rather than collapsing to content the way a width-less View would);
      // FILL below adds the row-sharing pair.
      { width: "100%", gap: skin.rowGap },
      bordered ? paneStyle(theme, skin.containerBordered(tokens)) : null,
      disabled ? { opacity: skin.disabledOpacity } : null,
      widthCap,
      style,
    ];

    // A selectable list of options is a `listbox` of `option`s (single-select)
    // or a group of `checkbox` rows (multi-select). LISTBOX spells the list's role
    // for the runtime: the web's listbox, and a list natively (src/style/listbox-role.ts).
    // `collapsable={false}` keeps the container a native view that holds its rows. Fabric
    // removes a View whose props neither paint nor mark it (a role or a label does not count),
    // and hoists the children out of one that only paints or carries a testID, so the list's
    // name and role reached no screen reader, or sat on an empty node beside the rows; only a
    // disabled list (its opacity) held them. React Native Web drops the prop: the DOM is unchanged.
    const firstChosen = items.findIndex((_, index) => selectedArr.includes(index));
    const firstDetail = items.findIndex((item) => item.detail != null);
    return (
      <AnatomyScope>
      <View ref={listboxPart?.ref} onLayout={listboxPart?.onLayout} style={container} collapsable={false} role={mode === "multi" ? "group" : LISTBOX} testID={props.testID}
        accessibilityLabel={accessibleName} aria-label={accessibleName}>
        {/* A bordered list is a CONTENT-layer pane under glass (nothing in solid mode). */}
        {bordered ? <GlassPane layer="content" shape={skin.containerBordered(tokens)} /> : null}
        {items.map((item, index) => (
          <ListRow
            key={index}
            item={item}
            selected={selectedArr.includes(index)}
            mode={mode}
            size={size}
            disabled={!!disabled}
            roving={disabled ? undefined : getItemProps(index)}
            onPress={() => press(index)}
            parts={{ option: index === 0 ? optionPart : undefined, check: index === firstChosen ? checkPart : undefined, detail: index === firstDetail ? detailPart : undefined }}
          />
        ))}
      </View>
      </AnatomyScope>
    );
  };
}
