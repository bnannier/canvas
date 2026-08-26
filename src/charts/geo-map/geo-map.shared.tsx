import { StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
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
import { WORLD_LAND_PATH, WORLD_VIEW_BOX } from "./geo-map.world.js";

// Shared GeoMap shell. A world map in the Natural Earth I projection: the land
// silhouette is ONE muted path, precomputed at build time (see
// geo-map.world.ts), and every datum is a circle at its projected coordinate
// whose AREA carries the count. Pressing a bubble selects it (the rest dim) and
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

// Bubble radii in viewBox units (a 1000-wide box), so they scale with the map.
// The largest count fills MAX_RADIUS; MIN_RADIUS is the floor that keeps a
// place with a tiny count on the map at all.
const MAX_RADIUS = 26;
const MIN_RADIUS = 6;
// Press slop in px: the smallest bubbles are far under a finger, so a press
// within this distance of a center counts as a hit on it.
const MIN_HIT = 12;

// Past this many bubbles the map reads as noise and the accessible name gets
// long; the name itself names only the top few (NAMED_IN_LABEL) plus a tail.
const MAX_POINTS = 60;
const NAMED_IN_LABEL = 5;

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
  return `${head}: ${points.length} places. ${named}${rest > 0 ? `, +${rest} more` : ""}`;
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

    // Every bubble in viewBox units: the same space the land path is drawn in.
    const placed = geoMapBubbles(points);

    // Press-to-inspect: pressing a bubble flags its count and dims the rest.
    const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
    const setSelected = (i: number | null) => {
      setSelectedRaw(i);
      const point = i != null ? points[i] : undefined;
      if (point) announceSelection(`${point.label}: ${formatValue(Number.isFinite(point.count) ? point.count : 0)}`);
    };
    const toggle = (i: number) => setSelected(selected === i ? null : i);

    const name = geoMapAccessibleName(points, title, formatValue);

    // The map is a fixed-aspect graphic: `aspectRatio` reserves the right box
    // on the very first frame (no layout jump), and the measured width then
    // gives the Svg its real pixel size. Container measurement, never the
    // window: the map cannot know whether it is on a phone or in a 320px panel.
    const { width, measured, onLayout } = useMeasuredWidth();
    const height = width / GEO_MAP_ASPECT;
    // viewBox units -> px, for the RN layers positioned over the Svg.
    const scale = width / WORLD_VIEW_BOX.width;

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
                {/* The land, as one path in the generated viewBox's units. The
                    ocean is the chart surface itself, so both sides of the
                    coastline follow the scheme with no second fill. */}
                <Path d={WORLD_LAND_PATH} fill={tokens.muted} />
                {points.map((p, i) => (
                  <Circle
                    key={p.id ?? i}
                    cx={placed[i].x}
                    cy={placed[i].y}
                    r={placed[i].r}
                    fill={tokens.primary}
                    fillOpacity={selected != null && selected !== i ? DIM_OPACITY : 0.85}
                    // A surface-colored ring keeps overlapping bubbles
                    // separable (the ScatterPlot precedent) and lifts a bubble
                    // off the land it sits on.
                    stroke={tokens.card}
                    strokeWidth={2}
                  />
                ))}
                {/* Selection ring, drawn over the bubbles. */}
                {selected != null && placed[selected] ? (
                  <Circle
                    cx={placed[selected].x}
                    cy={placed[selected].y}
                    r={placed[selected].r + 5}
                    fill="none"
                    stroke={tokens.primary}
                    strokeWidth={3}
                  />
                ) : null}
              </Svg>
              {/* The value flag for the selection, in px over the Svg. */}
              {selected != null && points[selected] && placed[selected] ? (
                <ChartValueFlag
                  title={points[selected].label}
                  rows={[{ value: formatValue(Number.isFinite(points[selected].count) ? points[selected].count : 0) }]}
                  x={placed[selected].x * scale}
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
                  const hit = bubbleAt(placed, point.x, point.y, scale);
                  if (hit != null) toggle(hit);
                  else setSelected(null);
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
