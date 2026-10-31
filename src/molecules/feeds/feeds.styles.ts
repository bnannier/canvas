import { tabularNums } from "../../style/numerals.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, surfaceRipple, shape } from "../../style/index.js";
import { type FeedSkin } from "./feeds.shared.js";
import { MONO_FONT } from "../../style/mono.js";

// Co-located Feed skins, one per platform. Feed takes the Canvas v4 hand-off's feed
// (`K.def('feeds')` in tools/v4/handoff/cv-kit-data.js, with its code-driven form in
// cv-kit-code3.js `O('feeds')`) inside the kit's card: ONE structure (a card surface
// framing connector-node rows or avatar rows, an actor/action line over a timestamp)
// shared across every OS. Feed uses one static content frame in glass mode and the
// opaque tokens.card fill for its solid fallback; rows inherit the shared frame.
// Neither iOS nor Android ships an activity feed (PLATFORM-REFERENCES.md), so the native
// skins draw the web parts in the platform's face, with the platform's press feedback
// and minimum row height:
//
//   The card: the card corner on a 1px `border` hairline over the `card` fill, 24 in
//     (20 compact). A row leads with its node: the 28px avatar on the avatar lead, an
//     item's glyph on a 28px `secondary` disc in the muted ink, otherwise a 10px dot
//     (the first in the accent); a 1px `field-border` line runs down from the node to
//     the next row, 16 below (10 compact). The line is 400 13/19: the actor 600 in the
//     foreground, the action in the muted ink; the timestamp 400 12 in the subtle ink,
//     2 under it. Pressed rows dim to 0.7 on the web.

// --- shared layout fragments (identical across platforms) -------------------

// The content column wrapper (flex-1).
export const contentColumn: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The connector content column (flex-1 pt-0.5): nudged down to align with the node.
export const connectorContentColumn: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  paddingTop: 2,
};

// Connector row base (relative flex-row gap-3).
export const connectorRow: ViewStyle = { position: "relative", flexDirection: "row", gap: 12 };

// ---------- Web ----------
const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];
export const webSkin: FeedSkin = {
  cardSurface: (t) => ({
    width: "100%",
    borderRadius: shape.web.card,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
    overflow: "hidden",
  }),
  // Connector surface padding by density.
  connectorPad: (compact) => ({ padding: compact ? 20 : 24 }),
  // Inter-row vertical rhythm by density (the hand-off's 16 / 10).
  connectorRowGap: (compact) => ({ paddingBottom: compact ? 10 : 16 }),
  // The glyph node: a 28px disc on the secondary fill.
  node: (t) => ({
    height: 28,
    width: 28,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: t.secondary,
  }),
  // A glyph-less event's node: a 10px dot centered in the 28 column, beside the first
  // line, the first in the accent and the rest on the raised fill. The hand-off rings it
  // in the page colour to part it from the line; here the line starts below the dot, and
  // a ring in the page colour would show as a disc on the card.
  dot: (t, first) => ({
    width: 10,
    height: 10,
    marginVertical: 5,
    marginHorizontal: 9,
    flexShrink: 0,
    borderRadius: 9999,
    backgroundColor: first ? t.primary : t["surface-raised"] ?? t.secondary,
  }),
  // The connector line under the node center (node 28 wide -> 14 center, -0.5 -> 13),
  // starting 2 under the disc, in the field boundary.
  connectorLine: (t) => ({ position: "absolute", bottom: 0, start: 13, top: 30, width: 1, backgroundColor: t["field-border"] ?? t.border }),
  lineText: { fontSize: 13, lineHeight: 19 },
  actorLabel: (t) => ({ fontSize: 13, lineHeight: 19, fontWeight: "600", color: t.foreground }),
  actionLabel: (t) => ({ fontSize: 13, lineHeight: 19, color: t["muted-foreground"] }),
  timeLabel: (t) => ({ marginTop: 2, fontSize: 12, lineHeight: 16, color: subtle(t) }),
  pressedOpacity: 0.7,
  ripple: null,
  // Web pointer input has no finger-target minimum; keep the row layout as-is.
  minTarget: 0,
};

// ---------- iOS: the web parts in SF Pro, the list-row dim, 44pt rows ----------
export const iosSkin: FeedSkin = {
  ...webSkin,
  pressedOpacity: 0.8,
  // HIG minimum interactive target (floors the short final connector row up to 44pt).
  minTarget: 44,
};

// ---------- Android: the web parts in Roboto, the ripple, 48dp rows ----------
export const androidSkin: FeedSkin = {
  ...webSkin,
  pressedOpacity: null,
  ripple: (t) => surfaceRipple(t),
  // M3 minimum touch target (floors the short final connector row up to 48dp).
  minTarget: 48,
};


// The activity and trace rows are unframed content in their owning panel: the hand-off's
// 400 13/19 line, its time the 400 12 mono caption in the subtle ink, a trace's kind the
// 11px mono eyebrow.
export const activityRow = (t: ColorTokens): ViewStyle => ({ flexDirection: "row", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: t.border, alignItems: "flex-start" });
export const activityTime = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 12, fontWeight: "400", lineHeight: 19, color: subtle(t), ...tabularNums(), width: 44 });
export const activityText = (t: ColorTokens): TextStyle => ({ flex: 1, fontSize: 13, fontWeight: "400", lineHeight: 19, color: t.foreground });
export const activityEventRow: ViewStyle = { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingBottom: 10 };
export const activityEventContent: ViewStyle = { flex: 1, minWidth: 0, flexDirection: "row", justifyContent: "space-between", gap: 12 };
export const activityEventTime = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 12, fontWeight: "400", lineHeight: 19, color: subtle(t), flexShrink: 0, ...tabularNums() });
export const traceRow = (time?: string): ViewStyle => ({ flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: time ? 5 : 6 });
export const traceTime = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 12, fontWeight: "400", lineHeight: 19, color: subtle(t), ...tabularNums(), width: 44 });
export const traceMarkerSlot = (hasTime: boolean): ViewStyle => ({ width: hasTime ? 12 : 14, alignItems: "flex-start" });
export const traceMarker = (color: string, halo?: string): ViewStyle => ({ width: 10, height: 10, borderRadius: 9999, marginTop: 4, backgroundColor: color, boxShadow: halo ? `0 0 0 3px ${halo}` : undefined });
export const traceText = (t: ColorTokens): TextStyle => ({ flex: 1, fontSize: 13, fontWeight: "400", lineHeight: 19, color: t.foreground });
export const traceKind = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 11, fontWeight: "500", lineHeight: 19, textTransform: "uppercase", letterSpacing: 0.88, color: subtle(t) });
