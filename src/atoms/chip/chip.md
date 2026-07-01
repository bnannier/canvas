# Chip

An interactive pill: a filter chip, a tag, or a selectable token. A Chip carries
an optional leading icon and a label, becomes tappable with `onPress` (a filter
toggle), and grows a trailing "×" remove button with `onRemove`, so no call site
hand-composes a `borderRadius` + `backgroundColor` + padding Pressable. Tone is a
boolean axis (`secondary` / `primary` / `outline`); `primary` reads as the active
or selected state.

## Usage

```tsx
<Chip primary onRemove={() => {}}>Status: Active</Chip>
```

## Variants

### Tones

```tsx
<Row snug wrap alignCenter>
  <Chip secondary>Draft</Chip>
  <Chip primary>Published</Chip>
  <Chip outline>Archived</Chip>
</Row>
```

### With leading icon

```tsx
<Chip primary icon={<Icon check primaryForeground size={14} />}>Verified</Chip>
```

### Removable filters

```tsx
<Row snug wrap alignCenter>
  <Chip primary onRemove={() => {}}>Role: Admin</Chip>
  <Chip primary onRemove={() => {}}>Status: Active</Chip>
  <Chip outline onPress={() => {}} icon={<Icon plus muted size={14} />}>Add filter</Chip>
</Row>
```

### Small

```tsx
<Chip small primary onRemove={() => {}}>Beta</Chip>
```

## Do & Don't

### Removable filter

**Do** — Use a Chip with `onRemove` so the pill and its "×" stay consistent and accessible.

```tsx
<Chip primary onRemove={() => {}}>Status: Active</Chip>
```

**Don't** — Hand-build the pill from a raw Pressable with border-radius, padding, and a text "×".

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 9999, backgroundColor: "#4f46e5", paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: "#ffffff", fontSize: 13 }}>Status: Active</Text>
  <Text style={{ color: "#ffffff", fontSize: 13 }}>×</Text>
</Pressable>
```
