import { type ReactNode } from "react";
import { type Role } from "react-native";
import { View, useControllableState, type StyleProp, type ViewStyle } from "../../style/index.js";
import { RadioGroupContext } from "./radio-context.js";

// RadioGroup is a structural (skin-free) atom: it draws no chrome of its own (the
// child Radios carry every visual), so there is a single shared implementation
// across iOS / Android / web. It owns the group's single-select state and hands
// it to the child `<Radio value="…">` controls through RadioGroupContext, so a
// bare group is interactive out of the box: exactly one option is chosen and
// pressing another moves the selection. Controlled via `value`, uncontrolled via
// `defaultValue` (the standard controllable-state contract, matching Tabs/Switch).

// RN's Role union omits "radiogroup" (it is a valid ARIA role), so cast it once.
const RADIOGROUP = "radiogroup" as Role;

// Default column stack and the optional row layout. Defined here (component
// internals) the way Radio defines its own row; this is not a call-site restyle.
const COLUMN: ViewStyle = { flexDirection: "column", gap: 12 };
const ROW: ViewStyle = { flexDirection: "row", flexWrap: "wrap", rowGap: 12, columnGap: 20 };

export interface RadioGroupProps {
  /** The selected option's value (CONTROLLED). Omit for uncontrolled use. */
  value?: string | number;
  /** Initial selected value for uncontrolled use (a bare group selects on press). */
  defaultValue?: string | number;
  /** Fired with the newly selected option's value. */
  onChange?: (value: string | number) => void;
  /** Disable every radio in the group. */
  disabled?: boolean;
  /** Lay the options out in a wrapping row instead of the default column. */
  row?: boolean;
  /** The `<Radio value="…">` options that make up the group. */
  children?: ReactNode;
  /** E2E hook forwarded to the group container. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

/**
 * A group of Radio options with single-select state. Wrap `<Radio value="…">`
 * children in it; the group tracks which value is chosen and moves the selection
 * on press. Pass `value` + `onChange` to control it, or `defaultValue` (or
 * nothing) to let it manage its own selection.
 */
export function RadioGroup(props: RadioGroupProps) {
  const [value, setValue] = useControllableState<string | number | undefined>(
    props.value,
    props.defaultValue,
    (next) => {
      if (next !== undefined) props.onChange?.(next);
    },
  );
  return (
    <RadioGroupContext.Provider
      value={{
        value,
        select: (next) => setValue(next),
        disabled: props.disabled,
      }}
    >
      <View testID={props.testID} role={RADIOGROUP} style={[props.row ? ROW : COLUMN, props.style]}>
        {props.children}
      </View>
    </RadioGroupContext.Provider>
  );
}
