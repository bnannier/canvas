import { Platform, type AccessibilityProps } from "react-native";

type DayAccessibility = AccessibilityProps & { "aria-pressed"?: boolean };

/** A day remains a button on every runtime. Web buttons expose pressed state;
 * native keeps the selected trait. The runtime, not the preview skin, chooses
 * the metadata so native skin previews also produce valid browser buttons. */
export function calendarDayAccessibility(selected: boolean): DayAccessibility {
  return Platform.select<DayAccessibility>({
    web: { "aria-pressed": selected },
    default: { accessibilityState: { selected } },
  });
}
