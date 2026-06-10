import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.js";
import * as s from "./data-table.styles.js";
import { type Density } from "./data-table.styles.js";

// The data table lays a grid out as flex rows of equal-width flex-1 cells (RN
// has no CSS table primitive; tables are flex rows/columns). A header row
// carries small, muted, uppercase column labels on a tinted surface, and the
// data rows sit beneath it separated by hairlines.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Density (`compact`)
// retunes the vertical padding; `striped` tints alternating rows; `bordered`
// wraps the whole table in a rounded outline; `selectable` prepends a leading
// checkbox column to every row.

export interface DataTableProps {
  /** Column header labels, one per column. */
  columns: string[];
  /** Row data: an array of rows, each an array of cell strings (one per column). */
  rows: string[][];
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
  onRowPress?: (row: string[], index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Density precedence when more than one is passed: first match wins.
function densityOf(p: DataTableProps): Density {
  if (p.compact) return "compact";
  return "regular";
}

export function DataTable(props: DataTableProps) {
  const { columns, rows, striped, bordered, selectable, onRowPress, style } = props;
  const density = densityOf(props);
  const { tokens } = useTheme();

  const wrap: StyleProp<ViewStyle> = [
    s.wrap,
    // RN has no ring; a rounded 1px border is the bordered outline.
    bordered ? s.borderedOutline(tokens) : null,
    style,
  ];

  return (
    <View style={wrap}>
      <View style={[s.headerRow(tokens), s.headerPad[density]]}>
        {selectable ? <View style={s.selectCol} /> : null}
        {columns.map((label, i) => (
          <Text key={`h-${i}`} style={s.headerCell(tokens)}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, r) => {
        const cells = (
          <>
            {selectable ? (
              <View style={[s.selectCell, s.cellPad[density]]}>
                <Checkbox />
              </View>
            ) : null}
            {columns.map((_col, c) => (
              <View key={`c-${r}-${c}`} style={[s.dataCell, s.cellPad[density]]}>
                <Text style={s.cellText(tokens)}>{cellOf(row, c)}</Text>
              </View>
            ))}
          </>
        );
        // The striped tint sits on odd-index rows for either layout.
        const stripe = striped && r % 2 === 1 ? s.stripeTint(tokens) : null;
        return onRowPress ? (
          <Pressable
            key={`r-${r}`}
            onPress={() => onRowPress(row, r)}
            style={({ pressed }) => [s.dataRow(tokens), stripe, pressed ? s.pressTint(tokens) : null]}
          >
            {cells}
          </Pressable>
        ) : (
          <View key={`r-${r}`} style={[s.dataRow(tokens), stripe]}>
            {cells}
          </View>
        );
      })}
    </View>
  );
}

// Read a cell, tolerating short rows (missing trailing cells render empty).
function cellOf(row: string[], index: number): ReactNode {
  const value = row[index];
  return value == null ? "" : value;
}
