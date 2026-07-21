# Progress

A rounded bar that reports how far a task has gotten, or that work is underway. The bar renders at the standard field width (320px) and shrinks inside narrower parents; `narrow`, `wide`, and `block` adjust its measure.

## Usage

```tsx
<Progress value={0.6} />
```

## Variants

### Live

The determinate fill eases to each new `value` instead of jumping, so a bar wired to real
progress fills smoothly. (Reduce Motion snaps instead.)

```tsx
<Ticker values={[0, 0.15, 0.4, 0.65, 0.85, 1]}>
  {(value) => (
    <Progress showValue value={value}>Uploading…</Progress>
  )}
</Ticker>
```

### Determinate

```tsx
<Progress value={0.4} />
```

### Indeterminate

```tsx
<Progress indeterminate />
```

### Small

```tsx
<Progress small value={0.6} />
```

### Large

```tsx
<Progress large value={0.6} />
```

### Warning

The tone axis recolors the fill when a metric crosses a soft threshold. Pass `warning` for an
amber bar; the track stays neutral.

```tsx
<Progress warning showValue value={0.85}>Storage used</Progress>
```

### Danger

Pass `danger` for a red bar when a hard limit is exceeded, e.g. a work-in-progress cap. Reinforce
the state with copy, since the tone carries no new accessible value on its own.

```tsx
<Progress danger showValue value={1}>Over the WIP limit</Progress>
```

## Do & Don't

### Determinate

**Do** — Use a determinate bar when you know the share of work done, and pass `showValue` so the control renders the percent on the label line; the number and the bar always agree.

```tsx
<Progress showValue value={0.72}>Uploading…</Progress>
```

**Don't** — Don't park a determinate bar at a hard-coded value as a decorative divider; a frozen fill reads as a stalled task.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Section</Text>
  <Progress value={0.5} />
</View>
```

### Indeterminate

**Do** — Reach for `indeterminate` only when the duration is genuinely unknown. Pass the label as children; on the web and Android a short bar sweeps the track; on iOS the control renders the kit Spinner, the platform's unknown-duration idiom (iOS has no linear indeterminate bar).

```tsx
<Progress indeterminate>Connecting…</Progress>
```

**Don't** — Don't fake indeterminate progress when you do have a measurable value; hiding a known value behind a sweep (or a spinner on iOS) hides information you could show.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Step 3 of 4</Text>
  <Progress indeterminate />
</View>
```

### Context

**Do** — Give the bar a label through its own `children`; it already renders at the standard field width, and `narrow`, `wide`, or `block` adjust its measure when the layout calls for it.

```tsx
<Progress value={0.35}>Importing contacts</Progress>
```

**Don't** — Don't hand-roll a bar from raw views; the kit's `Progress` already adapts its thickness, ends, and track anatomy per platform and stays themed.

```tsx
<View style={{ width: 320, maxWidth: "100%", height: 8, borderRadius: 4, backgroundColor: alpha(tokens.primary, 0.2), overflow: "hidden" }}>
  <View style={{ height: "100%", width: "35%", borderRadius: 4, backgroundColor: tokens.primary }} />
</View>
```
