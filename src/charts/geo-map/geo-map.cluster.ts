/*
 * Zoom-aware clustering for GeoMap: which places share a bubble at a given zoom,
 * and what that bubble says. Pure geometry, no React, no React Native, no DOM,
 * for the same reason geo-map.camera.ts is (the harness stubs react-native-svg,
 * so nothing drawn is assertable).
 *
 * THE ALGORITHM, and why it is this one.
 *
 * Build the Euclidean minimum spanning tree over the PROJECTED points ONCE per
 * data set, then cut it at a threshold that halves with every zoom level. Cutting
 * an MST at a threshold is exactly single-link clustering at that threshold, and
 * because the threshold only ever shrinks as the map zooms in, each partition is a
 * REFINEMENT of the one above it: a cluster can only split, never re-form, and no
 * place can migrate from one cluster to another. The anti-flicker guarantee is
 * therefore structural rather than tuned, which is why there is no hysteresis here
 * and no dependence on the previous frame.
 *
 * Brute force over all n(n-1)/2 pairs is deliberate. MAX_POINTS caps a readable
 * map at 60 places, so the worst case is 1,770 pairs: a spatial index would cost
 * more to build than this costs to run. supercluster is additionally the WRONG
 * shape for this requirement, because it re-clusters independently per zoom on a
 * radius grid, so a point can migrate between clusters as you zoom, which is the
 * exact reshuffle this design exists to prevent.
 */
import { projectNaturalEarth } from "./geo-map.projection.js";
import { WORLD_VIEW_BOX } from "./geo-map.world.js";
import { MAX_ZOOM_LEVEL } from "./geo-map.camera.js";
import { bubbleRadius, MIN_RADIUS, BUBBLE_RING_WIDTH, type GeoMapPoint, type GeoMapBubble } from "./geo-map.shared.js";
import type { FlagRow } from "../shared/chart-inspect.js";

/** One merge in the linkage, ascending by `distance` across the array. */
export interface GeoMapLink {
  a: number;
  b: number;
  distance: number;
}

/** One drawn bubble's worth of places. */
export interface GeoMapCluster {
  /** The count-weighted centroid of the members, in viewBox units. */
  x: number;
  y: number;
  /** The members' counts, summed. This is what the bubble's AREA encodes. */
  count: number;
  /** The members' indices into the original `points`, ascending. */
  members: number[];
  /** The largest member (ties to the lowest index): what the bubble is named after. */
  lead: number;
}

/**
 * Merge two places while their drawn centres sit within this many viewBox units.
 * Derived, not picked: it is the width of the two smallest bubbles the map can
 * draw, rings included, just touching. Below it the discs overlap and the map is
 * lying about where the data is; above it they are legibly separate.
 */
export const CLUSTER_GAP = 2 * (MIN_RADIUS + BUBBLE_RING_WIDTH);

/** The all-singleton linkage, for a map with nothing to merge. */
export const NO_LINKS: readonly GeoMapLink[] = Object.freeze([]);

/** How many members a flag names before it summarises the rest. */
const NAMED_IN_FLAG = 4;

const { width: W, height: H } = WORLD_VIEW_BOX;

/** A point's projected position, with malformed coordinates treated as the origin
 *  exactly as geoMapBubbles already treats them. */
function project(p: GeoMapPoint) {
  return projectNaturalEarth(
    Number.isFinite(p.lng) ? p.lng : 0,
    Number.isFinite(p.lat) ? p.lat : 0,
    W,
    H,
  );
}

/** A count that can be summed: negatives and NaN read as 0, matching bubbleRadius. */
function weight(p: GeoMapPoint): number {
  return Number.isFinite(p.count) && p.count > 0 ? p.count : 0;
}

/**
 * The Euclidean minimum spanning tree over the projected points: exactly n-1
 * links, ascending by length. Built ONCE per data set, because it does not depend
 * on the zoom at all; only the threshold it is cut at does.
 *
 * Edges are ordered by (distance, a, b), which is a TOTAL order, so the result is
 * deterministic and independent of the order the points arrived in.
 */
export function geoMapLinkage(points: readonly GeoMapPoint[]): GeoMapLink[] {
  const n = points.length;
  if (n < 2) return [];
  const at = points.map(project);

  const edges: GeoMapLink[] = [];
  for (let a = 0; a < n; a += 1) {
    for (let b = a + 1; b < n; b += 1) {
      edges.push({ a, b, distance: Math.hypot(at[b].x - at[a].x, at[b].y - at[a].y) });
    }
  }
  edges.sort((p, q) => p.distance - q.distance || p.a - q.a || p.b - q.b);

  // Union-find with path compression; the tree is small enough that rank is noise.
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root];
    while (parent[i] !== root) {
      const next = parent[i];
      parent[i] = root;
      i = next;
    }
    return root;
  };

  const tree: GeoMapLink[] = [];
  for (const edge of edges) {
    const ra = find(edge.a);
    const rb = find(edge.b);
    if (ra === rb) continue;
    parent[ra] = rb;
    tree.push(edge);
    if (tree.length === n - 1) break;
  }
  return tree;
}

/**
 * The merge distance at a zoom level: the gap halves every time the map doubles,
 * because a fixed on-screen gap covers half as much of the world each time.
 *
 * EXACTLY 0 at the deepest level, so full separation is guaranteed for any data at
 * all. Without that, two places closer together than the floor would share a bubble
 * even at maximum zoom, and the map would have a class of data it simply could not
 * pull apart.
 */
export function geoClusterThreshold(level: number): number {
  if (!Number.isFinite(level) || level <= 0) return CLUSTER_GAP;
  if (level >= MAX_ZOOM_LEVEL) return 0;
  return CLUSTER_GAP / 2 ** Math.floor(level);
}

/**
 * Single-link clustering at `geoClusterThreshold(level)`, as the connected
 * components of the linkage once links at or beyond that threshold are dropped.
 *
 * Clusters come back ordered by their lowest member index, and `members` ascending,
 * so with no links at all `clusters[i].members` is `[i]` and the array order is the
 * input order: the degenerate case is exactly the un-clustered map.
 *
 * Centroids are COUNT-WEIGHTED and computed in PROJECTED space. Projected, because
 * averaging longitudes is wrong across the antimeridian and the Natural Earth
 * polynomial is non-linear, so the projection of the mean is not the mean of the
 * projections. Weighted, so a bubble sits on its data rather than in the empty
 * middle of it, falling back to the plain mean when every count is zero rather
 * than dividing by zero.
 */
export function geoMapClusters(
  points: readonly GeoMapPoint[],
  links: readonly GeoMapLink[],
  level: number,
): GeoMapCluster[] {
  const n = points.length;
  if (n === 0) return [];
  const threshold = geoClusterThreshold(level);

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  for (const link of links) {
    if (!(link.distance < threshold)) continue;
    const ra = find(link.a);
    const rb = find(link.b);
    if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
  }

  // Group by root, keeping first-appearance order so the output is ordered by
  // lowest member index without a second sort.
  const order: number[] = [];
  const bucket = new Map<number, number[]>();
  for (let i = 0; i < n; i += 1) {
    const root = find(i);
    const members = bucket.get(root);
    if (members) members.push(i);
    else {
      bucket.set(root, [i]);
      order.push(root);
    }
  }

  const at = points.map(project);
  return order.map((root) => {
    const members = bucket.get(root)!;
    let count = 0;
    let wx = 0;
    let wy = 0;
    let lead = members[0];
    for (const i of members) {
      const w = weight(points[i]);
      count += w;
      wx += at[i].x * w;
      wy += at[i].y * w;
      if (w > weight(points[lead])) lead = i;
    }
    const x = count > 0 ? wx / count : members.reduce((s, i) => s + at[i].x, 0) / members.length;
    const y = count > 0 ? wy / count : members.reduce((s, i) => s + at[i].y, 0) / members.length;
    return { x, y, count, members, lead };
  });
}

/**
 * The normalizer every bubble is sized against: the largest AGGREGATE at level 0.
 * Zoom-invariant on purpose, so a bubble resizes only when it itself splits and
 * never because some unrelated cluster on the other side of the world split.
 */
export function geoMapPeak(points: readonly GeoMapPoint[], links: readonly GeoMapLink[]): number {
  return geoMapClusters(points, links, 0).reduce((max, c) => (c.count > max ? c.count : max), 0);
}

/**
 * Size each cluster's bubble against the fixed peak. Because the radius is
 * proportional to the square root of the share, disc AREA is exactly linear in the
 * count, so a parent's ink equals the sum of its children's: a split redistributes
 * area rather than inventing it. The MIN_RADIUS floor is the one documented
 * departure, and it is the reason a tiny place stays on the map at all.
 */
export function geoMapClusterBubbles(clusters: readonly GeoMapCluster[], peak: number): GeoMapBubble[] {
  return clusters.map((c) => ({ x: c.x, y: c.y, r: bubbleRadius(c.count, peak) }));
}

/** Which cluster holds a point, or null when the point is not on the map. */
export function geoClusterOfPoint(clusters: readonly GeoMapCluster[], index: number | null): number | null {
  if (index == null) return null;
  const at = clusters.findIndex((c) => c.members.includes(index));
  return at < 0 ? null : at;
}

/**
 * What a bubble is called. A single place is its own name, exactly as today; a
 * group is named after its largest member with the rest counted, because showing
 * one city's name for four cities' worth of data would be a lie.
 */
export function geoClusterLabel(cluster: GeoMapCluster, points: readonly GeoMapPoint[]): string {
  const lead = points[cluster.lead]?.label ?? "";
  const rest = cluster.members.length - 1;
  return rest > 0 ? `${lead} +${rest}` : lead;
}

/**
 * The flag's rows. A single place keeps today's shape exactly: one unlabelled
 * value. A group lists its biggest members by name and then summarises whatever it
 * could not fit, so the flag never grows without bound.
 */
export function geoClusterRows(
  cluster: GeoMapCluster,
  points: readonly GeoMapPoint[],
  formatValue: (v: number) => string,
): FlagRow[] {
  if (cluster.members.length === 1) return [{ value: formatValue(cluster.count) }];
  const ranked = [...cluster.members].sort(
    (a, b) => weight(points[b]) - weight(points[a]) || a - b,
  );
  const named = ranked.slice(0, NAMED_IN_FLAG);
  const rows: FlagRow[] = named.map((i) => ({ label: points[i]?.label ?? "", value: formatValue(weight(points[i])) }));
  const rest = ranked.slice(NAMED_IN_FLAG);
  if (rest.length > 0) {
    rows.push({ label: `+${rest.length} more`, value: formatValue(rest.reduce((s, i) => s + weight(points[i]), 0)) });
  }
  return rows;
}

/**
 * What a screen reader hears when the zoom changes. A pointer-free user cannot see
 * bubbles merge, so the grouping has to be said out loud, not just drawn.
 */
export function geoZoomAnnouncement(factor: number, clusters: number, places: number): string {
  const zoom = `${Math.round(Number.isFinite(factor) ? factor : 1)}x`;
  if (clusters >= places) return `Zoom ${zoom}. ${places} places, none grouped.`;
  return `Zoom ${zoom}. ${places} places in ${clusters} groups.`;
}
