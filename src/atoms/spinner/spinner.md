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
<Row alignCenter snug>
  <Spinner small />
  <Typography small muted>Loading…</Typography>
</Row>
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
<Card padded>
  <Column alignCenter snug>
    <Spinner />
    <Typography small muted>Loading…</Typography>
  </Column>
</Card>
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
<Card style={{ height: 160 }}>
  <Column fill center alignCenter cozy>
    <Spinner large />
    <Typography small muted>Loading dashboard…</Typography>
  </Column>
</Card>
```

**Don't** — The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 32, borderRadius: 6, paddingHorizontal: 12, backgroundColor: tokens.primary, opacity: 0.5 }}>
  <Spinner large />
</Pressable>
```
