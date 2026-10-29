# Kbd

Keyboard shortcut indicator: a raised 24 px key cap with a mono label. `keys`
composes a whole shortcut, one cap per key; `sequence` says "then" between the
caps of keys pressed one after another. A shortcut reads as one accessible name
("⌘+K", "G then C"). `comfortable` pads the cap 3 px above and below its label and
8 px at the sides (25 px tall) for a key set beside what it does, as a reference's
keyboard table lists it; omit it for the 24 px cap with 6 px sides.

Two compact sizes take the cap down for a hint beside a field or a menu: `small`, the
22 px cap with 6 px sides at a 5 px corner and a 500 11 px label, and `tiny`, the 20 px cap
with 5 px sides at a 4 px corner and a 500 10 px label. Size precedence is `small`, then
`tiny`, and a size step wins over `comfortable`. `flat` is the hint cap's edge: one pixel
all round instead of the raised 2 px bottom, and the label in the secondary ink. An
`Input` draws its `shortcut` hint as `<Kbd small flat>` (`tiny` on a small field).

## Usage

```tsx
<Kbd keys="⌘ K" />
```

## Variants

### Single

```tsx
<Kbd>Esc</Kbd>
```

### Combo

```tsx
<Kbd keys="⌘ ⇧ P" />
```

### Sequence

```tsx
<Kbd keys="G C" sequence />
```

### Comfortable

```tsx
<Row alignCenter snug>
  <Kbd comfortable>Enter</Kbd>
  <Typography small muted>Activates</Typography>
</Row>
```

### Compact hint

```tsx
<Row alignCenter snug>
  <Kbd small flat>⌘K</Kbd>
  <Kbd tiny flat>⌘K</Kbd>
  <Kbd small flat>esc</Kbd>
</Row>
```

### In a button

```tsx
<Button outline iconRight={<Kbd keys="⌘ K" />}>Search…</Button>
```

### In a sentence

```tsx
<Row alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="⌘ K" />
  <Typography small> to search.</Typography>
</Row>
```

## Do & Don't

### Single

**Do**: Use `children` for one real key; give each cap exactly one key.

```tsx
<Kbd>Esc</Kbd>
```

**Don't**: Packing a whole shortcut into one key cap reads as a single keystroke that does not exist.

```tsx
<Kbd>⌘K</Kbd>
```

### Combo

**Do**: Pass every key to `keys`; Kbd lays out the caps and reads as one shortcut to a screen reader.

```tsx
<Kbd keys="⌘ ⇧ P" />
```

**Don't**: Hand-assembling caps and separators is verbose and drops the combined accessible name; let `keys` compose the chord.

```tsx
<Row alignCenter tight>
  <Kbd>⌘</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>⇧</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>P</Kbd>
</Row>
```

### In a sentence

**Do**: Drop a `keys` Kbd inline so the shortcut reads as physical keys.

```tsx
<Row wrap alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="Ctrl K" />
  <Typography small> to search.</Typography>
</Row>
```

**Don't**: Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Typography small>Press Ctrl+K to search.</Typography>
```
