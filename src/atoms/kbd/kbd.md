# Kbd

Keyboard shortcut indicator badge.

## Usage

```tsx
<View className="flex-row items-center gap-1">
  <Kbd>⌘</Kbd>
  <Text className="text-xs text-muted-foreground">+</Text>
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
<View className="flex-row flex-wrap items-center gap-1">
  <Text className="text-sm text-foreground">Press </Text>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
  <Text className="text-sm text-foreground"> to search.</Text>
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
<View className="flex-row items-center gap-1">
  <Kbd>⌘</Kbd>
  <Text className="text-xs text-muted-foreground">+</Text>
  <Kbd>⇧</Kbd>
  <Text className="text-xs text-muted-foreground">+</Text>
  <Kbd>P</Kbd>
</View>
```

**Don't** — Caps butted together with no separator blur into one token and hide that it is a chord.

```tsx
<View className="flex-row items-center">
  <Kbd>⌘</Kbd>
  <Kbd>⇧</Kbd>
  <Kbd>P</Kbd>
</View>
```

### In a sentence

**Do** — Wrap each key in a kbd so shortcuts read as physical keys.

```tsx
<View className="flex-row items-center gap-1">
  <Text className="text-sm">Press</Text>
  <Kbd>Ctrl</Kbd>
  <Kbd>K</Kbd>
  <Text className="text-sm">to search.</Text>
</View>
```

**Don't** — Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Text className="text-sm">Press Ctrl+K to search.</Text>
```
