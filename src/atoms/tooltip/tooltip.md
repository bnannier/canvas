# Tooltip

Small floating helper text on hover or focus.

## Usage

```tsx
<Tooltip label="Open settings" iconTrigger trigger="Hover me" open top />
```

## Variants

### Side - right

```tsx
<Tooltip label="Open settings" iconTrigger trigger="Hover me" open right />
```

### Side - bottom

```tsx
<Tooltip label="Open settings" iconTrigger trigger="Hover me" open bottom />
```

### Side - left

```tsx
<Tooltip label="Open settings" iconTrigger trigger="Hover me" open left />
```

### Trigger - button

```tsx
<Tooltip label="Open settings" trigger="Hover me" open top />
```

### Trigger - text

```tsx
<Tooltip label="Open settings" trigger="hover this text" open top />
```

### Reveal - on hover

```tsx
<Tooltip label="Open settings" iconTrigger trigger="Hover me" top />
```

## Do & Don't

**Do** — Keep tooltips short and supplementary; put essential steps in visible copy.

```tsx
<Tooltip iconTrigger bottom open label="Rotate key" />
```

**Don't** — Long, essential instructions hidden in a tooltip are missed on touch and by screen readers.

```tsx
<Tooltip iconTrigger bottom open label="To rotate this key you must first revoke the old one in Settings, then confirm via email within 24 hours." />
```

### top

**Do** — Leave headroom above (or flip to bottom) so a top-placed tooltip stays fully on screen.

```tsx
<Tooltip trigger="Save" top open label="Saves your changes" />
```

**Don't** — A top tooltip on a trigger near the top edge clips above the viewport and goes unread.

```tsx
<Tooltip trigger="Save" top open label="Saves your changes" />
```

### right

**Do** — Keep room to the right, or flip the tooltip to the left when the trigger hugs the edge.

```tsx
<Tooltip iconTrigger right open label="More info" />
```

**Don't** — A right tooltip on a control flush against the right edge is cut off by the container.

```tsx
<View style={{ alignItems: "flex-end" }}>
  <Tooltip iconTrigger right open label="More info" />
</View>
```

### bottom

**Do** — Give a bottom tooltip clearance so it never overlaps the interactive content below.

```tsx
<Tooltip trigger="Filters" bottom open label="Refine results" />
```

**Don't** — A bottom tooltip sits right on top of the next row, masking the control beneath it.

```tsx
<View style={{ alignItems: "flex-start", gap: 0 }}>
  <Tooltip trigger="Filters" bottom open label="Refine results" />
  <Button outline small style={{ marginTop: -12 }}>Clear all</Button>
</View>
```

### left

**Do** — Reserve space on the left, or flip to the right, so a left-placed tooltip is never cut off.

```tsx
<Tooltip iconTrigger left open label="Need help?" />
```

**Don't** — A left tooltip on a trigger at the left edge is clipped by the container's left boundary.

```tsx
<Tooltip iconTrigger left open label="Need help?" />
```
