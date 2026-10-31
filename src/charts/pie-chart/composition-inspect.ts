import type { ViewProps } from "react-native";

/** Arrow-key and native accessibility navigation for a chart's ordered marks. */
export function compositionInspectProps(length: number, selected: number | null, select: (index: number | null) => void): ViewProps {
  const step = (delta: number) => select(length ? ((selected ?? (delta > 0 ? -1 : 0)) + delta + length) % length : null);
  return {
    focusable: length > 0,
    accessibilityHint: "Use arrow keys to inspect values; Escape clears the selection.",
    accessibilityActions: [{ name: "increment" }, { name: "decrement" }, { name: "escape" }],
    onAccessibilityAction: (event) => {
      if (event.nativeEvent.actionName === "increment") step(1);
      else if (event.nativeEvent.actionName === "decrement") step(-1);
      else if (event.nativeEvent.actionName === "escape") select(null);
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") step(1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") step(-1);
      else if (event.key === "Home") select(length ? 0 : null);
      else if (event.key === "End") select(length ? length - 1 : null);
      else if (event.key === "Escape") select(null);
      else return;
      event.preventDefault();
    },
  } as ViewProps;
}
