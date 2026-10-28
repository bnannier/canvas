import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, useControllableState, devWarn, tabularNums, type LayoutStyle, GlassPane, paneStyle, isGlass } from "../../style/index.js";
import * as s from "../shared/charts.styles.js";
import { type ChartSkin } from "../shared/types.js";
import { CHART_ROOT } from "../shared/chart-frame.js";
import { ChartValueFlag, announceSelection, pressPoint, DIM_OPACITY } from "../shared/chart-inspect.js";
import { estimateTextWidth, formatCompact, squarify } from "../shared/chart-math.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";
import { contrastRatio, inkOn, mixOklab } from "../../style/color.js";

// Shared Treemap shell. Squarified value tiles (Bruls layout through the
// shared chart-math helper): each datum becomes a ramp-colored rectangle
// whose area is proportional to its value, with the label and formatted
// value rendered inside only when they fit. Pure Views, no SVG (the
// bar-Chart and Heatmap precedent). Flat one-level data; nesting and
// drill-down are deferred scope. Pressing a tile selects it (the others
// dim) and flags label, value, and share.
//
// Treemap is a "Shared" platform treatment (data visualization is
// platform-neutral): the skin carries the same values on every OS.

export interface TreemapDatum {
  /** Stable identity, used as the React key when present. */
  id?: string | number;
  /** The tile label. */
  label: string;
  /** The tile's magnitude; sizes its area. */
  value: number;
}

export interface TreemapProps {
  /** The tiles, laid out largest first by the squarified algorithm. */
  data: TreemapDatum[];
  /** Optional heading shown above the tiles. */
  title?: string;
  // Density (omit for the default 240 plot height; compact is 160).
  compact?: boolean;
  /** Strip the card surface for nesting inside an existing card (mirrors Stats). */
  plain?: boolean;
  /** Formats tile values and the flag (data formatting, not styling). */
  formatValue?: (v: number) => string;
  /** Press-to-inspect: the selected tile index (controlled). Pass null for none. */
  selected?: number | null;
  /** Press-to-inspect: the initially selected tile (uncontrolled). */
  defaultSelected?: number;
  /** Fired when a press selects a tile (or clears it with null). */
  onSelect?: (index: number | null) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

const PLOT_HEIGHT = { default: 240, compact: 160 } as const;
const MAX_TILES = 24;
// The v4 hand-off's tiles (`K.def('treemap')`): each inset 2 px in its cell, at the
// treemap-tile corner, filled with its series colour mixed 70% over the card, an 8 px
// inset, the label 600 12 px and the value 500 11 px mono at .75, in the hand-off's
// near-black ink (or the tile's own best ink where that falls under 4.5:1). A fill on
// which neither ink reaches 4.5:1 (a mid-lightness series, the amber accent on the dark
// card) steps its mix back toward the card by TILE_MIX_STEP until one does.
const TILE_INSET = 2;
const TILE_PAD = 8;
const TILE_MIX = 0.7;
const TILE_MIX_STEP = 0.02;
const TILE_INK = "#0a0a0f";
const TILE_VALUE_TYPE = { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "500" as const };

/** The tile's fill and ink: the series colour mixed over the card, and the ink it carries. */
export function tileLook(card: string, series: string): { fill: string; ink: string } {
  for (let mix = TILE_MIX; mix > 0; mix -= TILE_MIX_STEP) {
    const fill = mixOklab(card, series, mix);
    if (contrastRatio(TILE_INK, fill) >= 4.5) return { fill, ink: TILE_INK };
    const ink = inkOn(fill);
    if (contrastRatio(ink, fill) >= 4.5) return { fill, ink };
  }
  return { fill: card, ink: inkOn(card) };
}

export function createTreemap(skin: ChartSkin) {
  return function Treemap(props: TreemapProps) {
    const { data, title, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const surfaceShape = s.surface(tokens, skin.surfaceRadius);
    const glass = isGlass(theme);
    const compact = !!props.compact;
    const formatValue = props.formatValue ?? formatCompact;
    const height = compact ? PLOT_HEIGHT.compact : PLOT_HEIGHT.default;

    devWarn(data.length === 0, "[canvas] <Treemap />: `data` is empty; the chart renders with no tiles.");
    devWarn(data.length > MAX_TILES, `[canvas] <Treemap />: more than ${MAX_TILES} tiles read as noise; aggregate the tail.`);
    devWarn(
      data.some((d) => Number.isFinite(d.value) && d.value < 0),
      "[canvas] <Treemap />: a tile's `value` is negative; it is treated as 0 and gets no area.",
    );

    const clean = data.map((d) => (Number.isFinite(d.value) && d.value > 0 ? d.value : 0));
    const total = clean.reduce((a, b) => a + b, 0);
    const pctOf = (v: number): number => (total > 0 ? Math.round((v / total) * 100) : 0);

    // The composition lives in the accessible name, shares included.
    const name = `${title ?? "Treemap"}: ${data.map((d, i) => `${d.label} ${formatValue(clean[i])} (${pctOf(clean[i])}%)`).join(", ")}`;

    const [selected, setSelectedRaw] = useControllableState<number | null>(props.selected, props.defaultSelected ?? null, props.onSelect);
    const setSelected = (i: number | null) => {
      setSelectedRaw(i);
      if (i != null && data[i]) announceSelection(`${data[i].label}: ${formatValue(clean[i])}, ${pctOf(clean[i])}% of total`);
    };
    const toggle = (i: number) => setSelected(selected === i ? null : i);

    // The tiles need the measured width (the card is fluid).
    const [width, setWidth] = useState(0);
    const rects = width > 0 ? squarify(clean, 0, 0, width, height) : [];

    return (
      <View
        {...(title != null && title !== "" ? { role: "group" as const, accessibilityLabel: `${title} chart`, "aria-label": `${title} chart` } : {})}
        testID={testID}
        style={[
          props.plain ? null : paneStyle(theme, [surfaceShape, compact ? s.surfacePadCompact : s.surfacePadDefault]),
          CHART_ROOT,
          style,
        ]}
      >
        {/* The chart frame is a CONTENT-layer pane under glass (nothing in solid mode). */}
        {glass && !props.plain ? <GlassPane layer="content" shape={surfaceShape} /> : null}
        {title != null && title !== "" ? (
          <Text style={[s.title(tokens), compact ? s.titleCompact : s.titleDefault]}>{title}</Text>
        ) : null}
        <View
          accessible
          accessibilityRole="image"
          role="img"
          accessibilityLabel={name}
          aria-label={name}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ height }}
        >
          {rects.map((r, i) => {
            if (r.w <= 0 || r.h <= 0) return null;
            // Labels render only when they fit the tile (inside its 2 px inset and
            // 8 px padding); the name carries every tile anyway.
            const w = r.w - TILE_INSET * 2;
            const h = r.h - TILE_INSET * 2;
            if (w <= 0 || h <= 0) return null;
            const labelFits = h >= 32 && estimateTextWidth(data[i].label, 12) + TILE_PAD * 2 <= w;
            const valueFits = labelFits && h >= 46 && estimateTextWidth(formatValue(clean[i]), 11) + TILE_PAD * 2 <= w;
            const look = tileLook(tokens.card, s.seriesFill(tokens, i));
            return (
              <View
                key={data[i].id ?? i}
                style={{
                  position: "absolute",
                  left: r.x + TILE_INSET,
                  top: r.y + TILE_INSET,
                  width: w,
                  height: h,
                  backgroundColor: look.fill,
                  borderRadius: Math.min(platformShape.web.chartTile, w / 2, h / 2),
                  padding: TILE_PAD,
                  opacity: selected != null && selected !== i ? DIM_OPACITY : 1,
                }}
              >
                {labelFits ? (
                  <Text numberOfLines={1} style={{ fontSize: 12, lineHeight: 16, fontWeight: "600", color: look.ink }}>
                    {data[i].label}
                  </Text>
                ) : null}
                {valueFits ? (
                  <Text numberOfLines={1} style={{ ...TILE_VALUE_TYPE, color: look.ink, opacity: 0.75, ...tabularNums() }}>
                    {formatValue(clean[i])}
                  </Text>
                ) : null}
              </View>
            );
          })}
          {/* The selection flag, above the tiles. */}
          {selected != null && rects[selected] != null && data[selected] != null ? (
            <ChartValueFlag
              title={data[selected].label}
              rows={[
                { label: "Value", value: formatValue(clean[selected]) },
                { label: "Share", value: `${pctOf(clean[selected])}%` },
              ]}
              x={rects[selected].x + rects[selected].w / 2}
              plotW={width}
            />
          ) : null}
          {/* Empty hit layer: tile index by press point. */}
          <Pressable
            accessible={false}
            onPress={(e) => {
              const point = pressPoint(e);
              if (!point) return;
              const i = rects.findIndex((r) => point.x >= r.x && point.x < r.x + r.w && point.y >= r.y && point.y < r.y + r.h && r.w > 0 && r.h > 0);
              if (i >= 0) toggle(i);
              else setSelected(null);
            }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    );
  };
}
