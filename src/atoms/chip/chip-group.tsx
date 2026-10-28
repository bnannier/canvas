import { Children, isValidElement, useCallback, useMemo, type ReactElement, type ReactNode } from "react";
import { I18nManager, type Role } from "react-native";
import { View, Text, useTheme, useFillStyle, useControllableState, useRovingFocus, type ColorTokens, type LayoutStyle, type TextStyle, type ViewStyle } from "../../style/index.js";
import { ChipGroupContext, type ChipGroupContextValue } from "./chip-context.js";

// ChipGroup is a pick-one set of chips: the WAI-ARIA radiogroup pattern drawn as chips.
// It owns the chosen value and hands it to its `<Chip value="…">` children through
// ChipGroupContext, so exactly one chip is selected and pressing another moves the
// selection. The set is ONE tab stop (the chosen chip, or the first enabled one), and the
// arrow keys, Home and End move focus and selection through the shared roving-focus hook
// (src/style/use-roving-focus.ts), the one RadioGroup and Tabs use; a disabled chip is
// skipped. Controlled via `value`, uncontrolled via `defaultValue`, RadioGroup's contract.
//
// It draws no chrome of its own: the chips carry every visual (each platform's own Chip
// skin), so the group is a wrapping row 8 px apart (the Row `snug` step). It is FILL (src/style/sizing.ts): the parent provides its bounds, and a wrapping row needs
// them to wrap at all.

const RADIOGROUP: Role = "radiogroup";

// The wrapping row of chips, and the labeled group's header over it (RadioGroup's rhythm:
// 8 between header and options, 4 inside the header).
const ROW: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 };
// A set of `option` chips sits 4 apart (the hand-off playground's knob picks).
const OPTION_GAP: ViewStyle = { gap: 4 };
const HEADED: ViewStyle = { flexDirection: "column", gap: 8 };
const HEADER: ViewStyle = { gap: 4 };

// Group label and description: the field-label scale RadioGroup's header uses.
function labelType(t: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground };
}
function descriptionType(t: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
}

export interface ChipGroupProps {
  /** The chosen chip's value (CONTROLLED). Omit for uncontrolled use. */
  value?: string | number;
  /** Initial chosen value for uncontrolled use (a bare group selects on press). */
  defaultValue?: string | number;
  /** Fired with the newly chosen chip's value. */
  onChange?: (value: string | number) => void;
  /** Disable every chip in the group. */
  disabled?: boolean;
  /**
   * Draw every chip as an `option` chip (Chip's compact settings pick), 4 px apart: the
   * pick-one sets of a settings panel.
   */
  option?: boolean;
  /**
   * The group's name, rendered as a heading above the chips and announced as the
   * radiogroup's accessible name. The group owns this label anatomy; never hand-compose
   * a heading Text beside a bare group.
   */
  label?: string;
  /** Optional muted supporting line rendered under the label. */
  description?: ReactNode;
  /**
   * The group's accessible name when the page already shows its heading elsewhere (no
   * visible label is rendered). `label` wins when both are passed.
   */
  accessibilityLabel?: string;
  /** The `<Chip value="…">` options that make up the set. */
  children?: ReactNode;
  /** E2E hook forwarded to the group container. */
  testID?: string;
  /** Outer layout composition only (flex within a parent), never a restyle hook. */
  style?: LayoutStyle;
}

type OptionProps = { value?: string | number; disabled?: boolean };

/**
 * A pick-one set of chips (a radiogroup): wrap `<Chip value="…">` children in it; the
 * group tracks which value is chosen, moves the selection on press, and is one tab stop
 * whose arrow keys move and select. Pass `value` + `onChange` to control it, or
 * `defaultValue` (or nothing) to let it manage its own selection.
 */
export function ChipGroup(props: ChipGroupProps) {
  const { disabled, label, description, option } = props;
  const { tokens } = useTheme();
  const fill = useFillStyle("ChipGroup");
  const [value, setValue] = useControllableState<string | number | undefined>(
    props.value,
    props.defaultValue,
    (next) => {
      if (next !== undefined) props.onChange?.(next);
    },
  );

  // The ordered option values, read from the `<Chip value="…">` children, so the group can
  // drive the roving focus. With nothing chosen yet, the FIRST enabled chip is the tab stop.
  const options = (Children.toArray(props.children).filter(isValidElement) as ReactElement<OptionProps>[])
    .filter((child) => child.props.value !== undefined);
  const values = options.map((child) => child.props.value as string | number);
  const optionDisabled = options.map((child) => child.props.disabled === true);
  const activeIndex = value === undefined ? 0 : Math.max(0, values.indexOf(value));

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

  const valuesKey = `${values.join(" ")}|${optionDisabled.join(" ")}`;
  const itemProps = useCallback(
    (v: string | number) => {
      const i = values.indexOf(v);
      return i >= 0 ? getItemProps(i) : undefined;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getItemProps, valuesKey],
  );

  const ctx = useMemo<ChipGroupContextValue>(
    () => ({ value, select: (next) => setValue(next), disabled, itemProps: disabled ? undefined : itemProps, option }),
    [value, disabled, setValue, itemProps, option],
  );

  // The accessible name, on both the RN prop and its aria alias (RNW forwards neither on
  // its own; the kit's dual-a11y contract).
  const name = label ?? props.accessibilityLabel;
  const nameProps = name != null ? { accessibilityLabel: name, "aria-label": name } : {};
  const hasHeader = label != null || description != null;

  const group = (
    <View testID={hasHeader ? undefined : props.testID} role={RADIOGROUP} {...nameProps} style={[ROW, option ? OPTION_GAP : null, hasHeader ? null : [fill, props.style]]}>
      {props.children}
    </View>
  );

  return (
    <ChipGroupContext.Provider value={ctx}>
      {hasHeader ? (
        <View testID={props.testID} style={[HEADED, fill, props.style]}>
          <View style={HEADER}>
            {label != null ? <Text style={labelType(tokens)}>{label}</Text> : null}
            {description != null ? <Text style={descriptionType(tokens)}>{description}</Text> : null}
          </View>
          {group}
        </View>
      ) : group}
    </ChipGroupContext.Provider>
  );
}
