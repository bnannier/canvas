# Text

Renders text. In React Native every string must live inside a Text element, so you cannot put a bare string in a View. For type scale and tone in app code, reach for `<Typography>` (e.g. `<Typography h3>`, `<Typography body>`, `<Typography tiny muted>`), which owns the kit's roles and colors; use the raw Text primitive for the primitive-level cases it does not cover: `numberOfLines` truncation and nested inline runs.

## Usage

```tsx
<Text numberOfLines={1} style={{ color: tokens.foreground }}>
  The quick brown fox jumps over the lazy dog.
</Text>
```

## Variants

### Recommended - Typography

```tsx
<Column tight>
  <Typography h3>Heading</Typography>
  <Typography body>Body text</Typography>
  <Typography tiny muted>Muted caption</Typography>
</Column>
```

### Truncation

```tsx
<View style={{ width: 220 }}>
  <Text numberOfLines={1} style={{ color: tokens.foreground }}>
    This single line is clipped with an ellipsis when it overflows its container.
  </Text>
</View>
```

### Nested runs

```tsx
<Text style={{ color: tokens.foreground }}>
  A run of text can carry an <Text style={{ fontWeight: "700" }}>inline emphasis</Text> that inherits everything else from its parent Text.
</Text>
```
