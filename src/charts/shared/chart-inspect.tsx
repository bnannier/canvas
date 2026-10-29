import { useRef, type ReactNode } from "react";
import { AccessibilityInfo, StyleSheet } from "react-native";
import { View, Text, useTheme, GlassPane, paneStyle, isGlass, inverseDenseTint, type StyleProp, type ViewStyle, type LayoutStyle } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";

// Press-to-inspect support shared by the Chart family: the in-plot value flag
// (the ink pill the v4 hand-off's section cards pin beside an inspected datum, clamped
// inside the plot bounds) and the assistive announcement that mirrors it.
// The flag is presentational (pointer-events none, and the plot's accessible
// name already carries the full data), so it never traps a press or adds a
// duplicate accessibility node.

export interface FlagRow {
  /** Series/datum name, printed before the value ("High 24°"); omitted for single-value flags. */
  label?: string;
  /** Series color. The pill names a series by its label, so the color is not drawn. */
  color?: string;
  /** The formatted value. */
  value: string;
}

// pointerEvents must come from StyleSheet.create on react-native-web (an
// inline object silently fails to compile the pointer-events declaration).
const styles = StyleSheet.create({
  passthrough: { pointerEvents: "none" },
});

/**
 * The flag's type: the hand-off's `font:500 11px/1.45 var(--fm)` pill lines, the
 * Typography `tiny` role (11 / 15.95) in the mono face at the medium weight.
 */
const FLAG_TYPE = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 15.95, fontWeight: "500" } as const;
/** The pill's inset: the hand-off's `padding:6px 8px`. */
const PAD_V = 6;
const PAD_H = 8;
/** JetBrains Mono's advance, in ems: every glyph is 0.6 of the size wide. */
const MONO_ADVANCE = 0.6;

/**
 * The chart value flag's surface: the inverse pill (the Tooltip bubble's reading, the
 * scheme's `foreground` as the fill under `background` ink) at the `chartFlag` corner.
 * Under glass it takes the dense layer at the inverse fill's own tint
 * (`inverseDenseTint`), so its text keeps its contrast.
 */
export function ChartInspectionSurface({ children, radius = platformShape.web.chartFlag, style }: {
  children: ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useMaterialTheme({ layer: "dense" });
  const { tokens } = theme;
  const shape: ViewStyle = { borderRadius: radius, backgroundColor: tokens.foreground };
  return (
    <View style={[styles.passthrough, paneStyle(theme, [shape, style])]}>
      {isGlass(theme) ? <GlassPane layer="dense" shape={shape} tint={inverseDenseTint(theme)} /> : null}
      {children}
    </View>
  );
}

/** The ink every line of the flag is set in: the page colour on the inverse fill. */
export function flagInk(tokens: { background: string }): string {
  return tokens.background;
}

/** The pill's lines: the title (when there is one) over one line per row, each its label then its value. */
export function flagLines(title: string | undefined, rows: FlagRow[]): string[] {
  const line = (r: FlagRow) => (r.label ? `${r.label} ${r.value}` : r.value);
  return [...(title ? [title] : []), ...rows.map(line)];
}

/** The pill's width from its widest line in the mono face, so positioning never needs a second layout pass. */
function flagWidth(lines: string[]): number {
  const widest = Math.max(0, ...lines.map((l) => [...l].length));
  // A px of slack on top of the exact mono advance: an ellipsized value is worse.
  return Math.ceil(widest * FLAG_TYPE.fontSize * MONO_ADVANCE) + PAD_H * 2 + 2;
}

export interface ChartValueFlagProps {
  /** Heading (usually the category or point label). */
  title?: string;
  rows: FlagRow[];
  /** The datum's x position in plot coordinates. */
  x: number;
  /** Plot width, for clamping the flag inside the plot. */
  plotW: number;
}

export function ChartValueFlag({ title, rows, x, plotW }: ChartValueFlagProps) {
  const { tokens } = useTheme();
  const lines = flagLines(title, rows);
  const w = flagWidth(lines);
  // Prefer sitting to the right of the datum; flip left when it would clip,
  // then clamp to the plot as a last resort (narrow plots).
  let left = x + 8;
  if (left + w > plotW) left = x - 8 - w;
  if (left < 0) left = Math.max(0, Math.min(plotW - w, x - w / 2));

  return (
    <ChartInspectionSurface
      style={{
        position: "absolute",
        top: 4,
        left,
        width: w,
        paddingVertical: PAD_V,
        paddingHorizontal: PAD_H,
      }}
    >
      {lines.map((l, i) => (
        <Text key={i} numberOfLines={1} style={{ ...FLAG_TYPE, color: flagInk(tokens) }}>
          {l}
        </Text>
      ))}
    </ChartInspectionSurface>
  );
}

/**
 * Mirror a selection into assistive tech (RN and react-native-web both
 * implement announceForAccessibility; RNW backs it with a live region).
 */
export function announceSelection(text: string): void {
  AccessibilityInfo.announceForAccessibility?.(text);
}

/**
 * The press position relative to the pressed element, or null when the event
 * carries none (never let a NaN reach the selection math). Native provides
 * `locationX`; react-native-web's responder events compute it lazily, but a
 * Pressable press driven by a mouse click can surface a raw MouseEvent, where
 * only `offsetX` exists. offsetX is TARGET-relative, so hit-layer Pressables
 * must be empty (nothing inside to become the target).
 */
export function pressPoint(e: { nativeEvent: unknown }): { x: number; y: number } | null {
  const ne = e.nativeEvent as Partial<{ locationX: number; locationY: number; offsetX: number; offsetY: number }>;
  const x = Number.isFinite(ne.locationX) ? (ne.locationX as number) : Number.isFinite(ne.offsetX) ? (ne.offsetX as number) : NaN;
  const y = Number.isFinite(ne.locationY) ? (ne.locationY as number) : Number.isFinite(ne.offsetY) ? (ne.offsetY as number) : NaN;
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/** Opacity applied to marks OUTSIDE the current selection: the hand-off's `.55` on the section cards' unselected marks. */
export const DIM_OPACITY = 0.55;

// ---------------------------------------------------------------------------
// ScrubSurface: the shared drag-to-inspect hit layer. Built on the core RN
// responder system (no gesture-handler): react-native-web implements these
// responder events with real locationX getters, so coordinates work on every
// platform, unlike Pressable's mouse-click path. A press selects, dragging
// scrubs continuously, and releasing without leaving the initially-selected
// band clears it (preserving tap-to-toggle). A parent ScrollView can still
// steal the responder for vertical scrolls (onResponderTerminate keeps the
// last selection).

export interface ScrubSurfaceProps {
  /** Map a plot-local point to a selection index (null = nothing there). */
  indexAt: (x: number, y: number) => number | null;
  /** The currently selected index (for tap-on-selected-clears). */
  selected: number | null;
  /** SET the selection (null clears). */
  onScrub: (index: number | null) => void;
  style?: LayoutStyle;
}

export interface ScrubGesture {
  index: number | null;
  wasSelected: boolean;
  moved: boolean;
}

/**
 * The pure scrub state machine (exported for tests; the DOM test harness
 * cannot drive real responder events at zero layout width). Returns the next
 * gesture bookkeeping plus the selection to apply (`undefined` = no change,
 * `null` = clear).
 */
export function scrubEvent(
  phase: "grant" | "move" | "release",
  index: number | null,
  gesture: ScrubGesture,
  selected: number | null,
): { gesture: ScrubGesture; select: number | null | undefined } {
  if (phase === "grant") {
    return {
      gesture: { index, wasSelected: index != null && index === selected, moved: false },
      select: index ?? undefined,
    };
  }
  if (phase === "move") {
    if (index == null) return { gesture, select: undefined };
    return { gesture: { ...gesture, moved: gesture.moved || index !== gesture.index }, select: index };
  }
  // release: a stationary press on the already-selected index toggles it off.
  if (!gesture.moved && gesture.wasSelected && index === gesture.index) return { gesture, select: null };
  return { gesture, select: undefined };
}

export function ScrubSurface({ indexAt, selected, onScrub, style }: ScrubSurfaceProps) {
  // Gesture bookkeeping in a ref: the surface never re-renders for it.
  const gesture = useRef<ScrubGesture>({ index: null, wasSelected: false, moved: false });

  const handle = (phase: "grant" | "move" | "release") => (e: { nativeEvent: unknown }) => {
    const p = pressPoint(e);
    const i = p ? indexAt(p.x, p.y) : null;
    const next = scrubEvent(phase, i, gesture.current, selected);
    gesture.current = next.gesture;
    if (next.select !== undefined) onScrub(next.select);
  };

  return (
    <View
      accessible={false}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handle("grant")}
      onResponderMove={handle("move")}
      onResponderRelease={handle("release")}
      style={style}
    />
  );
}
