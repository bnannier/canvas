/*
 * World land generator. Reads the 1:110m land topology that the `world-atlas`
 * devDependency packages from Natural Earth, decodes it with topojson-client,
 * projects every ring through src/charts/geo-map/geo-map.projection.ts, and
 * writes src/charts/geo-map/geo-map.world.ts (the land silhouette as one SVG
 * path plus the viewBox it is drawn in).
 *
 * Run: bun run geomap:gen
 *
 * Importing the renderer's own projection module rather than re-deriving the
 * polynomial here is the point of the tool: the silhouette baked into the
 * generated file and the bubbles the chart places at runtime go through the
 * same code, so the two cannot drift.
 *
 * It validates loudly: it reports how many rings and points survived, and it
 * FAILS if the topology is missing its land object, if any projected coordinate
 * comes out non-finite, if the emitted path does not re-parse to the exact
 * points it was built from, or if the result is too small to be a world map (a
 * silently half-decoded topology would otherwise ship as a plausible file).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { GeoPoint } from "../../src/charts/geo-map/geo-map.projection.ts";
import { projectNaturalEarth, naturalEarthHeight } from "../../src/charts/geo-map/geo-map.projection.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");

// The viewBox the silhouette is baked into, and with it the coordinate grid:
// every point is rounded to a whole unit of a 1000-unit-wide box, i.e. a grid of
// 0.1% of the map's width. That is the same grid as one decimal on a 100-unit
// box, written with fewer characters, and it is about as fine as this source
// carries: at 1:110m the vertices are already ~1 unit apart here, so widening
// the box to 2000 kept only 104 more points while costing 1.7KB gzip. The height
// is the projection's own undistorted height for that width, rounded to a whole
// unit (519.9965 -> 520, a 0.0007% squash).
const VIEW_BOX_WIDTH = 1000;
const VIEW_BOX_HEIGHT = Math.round(naturalEarthHeight(VIEW_BOX_WIDTH));

// Sanity floors for the finished path. A correct 110m land silhouette is ~125
// rings and ~4,900 points; anything under these means the decode lost geometry
// rather than the source getting coarser.
const MIN_RINGS = 50;
const MIN_POINTS = 2_000;

const worldAtlasPkg: { version: string } = JSON.parse(
  readFileSync(resolve(repo, "node_modules/world-atlas/package.json"), "utf8"),
);
const topology: Topology<{ land: GeometryCollection }> = JSON.parse(
  readFileSync(resolve(repo, "node_modules/world-atlas/land-110m.json"), "utf8"),
);

if (!topology.objects?.land) {
  console.error("FATAL: world-atlas/land-110m.json has no `land` object to decode.");
  process.exit(1);
}

const land = feature(topology, topology.objects.land);

// `feature` hands back a FeatureCollection for a GeometryCollection and a single
// Feature otherwise; flatten both shapes to the list of polygon rings, so a
// future switch to a countries-* source needs no change here.
type Point = [number, number];

function ringsOf(geometry: GeoJSON.Geometry): Point[][] {
  switch (geometry.type) {
    case "Polygon":
      return geometry.coordinates as Point[][];
    case "MultiPolygon":
      return (geometry.coordinates as Point[][][]).flat();
    case "GeometryCollection":
      return geometry.geometries.flatMap(ringsOf);
    default:
      return [];
  }
}

const sourceRings: Point[][] =
  land.type === "FeatureCollection"
    ? land.features.flatMap((f) => ringsOf(f.geometry))
    : ringsOf(land.geometry);

// --- the antimeridian -----------------------------------------------------------

// A ring that touches or straddles the 180° meridian is ambiguous in the source:
// world-atlas writes both sides of the seam as -180, so projecting each point on
// its own draws Fiji, Wrangel Island and Chukotka as full-width bands across the
// map. Resolve it the way d3-geo's antimeridian clipping does, in four steps.
//
// 1. ROTATE. Start the ring at a point that is not itself on the seam, so the
//    walk below always begins on a known side of it.
// 2. UNWRAP. Walk the ring picking, for each point, the longitude representative
//    (λ, λ ± 360, ...) nearest its predecessor. The sequence becomes continuous,
//    so a seam point written -180 next to 179° reads as 180°.
// 3. RECENTER. Shift the whole ring by whole turns until it straddles the map's
//    own window. Wrangel Island's eastern half comes back to [178.7, 180], which
//    is where it belongs, and then needs no cut at all.
// 4. CUT. Split what genuinely straddles the seam into one fragment per turn,
//    interpolating the latitude at the crossing so each fragment ends ON the
//    edge. Fiji becomes two closed fragments, one against each edge of the map.

/** True for a longitude sitting exactly on a seam, where the side is ambiguous. */
function isOnSeam(longitude: number): boolean {
  return Math.abs(Math.abs(longitude % 360) - 180) < 1e-9;
}

/** Which turn of the globe a longitude belongs to; meaningless on a seam. */
function turnOf(longitude: number): number {
  return Math.round(longitude / 360);
}

/**
 * Drop a ring's repeated closing point and rotate it to begin off the seam.
 * Null when every point is on the seam, which leaves no area to fill.
 */
function rotateOffSeam(ring: Point[]): Point[] | null {
  const first = ring[0];
  const last = ring[ring.length - 1];
  const open = first[0] === last[0] && first[1] === last[1] ? ring.slice(0, -1) : ring;
  const at = open.findIndex((p) => !isOnSeam(p[0]));
  if (at < 0) return null;
  return [...open.slice(at), ...open.slice(0, at)];
}

function unwrapLongitudes(ring: Point[]): Point[] {
  const out: Point[] = [[ring[0][0], ring[0][1]]];
  for (let i = 1; i < ring.length; i += 1) {
    const previous = out[i - 1][0];
    const raw = ring[i][0];
    out.push([raw - 360 * Math.round((raw - previous) / 360), ring[i][1]]);
  }
  return out;
}

function recenterLongitudes(ring: Point[]): Point[] {
  let min = Infinity;
  let max = -Infinity;
  for (const [longitude] of ring) {
    if (longitude < min) min = longitude;
    if (longitude > max) max = longitude;
  }
  const turns = turnOf((min + max) / 2);
  if (turns === 0) return ring;
  return ring.map(([longitude, latitude]) => [longitude - turns * 360, latitude] as Point);
}

/**
 * Split an unwrapped ring wherever it changes turn, and bring every fragment back
 * into the drawable window. A point exactly on the seam keeps the turn it arrived
 * on, so the crossing is charged to the segment that genuinely leaves the side
 * (the source almost always puts a vertex on the seam already, which is why a
 * strict `a < 180 < b` test misses these).
 */
function cutAtAntimeridian(ring: Point[]): Point[][] {
  const draw = (p: Point, turn: number): Point => [p[0] - turn * 360, p[1]];
  const fragments: Point[][] = [];
  let turn = turnOf(ring[0][0]);
  let current: Point[] = [draw(ring[0], turn)];
  for (let i = 1; i < ring.length; i += 1) {
    const a = ring[i - 1];
    const b = ring[i];
    const next = isOnSeam(b[0]) ? turn : turnOf(b[0]);
    if (next !== turn) {
      const seam = Math.min(turn, next) * 360 + 180;
      const t = (seam - a[0]) / (b[0] - a[0]);
      const latitude = a[1] + t * (b[1] - a[1]);
      current.push([seam - turn * 360, latitude]);
      fragments.push(current);
      current = [[seam - next * 360, latitude]];
      turn = next;
    }
    current.push(draw(b, turn));
  }
  // The walk began partway through whichever fragment holds the ring's first
  // point, and `current` has now come back around to it, so the two are one.
  if (fragments.length === 0) return [current];
  fragments[0] = current.slice(0, -1).concat(fragments[0]);
  return fragments;
}

/**
 * A ring that encircles a pole (Antarctica) comes out of the unwrap a full turn
 * longer than it went in, and its one fragment runs edge to edge instead of
 * closing on itself. `Z` would seal it with a straight line back across the map
 * at the latitude it started from, cutting off everything below and leaving the
 * fill self-intersecting. Close it along the source's own outline instead: down
 * the seam it ended on to the poleward limit of the ring, across at that latitude
 * (constant latitude is a horizontal line in this projection), and back up the
 * seam it started from. Nothing is invented below the data's own edge, which for
 * 110m land stops short of 90°S.
 */
function closeAroundPole(ring: Point[]): Point[] {
  const start = ring[0];
  const end = ring[ring.length - 1];
  const south = end[1] < 0;
  const limit = ring.reduce((n, [, latitude]) => (south ? Math.min(n, latitude) : Math.max(n, latitude)), end[1]);
  // The seam is a curve in this projection (x at ±180 pulls in toward the pole),
  // so walk it a degree at a time rather than cutting the corner.
  const step = south ? -1 : 1;
  const closing: Point[] = [];
  for (let lat = end[1] + step; south ? lat > limit : lat < limit; lat += step) closing.push([end[0], lat]);
  closing.push([end[0], limit], [start[0], limit]);
  for (let lat = limit - step; south ? lat < start[1] : lat > start[1]; lat -= step) closing.push([start[0], lat]);
  return [...ring, ...closing];
}

/** One source ring in, the fragments the renderer can draw out. */
function ringsToProject(sourceRing: Point[]): Point[][] {
  const rotated = rotateOffSeam(sourceRing);
  if (!rotated) return [];
  const ring = recenterLongitudes(unwrapLongitudes([...rotated, rotated[0]]));
  const encirclesPole = ring[0][0] !== ring[ring.length - 1][0];
  const fragments = cutAtAntimeridian(ring);
  return encirclesPole && fragments.length === 1 ? [closeAroundPole(fragments[0])] : fragments;
}

// --- project ------------------------------------------------------------------

const rings: Point[][] = [];
let sourcePoints = 0;
let droppedRings = 0;

/**
 * Douglas-Peucker, keeping the two endpoints. The tolerance is HALF_GRID: a point
 * that sits within half a grid cell of the chord through its neighbours cannot
 * move the outline further than the rounding below already does, so dropping it
 * is free. It is not a small saving, because 110m coastlines carry long runs of
 * nearly straight vertices: a third of the points go, for a third of the bytes.
 */
const HALF_GRID = 0.5;

function simplify(points: GeoPoint[]): GeoPoint[] {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const spans: [number, number][] = [[0, points.length - 1]];
  while (spans.length) {
    const [from, to] = spans.pop()!;
    if (to - from < 2) continue;
    const a = points[from];
    const b = points[to];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const chord = Math.hypot(dx, dy);
    let at = -1;
    let worst = HALF_GRID;
    for (let i = from + 1; i < to; i += 1) {
      const p = points[i];
      const distance =
        chord === 0
          ? Math.hypot(p.x - a.x, p.y - a.y)
          : Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / chord;
      if (distance > worst) {
        worst = distance;
        at = i;
      }
    }
    if (at < 0) continue;
    keep[at] = 1;
    spans.push([from, at], [at, to]);
  }
  return points.filter((_, i) => keep[i] === 1);
}

// Project a ring, simplify it, round it to the grid, and drop the points the
// rounding collapsed onto their predecessor. Null for a ring with no area left.
function projectRing(ring: Point[]): Point[] | null {
  const projected: GeoPoint[] = [];
  for (const [longitude, latitude] of ring) {
    const p = projectNaturalEarth(longitude, latitude, VIEW_BOX_WIDTH, VIEW_BOX_HEIGHT);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      console.error(`FATAL: ${longitude},${latitude} projected to ${p.x},${p.y}.`);
      process.exit(1);
    }
    projected.push(p);
  }

  const points: Point[] = [];
  for (const p of simplify(projected)) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const previous = points[points.length - 1];
    if (previous && previous[0] === x && previous[1] === y) continue;
    points.push([x, y]);
  }

  // A GeoJSON ring repeats its first point last; `Z` closes the subpath, so that
  // repeat is redundant.
  const last = points[points.length - 1];
  if (points.length > 1 && last[0] === points[0][0] && last[1] === points[0][1]) points.pop();

  // Under three distinct points there is no area left to fill: the island
  // rounded away to a line or a dot.
  return points.length < 3 ? null : points;
}

for (const sourceRing of sourceRings) {
  sourcePoints += sourceRing.length;
  for (const ring of ringsToProject(sourceRing)) {
    const points = projectRing(ring);
    if (points) rings.push(points);
    else droppedRings += 1;
  }
}

// --- encode -------------------------------------------------------------------

// One absolute `M`, then a single relative `l` run per ring. Relative deltas are
// 1-2 digits against the 3-4 of an absolute coordinate, which measured 5.7KB
// gzip against 14.2KB for the absolute form. Each delta is the difference of two
// ALREADY-ROUNDED absolute points, so the deltas sum back exactly and no drift
// accumulates along a ring. The `h`/`v` shorthands were tried for the ~37% of
// deltas that are axis-aligned and rejected: they cut 2.4KB of raw text but cost
// 193B gzip, because breaking the uniform run is worse than the digits it saves.
// A leading `-` is its own separator, so a space is only needed before a
// non-negative number (verified against react-native-svg's iOS and Android path
// parsers, which both accept the implicit repetition and the `-` separator).
function encode(points: Point[]): string {
  let out = `M${points[0][0]} ${points[0][1]}l`;
  let x = points[0][0];
  let y = points[0][1];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - x;
    const dy = points[i][1] - y;
    x = points[i][0];
    y = points[i][1];
    out += `${i > 1 && dx >= 0 ? " " : ""}${dx}${dy >= 0 ? " " : ""}${dy}`;
  }
  return `${out}Z`;
}

const path = rings.map(encode).join("");
const keptPoints = rings.reduce((n, r) => n + r.length, 0);

// --- verify -------------------------------------------------------------------

// Re-parse what was emitted and compare it point for point with what went in.
// The encoder writes its own separators, so an off-by-one there would produce a
// path that still LOOKS like a world map in a diff; this is the only check that
// catches it.
function reparse(d: string): Point[][] {
  const out: Point[][] = [];
  let current: Point[] = [];
  let x = 0;
  let y = 0;
  let relative = false;
  const tokens = d.match(/[MlZ]|-?\d+/g) ?? [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === "M") {
      x = Number(tokens[i + 1]);
      y = Number(tokens[i + 2]);
      i += 2;
      current = [[x, y]];
      relative = false;
    } else if (token === "l") {
      relative = true;
    } else if (token === "Z") {
      out.push(current);
    } else {
      // An implicitly repeated coordinate pair of the run the last command opened.
      const dx = Number(token);
      const dy = Number(tokens[i + 1]);
      i += 1;
      x = relative ? x + dx : dx;
      y = relative ? y + dy : dy;
      current.push([x, y]);
    }
  }
  return out;
}

const parsed = reparse(path);
const same =
  parsed.length === rings.length &&
  parsed.every(
    (ring, i) =>
      ring.length === rings[i].length &&
      ring.every((p, j) => p[0] === rings[i][j][0] && p[1] === rings[i][j][1]),
  );

console.log(
  `geomap:gen: ${rings.length} rings, ${keptPoints} points ` +
    `(from ${sourceRings.length} rings / ${sourcePoints} points on a ${VIEW_BOX_WIDTH}x${VIEW_BOX_HEIGHT} grid)`,
);
if (droppedRings) console.log(`  dropped ${droppedRings} ring(s) that rounded below three distinct points`);

if (!same) {
  console.error("\nFATAL: the emitted path does not re-parse to the points it was built from.");
  process.exit(1);
}
if (rings.length < MIN_RINGS || keptPoints < MIN_POINTS) {
  console.error(
    `\nFATAL: ${rings.length} rings / ${keptPoints} points is below the ` +
      `${MIN_RINGS} / ${MIN_POINTS} floor; the topology did not decode.`,
  );
  process.exit(1);
}

// --- write --------------------------------------------------------------------

const out = `/* @generated by tools/geomapgen. DO NOT EDIT. Run \`bun run geomap:gen\`. */
// The world's land silhouette, pre-projected at build time so the kit ships map
// geometry with no runtime dependency, no network fetch, and no parsing at import.
//
// Source:     Natural Earth 1:110m physical land (https://www.naturalearthdata.com/),
//             vector data version 4.1.0, packaged as TopoJSON by
//             world-atlas@${worldAtlasPkg.version} (land-110m.json), decoded with topojson-client.
// Licence:    Natural Earth's data is in the PUBLIC DOMAIN. The world-atlas
//             packaging is ISC, Copyright 2013-2019 Michael Bostock.
// Projection: Natural Earth I, applied by src/charts/geo-map/geo-map.projection.ts,
//             the same module the renderer projects city coordinates with, so the
//             silhouette and the bubbles drawn over it share one coordinate space.
// Precision:  whole units of the ${VIEW_BOX_WIDTH}-wide viewBox below (a grid of 0.1% of the
//             map's width), consecutive duplicates dropped, and rings left with
//             fewer than three distinct points dropped.
//
// Regenerate with: bun run geomap:gen

/** The viewBox the land path is drawn in, and the box city coordinates project into. */
export const WORLD_VIEW_BOX = { width: ${VIEW_BOX_WIDTH}, height: ${VIEW_BOX_HEIGHT} } as const;

/** Every land ring as one SVG path: ${rings.length} closed subpaths, ${keptPoints} points. */
export const WORLD_LAND_PATH =
  ${JSON.stringify(path)};
`;

const target = resolve(repo, "src/charts/geo-map/geo-map.world.ts");
writeFileSync(target, out);

const bytes = Buffer.from(out, "utf8");
console.log(
  `  wrote src/charts/geo-map/geo-map.world.ts: ${bytes.length}B raw, ${gzipSync(bytes).length}B gzip`,
);
