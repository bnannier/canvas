import { type ViewStyle, type TextStyle } from "react-native";
import { statusColors, shadow, alpha, surfaceRipple, tabularNums, shape, type ColorTokens } from "../../style/index.js";
import { DISPLAY_FONT, MONO_FONT } from "../../style/mono.js";
import { webHover } from "../../style/hover.js";
import { type StatsSkin } from "./stats.shared.js";

// Co-located Stats skins, one per platform. Stats takes the Canvas v4 hand-off's stat tiles
// (`K.def('stats')` in tools/v4/handoff/cv-kit-data.js, with its code-driven form in
// cv-kit-code3.js `O('stats')`). Neither iOS nor Android ships a stat-tile control
// (PLATFORM-REFERENCES.md), so every platform draws the hand-off's tile and the native skins
// share the web skin's parts, differing only in the face (the value in the platform's own
// face rather than the display face) and the press feedback (a dim on iOS, the ripple on
// Android). The semantic delta tone lives once in stats.shared.tsx.
//
//   Group (the default, and `plain`): one bordered `card` surface at the card corner with no
//     shadow, the metrics set edge to edge inside it, each after the first behind a 1 px
//     `border` rule.
//   Framed: separate tiles, the `card` fill on a 1 px `border` hairline at a 14 corner with
//     no shadow, 12 apart.
//   Tile: a 16 inset, its lines 8 apart. Label: 500 13 in the secondary ink, led by the
//     accent's 8 px swatch and the icon. Value: 600 28 (20 compact, 36 large), tracked
//     -0.02em, tabular, in the display face on the web, with an 84 by 28 trend line beside
//     it. Delta: 500 12, an arrow before a rise or a decline, the success or error ink, the
//     tertiary ink when steady. Share: a 6 px bar over an 11 px legend. Title: 500 15, 10
//     above the tiles.
//   Dense (compact, large): the base renderer's tiles, the small shadow under the card
//     corner, a 12px tertiary label and a mono delta.

export type Surface = "card" | "plain";

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];

// A wrapping row: items flow left to right and wrap to the next line when they
// run out of room (flex-row flex-wrap). Identical on every platform.
export const row: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// --- semantic / platform-neutral pieces (shared by every skin) --------------

// The hand-off's tile floor (cv-kit-code3.js `stats`): its grid is
// `repeat(auto-fit, minmax(min(100%, F), 1fr))`, F 180 px for three or more metrics and
// 220 px for one or two. Once the row has measured, every tile takes the cell width that
// grid gives (Grid's own auto-fit math); the unmeasured first frame flex-wraps on the same
// floor. Identical on every platform (a layout contract, not a per-OS touch).
export function tileFloor(count: number): number {
  return count > 2 ? 180 : 220;
}

/** The pre-measurement tile: grows from the hand-off's floor, on either surface. */
export function item(count: number): ViewStyle {
  return { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: tileFloor(count) };
}

// The headline row: the figure and, beside it, the trend line, both on the row's floor.
export const valueRow: ViewStyle = { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 };

/** The trend line beside the value: an 84 by 28 polyline, 1.75 wide with round ends and joins. */
export const SPARK = { width: 84, height: 28, stroke: 1.75 } as const;

/**
 * The trend line's points, as the hand-off plots them: the series spread across the width,
 * its range across the height inside a 2 px inset (a flat series sits on the floor).
 */
export function sparkPoints(values: readonly number[], width: number = SPARK.width, height: number = SPARK.height): string {
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  return values.map((y, i) => `${((i / (values.length - 1)) * width).toFixed(1)},${(height - 2 - ((y - min) / range) * (height - 4)).toFixed(1)}`).join(" ");
}

// The composition: a 6 px bar of proportional segments 2 apart (the first in the accent,
// the rest in the raised surface) over a wrapping legend of 6 px dots.
export const shareColumn: ViewStyle = { gap: 6 };
export const shareBar: ViewStyle = { flexDirection: "row", height: 6, borderRadius: 999, overflow: "hidden", gap: 2 };
export const shareLegend: ViewStyle = { flexDirection: "row", flexWrap: "wrap", gap: 12 };
export const shareLegendItem: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 5 };
export const shareDot: ViewStyle = { width: 6, height: 6, borderRadius: 3 };
export const shareLegendText = (tokens: ColorTokens): TextStyle => ({ fontSize: 11, lineHeight: 14, fontWeight: "400", color: subtle(tokens) });

// The accent's mark before the label: an 8 px swatch at a 2 corner in the chart slot's color.
export const swatch: ViewStyle = { width: 8, height: 8, borderRadius: 2 };

// The label cluster: the swatch, the icon and the label, 8 apart.
export const labelCluster: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 };

// The metric's header row, rendered only when the item carries an icon, an accent, a
// control or a tap: the label cluster on the left, the control (or a tappable metric's
// chevron) opposite it. A metric with none keeps its bare label Text. A layout contract,
// identical on every platform.
export const headerRow: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };

// The trailing cluster inside that row.
export const headerTrailing: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };

// Delta tone: a rise reads in the success ink, a decline in the error ink (statusColors,
// both text-grade on the card). Semantic color, shared.
export function deltaTone(tokens: ColorTokens, down: boolean): TextStyle {
  return { color: statusColors(tokens, down ? "error" : "success").ink };
}

// ---- The hand-off's measures, shared by every skin -----------------------------

// Two hand-off renderers draw Stats. The code-driven one (cv-kit-code3.js `stats`) draws
// every snippet that passes `items`, which is every real use: 16 inset, 8 between lines,
// a 500 13px label in the secondary ink and an arrowed delta in the interface face. The
// base one (cv-kit-data.js `K.def('stats')`) is the only one that draws the dense
// surfaces: 12 (compact) or 18 (large) inset, 6 between lines, a 12px tertiary label and
// a mono delta.
/** The tile inset: the code-driven tile, and the base renderer's dense tiles. */
export const TILE_PADDING = { default: 16, compact: 12, large: 18 } as const;
/** The space between a tile's lines: the code-driven tile, and the dense tiles. */
export const TILE_RHYTHM = 8;
export const DENSE_RHYTHM = 6;
export const TILE_GAP = 12;
/** The headline figure's size, by surface. */
export const VALUE_SIZE = { default: 28, compact: 20, large: 36 } as const;


/** The framed tile's corner (the group's own box takes the card corner). */
export const TILE_RADIUS = 14;

const tile = (tokens: ColorTokens, padding: number, gap: number, raised: boolean): ViewStyle => ({
  borderRadius: raised ? shape.web.card : TILE_RADIUS,
  borderWidth: 1,
  borderColor: tokens.border,
  backgroundColor: tokens.card,
  padding,
  gap,
  ...(raised ? shadow("sm", tokens) : null),
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

const label = (tokens: ColorTokens): TextStyle => ({ fontSize: 13, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] });
const denseLabel = (tokens: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: subtle(tokens) });

const skinAt = (fontFamily: string | undefined, pressedOpacity: number | null, ripple: StatsSkin["ripple"]): StatsSkin => ({
  cardSurface: (tokens) => tile(tokens, TILE_PADDING.default, TILE_RHYTHM, false),
  // Compact is the tighter tile (12 inset, a 20 figure), large the 36 figure on the 18 tile.
  denseCard: (tokens, large) => tile(tokens, large ? TILE_PADDING.large : TILE_PADDING.compact, DENSE_RHYTHM, true),
  denseValue: (tokens, large) => value(large ? VALUE_SIZE.large : VALUE_SIZE.compact, fontFamily, tokens),
  denseLabel: (tokens) => denseLabel(tokens),
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
  deltaBase: { fontSize: 12, lineHeight: 15, fontWeight: "500", ...tabularNums() },
  denseDeltaBase: { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500", ...tabularNums() },
  pressedOpacity,
  ripple,
  // A tappable metric under the pointer takes the secondary wash (the hand-off's sf3), on the web.
  hoverWash: webHover(true),
});

/** Web: the hand-off's tile, its figure in the display face; a pressed tile dims. */
export const webSkin: StatsSkin = skinAt(DISPLAY_FONT, 0.9, (tokens) => ({ color: alpha(tokens.foreground, 0.1), borderless: false }));
/** iOS: no stat-tile control; the web skin's parts in SF Pro, a pressed tile dims. */
export const iosSkin: StatsSkin = skinAt(undefined, 0.8, null);
/** Android: no Material 3 stat component; the web skin's parts in Roboto, the bounded ripple. */
export const androidSkin: StatsSkin = skinAt(undefined, null, surfaceRipple);
