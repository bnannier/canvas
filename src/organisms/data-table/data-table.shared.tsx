import { type ComponentType, type ReactNode, useState } from "react";
import { View, Pressable, Text, useTheme, breakpoints, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type CheckboxProps } from "../../atoms/checkbox/checkbox.shared.js";
import {
  type Density,
  type DataTableSkin,
} from "./data-table.styles.js";

// Shared DataTable shell. The data table lays a grid out as flex rows of
// equal-width flex-1 cells (RN has no CSS table primitive; tables are flex
// rows/columns). A header row carries the column labels on a tinted surface, and
// the data rows sit beneath it separated by hairlines.
//
// The structure, the boolean-prop API, the data-shape types, the cell-coercion
// logic, the selection column, the striped tint placement, the pressable-row
// behavior, and accessibility all live here once. A platform file supplies only
// its skin (row rhythm/density padding, header label type/tracking, hairline,
// stripe fill, outer radius, and the press-feedback mode) plus the platform
// variant of the leading Checkbox, and calls createDataTable.
//
// DataTable is a "Light" platform treatment: one structure with small per-OS
// touches (row height/density, header type/tracking, divider/hairline, striped
// fill, M3 vs iOS row rhythm). It is a CONTENT-LAYER surface, so it stays SOLID
// on every platform (it never goes glass).

export type { Density };

export interface DataTableProps {
  /** Column header labels, one per column. */
  columns: string[];
  /**
   * Row data: an array of rows, each an array of cells (one per column). A cell is
   * a string (rendered in the default cell type) or any ReactNode for a custom
   * cell — a link, a `Badge`, a monospace name, etc. (rendered directly).
   */
  rows: ReactNode[][];
  /** Tint every other data row for easier horizontal scanning. */
  striped?: boolean;
  /** Wrap the table in a rounded outer border. */
  bordered?: boolean;
  // Density (pick one; default is the regular row height).
  /** Tighter vertical padding on header and data cells. */
  compact?: boolean;
  /** Prepend a leading checkbox column (header gets an empty selector cell). */
  selectable?: boolean;
  /** When set, each data row is pressable, reporting the row data and index. */
  onRowPress?: (row: ReactNode[], index: number) => void;
  /**
   * Stable key for a row, derived from the row data and its index. Supply this
   * whenever rows can be reordered, inserted, or deleted AND a cell is a stateful
   * custom ReactNode (an input, a toggle, a Badge with internal state): the shape
   * is `ReactNode[][]` with no intrinsic id, so without a stable key React reuses
   * the element at a position rather than its identity, and the wrong row keeps
   * the previous row's internal state. When omitted, rows fall back to their array
   * index (safe for string/number cells and stateless custom cells).
   */
  rowKey?: (row: ReactNode[], index: number) => string | number;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Density precedence when more than one is passed: first match wins.
function densityOf(p: DataTableProps): Density {
  if (p.compact) return "compact";
  return "regular";
}

/**
 * Build a DataTable component from a platform skin plus the platform variant of
 * the leading Checkbox (so the selection column renders the matching native
 * checkbox on each OS).
 */
export function createDataTable(skin: DataTableSkin, Checkbox: ComponentType<CheckboxProps>) {
  return function DataTable(props: DataTableProps) {
    const { columns, rows, striped, bordered, selectable, onRowPress, rowKey, testID, style } = props;
    const density = densityOf(props);
    const { tokens } = useTheme();

    // Measure the table's OWN width so the compact-width collapse tracks the
    // container, not the window: the docs 3-up and a real iPhone both render the
    // table narrower than a desktop window would report, so useWindowDimensions
    // cannot see the narrow column.
    const [measuredWidth, setMeasuredWidth] = useState(0);
    // SwiftUI Table collapses to its PRIMARY (first) column in compact width on
    // iPhone; the iOS skin opts in. Every other platform renders all columns.
    const collapsed =
      !!skin.collapsesToPrimaryColumn && measuredWidth > 0 && measuredWidth < breakpoints.sm;
    const visibleColumns = collapsed ? columns.slice(0, 1) : columns;

    const wrap: StyleProp<ViewStyle> = [
      skin.wrap,
      // RN has no ring; a rounded 1px border is the bordered outline.
      bordered ? skin.borderedOutline(tokens) : null,
      style,
    ];

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <View
        testID={testID}
        style={wrap}
        role="table"
        onLayout={(e) => {
          const w = Math.round(e.nativeEvent.layout.width);
          setMeasuredWidth((prev) => (prev !== w ? w : prev));
        }}
      >
        <View style={[skin.headerRow(tokens), skin.headerPad[density]]} role="row">
          {selectable ? <View style={skin.selectCol} role="columnheader" /> : null}
          {visibleColumns.map((label, i) => (
            <Text key={`h-${i}`} style={skin.headerCell(tokens)} role="columnheader">
              {label}
            </Text>
          ))}
        </View>
        {rows.map((row, r) => {
          // Prefer a caller-supplied stable key so stateful custom cells keep
          // their identity across reorder/insert/delete; fall back to the index.
          const rowId = rowKey ? rowKey(row, r) : r;
          const cells = (
            <>
              {selectable ? (
                <View style={[skin.selectCell, skin.cellPad[density], { pointerEvents: "none" }]} role="cell">
                  {/* DataTable carries no per-row selection state in its public API
                      (rows are raw ReactNode cells; `selectable` only adds the
                      column), so the selection checkbox is a NON-INTERACTIVE
                      affordance. `pointerEvents:"none"` lets a row press pass THROUGH
                      the checkbox to onRowPress instead of dead-ending on the
                      checkbox's own Pressable (a permanently dead tap zone). */}
                  <Checkbox checked={false} />
                </View>
              ) : null}
              {visibleColumns.map((_col, c) => {
                const cell = cellOf(row, c);
                return (
                  <View key={`c-${rowId}-${c}`} style={[skin.dataCell, skin.cellPad[density]]} role="cell">
                    {typeof cell === "string" || typeof cell === "number" ? (
                      <Text style={skin.cellText(tokens)}>{cell}</Text>
                    ) : (
                      cell
                    )}
                  </View>
                );
              })}
              {/* An inset row separator (iOS), absolutely positioned so it does not
                  affect the flex layout; web/Android use the dataRow's full-bleed
                  borderBottom instead (skin.separator is null there). */}
              {skin.separator ? <View style={[skin.separator(tokens), { pointerEvents: "none" }]} /> : null}
            </>
          );
          // The striped tint sits on odd-index rows for either layout.
          const stripe = striped && r % 2 === 1 ? skin.stripeTint(tokens) : null;
          return onRowPress ? (
            <Pressable
              key={`r-${rowId}`}
              onPress={() => onRowPress(row, r)}
              android_ripple={ripple}
              role="button"
              // Announce the actionable row's content: read off the plain
              // string/number cells (custom ReactNode cells carry their own
              // labels, so they are skipped here).
              accessibilityLabel={rowLabel(row)}
              style={({ pressed }) => [
                skin.dataRow(tokens),
                // Hold the platform minimum tap target (iOS 44pt / M3 48dp) so a
                // compact pressable row is not sub-minimum; web omits it.
                skin.pressableMinHeight != null ? { minHeight: skin.pressableMinHeight } : null,
                stripe,
                // Android ripples; iOS/web tint the row fill on press.
                skin.ripple == null && pressed ? skin.pressTint(tokens) : null,
              ]}
            >
              {cells}
            </Pressable>
          ) : (
            <View key={`r-${rowId}`} style={[skin.dataRow(tokens), stripe]} role="row">
              {cells}
            </View>
          );
        })}
      </View>
    );
  };
}

// Read a cell, tolerating short rows (missing trailing cells render empty).
function cellOf(row: ReactNode[], index: number): ReactNode {
  const value = row[index];
  return value == null ? "" : value;
}

// Derive a screen-reader label for a pressable row from its plain text cells.
// Custom ReactNode cells (links, badges, inputs) carry their own labels, so only
// the string/number cells are joined here.
function rowLabel(row: ReactNode[]): string {
  return row
    .filter((cell): cell is string | number => typeof cell === "string" || typeof cell === "number")
    .join(", ");
}
