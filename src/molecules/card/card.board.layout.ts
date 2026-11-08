import type { ImageStyle } from "react-native";
import { platformShape } from "../../style/platform-shape.js";
import type { ColorTokens, TextStyle, ViewStyle } from "../../style/index.js";

// One fixed body for every board ticket; the metadata row and progress keep their slots.
export const body: ViewStyle = { gap: 6, minWidth: 0 };
export const header: ViewStyle = { gap: 4, minWidth: 0 };
export const numberRow: ViewStyle = { height: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };
export const number: ViewStyle = { flex: 1, minWidth: 0, overflow: "hidden" };
export const move: ViewStyle = { flexShrink: 0, height: 24, justifyContent: "center" };
export const single: ViewStyle = { height: 18, minWidth: 0, overflow: "hidden" };
// Badge small is 18 px on web and both native skins. Keep its complete pill visible.
export const badgeSlot: ViewStyle = { height: 18, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 6, overflow: "hidden" };
// The notice is the last pill and the only one that gives way when the row is full.
export const notice: ViewStyle = { flexShrink: 1, minWidth: 0 };
export const titleSlot: ViewStyle = { height: 40, minWidth: 0, overflow: "hidden" };
export const descriptionSlot: ViewStyle = { height: 36, minWidth: 0, overflow: "hidden" };
export const imageHeader: ViewStyle = { height: 176, overflow: "hidden" };
export const image: ImageStyle = { position: "absolute", width: "100%", height: "100%" };
export const overlay: ViewStyle = { position: "absolute", left: 8, right: 8, top: 8, padding: 6, borderRadius: platformShape.web.boardMetadata };
export const progressRow: ViewStyle = { flexDirection: "row", alignItems: "center", height: 18, overflow: "hidden" };
export const character: ViewStyle = { position: "relative" };
export const highlight: ViewStyle = { position: "absolute", top: 0, left: 0 };
export const dots: ViewStyle = { width: 15, height: 18 };

export const label = (t: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 18, color: t["muted-foreground"] });
export const key = (t: ColorTokens): TextStyle => ({ ...label(t), fontWeight: "600", color: t["card-foreground"] });
export const title = (t: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, fontWeight: "600", color: t["card-foreground"] });
export const description = (t: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 18, color: t["muted-foreground"] });
export const reason = (t: ColorTokens): TextStyle => ({ ...label(t), color: t["warning-text"] ?? t.warning });
