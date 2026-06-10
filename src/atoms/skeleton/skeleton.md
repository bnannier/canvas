# Skeletons

Placeholders for loading content.

## Usage

```tsx
<Skeleton text animate style={{ width: "60%" }} />
```

## Variants

### Shape - avatar

```tsx
<Skeleton avatar animate />
```

### Shape - button

```tsx
<Skeleton button animate style={{ width: "60%" }} />
```

### Shape - card

```tsx
<Skeleton card animate />
```

### Shape - list

```tsx
<Skeleton list animate />
```

### Shape - table

```tsx
<Skeleton table animate />
```

## Do & Don't

### text

**Do** — Vary the line widths and shorten the last line so it reads like real wrapped text.

```tsx
<View style={{ width: 320, flexDirection: "column", gap: 6 }}>
  <Skeleton text animate style={{ width: "100%" }} />
  <Skeleton text animate style={{ width: "95%" }} />
  <Skeleton text animate style={{ width: "60%" }} />
</View>
```

**Don't** — Three full-width lines read as a solid block, not as a paragraph of prose.

```tsx
<View style={{ width: 320, flexDirection: "column", gap: 6 }}>
  <Skeleton text animate style={{ width: "100%" }} />
  <Skeleton text animate style={{ width: "100%" }} />
  <Skeleton text animate style={{ width: "100%" }} />
</View>
```

### avatar

**Do** — Match the avatar's circle exactly so the photo drops in with no shift.

```tsx
<Skeleton avatar animate />
```

**Don't** — A square placeholder for a round avatar snaps shape the instant the image loads.

```tsx
<View style={{ backgroundColor: tokens.muted, borderRadius: 6, width: 40, height: 40 }} />
```

### button

**Do** — Size the placeholder to the button's real height and width (h-9, content-fit).

```tsx
<Skeleton button animate />
```

**Don't** — An oversized bar overstates a button and the layout jumps when the real control mounts.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 320, height: 72, borderRadius: 6 }} />
```

### card

**Do** — Mirror the real layout (avatar circle, text lines) so the swap is seamless.

```tsx
<Skeleton card animate />
```

**Don't** — A generic block that ignores the content's shape causes a jarring shift when it loads.

```tsx
<View style={{ backgroundColor: tokens.muted, borderRadius: 6, width: 320, height: 88 }} />
```

### list

**Do** — Repeat a per-row placeholder so the avatar-and-text rhythm matches the loaded list.

```tsx
<Skeleton list animate />
```

**Don't** — One tall block hides the row rhythm, so the list reflows when each item appears.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 400, height: 120, borderRadius: 6 }} />
```

### table

**Do** — Lay placeholders out on the real column grid so each cell stays put when it fills in.

```tsx
<Skeleton table animate />
```

**Don't** — A single rectangle gives no column structure; cells shift sideways once data lands.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 400, height: 120, borderRadius: 6 }} />
```
