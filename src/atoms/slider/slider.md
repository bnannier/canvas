# Slider

Drag (or tap) along a track to pick a value in a range. Controlled by `value`, bounded by `min` / `max`, and snapped to `step`.

## Usage

```tsx
<Slider value={60} min={0} max={100} />
```

## Variants

### Size - sm

```tsx
<Slider small value={40} style={{ maxWidth: 280 }} />
```

### Size - lg

```tsx
<Slider large value={75} style={{ maxWidth: 280 }} />
```

### Stepped

```tsx
<Slider value={6} min={0} max={10} step={2} style={{ maxWidth: 280 }} />
```

### Disabled

```tsx
<Slider disabled value={30} style={{ maxWidth: 280 }} />
```

## Do & Don't

### Range

**Do** — Give the track room to breathe so the thumb has a clear travel path and the value reads at a glance.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Volume</Text>
  <Slider value={65} min={0} max={100} />
</View>
```

**Don't** — Cramming the slider into a tiny width leaves no travel, so the thumb can barely move and the value is hard to set.

```tsx
<View style={{ width: 64 }}>
  <Slider value={65} min={0} max={100} />
</View>
```

### Bounds

**Do** — Pair the slider with its current value so the number is explicit, not just inferred from the thumb position.

```tsx
<View style={{ maxWidth: 320, flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Slider value={48} min={0} max={100} style={{ flex: 1 }} />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"], minWidth: 32, textAlign: "right" }}>48</Text>
</View>
```

**Don't** — A slider with no readout and no label leaves users guessing what the value is and what it controls.

```tsx
<Slider value={48} min={0} max={100} style={{ maxWidth: 320 }} />
```

### State

**Do** — Use the disabled state for values the user cannot change yet; it dims clearly so it does not look interactive.

```tsx
<Slider disabled value={20} min={0} max={100} style={{ maxWidth: 320 }} />
```

**Don't** — Don't fake a disabled slider with a faint inline track; the real `disabled` prop also blocks the gesture and sets accessibility state.

```tsx
<View style={{ maxWidth: 320, height: 20, justifyContent: "center" }}>
  <View style={{ width: "100%", height: 4, borderRadius: 999, backgroundColor: tokens.muted }}>
    <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", borderRadius: 999, backgroundColor: alpha(tokens.primary, 0.4) }} />
  </View>
</View>
```
