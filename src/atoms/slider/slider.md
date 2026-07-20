# Slider

Drag (or tap) along a track to pick a value in a range. Controlled by `value`, bounded by `min` / `max`, and snapped to `step`. Like the other input-like controls, a bare slider renders at the standard field width; `narrow` / `wide` pick the other widths and `block` fills the container.

## Usage

```tsx
<Slider defaultValue={60} min={0} max={100} />
```

## Variants

### Size - sm

```tsx
<Slider small defaultValue={40} />
```

### Size - lg

```tsx
<Slider large defaultValue={75} />
```

### Stepped

```tsx
<Slider defaultValue={6} min={0} max={10} step={2} />
```

### Disabled

```tsx
<Slider disabled defaultValue={30} />
```

## Do & Don't

### Range

**Do** — Give the track room to breathe so the thumb has a clear travel path and the value reads at a glance. Pass the label as `children`; the slider owns the title above the rail.

```tsx
<Slider defaultValue={65} min={0} max={100}>Volume</Slider>
```

**Don't** — Cramming the slider into a tiny width leaves no travel, so the thumb can barely move and the value is hard to set.

```tsx
<View style={{ width: 64 }}>
  <Slider defaultValue={65} min={0} max={100} />
</View>
```

### Bounds

**Do** — Pair the slider with its current value so the number is explicit, not just inferred from the thumb position. `showValue` renders the live readout above the track.

```tsx
<Slider showValue narrow defaultValue={48} min={0} max={100} />
```

**Don't** — A slider with no readout and no label leaves users guessing what the value is and what it controls.

```tsx
<Slider defaultValue={48} min={0} max={100} />
```

### State

**Do** — Use the disabled state for values the user cannot change yet; it dims clearly so it does not look interactive.

```tsx
<Slider disabled defaultValue={20} min={0} max={100} />
```

**Don't** — Don't fake a disabled slider with a faint inline track; the real `disabled` prop also blocks the gesture and sets accessibility state.

```tsx
<View style={{ width: 320, height: 20, justifyContent: "center" }}>
  <View style={{ width: "100%", height: 4, borderRadius: 999, backgroundColor: tokens.muted }}>
    <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", borderRadius: 999, backgroundColor: alpha(tokens.primary, 0.4) }} />
  </View>
</View>
```
