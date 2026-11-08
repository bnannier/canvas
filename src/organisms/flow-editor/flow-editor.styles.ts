import { type TextStyle, type ViewStyle } from "react-native";
import { type ColorTokens, shadow, shape, type PlatformKey } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { FLOW_NODE_HEIGHT, FLOW_NODE_WIDTH } from "./flow-editor.logic.js";

// The FlowEditor skin. Neither iOS nor Android ships a node-graph editor
// (PLATFORM-REFERENCES.md), so every platform draws the same parts in the hand-off's inks;
// only the corners follow the platform's shape row (a card surface for the canvas well, a
// tile for a node card).
//
//   Canvas: the sunken well (`surface-sunken`) on a `border` hairline at the card corner,
//     with a dot grid every grid step in the subtle ink at low alpha.
//   Node: the `card` fill on a `border` hairline under the small shade, 10 by 12 in; the
//     title 600 13 in the foreground, the description 400 12 in the subtle ink. Selected:
//     a 2 px `ring` edge. Ports: 12 px dots on the card's left and right middles, `card`
//     filled on a `field-border` ring, `primary` while connecting.
//   Edge: a 1.5 px `muted-foreground` curve with a filled arrowhead, 2.5 px `primary` when
//     selected, dashed 6 4 for a rework edge. Its label is the 11 px mono caption in the
//     muted ink on a `background` capsule.
//   Toolbar: kit Buttons and inline small Selects (each 168 wide, shrinking to 120), 8
//     apart, wrapping on a narrow editor.

export interface FlowEditorSkin {
  root: ViewStyle;
  toolbar: ViewStyle;
  /** The From and To selects' slot in the toolbar: a select fills its parent, so this sizes it. */
  connectField: ViewStyle;
  viewport: (t: ColorTokens) => ViewStyle;
  /** The SVG layer under the cards, filling the viewport. */
  drawing: ViewStyle;
  /** A transparent box over an SVG-drawn part (an edge, its label) for the docs Anatomy figure. */
  mark: ViewStyle;
  /** A palette entry's card while it is dragged onto the canvas. */
  ghost: ViewStyle;
  node: (t: ColorTokens, selected: boolean) => ViewStyle;
  nodeLabel: (t: ColorTokens) => TextStyle;
  nodeDescription: (t: ColorTokens) => TextStyle;
  port: (t: ColorTokens, active: boolean) => ViewStyle;
  gridDot: (t: ColorTokens) => string;
  edge: (t: ColorTokens, selected: boolean) => { stroke: string; width: number };
  edgeLabel: (t: ColorTokens) => { fill: string; background: string; fontFamily: string; fontSize: number };
}

const PORT = 12;

function skinFor(platform: PlatformKey): FlowEditorSkin {
  const corners = shape[platform];
  return {
    root: { width: "100%", flexShrink: 1, minWidth: 0, flex: 1, minHeight: 360, gap: 8 },
    toolbar: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
    connectField: { width: 168, flexShrink: 1, minWidth: 120 },
    viewport: (t) => ({
      flex: 1,
      minHeight: 320,
      overflow: "hidden",
      position: "relative",
      backgroundColor: t["surface-sunken"] ?? t.background,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: corners.card,
    }),
    drawing: { position: "absolute", left: 0, top: 0 },
    ghost: { opacity: 0.7 },
    mark: { position: "absolute" },
    node: (t, selected) => ({
      position: "absolute",
      left: 0,
      top: 0,
      width: FLOW_NODE_WIDTH,
      height: FLOW_NODE_HEIGHT,
      paddingVertical: 10,
      paddingHorizontal: 12,
      justifyContent: "center",
      gap: 2,
      backgroundColor: t.card,
      borderRadius: corners.tile,
      borderWidth: selected ? 2 : 1,
      borderColor: selected ? t.ring : t.border,
      transformOrigin: "top left",
      ...shadow("sm"),
    }),
    nodeLabel: (t) => ({ color: t.foreground, fontSize: 13, lineHeight: 18, fontWeight: "600" }),
    nodeDescription: (t) => ({ color: t["subtle-foreground"] ?? t["muted-foreground"], fontSize: 12, lineHeight: 16 }),
    port: (t, active) => ({
      position: "absolute",
      top: FLOW_NODE_HEIGHT / 2 - PORT / 2 - 1,
      width: PORT,
      height: PORT,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: active ? t.primary : t["field-border"] ?? t.input,
      backgroundColor: active ? t.primary : t.card,
    }),
    gridDot: (t) => t["subtle-foreground"] ?? t["muted-foreground"],
    edge: (t, selected) => ({ stroke: selected ? t.primary : t["muted-foreground"], width: selected ? 2.5 : 1.5 }),
    edgeLabel: (t) => ({ fill: t["muted-foreground"], background: t.background, fontFamily: MONO_FONT, fontSize: 11 }),
  };
}

export const webSkin = skinFor("web");
export const iosSkin = skinFor("ios");
export const androidSkin = skinFor("android");

/** The left offset of the input and output port dots inside a node card. */
export const FLOW_PORT_OFFSET = { in: -PORT / 2 - 1, out: FLOW_NODE_WIDTH - PORT / 2 - 1 };
