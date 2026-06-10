import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Feed styles. Layout-only fragments are static objects; anything that
// reads a color is a function of the active tokens (so the card surface, node
// fill, and divider follow light/dark and read as glass when the ThemeProvider's
// surface is "glass", since tokens.card is swapped translucent at the theming
// level). Grouped by axis: shared surface, the avatar lead, and the connector lead.

export type Lead = "connector" | "avatar";

// --- shared surface ---------------------------------------------------------

// The card surface framing the feed (mirrors the docs cardCls):
// w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return {
    width: "100%",
    maxWidth: 560,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    overflow: "hidden",
  };
}

// --- shared content column --------------------------------------------------

// The content column wrapper (flex-1).
export const contentColumn: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The outer line wrapping actor + action + target (text-sm).
export const lineText: TextStyle = { fontSize: 14, lineHeight: 20 };

// The actor name, rendered bold (text-sm font-medium text-foreground).
export function actorLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground };
}

// The action / target text, muted (text-sm text-muted-foreground).
export function actionLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// The relative timestamp, muted and small (text-xs text-muted-foreground mt-0.5).
export function timeLabel(tokens: ColorTokens): TextStyle {
  return { marginTop: 2, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// --- avatar lead ------------------------------------------------------------

// Avatar row base (flex-row items-start gap-3) + density-driven padding.
export const avatarRow: ViewStyle = { flexDirection: "row", alignItems: "flex-start", gap: 12 };

// Row padding by density: compact (px-5 py-3) vs default (px-5 py-4).
export function avatarRowPad(compact: boolean): ViewStyle {
  return { paddingHorizontal: 20, paddingVertical: compact ? 12 : 16 };
}

// The hairline rule between avatar rows (border-b border-border); omitted on last.
export function avatarDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// --- connector lead ---------------------------------------------------------

// Connector surface padding by density: compact (p-5) vs default (p-6).
export function connectorPad(compact: boolean): ViewStyle {
  return { padding: compact ? 20 : 24 };
}

// Connector row base (relative flex-row gap-3).
export const connectorRow: ViewStyle = { position: "relative", flexDirection: "row", gap: 12 };

// Inter-row vertical rhythm by density: compact (pb-4) vs default (pb-6).
export function connectorRowGap(compact: boolean): ViewStyle {
  return { paddingBottom: compact ? 16 : 24 };
}

// The vertical connector line (absolute bottom-0 left-[13px] top-7 w-px bg-border):
// a 1px border-colored line under the node's horizontal center, dropped on the last row.
export function connectorLine(tokens: ColorTokens): ViewStyle {
  return { position: "absolute", bottom: 0, left: 13, top: 28, width: 1, backgroundColor: tokens.border };
}

// The leading node for the connector variant (h-7 w-7 shrink-0 items-center
// justify-center rounded-full border border-border bg-card): a small bordered
// circle carrying the actor's initials, sized to sit on the connector line.
export function node(tokens: ColorTokens): ViewStyle {
  return {
    height: 28,
    width: 28,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
  };
}

// The node's initials (text-xs font-medium text-muted-foreground).
export function nodeInitials(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] };
}

// The node's actor-less dot (h-1.5 w-1.5 rounded-full bg-muted-foreground).
export function nodeDot(tokens: ColorTokens): ViewStyle {
  return { height: 6, width: 6, borderRadius: 9999, backgroundColor: tokens["muted-foreground"] };
}

// The connector content column (flex-1 pt-0.5): nudged down to align with the node.
export const connectorContentColumn: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  paddingTop: 2,
};
