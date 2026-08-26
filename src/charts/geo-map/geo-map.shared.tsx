import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import {
  View,
  Text,
  Pressable,
  useTheme,
  useMeasuredWidth,
  useControllableState,
  devWarn,
  type StyleProp,
  type ViewStyle,
} from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { chartRootWidth } from "../shared/chart-frame.js";
import { ChartValueFlag, announceSelection, pressPoint, DIM_OPACITY } from "../shared/chart-inspect.js";
import { formatCompact } from "../shared/chart-math.js";
import { projectNaturalEarth } from "./geo-map.projection.js";
import { WORLD_BORDER_PATH, WORLD_LAND_PATH, WORLD_VIEW_BOX } from "./geo-map.world.js";
import {
  WORLD_CAMERA,
  geoMapClampCamera,
  geoMapInView,
  geoMapMatrix,
  geoMapPlace,
  geoZoomLevel,
} from "./geo-map.camera.js";
import {
  NO_LINKS,
  geoClusterLabel,
  geoClusterOfPoint,
  geoClusterRows,
  geoMapClusterBubbles,
  geoMapClusters,
  geoMapLinkage,
  geoMapPeak,
  type GeoMapCluster,
} from "./geo-map.cluster.js";

// Shared GeoMap shell. A world map in the Natural Earth I projection: the land
// silhouette is ONE muted path and the shared country boundaries are ONE stroked
// path, both precomputed at build time (see geo-map.world.ts), and every datum is
// a circle at its projected coordinate whose AREA carries the count. Pressing a bubble selects it (the rest dim) and
// flags its label and value, exactly as the rest of the Chart family inspects.
//
// The map is drawn in the generated viewBox's own units and scaled by the Svg's
// viewBox, so the coastlines, the bubble centers, and the bubble radii all
// share one coordinate space and every size follows the rendered width for
// free. Coordinates come from geo-map.projection.ts, the SAME module the
// generator projected the land with, so the two cannot drift.
//
// Pure react-native-svg: no DOM, no Platform.OS branch. GeoMap is a "Shared"
// platform treatment (data visualization is platform-neutral): the skin carries
// the same values on every OS.
//
// Single-identity encoding, so there is no tone axis and no legend: one series
// of places, colored by the primary token. Density is the only style axis.

export interface GeoMapPoint {
  /** Stable identity, used as the React key when present. */
  id?: string | number;
  /** Latitude in degrees, north-positive. Clamped to the poles. */
  lat: number;
  /** Longitude in degrees, east-positive. Wrapped onto ±180. */
  lng: number;
  /** The place name, shown in the value flag and folded into the accessible name. */
  label: string;
  /** The magnitude at this place; encodes the bubble's AREA. */
  count: number;
}

export interface GeoMapProps {
  /** The places to plot; every bubble takes the primary token. */
  points: GeoMapPoint[];
  /** Optional heading shown above the map. */
  title?: string;
  // Density (omit for the default map size).
  compact?: boolean;
  /** Formats the flagged and accessible counts (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** Press-to-inspect: the selected point index (controlled). Pass null for none. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected point (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a point (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /**
   * Zoom and pan the map, and aggregate crowded places into one bubble that
   * splits into its members as the map is driven in. The wheel zooms about the
   * pointer, two fingers pinch, a drag pans once zoomed, and the zoom controls
   * and arrow keys give the same reach without a pointer.
   */
  zoomable?: boolean;
  /** The zoom factor, 1 (the whole world) upward (controlled). Needs `zoomable`. */
  zoom?: number;
  /** The zoom factor the map opens at (uncontrolled). Needs `zoomable`. */
  defaultZoom?: number;
  /** Fired whenever the zoom factor changes, by gesture, control or key. */
  onZoomChange?: (zoom: number) => void;
  /**
   * Fired alongside `onSelect` with EVERY point index inside the pressed bubble.
   * A single place reports one index and an aggregated bubble reports all of its
   * members, so `onSelect`'s own meaning never silently changes.
   */
  onSelectPlaces?: (indices: number[]) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The map is a fixed-aspect graphic, so density picks its WIDTH and the height
// follows the projection; the other charts pick a plot height instead because
// their width is free.
const STANDARD_WIDTH = { default: 480, compact: 320 } as const;

/** Width / height of the generated viewBox, and so of the rendered map. */
export const GEO_MAP_ASPECT = WORLD_VIEW_BOX.width / WORLD_VIEW_BOX.height;

import {
  BORDER_OPACITY,
  BORDER_WIDTH,
  BUBBLE_RING_WIDTH,
  COASTLINE_OPACITY,
  COASTLINE_WIDTH,
  MAX_RADIUS,
  MIN_HIT,
  MIN_RADIUS,
  SELECTION_RING_GAP,
  SELECTION_RING_WIDTH,
  bubbleRadius,
  type GeoMapBubble,
} from "./geo-map.bubbles.js";

// Re-exported so the bubble vocabulary still reads as part of this chart's own
// surface: geo-map.bubbles.ts exists to break an import cycle, not to relocate API.
export * from "./geo-map.bubbles.js";

// Past this many bubbles the map reads as noise and the accessible name gets
// long; the name itself names only the top few (NAMED_IN_LABEL) plus a tail.
const MAX_POINTS = 60;
const NAMED_IN_LABEL = 5;


/**
 * Project every point into the generated viewBox and size its bubble against
 * the largest count on the map. Pure, and exported for tests: geometry is
 * provable without a renderer (the chart-math.ts split), and the harness stubs
 * react-native-svg so nothing about the drawn circles is assertable from a DOM.
 */
export function geoMapBubbles(points: GeoMapPoint[]): GeoMapBubble[] {
  const max = points.reduce((m, p) => (Number.isFinite(p.count) && p.count > m ? p.count : m), 0);
  return points.map((p) => ({
    ...projectNaturalEarth(
      Number.isFinite(p.lng) ? p.lng : 0,
      Number.isFinite(p.lat) ? p.lat : 0,
      WORLD_VIEW_BOX.width,
      WORLD_VIEW_BOX.height,
    ),
    r: bubbleRadius(p.count, max),
  }));
}

/**
 * The bubble under a press, or null for empty ocean. `x`/`y` are px within the
 * map and `scale` converts a viewBox unit to px, so the test is done in the
 * units the finger actually landed in. The nearest center wins, which is what
 * keeps a small bubble drawn over a large one reachable; a bubble smaller than
 * MIN_HIT still gets a finger-sized target.
 *
 * Pure, and exported for tests: the DOM harness cannot drive a real press with
 * coordinates through the hit layer (the `scrubEvent` precedent).
 */
export function bubbleAt(bubbles: GeoMapBubble[], x: number, y: number, scale: number): number | null {
  let best: number | null = null;
  let bestDistance = Infinity;
  for (let i = 0; i < bubbles.length; i += 1) {
    const b = bubbles[i];
    const distance = Math.hypot(b.x * scale - x, b.y * scale - y);
    if (distance <= Math.max(b.r * scale, MIN_HIT) && distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

/**
 * The map's accessible name. A `role="img"` subtree is presentational, so a
 * screen reader user gets nothing from the bubbles themselves: the biggest
 * places have to be IN the name. It reads the title, then the top places by
 * count with their formatted values, then a "+N more" tail so the size of the
 * unread remainder is never hidden.
 */
export function geoMapAccessibleName(
  points: GeoMapPoint[],
  title: string | undefined,
  formatValue: (v: number) => string,
  /** The grouping currently DRAWN, when the map is aggregating. Omitted, or with
   *  nothing merged, the name is byte-identical to what it always was. */
  clusters?: readonly GeoMapCluster[],
): string {
  const head = title != null && title !== "" ? title : "World map";
  if (points.length === 0) return `${head}: no places`;
  const ranked = points
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (Number.isFinite(b.p.count) ? b.p.count : 0) - (Number.isFinite(a.p.count) ? a.p.count : 0));
  const named = ranked
    .slice(0, NAMED_IN_LABEL)
    .map(({ p }) => `${p.label} ${formatValue(Number.isFinite(p.count) ? p.count : 0)}`)
    .join(", ");
  const rest = ranked.length - NAMED_IN_LABEL;
  // A screen-reader user cannot see bubbles merge, so when the map IS grouping,
  // the name has to say so: otherwise it describes places that are not
  // separately drawn.
  const grouped = clusters != null && clusters.length > 0 && clusters.length < points.length
    ? ` in ${clusters.length} group${clusters.length === 1 ? "" : "s"}`
    : "";
  return `${head}: ${points.length} places${grouped}. ${named}${rest > 0 ? `, +${rest} more` : ""}`;
}

/** Build a GeoMap from a platform skin. */
export function createGeoMap(skin: ChartSkin) {
  return function GeoMap(props: GeoMapProps) {
    const { points, title, testID, style } = props;
    const { tokens } = useTheme();
    const compact = !!props.compact;
    const formatValue = props.formatValue ?? formatCompact;

    devWarn(points.length === 0, "[canvas] <GeoMap />: `points` is empty; the map renders with no bubbles.");
    devWarn(
      points.length > MAX_POINTS,
      `[canvas] <GeoMap />: more than ${MAX_POINTS} bubbles read as noise on a world map; aggregate by region.`,
    );
    devWarn(
      points.some((p) => !Number.isFinite(p.count) || p.count < 0),
      "[canvas] <GeoMap />: a point's `count` is negative or not a number; it is treated as 0 and drawn at the minimum radius.",
    );
    devWarn(
      points.some((p) => !Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180),
      "[canvas] <GeoMap />: a point's coordinates are outside ±90 / ±180; latitude clamps at the poles and longitude wraps around the antimeridian.",
    );

    // The camera. Zoom is controllable because it is the one degree of freedom a
    // caller can meaningfully express as a scalar; the pan offset stays local,
    // since a partial camera prop would be public surface for a viewport detail
    // nobody has asked for. Without `zoomable` the camera is the world verbatim,
    // so none of this can move.
    const zoomable = !!props.zoomable;
    const [zoom] = useControllableState<number>(props.zoom, props.defaultZoom ?? 1, props.onZoomChange);
    const [offset] = useState({ tx: 0, ty: 0 });
    const camera = zoomable ? geoMapClampCamera({ k: zoom, tx: offset.tx, ty: offset.ty }) : WORLD_CAMERA;

    // The merge tree is built once per data set and cut per zoom LEVEL, so a
    // smooth zoom re-cuts at most MAX_ZOOM_LEVEL times rather than every frame.
    // Without `zoomable` there are no links at all, and the cut degenerates to one
    // cluster per point in input order: exactly the un-clustered map.
    const links = useMemo(() => (zoomable ? geoMapLinkage(points) : NO_LINKS), [points, zoomable]);
    const peak = useMemo(() => (zoomable ? geoMapPeak(points, links) : 0), [points, links, zoomable]);
    const level = geoZoomLevel(camera.k);
    const clusters = useMemo(() => geoMapClusters(points, links, level), [points, links, level]);

    // Every bubble in viewBox units: the same space the land path is drawn in.
    // A non-zoomable map calls the very function it always called, so its geometry
    // is not merely equivalent but identical.
    const placed = geoMapPlace(zoomable ? geoMapClusterBubbles(clusters, peak) : geoMapBubbles(points), camera);

    // Press-to-inspect: pressing a bubble flags its count and dims the rest.
    const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
    const setSelected = (i: number | null) => {
      setSelectedRaw(i);
      const point = i != null ? points[i] : undefined;
      if (point) announceSelection(`${point.label}: ${formatValue(Number.isFinite(point.count) ? point.count : 0)}`);
    };
    // `selected` stays a POINT index, so onSelect keeps its exact meaning; what is
    // DRAWN and dimmed is the cluster holding it.
    const selectedCluster = geoClusterOfPoint(clusters, selected);
    const pressCluster = (at: number | null) => {
      const cluster = at != null ? clusters[at] : undefined;
      if (!cluster) {
        setSelected(null);
        props.onSelectPlaces?.([]);
        return;
      }
      // Pressing a group reports its LEAD to onSelect (for a single place that is
      // today's exact value) and every member to onSelectPlaces, so nothing a
      // consumer can see today changes and nothing is thrown away.
      const same = selectedCluster === at;
      setSelected(same ? null : cluster.lead);
      props.onSelectPlaces?.(same ? [] : cluster.members);
    };

    const name = geoMapAccessibleName(points, title, formatValue, zoomable ? clusters : undefined);

    // The map is a fixed-aspect graphic: `aspectRatio` reserves the right box
    // on the very first frame (no layout jump), and the measured width then
    // gives the Svg its real pixel size. Container measurement, never the
    // window: the map cannot know whether it is on a phone or in a 320px panel.
    const { width, measured, onLayout } = useMeasuredWidth();
    const height = width / GEO_MAP_ASPECT;
    // viewBox units -> px, for the RN layers positioned over the Svg.
    const scale = width / WORLD_VIEW_BOX.width;

    // The map's two paths, hoisted out of the render. On iOS and Android a
    // re-render re-parses the `d` string, and the land alone is 12,032 points, so
    // they are rebuilt only when something they actually draw with moves. PANNING
    // changes the group's transform alone and never touches them.
    //
    // Stroke widths are divided by k so a coastline renders at the same weight at
    // every zoom: inside a scale(k) group a stroke of w/k paints at w. That is
    // provably true on all three platforms, which `vector-effect:non-scaling-stroke`
    // is not: it resolves in the nearest VIEWPORT's space, so whether it lands
    // before or after the viewBox scale is exactly the ambiguity that would ship a
    // 4x-too-thick coastline on whichever platform disagreed.
    // Pulled out so the dependency array can be statically checked.
    const landFill = tokens.muted;
    const coastInk = tokens["muted-foreground"];
    const world = useMemo(
      () => (
        <>
          {/* The land, as one path in the generated viewBox's units. The
              ocean is the chart surface itself, so both sides of the
              coastline follow the scheme with no second fill. */}
          <Path
            d={WORLD_LAND_PATH}
            fill={landFill}
            stroke={coastInk}
            strokeWidth={COASTLINE_WIDTH / camera.k}
            strokeOpacity={COASTLINE_OPACITY}
            strokeLinejoin="round"
          />
          {/* The shared country boundaries, as one STROKED path. Its
              subpaths are open lines, not rings, so it must never take a
              fill: the generator excludes coastlines from this mesh
              precisely because the path above already draws them. */}
          <Path
            d={WORLD_BORDER_PATH}
            fill="none"
            stroke={coastInk}
            strokeWidth={BORDER_WIDTH / camera.k}
            strokeOpacity={BORDER_OPACITY}
            strokeLinejoin="round"
          />
        </>
      ),
      [landFill, coastInk, camera.k],
    );

    return (
      <View
        {...(title != null && title !== "" ? { role: "group" as const, accessibilityLabel: `${title} chart`, "aria-label": `${title} chart` } : {})}
        testID={testID}
        style={[
          s.surface(tokens, skin.surfaceRadius),
          compact ? s.surfacePadCompact : s.surfacePadDefault,
          chartRootWidth(style, compact ? STANDARD_WIDTH.compact : STANDARD_WIDTH.default),
          style,
        ]}
      >
        {title != null && title !== "" ? (
          <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
        ) : null}

        <View
          accessible
          accessibilityRole="image"
          role="img"
          accessibilityLabel={name}
          aria-label={name}
          onLayout={onLayout}
          style={{ width: "100%", aspectRatio: GEO_MAP_ASPECT }}
        >
          {measured ? (
            <>
              <Svg width={width} height={height} viewBox={`0 0 ${WORLD_VIEW_BOX.width} ${WORLD_VIEW_BOX.height}`}>
                {/* Only the MAP is drawn through the camera. Bubbles are placed
                    by geoMapPlace and drawn outside this group, so their radii are
                    never scaled by the zoom and the area encoding is safe. */}
                <G transform={geoMapMatrix(camera)}>{world}</G>
                {clusters.map((c, i) => (
                  <Circle
                    key={points[c.lead]?.id ?? c.lead}
                    cx={placed[i].x}
                    cy={placed[i].y}
                    r={placed[i].r}
                    fill={tokens.primary}
                    fillOpacity={selectedCluster != null && selectedCluster !== i ? DIM_OPACITY : 0.85}
                    // A surface-colored ring keeps overlapping bubbles
                    // separable (the ScatterPlot precedent) and lifts a bubble
                    // off the land it sits on.
                    stroke={tokens.card}
                    strokeWidth={BUBBLE_RING_WIDTH}
                  />
                ))}
                {/* Selection ring, drawn over the bubbles. */}
                {selectedCluster != null && placed[selectedCluster] ? (
                  <Circle
                    cx={placed[selectedCluster].x}
                    cy={placed[selectedCluster].y}
                    r={placed[selectedCluster].r + SELECTION_RING_GAP}
                    fill="none"
                    stroke={tokens.primary}
                    strokeWidth={SELECTION_RING_WIDTH}
                  />
                ) : null}
              </Svg>
              {/* The value flag for the selection, in px over the Svg. Suppressed
                  once the selected bubble has been panned off screen, so the flag
                  never clamps to the plot edge and points at the wrong place. */}
              {selectedCluster != null && placed[selectedCluster] && geoMapInView(placed[selectedCluster]) ? (
                <ChartValueFlag
                  title={geoClusterLabel(clusters[selectedCluster], points)}
                  rows={geoClusterRows(clusters[selectedCluster], points, formatValue)}
                  x={placed[selectedCluster].x * scale}
                  plotW={width}
                />
              ) : null}
              {/* Empty hit layer: bubble index by press point (SVG touchables
                  leak responder props to the DOM on web, and the smallest
                  bubbles are far under a finger). Empty ocean clears. */}
              <Pressable
                accessible={false}
                onPress={(e) => {
                  const point = pressPoint(e);
                  if (!point) return;
                  pressCluster(bubbleAt(placed, point.x, point.y, scale));
                }}
                style={StyleSheet.absoluteFill}
              />
            </>
          ) : null}
        </View>
      </View>
    );
  };
}
