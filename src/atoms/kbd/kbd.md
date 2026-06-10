# Kbd

Keyboard shortcut indicator badge.

## Usage

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  <Kbd>⌘</Kbd>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>+</Text>
  <Kbd>K</Kbd>
</View>
```

## Variants

### Mode - single

```tsx
<Kbd>⌘</Kbd>
```

### Mode - in a sentence

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Press </Text>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}> to search.</Text>
</View>
```

## Do & Don't

### Single

**Do** — Use the single mode for one real key; give each cap exactly one key.

```tsx
<Kbd>Esc</Kbd>
```

**Don't** — Packing a whole shortcut into one key cap reads as a single keystroke that does not exist.

```tsx
<Kbd>⌘K</Kbd>
```

### Combo

**Do** — Separate each key with a + so the combo reads as keys pressed together.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  <Kbd>⌘</Kbd>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>+</Text>
  <Kbd>⇧</Kbd>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>+</Text>
  <Kbd>P</Kbd>
</View>
```

**Don't** — Caps butted together with no separator blur into one token and hide that it is a chord.

```tsx
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Kbd>⌘</Kbd>
  <Kbd>⇧</Kbd>
  <Kbd>P</Kbd>
</View>
```

### In a sentence

**Do** — Wrap each key in a kbd so shortcuts read as physical keys.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Press</Text>
  <Kbd>Ctrl</Kbd>
  <Kbd>K</Kbd>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>to search.</Text>
</View>
```

**Don't** — Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Text style={{ fontSize: 14, lineHeight: 20 }}>Press Ctrl+K to search.</Text>
```
