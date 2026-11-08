# Skeleton

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 10e4f5218789eb98502e14bf201af786b4dfc5252b2e04bd9a8ba05818c58bc8

Source: `src/atoms/skeleton/skeleton.md`
Human reference: https://canvas.nannier.com/components/skeleton

## Public imports

```tsx
import { Skeleton } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Placeholders for loading content.

## Usage

```tsx
<Skeleton animate />
```

## Variants

### Avatar

```tsx
<Skeleton avatar />
```

### Button

```tsx
<Skeleton button />
```

### Card

```tsx
<Skeleton card />
```

### List

```tsx
<Skeleton list />
```

### Table

```tsx
<Skeleton table />
```

## Do & Don't

### text

**Do** — Vary the line widths and shorten the last line so it reads like real wrapped text.

```tsx
<Column snug>
  <Skeleton text animate />
  <Skeleton text animate long />
  <Skeleton text animate short />
</Column>
```

**Don't** — Three full-width lines read as a solid block, not as a paragraph of prose.

```tsx
<View style={{ width: 320, maxWidth: "100%", flexDirection: "column", gap: 6 }}>
  <Skeleton text animate />
  <Skeleton text animate />
  <Skeleton text animate />
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

**Do** — Size the placeholder to the button's real height and width.

```tsx
<Skeleton button animate />
```

**Don't** — An oversized bar overstates a button and the layout jumps when the real control mounts.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 320, maxWidth: "100%", height: 72, borderRadius: 6 }} />
```

### card

**Do** — Mirror the real layout (avatar circle, text lines) so the swap is seamless.

```tsx
<Skeleton card animate />
```

**Don't** — A generic block that ignores the content's shape causes a jarring shift when it loads.

```tsx
<View style={{ backgroundColor: tokens.muted, borderRadius: 6, width: 320, maxWidth: "100%", height: 88 }} />
```

### list

**Do** — Repeat a per-row placeholder so the avatar-and-text rhythm matches the loaded list.

```tsx
<Skeleton list animate />
```

**Don't** — One tall block hides the row rhythm, so the list reflows when each item appears.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 400, maxWidth: "100%", height: 120, borderRadius: 6 }} />
```

### table

**Do** — Lay placeholders out on the real column grid so each cell stays put when it fills in.

```tsx
<Skeleton table animate />
```

**Don't** — A single rectangle gives no column structure; cells shift sideways once data lands.

```tsx
<View style={{ backgroundColor: tokens.muted, width: 400, maxWidth: "100%", height: 120, borderRadius: 6 }} />
```

## Supported props

### SkeletonProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| text | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| avatar | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| button | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| card | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| list | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| table | boolean \| undefined | no | false | Shape (pick one; default is a single text line). |
| small | boolean \| undefined | no | false | Size (pick one). Scales the line height and the avatar/button footprint. |
| large | boolean \| undefined | no | false | Size (pick one). Scales the line height and the avatar/button footprint. |
| long | boolean \| undefined | no | false | A line that runs most of the way across (80%), a mid-paragraph line. |
| short | boolean \| undefined | no | false | A short trailing line (60%), the last line of a paragraph. |
| animate | boolean \| undefined | no | false | Subtle opacity pulse while content loads. |
| accessibilityLabel | string \| undefined | no |  | Screen-reader label announced for the loading placeholder. Defaults to "Loading". The placeholder carries a `progressbar` role + busy state so assistive tech announces the pending content (matching Spinner / Progress). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
