# Spinner

Animated loading spinner in three sizes.

## Usage

```tsx
<Spinner />
```

## Variants

### Size - sm

```tsx
<Spinner small />
```

### Size - lg

```tsx
<Spinner large />
```

## Do & Don't

**Do** — Pair longer waits with a short label so the spinner has context.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Spinner small />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Loading…</Text>
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
<View style={{ height: 128, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: tokens.border }}>
  <Spinner small />
</View>
```

### default

**Do** — Keep the default square and centered with a label for small content panels and cards.

```tsx
<View style={{ flexDirection: "column", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 24 }}>
  <Spinner />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Loading…</Text>
</View>
```

**Don't** — Don't stretch it with conflicting w/h utilities; a spinner must stay a perfect circle to spin cleanly.

```tsx
<View style={{ borderRadius: 6, backgroundColor: tokens.muted, padding: 12 }}>
  <View style={{ width: 48, height: 20, borderRadius: 9999, borderWidth: 2, borderColor: tokens.muted, borderTopColor: tokens.foreground }} />
</View>
```

### lg

**Do** — Reserve the large size for section- or page-level loading, centered in the empty content area.

```tsx
<View style={{ height: 160, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
  <Spinner large />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Loading dashboard…</Text>
</View>
```

**Don't** — The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 32, borderRadius: 6, paddingHorizontal: 12, backgroundColor: tokens.primary, opacity: 0.5 }}>
  <Spinner large />
</Pressable>
```
