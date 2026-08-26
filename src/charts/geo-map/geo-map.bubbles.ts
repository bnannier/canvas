/*
 * GeoMap's bubble vocabulary: the disc a datum is drawn as, every size the map is
 * measured in, and the area encoding itself.
 *
 * Its own module because two files need these at MODULE-INIT time:
 * geo-map.shared.tsx, which draws with them, and geo-map.cluster.ts, which derives
 * CLUSTER_GAP from the smallest bubble the map can draw. Having cluster read them
 * back out of the component file was a real import cycle, and the constant that
 * read a not-yet-initialised binding threw on import rather than at a callsite.
 * geo-map.shared.tsx re-exports everything here, so every import path that named
 * the component file still resolves.
 */

// Bubble radii in viewBox units (a 2000-wide box), so they scale with the map.
// The largest count fills MAX_RADIUS; MIN_RADIUS is the floor that keeps a
// place with a tiny count on the map at all.
export const MAX_RADIUS = 52;
export const MIN_RADIUS = 12;

// Stroke widths, also in viewBox units. The coastline is what separates land from
// ocean when both are near-neighbours on the scheme's ramp (muted land on a card
// surface is only a few steps apart in dark), and the borders are what turn a
// continent-shaped blob into a readable map. Both are drawn in the muted
// FOREGROUND rather than a new token: it is the one mid-tone that reads against
// the muted fill in both schemes. The borders sit fainter than the coast, so the
// silhouette stays the primary read and the subdivisions stay secondary.
export const COASTLINE_WIDTH = 1.6;
export const COASTLINE_OPACITY = 0.45;
export const BORDER_WIDTH = 1.4;
export const BORDER_OPACITY = 0.28;

// The ring that lifts a bubble off the land, and the selection ring outside it.
export const BUBBLE_RING_WIDTH = 4;
export const SELECTION_RING_GAP = 10;
export const SELECTION_RING_WIDTH = 6;
// Press slop in px: the smallest bubbles are far under a finger, so a press
// within this distance of a center counts as a hit on it.
export const MIN_HIT = 12;

/** One bubble's center and radius, all in the generated viewBox's units. */
export interface GeoMapBubble {
  x: number;
  y: number;
  r: number;
}

/**
 * The bubble radius for `count` against the largest count on the map, in
 * viewBox units. AREA is the encoding, so the radius is proportional to the
 * square root of the share: doubling the count grows the disc's area by two,
 * not its width. The floor keeps a tiny (or zero, or malformed) count visible
 * as a place rather than vanishing, which is the one deliberate departure from
 * strict proportionality.
 */
export function bubbleRadius(count: number, max: number): number {
  if (!Number.isFinite(count) || !Number.isFinite(max) || max <= 0 || count <= 0) return MIN_RADIUS;
  return Math.max(MIN_RADIUS, MAX_RADIUS * Math.sqrt(Math.min(1, count / max)));
}
