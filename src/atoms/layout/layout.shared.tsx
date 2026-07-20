import { type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type FlexSkin } from "./layout.styles.js";

// Shared layout primitives: Row (horizontal) and Column (vertical). The kit had
// no layout primitive, so every example hand-rolled `<View style={{ flexDirection,
// gap, alignItems, justifyContent }}>`. Row and Column own arrangement through
// semantic boolean axes instead, so a call site never writes raw flex style. This
// is what the "No styling escape hatches" directive points every layout shim at.
//
// Direction is the component identity (Row vs Column), not a prop. Everything else
// is a boolean axis with a documented first-match precedence, mirroring Badge's
// toneOf / Typography's roleOf:
//   - gap scale     (flush / tight / snug / cozy / relaxed / loose; default snug)
//   - main axis      justify (start / center / end / between / around / evenly)
//   - cross axis      align   (alignStart / alignCenter / alignEnd / baseline / stretch)
//   - modifiers       wrap / fill / grow (orthogonal, stack freely)
//   - padding scale  (padTight / pad / padLoose; default none)
// Main- and cross-axis "center" carry distinct prop names (`center` vs
// `alignCenter`) so `<Row center alignCenter>` is unambiguous.
//
// Layout is a "Shared" platform treatment like Typography: flexbox is identical
// on iOS, Android, and react-native-web, so the three platform skins reference the
// same scale maps. The full per-OS file structure exists to match the kit recipe.

export type Direction = "row" | "column";
export type Gap = "flush" | "tight" | "snug" | "cozy" | "relaxed" | "loose";
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type Align = "alignStart" | "alignCenter" | "alignEnd" | "baseline" | "stretch";
export type Pad = "padTight" | "pad" | "padLoose";

export interface FlexProps {
  children?: ReactNode;

  // Gap scale (pick one; default `snug`). Maps to the shared spacing tokens.
  flush?: boolean; // 0
  tight?: boolean; // 4
  snug?: boolean; // 8 (default)
  cozy?: boolean; // 12
  relaxed?: boolean; // 16
  loose?: boolean; // 24

  // Main-axis distribution / justifyContent (pick one; default `start`).
  start?: boolean; // flex-start (default)
  center?: boolean; // center
  end?: boolean; // flex-end
  between?: boolean; // space-between
  around?: boolean; // space-around
  evenly?: boolean; // space-evenly

  // Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default).
  alignStart?: boolean; // flex-start
  alignCenter?: boolean; // center
  alignEnd?: boolean; // flex-end
  baseline?: boolean; // baseline
  stretch?: boolean; // stretch (default)

  // Orthogonal modifiers (stack freely).
  wrap?: boolean; // flexWrap: "wrap"
  fill?: boolean; // flex: 1
  grow?: boolean; // flexGrow: 1
  /**
   * Indent the whole stack by one control gutter (24: a control box plus the row
   * gap), so a nested option group lines up under its parent control's label
   * instead of its box. For nesting checkboxes/radios under a "select all" parent.
   */
  indent?: boolean; // paddingLeft: 24

  // Padding scale (pick one; omit for none).
  padTight?: boolean; // 8
  pad?: boolean; // 16
  padLoose?: boolean; // 24

  /** E2E hook forwarded to the root element. */
  testID?: string;

  /**
   * For sizing/composition only (e.g. `maxWidth` to bound a responsive block),
   * never for styling or spacing: gap, margin, padding, and flex layout come from
   * the props above, and the codegen guardrail rejects those keys in `style`.
   */
  style?: StyleProp<ViewStyle>;
}

const JUSTIFY: Record<Justify, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const ALIGN: Record<Align, ViewStyle["alignItems"]> = {
  alignStart: "flex-start",
  alignCenter: "center",
  alignEnd: "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

// Gap precedence when more than one is passed: first match wins, largest-first
// (mirrors Typography's roleOf ordering). Default `snug` when none is set.
function gapOf(p: FlexProps): Gap {
  if (p.loose) return "loose";
  if (p.relaxed) return "relaxed";
  if (p.cozy) return "cozy";
  if (p.snug) return "snug";
  if (p.tight) return "tight";
  if (p.flush) return "flush";
  return "snug";
}

// Main-axis precedence; default `start`.
function justifyOf(p: FlexProps): Justify {
  if (p.between) return "between";
  if (p.around) return "around";
  if (p.evenly) return "evenly";
  if (p.center) return "center";
  if (p.end) return "end";
  return "start";
}

// Cross-axis precedence; default `stretch` (RN's native alignItems default).
function alignOf(p: FlexProps): Align {
  if (p.stretch) return "stretch";
  if (p.baseline) return "baseline";
  if (p.alignCenter) return "alignCenter";
  if (p.alignEnd) return "alignEnd";
  if (p.alignStart) return "alignStart";
  return "stretch";
}

// Padding precedence; default none (null).
function padOf(p: FlexProps): Pad | null {
  if (p.padLoose) return "padLoose";
  if (p.pad) return "pad";
  if (p.padTight) return "padTight";
  return null;
}

/** Build a Row or Column component from a platform skin and a fixed direction. */
export function createFlex(skin: FlexSkin, direction: Direction) {
  return function Flex(props: FlexProps) {
    const { children, wrap, fill, grow, testID, style } = props;
    const layout: ViewStyle = {
      flexDirection: direction,
      gap: skin.gap[gapOf(props)],
      justifyContent: JUSTIFY[justifyOf(props)],
      alignItems: ALIGN[alignOf(props)],
    };
    if (wrap) layout.flexWrap = "wrap";
    if (fill) layout.flex = 1;
    if (grow) layout.flexGrow = 1;
    if (props.indent) layout.paddingLeft = 24; // one control gutter: box (16) + row gap (8)
    const pad = padOf(props);
    if (pad) layout.padding = skin.pad[pad];
    return <View style={[layout, style]} testID={testID}>{children}</View>;
  };
}
