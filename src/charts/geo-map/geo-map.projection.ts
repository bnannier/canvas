// The Natural Earth I map projection, forward direction only, as pure number math.
// No React, no React Native, no theme, and no dependency, following the same split
// as chart-math.ts: the drawing math is provable without a renderer, and the
// build-time land generator (tools/geomapgen) imports THIS module so the
// pre-projected silhouette and the runtime bubble placement can never drift apart.
//
// Tom Patterson's Natural Earth projection was originally defined by a table of
// values rather than a closed form. The polynomial below is the least-squares fit
// published in Bojan Šavrič, Tom Patterson, Bernhard Jenny and Lorenz Hurni,
// "A polynomial equation for the Natural Earth projection", Cartography and
// Geographic Information Science 38(4), 2011, pages 363-372. It is the same
// equation d3-geo-projection's `naturalEarth1` implements:
//
//   x = λ (0.8707 − 0.131979 φ² − 0.013791 φ⁴ + 0.003971 φ¹⁰ − 0.001529 φ¹²)
//   y = φ (1.007226 + 0.015085 φ² − 0.044475 φ⁶ + 0.028874 φ⁸ − 0.005916 φ¹⁰)
//
// with λ (longitude) and φ (latitude) in RADIANS, producing a pseudocylindrical
// map of the unit sphere. Only the forward direction lives here: nothing in the
// kit turns a pixel back into a coordinate, and the inverse needs Newton
// iteration on the y polynomial, which is code with no caller.

/** A projected point in viewBox units, y growing DOWN the way SVG measures it. */
export interface GeoPoint {
  x: number;
  y: number;
}

const DEG_TO_RAD = Math.PI / 180;

/**
 * The raw polynomial: radians in, unscaled projection-plane units out. Kept
 * private because its units are meaningless outside this module; the extents
 * below are derived from it so no magic number is transcribed by hand.
 */
function naturalEarthRaw(lambda: number, phi: number): GeoPoint {
  const p2 = phi * phi;
  const p4 = p2 * p2;
  return {
    x: lambda * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))),
    y: phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))),
  };
}

// Half the projected world, measured from the polynomial itself: the widest x is
// the antimeridian at the equator, the tallest y is a pole. Natural Earth has a
// pole LINE rather than a point, so the poles are narrower than the equator but
// still about 0.55 of its width.
const MAX_X = naturalEarthRaw(Math.PI, 0).x;
const MAX_Y = naturalEarthRaw(0, Math.PI / 2).y;

/**
 * Width / height of the projected world. A viewBox in this ratio shows the map
 * undistorted; any other ratio stretches it, since the projection fills whatever
 * box it is handed.
 */
export const NATURAL_EARTH_ASPECT = MAX_X / MAX_Y;

/** The undistorted height for a given map width, i.e. `width / NATURAL_EARTH_ASPECT`. */
export function naturalEarthHeight(width: number): number {
  return width / NATURAL_EARTH_ASPECT;
}

// Longitudes outside ±180 are wrapped rather than clamped: 190°E and 170°W are
// the same meridian, and clamping would silently pile every such point onto the
// antimeridian. Exactly ±180 passes through untouched so the two map edges stay
// distinguishable. Latitude has no wrap to make: ±90 are the poles, so it clamps.
function wrapLongitude(longitude: number): number {
  if (longitude >= -180 && longitude <= 180) return longitude;
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function clampLatitude(latitude: number): number {
  return Math.min(90, Math.max(-90, latitude));
}

/**
 * Project a geographic coordinate into a `width` x `height` viewBox.
 *
 * `longitude` and `latitude` are DEGREES (longitude east-positive, latitude
 * north-positive). The result is in viewBox units with the origin at the top
 * left: 0°/0° lands at the exact center, the antimeridian at x = 0 and
 * x = width, and the poles at y = 0 (north) and y = height (south).
 */
export function projectNaturalEarth(
  longitude: number,
  latitude: number,
  width: number,
  height: number,
): GeoPoint {
  const { x, y } = naturalEarthRaw(
    wrapLongitude(longitude) * DEG_TO_RAD,
    clampLatitude(latitude) * DEG_TO_RAD,
  );
  return {
    x: ((x / MAX_X) + 1) * (width / 2),
    // y is negated because the projection measures north as positive while SVG
    // measures down as positive.
    y: ((-y / MAX_Y) + 1) * (height / 2),
  };
}
