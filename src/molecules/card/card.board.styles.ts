import type { ImageStyle } from "react-native";
import type { ColorTokens, TextStyle, ViewStyle } from "../../style/index.js";

// One fixed body for every board ticket; the metadata spacer and progress keep their slots.
export const body: ViewStyle = { gap: 6, minWidth: 0 };
export const header: ViewStyle = { gap: 4, minWidth: 0 };
export const numberRow: ViewStyle = { height: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };
export const number: ViewStyle = { flex: 1, minWidth: 0, overflow: "hidden" };
export const move: ViewStyle = { flexShrink: 0, height: 24, justifyContent: "center" };
export const single: ViewStyle = { height: 18, minWidth: 0, overflow: "hidden" };
export const titleSlot: ViewStyle = { height: 40, minWidth: 0, overflow: "hidden" };
export const descriptionSlot: ViewStyle = { height: 36, minWidth: 0, overflow: "hidden" };
export const imageHeader: ViewStyle = { height: 176, overflow: "hidden" };
export const image: ImageStyle = { position: "absolute", width: "100%", height: "100%" };
export const overlay: ViewStyle = { position: "absolute", left: 8, right: 8, top: 8, padding: 6, borderRadius: 6 };
export const progressRow: ViewStyle = { flexDirection: "row", alignItems: "center", height: 18, overflow: "hidden" };
export const character: ViewStyle = { position: "relative" };
export const highlight: ViewStyle = { position: "absolute", top: 0, left: 0 };
export const dots: ViewStyle = { width: 15, height: 18 };

export const label = (t: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 18, color: t["muted-foreground"] });
export const priority = (t: ColorTokens, value?: string): TextStyle => {
  const name = value?.trim().toLowerCase();
  const color = name === "critical" || name === "high" ? t["destructive-text"] ?? t.destructive
    : name === "medium" ? t["warning-text"] ?? t.warning : t["muted-foreground"];
  return { ...label(t), color, fontWeight: "600" };
};
export const key = (t: ColorTokens): TextStyle => ({ ...label(t), fontWeight: "600", color: t["card-foreground"] });
export const title = (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", color: t["card-foreground"] });
export const description = (t: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 18, color: t["muted-foreground"] });
export const reason = (t: ColorTokens): TextStyle => ({ ...label(t), color: t["warning-text"] ?? t.warning });
