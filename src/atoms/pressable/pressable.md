# Pressable

The touchable primitive: wraps content and fires onPress. Its style prop accepts a function of the press state, `({ pressed }) => style`, so you can show press feedback with no extra wrapper.

## Usage

```tsx
<Pressable
  onPress={() => {}}
  style={({ pressed }) => ({
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    backgroundColor: pressed ? alpha(tokens.primary, 0.8) : tokens.primary,
  })}
>
  <Text style={{ color: "#ffffff", fontWeight: "600" }}>Press me</Text>
</Pressable>
```

## Variants

### Feedback - opacity

```tsx
<Pressable onPress={() => {}} style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.5 : 1 })}>
  <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
    <Text style={{ color: tokens.foreground }}>Dims while pressed</Text>
  </View>
</Pressable>
```

### Disabled

```tsx
<Pressable disabled onPress={() => {}} style={{ alignSelf: "flex-start", padding: 12, borderRadius: 8, backgroundColor: tokens.muted, opacity: 0.5 }}>
  <Text style={{ color: tokens.foreground }}>Disabled</Text>
</Pressable>
```
