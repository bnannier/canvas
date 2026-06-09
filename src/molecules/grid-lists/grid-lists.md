# Grid Lists

Tiled card grids for people directories, item collections, and image galleries.

## Usage

```tsx
<GridList
  items={[
    { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "/rachel-chen.jpg", actions: [
      { label: "Message", outline: true },
      { label: "View", ghost: true }
    ] },
    { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "/ada-lovelace.jpg", actions: [
      { label: "Message", outline: true },
      { label: "View", ghost: true }
    ] },
    { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT", actions: [
      { label: "Message", outline: true },
      { label: "View", ghost: true }
    ] }
  ]}
  cols2
/>
```

## Do & Don't

### People (card grid)

**Do** — Let auto-fill minmax columns size to the available width so cards wrap cleanly at any breakpoint.

```tsx
<GridList cols2 items={[
    { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC" },
    { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL" },
    { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT" }
  ]} />
```

**Don't** — A fixed column count with hard-width cards overflows the row on narrow viewports instead of reflowing.

```tsx
<View className="flex-row gap-3.5">
  <View className="w-[200px] items-center gap-2 p-5 rounded-lg border border-border bg-card shadow-sm">
    <Avatar large name="Rachel Chen">RC</Avatar>
    <Text className="text-sm font-semibold text-card-foreground">Rachel Chen</Text>
    <Text className="text-xs text-muted-foreground">Engineering Lead</Text>
  </View>
  <View className="w-[200px] items-center gap-2 p-5 rounded-lg border border-border bg-card shadow-sm">
    <Avatar large name="Ada Lovelace">AL</Avatar>
    <Text className="text-sm font-semibold text-card-foreground">Ada Lovelace</Text>
    <Text className="text-xs text-muted-foreground">Staff Engineer</Text>
  </View>
  <View className="w-[200px] items-center gap-2 p-5 rounded-lg border border-border bg-card shadow-sm">
    <Avatar large name="Kevin Turner">KT</Avatar>
    <Text className="text-sm font-semibold text-card-foreground">Kevin Turner</Text>
    <Text className="text-xs text-muted-foreground">Product Designer</Text>
  </View>
</View>
```

### Image gallery

**Do** — Lock a consistent aspect ratio so the grid stays even and nothing reflows once thumbnails load.

```tsx
<GridList gallery cols3 items={[
    { title: "hero-banner.png", subtitle: "1.2 MB", color: "primary" },
    { title: "icon-set.svg", subtitle: "340 KB", color: "blue-500" },
    { title: "product-shot.jpg", subtitle: "2.8 MB", color: "emerald-500" },
    { title: "avatar-default.png", subtitle: "96 KB", color: "amber-500" }
  ]} />
```

**Don't** — Letting each thumbnail keep its intrinsic height makes a ragged grid and shifts the layout as images load.

```tsx
<View className="flex-row flex-wrap gap-3">
  <View className="w-[140px]">
    <View className="w-full h-24 rounded-md bg-primary/20" />
    <Text className="mt-2 text-[12.5px] font-medium text-card-foreground">hero-banner.png</Text>
  </View>
  <View className="w-[140px]">
    <View className="w-full h-40 rounded-md bg-blue-500/20" />
    <Text className="mt-2 text-[12.5px] font-medium text-card-foreground">icon-set.svg</Text>
  </View>
  <View className="w-[140px]">
    <View className="w-full h-16 rounded-md bg-emerald-500/20" />
    <Text className="mt-2 text-[12.5px] font-medium text-card-foreground">product-shot.jpg</Text>
  </View>
  <View className="w-[140px]">
    <View className="w-full h-32 rounded-md bg-amber-500/20" />
    <Text className="mt-2 text-[12.5px] font-medium text-card-foreground">avatar-default.png</Text>
  </View>
</View>
```
