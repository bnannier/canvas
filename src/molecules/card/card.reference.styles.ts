import type { ViewStyle } from "react-native";
import { shape } from "../../style/tokens.js";
import { platformShape } from "../../style/platform-shape.js";
import type { ReferenceMode } from "./card.reference.js";

export function referenceBox(mode: ReferenceMode): ViewStyle {
  if (mode === "detail") return { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: shape.web.tile };
  if (mode === "tile") return { gap: 3, paddingVertical: 8, paddingHorizontal: 10, borderRadius: platformShape.web.referenceCard };
  const inset: ViewStyle = { paddingVertical: 4, paddingLeft: 4, paddingRight: 8, marginLeft: -4, borderRadius: shape.web.control };
  if (mode === "stacked") return { ...inset, gap: 4, alignSelf: "stretch" };
  return { ...inset, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", maxWidth: "100%" };
}
export const detailCopy: ViewStyle = { flex: 1, minWidth: 0, gap: 0 };
export const source: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };
export const tileHeader: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 6 };
export const stackedHeader: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };
