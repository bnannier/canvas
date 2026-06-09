import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Checkbox } from "./checkbox.js";

// The data table lays a grid out as flex rows of equal-width flex-1 cells (the
// engine has no CSS table primitive; tables are flex rows/columns). A header row
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
  className?: string;
}

type Density = "compact" | "regular";

// Density precedence when more than one is passed: first match wins.
function densityOf(p: DataTableProps): Density {
  if (p.compact) return "compact";
  return "regular";
}

// Vertical padding per density. Header sits a touch tighter than the body so the
// label band reads as a header, matching the documented compact/regular modes.
const HEADER_PAD: Record<Density, string> = {
  compact: "px-4 py-1.5",
  regular: "px-4 py-2",
};
const CELL_PAD: Record<Density, string> = {
  compact: "px-4 py-2",
  regular: "px-4 py-3",
};

// Width of the leading checkbox column, kept narrow and fixed so it does not eat
// into the flex-1 content cells.
const SELECT_COL = "w-10 items-center justify-center";

export function DataTable(props: DataTableProps) {
  const { columns, rows, striped, bordered, selectable, onRowPress, className } = props;
  const density = densityOf(props);

  const wrap = cn(
    "overflow-hidden",
    // The engine has no ring; a rounded 1px border is the bordered outline.
    bordered && "rounded-lg border border-border",
    className,
  );

  const headerRow = cn("flex-row bg-muted", HEADER_PAD[density]);
  const headerCell = "flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground";

  const dataRow = (index: number) =>
    cn(
      "flex-row items-center border-b border-border",
      striped && index % 2 === 1 && "bg-muted/30",
    );

  return (
    <View className={wrap}>
      <View className={headerRow}>
        {selectable ? <View className={cn(SELECT_COL, "flex-none")} /> : null}
        {columns.map((label, i) => (
          <Text key={`h-${i}`} className={headerCell}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, r) => {
        const cells = (
          <>
            {selectable ? (
              <View className={cn(SELECT_COL, "flex-none", CELL_PAD[density])}>
                <Checkbox />
              </View>
            ) : null}
            {columns.map((_col, c) => (
              <View key={`c-${r}-${c}`} className={cn("flex-1", CELL_PAD[density])}>
                <Text className="text-sm text-foreground">{cellOf(row, c)}</Text>
              </View>
            ))}
          </>
        );
        return onRowPress ? (
          <Pressable key={`r-${r}`} className={cn(dataRow(r), "active:bg-accent")} onPress={() => onRowPress(row, r)}>
            {cells}
          </Pressable>
        ) : (
          <View key={`r-${r}`} className={dataRow(r)}>{cells}</View>
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
