import type { TextStyle, ViewStyle } from "react-native";
import { shape } from "../../style/tokens.js";

export const frame: ViewStyle = { borderRadius: shape.web.card };
export const featured = (stacked: boolean): ViewStyle => ({ borderRadius: shape.web.card, flexDirection: stacked ? "column" : "row", minHeight: 136, overflow: "hidden" });
export const media = (stacked: boolean): ViewStyle => ({ ...(stacked ? { height: 96 } : { width: 128 }), alignItems: "center", justifyContent: "center", overflow: "hidden" });
export const mediaOrb: ViewStyle = { position: "absolute", right: -30, bottom: -30, width: 110, height: 110, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.14)" };
export const body: ViewStyle = { flexDirection: "row", flex: 1, minWidth: 0, flexWrap: "wrap", alignItems: "center" };
export const copy: ViewStyle = { flexDirection: "column", gap: 6, justifyContent: "center", flexGrow: 1, flexBasis: 308, minWidth: 0, paddingVertical: 22, paddingHorizontal: 24 };
export const trailing: ViewStyle = { flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginLeft: "auto", paddingVertical: 20, paddingHorizontal: 22 };
export const stackedCopy: ViewStyle = { flexDirection: "column", gap: 10, padding: 18 };
export const nameRow: ViewStyle = { flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" };
export const stackedFooter: ViewStyle = { flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" };
export const promo: ViewStyle = { borderRadius: shape.web.card, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 20, overflow: "hidden" };
export const promoOrb: ViewStyle = { position: "absolute", right: -40, bottom: -50, width: 150, height: 150, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.14)" };

export const artwork: ViewStyle = { flex: 1, borderRadius: shape.web.card, overflow: "hidden" };

export const illustration: ViewStyle = { padding: 12, borderRadius: shape.web.card, overflow: "hidden" };
// The original Argus promotional heading keeps its internal 200px reading measure.
export const promoTitle: TextStyle = { maxWidth: 200 };

export const controls: ViewStyle = { padding: 16, borderRadius: shape.web.card, overflow: "hidden" };

// Shared content anatomy: the original Argus geometry on every platform.
export const webSkin = { frame, featured, media, mediaOrb, body, copy, trailing, stackedCopy, nameRow, stackedFooter, promo, promoOrb, artwork, illustration, promoTitle, controls };
export const iosSkin = webSkin;
export const androidSkin = webSkin;
