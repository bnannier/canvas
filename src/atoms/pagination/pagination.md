# Pagination

Page-of-N navigation for tables and lists.

## Usage

```tsx
<Pagination page={2} total={12} compact pageSize={10} pageSizes={[10, 25, 50]} />
```

## Variants

### Variant - numbered

```tsx
<Pagination page={2} total={12} pageSize={10} pageSizes={[10, 25, 50]} />
```

### Variant - with-size

```tsx
<Pagination page={2} total={12} withSize pageSize={10} pageSizes={[10, 25, 50]} />
```

## Do & Don't

### compact

**Do** — Pair the buttons with a "Showing X–Y of N" range so position and total are always visible.

```tsx
<Pagination compact page={2} total={12} />
```

**Don't** — Bare Previous/Next with no range label leaves the user unable to tell where they are or how much is left.

```tsx
<View className="flex-row items-center justify-end gap-1">
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Previous page">
    <Text className="text-sm font-medium text-foreground">‹</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Next page">
    <Text className="text-sm font-medium text-foreground">›</Text>
  </Pressable>
</View>
```

### numbered

**Do** — Truncate the middle with an ellipsis; keep first, last, and a window around the current page.

```tsx
<Pagination page={2} total={12} />
```

**Don't** — Rendering every page number overflows and stops being scannable past a handful.

```tsx
<View className="flex-row items-center gap-1">
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background opacity-50" accessibilityRole="button" accessibilityLabel="Previous page">
    <Text className="text-sm font-medium text-foreground">‹</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-primary bg-primary" accessibilityRole="button" accessibilityLabel="Page 1">
    <Text className="text-sm font-medium text-primary-foreground">1</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 2">
    <Text className="text-sm font-medium text-foreground">2</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 3">
    <Text className="text-sm font-medium text-foreground">3</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 4">
    <Text className="text-sm font-medium text-foreground">4</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 5">
    <Text className="text-sm font-medium text-foreground">5</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 6">
    <Text className="text-sm font-medium text-foreground">6</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 7">
    <Text className="text-sm font-medium text-foreground">7</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 8">
    <Text className="text-sm font-medium text-foreground">8</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 9">
    <Text className="text-sm font-medium text-foreground">9</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 10">
    <Text className="text-sm font-medium text-foreground">10</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 11">
    <Text className="text-sm font-medium text-foreground">11</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Page 12">
    <Text className="text-sm font-medium text-foreground">12</Text>
  </Pressable>
  <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Next page">
    <Text className="text-sm font-medium text-foreground">›</Text>
  </Pressable>
</View>
```

### with-size

**Do** — Show "Page X of N" beside the size selector and reset to page 1 when the size changes.

```tsx
<Pagination withSize page={2} total={12} pageSize={10} pageSizes={[10, 25, 50]} />
```

**Don't** — Offering a page-size selector without a page indicator hides which page the new size landed on.

```tsx
<View className="flex-row items-center gap-4">
  <View className="flex-row items-center gap-2">
    <Text className="text-sm text-muted-foreground">Rows per page</Text>
    <Pressable className="flex-row items-center justify-between gap-1 h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Rows per page">
      <Text className="text-sm font-medium text-foreground">10</Text>
      <Text className="text-sm text-muted-foreground">▾</Text>
    </Pressable>
  </View>
  <View className="flex-row items-center gap-1">
    <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background opacity-50" accessibilityRole="button" accessibilityLabel="Previous page">
      <Text className="text-sm font-medium text-foreground">‹</Text>
    </Pressable>
    <Pressable className="flex-row items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background" accessibilityRole="button" accessibilityLabel="Next page">
      <Text className="text-sm font-medium text-foreground">›</Text>
    </Pressable>
  </View>
</View>
```
