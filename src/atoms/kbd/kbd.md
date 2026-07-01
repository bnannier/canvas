# Kbd

Keyboard shortcut indicator badge.

## Usage

```tsx
<Row alignCenter tight>
  <Kbd>⌘</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>K</Kbd>
</Row>
```

## Variants

### Mode - single

```tsx
<Kbd>⌘</Kbd>
```

### Mode - in a sentence

```tsx
<Row wrap alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
  <Typography small> to search.</Typography>
</Row>
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
<Row alignCenter tight>
  <Kbd>⌘</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>⇧</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>P</Kbd>
</Row>
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
<Row alignCenter tight>
  <Typography small>Press</Typography>
  <Kbd>Ctrl</Kbd>
  <Kbd>K</Kbd>
  <Typography small>to search.</Typography>
</Row>
```

**Don't** — Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Text style={{ fontSize: 14, lineHeight: 20 }}>Press Ctrl+K to search.</Text>
```
