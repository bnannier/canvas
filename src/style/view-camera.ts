/*
 * The pan-and-zoom camera shared by every zoomable surface (GeoMap, FlowEditor): the pure
 * geometry of zooming and panning a drawing, and of the gestures that drive it. No React,
 * no React Native, no DOM, no theme, so all of it is provable in tests.
 *
 * The camera is an affine map in the surface's own units: a content point `u` is drawn at
 * `k * u + t`. A surface supplies its limits: the zoom range, and optionally a content box
 * the drawing must keep covering (GeoMap's world), which pins the offsets so no empty space
 * ever shows. Without a cover the drawing pans freely (FlowEditor's unbounded canvas).
 */

/** A camera: a content point `u` draws at `k * u + t`. */
export interface ViewCamera {
  /** Zoom factor. 1 draws content at its own size. */
  k: number;
  tx: number;
  ty: number;
}

/** What a surface allows its camera to do. */
export interface ViewCameraLimits {
  minZoom: number;
  maxZoom: number;
  /** A content box, from the origin, that must keep covering a viewport of the same size.
   *  Omit for a freely panning surface. */
  cover?: { width: number; height: number };
}

/** The unzoomed, unpanned camera. */
export const IDENTITY_CAMERA: ViewCamera = { k: 1, tx: 0, ty: 0 };

/** How far a finger must travel before a one-finger drag counts as a pan, in px. */
export const PAN_SLOP = 8;

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

/**
 * Hold the camera inside its limits. `k` lands in the zoom range; with a cover, the offsets
 * are held so the drawn content still covers the viewport. A non-finite field resolves to
 * the identity camera rather than drawing NaN.
 */
export function clampViewCamera(camera: ViewCamera, limits: ViewCameraLimits): ViewCamera {
  if (!Number.isFinite(camera.k) || !Number.isFinite(camera.tx) || !Number.isFinite(camera.ty)) {
    return IDENTITY_CAMERA;
  }
  const k = clamp(camera.k, limits.minZoom, limits.maxZoom);
  if (!limits.cover) return { k, tx: camera.tx, ty: camera.ty };
  const { width, height } = limits.cover;
  return { k, tx: clamp(camera.tx, width * (1 - k), 0), ty: clamp(camera.ty, height * (1 - k), 0) };
}

/**
 * Zoom to `k` about the drawn point (ax, ay), holding whatever content already sat under
 * that point still: u = (ax - tx) / k, then tx' = ax - k' * u.
 */
export function zoomViewCameraAt(camera: ViewCamera, k: number, ax: number, ay: number, limits: ViewCameraLimits): ViewCamera {
  const from = clampViewCamera(camera, limits);
  if (!Number.isFinite(k) || !Number.isFinite(ax) || !Number.isFinite(ay)) return from;
  const next = clamp(k, limits.minZoom, limits.maxZoom);
  const u = (ax - from.tx) / from.k;
  const v = (ay - from.ty) / from.k;
  return clampViewCamera({ k: next, tx: ax - next * u, ty: ay - next * v }, limits);
}

/** Multiply the zoom about the drawn point (cx, cy), usually the viewport's centre. */
export function zoomViewCameraBy(camera: ViewCamera, factor: number, cx: number, cy: number, limits: ViewCameraLimits): ViewCamera {
  const from = clampViewCamera(camera, limits);
  if (!Number.isFinite(factor) || factor <= 0) return from;
  return zoomViewCameraAt(from, from.k * factor, cx, cy, limits);
}

/** Slide the drawn content by (dx, dy) surface units, held inside the limits. */
export function panViewCameraBy(camera: ViewCamera, dx: number, dy: number, limits: ViewCameraLimits): ViewCamera {
  const from = clampViewCamera(camera, limits);
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return from;
  return clampViewCamera({ k: from.k, tx: from.tx + dx, ty: from.ty + dy }, limits);
}

/**
 * The zoom factor a wheel gesture asks for. Exponential in the travel, so the zoom feels
 * the same at every factor, and symmetric: scrolling back the same distance lands exactly
 * where it started. `pxPerDoubling` is the travel that doubles the zoom.
 */
export function viewCameraWheelFactor(deltaPx: number, pxPerDoubling: number): number {
  if (!Number.isFinite(deltaPx)) return 1;
  return 2 ** (-deltaPx / pxPerDoubling);
}

/** The zoom factor a pinch asks for: how much the fingers have spread. */
export function viewCameraPinchFactor(startSpan: number, span: number): number {
  if (!Number.isFinite(startSpan) || !Number.isFinite(span) || startSpan <= 0 || span <= 0) return 1;
  return span / startSpan;
}

/** The point a drawn point (x, y) shows: the inverse of the camera. */
export function viewCameraToContent(camera: ViewCamera, x: number, y: number): { x: number; y: number } {
  return { x: (x - camera.tx) / camera.k, y: (y - camera.ty) / camera.k };
}

/**
 * The camera as the six-number matrix react-native-svg accepts identically on all three
 * platforms: `matrix(k, 0, 0, k, tx, ty)`. The numeric form is read straight, where a
 * transform string is parsed on every native update.
 */
export function viewCameraMatrix(camera: ViewCamera): [number, number, number, number, number, number] {
  return [camera.k, 0, 0, camera.k, camera.tx, camera.ty];
}

/* ---------------------------------------------------------------- gestures -- */

/** One finger, in surface units. */
export interface ViewCameraTouch {
  x: number;
  y: number;
}

/** What a gesture latched when it began, so every move can be absolute. */
export interface ViewCameraGesture {
  camera: ViewCamera;
  /** Distance between the first two fingers when this was latched; 0 for one. */
  span: number;
  /** Centroid of the fingers when this was latched. */
  cx: number;
  cy: number;
  /** How many fingers were down. A change re-latches. */
  touches: number;
}

export const VIEW_CAMERA_GESTURE_IDLE: ViewCameraGesture = { camera: IDENTITY_CAMERA, span: 0, cx: 0, cy: 0, touches: 0 };

function centroid(touches: readonly ViewCameraTouch[]): { cx: number; cy: number } {
  let cx = 0;
  let cy = 0;
  for (const t of touches) {
    cx += t.x;
    cy += t.y;
  }
  return { cx: cx / touches.length, cy: cy / touches.length };
}

function spanOf(touches: readonly ViewCameraTouch[]): number {
  return touches.length < 2 ? 0 : Math.hypot(touches[1].x - touches[0].x, touches[1].y - touches[0].y);
}

/**
 * Advance a gesture. On "grant", and whenever the finger COUNT changes mid-gesture, this
 * latches the camera, the finger span and the centroid, and moves nothing. Every "move"
 * then recomputes FROM those latched values rather than accumulating:
 *
 *   k'  = latched.k * (span / latched.span)      (one finger leaves k alone)
 *   u   = (latched.cx - latched.tx) / latched.k  (the content under the centroid)
 *   tx' = cx - k' * u                            (put it back under the centroid)
 *
 * Absolute, not incremental, so no drift accumulates over a long gesture, and two fingers
 * moving the same direction pan rather than zoom.
 *
 * Callers must read the fingers by ARRAY POSITION within one event, never match them by
 * identifier across events: react-native-web normalizes identifiers with `identifier % 20`,
 * so two touches can collide on one id.
 */
export function viewCameraGestureEvent(
  phase: "grant" | "move",
  touches: readonly ViewCameraTouch[],
  gesture: ViewCameraGesture,
  camera: ViewCamera,
  limits: ViewCameraLimits,
): { gesture: ViewCameraGesture; camera: ViewCamera } {
  const held = clampViewCamera(camera, limits);
  if (touches.length === 0) return { gesture: VIEW_CAMERA_GESTURE_IDLE, camera: held };

  const { cx, cy } = centroid(touches);
  const span = spanOf(touches);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return { gesture, camera: held };

  // Latch on grant, and re-latch the instant a finger joins or leaves, so the second
  // finger arriving mid-drag does not read as an enormous sudden pinch.
  if (phase === "grant" || touches.length !== gesture.touches) {
    return { gesture: { camera: held, span, cx, cy, touches: touches.length }, camera: held };
  }

  const from = gesture.camera;
  const factor = touches.length >= 2 ? viewCameraPinchFactor(gesture.span, span) : 1;
  const k = clamp(from.k * factor, limits.minZoom, limits.maxZoom);
  const u = (gesture.cx - from.tx) / from.k;
  const v = (gesture.cy - from.ty) / from.k;
  return { gesture, camera: clampViewCamera({ k, tx: cx - k * u, ty: cy - k * v }, limits) };
}
