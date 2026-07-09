# NumberInput

Increment, decrement, or type a number in a bounded range. A − button, an editable numeric center field, and a + button, controlled by `value` and clamped to `min` / `max` by `step`.

## Usage

```tsx
<NumberInput defaultValue={3} min={0} max={10} onChange={() => {}} />
```

## Variants

### Sizes

```tsx
<Row alignCenter relaxed>
  <NumberInput small defaultValue={2} min={0} max={10} onChange={() => {}} />
  <NumberInput defaultValue={2} min={0} max={10} onChange={() => {}} />
  <NumberInput large defaultValue={2} min={0} max={10} onChange={() => {}} />
</Row>
```

### With min / max

```tsx
<Row alignCenter relaxed>
  <NumberInput defaultValue={0} min={0} max={5} onChange={() => {}} />
  <NumberInput defaultValue={5} min={0} max={5} onChange={() => {}} />
</Row>
```

### Stepped

```tsx
<NumberInput defaultValue={20} min={0} max={100} step={10} onChange={() => {}} />
```

### Disabled

```tsx
<NumberInput disabled defaultValue={4} min={0} max={10} onChange={() => {}} />
```

## Do & Don't

### Bounds

**Do** — Set `min` and `max` so the buttons disable at the edges and the value can never leave the valid range.

```tsx
<Column snug>
  <Typography small medium>Quantity</Typography>
  <NumberInput defaultValue={1} min={1} max={9} onChange={() => {}} />
</Column>
```

**Don't** — Leaving the range unbounded lets the user push the count below zero or past what the form can accept.

```tsx
<NumberInput defaultValue={1} onChange={() => {}} />
```

### Step

**Do** — Match `step` to the real increment, so each tap moves the value by an amount that makes sense for the field.

```tsx
<NumberInput defaultValue={30} min={0} max={120} step={5} onChange={() => {}} />
```

**Don't** — A step of 1 on a field that only takes round numbers makes the user tap many times to reach a usable value.

```tsx
<NumberInput defaultValue={30} min={0} max={120} step={1} onChange={() => {}} />
```
