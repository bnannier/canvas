import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useMaterialTheme } from "./glass-surface/use-material-theme.js";
import { paneStyle } from "./glass-surface/glass-pane.js";
import { isGlass } from "./glass-fill.js";

/** Clear web editing surfaces; native fields retain their stable material. */
export function useTextEntryMaterial(webSkin: boolean) {
  const liquid = webSkin && Platform.OS === "web";
  const theme = useMaterialTheme({ static: !liquid, layer: "control" });
  const foregroundStateBorder = liquid && isGlass(theme);
  const stateBorder = (shape: StyleProp<ViewStyle>, active: boolean) => {
    if (!foregroundStateBorder || !active) return null;
    const flat = StyleSheet.flatten(shape) ?? {};
    const border = Object.fromEntries(Object.entries(flat).filter(([key]) => key.startsWith("border"))) as ViewStyle;
    const width = flat.borderWidth ?? 0;
    for (const [key, value] of Object.entries(border)) {
      if (key.endsWith("Radius") && typeof value === "number") {
        (border as Record<string, unknown>)[key] = Math.max(0, value - width);
      }
    }
    return <View testID="text-entry-state-border" accessible={false} aria-hidden
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      // The host retains its transparent layout border. Inset the state stroke
      // inside its padding clip so grouped fields can keep overflow hidden.
      style={[border, StyleSheet.absoluteFill, { zIndex: 1, pointerEvents: "none" }]} />;
  };
  /**
   * A box that holds the field and paints its state border (a grouped field's box, the
   * Stepper's group): its surface `style`, and the `border` overlay to render as its last
   * child. They answer together, so the state is drawn exactly once: the clear web well
   * draws it in the overlay and the box keeps only its transparent layout border there;
   * everywhere else the overlay is null and the box keeps its state border over its pane
   * (`paneStyle`). A field that is its own host (a bare Input, a Textarea) has no child
   * to draw an overlay with, so it keeps the border itself through `paneStyle`.
   */
  const stateSurface = (shape: StyleProp<ViewStyle>, active: boolean) => ({
    style: paneStyle(theme, shape, active && !foregroundStateBorder),
    border: stateBorder(shape, active),
  });
  return {
    theme, stateSurface,
    paneProps: { static: !liquid, clear: liquid, layer: "control" as const },
  };
}
