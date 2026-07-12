# DataTable

A bordered table rendered from column and row data; compose a toolbar above and a footer below when the screen needs them. Density tweaks affect padding live.

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
  onRowPress={() => {}}
/>
```

## Variants

### Variant - bulk

```tsx
<DataTable
  columns={["Name", "Email", "Role", "Status"]}
  rows={[
    ["Alice Johnson", "alice@example.com", "Admin", "Active"],
    ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
    ["Rachel Chen", "rachel@example.com", "Admin", "Active"]
  ]}
  bordered
  selectable
  onRowPress={() => {}}
/>
```

### Density - compact

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
  onRowPress={() => {}}
/>
```

## Do & Don't

### default

**Do** — Keep the count + pagination footer so the search result is always anchored to the total.

```tsx
<Card flat flush style={{ overflow: "hidden", maxWidth: 520 }}>
  <Row snug alignCenter between pad>
    <Input small narrow placeholder="Search users..." />
    <Button outline small>Export</Button>
  </Row>
  <Divider />
  <DataTable columns={["Name", "Email"]} rows={[
    ["Alice Johnson", "alice@example.com"],
    ["Bob Smith", "bob@example.com"],
    ["Rachel Chen", "rachel@example.com"]
  ]} />
  <Divider />
  <Row alignCenter between pad>
    <Typography small muted>Showing 1–3 of 142</Typography>
    <Row tight>
      <Button outline small disabled>«</Button>
      <Button outline small>»</Button>
    </Row>
  </Row>
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

**Do** — Lead with the non-destructive bulk action and keep Delete visually distinct on the right.

```tsx
<Card flat padded style={{ maxWidth: 520 }}>
  <Row snug alignCenter between>
    <Typography tiny muted>3 selected</Typography>
    <Row snug alignCenter>
      <Button outline small>Bulk edit</Button>
      <Button destructive small>Delete</Button>
    </Row>
  </Row>
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

**Do** — Keep the header and span a single centered message row so the structure stays intact.

```tsx
<Card flat flush style={{ overflow: "hidden", maxWidth: 520 }}>
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <Column alignCenter padLoose>
    <Typography small muted>No results found.</Typography>
  </Column>
</Card>
```

**Don't** — Hiding the body entirely on no results collapses the table and looks broken.

```tsx
<DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} style={{ maxWidth: 520 }} />
```

### loading

**Do** — Show a spinner in a centered spanning row so the load reads as active and in place.

```tsx
<Card flat flush style={{ overflow: "hidden", maxWidth: 520 }}>
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <Column alignCenter padLoose>
    <Spinner small />
  </Column>
</Card>
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
