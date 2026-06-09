# Spinner

Animated loading spinner in three sizes.

## Usage

```tsx
<Spinner />
```

## Do & Don't

**Do** — Pair longer waits with a short label so the spinner has context.

```tsx
<View className="flex-row items-center gap-2">
  <Spinner small />
  <Text className="text-sm text-muted-foreground">Loading…</Text>
</View>
```

**Don't** — A bare spinner with no label leaves users guessing what is happening and for how long.

```tsx
<Spinner />
```

### sm

**Do** — Use the small size inline: inside a button or beside a line of text where its scale matches the type.

```tsx
<Button loading disabled>Saving…</Button>
```

**Don't** — The 4×4 spinner is too small to anchor a full panel; alone in open space it reads as a stray dot.

```tsx
<View className="h-32 items-center justify-center rounded-lg border border-dashed border-border">
  <Spinner small />
</View>
```

### default

**Do** — Keep the default square and centered with a label for small content panels and cards.

```tsx
<View className="flex-col items-center gap-2 rounded-lg border border-border p-6">
  <Spinner />
  <Text className="text-sm text-muted-foreground">Loading…</Text>
</View>
```

**Don't** — Don't stretch it with conflicting w/h utilities; a spinner must stay a perfect circle to spin cleanly.

```tsx
<View className="rounded-md bg-muted p-3">
  <View className="w-12 h-5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
</View>
```

### lg

**Do** — Reserve the large size for section- or page-level loading, centered in the empty content area.

```tsx
<View className="h-40 flex-col items-center justify-center gap-3 rounded-lg border border-border">
  <Spinner large />
  <Text className="text-sm text-muted-foreground">Loading dashboard…</Text>
</View>
```

**Don't** — The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height.

```tsx
<Pressable className="flex-row items-center justify-center h-8 rounded-md px-3 bg-primary opacity-50">
  <Spinner large />
</Pressable>
```
