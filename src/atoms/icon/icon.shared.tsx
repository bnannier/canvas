import { DisclosureRotation } from "../../style/disclosure-rotation.js";
import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { View, useTheme, type ColorTokens, type LayoutStyle } from "../../style/index.js";
import { ICONS, NAMES, type Shape, type IconGlyphProps, type IconName } from "./icon.glyphs.js";
import { ICON_STROKE_WIDTH } from "./icon.stroke.js";
import { IconCell } from "./icon-cell.js";
import { primaryText } from "../../style/primary-text.js";
import { useInk } from "../../style/ink.js";

// Shared Icon shell. The whole glyph set, the boolean-prop axes (name + color),
// the semantic color logic, and the SVG presentation live here once. Icon is a
// "Shared" platform treatment (an outline glyph is platform-neutral), so the iOS,
// Android, and web entry points re-export this one component unchanged.
//
// Icon: a Lucide-style outline glyph rendered with react-native-svg, so it draws
// crisply on native and web and inherits color the same way everywhere. Stroke is
// 1.75 with rounded caps/joins; the glyph paints in a single theme color that the
// caller picks via a boolean color prop (foreground by default).
//
// Icon is a "Shared" platform treatment: an outline glyph is platform-neutral
// (SF Symbols on iOS, Material Symbols on Android, and Radix on the web are all
// outline system glyphs with no native control to adopt), so the iOS, Android, and
// web skins are identical — one look on every platform.
//
// Boolean-prop API (the prop name is the value):
//
//   <Icon shield />              the shield glyph, foreground, 24px
//   <Icon search primary />      the search glyph, primary color
//   <Icon trash destructive />   the trash glyph, destructive color
//
// Axes (pass at most one per axis; first match wins):
//   - Name:  one boolean per glyph (activity, bell, search, shield, …). Default shield.
//   - Color: primary, primaryForeground, destructive, success, warning, muted. Default: the
//     label ink of the control hosting the glyph (a Button's icon slots, through the
//     InkProvider in src/style/ink.tsx), else the foreground.
//     (primaryForeground is the contrast color for a glyph on a primary surface.)
//     `color` sets an explicit paint for hues the booleans do not name (kit-internal,
//     e.g. a Chip tinting its remove glyph); the semantic booleans take precedence.
// Dimensions (orthogonal): `size` (px).

/**
 * Kit-internal Icon paint channel, kept OFF the published prop surface (hidden from
 * the generated prop table via OMIT_MEMBER_INTERFACES in tools/docgen/extract-props).
 * This is the raw-string escape hatch the "No styling escape hatches" directive bans
 * from the public API; it exists only so kit composites can tint a glyph to match a
 * computed color they already own (e.g. a `Chip` tinting its remove "×" to its label
 * color). Consumer-facing code picks hues with the semantic color booleans instead.
 */
export interface IconInternalProps {
  /**
   * An explicit glyph color (a theme or palette value), for the hues the semantic
   * color booleans do not name. The semantic booleans take precedence; this replaces
   * the default `foreground` when none is set. Kit-internal only.
   */
  color?: string;
}

export interface IconProps extends IconGlyphProps, IconInternalProps {
  /** Rotate the glyph as an Argus disclosure indicator. */
  disclosure?: boolean;
  /** Open state of a disclosure indicator. */
  expanded?: boolean;
  /** Strong action/link stroke from the Argus reference. */
  heavyStroke?: boolean;
  /** Standard emphasized metadata stroke. */
  boldStroke?: boolean;
  /** The medium toolbar stroke. */
  mediumStroke?: boolean;
  /** The fine navigation stroke. */
  regularStroke?: boolean;
  // Name axis (one boolean per glyph, first-match precedence, default shield) is
  // supplied by IconGlyphProps, generated in ./icon.glyphs.ts from tools/icongen.

  // Color axis: pass one (default foreground). First match wins.
  primary?: boolean;
  /** Contrast color for a glyph on a primary surface (e.g. a primary button). */
  primaryForeground?: boolean;
  destructive?: boolean;
  /** Positive/green status (matches Alert's success tone, scheme-aware). */
  success?: boolean;
  /** Caution/amber status (the warning token, scheme-aware; matches Alert/Toast warning). */
  warning?: boolean;
  /** The third ink (`subtle-foreground`, the hand-off's `--tx3`): a glyph that recedes. */
  muted?: boolean;
  /** The second ink (`muted-foreground`, the hand-off's `--tx2`), as Typography's `subtle`. */
  subtle?: boolean;
  /**
   * The glyph centred in a square cell that fills its parent (a Grid tile of a glyph
   * gallery) at a 10 px corner. On the web a hovered cell takes the accent's soft wash and
   * its glyph the accent ink.
   */
  cell?: boolean;
  // Single-glyph size in px (default 24).
  size?: number;
  /**
   * Accessible name for a MEANINGFUL standalone icon (one that conveys
   * information not repeated in adjacent text, e.g. an icon-only button's glyph).
   * Marks the glyph `role="img"` with this label on web and native.
   */
  accessibilityLabel?: string;
  /**
   * Mark a DECORATIVE/ornamental glyph (one paired with a text label, a separator
   * chevron, an empty-state illustration) so assistive tech skips it. Hides it via
   * aria-hidden on web and importantForAccessibility on native.
   */
  decorative?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// IconName (the union of glyph names) is generated alongside the glyph data as
// `keyof IconGlyphProps`, so it can never drift from the real set. Data-driven
// list components (Dropdown, Command, Sidebar, RowMenu) type their item `icon`
// as this, so a menu row can only name a real Canvas glyph, then render it via
// `<Icon {...{ [name]: true }} />`. Re-exported here for consumers.
export type { IconName } from "./icon.glyphs.js";

/**
 * Every Canvas glyph in gallery order (alphabetical): its prop `key` (an `IconName`) and
 * its typed `label`, for an icon picker or catalog. Render one with
 * `<Icon {...{ [key]: true }} />`.
 */
export const ICON_NAMES: readonly { readonly key: IconName; readonly label: string }[] = NAMES as { key: IconName; label: string }[];

// First-match name precedence; defaults to shield (the demo glyph).
export function nameOf(p: IconProps): string {
  for (const { key } of NAMES) {
    if ((p as Record<string, unknown>)[key]) return key;
  }
  return "shield";
}

// First-match color precedence: an explicit tone, then the kit-internal `color`, then the
// label ink of the control hosting the glyph (`ink`, from the nearest InkProvider: a
// Button around its icon slots, the hand-off's `currentColor`), then the foreground.
// Every tone reads the theme's roles: `success` is the success role, the solid color a
// success Alert gives its icon. `primary` is the accent's TEXT ink, as the v4 hand-off's
// Icon renderer paints it (`--ion-tx`, `K.def('icon')` in
// tools/v4/handoff/cv-kit-controls.js), so a primary glyph matches the primary label
// beside it and clears the text floor on every bed.
// Tone precedence when more than one is passed: first match wins. `muted` is the third
// ink (the hand-off's TONEC `--tx3`, cv-kit-controls.js) and `subtle` the second, the
// names Typography gives the same two inks.
export function strokeOf(p: IconProps, tokens: ColorTokens, ink?: string): string {
  if (p.primary) return primaryText(tokens);
  if (p.primaryForeground) return tokens["primary-foreground"];
  if (p.destructive) return tokens.destructive;
  if (p.success) return tokens.success;
  if (p.warning) return tokens.warning;
  if (p.muted) return tokens["subtle-foreground"] ?? tokens["muted-foreground"];
  if (p.subtle) return tokens["muted-foreground"];
  return p.color ?? ink ?? tokens.foreground;
}

// A filled primitive (Lucide `fill="currentColor"`) paints with the glyph color;
// every other primitive inherits the Svg's `fill="none"` and shows stroke only.
function renderShape(sh: Shape, k: number, stroke: string) {
  const fill = sh.fill ? stroke : undefined;
  switch (sh.t) {
    case "path":
      return <Path key={k} d={sh.d} fill={fill} />;
    case "circle":
      return <Circle key={k} cx={sh.cx} cy={sh.cy} r={sh.r} fill={fill} />;
    case "line":
      return <Line key={k} x1={sh.x1} y1={sh.y1} x2={sh.x2} y2={sh.y2} />;
    case "polyline":
      return <Polyline key={k} points={sh.points} fill={fill} />;
    case "polygon":
      return <Polygon key={k} points={sh.points} fill={fill} />;
    case "rect":
      return <Rect key={k} x={sh.x} y={sh.y} width={sh.width} height={sh.height} rx={sh.rx} ry={sh.ry} fill={fill} />;
    case "ellipse":
      return <Ellipse key={k} cx={sh.cx} cy={sh.cy} rx={sh.rx} ry={sh.ry} fill={fill} />;
  }
}

// One glyph: an SVG that sets the shared presentation attributes (stroke, weight,
// caps) on the root; the primitive children inherit them.
function Glyph({
  shapes,
  size,
  stroke,
  strokeWidth,
  testID,
  style,
}: {
  shapes: Shape[];
  size: number;
  stroke: string;
  strokeWidth: number;
  testID?: string;
  style?: LayoutStyle;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={testID}
      style={style}
    >
      {shapes.map((sh, i) => renderShape(sh, i, stroke))}
    </Svg>
  );
}

export function strokeWidthOf(p: IconProps): number {
  if (p.heavyStroke) return 2.2;
  if (p.boldStroke) return 2;
  if (p.mediumStroke) return 1.9;
  if (p.regularStroke) return 1.8;
  return ICON_STROKE_WIDTH;
}

/** An outline glyph from the kit's icon set, sized and colored by props. */
export function Icon(props: IconProps) {
  if (props.cell) {
    // A hovered cell paints its glyph in the accent ink, over any tone the caller set.
    const glyph = (hovered: boolean) => (
      <IconGlyph
        {...props}
        {...(hovered ? { primary: true, primaryForeground: false, destructive: false, success: false, warning: false, muted: false, subtle: false } : null)}
        cell={false}
        decorative={false}
        accessibilityLabel={undefined}
        testID={undefined}
        style={undefined}
      />
    );
    return <IconCell glyph={glyph} accessibilityLabel={props.accessibilityLabel} decorative={props.decorative} testID={props.testID} style={props.style} />;
  }
  return <IconGlyph {...props} />;
}

function IconGlyph(props: IconProps) {
  const { tokens } = useTheme();
  // The hosting control's label ink (a Button's), undefined on the page.
  const ink = useInk();

  if (props.disclosure) return <DisclosureRotation expanded={!!props.expanded}><IconGlyph {...props} disclosure={false} /></DisclosureRotation>;

  const wrapped = props.decorative || props.accessibilityLabel != null;
  const glyph = (
    <Glyph
      shapes={ICONS[nameOf(props)]}
      size={props.size ?? 24}
      stroke={strokeOf(props, tokens, ink)}
      strokeWidth={strokeWidthOf(props)}
      // When a wrapper View is the root it carries the testID instead.
      testID={wrapped ? undefined : props.testID}
      style={wrapped ? undefined : props.style}
    />
  );

  // A decorative glyph is hidden from assistive tech (the adjacent text carries
  // the meaning); a labeled glyph is announced as an image with its name. The
  // aria-* aliases cover web (react-native-web drops the RN-only a11y props).
  if (props.decorative) {
    return (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
        testID={props.testID}
        style={props.style}
      >
        {glyph}
      </View>
    );
  }
  if (props.accessibilityLabel != null) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={props.accessibilityLabel}
        aria-label={props.accessibilityLabel}
        testID={props.testID}
        style={props.style}
      >
        {glyph}
      </View>
    );
  }
  return glyph;
}
