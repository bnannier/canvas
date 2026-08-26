/*
 * The GeoMap camera: the pure geometry of zooming and panning the map, and of the
 * gestures that drive it. No React, no React Native, no DOM, no theme.
 *
 * This module exists because the test harness stubs react-native-svg to fragments
 * (test/setup.ts), so nothing DRAWN is assertable. Splitting the drawing math out
 * as pure functions is the only way to prove it, which is the same reason
 * geo-map.projection.ts and chart-math.ts exist.
 *
 * The camera is an affine map in the generated viewBox's own units: a content
 * point `u` is drawn at `k * u + t`. Only the LAND is drawn through it. Bubbles
 * are placed by geoMapPlace and drawn outside the scaled group, so their radii are
 * never multiplied by k: the area encoding survives every zoom for free, bubbles
 * stay a constant size on screen, and bubbleAt keeps working in pixels.
 */
import { WORLD_VIEW_BOX } from "./geo-map.world.js";
import type { GeoMapBubble } from "./geo-map.bubbles.js";

/** The map camera in viewBox units: a content point `u` draws at `k * u + t`. */
export interface GeoMapCamera {
  /** Zoom factor. 1 is the whole world. */
  k: number;
  tx: number;
  ty: number;
}

/** The whole world, unzoomed and unpanned: what every non-zoomable map renders. */
export const WORLD_CAMERA: GeoMapCamera = { k: 1, tx: 0, ty: 0 };

// Zoom is quantized to powers of two for CLUSTERING only (the camera itself stays
// continuous, so the map scales smoothly). Four levels is 16x, which is about
// where the 1:50m source starts showing its own vertices: at a 480px map one
// viewBox unit is 0.24px, so 16x draws it at 3.8px.
export const MAX_ZOOM_LEVEL = 4;
export const MAX_ZOOM = 2 ** MAX_ZOOM_LEVEL;
/** One press of a zoom control, and one arrow-key zoom step. */
export const ZOOM_STEP = 2;
/** Wheel travel that doubles the zoom. Tuned so one notch is a nudge, not a jump. */
export const WHEEL_PX_PER_DOUBLING = 320;
/** How far a finger must travel before a one-finger drag counts as a pan, in px. */
export const PAN_SLOP = 8;
/** How far one arrow key pans, as a fraction of the visible span. */
export const NUDGE_FRACTION = 0.15;

const { width: W, height: H } = WORLD_VIEW_BOX;

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

/**
 * The discrete zoom level a factor sits in. Clustering cuts at integer levels
 * rather than continuously, so bubbles split at crisp, deliberate moments instead
 * of jittering apart and back together as a user rocks the wheel over a boundary.
 * A malformed factor reads as the whole world rather than propagating NaN.
 */
export function geoZoomLevel(factor: number): number {
  if (!Number.isFinite(factor) || factor < 1) return 0;
  return clamp(Math.floor(Math.log2(factor)), 0, MAX_ZOOM_LEVEL);
}

/** The zoom factor a level names; the inverse of geoZoomLevel on integer levels. */
export function geoZoomFactor(level: number): number {
  if (!Number.isFinite(level)) return 1;
  return 2 ** clamp(Math.round(level), 0, MAX_ZOOM_LEVEL);
}

/**
 * Hold the camera inside the world. `k` lands in [1, MAX_ZOOM]; the offsets are
 * held so the drawn content still covers the viewport, which at k = 1 collapses
 * the range to a single point and forces tx = ty = 0. That collapse is what makes
 * an unzoomed zoomable map render EXACTLY as today's map does.
 *
 * A non-finite field resolves to WORLD_CAMERA rather than drawing NaN, matching
 * how geoMapBubbles already treats malformed coordinates.
 */
export function geoMapClampCamera(camera: GeoMapCamera): GeoMapCamera {
  if (!Number.isFinite(camera.k) || !Number.isFinite(camera.tx) || !Number.isFinite(camera.ty)) {
    return WORLD_CAMERA;
  }
  const k = clamp(camera.k, 1, MAX_ZOOM);
  return { k, tx: clamp(camera.tx, W * (1 - k), 0), ty: clamp(camera.ty, H * (1 - k), 0) };
}

/**
 * Zoom to `k` about the drawn point (ax, ay), holding whatever content already sat
 * under that point still. This is what makes wheel zoom feel anchored: the place
 * under the cursor is the place that stays put.
 *
 * Solve for the content point under the anchor, then put it back: u = (ax - tx)/k,
 * and tx' = ax - k' * u.
 */
export function geoMapZoomAt(camera: GeoMapCamera, k: number, ax: number, ay: number): GeoMapCamera {
  const from = geoMapClampCamera(camera);
  if (!Number.isFinite(k) || !Number.isFinite(ax) || !Number.isFinite(ay)) return from;
  const next = clamp(k, 1, MAX_ZOOM);
  const u = (ax - from.tx) / from.k;
  const v = (ay - from.ty) / from.k;
  return geoMapClampCamera({ k: next, tx: ax - next * u, ty: ay - next * v });
}

/**
 * Multiply the zoom about the viewport's centre. No pixel dependency, so the zoom
 * controls, the keyboard and the accessibility actions all share one path with no
 * notion of where a pointer is.
 */
export function geoMapZoomBy(camera: GeoMapCamera, factor: number): GeoMapCamera {
  const from = geoMapClampCamera(camera);
  if (!Number.isFinite(factor) || factor <= 0) return from;
  return geoMapZoomAt(from, from.k * factor, W / 2, H / 2);
}

/** Slide the drawn content by (dx, dy) viewBox units, held inside the world. */
export function geoMapPanBy(camera: GeoMapCamera, dx: number, dy: number): GeoMapCamera {
  const from = geoMapClampCamera(camera);
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return from;
  return geoMapClampCamera({ k: from.k, tx: from.tx + dx, ty: from.ty + dy });
}

/**
 * Move the VIEW by a fraction of what it can see: dirX = 1 looks right, which
 * slides the content left. Scaled by 1/k so one key press covers the same share of
 * the screen at every zoom rather than flying across the world when zoomed in.
 */
export function geoMapNudge(camera: GeoMapCamera, dirX: number, dirY: number): GeoMapCamera {
  const from = geoMapClampCamera(camera);
  return geoMapPanBy(from, -dirX * NUDGE_FRACTION * W, -dirY * NUDGE_FRACTION * H);
}

/**
 * The camera a key press produces, or null when the key is not ours OR would
 * change nothing. Returning null for a no-op is what lets an arrow key at 1x fall
 * through to the page instead of being silently swallowed by a map that cannot pan.
 */
export function geoMapKeyCamera(camera: GeoMapCamera, key: string): GeoMapCamera | null {
  const from = geoMapClampCamera(camera);
  let next: GeoMapCamera | null = null;
  if (key === "+" || key === "=") next = geoMapZoomBy(from, ZOOM_STEP);
  else if (key === "-" || key === "_") next = geoMapZoomBy(from, 1 / ZOOM_STEP);
  else if (key === "ArrowRight") next = geoMapNudge(from, 1, 0);
  else if (key === "ArrowLeft") next = geoMapNudge(from, -1, 0);
  else if (key === "ArrowUp") next = geoMapNudge(from, 0, -1);
  else if (key === "ArrowDown") next = geoMapNudge(from, 0, 1);
  else if (key === "0" || key === "Home") next = WORLD_CAMERA;
  if (!next) return null;
  return next.k === from.k && next.tx === from.tx && next.ty === from.ty ? null : next;
}

/**
 * The zoom factor a wheel gesture asks for. Exponential in the travel, so the
 * zoom feels the same whether the user is at 1x or 8x, and symmetric: scrolling
 * back the same distance lands exactly where it started.
 */
export function geoMapWheelFactor(deltaPx: number): number {
  if (!Number.isFinite(deltaPx)) return 1;
  return 2 ** (-deltaPx / WHEEL_PX_PER_DOUBLING);
}

/** The zoom factor a pinch asks for: how much the fingers have spread. */
export function geoMapPinchFactor(startSpan: number, span: number): number {
  if (!Number.isFinite(startSpan) || !Number.isFinite(span) || startSpan <= 0 || span <= 0) return 1;
  return span / startSpan;
}

/**
 * Forward-map bubble CENTRES through the camera. The radius is deliberately
 * untouched: bubbles are drawn outside the scaled group, so they keep a constant
 * size on screen and the sqrt-area encoding cannot be distorted by the zoom.
 *
 * The identity at WORLD_CAMERA, which is what licenses leaving every existing
 * bubbleAt test alone.
 */
export function geoMapPlace(bubbles: readonly GeoMapBubble[], camera: GeoMapCamera): GeoMapBubble[] {
  const { k, tx, ty } = geoMapClampCamera(camera);
  return bubbles.map((b) => ({ x: k * b.x + tx, y: k * b.y + ty, r: b.r }));
}

/** True when a placed bubble's centre is still inside the viewport. */
export function geoMapInView(placed: GeoMapBubble): boolean {
  return placed.x >= 0 && placed.x <= W && placed.y >= 0 && placed.y <= H;
}

/**
 * The camera as the column-major six-number matrix react-native-svg accepts
 * identically on all three platforms: [a, b, c, d, e, f] is
 * `matrix(k, 0, 0, k, tx, ty)`. The numeric form is deliberate: a transform
 * STRING is PEG-parsed on every native update, while the array is read straight.
 */
export function geoMapMatrix(camera: GeoMapCamera): [number, number, number, number, number, number] {
  const { k, tx, ty } = geoMapClampCamera(camera);
  return [k, 0, 0, k, tx, ty];
}

/* ---------------------------------------------------------------- gestures -- */

/** One finger, in viewBox units. */
export interface GeoMapTouch {
  x: number;
  y: number;
}

/** What a gesture latched when it began, so every move can be absolute. */
export interface GeoMapGesture {
  camera: GeoMapCamera;
  /** Distance between the first two fingers when this was latched; 0 for one. */
  span: number;
  /** Centroid of the fingers when this was latched, in viewBox units. */
  cx: number;
  cy: number;
  /** How many fingers were down. A change re-latches. */
  touches: number;
}

export const GEO_MAP_GESTURE_IDLE: GeoMapGesture = { camera: WORLD_CAMERA, span: 0, cx: 0, cy: 0, touches: 0 };

function centroid(touches: readonly GeoMapTouch[]): { cx: number; cy: number } {
  let cx = 0;
  let cy = 0;
  for (const t of touches) {
    cx += t.x;
    cy += t.y;
  }
  return { cx: cx / touches.length, cy: cy / touches.length };
}

function spanOf(touches: readonly GeoMapTouch[]): number {
  return touches.length < 2 ? 0 : Math.hypot(touches[1].x - touches[0].x, touches[1].y - touches[0].y);
}

/**
 * Advance a gesture. On "grant", and whenever the finger COUNT changes mid-gesture,
 * this latches the camera, the finger span and the centroid, and moves nothing.
 * Every "move" then recomputes FROM those latched values rather than accumulating:
 *
 *   k'  = latched.k * (span / latched.span)      (one finger leaves k alone)
 *   u   = (latched.cx - latched.tx) / latched.k  (the content under the centroid)
 *   tx' = cx - k' * u                            (put it back under the centroid)
 *
 * Absolute, not incremental, so replaying a move ten times lands exactly where
 * replaying it once does and no drift can accumulate over a long gesture. It also
 * means two fingers moving the same direction PAN rather than zoom, because the
 * span is unchanged while the centroid moves, which is the exact bug that a
 * PanResponder gestureState dx/dy implementation ships.
 *
 * Callers must read the fingers by ARRAY POSITION within one event, never match
 * them by identifier across events: react-native-web normalizes identifiers with
 * `identifier % 20`, so two touches can collide on one id.
 */
export function geoMapGestureEvent(
  phase: "grant" | "move",
  touches: readonly GeoMapTouch[],
  gesture: GeoMapGesture,
  camera: GeoMapCamera,
): { gesture: GeoMapGesture; camera: GeoMapCamera } {
  const held = geoMapClampCamera(camera);
  if (touches.length === 0) return { gesture: GEO_MAP_GESTURE_IDLE, camera: held };

  const { cx, cy } = centroid(touches);
  const span = spanOf(touches);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return { gesture, camera: held };

  // Latch on grant, and re-latch the instant a finger joins or leaves, so the
  // second finger arriving mid-drag does not read as an enormous sudden pinch.
  if (phase === "grant" || touches.length !== gesture.touches) {
    return { gesture: { camera: held, span, cx, cy, touches: touches.length }, camera: held };
  }

  const from = gesture.camera;
  const factor = touches.length >= 2 ? geoMapPinchFactor(gesture.span, span) : 1;
  const k = clamp(from.k * factor, 1, MAX_ZOOM);
  const u = (gesture.cx - from.tx) / from.k;
  const v = (gesture.cy - from.ty) / from.k;
  return { gesture, camera: geoMapClampCamera({ k, tx: cx - k * u, ty: cy - k * v }) };
}
