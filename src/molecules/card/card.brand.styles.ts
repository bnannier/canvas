import type { TextStyle, ViewStyle } from "react-native";
import { shape } from "../../style/tokens.js";

// The featured and promotional cards' anatomy, the hand-off's (cv-kit-code.js
// `O('card')`): a 20px inset (14 compact) with a 12px rhythm (8 compact), the eyebrow row,
// a head of identity disc, title and description 12px apart, the body, the caption and
// metadata lines, and the actions at the end. The corner is the Card skin's.

export const frame: ViewStyle = { position: "relative" };
export const surface = (compact: boolean): ViewStyle => ({ borderWidth: 1, padding: compact ? 14 : 20, gap: compact ? 8 : 12, overflow: "hidden" });
// The second card behind a stacked one: 8px down and in, under the first.
export const stack: ViewStyle = { position: "absolute", top: 8, right: -8, bottom: -8, left: 8, borderWidth: 1 };
export const topRow: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };
export const head: ViewStyle = { flexDirection: "row", gap: 12, alignItems: "center" };
export const headTop: ViewStyle = { alignItems: "flex-start" };
export const headCopy: ViewStyle = { flex: 1, minWidth: 0, gap: 4 };
export const compactTitle: TextStyle = { fontSize: 17, lineHeight: 20 };
export const meta: ViewStyle = { gap: 4 };
export const actions: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" };

// The artwork alone fills the bounds its parent gives it, under a hairline.
export const artwork: ViewStyle = { flex: 1, minHeight: 100, borderWidth: 1, borderRadius: shape.web.card, overflow: "hidden" };
// Artwork around an identity keeps the original insets.
export const illustration: ViewStyle = { padding: 12, borderWidth: 1, borderRadius: shape.web.card, overflow: "hidden" };
export const controls: ViewStyle = { padding: 16, borderWidth: 1, borderRadius: shape.web.card, overflow: "hidden" };

// Shared content anatomy on every platform.
export const webSkin = { frame, surface, stack, topRow, head, headTop, headCopy, compactTitle, meta, actions, artwork, illustration, controls };
export const iosSkin = webSkin;
export const androidSkin = webSkin;
