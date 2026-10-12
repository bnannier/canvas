import { Platform, type AccessibilityProps } from "react-native";

type StepperAccessibility = {
  group: AccessibilityProps;
  field: AccessibilityProps;
};

/** Choose accessibility metadata for the runtime, independently of the skin.
 * The RN tree stays identical. Native keeps its adjustable View and action
 * handlers; the browser's editable number is a spinbutton inside a plain group.
 * A universal role="spinbutton" would override iOS's adjustable trait, and
 * moving its actions to TextInput would change their native recipient. The
 * required state is not here: React Native has no native required state, so
 * natively the group's and the field's name carry it (`requiredName`), and the
 * web's numeric field takes `aria-required` from the shell. */
export function stepperAccessibility({ min, max, current, disabled, onAccessibilityAction }: {
  min: number;
  max: number;
  current: number;
  disabled: boolean;
  onAccessibilityAction: NonNullable<AccessibilityProps["onAccessibilityAction"]>;
}): StepperAccessibility {
  const numeric: AccessibilityProps = {
    accessibilityValue: { min, max, now: current },
    "aria-valuenow": current,
    "aria-valuemin": min,
    "aria-valuemax": max,
    accessibilityState: { disabled },
    "aria-disabled": disabled,
  };
  return Platform.select<StepperAccessibility>({
    web: {
      group: { role: "group" },
      field: { ...numeric, role: "spinbutton", accessibilityRole: "spinbutton" },
    },
    default: {
      group: {
        ...numeric,
        accessibilityRole: "adjustable",
        accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
        onAccessibilityAction,
      },
      field: {},
    },
  });
}
