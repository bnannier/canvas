import { type ViewStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Edge the panel is anchored to. `left`/`right` are full-height side drawers; `bottom`
// is a sheet that spans the width and rises from the bottom.
export type Edge = "left" | "right" | "bottom";

// The full-screen scrim that fills the Modal and lays the panel against its edge. A tap
// on it (wired in the component) dismisses the drawer.
export function scrim(edge: Edge): ViewStyle {
  const base: ViewStyle = { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" };
  if (edge === "bottom") return { ...base, flexDirection: "column", justifyContent: "flex-end" };
  return { ...base, flexDirection: "row", justifyContent: edge === "right" ? "flex-end" : "flex-start" };
}

// The panel positioner: a Pressable that catches taps so a press inside the panel does
// not fall through to the scrim. Side drawers fill the height; the sheet fills the width.
export const panelPos: Record<Edge, ViewStyle> = {
  left: { height: "100%" },
  right: { height: "100%" },
  bottom: { width: "100%" },
};

// The panel surface shape: the edge geometry, a hairline border on the inner edge, and a
// rounded top for the sheet. The fill is the SOLID card token, not a glass material: a
// full-screen drawer sits directly over page content, so a translucent panel would bleed
// the content through (most visibly on platforms without a real backdrop blur). An opaque
// panel keeps it legible. Side widths come from the `width` prop.
export function panelShape(edge: Edge, width: number, tokens: ColorTokens): ViewStyle {
  const base: ViewStyle = { backgroundColor: tokens.card, overflow: "hidden" };
  if (edge === "bottom") {
    return {
      ...base,
      width: "100%",
      maxHeight: "85%",
      borderTopWidth: 1,
      borderColor: tokens.border,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    };
  }
  return {
    ...base,
    width,
    height: "100%",
    borderColor: tokens.border,
    ...(edge === "right" ? { borderLeftWidth: 1 } : { borderRightWidth: 1 }),
  };
}
