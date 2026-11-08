# DataTable

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/organisms/data-table/data-table.md`
Human reference: https://canvas.nannier.com/components/data-table

## Public imports

```tsx
import { DataTable } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A data table rendered from column and row data, with sorting, row selection,
pagination, and the loading and empty states built in.

Columns are plain header labels or descriptors (`{ label, numeric, width,
sortable, ... }`) for per-column alignment, fixed widths, and sorting; compose a
toolbar above when the screen needs one. Density tweaks affect padding live.
Pass `onRowEdit` / `onRowDelete` for a trailing actions column: the pencil opens
the row's string cells as fields with Save/Cancel (committing via
`onRowCommit`), and Delete asks for a confirming second press before it fires.
`inlineEdit` skips the pencil and lets a string cell be pressed straight into a
field, committing via `onCellCommit`. `onRowPress` makes the whole row act on
press and puts the keyboard and screen-reader path on a button in the row's
first column, so keep your own controls out of that column when you use it. Data
stays yours either way: the table reports intent and re-renders whatever rows it
is handed back.

Treat `rows` and `columns` as immutable inputs. When editing data, replace the outer `rows` array and each changed row, as the examples below do. When changing a column, replace its descriptor and the `columns` array. Keep unchanged arrays and callbacks stable for large tables: Canvas caches sorting, paging, and selection summaries so typing a draft or opening a row action does not process the whole data set again. `sortValue` and `rowKey` must be pure functions of their inputs. If either closes over changing external data, supply a new callback identity; for `sortValue`, also replace its column descriptor and the `columns` array. A saved edit appears in sorted order when the updated `rows` arrive.

On narrow web and Android layouts, the columns still share the table width and
wrap their text, each keeping a 110 px minimum (a column with a fixed `width`
keeps that width), and they pan horizontally only when those minimums exceed
the table width. A long cell wraps inside its column rather than widening the
table. The overflowing scrollport is a keyboard tab stop, so the
platform's arrow keys can reveal the remaining columns, and while it has keyboard
focus the table's surface draws the theme's focus ring. A table that fits adds
no scrolling tab stop, and on Android it takes no sideways drag either, so a tap
that drifts sideways still presses its row and a swipe that starts across it
scrolls the page (while TalkBack explores by touch the scroller stays enabled, so
the exploring finger reaches every cell). On an iPhone-width table iOS shows only
the first column instead, as SwiftUI Table does. A table that passes `stacks`
does neither: at that width each row stacks its cells (see Stacked below).
On the web and Android, and for a table that stacks on any platform, crossing
that width changes the layout only: rows, custom cells, an open editor with its
text and focus, and a windowed body's scroll position stay as they are when a
window is resized across it or a phone measures the table on its first frame.
The iOS first-column layout is the exception: below that width the columns
after the first leave the table, with any editor or custom cell in them, and
mount again when it widens.

A `virtualized` table's body scrolls its rows under the fixed header. On the
web, while those rows overflow, the body is a keyboard tab stop of its own
(after the column scroller when a narrow table pans, and before the rows'
controls when they have any), the keyboard can scroll it, and while it has
keyboard focus the table's surface draws the same focus ring. The body is the
table's row group, so the rows it renders stay inside the table for a screen
reader rather than behind an unnamed focusable node.

## Usage

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"]
  ]}
/>
```

## Variants

### Bordered

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"]
  ]}
  bordered
/>
```

### Attached

A standalone table frames itself: a hairline at the table corner over the card fill, its header band on the raised fill under it. `bordered` draws that frame on the firmer field boundary. A table that sits flush inside a frame its parent draws (a `flush` Card, a bordered panel that clips to its corners) passes `attached`, so it draws no frame of its own and the parent's is the only one. An attached table draws its keyboard focus ring just inside its edge, where the parent's clip cannot cut it.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <DataTable
    attached
    columns={["Name", "Email", "Role"]}
    rows={[
      ["Alice Johnson", "alice@example.com", "Admin"],
      ["Bob Smith", "bob@example.com", "Editor"],
      ["Rachel Chen", "rachel@example.com", "Admin"]
    ]}
  />
</Card>
```

### Striped

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"],
    ["Dan Wright", "dan@example.com", "Viewer"]
  ]}
  striped
/>
```

### Compact

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"]
  ]}
  compact
/>
```

### Comfortable

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"]
  ]}
  comfortable
/>
```

### Loading

```tsx
<DataTable
  columns={["Name", "Email", "Status"]}
  rows={[]}
  loading
/>
```

### Empty

```tsx
<DataTable
  columns={["Name", "Email", "Status"]}
  rows={[]}
  emptyMessage="No results found."
/>
```

### Sortable

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Rachel Chen", "rachel@example.com", "Admin"],
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"]
  ]}
  sortable
  defaultSort={{ column: "Name" }}
/>
```

### Selectable

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Bob Smith", "bob@example.com", "Editor"],
    ["Rachel Chen", "rachel@example.com", "Admin"]
  ]}
  selectable
  defaultSelectedKeys={[1]}
/>
```

### Paginated

```tsx
<DataTable
  columns={["Employee", "Team"]}
  rows={Array.from({ length: 23 }, (_, i) => [
    `Employee ${i + 1}`,
    ["Design", "Platform", "Growth"][i % 3]
  ])}
  paginated
  pageSize={5}
/>
```

### Numeric and custom columns

```tsx
<DataTable
  columns={[
    "Invoice",
    { label: "Status", centered: true, width: 120 },
    { label: "Amount", numeric: true }
  ]}
  rows={[
    ["INV-0041", <Badge success>Paid</Badge>, "$1,250.00"],
    ["INV-0042", <Badge warning>Due</Badge>, "$450.00"],
    ["INV-0043", <Badge neutral>Draft</Badge>, "$8,120.00"]
  ]}
/>
```

### Column weights

A column without a fixed `width` takes an equal share of what the fixed columns leave; `grow` weights that share (`grow: 2` takes twice a `grow: 1` column's) and `minWidth` floors the column's box, as a grid's `minmax(150px, 2fr)` track does. Weights, floors and fixed widths mix freely. Once the declared floors add up to more than the table's width, the table pans horizontally at any width rather than crushing them.

```tsx
<DataTable
  columns={[
    { label: "Prop", minWidth: 150 },
    { label: "Type", grow: 1.2, minWidth: 150 },
    { label: "Default", width: 100 },
    { label: "Description", grow: 2.2, minWidth: 220 }
  ]}
  rows={[
    ["primary", "boolean", "false", "The filled accent button, for the one main action on a surface."],
    ["small", "boolean", "false", "The 32 px control height."],
    ["loading", "boolean", "false", "Shows a spinner in place of the label and blocks presses."]
  ]}
/>
```

### Grouped rows

Pass `groups` in place of `rows` to title runs of rows: each group draws a band spanning every column (its `label`, an optional `adornment` node and an optional `count`, on the sunken fill) above its own rows. Sorting reorders rows within their group, paging draws the band of every group a page shows, and row indices count through the groups in order.

```tsx
<DataTable
  columns={["Prop", "Type", "Default"]}
  groups={[
    {
      label: "Intent",
      adornment: <Badge soft small>pick one</Badge>,
      count: 3,
      rows: [
        ["primary", "boolean", "false"],
        ["destructive", "boolean", "false"],
        ["ghost", "boolean", "false"]
      ]
    },
    {
      label: "State",
      count: 2,
      rows: [
        ["loading", "boolean", "false"],
        ["disabled", "boolean", "false"]
      ]
    }
  ]}
/>
```

### Reference sheet

Pass `reference` for the reference sheet, a component page's props table: the column headings as the page's small uppercase mono label (PROP, TYPE, DEFAULT and DESCRIPTION) on a header row with no fill of its own, 12 px above and below whatever the density; rows 10 px above and below with a rule above each; the columns 16 px apart and 16 px in from the frame's sides; and the frame at the panel corner on the `border` hairline over the card fill. `bordered` only firms the hairline, and `attached` still drops the frame. Pair it with `alignTop` when a cell wraps.
On iOS the table keeps its own look and the prop changes nothing.

```tsx
<DataTable
  reference
  columns={["Prop", "Type", "Default"]}
  rows={[
    ["primary", "boolean", "false"],
    ["small", "boolean", "false"],
    ["loading", "boolean", "false"]
  ]}
/>
```

### Bare table

Pass `bare` for the hairline table with no frame and no fill: the headings in the reference sheet's small uppercase mono label over a `field-border` rule 10 px below them, a `border` rule under every row, the first column flush with the table's start, each cell keeping 12 px clear at its end inside its column's width (so a fixed `width` is the whole column), and 12 px above and below whatever the density. `reference` wins when both are passed.
On iOS the table keeps its own look and the prop changes nothing.

```tsx
<DataTable
  bare
  alignTop
  columns={["Family", "Height", "Floor"]}
  rows={[
    ["Controls", "32 · 40 · 48", "—"],
    ["Fields", "40", "—"],
    ["Data", "hug · scrolls", "320"]
  ]}
/>
```

### Matrix

Pass `matrix` for a specimen grid: no frame, no fill and no rules, the headings in the reference sheet's small uppercase mono label, the cells unpadded, the rows 12 px apart and the columns 20 px apart. A column with `fit` takes its widest cell's width, its heading included (a grid's `max-content` track), so a column of buttons lines up at its longest label; a table with `fit` columns pans once they add up to more than it has. `reference` and `bare` win over `matrix`.
On iOS the table keeps its own look and the prop changes nothing.

```tsx
<DataTable
  matrix
  columns={[{ label: "", width: 110 }, { label: "Default", fit: true }, { label: "Disabled", fit: true }]}
  rows={[
    ["primary", <Button primary>Save changes</Button>, <Button primary disabled>Save changes</Button>],
    ["outline", <Button outline>Preview</Button>, <Button outline disabled>Preview</Button>]
  ]}
/>
```

### Top-aligned cells

Pass `alignTop` when a cell may wrap to several lines: every cell sits at the top of its row, so a row's name, type and default stay beside the first line of its description instead of drifting to the row's middle. The selection box and the row actions center on that first line, as they do in a stacked row.

```tsx
<DataTable
  alignTop
  columns={[
    { label: "Prop", minWidth: 150 },
    { label: "Type", grow: 1.2, minWidth: 150 },
    { label: "Description", grow: 2.2, minWidth: 220 }
  ]}
  rows={[
    ["iconLeft", "ReactNode", "An icon before the label. It takes the label's ink and size, and the button keeps its height, so a leading icon never grows a row of buttons."],
    ["href", "string", "Renders the button as a link to this address on the web, and opens it natively elsewhere."]
  ]}
/>
```

### Footer row

Pass `footer` to draw a row inside the table's frame under the last row, and under the pagination bar when the table is `paginated`: 44 px tall with its content centered, for a "Show all" control or a note. One hairline separates it from what sits above it.

```tsx
<DataTable
  columns={["Prop", "Type", "Default"]}
  rows={[
    ["primary", "boolean", "false"],
    ["small", "boolean", "false"],
    ["loading", "boolean", "false"]
  ]}
  footer={<Button link small>Show all 58 props</Button>}
/>
```

### Sparkline trend column

```tsx
<DataTable
  columns={["Page", "7D", "Visits"]}
  rows={[
    ["/pricing", <Sparkline values={[52, 60, 55, 71, 68, 84, 96]} />, "12,480"],
    ["/docs", <Sparkline values={[88, 74, 70, 66, 58, 49, 41]} />, "8,102"],
    ["/blog", <Sparkline values={[34, 42, 39, 51, 60, 66, 78]} />, "5,914"]
  ]}
/>
```

### Avatar identity cells

```tsx
<DataTable
  columns={["Member", "Role"]}
  rows={[
    [<MediaObject compact avatar="AJ" title="Alice Johnson" />, "Admin"],
    [<MediaObject compact avatar="BS" title="Bob Smith" />, "Editor"],
    [<MediaObject compact avatar="RC" title="Rachel Chen" />, "Admin"]
  ]}
/>
```

### Row actions

```tsx
<Stateful initial={[
  ["Alice Johnson", "alice@example.com", "Admin"],
  ["Bob Smith", "bob@example.com", "Editor"],
  ["Rachel Chen", "rachel@example.com", "Viewer"]
]}>
  {(rows, setRows) => (
    <DataTable
      columns={["Name", "Email", "Role"]}
      rows={rows}
      onRowEdit={() => {}}
      onRowCommit={(i, cells) => setRows(rows.map((row, r) => (r === i ? cells.map(String) : row)))}
      onRowDelete={(i) => setRows(rows.filter((_row, r) => r !== i))}
    />
  )}
</Stateful>
```

### Inline editing

```tsx
<Stateful initial={[
  ["/pricing", "12,480"],
  ["/docs", "8,102"],
  ["/blog", "5,914"]
]}>
  {(rows, setRows) => (
    <DataTable
      columns={["Page", "Visits"]}
      rows={rows}
      inlineEdit
      onCellCommit={(i, c, next) =>
        setRows(rows.map((row, r) => (r === i ? row.map((cell, ci) => (ci === c ? next : cell)) : row)))
      }
    />
  )}
</Stateful>
```

### Stacked

Pass `stacks` when the cells carry long text. When the table's own container is at or below `stackBreakpoint` (default `sm`, 640), each row lays its cells out top to bottom at the full width: the first cell leads as the row's title and every later cell sits under its column label, so a paragraph reads at the table's width instead of a column's share of it. The header row stays only while it holds a control (a sortable column, as here, or the box that selects every row),
the selection box and row actions keep their places, and on iOS the table stacks instead of collapsing to its first column.
Above the breakpoint it is the ordinary table.

```tsx
<DataTable
  stacks
  sortable
  columns={["Setting", "Default", "Description"]}
  rows={[
    ["Session timeout", "30 minutes", "Signs a member out after this long without activity. Shorter timeouts suit shared devices; longer ones suit a personal laptop."],
    ["Password length", "12 characters", "The shortest password a member can choose. Longer minimums resist guessing, and a passphrase meets them easily."],
    ["Recovery codes", "10 codes", "One-time codes a member can use when their authenticator is unavailable. Each code works once."]
  ]}
/>
```

## Do & Don't

### default

**Do** — Use the built-in paginated footer so the search result is always anchored to the total.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row snug alignCenter between pad>
    <Input small placeholder="Search users..." />
    <Button outline small>Export</Button>
  </Row>
  <Divider />
  <DataTable attached paginated pageSize={3} columns={["Name", "Email"]} rows={[
    ["Alice Johnson", "alice@example.com"],
    ["Bob Smith", "bob@example.com"],
    ["Rachel Chen", "rachel@example.com"],
    ["Dan Wright", "dan@example.com"],
    ["Eve Park", "eve@example.com"]
  ]} />
</Card>
```

**Don't** — Wiring search but dropping the footer leaves the user with no result count or way to page through 142 rows.

```tsx
<View style={{ overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, maxWidth: 520 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderColor: tokens.border, padding: 12 }}>
    <Container xs start><Input small placeholder="Search users..." /></Container>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }} />
    <Button outline small>Export</Button>
  </View>
  <DataTable columns={["Name", "Email"]} rows={[
    ["Alice Johnson", "alice@example.com"],
    ["Bob Smith", "bob@example.com"],
    ["Rachel Chen", "rachel@example.com"]
  ]} />
</View>
```

### bulk

**Do** — Pair the selection with a bulk bar that leads with the non-destructive action and keeps Delete visually distinct.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row snug alignCenter between pad>
    <Typography tiny muted>2 selected</Typography>
    <Row snug alignCenter>
      <Button outline small>Bulk edit</Button>
      <Button destructive small>Delete</Button>
    </Row>
  </Row>
  <Divider />
  <DataTable attached selectable defaultSelectedKeys={[0, 2]} columns={["Name", "Email"]} rows={[
    ["Alice Johnson", "alice@example.com"],
    ["Bob Smith", "bob@example.com"],
    ["Rachel Chen", "rachel@example.com"]
  ]} />
</Card>
```

**Don't** — Surfacing only the destructive Delete on a selection invites accidental data loss with no safer path.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12, maxWidth: 520 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>3 selected</Text>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }} />
  <Button destructive small>Delete</Button>
</View>
```

### filter

**Do** — Echo the live result count next to the filter so its effect is visible.

```tsx
  <Card flat padded>
    <Row snug alignCenter between>
      <Row snug alignCenter>
        <Typography tiny muted>Status:</Typography>
        <Column><Select value="All" options={["All", "Active", "Inactive"]} small /></Column>
      </Row>
      <Typography tiny muted>142 results</Typography>
    </Row>
  </Card>
```

**Don't** — A filter control with no result count leaves the user guessing whether the filter narrowed anything.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12, maxWidth: 520 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Status:</Text>
  <Select value="All" options={["All", "Active", "Inactive"]} small />
</View>
```

### empty

**Do** — Keep the header and let the built-in emptyMessage span a centered row so the structure stays intact.

```tsx
  <DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} emptyMessage="No results found." />
```

**Don't** — Hiding the body entirely on no results collapses the table and looks broken.

```tsx
  <DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} />
```

### loading

**Do** — Use the built-in loading skeletons so the load reads as the table taking shape in place.

```tsx
  <DataTable bordered loading columns={["Name", "Email", "Status"]} rows={[]} />
```

**Don't** — A bare "Loading…" string gives no sense of progress and reads like static content.

```tsx
<View style={{ overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, maxWidth: 520 }}>
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <View style={{ alignItems: "center", paddingHorizontal: 16, paddingVertical: 32 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Loading…</Text>
  </View>
</View>
```

## Supported props

### DataTableProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | (string \| DataTableColumn)[] | yes |  | Columns: a header label per column, or a `DataTableColumn` descriptor for per-column alignment (`numeric`/`centered`), a fixed `width`, and sorting (`sortable`, `sortValue`). Strings and descriptors mix freely. Treat the array and descriptors as immutable: replace both when a column changes. |
| rows | ReactNode[][] \| undefined | no |  | Row data: an array of rows, each an array of cells (one per column). A cell is a string (rendered in the default cell type) or any ReactNode for a custom cell, such as a link, a `Badge`, or a monospace name (rendered directly). Treat this data as immutable: replace the outer array and each changed row when data changes, so cached sorting and pagination update correctly. |
| groups | DataTableGroup[] \| undefined | no |  | Group the rows under titled bands (the props table's "Intent", "Size" and "State" groups): each group draws a band spanning every column, its label, an optional adornment and an optional count on the sunken fill, then its own rows. Given `groups`, the table's rows are the groups' rows in order and `rows` is ignored; every row index a callback reports (`onRowPress`, `onRowEdit`, `rowKey` and the rest) counts through them in that order. Sorting reorders rows within their group and never moves a group; paging pages the rows, and each page draws the band of every group it shows. A group with no rows draws no band. |
| striped | boolean \| undefined | no | false | Tint every other data row for easier horizontal scanning. |
| bordered | boolean \| undefined | no | false | Draw the table's frame on the firmer field boundary rather than the hairline. |
| attached | boolean \| undefined | no | false | The table sits flush inside a frame its parent draws (a `flush` Card, a bordered panel that clips to its corners), so it draws no frame of its own. Without it a standalone table frames itself (on the web and Android, a hairline at the table corner over the card fill), which is the standalone look. |
| stacks | boolean \| undefined | no | false | Responsive: when the table's own CONTAINER is at or below `stackBreakpoint` (default `sm` = 640), each row lays its cells out top to bottom at the full width instead of side by side, so long text reads at the width of the table rather than a column's share of it. The first cell leads the row as its title; every later cell carries its column label above its value. The header row is drawn only while it holds a control (a sortable column, or the box that selects every row), as a band of its labels that wraps; the selection box and the row actions stay at the row's leading and trailing edges. A stacked table never pans, and on iOS it stacks instead of collapsing to its first column. Container-measured with a viewport seed for the first frame, like Row `stacks`; crossing the breakpoint changes the layout only. |
| stackBreakpoint | BreakpointKey \| undefined | no |  | The breakpoint at and below which `stacks` stacks the rows (default `"sm"`). Only meaningful with `stacks` (DEV warns without it). |
| compact | boolean \| undefined | no | false | Tighter vertical padding on header and data cells. |
| comfortable | boolean \| undefined | no | false | Looser vertical padding on header and data cells. |
| reference | boolean \| undefined | no | false | The reference sheet (a component page's props table): the column headings as the page's small uppercase mono label on a header row with no fill of its own, 12 px above and below whatever the density; rows 10 px above and below with a rule above each; the columns 16 px apart and 16 px in from the frame's sides; and the frame at the panel corner on the `border` hairline over the card fill, so `bordered` only firms the hairline and `attached` still drops the frame. On iOS the table keeps its own look and this changes nothing. |
| bare | boolean \| undefined | no | false | The bare hairline table: no frame and no fill, a `field-border` rule under the headings (the reference sheet's mono uppercase label) and a `border` rule under every row, the first column flush with the table's start, each cell keeping 12 px clear at its end inside its column's width, and 12 px above and below whatever the density. `reference` wins over it. On iOS the table keeps its own look and this changes nothing. |
| matrix | boolean \| undefined | no | false | The specimen matrix (a section page's states grid): no frame, no fill and no rules, the headings as the page's small uppercase mono label in the third ink, the cells unpadded, the rows 12 px apart and the columns 20 px apart. Pair it with `fit` columns for the hand-off's content-sized tracks. `reference` and `bare` win over it. On iOS the table keeps its own look and this changes nothing. |
| alignTop | boolean \| undefined | no | false | Align every cell to the top of its row rather than its middle, so a row whose description wraps keeps its name, type and default beside the description's first line. The selection box and the row actions center on that first line, as they do in a stacked row. |
| footer | ReactNode | no |  | A row drawn inside the table's frame under the last row (and under the pagination bar when `paginated`): 44 px tall with its content centered, for a "Show all" control or a note. A hairline separates it from what sits above it: the one the last row draws already, or its own where nothing above it draws one. |
| sortable | boolean \| undefined | no | false | Make every column sortable: pressing a header cycles ascending, descending, off. A column descriptor opts back out with `sortable: false`. Sorting is self-managed out of the box; control it via `sort`/`onSortChange`. |
| sort | DataTableSort \| null \| undefined | no |  | Controlled sort state (`null` = unsorted). Omit for uncontrolled use. |
| defaultSort | DataTableSort \| null \| undefined | no |  | Initial sort for uncontrolled use. |
| onSortChange | ((sort: DataTableSort \| null) => void) \| undefined | no |  | Fired with the next sort (or `null` when cleared) on header press. |
| selectable | boolean \| undefined | no | false | Row selection: a leading checkbox column with a select-all header checkbox (indeterminate on a partial selection). Selection is keyed by `rowKey` (the row's original index when omitted) and self-managed out of the box; control it via `selectedKeys`/`onSelectionChange`. When no `onRowPress` is set, pressing anywhere on a row toggles it. |
| selectedKeys | (string \| number)[] \| undefined | no |  | Controlled selected row keys. Omit for uncontrolled use. |
| defaultSelectedKeys | (string \| number)[] \| undefined | no |  | Initial selected row keys for uncontrolled use. |
| onSelectionChange | ((keys: Array<string \| number>) => void) \| undefined | no |  | Fired with the next selected keys when a row or the select-all is toggled. |
| paginated | boolean \| undefined | no | false | Page the rows through a built-in footer (the kit Pagination): a "Showing X-Y of N" range with Prev/Next, plus the selection count when `selectable`. Sorting applies before paging. Self-managed out of the box; control the page via `page`/`onPageChange`. |
| pageSize | number \| undefined | no |  | Rows per page (CONTROLLED; default 10, or the first of `pageSizes`). |
| defaultPageSize | number \| undefined | no |  | Initial rows per page for uncontrolled use. |
| pageSizes | number[] \| undefined | no |  | Selectable rows-per-page values. Supplying them upgrades the footer to the Pagination `withSize` variant (a "Rows per page" selector). |
| onPageSizeChange | ((size: number) => void) \| undefined | no |  | Fired with the next rows-per-page value when the footer selector changes it. |
| page | number \| undefined | no |  | Current page, 1-based (CONTROLLED). Omit for uncontrolled use. |
| defaultPage | number \| undefined | no |  | Initial page for uncontrolled use. |
| onPageChange | ((page: number) => void) \| undefined | no |  | Fired with the next 1-based page when the footer pagination navigates. |
| loading | boolean \| undefined | no | false | Loading state: the body renders pulsing skeleton placeholder rows (one per would-be row on the page) instead of data. |
| emptyMessage | ReactNode | no |  | What to render, centered under the header, when `rows` is empty (and not `loading`). A string gets the muted caption type; any ReactNode renders as given (an `EmptyState`, a retry Button). Omitted = just the header row, as before. |
| onRowPress | ((row: ReactNode[], index: number) => void) \| undefined | no |  | When set, each data row is pressable, reporting the row data and its index in `rows`. A press anywhere on the row acts; the keyboard and screen-reader path is a button inside the row's FIRST column, named from the row's plain text cells (or, when it has none, by that cell's own content). The row itself stays a `row`, so keep your own controls out of the first column here: a control there would nest inside the activator. |
| onRowEdit | ((rowIndex: number) => void) \| undefined | no |  | Row editing: passing this adds a trailing actions column with a pencil button per row. Pressing the pencil opens the row's edit mode (its string cells become fields with a trailing Save/Cancel pair) and fires this with the row's original index in `rows`. Save reports the edited cells through `onRowCommit`; Cancel (or Escape in a field) closes without committing. |
| onRowDelete | ((rowIndex: number) => void) \| undefined | no |  | Row deletion: passing this adds a delete (bin) button to the trailing actions column. Delete is second-press confirm: the first press ARMS it (the bin turns destructive and its accessible name says confirm), a second press within the confirm window fires this with the row's original index, and pressing anywhere else in the table (or the window lapsing) disarms. |
| inlineEdit | boolean \| undefined | no | false | Let string cells be edited in place: pressing one swaps it to a field. Enter or blur commits through `onCellCommit`; Escape restores the cell. Custom ReactNode cells (badges, links) are not editable. |
| onCellCommit | ((rowIndex: number, colIndex: number, next: string) => void) \| undefined | no |  | Fired when an `inlineEdit` cell commits (Enter or blur) with a changed value: the row's original index in `rows`, the column index, and the next text. Data stays yours: re-render with updated `rows` to keep the edit. |
| onRowCommit | ((rowIndex: number, cells: ReactNode[]) => void) \| undefined | no |  | Fired when a pencil-opened row edit is saved: the row's original index in `rows` and the full cells array with the edited strings in place (custom ReactNode cells pass through unchanged). |
| virtualized | boolean \| undefined | no | false | Render the data rows through a windowed `FlatList` instead of mounting every row up front, for large tables. The header row stays fixed above it. Give the table a bounded height (via `style`, e.g. `{ maxHeight: 400 }`) so the body can scroll; without one it warns and renders eagerly. Default mounts all rows. |
| rowKey | ((row: ReactNode[], index: number) => string \| number) \| undefined | no |  | Stable key for a row, derived from the row data and its index in `rows`. Selection is keyed by it, and it keeps React row identity stable when rows reorder (sorting, live data) and a cell is a stateful custom ReactNode. When omitted, rows key off their original array index (safe for string/number cells and stateless custom cells; selection then tracks row POSITIONS, so supply a real key when the data itself can be reordered, inserted, or deleted). Keep this function pure; replace its identity when external data changes how keys are derived, so the cached selection summary updates. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
