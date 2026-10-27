# Kbd

Keyboard shortcut indicator: a raised 24 px key cap with a mono label. `keys`
composes a whole shortcut, one cap per key; `sequence` says "then" between the
caps of keys pressed one after another. A shortcut reads as one accessible name
("⌘+K", "G then C").

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
