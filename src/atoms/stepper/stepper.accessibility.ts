import { Platform, type AccessibilityProps } from "react-native";

type StepperAccessibility = {
  group: AccessibilityProps & { "aria-required"?: boolean };
  field: AccessibilityProps;
};

/** Choose accessibility metadata for the runtime, independently of the skin.
 * The RN tree stays identical. Native keeps its adjustable View and action
 * handlers; the browser's editable number is a spinbutton inside a plain group.
 * A universal role="spinbutton" would override iOS's adjustable trait, and
 * moving its actions to TextInput would change their native recipient. */
export function stepperAccessibility({ min, max, current, disabled, required, onAccessibilityAction }: {
  min: number;
  max: number;
  current: number;
  disabled: boolean;
  required: boolean | undefined;
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
        "aria-required": required || undefined,
        accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
        onAccessibilityAction,
      },
      field: {},
    },
  });
}
