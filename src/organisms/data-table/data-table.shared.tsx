import { Fragment, type ComponentType, type ReactNode, useMemo, useState } from "react";
import { FlatList, StyleSheet, ScrollView, type ViewProps, type ViewStyle as RNViewStyle } from "react-native";
import { View, Pressable, Text, useTheme, useControllableState, devWarn, breakpoints, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type CheckboxProps } from "../../atoms/checkbox/checkbox.shared.js";
import { type PaginationProps } from "../../atoms/pagination/pagination.shared.js";
import { type SkeletonProps } from "../../atoms/skeleton/skeleton.shared.js";
import { Icon } from "../../atoms/icon/icon.js";
import {
  type Density,
  type DataTableSkin,
} from "./data-table.styles.js";

// Compact-width pan sizing: each column keeps a readable minimum and the
// selection column its checkbox share, so the scroller's content width is
// columns * minimum (+ selector) rather than a crushed fit.
const MIN_COLUMN_WIDTH = 110;
const SELECT_COLUMN_WIDTH = 48;
const s = StyleSheet.create({
  panContent: { flexGrow: 1 },
  panInner: { flexGrow: 1 },
});

// Shared DataTable shell. The data table lays a grid out as flex rows of
// equal-width flex-1 cells (RN has no CSS table primitive; tables are flex
// rows/columns). A header row carries the column labels on a tinted surface, and
// the data rows sit beneath it separated by hairlines.
//
// The structure, the boolean-prop API, the data-shape types, the cell-coercion
// logic, the column model (alignment / fixed widths), sorting, row selection,
// pagination, the loading and empty states, the striped tint placement, the
// pressable-row behavior, and accessibility all live here once. A platform file
// supplies only its skin (row rhythm/density padding, header label
// type/tracking, hairline, stripe fill, outer radius, and the press-feedback
// mode) plus the platform variants of the kit parts the table composes (the
// selection Checkbox, the footer Pagination, the loading Skeleton), and calls
// createDataTable.
//
// DataTable is a "Light" platform treatment: one structure with small per-OS
// touches (row height/density, header type/tracking, divider/hairline, striped
// fill, M3 vs iOS row rhythm). It is a CONTENT-LAYER surface, so it stays SOLID
// on every platform (it never goes glass).

export type { Density };

/**
 * A column descriptor. Plain strings stay supported (a string is shorthand for
 * `{ label }`); the object form unlocks per-column alignment, fixed widths, and
 * sorting.
 */
export interface DataTableColumn {
  /** Column header label. */
  label: string;
  /** Stable identity used by `sort.column`; defaults to the label. */
  key?: string;
  /** Right-align the header and cells (amounts, counts, measurements). */
  numeric?: boolean;
  /** Center the header and cells (short status/flag columns). */
  centered?: boolean;
  /** Fixed width in px instead of the equal flex share. */
  width?: number;
  /**
   * Opt this column into header-press sorting. Unnecessary when the table-level
   * `sortable` is set (there it opts back OUT via `sortable: false`).
   */
  sortable?: boolean;
  /**
   * Derive the comparable value for sorting when this column's cells are custom
   * ReactNodes (a Badge, a link). String/number cells sort out of the box;
   * without this, custom-node cells sort last.
   */
  sortValue?: (cell: ReactNode, row: ReactNode[], rowIndex: number) => string | number | null | undefined;
}

/** The active sort: which column (by `key`, or label) and which direction. */
export interface DataTableSort {
  /** The sorted column's `key` (the label when no key was given). */
  column: string;
  /** Descending when true; ascending otherwise. */
  descending?: boolean;
}

export interface DataTableProps {
  /**
   * Columns: a header label per column, or a `DataTableColumn` descriptor for
   * per-column alignment (`numeric`/`centered`), a fixed `width`, and sorting
   * (`sortable`, `sortValue`). Strings and descriptors mix freely.
   */
  columns: Array<string | DataTableColumn>;
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
  /** Looser vertical padding on header and data cells. */
  comfortable?: boolean;
  /**
   * Make every column sortable: pressing a header cycles ascending, descending,
   * off. A column descriptor opts back out with `sortable: false`. Sorting is
   * self-managed out of the box; control it via `sort`/`onSortChange`.
   */
  sortable?: boolean;
  /** Controlled sort state (`null` = unsorted). Omit for uncontrolled use. */
  sort?: DataTableSort | null;
  /** Initial sort for uncontrolled use. */
  defaultSort?: DataTableSort | null;
  /** Fired with the next sort (or `null` when cleared) on header press. */
  onSortChange?: (sort: DataTableSort | null) => void;
  /**
   * Row selection: a leading checkbox column with a select-all header checkbox
   * (indeterminate on a partial selection). Selection is keyed by `rowKey` (the
   * row's original index when omitted) and self-managed out of the box; control
   * it via `selectedKeys`/`onSelectionChange`. When no `onRowPress` is set,
   * pressing anywhere on a row toggles it.
   */
  selectable?: boolean;
  /** Controlled selected row keys. Omit for uncontrolled use. */
  selectedKeys?: Array<string | number>;
  /** Initial selected row keys for uncontrolled use. */
  defaultSelectedKeys?: Array<string | number>;
  /** Fired with the next selected keys when a row or the select-all is toggled. */
  onSelectionChange?: (keys: Array<string | number>) => void;
  /**
   * Page the rows through a built-in footer (the kit Pagination): a
   * "Showing X-Y of N" range with Prev/Next, plus the selection count when
   * `selectable`. Sorting applies before paging. Self-managed out of the box;
   * control the page via `page`/`onPageChange`.
   */
  paginated?: boolean;
  /** Rows per page (CONTROLLED; default 10, or the first of `pageSizes`). */
  pageSize?: number;
  /** Initial rows per page for uncontrolled use. */
  defaultPageSize?: number;
  /**
   * Selectable rows-per-page values. Supplying them upgrades the footer to the
   * Pagination `withSize` variant (a "Rows per page" selector).
   */
  pageSizes?: number[];
  /** Fired with the next rows-per-page value when the footer selector changes it. */
  onPageSizeChange?: (size: number) => void;
  /** Current page, 1-based (CONTROLLED). Omit for uncontrolled use. */
  page?: number;
  /** Initial page for uncontrolled use. */
  defaultPage?: number;
  /** Fired with the next 1-based page when the footer pagination navigates. */
  onPageChange?: (page: number) => void;
  /**
   * Loading state: the body renders pulsing skeleton placeholder rows (one per
   * would-be row on the page) instead of data.
   */
  loading?: boolean;
  /**
   * What to render, centered under the header, when `rows` is empty (and not
   * `loading`). A string gets the muted caption type; any ReactNode renders as
   * given (an `EmptyState`, a retry Button). Omitted = just the header row, as
   * before.
   */
  emptyMessage?: ReactNode;
  /** When set, each data row is pressable, reporting the row data and its index in `rows`. */
  onRowPress?: (row: ReactNode[], index: number) => void;
  /**
   * Render the data rows through a windowed `FlatList` instead of mounting every
   * row up front, for large tables. The header row stays fixed above it. Give the
   * table a bounded height (via `style`, e.g. `{ maxHeight: 400 }`) so the body can
   * scroll; without one it warns and renders eagerly. Default mounts all rows.
   */
  virtualized?: boolean;
  /**
   * Stable key for a row, derived from the row data and its index in `rows`.
   * Selection is keyed by it, and it keeps React row identity stable when rows
   * reorder (sorting, live data) and a cell is a stateful custom ReactNode. When
   * omitted, rows key off their original array index (safe for string/number
   * cells and stateless custom cells; selection then tracks row POSITIONS, so
   * supply a real key when the data itself can be reordered, inserted, or
   * deleted).
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
  if (p.comfortable) return "comfortable";
  return "regular";
}

// A normalized column: the object form with the key resolved.
type NormalColumn = DataTableColumn & { key: string };

function normalizeColumns(columns: Array<string | DataTableColumn>): NormalColumn[] {
  return columns.map((c) => (typeof c === "string" ? { label: c, key: c } : { ...c, key: c.key ?? c.label }));
}

// The header cell box: the equal flex share, the label+sort-icon row, and the
// px-16 horizontal padding (the skins' headerCell is type-only). Alignment and
// fixed widths are layered on per column.
const HEADER_CELL_BOX: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 16,
};

// The centered spanning area for the built-in empty message.
const EMPTY_WRAP: ViewStyle = { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 };

// The pagination footer bar: selection count leading, pagination trailing. No
// top hairline: every skin already draws a hairline under the last data row.
const FOOTER_BAR: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  paddingHorizontal: 16,
  paddingVertical: 8,
};

// Fixed-width column override (replaces the equal flex share).
function widthStyle(col: NormalColumn): ViewStyle | null {
  return col.width != null ? { width: col.width, flexGrow: 0, flexShrink: 0, flexBasis: "auto" } : null;
}

// Skeleton line widths cycle so placeholder rows read organic, not gridded.
const SKELETON_WIDTHS = ["70%", "50%", "80%", "60%"] as const;

// Numeric-aware, locale-aware cell comparison ("9" sorts before "10").
function compareCells(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

// The parts a platform file supplies alongside its skin: the platform variants
// of the kit components the table composes, so each OS renders its native-feeling
// checkbox, pagination, and skeleton.
export interface DataTableParts {
  Checkbox: ComponentType<CheckboxProps>;
  Pagination: ComponentType<PaginationProps>;
  Skeleton: ComponentType<SkeletonProps>;
}

/** Build a DataTable component from a platform skin plus its platform parts. */
export function createDataTable(skin: DataTableSkin, parts: DataTableParts) {
  const { Checkbox, Pagination, Skeleton } = parts;
  return function DataTable(props: DataTableProps) {
    const { columns, rows, striped, bordered, selectable, onRowPress, rowKey, virtualized, loading, emptyMessage, paginated, testID, style } = props;
    const density = densityOf(props);
    const { tokens } = useTheme();

    const cols = useMemo(() => normalizeColumns(columns), [columns]);

    // Measure the table's OWN width so the compact-width collapse tracks the
    // container, not the window: the docs 3-up and a real iPhone both render the
    // table narrower than a desktop window would report, so useWindowDimensions
    // cannot see the narrow column.
    const [measuredWidth, setMeasuredWidth] = useState(0);
    // SwiftUI Table collapses to its PRIMARY (first) column in compact width on
    // iPhone; the iOS skin opts in. Every other platform renders all columns.
    const collapsed =
      !!skin.collapsesToPrimaryColumn && measuredWidth > 0 && measuredWidth < breakpoints.sm;
    const visibleColumns = collapsed ? cols.slice(0, 1) : cols;
    // Where the table does NOT collapse (web, Android), a compact container must
    // not crush the flex-1 cells into letter-wrapped slivers: below the sm width
    // the header+body pan together inside a horizontal scroller, each column
    // keeping a readable minimum (the Material phone data-table treatment).
    const pans = !collapsed && !skin.collapsesToPrimaryColumn && cols.length > 1 && measuredWidth > 0 && measuredWidth < breakpoints.sm;
    const panMinWidth =
      cols.reduce((w, col) => w + (col.width ?? MIN_COLUMN_WIDTH), 0) + (selectable ? SELECT_COLUMN_WIDTH : 0);

    // ---- sorting -----------------------------------------------------------
    // Self-managed by default (header press cycles asc -> desc -> off);
    // controlled via `sort`/`onSortChange`.
    const [sortState, setSortState] = useControllableState<DataTableSort | null>(
      props.sort,
      props.defaultSort ?? null,
      props.onSortChange,
    );
    const sortableAt = (col: NormalColumn) => (props.sortable ? col.sortable !== false : !!col.sortable);
    const activeCol = sortState ? cols.find((c) => c.key === sortState.column) : undefined;
    devWarn(
      !!sortState && !activeCol,
      `[canvas] <DataTable> sort.column "${sortState?.column}" matches no column key; rendering unsorted.`,
    );

    const cycleSort = (col: NormalColumn) => {
      const active = activeCol?.key === col.key;
      if (!active) setSortState({ column: col.key });
      else if (!sortState?.descending) setSortState({ column: col.key, descending: true });
      else setSortState(null);
    };

    // The view pipeline: original row indices, sorted, then paged. Everything
    // downstream (keys, selection, onRowPress) reports ORIGINAL `rows` indices,
    // so a consumer's handlers are stable under sorting and paging.
    let viewIndices = rows.map((_, i) => i);
    if (activeCol) {
      const ci = cols.indexOf(activeCol);
      const dir = sortState?.descending ? -1 : 1;
      let sawOpaque = false;
      const values = rows.map((row, i) => {
        const cell = row[ci];
        if (activeCol.sortValue) return activeCol.sortValue(cell, row, i) ?? null;
        if (typeof cell === "string" || typeof cell === "number") return cell;
        if (cell != null) sawOpaque = true;
        return null;
      });
      // Nulls (opaque custom cells without a sortValue) always sort last.
      viewIndices = viewIndices.slice().sort((a, b) => {
        const va = values[a];
        const vb = values[b];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        return dir * compareCells(va, vb);
      });
      devWarn(
        sawOpaque,
        `[canvas] <DataTable> column "${activeCol.key}" has custom ReactNode cells and no sortValue; those rows sort last.`,
      );
    }

    // ---- selection ---------------------------------------------------------
    // Keyed by `rowKey` (original index fallback); compared as strings so a
    // numeric key and its string form never split.
    const rawKey = (row: ReactNode[], i: number): string | number => (rowKey ? rowKey(row, i) : i);
    const keyOf = (row: ReactNode[], i: number) => String(rawKey(row, i));
    const [selected, setSelected] = useControllableState<Array<string | number>>(
      props.selectedKeys,
      props.defaultSelectedKeys ?? [],
      props.onSelectionChange,
    );
    const selectedSet = useMemo(() => new Set(selected.map(String)), [selected]);
    const allSelected = rows.length > 0 && rows.every((row, i) => selectedSet.has(keyOf(row, i)));
    const someSelected = rows.some((row, i) => selectedSet.has(keyOf(row, i)));

    const toggleAll = () => {
      setSelected(allSelected ? [] : rows.map((row, i) => rawKey(row, i)));
    };
    const toggleRow = (row: ReactNode[], i: number) => {
      const key = rawKey(row, i);
      const has = selectedSet.has(String(key));
      setSelected(has ? selected.filter((k) => String(k) !== String(key)) : [...selected, key]);
    };

    // ---- pagination --------------------------------------------------------
    const sizes = props.pageSizes;
    const [pageSize, setPageSize] = useControllableState<number>(
      props.pageSize,
      props.defaultPageSize ?? sizes?.[0] ?? 10,
      props.onPageSizeChange,
    );
    const pageCount = Math.max(1, Math.ceil(rows.length / Math.max(1, pageSize)));
    const [page, setPage] = useControllableState<number>(props.page, props.defaultPage ?? 1, props.onPageChange);
    const current = Math.min(Math.max(1, page), pageCount);
    const pageIndices = paginated ? viewIndices.slice((current - 1) * pageSize, current * pageSize) : viewIndices;
    // Original row index -> rendered position, for stable striping under sort/paging.
    const viewPos = new Map(pageIndices.map((idx, pos) => [idx, pos]));

    const wrap: StyleProp<ViewStyle> = [
      skin.wrap,
      // RN has no ring; a rounded 1px border is the bordered outline.
      bordered ? skin.borderedOutline(tokens) : null,
      style,
    ];

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // A windowed body needs a bounded height to scroll (and to window). Warn once if
    // `virtualized` is set without one; the FlatList would otherwise render every row.
    const flat = (StyleSheet.flatten(style) ?? {}) as RNViewStyle;
    const bounded = flat.height != null || flat.maxHeight != null || flat.flex != null || flat.flexBasis != null;
    devWarn(
      !!virtualized && !bounded,
      "[canvas] <DataTable virtualized>: give the table a bounded height (e.g. style={{ maxHeight: 400 }}) so the body can window and scroll; rendering eagerly for now.",
    );

    // The data rows: skeleton placeholders while loading; a windowed FlatList
    // when asked (and bounded); else every row of the page mounted (the
    // default). The header row above stays fixed either way.
    const body = loading ? (
      Array.from({ length: paginated ? Math.min(pageSize, 10) : 5 }, (_, r) => (
        <View key={`sk-${r}`} style={skin.dataRow(tokens)} role="row">
          {selectable ? <View style={[skin.selectCell, skin.cellPad[density]]} role="cell" /> : null}
          {visibleColumns.map((col, c) => (
            <View key={`skc-${c}`} style={[skin.dataCell, skin.cellPad[density], widthStyle(col)]} role="cell">
              <Skeleton text small animate style={{ width: SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length] }} />
            </View>
          ))}
          {skin.separator ? <View style={[skin.separator(tokens), { pointerEvents: "none" }]} /> : null}
        </View>
      ))
    ) : virtualized && bounded ? (
      <FlatList
        data={pageIndices}
        renderItem={({ item }) => renderDataRow(rows[item]!, item)}
        keyExtractor={(item) => keyOf(rows[item]!, item)}
        extraData={[selected, sortState, density, striped]}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      pageIndices.map((i) => <Fragment key={keyOf(rows[i]!, i)}>{renderDataRow(rows[i]!, i)}</Fragment>)
    );

    const table = (
      <>
        <View style={[skin.headerRow(tokens), skin.headerPad[density]]} role="row">
          {selectable ? (
            <View style={skin.selectCol} role="columnheader">
              <Checkbox
                small
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
                disabled={rows.length === 0 || loading}
                accessibilityLabel="Select all rows"
              />
            </View>
          ) : null}
          {visibleColumns.map((col) => renderHeaderCell(col))}
        </View>
        {body}
        {!loading && rows.length === 0 && emptyMessage != null ? (
          <View style={EMPTY_WRAP}>
            {typeof emptyMessage === "string" ? (
              <Text style={skin.captionText(tokens)}>{emptyMessage}</Text>
            ) : (
              emptyMessage
            )}
          </View>
        ) : null}
      </>
    );

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
        {pans ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.panContent}>
            <View style={[s.panInner, { minWidth: panMinWidth }]}>{table}</View>
          </ScrollView>
        ) : (
          table
        )}
        {paginated ? (
          <View style={FOOTER_BAR}>
            {selectable ? (
              <Text style={skin.captionText(tokens)}>{`${selected.length} of ${rows.length} selected`}</Text>
            ) : (
              <View />
            )}
            <Pagination
              small
              compact={sizes == null ? true : undefined}
              withSize={sizes != null ? true : undefined}
              page={current}
              total={pageCount}
              onChange={setPage}
              itemCount={rows.length}
              pageSize={pageSize}
              pageSizes={sizes}
              onPageSizeChange={setPageSize}
              disabled={loading}
            />
          </View>
        ) : null}
      </View>
    );

    // A header cell: a plain labeled box, or (sortable) a pressable label +
    // direction indicator cycling ascending -> descending -> off.
    function renderHeaderCell(col: NormalColumn) {
      const align: ViewStyle | null = col.numeric
        ? { justifyContent: "flex-end" }
        : col.centered
          ? { justifyContent: "center" }
          : null;
      const label = (
        <Text
          style={[
            skin.headerCell(tokens),
            { flexShrink: 1 },
            col.numeric ? { textAlign: "right" } : col.centered ? { textAlign: "center" } : null,
          ]}
        >
          {col.label}
        </Text>
      );
      if (!sortableAt(col)) {
        return (
          <View key={`h-${col.key}`} style={[HEADER_CELL_BOX, align, widthStyle(col)]} role="columnheader">
            {label}
          </View>
        );
      }
      const active = activeCol?.key === col.key;
      const descending = active && !!sortState?.descending;
      // aria-sort reaches the web DOM (RNW forwards aria-*); native screen
      // readers get the state folded into the accessible name instead.
      const sortA11y = {
        "aria-sort": active ? (descending ? "descending" : "ascending") : "none",
      } as unknown as ViewProps;
      return (
        <Pressable
          key={`h-${col.key}`}
          onPress={() => cycleSort(col)}
          android_ripple={ripple}
          role="columnheader"
          accessibilityLabel={
            active ? `${col.label}, sorted ${descending ? "descending" : "ascending"}` : `${col.label}, sortable`
          }
          {...sortA11y}
          style={({ pressed }) => [
            HEADER_CELL_BOX,
            align,
            widthStyle(col),
            // Android ripples; iOS/web dim the pressed header label.
            skin.ripple == null && pressed ? { opacity: 0.6 } : null,
          ]}
        >
          {label}
          {active ? (
            descending ? (
              <Icon chevronDown muted size={skin.sortIconSize} decorative />
            ) : (
              <Icon chevronUp muted size={skin.sortIconSize} decorative />
            )
          ) : (
            <Icon chevronsUpDown muted size={skin.sortIconSize} decorative />
          )}
        </Pressable>
      );
    }

    // A keyless data row (the key is supplied by the eager map / FlatList keyExtractor).
    function renderDataRow(row: ReactNode[], r: number) {
      const rowId = keyOf(row, r);
      const isSelected = selectable && selectedSet.has(rowId);
      const cells = (
        <>
          {selectable ? (
            <View style={[skin.selectCell, skin.cellPad[density]]} role="cell">
              {/* The row selector: its own Pressable, so a tap on the box toggles
                  selection while a tap elsewhere on the row still reaches the
                  row's press behavior (the responder system grants the innermost
                  pressable the touch). */}
              <Checkbox
                small
                checked={!!isSelected}
                onChange={() => toggleRow(row, r)}
                accessibilityLabel={rowLabel(row) || `Select row ${r + 1}`}
              />
            </View>
          ) : null}
          {visibleColumns.map((col) => {
            const c = cols.indexOf(col);
            const cell = cellOf(row, c);
            return (
              <View
                key={`c-${rowId}-${c}`}
                style={[
                  skin.dataCell,
                  skin.cellPad[density],
                  widthStyle(col),
                  col.numeric ? { alignItems: "flex-end" } : col.centered ? { alignItems: "center" } : null,
                ]}
                role="cell"
              >
                {typeof cell === "string" || typeof cell === "number" ? (
                  <Text
                    style={[
                      skin.cellText(tokens),
                      col.numeric ? { textAlign: "right" } : col.centered ? { textAlign: "center" } : null,
                    ]}
                  >
                    {cell}
                  </Text>
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
      // The striped tint sits on odd VIEW positions (the rendered order) so the
      // banding survives sorting and paging; a selected row's stronger tint (the
      // skin's press fill: M3's primary state layer on Android, the system fill
      // on iOS, accent on web) wins over it.
      const stripe = striped && (viewPos.get(r) ?? 0) % 2 === 1 ? skin.stripeTint(tokens) : null;
      const selectedTint = isSelected ? skin.pressTint(tokens) : null;
      // Row press: an explicit action when given; otherwise a selectable row
      // toggles itself (the checkbox alone carries the a11y semantics there, so
      // the convenience Pressable stays out of the accessibility tree).
      const press = onRowPress ?? (selectable ? toggleRow : undefined);
      return press ? (
        <Pressable
          onPress={() => press(row, r)}
          android_ripple={ripple}
          role={onRowPress ? "button" : undefined}
          accessible={onRowPress ? undefined : false}
          focusable={onRowPress ? undefined : false}
          // Announce the actionable row's content: read off the plain
          // string/number cells (custom ReactNode cells carry their own
          // labels, so they are skipped here).
          accessibilityLabel={onRowPress ? rowLabel(row) : undefined}
          style={({ pressed }) => [
            skin.dataRow(tokens),
            // Hold the platform minimum tap target (iOS 44pt / M3 48dp) so a
            // compact pressable row is not sub-minimum; web omits it.
            skin.pressableMinHeight != null ? { minHeight: skin.pressableMinHeight } : null,
            stripe,
            selectedTint,
            // Android ripples; iOS/web tint the row fill on press.
            skin.ripple == null && pressed ? skin.pressTint(tokens) : null,
          ]}
        >
          {cells}
        </Pressable>
      ) : (
        <View style={[skin.dataRow(tokens), stripe, selectedTint]} role="row">
          {cells}
        </View>
      );
    }
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
