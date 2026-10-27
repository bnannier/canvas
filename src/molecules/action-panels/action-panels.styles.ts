import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, shape, statusColors } from "../../style/index.js";

// Co-located ActionPanel skins, one per platform. ActionPanel draws the Canvas v4
// hand-off's action panel (`K.def('action-panels')` in tools/v4/handoff/cv-kit-data.js,
// with its code-driven form for embedded content, cv-kit-code6.js `O('action-panels')`).
// Neither iOS nor Material 3 ships an action panel (PLATFORM-REFERENCES.md), so every
// platform draws the hand-off's panel and the native skins share the web skin's parts;
// the type takes the platform's own face from the text system.
//
//   The panel: an 18 px inset at the card corner on a 1 px `border` hairline over the
//   `card` fill, no shade. `destructive` washes it in the destructive soft fill under an
//   edge of the destructive colour at 35%, and inks the title in the error ink.
//   The copy: a 600 15 title over a 400 13 / 19.5 description in the muted ink, 4 apart.
//   Stacked (the default), the action sits 14 under the copy; `inline` (and `toggle`)
//   pins it beside the copy, centred, 16 apart, and the row wraps so the action drops
//   under the copy when the panel is too narrow for both (the copy's basis is 220).
//   Embedded content sits 14 under the copy in a 12 px rhythm; then the action closes the
//   panel on the right, over a 12 px inset under a `border` hairline.
//
// The action is the platform's own Button or Switch (parts injection, so the docs'
// three-up shows each platform's control): an outline Button, a destructive one in the
// danger zone, or with embedded content the primary one that commits it.

export type Tone = "destructive" | "neutral";
export type Layout = "inline" | "stacked";

// The contract a platform skin fulfills. The shell renders the panel, the copy block,
// the action and any embedded content; the skin maps the measures onto each piece.
export interface ActionPanelSkin {
  /** The panel: corner, hairline width, inset and the rhythm between its blocks. */
  container: ViewStyle;
  /** Title type (weight / size / line height). The tone color is supplied by shared. */
  titleType: TextStyle;
  /** Description type (size / line-height). The muted color is supplied by shared. */
  descriptionType: TextStyle;
  /** Vertical gap between the title and its consequence line. */
  copyGap: number;
  /** Gap between the copy and the pinned action in the inline/toggle row. */
  inlineGap: number;
  /** The copy's flex basis in the inline row: below it the action wraps under the copy. */
  inlineCopyBasis: number;
  /** Vertical gap between the blocks of embedded content. */
  contentGap: number;
  /** The closing action row under embedded content: its inset and hairline width. */
  footer: ViewStyle;
  /** Cross-axis alignment of the pinned action against the copy block in the inline row. */
  inlineAlign: ViewStyle["alignItems"];
}

/** The danger-zone title is the error ink (text-grade on the wash); the neutral one the card ink. */
export function titleColor(tokens: ColorTokens, tone: Tone): string {
  return tone === "destructive" ? statusColors(tokens, "error").ink : tokens["card-foreground"];
}

/** The panel's fill and edge per tone. */
export function panelColor(tokens: ColorTokens, tone: Tone): ViewStyle {
  return tone === "destructive"
    ? { backgroundColor: statusColors(tokens, "error").wash, borderColor: alpha(tokens.destructive, 0.35) }
    : { backgroundColor: tokens.card, borderColor: tokens.border };
}

/** The glass pane's under-fill: the danger zone keeps its wash; the neutral panel takes the layer's own. */
export function panelTint(tokens: ColorTokens, tone: Tone): string | undefined {
  return tone === "destructive" ? statusColors(tokens, "error").wash : undefined;
}

/** The hairline over the closing action row. */
export function footerColor(tokens: ColorTokens): ViewStyle {
  return { borderTopColor: tokens.border };
}

// ---------- Web: the hand-off's panel ----------
export const webSkin: ActionPanelSkin = {
  container: { borderRadius: shape.web.card, borderWidth: 1, padding: 18, gap: 14 },
  titleType: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  descriptionType: { fontSize: 13, lineHeight: 19.5, fontWeight: "400" },
  copyGap: 4,
  inlineGap: 16,
  inlineCopyBasis: 220,
  contentGap: 12,
  footer: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 12, borderTopWidth: 1 },
  inlineAlign: "center",
};

/** iOS: no native action panel; the web skin's parts, in SF Pro. */
export const iosSkin: ActionPanelSkin = webSkin;

/** Android: no Material 3 action panel; the web skin's parts, in Roboto. */
export const androidSkin: ActionPanelSkin = webSkin;
