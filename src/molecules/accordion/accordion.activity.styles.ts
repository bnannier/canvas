import type { ViewStyle } from "react-native";
export const header = (compact: boolean): ViewStyle => ({ flexDirection: "row", gap: 14, alignItems: compact ? "flex-start" : "center", paddingVertical: 14, paddingHorizontal: compact ? 16 : 18 });
export const content = (compact: boolean): ViewStyle => ({ borderTopWidth: 1, paddingTop: 14, paddingRight: 18, paddingBottom: 16, paddingLeft: compact ? 16 : 68, gap: 10 });
export const disabled: ViewStyle = { opacity: 0.5 };

// Shared content anatomy: the original Argus geometry on every platform.
export const webSkin = { header, content, disabled };
export const iosSkin = webSkin;
export const androidSkin = webSkin;
