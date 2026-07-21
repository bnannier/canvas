# DataTable

A data table rendered from column and row data, with sorting, row selection, pagination, and the loading and empty states built in. Columns are plain header labels or descriptors (`{ label, numeric, width, sortable, ... }`) for per-column alignment, fixed widths, and sorting; compose a toolbar above when the screen needs one. Density tweaks affect padding live.

## Usage

```tsx
<DataTable
  columns={["Name", "Email", "Role", "Status"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin", "Active"],
    ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
    ["Rachel Chen", "rachel@example.com", "Admin", "Active"]
  ]}
  bordered
  sortable
/>
```

## Variants

### Sortable

```tsx
<DataTable
  columns={["Name", "Email", "Role"]}
  rows={[
    ["Rachel Chen", "rachel@example.com", "Admin"],
    ["Alice Johnson", "alice@example.com", "Admin"],
    ["Dan Wright", "dan@example.com", "Viewer"],
    ["Bob Smith", "bob@example.com", "Editor"]
  ]}
  bordered
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
  bordered
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
  bordered
  selectable
  paginated
  pageSize={5}
/>
```

### Numeric and custom columns

```tsx
<DataTable
  columns={[
    "Invoice",
    { label: "Status", centered: true, width: 120, sortable: false },
    { label: "Amount", numeric: true, sortValue: (cell) => Number(String(cell).replace(/[^0-9.]/g, "")) }
  ]}
  rows={[
    ["INV-0041", <Badge success>Paid</Badge>, "$1,250.00"],
    ["INV-0042", <Badge warning>Due</Badge>, "$450.00"],
    ["INV-0043", <Badge neutral>Draft</Badge>, "$8,120.00"],
    ["INV-0044", <Badge success>Paid</Badge>, "$96.00"]
  ]}
  bordered
  sortable
  defaultSort={{ column: "Amount", descending: true }}
/>
```

### Striped

```tsx
<DataTable
  columns={["Name", "Email", "Role", "Status"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin", "Active"],
    ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
    ["Rachel Chen", "rachel@example.com", "Admin", "Active"],
    ["Dan Wright", "dan@example.com", "Viewer", "Active"]
  ]}
  bordered
  striped
/>
```

### Compact

```tsx
<DataTable
  columns={["Name", "Email", "Role", "Status"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin", "Active"],
    ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
    ["Rachel Chen", "rachel@example.com", "Admin", "Active"]
  ]}
  bordered
  compact
/>
```

### Comfortable

```tsx
<DataTable
  columns={["Name", "Email", "Role", "Status"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin", "Active"],
    ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
    ["Rachel Chen", "rachel@example.com", "Admin", "Active"]
  ]}
  bordered
  comfortable
/>
```

### Loading

```tsx
<DataTable
  columns={["Name", "Email", "Status"]}
  rows={[]}
  bordered
  loading
/>
```

### Empty

```tsx
<DataTable
  columns={["Name", "Email", "Status"]}
  rows={[]}
  bordered
  emptyMessage="No results found."
/>
```

## Do & Don't

### default

**Do** — Use the built-in paginated footer so the search result is always anchored to the total.

```tsx
<Card flat flush style={{ overflow: "hidden", maxWidth: 520 }}>
  <Row snug alignCenter between pad>
    <Input small narrow placeholder="Search users..." />
    <Button outline small>Export</Button>
  </Row>
  <Divider />
  <DataTable paginated pageSize={3} columns={["Name", "Email"]} rows={[
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
    <Input small placeholder="Search users..." style={{ maxWidth: 240 }} />
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
<Card flat flush style={{ overflow: "hidden", maxWidth: 520 }}>
  <Row snug alignCenter between pad>
    <Typography tiny muted>2 selected</Typography>
    <Row snug alignCenter>
      <Button outline small>Bulk edit</Button>
      <Button destructive small>Delete</Button>
    </Row>
  </Row>
  <Divider />
  <DataTable selectable defaultSelectedKeys={[0, 2]} columns={["Name", "Email"]} rows={[
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
<Card flat padded style={{ maxWidth: 520 }}>
  <Row snug alignCenter between>
    <Row snug alignCenter>
      <Typography tiny muted>Status:</Typography>
      <Select value="All" options={["All", "Active", "Inactive"]} small style={{ width: 120 }} />
    </Row>
    <Typography tiny muted>142 results</Typography>
  </Row>
</Card>
```

**Don't** — A filter control with no result count leaves the user guessing whether the filter narrowed anything.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12, maxWidth: 520 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Status:</Text>
  <Select value="All" options={["All", "Active", "Inactive"]} small style={{ width: 120 }} />
</View>
```

### empty

**Do** — Keep the header and let the built-in emptyMessage span a centered row so the structure stays intact.

```tsx
<DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} emptyMessage="No results found." style={{ width: 520, maxWidth: "100%" }} />
```

**Don't** — Hiding the body entirely on no results collapses the table and looks broken.

```tsx
<DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} style={{ maxWidth: 520 }} />
```

### loading

**Do** — Use the built-in loading skeletons so the load reads as the table taking shape in place.

```tsx
<DataTable bordered loading columns={["Name", "Email", "Status"]} rows={[]} style={{ width: 520, maxWidth: "100%" }} />
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
