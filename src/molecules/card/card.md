# Cards

Three families. `StatCard` = a single metric, big number + delta. `SectionCard` = a labeled content surface with optional header and divider. Generic `card` = bring your own structure. Density: pass `compact` or `comfortable` to tighten or relax the card's own padding and the gap between flat children (`compact` takes precedence, and a density prop pads the surface on its own).

## Usage

```tsx
<Card className="w-[280px] p-5">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
      <Text className="text-sm font-semibold text-blue-600">U</Text>
    </View>
  </View>
</Card>
```

## Variants

### Type - section

```tsx
<Card
  title="Recent activity"
  body="A labeled content surface. Drop fields, a list, or any module of content here."
/>
```

### Type - generic

```tsx
<Card
  padded
  title="Anything goes here"
  body="The card surface gives you the border, radius, and shadow. You bring the content."
/>
```

### Icon tone - success

```tsx
<Card className="w-[280px] p-5">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
      <Text className="text-sm font-semibold text-green-600">S</Text>
    </View>
  </View>
</Card>
```

### Icon tone - purple

```tsx
<Card className="w-[280px] p-5">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
      <Text className="text-sm font-semibold text-purple-600">O</Text>
    </View>
  </View>
</Card>
```

### Icon tone - destructive

```tsx
<Card className="w-[280px] p-5">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
      <Text className="text-sm font-semibold text-destructive">!</Text>
    </View>
  </View>
</Card>
```

### Icon tone - amber

```tsx
<Card className="w-[280px] p-5">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
      <Text className="text-sm font-semibold text-amber-600">T</Text>
    </View>
  </View>
</Card>
```

## Do & Don't

### stat

**Do** — One big number, a short label, a small delta. The metric is scannable in a glance.

```tsx
<Card padded className="max-w-[280px]">
  <View className="flex-row items-start justify-between">
    <View>
      <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</Text>
      <Text className="mt-1 text-2xl font-bold text-card-foreground">12,348</Text>
      <Text className="mt-0.5 text-[11px] text-muted-foreground">+142 today</Text>
    </View>
    <View className="h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
      <Text className="text-sm font-semibold text-blue-600">U</Text>
    </View>
  </View>
</Card>
```

**Don't** — Prose where the number should be: the eye has nothing big to land on, so the card stops being a stat.

```tsx
<Card padded className="max-w-[280px]">
  <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This month</Text>
  <Text className="mt-1 text-sm font-medium text-card-foreground">We onboarded 12,348 active identities, up 142 today, with churn holding steady.</Text>
</Card>
```

### section

**Do** — Keep the divider between header and body; it anchors the title.

```tsx
<Card className="max-w-[360px]">
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
  </CardHeader>
  <CardSeparator />
  <CardContent>
    <Text className="text-sm text-card-foreground">Two events today.</Text>
  </CardContent>
</Card>
```

**Don't** — Without the divider the header floats and stops reading as a header.

```tsx
<Card className="max-w-[360px]">
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
  </CardHeader>
  <CardContent>
    <Text className="text-sm text-card-foreground">Two events today.</Text>
  </CardContent>
</Card>
```

### generic

**Do** — Use the surface once and layout the content with plain spacing inside it.

```tsx
<Card padded className="max-w-[360px]">
  <Text className="mb-1 text-[15px] font-semibold text-card-foreground">Anything goes here</Text>
  <Text className="text-sm text-muted-foreground">The card surface gives you the border, radius, and shadow. You bring the content.</Text>
</Card>
```

**Don't** — Nesting one card surface inside another stacks border on border and shadow on shadow; the inner block looks dropped in.

```tsx
<Card padded className="max-w-[360px]">
  <Card padded>
    <Text className="mb-1 text-[15px] font-semibold text-card-foreground">Nested surface</Text>
    <Text className="text-sm text-muted-foreground">A card inside a card doubles the border and shadow.</Text>
  </Card>
</Card>
```
