/*
 * FlowEditor's pure logic: node and port geometry, edge paths, snapping, hit testing, fitting
 * the view to the graph, and keyboard moves. No React, no React Native, no theme, so every
 * piece is provable in tests (the test harness stubs react-native-svg, so nothing drawn is
 * assertable; the geometry is).
 *
 * Coordinates are content units: a node's (x, y) is its top-left corner at zoom 1. The camera
 * (src/style/view-camera.ts) maps content to the viewport.
 */
import { clampViewCamera, IDENTITY_CAMERA, type ViewCamera, type ViewCameraLimits } from "../../style/view-camera.js";

/** One step of a workflow or flow: a card on the canvas. */
export interface FlowNode {
  /** Stable id, unique within the editor. */
  id: string;
  /** The card's title. */
  label: string;
  /** A muted second line under the title. */
  description?: string;
  /** Top-left corner in content units. */
  x: number;
  y: number;
}

/** A directed connection from one node's output port to another node's input port. */
export interface FlowEdge {
  /** Stable id, unique within the editor. */
  id: string;
  from: string;
  to: string;
  /** Text drawn at the middle of the edge, such as its condition. */
  label?: string;
  /** Draw the edge dashed: a path that returns work upstream. */
  rework?: boolean;
}

/** An entry in the palette: a kind of node the user can add. */
export interface FlowPaletteItem {
  id: string;
  label: string;
  /** Refuse adding this kind, for example when the graph already has one. */
  disabled?: boolean;
}

/** What is selected: a node or an edge, by id. */
export type FlowSelection = { kind: "node"; id: string } | { kind: "edge"; id: string };

/** Card size in content units. */
export const FLOW_NODE_WIDTH = 176;
export const FLOW_NODE_HEIGHT = 64;
/** The snapping grid, and one arrow-key move. */
export const FLOW_GRID = 24;
/** The visible port dot's radius, and the larger touch radius around it. */
export const FLOW_PORT_RADIUS = 6;
export const FLOW_PORT_HIT_RADIUS = 18;
/** Zoom range: a quarter size to double size. */
export const FLOW_CAMERA_LIMITS: ViewCameraLimits = { minZoom: 0.25, maxZoom: 2 };
/** Wheel travel that doubles the zoom. */
export const FLOW_WHEEL_PX_PER_DOUBLING = 480;
/** One zoom control press. */
export const FLOW_ZOOM_STEP = 1.25;
/** Space kept around the graph when the view fits it. */
export const FLOW_FIT_PADDING = 48;

/** A point in content units. */
export interface FlowPoint {
  x: number;
  y: number;
}

/** Round a point to the grid. */
export function snapFlowPoint(point: FlowPoint, grid = FLOW_GRID): FlowPoint {
  if (!(grid > 0)) return point;
  return { x: Math.round(point.x / grid) * grid, y: Math.round(point.y / grid) * grid };
}

/** Where a node's output port (right edge, middle) and input port (left edge, middle) sit. */
export function flowPorts(node: FlowNode): { out: FlowPoint; in: FlowPoint } {
  const y = node.y + FLOW_NODE_HEIGHT / 2;
  return { out: { x: node.x + FLOW_NODE_WIDTH, y }, in: { x: node.x, y } };
}

/** A drawn edge: its SVG path, where its label sits, and its arrowhead's tip and direction. */
export interface FlowEdgeGeometry {
  d: string;
  label: FlowPoint;
  tip: FlowPoint;
  /** The direction the arrow points, in radians. */
  angle: number;
  /** The cubic's start, two handles and end, for hit testing. */
  curve: readonly [FlowPoint, FlowPoint, FlowPoint, FlowPoint];
}

function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubic(a: FlowPoint, c1: FlowPoint, c2: FlowPoint, b: FlowPoint): FlowEdgeGeometry {
  return {
    d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`,
    label: { x: cubicAt(a.x, c1.x, c2.x, b.x, 0.5), y: cubicAt(a.y, c1.y, c2.y, b.y, 0.5) },
    tip: b,
    angle: Math.atan2(b.y - c2.y, b.x - c2.x),
    curve: [a, c1, c2, b],
  };
}

/**
 * The path from one port to another. A forward edge is an S-curve whose handles reach out
 * horizontally; an edge that runs backward (to a node at or left of its source) loops below
 * both cards so it never cuts through them; an edge to its own node loops over the card.
 */
export function flowEdgeGeometry(from: FlowNode, to: FlowNode | FlowPoint): FlowEdgeGeometry {
  const a = flowPorts(from).out;
  if ("id" in to && to.id === from.id) {
    const b = flowPorts(to).in;
    const top = from.y - FLOW_NODE_HEIGHT * 0.9;
    return cubic(a, { x: a.x + 72, y: top }, { x: b.x - 72, y: top }, b);
  }
  const b = "id" in to ? flowPorts(to).in : to;
  const reach = Math.max(48, Math.abs(b.x - a.x) / 2);
  if (b.x >= a.x || !("id" in to)) return cubic(a, { x: a.x + reach, y: a.y }, { x: b.x - reach, y: b.y }, b);
  const below = Math.max(from.y, to.y) + FLOW_NODE_HEIGHT * 1.6;
  return cubic(a, { x: a.x + 96, y: below }, { x: b.x - 96, y: below }, b);
}

/** The width of an edge's label capsule, from its text (11 px mono glyphs plus padding). */
export function flowEdgeLabelWidth(label: string): number {
  return label.length * 6.7 + 14;
}
/** The label capsule's height. */
export const FLOW_EDGE_LABEL_HEIGHT = 18;

function segmentDistance(p: FlowPoint, a: FlowPoint, b: FlowPoint): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * The edge under a content point, or null: its label capsule, or within `tolerance` of its
 * curve (sampled as 32 chords). Later edges draw over earlier ones. Edges whose ends are
 * missing are skipped, as they are not drawn.
 */
export function flowEdgeAt(nodes: readonly FlowNode[], edges: readonly FlowEdge[], point: FlowPoint, tolerance: number): FlowEdge | null {
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  for (let i = edges.length - 1; i >= 0; i--) {
    const e = edges[i];
    const from = byId.get(e.from), to = byId.get(e.to);
    if (!from || !to) continue;
    const g = flowEdgeGeometry(from, to);
    if (e.label) {
      const half = flowEdgeLabelWidth(e.label) / 2;
      if (Math.abs(point.x - g.label.x) <= half && Math.abs(point.y - g.label.y) <= FLOW_EDGE_LABEL_HEIGHT / 2) return e;
    }
    const [p0, p1, p2, p3] = g.curve;
    let prev = p0;
    for (let s = 1; s <= 32; s++) {
      const t = s / 32;
      const next = { x: cubicAt(p0.x, p1.x, p2.x, p3.x, t), y: cubicAt(p0.y, p1.y, p2.y, p3.y, t) };
      if (segmentDistance(point, prev, next) <= tolerance) return e;
      prev = next;
    }
  }
  return null;
}

/** The topmost node under a content point, or null. Later nodes draw over earlier ones. */
export function flowNodeAt(nodes: readonly FlowNode[], point: FlowPoint): FlowNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (point.x >= n.x && point.x <= n.x + FLOW_NODE_WIDTH && point.y >= n.y && point.y <= n.y + FLOW_NODE_HEIGHT) return n;
  }
  return null;
}

/**
 * The bounding box of the graph, or null when it has no nodes: every card, and every drawn
 * edge's curve (sampled), so a backward edge's loop below the cards or a self loop above one
 * is inside it.
 */
export function flowBounds(nodes: readonly FlowNode[], edges: readonly FlowEdge[] = []): { x: number; y: number; width: number; height: number } | null {
  if (!nodes.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (x: number, y: number) => {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  };
  for (const n of nodes) {
    take(n.x, n.y);
    take(n.x + FLOW_NODE_WIDTH, n.y + FLOW_NODE_HEIGHT);
  }
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  for (const e of edges) {
    const from = byId.get(e.from), to = byId.get(e.to);
    if (!from || !to) continue;
    const [p0, p1, p2, p3] = flowEdgeGeometry(from, to).curve;
    for (let s = 1; s < 16; s++) {
      const t = s / 16;
      take(cubicAt(p0.x, p1.x, p2.x, p3.x, t), cubicAt(p0.y, p1.y, p2.y, p3.y, t));
    }
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/**
 * The camera that shows the whole graph centred in a viewport, never enlarged past zoom 1 (a
 * small graph keeps its true size) and held to the zoom range.
 */
export function fitFlowCamera(nodes: readonly FlowNode[], edges: readonly FlowEdge[], width: number, height: number, padding = FLOW_FIT_PADDING): ViewCamera {
  const box = flowBounds(nodes, edges);
  if (!box || !(width > 0) || !(height > 0)) return IDENTITY_CAMERA;
  const k = Math.min(1, (width - 2 * padding) / box.width, (height - 2 * padding) / box.height);
  const held = clampViewCamera({ k, tx: 0, ty: 0 }, FLOW_CAMERA_LIMITS).k;
  return { k: held, tx: (width - held * box.width) / 2 - held * box.x, ty: (height - held * box.height) / 2 - held * box.y };
}

/** The arrow-key move of a focused node, one grid step, or null for any other key. */
export function flowKeyMove(node: FlowNode, key: string, grid = FLOW_GRID): FlowPoint | null {
  if (key === "ArrowLeft") return { x: node.x - grid, y: node.y };
  if (key === "ArrowRight") return { x: node.x + grid, y: node.y };
  if (key === "ArrowUp") return { x: node.x, y: node.y - grid };
  if (key === "ArrowDown") return { x: node.x, y: node.y + grid };
  return null;
}

/** A free spot for a new node: the given point, nudged down a grid step past any card there. */
export function flowFreeSpot(nodes: readonly FlowNode[], point: FlowPoint, grid = FLOW_GRID): FlowPoint {
  let spot = snapFlowPoint({ x: point.x - FLOW_NODE_WIDTH / 2, y: point.y - FLOW_NODE_HEIGHT / 2 }, grid);
  for (let tries = 0; tries < 50; tries++) {
    const overlaps = nodes.some((n) => Math.abs(n.x - spot.x) < FLOW_NODE_WIDTH && Math.abs(n.y - spot.y) < FLOW_NODE_HEIGHT);
    if (!overlaps) return spot;
    spot = { x: spot.x, y: spot.y + FLOW_NODE_HEIGHT + grid };
  }
  return spot;
}

/** Whether an edge between these nodes may be added: both exist, and it is not a duplicate. */
export function flowCanConnect(nodes: readonly FlowNode[], edges: readonly FlowEdge[], from: string, to: string): boolean {
  return nodes.some((n) => n.id === from) && nodes.some((n) => n.id === to) && !edges.some((e) => e.from === from && e.to === to);
}
