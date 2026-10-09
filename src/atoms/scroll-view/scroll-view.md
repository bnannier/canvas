# ScrollView

A scrollable container for content larger than its bounds. Unlike a plain View (which clips overflow), a ScrollView lets its children exceed its size and scroll. Vertical by default; pass `horizontal` for a row. Style the frame with `style` and the inner content with `contentContainerStyle`.

## Usage

```tsx
<ScrollView style={{ height: 176, width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 12 }}>
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
</ScrollView>
```

## Variants

### Horizontal

```tsx
<ScrollView horizontal style={{ width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 12 }}>
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
</ScrollView>
```

## Do & Don't

### Bounded height

**Do**: Give the ScrollView a bounded height, its own or its parent's; the content past that edge scrolls inside it.

```tsx
<ScrollView style={{ height: 120, width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 8 }}>
  <Typography small>Deploy started</Typography>
  <Typography small>Dependencies restored from cache</Typography>
  <Typography small>Tests passed</Typography>
  <Typography small>Image pushed to the registry</Typography>
  <Typography small>Rollout reached half the fleet</Typography>
  <Typography small>Rollout complete</Typography>
</ScrollView>
```

**Don't**: Leave the height to the content; an unbounded ScrollView grows to fit all of it, so nothing scrolls and the page grows instead.

```tsx
<ScrollView style={{ width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 8 }}>
  <Typography small>Deploy started</Typography>
  <Typography small>Dependencies restored from cache</Typography>
  <Typography small>Tests passed</Typography>
  <Typography small>Image pushed to the registry</Typography>
  <Typography small>Rollout reached half the fleet</Typography>
  <Typography small>Rollout complete</Typography>
</ScrollView>
```
