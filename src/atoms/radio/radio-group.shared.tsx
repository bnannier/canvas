import { Children, Fragment, isValidElement, useCallback, useMemo, type ReactElement, type ReactNode } from "react";
import { I18nManager, type Role } from "react-native";
import { View, Text, GlassSurface, useTheme, useFillStyle, useControllableState, useRovingFocus, type ColorTokens, type StyleProp, type TextStyle, type ViewStyle } from "../../style/index.js";
import { RadioGroupContext, type RadioGroupContextValue } from "./radio-context.js";
import type { RadioSkin } from "./radio.shared.js";

// RadioGroup owns the group's single-select state and hands it to the child
// `<Radio value="…">` controls through RadioGroupContext, so a bare group is
// interactive out of the box: exactly one option is chosen and pressing another moves
// the selection. Controlled via `value`, uncontrolled via `defaultValue` (the standard
// controllable-state contract, matching Tabs/Switch).
//
// It draws no chrome of its own on the web and Android (the child Radios carry every
// visual), so there it is a stack. It takes the Radio skin because iOS has no radio
// button: there a single choice is the inline picker of a grouped Form, so the group's
// plain options form one inset-grouped list section (the skin's `list`) whose rows are
// the options, with a trailing check on the chosen one. The platform entries build
// both Radio and RadioGroup from the same skin, so the two always agree.
//
// Every build is FILL (src/style/sizing.ts): a group of options is a form list, the
// parent provides its bounds, and a `row` group needs them to wrap at all. A content-sized
// wrapping row never wraps: in a Row it grows to the sum of its options and runs past its
// parent (the Radio page's card example scrolled the page sideways at phone width).

const RADIOGROUP: Role = "radiogroup";

// Default column stack and the optional row layout. Defined here (component
// internals) the way Radio defines its own row; this is not a call-site restyle. The
// column's gap is the skin's (`groupGap`: plain rows, or card tiles).
const COLUMN: ViewStyle = { flexDirection: "column" };
const ROW: ViewStyle = { flexDirection: "row", flexWrap: "wrap", rowGap: 12, columnGap: 20 };
// The `equal` row: the options split it into equal shares and never wrap, card tiles 10
// apart (the Controls page's plan tiles, `grid-template-columns:repeat(3,minmax(0,1fr));
// gap:10px`), plain options at the row's 20.
const EQUAL_ROW: ViewStyle = { flexDirection: "row", flexWrap: "nowrap" };
const EQUAL_CELL: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 };
const EQUAL_GAP = { card: 10, plain: 20 };
// An `inlineLabel` sits in the row before the options, centred on them.
const INLINE_ROW: ViewStyle = { alignItems: "center" };

// A labeled group stacks its header over the options; the header keeps the label
// tight to its description. Field-label rhythm: 8 between header and options
// (options themselves sit 12 apart), 4 inside the header.
const HEADED: ViewStyle = { flexDirection: "column", gap: 8 };
const HEADER: ViewStyle = { gap: 4 };

// Group label + description type: the field-label scale (matches Input's label and
// the kit's other title+description controls). Brand type shared across platforms,
// the way Radio shares its own label type, not a platform face.
function labelType(t: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground };
}
// The inline label (the Controls page's Digest row, `c-radio`: `font:500 13px var(--ft);
// color:var(--tx2)`, its line the face's normal 16 px).
function inlineLabelType(t: ColorTokens): TextStyle {
  return { fontSize: 13, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] };
}
function descriptionType(t: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
}

export interface RadioGroupProps {
  /** The selected option's value (CONTROLLED). Omit for uncontrolled use. */
  value?: string | number;
  /** Initial selected value for uncontrolled use (a bare group selects on press). */
  defaultValue?: string | number;
  /** Fired with the newly selected option's value. */
  onChange?: (value: string | number) => void;
  /** Disable every radio in the group. */
  disabled?: boolean;
  /**
   * Lay the options out in a wrapping row instead of the default column.
   * <!-- only: web ios -->
   * iOS keeps its
   * checkmark list vertical (a list has no row form); `card` options still sit in a row
   * there.
   * <!-- /only -->
   */
  row?: boolean;
  /**
   * With `row`: the options share the row equally and never wrap, a tile picker's even
   * columns (card tiles 10 apart, plain options 20).
   */
  equal?: boolean;
  /**
   * With `row` and a `label`: the label sits at the start of the row, before the options
   * and centred on them, in the 500 13 px muted ink (a short setting's inline choice:
   * "Digest  ( ) Daily  (o) Weekly"), instead of as a heading above. The `description` is
   * not shown inline.
   */
  inlineLabel?: boolean;
  /**
   * The group's name, rendered as a heading above the options. It also becomes the
   * radiogroup's accessible name, so a screen reader announces what the set of
   * options is about before reading them. The group owns this label anatomy; never
   * hand-compose a heading Text beside a bare group.
   */
  label?: string;
  /** Optional muted supporting line rendered under the label. */
  description?: ReactNode;
  /** The `<Radio value="…">` options that make up the group. */
  children?: ReactNode;
  /** E2E hook forwarded to the group container. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

type OptionProps = { value?: string | number; card?: boolean; disabled?: boolean };

/** Build a RadioGroup from the platform's Radio skin (its `list` decides whether the options form a list section). */
export function createRadioGroup(skin: RadioSkin) {
  /**
   * A group of Radio options with single-select state. Wrap `<Radio value="…">`
   * children in it; the group tracks which value is chosen and moves the selection
   * on press. Pass `value` + `onChange` to control it, or `defaultValue` (or
   * nothing) to let it manage its own selection.
   */
  function RadioGroup(props: RadioGroupProps) {
    const { disabled, label, description } = props;
    const { tokens } = useTheme();
    const fill = useFillStyle("RadioGroup");
    const [value, setValue] = useControllableState<string | number | undefined>(
      props.value,
      props.defaultValue,
      (next) => {
        if (next !== undefined) props.onChange?.(next);
      },
    );

    // The ordered option values, read from the `<Radio value="…">` children, so the
    // group can drive roving-focus keyboard navigation (arrows move + select the next
    // option, the WAI-ARIA radiogroup pattern). When nothing is selected yet, the
    // FIRST radio is the group's single tab stop (APG), so activeIndex floors at 0.
    const options = Children.toArray(props.children).filter(isValidElement) as ReactElement<OptionProps>[];
    // The options that take part in the arrow keys, one per value, so an index means the
    // same option in `values` and in `optionDisabled`.
    const valued = options.filter((child) => child.props.value !== undefined);
    const values = valued.map((child) => child.props.value as string | number);
    const optionDisabled = valued.map((child) => child.props.disabled === true);
    const activeIndex = value === undefined ? 0 : Math.max(0, values.indexOf(value));

    // The list section holds plain options only: selectable cards are tiles of their own.
    const cards = options.some((child) => child.props.card);
    const list = skin.list != null && options.length > 0 && !cards ? skin.list : null;

    // A disabled option is the hook's to skip (APG radio group): the arrows, Home and End
    // never select it, and it is never the group's tab stop.
    const { getItemProps } = useRovingFocus({
      count: values.length,
      active: activeIndex,
      onActivate: (i) => {
        if (!disabled) setValue(values[i]);
      },
      orientation: "both",
      rtl: I18nManager.isRTL,
      isDisabled: (i) => optionDisabled[i] === true,
    });

    // Key the item-props callback on the value order and the disabled options so it only
    // changes when the options or the active index change (not on every parent render).
    const valuesKey = `${values.join(" ")}|${optionDisabled.join(" ")}`;
    const itemProps = useCallback(
      (v: string | number) => {
        const i = values.indexOf(v);
        return i >= 0 ? getItemProps(i) : undefined;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [getItemProps, valuesKey],
    );

    // Memoize the context value so a parent re-render doesn't re-render every Radio
    // (it changes only when the selection, disabled flag, option set or list changes).
    const inList = list != null;
    const ctx = useMemo<RadioGroupContextValue>(
      () => ({
        value,
        select: (next) => setValue(next),
        disabled,
        itemProps: disabled ? undefined : itemProps,
        list: inList,
      }),
      [value, disabled, setValue, itemProps, inList],
    );

    // The group's accessible name. Both the RN accessibilityLabel and the aria-label
    // alias are set because RNW forwards neither on its own (the kit's dual-a11y
    // contract; same pattern the grouped surfaces use).
    const nameProps = label != null ? { accessibilityLabel: label, "aria-label": label } : {};
    // A list section (iOS) has no row form, so its label stays a heading above it.
    const inline = !!props.row && !!props.inlineLabel && label != null && list == null;
    const hasHeader = !inline && (label != null || description != null);
    const equal = !!props.row && !!props.equal;
    const rowStyle: ViewStyle | ViewStyle[] = equal ? [EQUAL_ROW, { gap: cards ? EQUAL_GAP.card : EQUAL_GAP.plain }] : ROW;

    // A list section is a content-layer pane under glass (GlassSurface is the plain
    // section in solid mode), with an inset hairline between two rows; the radiogroup
    // role and name ride the view inside it.
    const group = list ? (
      <GlassSurface
        layer="content"
        testID={hasHeader ? undefined : props.testID}
        style={hasHeader ? list.section(tokens) : [list.section(tokens), fill, props.style]}
      >
        <View role={RADIOGROUP} {...nameProps}>
          {options.map((child, i) => (
            <Fragment key={child.key ?? i}>
              {i > 0 ? <View style={list.separator(tokens)} /> : null}
              {child}
            </Fragment>
          ))}
        </View>
      </GlassSurface>
    ) : (
      <View
        testID={hasHeader ? undefined : props.testID}
        role={RADIOGROUP}
        {...nameProps}
        style={[props.row ? rowStyle : [COLUMN, { gap: cards ? skin.groupGap.card : skin.groupGap.plain }], inline ? INLINE_ROW : null, hasHeader ? null : [fill, props.style]]}
      >
        {/* The group's accessible name already says it, so the visible label is not read twice. */}
        {inline ? <Text aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={inlineLabelType(tokens)}>{label}</Text> : null}
        {equal
          ? Children.map(props.children, (child) => <View style={EQUAL_CELL}>{child}</View>)
          : props.children}
      </View>
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        {hasHeader ? (
          <View testID={props.testID} style={[HEADED, fill, props.style]}>
            <View style={HEADER}>
              {label != null ? <Text style={labelType(tokens)}>{label}</Text> : null}
              {description != null ? <Text style={descriptionType(tokens)}>{description}</Text> : null}
            </View>
            {group}
          </View>
        ) : (
          group
        )}
      </RadioGroupContext.Provider>
    );
  }
  return RadioGroup;
}
