import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from "react-native-svg";
import { View, Text, useTheme, palette, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Icon shell. The whole glyph set, the boolean-prop axes (name + color),
// the semantic color logic, the SVG presentation, and the `set` gallery structure
// live here once; a platform file supplies only its skin (the gallery layout
// pieces) and calls createIcon.
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
//   <Icon set />                 the whole gallery, each glyph labeled by name
//
// Axes (pass at most one per axis; first match wins):
//   - Name:  one boolean per glyph (activity, bell, search, shield, …). Default shield.
//   - Color: primary, primaryForeground, destructive, success, muted. Default foreground.
//     (primaryForeground is the contrast color for a glyph on a primary surface.)
// Dimensions/layout (orthogonal): `size` (px, single glyph) and `set` (gallery).

export interface IconSkin {
  /** The `set` gallery grid (full width, glyphs flowing left-to-right and wrapping). */
  setGrid: ViewStyle;
  /** One gallery cell: a fixed-width column centering the glyph over its label. */
  setCell: ViewStyle;
  /** The gallery cell label type (size / weight / tracking). */
  setLabel: TextStyle;
}

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
  alignLeft: [
    { t: "line", x1: 21, y1: 6, x2: 3, y2: 6 },
    { t: "line", x1: 15, y1: 12, x2: 3, y2: 12 },
    { t: "line", x1: 17, y1: 18, x2: 3, y2: 18 },
  ],
  appWindow: [
    { t: "rect", x: 2, y: 4, width: 20, height: 16, rx: 2 },
    { t: "path", d: "M10 4v4M2 8h20M6 4v4" },
  ],
  archive: [
    { t: "rect", x: 2, y: 7, width: 20, height: 14, rx: 2, ry: 2 },
    { t: "path", d: "M16 3v4M8 3v4" },
  ],
  arrowRight: [
    { t: "line", x1: 5, y1: 12, x2: 19, y2: 12 },
    { t: "polyline", points: "12 5 19 12 12 19" },
  ],
  award: [
    { t: "circle", cx: 12, cy: 8, r: 6 },
    { t: "path", d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" },
  ],
  barChart2: [
    { t: "line", x1: 18, y1: 20, x2: 18, y2: 10 },
    { t: "line", x1: 12, y1: 20, x2: 12, y2: 4 },
    { t: "line", x1: 6, y1: 20, x2: 6, y2: 14 },
  ],
  bell: [
    { t: "path", d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" },
    { t: "path", d: "M13.73 21a2 2 0 0 1-3.46 0" },
  ],
  bookOpen: [
    { t: "path", d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" },
    { t: "path", d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  ],
  box: [
    { t: "path", d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
    { t: "polyline", points: "3.27 6.96 12 12.01 20.73 6.96" },
    { t: "line", x1: 12, y1: 22.08, x2: 12, y2: 12 },
  ],
  calendar: [
    { t: "rect", x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 },
    { t: "line", x1: 16, y1: 2, x2: 16, y2: 6 },
    { t: "line", x1: 8, y1: 2, x2: 8, y2: 6 },
    { t: "line", x1: 3, y1: 10, x2: 21, y2: 10 },
  ],
  chartLine: [
    { t: "path", d: "M3 3v16a2 2 0 0 0 2 2h16" },
    { t: "path", d: "m19 9-5 5-4-4-3 3" },
  ],
  check: [{ t: "polyline", points: "20 6 9 17 4 12" }],
  checkSquare: [
    { t: "polyline", points: "9 11 12 14 22 4" },
    { t: "path", d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  ],
  chevronDown: [{ t: "path", d: "m6 9 6 6 6-6" }],
  chevronLeft: [{ t: "path", d: "m15 18-6-6 6-6" }],
  chevronRight: [{ t: "path", d: "m9 18 6-6-6-6" }],
  chevronsLeft: [
    { t: "path", d: "m11 17-5-5 5-5" },
    { t: "path", d: "m18 17-5-5 5-5" },
  ],
  circleCheck: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "path", d: "m9 12 2 2 4-4" },
  ],
  circleDot: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "circle", cx: 12, cy: 12, r: 1 },
  ],
  circleX: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "path", d: "m15 9-6 6M9 9l6 6" },
  ],
  code: [
    { t: "polyline", points: "16 18 22 12 16 6" },
    { t: "polyline", points: "8 6 2 12 8 18" },
  ],
  columns2: [
    { t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { t: "path", d: "M12 3v18" },
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
  fileInput: [
    { t: "path", d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" },
    { t: "path", d: "M14 2v4a2 2 0 0 0 2 2h4" },
    { t: "path", d: "M2 15h10" },
    { t: "path", d: "m9 18 3-3-3-3" },
  ],
  fileText: [
    { t: "path", d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" },
    { t: "polyline", points: "14 2 14 8 20 8" },
    { t: "line", x1: 16, y1: 13, x2: 8, y2: 13 },
    { t: "line", x1: 16, y1: 17, x2: 8, y2: 17 },
    { t: "line", x1: 10, y1: 9, x2: 8, y2: 9 },
  ],
  filter: [{ t: "polygon", points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }],
  folder: [
    { t: "path", d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" },
  ],
  footprints: [
    { t: "path", d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" },
    { t: "path", d: "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" },
    { t: "path", d: "M16 17h4" },
    { t: "path", d: "M4 13h4" },
  ],
  gauge: [
    { t: "path", d: "m12 14 4-4" },
    { t: "path", d: "M3.34 19a10 10 0 1 1 17.32 0" },
  ],
  gitCompare: [
    { t: "circle", cx: 18, cy: 18, r: 3 },
    { t: "circle", cx: 6, cy: 6, r: 3 },
    { t: "path", d: "M13 6h3a2 2 0 0 1 2 2v7" },
    { t: "path", d: "M11 18H8a2 2 0 0 1-2-2V9" },
  ],
  globe: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "line", x1: 2, y1: 12, x2: 22, y2: 12 },
    { t: "path", d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
  ],
  group: [
    { t: "path", d: "M3 7V5c0-1.1.9-2 2-2h2" },
    { t: "path", d: "M17 3h2c1.1 0 2 .9 2 2v2" },
    { t: "path", d: "M21 17v2c0 1.1-.9 2-2 2h-2" },
    { t: "path", d: "M7 21H5c-1.1 0-2-.9-2-2v-2" },
    { t: "rect", x: 7, y: 7, width: 7, height: 5, rx: 1 },
    { t: "rect", x: 10, y: 12, width: 7, height: 5, rx: 1 },
  ],
  home: [
    { t: "path", d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { t: "polyline", points: "9 22 9 12 15 12 15 22" },
  ],
  image: [
    { t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 },
    { t: "circle", cx: 9, cy: 9, r: 2 },
    { t: "path", d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" },
  ],
  inbox: [
    { t: "polyline", points: "22 12 16 12 14 15 10 15 8 12 2 12" },
    { t: "path", d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" },
  ],
  info: [
    { t: "circle", cx: 12, cy: 12, r: 10 },
    { t: "line", x1: 12, y1: 16, x2: 12, y2: 12 },
    { t: "line", x1: 12, y1: 8, x2: 12.01, y2: 8 },
  ],
  key: [{ t: "path", d: "m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" }],
  keyboard: [
    { t: "rect", x: 2, y: 4, width: 20, height: 16, rx: 2, ry: 2 },
    { t: "path", d: "M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" },
  ],
  layers: [
    { t: "polygon", points: "12 2 2 7 12 12 22 7 12 2" },
    { t: "polyline", points: "2 17 12 22 22 17" },
    { t: "polyline", points: "2 12 12 17 22 12" },
  ],
  layout: [
    { t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 },
    { t: "line", x1: 3, y1: 9, x2: 21, y2: 9 },
    { t: "line", x1: 9, y1: 21, x2: 9, y2: 9 },
  ],
  layoutGrid: [
    { t: "rect", x: 3, y: 3, width: 7, height: 7, rx: 1 },
    { t: "rect", x: 14, y: 3, width: 7, height: 7, rx: 1 },
    { t: "rect", x: 14, y: 14, width: 7, height: 7, rx: 1 },
    { t: "rect", x: 3, y: 14, width: 7, height: 7, rx: 1 },
  ],
  list: [
    { t: "line", x1: 8, y1: 6, x2: 21, y2: 6 },
    { t: "line", x1: 8, y1: 12, x2: 21, y2: 12 },
    { t: "line", x1: 8, y1: 18, x2: 21, y2: 18 },
    { t: "line", x1: 3, y1: 6, x2: 3.01, y2: 6 },
    { t: "line", x1: 3, y1: 12, x2: 3.01, y2: 12 },
    { t: "line", x1: 3, y1: 18, x2: 3.01, y2: 18 },
  ],
  listChecks: [
    { t: "path", d: "m3 17 2 2 4-4" },
    { t: "path", d: "m3 7 2 2 4-4" },
    { t: "path", d: "M13 6h8" },
    { t: "path", d: "M13 12h8" },
    { t: "path", d: "M13 18h8" },
  ],
  loader: [
    { t: "path", d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
  ],
  lock: [
    { t: "rect", x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 },
    { t: "path", d: "M7 11V7a5 5 0 0 1 10 0v4" },
  ],
  mail: [
    { t: "path", d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" },
    { t: "polyline", points: "22,6 12,13 2,6" },
  ],
  menu: [
    { t: "line", x1: 4, y1: 6, x2: 20, y2: 6 },
    { t: "line", x1: 4, y1: 12, x2: 20, y2: 12 },
    { t: "line", x1: 4, y1: 18, x2: 20, y2: 18 },
  ],
  messageCircle: [{ t: "path", d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }],
  messageSquareWarning: [
    { t: "path", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    { t: "path", d: "M12 7v2" },
    { t: "path", d: "M12 13h.01" },
  ],
  minus: [{ t: "path", d: "M5 12h14" }],
  moon: [{ t: "path", d: "M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z" }],
  moreHorizontal: [
    { t: "circle", cx: 12, cy: 12, r: 1 },
    { t: "circle", cx: 19, cy: 12, r: 1 },
    { t: "circle", cx: 5, cy: 12, r: 1 },
  ],
  mousePointerClick: [
    { t: "path", d: "m9 9 5 12 1.8-5.2L21 14Z" },
    { t: "path", d: "M7.2 2.2 8 5.1" },
    { t: "path", d: "m5.1 8-2.9-.8" },
    { t: "path", d: "M14 4.1 12 6" },
    { t: "path", d: "m6 12-1.9 2" },
  ],
  moveVertical: [
    { t: "polyline", points: "8 18 12 22 16 18" },
    { t: "polyline", points: "8 6 12 2 16 6" },
    { t: "line", x1: 12, y1: 2, x2: 12, y2: 22 },
  ],
  navigation: [{ t: "polygon", points: "3 11 22 2 13 21 11 13 3 11" }],
  palette: [
    { t: "circle", cx: 13.5, cy: 6.5, r: 0.5 },
    { t: "circle", cx: 17.5, cy: 10.5, r: 0.5 },
    { t: "circle", cx: 8.5, cy: 7.5, r: 0.5 },
    { t: "circle", cx: 6.5, cy: 12.5, r: 0.5 },
    { t: "path", d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" },
  ],
  panelRight: [
    { t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { t: "path", d: "M15 3v18" },
  ],
  plug: [
    { t: "path", d: "M12 22v-5" },
    { t: "path", d: "M9 8V2" },
    { t: "path", d: "M15 8V2" },
    { t: "path", d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" },
  ],
  plus: [
    { t: "line", x1: 12, y1: 5, x2: 12, y2: 19 },
    { t: "line", x1: 5, y1: 12, x2: 19, y2: 12 },
  ],
  pointer: [
    { t: "path", d: "M22 14a8 8 0 0 1-8 8" },
    { t: "path", d: "M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" },
    { t: "path", d: "M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" },
    { t: "path", d: "M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" },
    { t: "path", d: "M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" },
  ],
  rocket: [
    { t: "path", d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" },
    { t: "path", d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" },
    { t: "path", d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" },
    { t: "path", d: "M15 12v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" },
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
  smartphone: [
    { t: "rect", x: 5, y: 2, width: 14, height: 20, rx: 2, ry: 2 },
    { t: "path", d: "M12 18h.01" },
  ],
  square: [{ t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2 }],
  star: [{ t: "polygon", points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }],
  sun: [
    { t: "circle", cx: 12, cy: 12, r: 4 },
    {
      t: "path",
      d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
    },
  ],
  table: [
    { t: "path", d: "M12 3v18" },
    { t: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2 },
    { t: "path", d: "M3 9h18" },
    { t: "path", d: "M3 15h18" },
  ],
  terminal: [
    { t: "polyline", points: "4 17 10 11 4 5" },
    { t: "line", x1: 12, y1: 19, x2: 20, y2: 19 },
  ],
  textCursorInput: [
    { t: "path", d: "M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" },
    { t: "path", d: "M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5" },
    { t: "path", d: "M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1" },
    { t: "path", d: "M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7" },
    { t: "path", d: "M9 7v10" },
  ],
  toggleLeft: [
    { t: "rect", x: 2, y: 6, width: 20, height: 12, rx: 6, ry: 6 },
    { t: "circle", cx: 8, cy: 12, r: 2 },
  ],
  trash: [
    { t: "polyline", points: "3 6 5 6 21 6" },
    { t: "path", d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
  ],
  type: [
    { t: "polyline", points: "4 7 4 4 20 4 20 7" },
    { t: "line", x1: 9, y1: 20, x2: 15, y2: 20 },
    { t: "line", x1: 12, y1: 4, x2: 12, y2: 20 },
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
  { key: "alignLeft", label: "align-left" },
  { key: "appWindow", label: "app-window" },
  { key: "archive", label: "archive" },
  { key: "arrowRight", label: "arrow-right" },
  { key: "award", label: "award" },
  { key: "barChart2", label: "bar-chart" },
  { key: "bell", label: "bell" },
  { key: "bookOpen", label: "book-open" },
  { key: "box", label: "box" },
  { key: "calendar", label: "calendar" },
  { key: "chartLine", label: "chart-line" },
  { key: "check", label: "check" },
  { key: "checkSquare", label: "check-sq" },
  { key: "chevronDown", label: "chevron-down" },
  { key: "chevronLeft", label: "chevron-left" },
  { key: "chevronRight", label: "chevron-right" },
  { key: "chevronsLeft", label: "chevrons-left" },
  { key: "circleCheck", label: "circle-check" },
  { key: "circleDot", label: "circle-dot" },
  { key: "circleX", label: "circle-x" },
  { key: "code", label: "code" },
  { key: "columns2", label: "columns-2" },
  { key: "copy", label: "copy" },
  { key: "database", label: "database" },
  { key: "download", label: "download" },
  { key: "eye", label: "eye" },
  { key: "file", label: "file" },
  { key: "fileInput", label: "file-input" },
  { key: "fileText", label: "file-text" },
  { key: "filter", label: "filter" },
  { key: "folder", label: "folder" },
  { key: "footprints", label: "footprints" },
  { key: "gauge", label: "gauge" },
  { key: "gitCompare", label: "git-compare" },
  { key: "globe", label: "globe" },
  { key: "group", label: "group" },
  { key: "home", label: "home" },
  { key: "image", label: "image" },
  { key: "inbox", label: "inbox" },
  { key: "info", label: "info" },
  { key: "key", label: "key" },
  { key: "keyboard", label: "keyboard" },
  { key: "layers", label: "layers" },
  { key: "layout", label: "layout" },
  { key: "layoutGrid", label: "layout-grid" },
  { key: "list", label: "list" },
  { key: "listChecks", label: "list-checks" },
  { key: "loader", label: "loader" },
  { key: "lock", label: "lock" },
  { key: "mail", label: "mail" },
  { key: "menu", label: "menu" },
  { key: "messageCircle", label: "msg-circle" },
  { key: "messageSquareWarning", label: "msg-warn" },
  { key: "minus", label: "minus" },
  { key: "moon", label: "moon" },
  { key: "moreHorizontal", label: "more-horiz" },
  { key: "mousePointerClick", label: "mouse-click" },
  { key: "moveVertical", label: "move-vert" },
  { key: "navigation", label: "navigation" },
  { key: "palette", label: "palette" },
  { key: "panelRight", label: "panel-right" },
  { key: "plug", label: "plug" },
  { key: "plus", label: "plus" },
  { key: "pointer", label: "pointer" },
  { key: "rocket", label: "rocket" },
  { key: "search", label: "search" },
  { key: "settings", label: "settings" },
  { key: "shield", label: "shield" },
  { key: "smartphone", label: "smartphone" },
  { key: "square", label: "square" },
  { key: "star", label: "star" },
  { key: "sun", label: "sun" },
  { key: "table", label: "table" },
  { key: "terminal", label: "terminal" },
  { key: "textCursorInput", label: "text-cursor" },
  { key: "toggleLeft", label: "toggle-left" },
  { key: "trash", label: "trash" },
  { key: "type", label: "type" },
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
  alignLeft?: boolean;
  appWindow?: boolean;
  archive?: boolean;
  arrowRight?: boolean;
  award?: boolean;
  barChart2?: boolean;
  bell?: boolean;
  bookOpen?: boolean;
  box?: boolean;
  calendar?: boolean;
  chartLine?: boolean;
  check?: boolean;
  checkSquare?: boolean;
  chevronDown?: boolean;
  chevronLeft?: boolean;
  chevronRight?: boolean;
  chevronsLeft?: boolean;
  circleCheck?: boolean;
  circleDot?: boolean;
  circleX?: boolean;
  code?: boolean;
  columns2?: boolean;
  copy?: boolean;
  database?: boolean;
  download?: boolean;
  eye?: boolean;
  file?: boolean;
  fileInput?: boolean;
  fileText?: boolean;
  filter?: boolean;
  folder?: boolean;
  footprints?: boolean;
  gauge?: boolean;
  gitCompare?: boolean;
  globe?: boolean;
  group?: boolean;
  home?: boolean;
  image?: boolean;
  inbox?: boolean;
  info?: boolean;
  key?: boolean;
  keyboard?: boolean;
  layers?: boolean;
  layout?: boolean;
  layoutGrid?: boolean;
  list?: boolean;
  listChecks?: boolean;
  loader?: boolean;
  lock?: boolean;
  mail?: boolean;
  menu?: boolean;
  messageCircle?: boolean;
  messageSquareWarning?: boolean;
  minus?: boolean;
  moon?: boolean;
  moreHorizontal?: boolean;
  mousePointerClick?: boolean;
  moveVertical?: boolean;
  navigation?: boolean;
  palette?: boolean;
  panelRight?: boolean;
  plug?: boolean;
  plus?: boolean;
  pointer?: boolean;
  rocket?: boolean;
  search?: boolean;
  settings?: boolean;
  shield?: boolean;
  smartphone?: boolean;
  square?: boolean;
  star?: boolean;
  sun?: boolean;
  table?: boolean;
  terminal?: boolean;
  textCursorInput?: boolean;
  toggleLeft?: boolean;
  trash?: boolean;
  type?: boolean;
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
  /** Positive/green status (matches Alert's success tone, scheme-aware). */
  success?: boolean;
  muted?: boolean;
  // Single-glyph size in px (default 24).
  size?: number;
  // Render the whole gallery instead of a single glyph.
  set?: boolean;
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
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// First-match name precedence; defaults to shield (the demo glyph).
function nameOf(p: IconProps): string {
  for (const { key } of NAMES) {
    if ((p as Record<string, unknown>)[key]) return key;
  }
  return "shield";
}

// First-match color precedence; defaults to foreground. `success` rides the
// palette green at the same light/dark shades Alert uses for its success icon.
function strokeOf(p: IconProps, tokens: ColorTokens, dark: boolean): string {
  if (p.primary) return tokens.primary;
  if (p.primaryForeground) return tokens["primary-foreground"];
  if (p.destructive) return tokens.destructive;
  if (p.success) return dark ? palette["green-400"] : palette["green-600"];
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
function Glyph({
  shapes,
  size,
  stroke,
  style,
}: {
  shapes: Shape[];
  size: number;
  stroke: string;
  style?: StyleProp<ViewStyle>;
}) {
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
      style={style}
    >
      {shapes.map((sh, i) => renderShape(sh, i))}
    </Svg>
  );
}

export function createIcon(skin: IconSkin) {
  return function Icon(props: IconProps) {
    const { tokens, dark } = useTheme();

    if (props.set) {
      return (
        <View style={[skin.setGrid, props.style]}>
          {NAMES.map(({ key, label }) => (
            <View key={key} style={[skin.setCell, { width: 80 }]}>
              <Glyph shapes={ICONS[key]} size={20} stroke={tokens.foreground} />
              <Text style={[skin.setLabel, { color: tokens["muted-foreground"], fontSize: 10 }]}>{label}</Text>
            </View>
          ))}
        </View>
      );
    }

    const wrapped = props.decorative || props.accessibilityLabel != null;
    const glyph = (
      <Glyph
        shapes={ICONS[nameOf(props)]}
        size={props.size ?? 24}
        stroke={strokeOf(props, tokens, dark)}
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
          style={props.style}
        >
          {glyph}
        </View>
      );
    }
    return glyph;
  };
}
