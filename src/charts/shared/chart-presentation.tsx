import { platformShape } from "../../style/platform-shape.js";
import { CHART_LOOK } from "./charts.styles.js";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { View, Text, useTheme } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";

/**
 * Internal presentation of the v4 Charts room's authored specimens. The room
 * composes the real chart controls while retaining its deliberately sparse
 * furniture and fixed drawing proportions. Public chart defaults are unchanged.
 */
export type ChartPresentationKind =
  | "chart"
  | "line"
  | "area"
  | "range"
  | "composed"
  | "histogram"
  | "box"
  | "scatter"
  | "waterfall"
  | "depth"
  | "candlestick";

export interface ChartPresentation {
  kind: ChartPresentationKind;
  annotation?: { index: number; lines: string[] };
  /** An authored five-number summary, independent of raw-sample Tukey estimation. */
  boxSummaries?: Array<{
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
  }>;
}

const ChartPresentationContext = createContext<ChartPresentation | null>(null);

export function ChartPresentationProvider({
  kind,
  annotation,
  boxSummaries,
  children,
}: ChartPresentation & { children: ReactNode }) {
  const value = useMemo(() => ({ kind, annotation, boxSummaries }), [kind, annotation, boxSummaries]);
  return (
    <ChartPresentationContext.Provider value={value}>
      {children}
    </ChartPresentationContext.Provider>
  );
}

export const useChartPresentation = () => useContext(ChartPresentationContext);

/** The original page's viewBoxes and grid coordinates, in authored units. */
export const CHART_PRESENTATIONS = {
  chart: { width: 400, height: 180, meet: false, grid: [] },
  line: { width: 400, height: 180, meet: false, grid: [45, 90, 135] },
  area: { width: 300, height: 140, meet: false, grid: [35, 70, 105] },
  range: { width: 330, height: 140, meet: false, grid: [47, 94] },
  composed: { width: 320, height: 140, meet: false, grid: [35, 70, 105] },
  histogram: { width: 300, height: 140, meet: false, grid: [] },
  box: { width: 280, height: 150, meet: true, grid: [64, 124] },
  scatter: { width: 280, height: 150, meet: true, grid: [37, 75, 112] },
  waterfall: { width: 280, height: 150, meet: true, grid: [130] },
  depth: { width: 300, height: 140, meet: false, grid: [] },
  candlestick: {
    width: 320,
    height: 150,
    meet: false,
    grid: [20, 50, 80, 116],
  },
} as const;

const styles = StyleSheet.create({ passthrough: { pointerEvents: "none" } });

/** The room's pinned readout; inspection changes its values through the real chart. */
export function PresentationFlag({
  lines,
  x,
  y = 6,
  before = false,
  gap = 10,
  radius = platformShape.web.chartFlag,
  padH = 8,
  padV = 6,
  fontSize = CHART_LOOK.legendCaptionSize,
  lineHeight = 15.95,
  mutedLast = false,
}: {
  lines: string[];
  x: number;
  y?: number;
  before?: boolean;
  gap?: number;
  radius?: number;
  padH?: number;
  padV?: number;
  fontSize?: number;
  lineHeight?: number;
  mutedLast?: boolean;
}) {
  const { tokens } = useTheme();
  const width =
    Math.max(...lines.map((line) => line.length)) * fontSize * 0.6 + padH * 2;
  return (
    <View
      style={[
        styles.passthrough,
        {
          position: "absolute",
          left: before ? x - gap - width : x + gap,
          top: y,
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: radius,
          backgroundColor: tokens.foreground,
        },
      ]}
    >
      {lines.map((line, i) => (
        <Text
          key={i}
          style={{
            fontFamily: MONO_FONT,
            fontSize,
            lineHeight,
            fontWeight: "500",
            color: tokens.background,
            opacity: mutedLast && i === lines.length - 1 ? 0.6 : 1,
          }}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}
