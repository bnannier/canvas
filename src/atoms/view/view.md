# View

The layout primitive: a flex container that runs identically on iOS, Android, and the web. A View is a column by default; set its layout with a React Native style object (flexDirection, gap, alignItems, padding, ...). Numbers are density-independent pixels.

## Usage

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: tokens.primary }} />
  <Text style={{ color: tokens.foreground, fontWeight: "600" }}>Two Views in a row</Text>
</View>
```

## Variants

### Column

```tsx
<View style={{ gap: 8, width: 220 }}>
  <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
</View>
```

### Flex sizing

```tsx
<View style={{ flexDirection: "row", gap: 8, width: 260 }}>
  <View style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ flex: 2, height: 32, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.3) }} />
</View>
```

### Padding & border

```tsx
<View style={{ padding: 16, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, width: 240 }}>
  <Text style={{ color: tokens.foreground }}>A padded, bordered box</Text>
</View>
```
