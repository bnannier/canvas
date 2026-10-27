import { type ViewStyle, type TextStyle } from "react-native";
import { statusColors, shadow, alpha, surfaceRipple, tabularNums, shape, type ColorTokens } from "../../style/index.js";
import { DISPLAY_FONT, MONO_FONT } from "../../style/mono.js";
import { SPARK_STRIP_HEIGHT } from "../../charts/sparkline/sparkline.styles.js";
import { type StatsSkin } from "./stats.shared.js";

// Co-located Stats skins, one per platform. Stats takes the Canvas v4 hand-off's stat tiles
// (`K.def('stats')` in tools/v4/handoff/cv-kit-data.js, with its code-driven form in
// cv-kit-code3.js `O('stats')`). Neither iOS nor Android ships a stat-tile control
// (PLATFORM-REFERENCES.md), so every platform draws the hand-off's tile and the native skins
// share the web skin's parts, differing only in the face (the value in the platform's own
// face rather than the display face) and the press feedback (a dim on iOS, the ripple on
// Android). The semantic delta tone lives once in stats.shared.tsx.
//
//   Tile (the default): the `card` fill on a 1 px `border` hairline at the card corner
//     under the small shadow, an 18 inset (12 compact), its lines 6 apart; tiles 12 apart.
//   Plain: one bordered `card` surface at the card corner with no shadow, the tiles set
//     edge to edge inside it, each after the first behind a 1 px `border` rule.
//   Label: 500 12 in the subtle ink. Value: 600 28 (20 compact, 36 large), tracked -0.02em,
//     tabular, in the display face on the web. Delta: 500 12 mono, the success or error
//     ink, the subtle ink when steady. Title: 500 15, 10 above the tiles.

export type Surface = "card" | "plain";

// A wrapping row: items flow left to right and wrap to the next line when they
// run out of room (flex-row flex-wrap). Identical on every platform.
export const row: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// --- semantic / platform-neutral pieces (shared by every skin) --------------

// Per-item minimum width and growth: every tile grows from a 150 floor (the hand-off's
// `minmax(150px, 1fr)` columns), on either surface. Identical on every platform (a layout
// contract, not a per-OS touch).
export const item: Record<Surface, ViewStyle> = {
  card: { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 150 },
  plain: { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 150 },
};

// The trend strip an item renders when it carries `spark` data: it sits below the
// value/delta and spans the full metric width (so the bars fill the stack rather
// than a fixed 120px). A layout contract shared by every skin, like `row`/`item`.
export const sparkStrip: ViewStyle = { marginTop: 6 };

// The composition strip an item renders when it carries `share`: the same slot,
// the same full width, and the SAME RESERVED HEIGHT as the trend strip, with the
// bar sitting on the strip's floor.
//
// On the floor rather than centred in the band, because that is where a
// Sparkline's bars sit (`alignItems: "flex-end"`), and a row that mixes the two
// then shares one baseline. Centred, the composition bar floated seven pixels
// above its neighbours' baseline, which is a smaller version of the same
// "these tiles do not match" reading the strip exists to fix.
//
// The height is what makes a mixed row work. Cards in a Stats row stretch to the
// tallest sibling, so a row where one metric plots a trend and another draws a
// composition would otherwise leave the shorter cards with a band of blank space
// under their text, and a row of cards that are only half filled reads as an
// unfinished component rather than as a deliberate one. Reserving the trend
// strip's height for the composition strip keeps every card in the row filled to
// the same line.
export const shareStrip: ViewStyle = { marginTop: 6, width: "100%", height: SPARK_STRIP_HEIGHT, justifyContent: "flex-end" };

// The metric's header row, rendered only when the item carries an icon or a
// control: the label on the left, the glyph and control opposite it. A metric with
// neither keeps its bare label Text, so its tree is unchanged. A layout contract,
// identical on every platform.
export const headerRow: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };

// The trailing cluster inside that row, so an icon and a control sit together
// rather than pushing each other apart.
export const headerTrailing: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// Delta tone: a rise reads in the success ink, a decline in the error ink (statusColors,
// both text-grade on the card). Semantic color, shared.
export function deltaTone(tokens: ColorTokens, down: boolean): TextStyle {
  return { color: statusColors(tokens, down ? "error" : "success").ink };
}

// ---- The hand-off's measures, shared by every skin -----------------------------

/** The tile inset, by density. */
export const TILE_PADDING = { default: 18, compact: 12 } as const;
/** The space between a tile's lines, and between tiles. */
export const TILE_RHYTHM = 6;
export const TILE_GAP = 12;
/** The headline figure's size, by surface. */
export const VALUE_SIZE = { default: 28, compact: 20, large: 36 } as const;

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

const tile = (tokens: ColorTokens, padding: number): ViewStyle => ({
  borderRadius: shape.web.card,
  borderWidth: 1,
  borderColor: tokens.border,
  backgroundColor: tokens.card,
  padding,
  gap: TILE_RHYTHM,
  ...shadow("sm", tokens),
});

// The figure: 600, tracked -0.02em, tabular so a value that updates in place keeps its
// width. Set solid (line 1) on the web; the native faces keep a little leading so their
// glyphs do not clip.
const value = (size: number, fontFamily: string | undefined, tokens: ColorTokens): TextStyle => ({
  fontSize: size,
  lineHeight: fontFamily ? size : Math.round(size * 1.2),
  fontWeight: "600",
  letterSpacing: -size * 0.02,
  ...(fontFamily ? { fontFamily } : null),
  ...tabularNums(),
  color: tokens.foreground,
});

const label = (tokens: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: subtle(tokens) });

const skinAt = (fontFamily: string | undefined, pressedOpacity: number | null, ripple: StatsSkin["ripple"]): StatsSkin => ({
  cardSurface: (tokens) => tile(tokens, TILE_PADDING.default),
  // Compact is the tighter tile (12 inset, a 20 figure), large the 36 figure on the default tile.
  denseCard: (tokens, large) => tile(tokens, large ? TILE_PADDING.default : TILE_PADDING.compact),
  denseValue: (tokens, large) => value(large ? VALUE_SIZE.large : VALUE_SIZE.compact, fontFamily, tokens),
  denseLabel: (tokens) => label(tokens),
  denseDescription: (tokens) => ({ fontSize: 12, lineHeight: 16, fontWeight: "400", color: tokens["muted-foreground"] }),
  plainContainer: (tokens) => ({
    borderRadius: shape.web.card,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    overflow: "hidden",
  }),
  plainItem: (tokens, first) => ({ padding: TILE_PADDING.default, gap: TILE_RHYTHM, ...(first ? null : { borderLeftWidth: 1, borderLeftColor: tokens.border }) }),
  rowGap: { card: { gap: TILE_GAP }, plain: { gap: 0 } },
  title: (tokens) => ({ fontSize: 15, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 10 }),
  labelText: label,
  valueText: (tokens) => value(VALUE_SIZE.default, fontFamily, tokens),
  deltaBase: { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", ...tabularNums() },
  pressedOpacity,
  ripple,
});

/** Web: the hand-off's tile, its figure in the display face; a pressed tile dims. */
export const webSkin: StatsSkin = skinAt(DISPLAY_FONT, 0.9, (tokens) => ({ color: alpha(tokens.foreground, 0.1), borderless: false }));
/** iOS: no stat-tile control; the web skin's parts in SF Pro, a pressed tile dims. */
export const iosSkin: StatsSkin = skinAt(undefined, 0.8, null);
/** Android: no Material 3 stat component; the web skin's parts in Roboto, the bounded ripple. */
export const androidSkin: StatsSkin = skinAt(undefined, null, surfaceRipple);
