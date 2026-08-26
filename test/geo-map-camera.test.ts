import { describe, it, expect } from "bun:test";
import {
  WORLD_CAMERA,
  MAX_ZOOM,
  MAX_ZOOM_LEVEL,
  ZOOM_STEP,
  WHEEL_PX_PER_DOUBLING,
  GEO_MAP_GESTURE_IDLE,
  type GeoMapCamera,
  type GeoMapTouch,
  geoZoomLevel,
  geoZoomFactor,
  geoMapClampCamera,
  geoMapZoomAt,
  geoMapZoomBy,
  geoMapPanBy,
  geoMapNudge,
  geoMapKeyCamera,
  geoMapWheelFactor,
  geoMapPinchFactor,
  geoMapPlace,
  geoMapInView,
  geoMapMatrix,
  geoMapGestureEvent,
} from "../src/charts/geo-map/geo-map.camera.ts";
import { bubbleAt, geoMapBubbles, type GeoMapBubble } from "../src/charts/geo-map/geo-map.shared.tsx";
import { WORLD_VIEW_BOX } from "../src/charts/geo-map/geo-map.world.ts";

// The camera's geometry, proven with no renderer: the harness stubs
// react-native-svg to fragments, so the transform it emits is unassertable from
// the DOM and these pure functions are the only place the math can be checked.

const { width: W, height: H } = WORLD_VIEW_BOX;

const POINTS = [
  { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
  { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
  { label: "Tokyo", lat: 35.6895, lng: 139.6917, count: 3110 },
  { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 },
];
const BUBBLES = geoMapBubbles(POINTS);

/** The content point currently drawn at (ax, ay). */
const contentUnder = (c: GeoMapCamera, ax: number, ay: number) => ({ u: (ax - c.tx) / c.k, v: (ay - c.ty) / c.k });
const touch = (x: number, y: number): GeoMapTouch => ({ x, y });

describe("geoMapClampCamera (pure)", () => {
  it("collapses to no offset at all at 1x, so an unzoomed map is exactly today's map", () => {
    expect(geoMapClampCamera({ k: 1, tx: -500, ty: -400 })).toEqual(WORLD_CAMERA);
    expect(geoMapClampCamera(WORLD_CAMERA)).toEqual(WORLD_CAMERA);
  });

  it("cannot be zoomed past the ends of its range", () => {
    expect(geoMapClampCamera({ k: 0.1, tx: 0, ty: 0 }).k).toBe(1);
    expect(geoMapClampCamera({ k: 9_999, tx: 0, ty: 0 }).k).toBe(MAX_ZOOM);
  });

  it("cannot be panned past the edge of the world, so no ocean-only view exists", () => {
    const k = 4;
    // Pushed hard in both directions, the offsets stop where the content still
    // covers the viewport: 0 on one side, W*(1-k) / H*(1-k) on the other.
    expect(geoMapClampCamera({ k, tx: 9_999, ty: 9_999 })).toEqual({ k, tx: 0, ty: 0 });
    expect(geoMapClampCamera({ k, tx: -9_999, ty: -9_999 })).toEqual({ k, tx: W * (1 - k), ty: H * (1 - k) });
  });

  it("resolves a malformed camera to the whole world rather than drawing NaN", () => {
    expect(geoMapClampCamera({ k: NaN, tx: 0, ty: 0 })).toEqual(WORLD_CAMERA);
    expect(geoMapClampCamera({ k: 2, tx: Infinity, ty: 0 })).toEqual(WORLD_CAMERA);
  });
});

describe("geoMapPlace (pure)", () => {
  it("is the identity at the world camera, which is what licenses leaving bubbleAt alone", () => {
    expect(geoMapPlace(BUBBLES, WORLD_CAMERA)).toEqual(BUBBLES);
  });

  it("moves a bubble's CENTRE and never its radius, because bubbles draw outside the scaled group", () => {
    // The whole area encoding depends on this: a zoom that scaled r would make
    // the disc stop meaning "count" the moment anyone touched the wheel.
    for (const k of [1, 2, 4, 8, MAX_ZOOM]) {
      const placed = geoMapPlace(BUBBLES, geoMapClampCamera({ k, tx: 0, ty: 0 }));
      expect(placed.map((b) => b.r)).toEqual(BUBBLES.map((b) => b.r));
    }
  });

  it("composes with bubbleAt so a press resolves to the bubble under the finger, panned or not", () => {
    const scale = 480 / W; // px per viewBox unit, exactly what the component passes
    for (const camera of [
      WORLD_CAMERA,
      geoMapClampCamera({ k: 4, tx: 0, ty: 0 }),
      geoMapClampCamera({ k: 4, tx: -1_200, ty: -600 }),
      geoMapClampCamera({ k: MAX_ZOOM, tx: -9_000, ty: -4_000 }),
    ]) {
      const placed = geoMapPlace(BUBBLES, camera);
      placed.forEach((b, i) => {
        // Only bubbles still on screen can be pressed; the rest are clipped away.
        if (geoMapInView(b)) expect(bubbleAt(placed, b.x * scale, b.y * scale, scale)).toBe(i);
      });
    }
  });

  it("keeps the fingertip target in PIXELS, so a small bubble does not swallow the map at full zoom", () => {
    const scale = 480 / W;
    const tiny: GeoMapBubble[] = [{ x: 1_000, y: 520, r: 1 }];
    const placed = geoMapPlace(tiny, geoMapClampCamera({ k: MAX_ZOOM, tx: 0, ty: 0 }));
    // 40px away is outside the 12px slop whatever the zoom, because MIN_HIT is
    // px and is never multiplied by k.
    expect(bubbleAt(placed, placed[0].x * scale + 40, placed[0].y * scale, scale)).toBeNull();
    expect(bubbleAt(placed, placed[0].x * scale + 2, placed[0].y * scale, scale)).toBe(0);
  });
});

describe("geoMapZoomAt (pure)", () => {
  it("holds the point under the cursor still while the map grows around it", () => {
    // The anchor stays central enough that the edge clamp never binds, which is
    // the regime the property actually claims.
    for (const [ax, ay] of [[W / 2, H / 2], [W / 2 + 120, H / 2 - 80], [W / 2 - 200, H / 2 + 150]]) {
      let camera = WORLD_CAMERA;
      const before = contentUnder(camera, ax, ay);
      for (const k of [2, 4, 8]) {
        camera = geoMapZoomAt(camera, k, ax, ay);
        const after = contentUnder(camera, ax, ay);
        expect(after.u).toBeCloseTo(before.u, 9);
        expect(after.v).toBeCloseTo(before.v, 9);
      }
    }
  });

  it("refuses a malformed zoom or anchor rather than losing the camera", () => {
    const camera = geoMapClampCamera({ k: 4, tx: -100, ty: -50 });
    expect(geoMapZoomAt(camera, NaN, 100, 100)).toEqual(camera);
    expect(geoMapZoomAt(camera, 8, Infinity, 100)).toEqual(camera);
  });
});

describe("geoMapZoomBy / geoMapPanBy / geoMapNudge (pure)", () => {
  it("zooms about the centre, so a control press needs no pointer", () => {
    const zoomed = geoMapZoomBy(WORLD_CAMERA, ZOOM_STEP);
    expect(zoomed.k).toBe(2);
    const centre = contentUnder(zoomed, W / 2, H / 2);
    expect(centre.u).toBeCloseTo(W / 2, 9);
    expect(centre.v).toBeCloseTo(H / 2, 9);
  });

  it("round-trips: zooming in a step and back out lands exactly where it started", () => {
    const there = geoMapZoomBy(WORLD_CAMERA, ZOOM_STEP);
    expect(geoMapZoomBy(there, 1 / ZOOM_STEP)).toEqual(WORLD_CAMERA);
  });

  it("cannot pan at 1x, because there is nothing off screen to reach", () => {
    expect(geoMapPanBy(WORLD_CAMERA, -300, -200)).toEqual(WORLD_CAMERA);
    expect(geoMapNudge(WORLD_CAMERA, 1, 0)).toEqual(WORLD_CAMERA);
  });

  it("looks right by sliding the content left, and covers the same share at every zoom", () => {
    const near = geoMapZoomBy(WORLD_CAMERA, 2);
    const far = geoMapZoomBy(WORLD_CAMERA, 8);
    expect(geoMapNudge(near, 1, 0).tx).toBeLessThan(near.tx);
    expect(geoMapNudge(near, -1, 0).tx).toBeGreaterThanOrEqual(near.tx);
    // Same drawn distance whatever k, so a key press feels identical at any zoom.
    expect(near.tx - geoMapNudge(near, 1, 0).tx).toBeCloseTo(far.tx - geoMapNudge(far, 1, 0).tx, 9);
  });
});

describe("geoMapKeyCamera (pure)", () => {
  it("zooms, pans and resets from the keys a pointer-free user has", () => {
    expect(geoMapKeyCamera(WORLD_CAMERA, "+")!.k).toBe(2);
    expect(geoMapKeyCamera(WORLD_CAMERA, "=")!.k).toBe(2);
    const zoomed = geoMapZoomBy(WORLD_CAMERA, 4);
    expect(geoMapKeyCamera(zoomed, "-")!.k).toBe(2);
    expect(geoMapKeyCamera(zoomed, "ArrowRight")!.tx).toBeLessThan(zoomed.tx);
    expect(geoMapKeyCamera(zoomed, "0")).toEqual(WORLD_CAMERA);
    expect(geoMapKeyCamera(zoomed, "Home")).toEqual(WORLD_CAMERA);
  });

  it("returns null for a key it does not own, so Tab still moves focus", () => {
    expect(geoMapKeyCamera(WORLD_CAMERA, "Tab")).toBeNull();
    expect(geoMapKeyCamera(WORLD_CAMERA, "a")).toBeNull();
    expect(geoMapKeyCamera(WORLD_CAMERA, "Enter")).toBeNull();
  });

  it("returns null when the key would change nothing, so the page keeps the scroll", () => {
    // An arrow at 1x cannot pan, so the map must not swallow it.
    expect(geoMapKeyCamera(WORLD_CAMERA, "ArrowRight")).toBeNull();
    expect(geoMapKeyCamera(WORLD_CAMERA, "ArrowDown")).toBeNull();
    expect(geoMapKeyCamera(WORLD_CAMERA, "-")).toBeNull();
    // And zooming in at the ceiling is likewise a no-op.
    expect(geoMapKeyCamera(geoMapClampCamera({ k: MAX_ZOOM, tx: 0, ty: 0 }), "+")).toBeNull();
  });
});

describe("geoZoomLevel / geoZoomFactor (pure)", () => {
  it("quantizes the continuous camera into the power-of-two steps clustering cuts at", () => {
    expect(geoZoomLevel(1)).toBe(0);
    expect(geoZoomLevel(1.9)).toBe(0);
    expect(geoZoomLevel(2)).toBe(1);
    expect(geoZoomLevel(MAX_ZOOM)).toBe(MAX_ZOOM_LEVEL);
    expect(geoZoomLevel(1_000)).toBe(MAX_ZOOM_LEVEL);
    expect(geoZoomLevel(NaN)).toBe(0);
    expect(geoZoomLevel(0)).toBe(0);
  });

  it("round-trips every level", () => {
    for (let level = 0; level <= MAX_ZOOM_LEVEL; level += 1) {
      expect(geoZoomLevel(geoZoomFactor(level))).toBe(level);
    }
  });

  it("never decreases over a smooth zoom-in, and changes at most MAX_ZOOM_LEVEL times", () => {
    // This is the anti-flicker guarantee at the quantization layer: a user rocking
    // the wheel inside one level sees no re-clustering at all.
    let previous = 0;
    let changes = 0;
    for (let i = 0; i <= 200; i += 1) {
      const level = geoZoomLevel(1 + (i / 200) * (MAX_ZOOM - 1));
      expect(level).toBeGreaterThanOrEqual(previous);
      if (level !== previous) changes += 1;
      previous = level;
    }
    expect(changes).toBe(MAX_ZOOM_LEVEL);
  });
});

describe("geoMapWheelFactor / geoMapPinchFactor (pure)", () => {
  it("doubles over one doubling of travel, whatever the notch size", () => {
    expect(geoMapWheelFactor(-WHEEL_PX_PER_DOUBLING)).toBeCloseTo(2, 9);
    expect(geoMapWheelFactor(WHEEL_PX_PER_DOUBLING)).toBeCloseTo(0.5, 9);
    expect(geoMapWheelFactor(0)).toBe(1);
    // Four small notches equal one big one: the gesture is scroll-distance based,
    // not event-count based, so a trackpad and a mouse wheel agree.
    const quarter = geoMapWheelFactor(-WHEEL_PX_PER_DOUBLING / 4);
    expect(quarter ** 4).toBeCloseTo(2, 9);
  });

  it("is symmetric, so scrolling back lands exactly where it started", () => {
    expect(geoMapWheelFactor(-140) * geoMapWheelFactor(140)).toBeCloseTo(1, 9);
  });

  it("reads a pinch as the ratio of the finger span, and never divides by zero", () => {
    expect(geoMapPinchFactor(100, 200)).toBe(2);
    expect(geoMapPinchFactor(200, 100)).toBe(0.5);
    expect(geoMapPinchFactor(0, 100)).toBe(1);
    expect(geoMapPinchFactor(100, NaN)).toBe(1);
  });
});

describe("geoMapMatrix (pure)", () => {
  it("emits the column-major six-number form react-native-svg reads on all three platforms", () => {
    // Pinned deliberately: the NUMERIC form skips the PEG parse a transform
    // STRING costs on every native update.
    expect(geoMapMatrix(WORLD_CAMERA)).toEqual([1, 0, 0, 1, 0, 0]);
    expect(geoMapMatrix(geoMapClampCamera({ k: 4, tx: -100, ty: -50 }))).toEqual([4, 0, 0, 4, -100, -50]);
  });
});

describe("geoMapGestureEvent (pure)", () => {
  const grant = (touches: GeoMapTouch[], camera = WORLD_CAMERA) =>
    geoMapGestureEvent("grant", touches, GEO_MAP_GESTURE_IDLE, camera);

  it("moves nothing on the grant, it only latches", () => {
    const two = [touch(900, 500), touch(1_100, 540)];
    const { gesture, camera } = grant(two);
    expect(camera).toEqual(WORLD_CAMERA);
    expect(gesture.touches).toBe(2);
    expect(gesture.span).toBeCloseTo(Math.hypot(200, 40), 9);
    expect(gesture.cx).toBe(1_000);
  });

  it("scales by the ratio of the finger span", () => {
    const start = [touch(900, 520), touch(1_100, 520)];
    const g = grant(start);
    // Fingers spread to twice the span about the same centroid.
    const wide = [touch(800, 520), touch(1_200, 520)];
    expect(geoMapGestureEvent("move", wide, g.gesture, g.camera).camera.k).toBeCloseTo(2, 9);
  });

  it("ignores a two-finger drift in the same direction, which is a pan and not a pinch", () => {
    // The exact bug a PanResponder gestureState dx/dy implementation ships.
    const start = [touch(900, 520), touch(1_100, 520)];
    const g = grant(start, geoMapZoomBy(WORLD_CAMERA, 4));
    const drifted = [touch(940, 560), touch(1_140, 560)];
    const next = geoMapGestureEvent("move", drifted, g.gesture, g.camera).camera;
    expect(next.k).toBeCloseTo(g.camera.k, 9);
    expect(next.tx).toBeGreaterThan(g.camera.tx);
  });

  it("pans on one finger without touching the zoom", () => {
    const zoomed = geoMapZoomBy(WORLD_CAMERA, 4);
    const g = grant([touch(1_000, 520)], zoomed);
    const next = geoMapGestureEvent("move", [touch(1_100, 560)], g.gesture, g.camera).camera;
    expect(next.k).toBe(zoomed.k);
    expect(next.tx).toBeCloseTo(zoomed.tx + 100, 9);
    expect(next.ty).toBeCloseTo(zoomed.ty + 40, 9);
  });

  it("is absolute, not incremental: replaying one move ten times lands where once does", () => {
    const zoomed = geoMapZoomBy(WORLD_CAMERA, 4);
    const g = grant([touch(1_000, 520), touch(1_200, 520)], zoomed);
    const moved = [touch(950, 520), touch(1_250, 520)];
    const once = geoMapGestureEvent("move", moved, g.gesture, g.camera).camera;
    let state = g;
    for (let i = 0; i < 10; i += 1) state = geoMapGestureEvent("move", moved, state.gesture, state.camera);
    expect(state.camera.k).toBeCloseTo(once.k, 9);
    expect(state.camera.tx).toBeCloseTo(once.tx, 9);
    expect(state.camera.ty).toBeCloseTo(once.ty, 9);
  });

  it("re-latches when a finger joins mid-gesture, so the map does not jump", () => {
    const zoomed = geoMapZoomBy(WORLD_CAMERA, 4);
    const g = grant([touch(1_000, 520)], zoomed);
    const two = [touch(1_000, 520), touch(1_200, 520)];
    const next = geoMapGestureEvent("move", two, g.gesture, g.camera);
    // The second finger only re-latches; it must not read as a sudden pinch from
    // a span of zero.
    expect(next.camera).toEqual(g.camera);
    expect(next.gesture.touches).toBe(2);
    expect(next.gesture.span).toBeCloseTo(200, 9);
  });

  it("returns to idle when every finger lifts", () => {
    const g = grant([touch(1_000, 520)], geoMapZoomBy(WORLD_CAMERA, 4));
    expect(geoMapGestureEvent("move", [], g.gesture, g.camera).gesture).toEqual(GEO_MAP_GESTURE_IDLE);
  });

  it("holds the content under the pinch centroid still, the way the cursor anchor does", () => {
    const zoomed = geoMapZoomBy(WORLD_CAMERA, 2);
    const start = [touch(900, 500), touch(1_100, 540)];
    const g = grant(start, zoomed);
    const before = contentUnder(g.camera, g.gesture.cx, g.gesture.cy);
    const wider = [touch(850, 480), touch(1_150, 560)];
    const next = geoMapGestureEvent("move", wider, g.gesture, g.camera).camera;
    const cx = (wider[0].x + wider[1].x) / 2;
    const cy = (wider[0].y + wider[1].y) / 2;
    const after = contentUnder(next, cx, cy);
    expect(after.u).toBeCloseTo(before.u, 6);
    expect(after.v).toBeCloseTo(before.v, 6);
  });
});
