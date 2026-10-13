import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useMaterialTheme } from "./glass-surface/use-material-theme.js";
import { paneEdges, paneStyle } from "./glass-surface/glass-pane.js";
import { isGlass, withInnerFill } from "./glass-fill.js";
import { legibleInnerFill } from "./glass-surface/glass-wash.js";

/** Clear web editing surfaces; native fields retain their stable material. */
export function useTextEntryMaterial(webSkin: boolean) {
  const liquid = webSkin && Platform.OS === "web";
  const theme = useMaterialTheme({ static: !liquid, layer: "control" });
  const foregroundStateBorder = liquid && isGlass(theme);
  const paneProps = { static: !liquid, clear: liquid, layer: "control" as const };
  const stateBorder = (shape: StyleProp<ViewStyle>, active: boolean) => {
    if (!foregroundStateBorder || !active) return null;
    const flat = StyleSheet.flatten(shape) ?? {};
    const border = Object.fromEntries(Object.entries(flat).filter(([key]) => key.startsWith("border"))) as ViewStyle;
    return <View testID="text-entry-state-border" accessible={false} aria-hidden
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      // Under glass the host's resting border is padding (`paneStyle`), so its padding
      // box is its whole footprint: the stroke lies exactly where the solid border does,
      // in the shape's own radii, inside the box's clip so a grouped field can keep
      // overflow hidden.
      style={[border, StyleSheet.absoluteFill, { zIndex: 1, pointerEvents: "none" }]} />;
  };
  /**
   * A box that holds the field and paints its state border (a grouped field's box, the
   * Stepper's group): its surface `style`, the `border` overlay to render as its last
   * child, whether it keeps its border over the GlassPane it renders as its first (that
   * pane's `stateBorder`, `keepsBorder`), and how far its padding box reaches over its
   * border (`edges`, for an absolutely placed child). They answer
   * together, so the state is drawn exactly once: the clear web well draws it in the
   * overlay, over the material across the box's whole footprint; everywhere else the
   * overlay is null and the box keeps its state border over its pane (`paneStyle`), which
   * sits flush inside it. A field that is its own host (a bare Input, a Textarea) has no
   * child to draw an overlay with, so it keeps the border itself through `paneStyle`.
   */
  const stateSurface = (shape: StyleProp<ViewStyle>, active: boolean) => {
    const kept = active && !foregroundStateBorder;
    return {
      style: paneStyle(theme, shape, kept),
      border: stateBorder(shape, active),
      keepsBorder: kept,
      edges: paneEdges(theme, shape, kept),
    };
  };
  /**
   * The style of a fill inside the field that carries text (a prefix or suffix addon,
   * PhoneInput's country segment): under glass its opaque fill becomes the soft ink tint,
   * capped where the browser composites it so the text on it keeps 4.5:1 (`legibleInnerFill`,
   * the owner's GS-2 decision), and kept at the soft strength on a native host, whose frost
   * paints a body the tints do not predict and where the text measures 4.76:1 at full
   * strength in dark. In solid mode the style is returned as is.
   */
  const inkFill = (style: ViewStyle): ViewStyle => {
    if (!isGlass(theme) || style.backgroundColor == null) return style;
    if (Platform.OS !== "web") return withInnerFill(theme, style, "soft");
    return { ...style, backgroundColor: legibleInnerFill(theme, paneProps, "soft") };
  };
  return { theme, stateSurface, paneProps, inkFill };
}
