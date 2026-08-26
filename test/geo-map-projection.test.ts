import { describe, it, expect } from "bun:test";
import {
  NATURAL_EARTH_ASPECT,
  naturalEarthHeight,
  projectNaturalEarth,
} from "../src/charts/geo-map/geo-map.projection.ts";
import { WORLD_VIEW_BOX } from "../src/charts/geo-map/geo-map.world.ts";

// Pure number-math tests for the Natural Earth I forward projection, in the
// chart-math.test.ts style: no React, no DOM, no renderer. This module is the
// ONE place both the build-time land generator (tools/geomapgen) and the
// runtime bubble placement compute geometry, so a regression here silently
// moves either the coastlines or the data points off each other.

// The box the generated silhouette is baked into; every expectation below is
// in these units so the numbers are the ones GeoMap actually draws with.
const W = 1000;
const H = 520;

// An independent transcription of the published Natural Earth I polynomial
// (Šavrič, Patterson, Jenny & Hurni 2011), written in the plain unrolled form
// rather than the module's Horner nesting. Same equation, different arithmetic
// path: this is what makes the city expectations a real check of the nesting
// instead of a restatement of it.
//
//   x = λ (0.8707 − 0.131979 φ² − 0.013791 φ⁴ + 0.003971 φ¹⁰ − 0.001529 φ¹²)
//   y = φ (1.007226 + 0.015085 φ² − 0.044475 φ⁶ + 0.028874 φ⁸ − 0.005916 φ¹⁰)
const RAD = Math.PI / 180;

function referenceRaw(longitude: number, latitude: number): { x: number; y: number } {
  const l = longitude * RAD;
  const p = latitude * RAD;
  return {
    x: l * (0.8707 - 0.131979 * p ** 2 - 0.013791 * p ** 4 + 0.003971 * p ** 10 - 0.001529 * p ** 12),
    y: p * (1.007226 + 0.015085 * p ** 2 - 0.044475 * p ** 6 + 0.028874 * p ** 8 - 0.005916 * p ** 10),
  };
}

// The half-extents the reference normalizes by: the widest x is the
// antimeridian at the equator, the tallest y is a pole.
const REFERENCE_MAX_X = referenceRaw(180, 0).x;
const REFERENCE_MAX_Y = referenceRaw(0, 90).y;

function reference(longitude: number, latitude: number): { x: number; y: number } {
  const { x, y } = referenceRaw(longitude, latitude);
  return { x: (x / REFERENCE_MAX_X + 1) * (W / 2), y: (-y / REFERENCE_MAX_Y + 1) * (H / 2) };
}

/** Coordinates from Natural Earth's own populated-places table, east/north positive. */
const CITIES: { name: string; lng: number; lat: number }[] = [
  { name: "London", lng: -0.1276, lat: 51.5072 },
  { name: "New York", lng: -74.006, lat: 40.7128 },
  { name: "Tokyo", lng: 139.6917, lat: 35.6895 },
  { name: "Sydney", lng: 151.2093, lat: -33.8688 },
  { name: "Nairobi", lng: 36.8219, lat: -1.2921 },
  { name: "Sao Paulo", lng: -46.6333, lat: -23.5505 },
];

describe("projectNaturalEarth", () => {
  it("puts 0°/0° at the exact center of the box", () => {
    const origin = projectNaturalEarth(0, 0, W, H);
    expect(origin.x).toBe(W / 2);
    expect(origin.y).toBe(H / 2);
  });

  it("puts the poles on the top and bottom edges, on the central meridian", () => {
    expect(projectNaturalEarth(0, 90, W, H)).toEqual({ x: W / 2, y: 0 });
    expect(projectNaturalEarth(0, -90, W, H)).toEqual({ x: W / 2, y: H });
  });

  it("puts the antimeridian on the left and right edges at the equator", () => {
    expect(projectNaturalEarth(-180, 0, W, H)).toEqual({ x: 0, y: H / 2 });
    expect(projectNaturalEarth(180, 0, W, H)).toEqual({ x: W, y: H / 2 });
  });

  it("pulls the antimeridian inward away from the equator (the pole line is narrower)", () => {
    // Natural Earth is pseudocylindrical: meridians bow toward the central one,
    // so 180°E at 60°N sits inside the map edge it touches at the equator.
    expect(projectNaturalEarth(180, 60, W, H).x).toBeLessThan(W);
    expect(projectNaturalEarth(180, 60, W, H).x).toBeGreaterThan(W * 0.9);
  });

  it("agrees with the published polynomial for known cities", () => {
    for (const city of CITIES) {
      const got = projectNaturalEarth(city.lng, city.lat, W, H);
      const want = reference(city.lng, city.lat);
      expect(got.x, `${city.name} x`).toBeCloseTo(want.x, 9);
      expect(got.y, `${city.name} y`).toBeCloseTo(want.y, 9);
    }
  });

  it("places known cities at their expected pixel positions", () => {
    // Pinned so an accidental re-fit of the polynomial, a flipped sign, or a
    // changed normalization shows up as a diff rather than as a map that still
    // looks vaguely right. Each is sanity-checked against the geography: the
    // box is 1000 x 520 with 0°/0° at (500, 260).
    const at = (lng: number, lat: number) => projectNaturalEarth(lng, lat, W, H);

    // Greenwich, so a hair left of the central meridian, ~18% down the map.
    expect(at(-0.1276, 51.5072).x).toBeCloseTo(499.6923, 3);
    expect(at(-0.1276, 51.5072).y).toBeCloseTo(94.6544, 3);

    // North-west quadrant.
    expect(at(-74.006, 40.7128).x).toBeCloseTo(310.9663, 3);
    expect(at(-74.006, 40.7128).y).toBeCloseTo(128.7111, 3);

    // North-east quadrant.
    expect(at(139.6917, 35.6895).x).toBeCloseTo(864.2992, 3);
    expect(at(139.6917, 35.6895).y).toBeCloseTo(144.8777, 3);

    // South-east quadrant.
    expect(at(151.2093, -33.8688).x).toBeCloseTo(896.9754, 3);
    expect(at(151.2093, -33.8688).y).toBeCloseTo(369.2402, 3);

    // South-west quadrant.
    expect(at(-46.6333, -23.5505).x).toBeCloseTo(373.8388, 3);
    expect(at(-46.6333, -23.5505).y).toBeCloseTo(335.8532, 3);

    // Nairobi is a degree south of the equator, so it sits just below the
    // horizontal midline and east of the central meridian.
    expect(at(36.8219, -1.2921).x).toBeCloseTo(602.2752, 3);
    expect(at(36.8219, -1.2921).y).toBeCloseTo(264.152, 3);
  });

  it("puts every city in the hemisphere its coordinates name", () => {
    for (const city of CITIES) {
      const { x, y } = projectNaturalEarth(city.lng, city.lat, W, H);
      expect(x > W / 2, `${city.name} east of center`).toBe(city.lng > 0);
      expect(y < H / 2, `${city.name} north of center`).toBe(city.lat > 0);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(W);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(H);
    }
  });

  it("mirrors across the equator", () => {
    for (const lat of [1, 12.5, 33.8688, 51.5072, 66.5, 89]) {
      for (const lng of [-151.2093, -30, 0, 24.5, 139.6917]) {
        const north = projectNaturalEarth(lng, lat, W, H);
        const south = projectNaturalEarth(lng, -lat, W, H);
        // A parallel and its opposite are the same width apart from the
        // central meridian, and the same distance either side of the midline.
        expect(south.x).toBeCloseTo(north.x, 10);
        expect(south.y - H / 2).toBeCloseTo(H / 2 - north.y, 10);
      }
    }
  });

  it("mirrors across the prime meridian", () => {
    for (const lng of [0.5, 46.6333, 90, 139.6917, 179]) {
      for (const lat of [-45, -1.2921, 0, 35.6895, 78]) {
        const east = projectNaturalEarth(lng, lat, W, H);
        const west = projectNaturalEarth(-lng, lat, W, H);
        // Meridian and anti-meridian-of-it land equal distances either side of
        // the map's vertical midline, at the same height.
        expect(west.y).toBeCloseTo(east.y, 10);
        expect(W / 2 - west.x).toBeCloseTo(east.x - W / 2, 10);
      }
    }
  });

  it("moves monotonically east with longitude and down with falling latitude", () => {
    let previousX = -Infinity;
    for (let lng = -180; lng <= 180; lng += 10) {
      const { x } = projectNaturalEarth(lng, 20, W, H);
      expect(x).toBeGreaterThan(previousX);
      previousX = x;
    }
    let previousY = -Infinity;
    for (let lat = 90; lat >= -90; lat -= 5) {
      const { y } = projectNaturalEarth(30, lat, W, H);
      expect(y).toBeGreaterThan(previousY);
      previousY = y;
    }
  });

  it("wraps longitudes outside ±180 onto the meridian they name", () => {
    expect(projectNaturalEarth(190, 10, W, H)).toEqual(projectNaturalEarth(-170, 10, W, H));
    expect(projectNaturalEarth(-190, 10, W, H)).toEqual(projectNaturalEarth(170, 10, W, H));
    expect(projectNaturalEarth(-720.5, 5, W, H)).toEqual(projectNaturalEarth(-0.5, 5, W, H));
    // A wrapped value that lands ON the seam normalizes into the half-open
    // [-180, 180) range, i.e. the west edge. 540°E and 180°E are the same
    // meridian, so either edge is correct; only the untouched ±180 inputs pick
    // their side, which is what keeps a coastline drawn to 180 from jumping.
    expect(projectNaturalEarth(540, -20, W, H)).toEqual(projectNaturalEarth(-180, -20, W, H));
  });

  it("keeps the two map edges distinguishable at exactly ±180", () => {
    // The wrap deliberately passes ±180 through untouched, so the seam does not
    // collapse onto one edge.
    expect(projectNaturalEarth(180, 0, W, H).x).toBe(W);
    expect(projectNaturalEarth(-180, 0, W, H).x).toBe(0);
  });

  it("clamps latitudes beyond the poles instead of wrapping them", () => {
    expect(projectNaturalEarth(0, 100, W, H)).toEqual(projectNaturalEarth(0, 90, W, H));
    expect(projectNaturalEarth(0, -100, W, H)).toEqual(projectNaturalEarth(0, -90, W, H));
  });

  it("scales linearly with the box it is handed", () => {
    for (const city of CITIES) {
      const small = projectNaturalEarth(city.lng, city.lat, W, H);
      const large = projectNaturalEarth(city.lng, city.lat, W * 3, H * 3);
      expect(large.x, `${city.name} x`).toBeCloseTo(small.x * 3, 9);
      expect(large.y, `${city.name} y`).toBeCloseTo(small.y * 3, 9);
    }
  });

  it("fills whatever box it is given, distorting rather than letterboxing", () => {
    const squashed = projectNaturalEarth(90, 45, 400, 400);
    expect(squashed.x).toBeCloseTo(projectNaturalEarth(90, 45, 400, 999).x, 12);
    expect(squashed.y).not.toBeCloseTo(projectNaturalEarth(90, 45, 400, 999).y, 3);
  });
});

describe("NATURAL_EARTH_ASPECT", () => {
  it("is the projection's own width-to-height ratio, near 1.92", () => {
    // The published ratio for Natural Earth I; a value off by more than a
    // percent means the extents stopped coming from the polynomial.
    expect(NATURAL_EARTH_ASPECT).toBeGreaterThan(1.9);
    expect(NATURAL_EARTH_ASPECT).toBeLessThan(1.95);
    expect(NATURAL_EARTH_ASPECT).toBeCloseTo(1.9231, 4);
  });

  it("derives the undistorted height for a width", () => {
    expect(naturalEarthHeight(NATURAL_EARTH_ASPECT)).toBeCloseTo(1, 12);
    expect(naturalEarthHeight(480)).toBeCloseTo(480 / NATURAL_EARTH_ASPECT, 12);
  });
});

describe("the generated world data", () => {
  it("carries the viewBox the projection derives for its width", () => {
    // The drift guard: tools/geomapgen bakes the silhouette into this box using
    // this projection, and GeoMap places its bubbles into the same box at
    // runtime. If the projection's extents ever move, this fails before a map
    // ships with coastlines and data points out of register.
    expect(WORLD_VIEW_BOX.height).toBe(Math.round(naturalEarthHeight(WORLD_VIEW_BOX.width)));
  });

  it("is a whole-unit box the aspect ratio survives rounding into", () => {
    expect(Number.isInteger(WORLD_VIEW_BOX.width)).toBe(true);
    expect(Number.isInteger(WORLD_VIEW_BOX.height)).toBe(true);
    // The rounded box is within a tenth of a percent of the true ratio, so the
    // squash from rounding is invisible.
    const boxAspect = WORLD_VIEW_BOX.width / WORLD_VIEW_BOX.height;
    expect(Math.abs(boxAspect - NATURAL_EARTH_ASPECT) / NATURAL_EARTH_ASPECT).toBeLessThan(0.001);
  });
});
