# Kbd

Keyboard shortcut indicator badge.

## Usage

```tsx
<Kbd keys="⌘ K" />
```

## Variants

### Mode - single

```tsx
<Kbd>Esc</Kbd>
```

### Mode - combo

```tsx
<Kbd keys="⌘ ⇧ P" />
```

### Mode - sequence

```tsx
<Kbd keys="⌘K ⌘S" sequence />
```

### Mode - in a sentence

```tsx
<Row wrap alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="⌘ K" />
  <Typography small> to search.</Typography>
</Row>
```

## Do & Don't

### Single

**Do** — Use `children` for one real key; give each cap exactly one key.

```tsx
<Kbd>Esc</Kbd>
```

**Don't** — Packing a whole shortcut into one key cap reads as a single keystroke that does not exist.

```tsx
<Kbd>⌘K</Kbd>
```

### Combo

**Do** — Pass every key to `keys`; Kbd lays out the caps with `+` separators and reads as one shortcut to a screen reader.

```tsx
<Kbd keys="⌘ ⇧ P" />
```

**Don't** — Hand-assembling caps and separators is verbose and drops the combined accessible name; let `keys` compose the chord.

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

**Do** — Drop a `keys` Kbd inline so the shortcut reads as physical keys.

```tsx
<Row wrap alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="Ctrl K" />
  <Typography small> to search.</Typography>
</Row>
```

**Don't** — Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Typography small>Press Ctrl+K to search.</Typography>
```
