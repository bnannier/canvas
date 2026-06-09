# Data Tables

Every table is the same composition: bordered wrap &rarr; toolbar &rarr; scrollable table &rarr; footer. Density tweaks affect padding live.

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
/>
```

## Do & Don't

### default

**Do** — Keep the count + pagination footer so the search result is always anchored to the total.

```tsx
<View className="overflow-hidden rounded-lg border border-border max-w-[520px]">
  <View className="flex-row items-center gap-2 border-b border-border p-3">
    <Input small placeholder="Search users..." className="max-w-[240px]" />
    <View className="flex-1" />
    <Button outline small>Export</Button>
  </View>
  <DataTable columns={["Name", "Email"]} rows={[
    ["Alice Johnson", "alice@example.com"],
    ["Bob Smith", "bob@example.com"],
    ["Rachel Chen", "rachel@example.com"]
  ]} />
  <View className="flex-row items-center justify-between border-t border-border px-4 py-2.5">
    <Text className="text-sm text-muted-foreground">Showing 1–3 of 142</Text>
    <View className="flex-row gap-1">
      <Button outline small disabled>«</Button>
      <Button outline small>»</Button>
    </View>
  </View>
</View>
```

**Don't** — Wiring search but dropping the footer leaves the user with no result count or way to page through 142 rows.

```tsx
<View className="overflow-hidden rounded-lg border border-border max-w-[520px]">
  <View className="flex-row items-center gap-2 border-b border-border p-3">
    <Input small placeholder="Search users..." className="max-w-[240px]" />
    <View className="flex-1" />
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
<View className="flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]">
  <Text className="text-xs text-muted-foreground">3 selected</Text>
  <View className="flex-1" />
  <Button outline small>Bulk edit</Button>
  <Button destructive small>Delete</Button>
</View>
```

**Don't** — Surfacing only the destructive Delete on a selection invites accidental data loss with no safer path.

```tsx
<View className="flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]">
  <Text className="text-xs text-muted-foreground">3 selected</Text>
  <View className="flex-1" />
  <Button destructive small>Delete</Button>
</View>
```

### filter

**Do** — Echo the live result count next to the filter so its effect is visible.

```tsx
<View className="flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]">
  <Text className="text-xs text-muted-foreground">Status:</Text>
  <Select value="All" options={["All", "Active", "Inactive"]} small className="w-[120px]" />
  <View className="flex-1" />
  <Text className="text-xs text-muted-foreground">142 results</Text>
</View>
```

**Don't** — A filter control with no result count leaves the user guessing whether the filter narrowed anything.

```tsx
<View className="flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]">
  <Text className="text-xs text-muted-foreground">Status:</Text>
  <Select value="All" options={["All", "Active", "Inactive"]} small className="w-[120px]" />
</View>
```

### empty

**Do** — Keep the header and span a single centered message row so the structure stays intact.

```tsx
<View className="overflow-hidden rounded-lg border border-border max-w-[520px]">
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <View className="items-center px-4 py-8">
    <Text className="text-sm text-muted-foreground">No results found.</Text>
  </View>
</View>
```

**Don't** — Hiding the body entirely on no results collapses the table and looks broken.

```tsx
<DataTable bordered columns={["Name", "Email", "Status"]} rows={[]} className="max-w-[520px]" />
```

### loading

**Do** — Show a spinner in a centered spanning row so the load reads as active and in place.

```tsx
<View className="overflow-hidden rounded-lg border border-border max-w-[520px]">
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <View className="items-center px-4 py-8">
    <Spinner small />
  </View>
</View>
```

**Don't** — A bare "Loading…" string gives no sense of progress and reads like static content.

```tsx
<View className="overflow-hidden rounded-lg border border-border max-w-[520px]">
  <DataTable columns={["Name", "Email", "Status"]} rows={[]} />
  <View className="items-center px-4 py-8">
    <Text className="text-sm text-muted-foreground">Loading…</Text>
  </View>
</View>
```
