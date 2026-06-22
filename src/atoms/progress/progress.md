# Progress

A rounded bar that reports how far a task has gotten, or that work is underway.

## Usage

```tsx
<Progress value={0.6} style={{ maxWidth: 320 }} />
```

## Variants

### Determinate

```tsx
<Progress value={0.4} style={{ maxWidth: 320 }} />
```

### Indeterminate

```tsx
<Progress indeterminate style={{ maxWidth: 320 }} />
```

### Size - sm

```tsx
<Progress small value={0.6} style={{ maxWidth: 320 }} />
```

### Size - lg

```tsx
<Progress large value={0.6} style={{ maxWidth: 320 }} />
```

## Do & Don't

### Determinate

**Do** — Use a determinate bar when you know the share of work done, and pair it with a percent or count so the number and the bar agree.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Uploading…</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>72%</Text>
  </View>
  <Progress value={0.72} />
</View>
```

**Don't** — Don't park a determinate bar at a hard-coded value as a decorative divider; a frozen fill reads as a stalled task.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Section</Text>
  <Progress value={0.5} />
</View>
```

### Indeterminate

**Do** — Reach for the indeterminate bar only when the duration is genuinely unknown, so the looping sweep tells users work is happening.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Connecting…</Text>
  <Progress indeterminate />
</View>
```

**Don't** — Don't fake indeterminate progress when you do have a measurable value; a sliding bar over known work hides information you could show.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Step 3 of 4</Text>
  <Progress indeterminate />
</View>
```

### Context

**Do** — Give the bar a width and a label; on its own it carries no meaning, so set its measure with the `style` prop and name the task.

```tsx
<View style={{ maxWidth: 320, gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Importing contacts</Text>
  <Progress value={0.35} />
</View>
```

**Don't** — Don't hand-roll a bar from raw views; the kit's `Progress` already adapts its thickness and ends per platform and stays themed.

```tsx
<View style={{ maxWidth: 320, height: 8, borderRadius: 4, backgroundColor: alpha(tokens.primary, 0.2), overflow: "hidden" }}>
  <View style={{ height: "100%", width: "35%", borderRadius: 4, backgroundColor: tokens.primary }} />
</View>
```
