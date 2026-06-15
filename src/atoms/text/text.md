# Text

Renders text. In React Native every string must live inside a Text element, so you cannot put a bare string in a View. Style it with fontSize, fontWeight, color, and lineHeight, and truncate with numberOfLines.

## Usage

```tsx
<Text style={{ fontSize: 16, fontWeight: "600", color: tokens.foreground }}>
  The quick brown fox jumps over the lazy dog.
</Text>
```

## Variants

### Size & weight

```tsx
<View style={{ gap: 6 }}>
  <Text style={{ fontSize: 22, fontWeight: "700", color: tokens.foreground }}>Heading</Text>
  <Text style={{ fontSize: 14, color: tokens.foreground }}>Body text</Text>
  <Text style={{ fontSize: 12, color: alpha(tokens.foreground, 0.6) }}>Muted caption</Text>
</View>
```

### Truncation

```tsx
<View style={{ width: 220 }}>
  <Text numberOfLines={1} style={{ fontSize: 14, color: tokens.foreground }}>
    This single line is clipped with an ellipsis when it overflows its container.
  </Text>
</View>
```

### Color

```tsx
<View style={{ gap: 4 }}>
  <Text style={{ color: tokens.primary, fontWeight: "600" }}>Primary</Text>
  <Text style={{ color: tokens.destructive, fontWeight: "600" }}>Destructive</Text>
  <Text style={{ color: alpha(tokens.foreground, 0.6) }}>Muted</Text>
</View>
```
