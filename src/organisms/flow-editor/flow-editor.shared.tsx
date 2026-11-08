import { useEffect, useId, useMemo, useRef, useState, type ComponentType } from "react";
import { PanResponder, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Defs, G, Path, Pattern, Rect, Text as SvgText } from "react-native-svg";
import {
  View,
  Text,
  GESTURE_SURFACE,
  useControllableState,
  useTheme,
  useWheel,
} from "../../style/index.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import {
  IDENTITY_CAMERA,
  PAN_SLOP,
  VIEW_CAMERA_GESTURE_IDLE,
  viewCameraGestureEvent,
  viewCameraMatrix,
  viewCameraToContent,
  viewCameraWheelFactor,
  zoomViewCameraAt,
  zoomViewCameraBy,
  type ViewCamera,
  type ViewCameraGesture,
  type ViewCameraTouch,
} from "../../style/view-camera.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { type SelectProps } from "../../atoms/select/select.shared.js";
import {
  FLOW_CAMERA_LIMITS,
  FLOW_EDGE_LABEL_HEIGHT,
  FLOW_GRID,
  FLOW_NODE_HEIGHT,
  FLOW_NODE_WIDTH,
  FLOW_PORT_RADIUS,
  FLOW_WHEEL_PX_PER_DOUBLING,
  FLOW_ZOOM_STEP,
  fitFlowCamera,
  flowCanConnect,
  flowEdgeAt,
  flowEdgeGeometry,
  flowEdgeLabelWidth,
  flowFreeSpot,
  flowKeyMove,
  flowNodeAt,
  flowPorts,
  snapFlowPoint,
  type FlowEdge,
  type FlowNode,
  type FlowPaletteItem,
  type FlowPoint,
  type FlowSelection,
} from "./flow-editor.logic.js";
import { FLOW_PORT_OFFSET, type FlowEditorSkin } from "./flow-editor.styles.js";

// Shared FlowEditor shell. A node-graph editor: cards placed freely on a pannable, zoomable
// canvas, joined by directed edges. The consumer owns the graph (nodes and edges are always
// controlled); the editor reports intent (move, connect, add, delete, select) and draws what
// it is given. Selection is controlled or uncontrolled.
//
// Every interaction has a pointer path and a pointer-free path:
//   - Move a node: drag its card (snapped to the grid on release), or focus it and press the
//     arrow keys; screen readers get the same moves as named accessibility actions.
//   - Connect: drag from a card's output port onto another card, or pick From and To in the
//     toolbar and press Connect.
//   - Add: drag a palette entry onto the canvas, or press it to place the node in view.
//   - Delete: select a node or edge and press Delete (the toolbar button or the key).
//   - Pan and zoom: drag the background or the wheel / pinch; the toolbar zoom buttons and
//     Fit; the focused canvas takes + - 0.
//
// Drawing: edges, the grid and the connection being dragged are one react-native-svg layer
// under the camera's matrix; node cards are absolutely placed Views scaled by the camera so
// they stay real, focusable controls. Gestures read the latest camera through a ref, since
// each PanResponder is created once.

export type { FlowEdge, FlowNode, FlowPaletteItem, FlowPoint, FlowSelection };

export interface FlowEditorProps {
  /** Accessible name of the canvas, such as "Workflow version 3". */
  label: string;
  /** The cards, controlled. */
  nodes: FlowNode[];
  /** The connections, controlled. */
  edges: FlowEdge[];
  /** Kinds of node the user can add; omit for no palette. */
  palette?: FlowPaletteItem[];
  /** Controlled selection; null selects nothing. Omit for uncontrolled use. */
  selected?: FlowSelection | null;
  /** Initial selection for uncontrolled use. */
  defaultSelected?: FlowSelection | null;
  /** Fired when the selection changes, in both modes. */
  onSelectionChange?: (selection: FlowSelection | null) => void;
  /** A card was moved to a new top-left corner (snapped unless `freePlacement`). */
  onMoveNode?: (id: string, point: FlowPoint) => void;
  /** The user asked for an edge between two cards. */
  onConnect?: (from: string, to: string) => void;
  /** The user asked to add a node of a palette kind with its top-left corner at `point`. */
  onAddNode?: (paletteId: string, point: FlowPoint) => void;
  /** The user asked to delete the selected node or edge. */
  onDelete?: (selection: FlowSelection) => void;
  /** Show the graph without editing: no toolbar edits, drags or ports; pan, zoom and selection stay. */
  readOnly?: boolean;
  /** Place cards exactly where they are dropped instead of on the grid. */
  freePlacement?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
}

/** The platform-styled controls the toolbar composes. */
export interface FlowEditorParts {
  Button: ComponentType<ButtonProps>;
  Select: ComponentType<SelectProps>;
}

type Size = { width: number; height: number };
type Touch = { locationX?: number; locationY?: number; pageX?: number; pageY?: number };

/** Fingers in viewport pixels: page coordinates less the origin latched at grant. */
function touchesIn(event: GestureResponderEvent, origin: FlowPoint): ViewCameraTouch[] {
  return (event.nativeEvent.touches as readonly Touch[]).map((t) => ({ x: (t.pageX ?? 0) - origin.x, y: (t.pageY ?? 0) - origin.y }));
}

/** The viewport origin in page coordinates, from the first finger's page and local position. */
function originOf(event: GestureResponderEvent): FlowPoint {
  const t = (event.nativeEvent.touches as readonly Touch[])[0] ?? (event.nativeEvent as Touch);
  return { x: (t.pageX ?? 0) - (t.locationX ?? 0), y: (t.pageY ?? 0) - (t.locationY ?? 0) };
}

/** How near a tap must land to an edge to pick it, in viewport pixels. */
const EDGE_HIT_PX = 8;

const sameSelection = (a: FlowSelection | null, b: FlowSelection | null) => a?.kind === b?.kind && a?.id === b?.id;

/** Build a FlowEditor from a platform skin and its toolbar controls. */
export function createFlowEditor(skin: FlowEditorSkin, parts: FlowEditorParts) {
  const { Button, Select } = parts;

  function FlowEditor(props: FlowEditorProps) {
    const { label, nodes, edges, palette = [], readOnly = false, freePlacement = false, testID } = props;
    const { tokens: t } = useTheme();
    const gridId = `flow-grid-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
    const [selection, setSelection] = useControllableState<FlowSelection | null>(props.selected, props.defaultSelected ?? null, props.onSelectionChange);
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });
    const [camera, setCameraState] = useState<ViewCamera>(IDENTITY_CAMERA);
    // The view keeps the whole graph fitted, through resizes and until the first nodes
    // arrive, until the user pans or zooms; Fit hands it back to the editor.
    const userCamera = useRef(false);
    // A card being dragged keeps its live position here and reports it once, on release.
    const [drag, setDrag] = useState<{ id: string; point: FlowPoint } | null>(null);
    // The connection being dragged from an output port, in content units.
    const [link, setLink] = useState<{ from: string; point: FlowPoint } | null>(null);
    // A palette entry being dragged onto the canvas, in viewport pixels.
    const [adding, setAdding] = useState<{ id: string; point: FlowPoint } | null>(null);
    const [connectFrom, setConnectFrom] = useState("");
    const [connectTo, setConnectTo] = useState("");

    // What the once-created responders read.
    const live = useRef({ camera, nodes, edges, readOnly, freePlacement, selection, props });
    live.current = { camera: live.current.camera, nodes, edges, readOnly, freePlacement, selection, props };
    const setCamera = (next: ViewCamera) => {
      live.current.camera = next;
      setCameraState(next);
    };
    useEffect(() => { live.current.camera = camera; }, [camera]);

    const onLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize({ width, height });
      if (!userCamera.current && width > 0 && height > 0 && live.current.nodes.length) {
        setCamera(fitFlowCamera(live.current.nodes, live.current.edges, width, height));
      }
    };
    const select = (next: FlowSelection | null) => {
      if (!sameSelection(next, live.current.selection)) setSelection(next);
    };
    const place = (point: FlowPoint) => (live.current.freePlacement ? point : snapFlowPoint(point));

    // The wheel zooms about the pointer.
    const wheelRef = useWheel(true, (g) => {
      const from = live.current.camera;
      const next = zoomViewCameraAt(from, from.k * viewCameraWheelFactor(g.deltaY, FLOW_WHEEL_PX_PER_DOUBLING), g.x, g.y, FLOW_CAMERA_LIMITS);
      if (next.k === from.k) return false;
      userCamera.current = true;
      setCamera(next);
      return true;
    });
    // The viewport's node and page origin: a palette drag starts outside the viewport, so its
    // page position is turned into viewport pixels against this origin.
    const viewportNode = useRef<unknown>(null);
    const viewportOrigin = useRef<FlowPoint>({ x: 0, y: 0 });
    // The docs Anatomy figure's parts (inert outside it). The tree renders inside AnatomyScope
    // so the toolbar's own Buttons and Selects number nothing. Cards sit by transform and
    // edges are SVG, neither of which layout measurement sees, so Node, Port, Edge and Edge
    // label are each marked by a transparent box over the first card or drawn edge.
    const toolbarPart = useAnatomyPart("Toolbar");
    const canvasPart = useAnatomyPart("Canvas");
    const nodePart = useAnatomyPart("Node");
    const portPart = useAnatomyPart("Port");
    const edgePart = useAnatomyPart("Edge");
    const edgeLabelPart = useAnatomyPart("Edge label");
    const viewportRef = useComposedRefs(wheelRef, viewportNode as never, canvasPart?.ref as never);
    const measureOrigin = () => {
      const node = viewportNode.current as { measure?: (cb: (x: number, y: number, w: number, h: number, px: number, py: number) => void) => void } | null;
      node?.measure?.((_x, _y, _w, _h, px, py) => { viewportOrigin.current = { x: px, y: py }; });
    };

    // The background: one finger pans past the slop, two pinch, a tap clears the selection.
    const gesture = useRef<ViewCameraGesture>(VIEW_CAMERA_GESTURE_IDLE);
    const origin = useRef<FlowPoint>({ x: 0, y: 0 });
    const moved = useRef(false);
    // Where a background press began, in viewport pixels: a tap there picks the edge under it.
    const pressed = useRef<FlowPoint>({ x: 0, y: 0 });
    const background = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onStartShouldSetPanResponderCapture: (e) => e.nativeEvent.touches.length >= 2,
          onMoveShouldSetPanResponderCapture: (e) => e.nativeEvent.touches.length >= 2,
          onPanResponderGrant: (e) => {
            origin.current = originOf(e);
            moved.current = false;
            pressed.current = touchesIn(e, origin.current)[0] ?? { x: 0, y: 0 };
            gesture.current = viewCameraGestureEvent("grant", touchesIn(e, origin.current), gesture.current, live.current.camera, FLOW_CAMERA_LIMITS).gesture;
          },
          onPanResponderMove: (e, state) => {
            if (!moved.current && e.nativeEvent.touches.length < 2 && Math.hypot(state.dx, state.dy) <= PAN_SLOP) return;
            moved.current = true;
            const out = viewCameraGestureEvent("move", touchesIn(e, origin.current), gesture.current, live.current.camera, FLOW_CAMERA_LIMITS);
            gesture.current = out.gesture;
            userCamera.current = true;
            setCamera(out.camera);
          },
          onPanResponderRelease: () => {
            gesture.current = VIEW_CAMERA_GESTURE_IDLE;
            if (moved.current) return;
            const { camera: cam, nodes: ns, edges: es } = live.current;
            const at = viewCameraToContent(cam, pressed.current.x, pressed.current.y);
            const hit = flowEdgeAt(ns, es, at, EDGE_HIT_PX / cam.k);
            select(hit ? { kind: "edge", id: hit.id } : null);
          },
          onPanResponderTerminate: () => {
            gesture.current = VIEW_CAMERA_GESTURE_IDLE;
          },
          onPanResponderTerminationRequest: () => false,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const zoom = (factor: number) => {
      userCamera.current = true;
      setCamera(zoomViewCameraBy(live.current.camera, factor, size.width / 2, size.height / 2, FLOW_CAMERA_LIMITS));
    };
    const fit = () => {
      userCamera.current = false;
      setCamera(fitFlowCamera(nodes, edges, size.width, size.height));
    };
    // The first nodes to arrive after an empty layout are fitted too.
    const hasNodes = nodes.length > 0;
    useEffect(() => {
      if (hasNodes && !userCamera.current && size.width > 0 && size.height > 0) setCamera(fitFlowCamera(live.current.nodes, live.current.edges, size.width, size.height));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasNodes]);
    const viewCentre = () => viewCameraToContent(camera, size.width / 2, size.height / 2);
    const addAt = (id: string, point: FlowPoint) => props.onAddNode?.(id, place(flowFreeSpot(nodes, point)));
    const remove = () => {
      if (selection && !readOnly) props.onDelete?.(selection);
    };
    const canvasKeys = (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "+" || event.key === "=") zoom(FLOW_ZOOM_STEP);
      else if (event.key === "-" || event.key === "_") zoom(1 / FLOW_ZOOM_STEP);
      else if (event.key === "0") fit();
      else if ((event.key === "Delete" || event.key === "Backspace") && selection) remove();
      else return;
      event.preventDefault();
    };

    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    const shown = (n: FlowNode): FlowNode => (drag?.id === n.id ? { ...n, ...drag.point } : n);
    const visible = (() => {
      const a = viewCameraToContent(camera, 0, 0), b = viewCameraToContent(camera, size.width, size.height);
      return { x: Math.floor(a.x / FLOW_GRID) * FLOW_GRID - FLOW_GRID, y: Math.floor(a.y / FLOW_GRID) * FLOW_GRID - FLOW_GRID, width: b.x - a.x + 3 * FLOW_GRID, height: b.y - a.y + 3 * FLOW_GRID };
    })();
    const nodeOptions = nodes.map((n) => ({ value: n.id, label: n.label }));
    // The toolbar pair joins two cards, or, when they are joined already, removes that edge:
    // the keyboard path to an edge, which is drawn, not focusable.
    const pairEdge = edges.find((e) => e.from === connectFrom && e.to === connectTo);
    const edgeStyle = (selected: boolean) => skin.edge(t, selected);
    const labelStyle = skin.edgeLabel(t);
    const marked = toolbarPart || canvasPart || nodePart || portPart || edgePart || edgeLabelPart ? anatomyMarks(nodes.map(shown), edges, camera) : null;

    return (
      <AnatomyScope>
      <View style={skin.root} testID={testID}>
        {!readOnly ? (
          <View ref={toolbarPart?.ref} onLayout={toolbarPart?.onLayout} style={skin.toolbar} testID={testID ? `${testID}-toolbar` : undefined}>
            {palette.map((item) => (
              <PaletteEntry key={item.id} item={item} onPress={() => addAt(item.id, viewCentre())}
                onDrag={(point) => setAdding(point ? { id: item.id, point } : null)}
                onDrop={(point) => {
                  setAdding(null);
                  if (point.x >= 0 && point.y >= 0 && point.x <= size.width && point.y <= size.height) addAt(item.id, viewCameraToContent(camera, point.x, point.y));
                }}
                viewportOrigin={() => viewportOrigin.current} />
            ))}
            <View style={skin.connectField}><Select small inline label="From" accessibilityLabel="Connect from" placeholder="Card" options={nodeOptions} value={connectFrom} onSelect={setConnectFrom} /></View>
            <View style={skin.connectField}><Select small inline label="To" accessibilityLabel="Connect to" placeholder="Card" options={nodeOptions} value={connectTo} onSelect={setConnectTo} /></View>
            {pairEdge ? (
              <Button small outline onPress={() => props.onDelete?.({ kind: "edge", id: pairEdge.id })}>Disconnect</Button>
            ) : (
              <Button small outline disabled={!flowCanConnect(nodes, edges, connectFrom, connectTo)} onPress={() => props.onConnect?.(connectFrom, connectTo)}>Connect</Button>
            )}
            <Button small outline disabled={!selection} onPress={remove}>Delete</Button>
            <Button small ghost accessibilityLabel="Zoom out" onPress={() => zoom(1 / FLOW_ZOOM_STEP)}>−</Button>
            <Button small ghost accessibilityLabel="Zoom in" onPress={() => zoom(FLOW_ZOOM_STEP)}>+</Button>
            <Button small ghost onPress={fit}>Fit</Button>
          </View>
        ) : null}
        <View
          ref={viewportRef}
          style={[skin.viewport(t), GESTURE_SURFACE]}
          onLayout={(event) => { onLayout(event); measureOrigin(); canvasPart?.onLayout(); }}
          accessibilityLabel={label}
          accessibilityHint="Drag to pan, pinch or use the wheel to zoom, plus and minus keys zoom, 0 fits the graph."
          {...({ focusable: true, onKeyDown: canvasKeys } as object)}
          {...background.panHandlers}
          testID={testID ? `${testID}-canvas` : undefined}
        >
          <Svg width="100%" height="100%" style={skin.drawing} pointerEvents="box-none">
            <Defs>
              <Pattern id={gridId} x={0} y={0} width={FLOW_GRID} height={FLOW_GRID} patternUnits="userSpaceOnUse">
                <Circle cx={FLOW_GRID / 2} cy={FLOW_GRID / 2} r={1.1} fill={skin.gridDot(t)} fillOpacity={0.35} />
              </Pattern>
            </Defs>
            <G transform={viewCameraMatrix(camera)}>
              <Rect x={visible.x} y={visible.y} width={visible.width} height={visible.height} fill={`url(#${gridId})`} />
              {edges.map((edge) => {
                const from = byId.get(edge.from), to = byId.get(edge.to);
                if (!from || !to) return null;
                const g = flowEdgeGeometry(shown(from), shown(to));
                const isSelected = selection?.kind === "edge" && selection.id === edge.id;
                const s = edgeStyle(isSelected);
                const head = arrowHead(g.tip, g.angle);
                const width = edge.label ? flowEdgeLabelWidth(edge.label) : 0;
                return (
                  <G key={edge.id}>
                    <Path d={g.d} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={edge.rework ? "6 4" : undefined} fill="none" pointerEvents="none" />
                    <Path d={head} fill={s.stroke} pointerEvents="none" />
                    {edge.label ? (
                      <G pointerEvents="none">
                        <Rect x={g.label.x - width / 2} y={g.label.y - FLOW_EDGE_LABEL_HEIGHT / 2} width={width} height={FLOW_EDGE_LABEL_HEIGHT} rx={FLOW_EDGE_LABEL_HEIGHT / 2} fill={labelStyle.background} stroke={s.stroke} strokeWidth={isSelected ? 1.5 : 0.75} />
                        <SvgText x={g.label.x} y={g.label.y + 3.8} fontSize={labelStyle.fontSize} fontFamily={labelStyle.fontFamily} fill={labelStyle.fill} textAnchor="middle">{edge.label}</SvgText>
                      </G>
                    ) : null}
                  </G>
                );
              })}
              {link ? (() => {
                const from = byId.get(link.from);
                if (!from) return null;
                const g = flowEdgeGeometry(shown(from), link.point);
                const s = edgeStyle(true);
                return <Path d={g.d} stroke={s.stroke} strokeWidth={s.width} strokeDasharray="4 4" fill="none" pointerEvents="none" />;
              })() : null}
            </G>
          </Svg>
          {([[nodePart, marked?.node], [portPart, marked?.port], [edgePart, marked?.edge], [edgeLabelPart, marked?.label]] as const).map(([part, box], i) =>
            part && box ? <View key={i} pointerEvents="none" ref={part.ref} onLayout={part.onLayout} style={[skin.mark, box]} /> : null)}
          {nodes.map((node) => (
            <FlowNodeCard key={node.id} node={shown(node)} camera={camera}

              selected={selection?.kind === "node" && selection.id === node.id}
              linking={link?.from === node.id}
              onSelect={() => select({ kind: "node", id: node.id })}
              onDrag={(point) => setDrag(point ? { id: node.id, point } : null)}
              onDrop={(point) => {
                setDrag(null);
                const next = place(point);
                if (next.x !== node.x || next.y !== node.y) props.onMoveNode?.(node.id, next);
              }}
              onMoveKey={(key) => {
                const next = flowKeyMove(node, key);
                if (!next) return false;
                props.onMoveNode?.(node.id, next);
                return true;
              }}
              onDelete={() => { if (!readOnly) props.onDelete?.({ kind: "node", id: node.id }); }}
              onLink={(point) => setLink(point ? { from: node.id, point } : null)}
              onLinkDrop={(point) => {
                setLink(null);
                const target = flowNodeAt(nodes, point);
                if (target && flowCanConnect(nodes, edges, node.id, target.id)) props.onConnect?.(node.id, target.id);
              }}
              readOnly={readOnly}
              testID={testID ? `${testID}-node-${node.id}` : undefined}
            />
          ))}
          {adding ? (
            <View pointerEvents="none" style={[skin.node(t, true), skin.ghost, { transform: [{ translateX: adding.point.x - FLOW_NODE_WIDTH / 2 }, { translateY: adding.point.y - FLOW_NODE_HEIGHT / 2 }, { scale: camera.k }] }]}>
              <Text style={skin.nodeLabel(t)} numberOfLines={1}>{palette.find((p) => p.id === adding.id)?.label}</Text>
            </View>
          ) : null}
        </View>
      </View>
      </AnatomyScope>
    );
  }

  interface CardProps {
    node: FlowNode;
    camera: ViewCamera;
    selected: boolean;
    linking: boolean;
    readOnly: boolean;
    onSelect: () => void;
    onDrag: (point: FlowPoint | null) => void;
    onDrop: (point: FlowPoint) => void;
    onMoveKey: (key: string) => boolean;
    onDelete: () => void;
    onLink: (point: FlowPoint | null) => void;
    onLinkDrop: (point: FlowPoint) => void;
    testID?: string;
  }

  function FlowNodeCard(p: CardProps) {
    const { tokens: t } = useTheme();
    const live = useRef(p);
    live.current = p;
    const start = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });
    const card = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            start.current = { x: live.current.node.x, y: live.current.node.y, moved: false };
            live.current.onSelect();
          },
          onPanResponderMove: (_e, state) => {
            if (live.current.readOnly) return;
            if (!start.current.moved && Math.hypot(state.dx, state.dy) <= PAN_SLOP) return;
            start.current.moved = true;
            const k = live.current.camera.k;
            live.current.onDrag({ x: start.current.x + state.dx / k, y: start.current.y + state.dy / k });
          },
          onPanResponderRelease: (_e, state) => {
            if (!start.current.moved) return;
            const k = live.current.camera.k;
            live.current.onDrop({ x: start.current.x + state.dx / k, y: start.current.y + state.dy / k });
          },
          onPanResponderTerminate: () => live.current.onDrag(null),
          onPanResponderTerminationRequest: () => false,
        }),
      [],
    );
    const port = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => !live.current.readOnly,
          onPanResponderGrant: () => {
            const out = flowPorts(live.current.node).out;
            start.current = { x: out.x, y: out.y, moved: false };
            live.current.onLink(out);
          },
          onPanResponderMove: (_e, state) => {
            const k = live.current.camera.k;
            live.current.onLink({ x: start.current.x + state.dx / k, y: start.current.y + state.dy / k });
          },
          onPanResponderRelease: (_e, state) => {
            const k = live.current.camera.k;
            live.current.onLinkDrop({ x: start.current.x + state.dx / k, y: start.current.y + state.dy / k });
          },
          onPanResponderTerminate: () => live.current.onLink(null),
          onPanResponderTerminationRequest: () => false,
        }),
      [],
    );
    const { node, camera, selected } = p;
    const keys = (event: { key: string; preventDefault: () => void }) => {
      if (p.readOnly) return;
      if (event.key === "Delete" || event.key === "Backspace") { p.onDelete(); event.preventDefault(); return; }
      if (p.onMoveKey(event.key)) event.preventDefault();
    };
    const actions = p.readOnly ? [] : [
      { name: "moveLeft", label: "Move left" }, { name: "moveRight", label: "Move right" },
      { name: "moveUp", label: "Move up" }, { name: "moveDown", label: "Move down" }, { name: "delete", label: "Delete" },
    ];
    const keyOf: Record<string, string> = { moveLeft: "ArrowLeft", moveRight: "ArrowRight", moveUp: "ArrowUp", moveDown: "ArrowDown" };
    return (
      <View
        style={[skin.node(t, selected), { transform: [{ translateX: camera.k * node.x + camera.tx }, { translateY: camera.k * node.y + camera.ty }, { scale: camera.k }] }]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={node.description ? `${node.label}, ${node.description}` : node.label}
        accessibilityState={{ selected }}
        accessibilityActions={[{ name: "activate" }, ...actions]}
        onAccessibilityAction={(event) => {
          const name = event.nativeEvent.actionName;
          if (name === "activate") p.onSelect();
          else if (name === "delete") p.onDelete();
          else if (keyOf[name]) p.onMoveKey(keyOf[name]);
        }}
        {...({ focusable: true, onKeyDown: keys, onFocus: p.onSelect } as object)}
        {...card.panHandlers}
        testID={p.testID}
      >
        <Text style={skin.nodeLabel(t)} numberOfLines={1}>{node.label}</Text>
        {node.description ? <Text style={skin.nodeDescription(t)} numberOfLines={1}>{node.description}</Text> : null}
        {!p.readOnly ? (
          <>
            <View pointerEvents="none" style={[skin.port(t, false), { left: FLOW_PORT_OFFSET.in }]} />
            <View
              style={[skin.port(t, p.linking), { left: FLOW_PORT_OFFSET.out }]}
              hitSlop={12}
              accessible={false}
              {...port.panHandlers}
              testID={p.testID ? `${p.testID}-port` : undefined}
            />
          </>
        ) : null}
      </View>
    );
  }

  interface PaletteEntryProps {
    item: FlowPaletteItem;
    onPress: () => void;
    onDrag: (point: FlowPoint | null) => void;
    onDrop: (point: FlowPoint) => void;
    viewportOrigin: () => FlowPoint;
  }

  // A palette entry is a kit Button; dragging it past the slop carries a ghost card onto the
  // canvas, and a press places the node in view.
  function PaletteEntry({ item, onPress, onDrag, onDrop, viewportOrigin: originFn }: PaletteEntryProps) {
    const live = useRef({ onDrag, onDrop, originFn });
    live.current = { onDrag, onDrop, originFn };
    const dragging = useRef(false);
    const responder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onMoveShouldSetPanResponder: (_e, state) => !item.disabled && Math.hypot(state.dx, state.dy) > PAN_SLOP,
          onPanResponderGrant: () => { dragging.current = true; },
          onPanResponderMove: (_e, state) => {
            const o = live.current.originFn();
            live.current.onDrag({ x: state.moveX - o.x, y: state.moveY - o.y });
          },
          onPanResponderRelease: (_e, state) => {
            dragging.current = false;
            const o = live.current.originFn();
            live.current.onDrop({ x: state.moveX - o.x, y: state.moveY - o.y });
          },
          onPanResponderTerminate: () => { dragging.current = false; live.current.onDrag(null); },
        }),
      [item.disabled],
    );
    return (
      <View {...responder.panHandlers}>
        <Button small outline disabled={item.disabled} accessibilityLabel={`Add ${item.label}`} onPress={() => { if (!dragging.current) onPress(); }}>{`+ ${item.label}`}</Button>
      </View>
    );
  }

  return FlowEditor;
}

type Box = { left: number; top: number; width: number; height: number };

/**
 * The viewport boxes of the first card, its output port, and the first drawn edge's curve
 * and label capsule, for the docs Anatomy figure's marks.
 */
function anatomyMarks(nodes: readonly FlowNode[], edges: readonly FlowEdge[], camera: ViewCamera): { node: Box | null; port: Box | null; edge: Box | null; label: Box | null } {
  const box = (x0: number, y0: number, x1: number, y1: number): Box => ({ left: camera.k * x0 + camera.tx, top: camera.k * y0 + camera.ty, width: camera.k * (x1 - x0), height: camera.k * (y1 - y0) });
  const first = nodes[0];
  const out = first ? flowPorts(first).out : null;
  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const edge = edges.find((e) => byId.has(e.from) && byId.has(e.to));
  const g = edge ? flowEdgeGeometry(byId.get(edge.from)!, byId.get(edge.to)!) : null;
  const xs = g ? g.curve.map((p) => p.x) : [], ys = g ? g.curve.map((p) => p.y) : [];
  const half = edge?.label ? flowEdgeLabelWidth(edge.label) / 2 : 0;
  return {
    node: first ? box(first.x, first.y, first.x + FLOW_NODE_WIDTH, first.y + FLOW_NODE_HEIGHT) : null,
    port: out ? box(out.x - FLOW_PORT_RADIUS, out.y - FLOW_PORT_RADIUS, out.x + FLOW_PORT_RADIUS, out.y + FLOW_PORT_RADIUS) : null,
    edge: g ? box(Math.min(...xs), Math.min(...ys) - 4, Math.max(...xs), Math.max(...ys) + 4) : null,
    label: g && edge?.label ? box(g.label.x - half, g.label.y - FLOW_EDGE_LABEL_HEIGHT / 2, g.label.x + half, g.label.y + FLOW_EDGE_LABEL_HEIGHT / 2) : null,
  };
}

/** A filled arrowhead with its tip at `tip`, pointing along `angle`. */
function arrowHead(tip: FlowPoint, angle: number): string {
  const len = 9, half = 4.5;
  const bx = tip.x - len * Math.cos(angle), by = tip.y - len * Math.sin(angle);
  const px = -Math.sin(angle) * half, py = Math.cos(angle) * half;
  return `M ${tip.x} ${tip.y} L ${bx + px} ${by + py} L ${bx - px} ${by - py} Z`;
}
