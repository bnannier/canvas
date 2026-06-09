import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { View, Text, useTheme } from "../../engine/index.js";
import type { ColorTokens } from "../../engine/index.js";

// Icon: a Lucide-style outline glyph rendered with react-native-svg, so it draws
// crisply on native and web and inherits color the same way everywhere. Stroke is
// 1.75 with rounded caps/joins; the glyph paints in a single theme color that the
// caller picks via a boolean color prop (foreground by default).
//
// Boolean-prop API (the prop name is the value):
//
//   <Icon shield />              the shield glyph, foreground, 24px
//   <Icon search primary />      the search glyph, primary color
//   <Icon trash destructive />   the trash glyph, destructive color
//   <Icon set />                 the whole gallery, each glyph labeled by name
//
// Axes (pass at most one per axis; first match wins):
//   - Name:  one boolean per glyph (activity, bell, search, shield, …). Default shield.
//   - Color: primary, primaryForeground, destructive, muted. Default foreground.
//     (primaryForeground is the contrast color for a glyph on a primary surface.)
// Dimensions/layout (orthogonal): `size` (px, single glyph) and `set` (gallery).

type Shape =
  | { t: "path"; d: string }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number }
  | { t: "polyline"; points: string }
  | { t: "polygon"; points: string }
  | { t: "rect"; x: number; y: number; width: number; height: number; rx?: number; ry?: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number };

// The curated set, in gallery order. Each glyph is an array of SVG primitives on
// the 0 0 24 24 viewBox, transcribed from the Lucide outline source.
const ICONS: Record<string, Shape[]> = {
  activity: [{ t: "polyline", points: "22 12 18 12 15 21 9 3 6 12 2 12" }],
  alertTriangle: [
    { t: "path", d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" },
    { t: "line", x1: 12, y1: 9, x2: 12, y2: 13 },
    { t: "line", x1: 12, y1: 17, x2: 12.01, y2: 17 },
  ],
  archive: [
    { t: "rect", x: 2, y: 7, width: 20, height: 14, rx: 2, ry: 2 },
    { t: "path", d: "M16 3v4M8 3v4" },
  ],
  bell: [
    { t: "path", d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" },
    { t: "path", d: "M13.73 21a2 2 0 0 1-3.46 0" },
  ],
  calendar: [
    { t: "rect", x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 },
    { t: "line", x1: 16, y1: 2, x2: 16, y2: 6 },
    { t: "line", x1: 8, y1: 2, x2: 8, y2: 6 },
    { t: "line", x1: 3, y1: 10, x2: 21, y2: 10 },
  ],
  check: [{ t: "polyline", points: "20 6 9 17 4 12" }],
  chevronDown: [{ t: "path", d: "m6 9 6 6 6-6" }],
  chevronLeft: [{ t: "path", d: "m15 18-6-6 6-6" }],
  chevronRight: [{ t: "path", d: "m9 18 6-6-6-6" }],
  code: [
    { t: "polyline", points: "16 18 22 12 16 6" },
    { t: "polyline", points: "8 6 2 12 8 18" },
  ],
  copy: [
    { t: "rect", x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 },
    { t: "path", d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" },
  ],
  database: [
    { t: "ellipse", cx: 12, cy: 5, rx: 9, ry: 3 },
    { t: "path", d: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" },
    { t: "path", d: "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" },
  ],
  download: [
    { t: "path", d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" },
    { t: "polyline", points: "7 10 12 15 17 10" },
    { t: "line", x1: 12, y1: 15, x2: 12, y2: 3 },
  ],
  eye: [
    { t: "path", d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" },
    { t: "circle", cx: 12, cy: 12, r: 3 },
  ],
  file: [
    { t: "path", d: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" },
    { t: "polyline", points: "13 2 13 9 20 9" },
  ],
  filter: [{ t: "polygon", points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }],
  globe: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "line", x1: 2, y1: 12, x2: 22, y2: 12 },
    { t: "path", d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
  ],
  home: [
    { t: "path", d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { t: "polyline", points: "9 22 9 12 15 12 15 22" },
  ],
  info: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "line", x1: 12, y1: 16, x2: 12, y2: 12 },
    { t: "line", x1: 12, y1: 8, x2: 12.01, y2: 8 },
  ],
  key: [{ t: "path", d: "m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" }],
  lock: [
    { t: "rect", x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 },
    { t: "path", d: "M7 11V7a5 5 0 0 1 10 0v4" },
  ],
  mail: [
    { t: "path", d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
    { t: "polyline", points: "22,6 12,13 2,6" },
  ],
  plus: [
    { t: "line", x1: 12, y1: 5, x2: 12, y2: 19 },
    { t: "line", x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  search: [
    { t: "circle", cx: 11, cy: 11, r: 8 },
    { t: "line", x1: 21, y1: 21, x2: 16.65, y2: 16.65 },
  ],
  settings: [
    { t: "circle", cx: 12, cy: 12, r: 3 },
    {
      t: "path",
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
    },
  ],
  shield: [{ t: "path", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }],
  star: [{ t: "polygon", points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }],
  trash: [
    { t: "polyline", points: "3 6 5 6 21 6" },
    { t: "path", d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
  ],
  upload: [
    { t: "path", d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" },
    { t: "polyline", points: "17 8 12 3 7 8" },
    { t: "line", x1: 12, y1: 3, x2: 12, y2: 15 },
  ],
  user: [
    { t: "path", d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" },
    { t: "circle", cx: 12, cy: 7, r: 4 },
  ],
  users: [
    { t: "path", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
    { t: "circle", cx: 9, cy: 7, r: 4 },
    { t: "path", d: "M23 21v-2a4 4 0 0 0-3-3.87" },
    { t: "path", d: "M16 3.13a4 4 0 0 1 0 7.75" },
  ],
  x: [
    { t: "line", x1: 18, y1: 6, x2: 6, y2: 18 },
    { t: "line", x1: 6, y1: 6, x2: 18, y2: 18 },
  ],
  zap: [{ t: "polygon", points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }],
};

// Gallery order + the short label shown under each glyph in the set view.
const NAMES: { key: string; label: string }[] = [
  { key: "activity", label: "activity" },
  { key: "alertTriangle", label: "alert-tri" },
  { key: "archive", label: "archive" },
  { key: "bell", label: "bell" },
  { key: "calendar", label: "calendar" },
  { key: "check", label: "check" },
  { key: "chevronDown", label: "chevron-down" },
  { key: "chevronLeft", label: "chevron-left" },
  { key: "chevronRight", label: "chevron-right" },
  { key: "code", label: "code" },
  { key: "copy", label: "copy" },
  { key: "database", label: "database" },
  { key: "download", label: "download" },
  { key: "eye", label: "eye" },
  { key: "file", label: "file" },
  { key: "filter", label: "filter" },
  { key: "globe", label: "globe" },
  { key: "home", label: "home" },
  { key: "info", label: "info" },
  { key: "key", label: "key" },
  { key: "lock", label: "lock" },
  { key: "mail", label: "mail" },
  { key: "plus", label: "plus" },
  { key: "search", label: "search" },
  { key: "settings", label: "settings" },
  { key: "shield", label: "shield" },
  { key: "star", label: "star" },
  { key: "trash", label: "trash" },
  { key: "upload", label: "upload" },
  { key: "user", label: "user" },
  { key: "users", label: "users" },
  { key: "x", label: "x" },
  { key: "zap", label: "zap" },
];

export interface IconProps {
  // Name axis: one boolean per glyph (pass one; first match wins, default shield).
  activity?: boolean;
  alertTriangle?: boolean;
  archive?: boolean;
  bell?: boolean;
  calendar?: boolean;
  check?: boolean;
  chevronDown?: boolean;
  chevronLeft?: boolean;
  chevronRight?: boolean;
  code?: boolean;
  copy?: boolean;
  database?: boolean;
  download?: boolean;
  eye?: boolean;
  file?: boolean;
  filter?: boolean;
  globe?: boolean;
  home?: boolean;
  info?: boolean;
  key?: boolean;
  lock?: boolean;
  mail?: boolean;
  plus?: boolean;
  search?: boolean;
  settings?: boolean;
  shield?: boolean;
  star?: boolean;
  trash?: boolean;
  upload?: boolean;
  user?: boolean;
  users?: boolean;
  x?: boolean;
  zap?: boolean;
  // Color axis: pass one (default foreground). First match wins.
  primary?: boolean;
  /** Contrast color for a glyph on a primary surface (e.g. a primary button). */
  primaryForeground?: boolean;
  destructive?: boolean;
  muted?: boolean;
  // Single-glyph size in px (default 24).
  size?: number;
  // Render the whole gallery instead of a single glyph.
  set?: boolean;
  className?: string;
}

// First-match name precedence; defaults to shield (the demo glyph).
function nameOf(p: IconProps): string {
  for (const { key } of NAMES) {
    if ((p as Record<string, unknown>)[key]) return key;
  }
  return "shield";
}

// First-match color precedence; defaults to foreground.
function strokeOf(p: IconProps, tokens: ColorTokens): string {
  if (p.primary) return tokens.primary;
  if (p.primaryForeground) return tokens["primary-foreground"];
  if (p.destructive) return tokens.destructive;
  if (p.muted) return tokens["muted-foreground"];
  return tokens.foreground;
}

function renderShape(sh: Shape, k: number) {
  switch (sh.t) {
    case "path":
      return <Path key={k} d={sh.d} />;
    case "circle":
      return <Circle key={k} cx={sh.cx} cy={sh.cy} r={sh.r} />;
    case "line":
      return <Line key={k} x1={sh.x1} y1={sh.y1} x2={sh.x2} y2={sh.y2} />;
    case "polyline":
      return <Polyline key={k} points={sh.points} />;
    case "polygon":
      return <Polygon key={k} points={sh.points} />;
    case "rect":
      return <Rect key={k} x={sh.x} y={sh.y} width={sh.width} height={sh.height} rx={sh.rx} ry={sh.ry} />;
    case "ellipse":
      return <Ellipse key={k} cx={sh.cx} cy={sh.cy} rx={sh.rx} ry={sh.ry} />;
  }
}

// One glyph: an SVG that sets the shared presentation attributes (stroke, weight,
// caps) on the root; the primitive children inherit them.
function Glyph({ shapes, size, stroke }: { shapes: Shape[]; size: number; stroke: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes.map((sh, i) => renderShape(sh, i))}
    </Svg>
  );
}

export function Icon(props: IconProps) {
  const { tokens } = useTheme();

  if (props.set) {
    return (
      <View className="w-full flex-row flex-wrap">
        {NAMES.map(({ key, label }) => (
          <View key={key} className="items-center gap-1.5 rounded-lg px-1 py-2.5" style={{ width: 80 }}>
            <Glyph shapes={ICONS[key]} size={20} stroke={tokens.foreground} />
            <Text className="text-muted-foreground" style={{ fontSize: 10 }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return <Glyph shapes={ICONS[nameOf(props)]} size={props.size ?? 24} stroke={strokeOf(props, tokens)} />;
}
