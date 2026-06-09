# Filter Panels

Sidebar filter rail with chip pills for active filters.

## Usage

```tsx
<FilterPanel
  bordered
  activeCount={2}
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "Pending", count: "12", checked: false },
      { label: "Archived", count: "2", checked: false }
    ] },
    { title: "Schema", options: [
      { label: "Default", checked: true, count: "96" },
      { label: "Custom", count: "46", checked: false }
    ] },
    { title: "MFA", options: [
      { label: "Enabled", count: "84", checked: false },
      { label: "Disabled", count: "58", checked: false }
    ] }
  ]}
/>
```

## Do & Don't

### Sidebar

**Do** — Give each chip a × so a single filter can be removed in place, and keep it in sync with the sidebar checkbox.

```tsx
<View className="flex-row flex-wrap gap-2">
  <Pressable className="flex-row items-center self-start gap-1 rounded-full bg-primary px-2.5 py-1">
    <Text className="text-xs font-medium text-primary-foreground">Active</Text>
    <Icon x primaryForeground size={12} />
  </Pressable>
  <Pressable className="flex-row items-center self-start gap-1 rounded-full bg-primary px-2.5 py-1">
    <Text className="text-xs font-medium text-primary-foreground">Default</Text>
    <Icon x primaryForeground size={12} />
  </Pressable>
</View>
```

**Don't** — Active-filter chips with no remove affordance leave no way to clear one filter without hunting back through the sidebar.

```tsx
<View className="flex-row flex-wrap gap-2">
  <View className="flex-row items-center self-start rounded-full bg-primary px-2.5 py-1">
    <Text className="text-xs font-medium text-primary-foreground">Active</Text>
  </View>
  <View className="flex-row items-center self-start rounded-full bg-primary px-2.5 py-1">
    <Text className="text-xs font-medium text-primary-foreground">Default</Text>
  </View>
</View>
```

### Inline

**Do** — Surface two or three primary filters and tuck the rest behind "+ Add filter" so the bar stays one scannable row.

```tsx
<View className="flex-row flex-wrap items-center gap-2">
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md bg-primary px-3">
    <Text className="text-xs font-medium text-primary-foreground">Status</Text>
    <Icon chevronDown primaryForeground size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Role</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Button ghost small className="text-primary">+ Add filter</Button>
</View>
```

**Don't** — Eight inline dropdowns wrap into a wall of buttons, which defeats the compact bar; that volume of filtering belongs in the sidebar rail.

```tsx
<View className="flex-row flex-wrap items-center gap-2">
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Status</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Role</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Schema</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">MFA</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Region</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Created</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Last seen</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable className="h-8 flex-row items-center gap-2 rounded-md border border-input bg-background px-3">
    <Text className="text-xs font-medium text-foreground">Team</Text>
    <Icon chevronDown size={12} />
  </Pressable>
</View>
```
