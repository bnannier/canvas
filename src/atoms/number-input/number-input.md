# NumberInput

Increment, decrement, or type a number in a bounded range. A − button, an editable numeric center field, and a + button, controlled by `value` and clamped to `min` / `max` by `step`.

## Usage

```tsx
<NumberInput value={3} min={0} max={10} onChange={() => {}} />
```

## Variants

### Sizes

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <NumberInput small value={2} min={0} max={10} onChange={() => {}} />
  <NumberInput value={2} min={0} max={10} onChange={() => {}} />
  <NumberInput large value={2} min={0} max={10} onChange={() => {}} />
</View>
```

### With min / max

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <NumberInput value={0} min={0} max={5} onChange={() => {}} />
  <NumberInput value={5} min={0} max={5} onChange={() => {}} />
</View>
```

### Stepped

```tsx
<NumberInput value={20} min={0} max={100} step={10} onChange={() => {}} />
```

### Disabled

```tsx
<NumberInput disabled value={4} min={0} max={10} onChange={() => {}} />
```

## Do & Don't

### Bounds

**Do** — Set `min` and `max` so the buttons disable at the edges and the value can never leave the valid range.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Quantity</Text>
  <NumberInput value={1} min={1} max={9} onChange={() => {}} />
</View>
```

**Don't** — Leaving the range unbounded lets the user push the count below zero or past what the form can accept.

```tsx
<NumberInput value={1} onChange={() => {}} />
```

### Step

**Do** — Match `step` to the real increment, so each tap moves the value by an amount that makes sense for the field.

```tsx
<NumberInput value={30} min={0} max={120} step={5} onChange={() => {}} />
```

**Don't** — A step of 1 on a field that only takes round numbers makes the user tap many times to reach a usable value.

```tsx
<NumberInput value={30} min={0} max={120} step={1} onChange={() => {}} />
```
