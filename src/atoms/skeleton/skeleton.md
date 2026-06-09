# Skeletons

Placeholders for loading content.

## Usage

```tsx
<Skeleton text animate className="w-[60%]" />
```

## Do & Don't

### text

**Do** — Vary the line widths and shorten the last line so it reads like real wrapped text.

```tsx
<View className="w-[320px] flex-col gap-1.5">
  <Skeleton text animate className="w-full" />
  <Skeleton text animate className="w-[95%]" />
  <Skeleton text animate className="w-[60%]" />
</View>
```

**Don't** — Three full-width lines read as a solid block, not as a paragraph of prose.

```tsx
<View className="w-[320px] flex-col gap-1.5">
  <Skeleton text animate className="w-full" />
  <Skeleton text animate className="w-full" />
  <Skeleton text animate className="w-full" />
</View>
```

### avatar

**Do** — Match the avatar's circle exactly so the photo drops in with no shift.

```tsx
<Skeleton avatar animate />
```

**Don't** — A square placeholder for a round avatar snaps shape the instant the image loads.

```tsx
<View className="bg-muted animate-pulse rounded-md w-10 h-10" />
```

### button

**Do** — Size the placeholder to the button's real height and width (h-9, content-fit).

```tsx
<Skeleton button animate />
```

**Don't** — An oversized bar overstates a button and the layout jumps when the real control mounts.

```tsx
<View className="bg-muted animate-pulse w-[320px] h-[72px] rounded-md" />
```

### card

**Do** — Mirror the real layout (avatar circle, text lines) so the swap is seamless.

```tsx
<Skeleton card animate />
```

**Don't** — A generic block that ignores the content's shape causes a jarring shift when it loads.

```tsx
<View className="bg-muted animate-pulse rounded-md w-[320px] h-[88px]" />
```

### list

**Do** — Repeat a per-row placeholder so the avatar-and-text rhythm matches the loaded list.

```tsx
<Skeleton list animate />
```

**Don't** — One tall block hides the row rhythm, so the list reflows when each item appears.

```tsx
<View className="bg-muted animate-pulse w-[400px] h-[120px] rounded-md" />
```

### table

**Do** — Lay placeholders out on the real column grid so each cell stays put when it fills in.

```tsx
<Skeleton table animate />
```

**Don't** — A single rectangle gives no column structure; cells shift sideways once data lands.

```tsx
<View className="bg-muted animate-pulse w-[400px] h-[120px] rounded-md" />
```
