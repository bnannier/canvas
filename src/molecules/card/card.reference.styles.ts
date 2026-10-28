import type { TextStyle, ViewStyle } from "react-native";
import { shadow, shape, type ColorTokens } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import type { ReferenceMode } from "./card.reference.js";

// The hand-off's Jira-style reference looks (cv-kit-code3.js, `card` with a reference
// prop): every mode is a hairline box on the card surface with the small resting shadow,
// the key in the accent's mono ink, the summary in the interface face and the status in
// the subtle ink. No platform ships a control for the job, so the look is the same on
// every platform (design language item 4).
//   inline    a 36 px pill row: the open glyph, the key, the summary, "·" and the status
//   stacked   the default box, up to 320 wide: key, summary, status, 4 apart
//   tile      a 180 by 120 tile: the key at the top, the summary at the bottom
//   detail    up to 360 wide: a source chip beside the key, then summary and status
export function referenceBox(mode: ReferenceMode, tokens: ColorTokens): ViewStyle {
  const box: ViewStyle = { borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, ...shadow("DEFAULT", tokens) };
  if (mode === "inline") return { ...box, flexDirection: "row", alignItems: "center", gap: 10, height: 36, paddingHorizontal: 12, borderRadius: shape.web.control, alignSelf: "flex-start", maxWidth: "100%" };
  // A fixed tile, as the hand-off draws it; it gives way rather than overflow a narrower parent.
  if (mode === "tile") return { ...box, width: 180, height: 120, flexShrink: 1, minWidth: 0, padding: 12, borderRadius: shape.web.tile, justifyContent: "space-between" };
  if (mode === "detail") return { ...box, width: "100%", maxWidth: 360, paddingVertical: 14, paddingHorizontal: 16, borderRadius: platformShape.web.referenceCard, gap: 6 };
  return { ...box, width: "100%", maxWidth: 320, paddingVertical: 12, paddingHorizontal: 14, borderRadius: shape.web.tile, gap: 4 };
}
export const detailHead: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };
export const sourceChip = (tokens: ColorTokens): ViewStyle => ({ height: 20, paddingHorizontal: 7, borderRadius: platformShape.web.referenceSource, justifyContent: "center", backgroundColor: tokens.secondary });

export const key = (tokens: ColorTokens, fontFamily: string): TextStyle => ({ fontFamily, fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["primary-text"] ?? tokens.primary });
export const summary = (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 19, fontWeight: "500", color: tokens.foreground });
export const status = (tokens: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 17, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] });
export const source = (tokens: ColorTokens): TextStyle => ({ fontSize: 11, lineHeight: 14, fontWeight: "500", color: tokens["muted-foreground"] });
// The inline row keeps its glyph, key and status whole and lets the summary give way.
export const inlineSummary: TextStyle = { flexShrink: 1 };
export const inlineFixed: TextStyle = { flexShrink: 0 };

export const webSkin = { referenceBox, detailHead, sourceChip, key, summary, status, source, inlineSummary, inlineFixed };
export const iosSkin = webSkin;
export const androidSkin = webSkin;
