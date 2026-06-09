# Tabs

Underline, pill, vertical, with badges.

## Usage

```tsx
<Tabs
  tabs={[
    "General",
    "Security",
    "Notifications",
    "Billing",
    "Integrations"
  ]}
  active={0}
/>
```

## Variants

### Variant - pill

```tsx
<Tabs pills tabs={["All", "Active", "Archived", "Deleted"]} active={0} />
```

### Variant - vertical

```tsx
<Tabs
  vertical
  tabs={["General", "Security", "Notifications", "API Keys", "Billing"]}
  active={0}
/>
```

### Badge counts

```tsx
<Tabs
  tabs={[
    { label: "All", badge: "142" },
    { label: "Active", badge: "89" },
    { label: "Pending", badge: "12" },
    { label: "Archived", badge: "53" }
  ]}
  active={0}
/>
```

## Do & Don't

### Underline

**Do** — Underline and foreground-color only the active tab; leave the rest muted with no rule.

```tsx
<Tabs tabs={["Overview", "Activity", "Settings"]} active={0} />
```

**Don't** — Underlining every tab erases the active indicator: there is no way to tell which view is current.

```tsx
<View className="flex-row items-center border-b border-border self-start">
  <Pressable className="flex-row items-center justify-center px-4 py-2.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">Overview</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
  </Pressable>
  <Pressable className="flex-row items-center justify-center px-4 py-2.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">Activity</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
  </Pressable>
  <Pressable className="flex-row items-center justify-center px-4 py-2.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">Settings</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
  </Pressable>
</View>
```

### Pill

**Do** — Exactly one pill gets the elevated background; the rest sit flat on the muted track.

```tsx
<Tabs tabs={["All", "Active", "Archived"]} active={0} pills />
```

**Don't** — Giving every pill the raised background makes the group read as three buttons, not one selection.

```tsx
<View className="flex-row items-center gap-1 self-start rounded-lg bg-muted p-1">
  <Pressable className="flex-row items-center justify-center rounded-md bg-background shadow-sm px-3 py-1.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">All</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center rounded-md bg-background shadow-sm px-3 py-1.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">Active</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center rounded-md bg-background shadow-sm px-3 py-1.5 active:opacity-90">
    <Text className="text-sm font-medium text-foreground">Archived</Text>
  </Pressable>
</View>
```

### Vertical

**Do** — Fill the active rail item with the accent background so the selected pane is unmistakable.

```tsx
<Tabs tabs={["General", "Security", "Notifications"]} active={0} vertical />
```

**Don't** — With no filled active item the rail collapses into a plain link list and loses its current selection.

```tsx
<View className="flex-col items-stretch gap-1 w-[180px]">
  <Pressable className="w-full flex-row items-center rounded-md bg-transparent px-3 py-2 active:opacity-90">
    <Text className="text-sm font-medium text-muted-foreground">General</Text>
  </Pressable>
  <Pressable className="w-full flex-row items-center rounded-md bg-transparent px-3 py-2 active:opacity-90">
    <Text className="text-sm font-medium text-muted-foreground">Security</Text>
  </Pressable>
  <Pressable className="w-full flex-row items-center rounded-md bg-transparent px-3 py-2 active:opacity-90">
    <Text className="text-sm font-medium text-muted-foreground">Notifications</Text>
  </Pressable>
</View>
```
