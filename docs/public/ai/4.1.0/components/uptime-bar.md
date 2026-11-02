# UptimeBar

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4e9a344e7cf8e99f7847528281f6c8f82eec5f1dd2864f552950f6404318c1a5

Source: `src/charts/uptime-bar/uptime-bar.md`
Human reference: https://canvas.nannier.com/components/uptime-bar

## Public imports

```tsx
import { UptimeBar } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The statuspage strip: per-period status pills (operational, degraded, down, unknown) with a summary caption and edge labels.

The pills run in a single row, oldest on the left, colored operational green, degraded amber, down red, or unknown muted (precedence down > degraded > unknown; an unmarked period is operational). An optional `caption` summarizes the strip above it, and `startLabel`/`endLabel` caption the physical edges below. The strip is a time axis, so it keeps left-to-right ordering in every locale, and its accessible name tallies every status.

`detailed` uses a display header, taller history marks and neutral unknown periods. Hovering a period expands it with an overshooting transition; Reduced Motion keeps it still.

## Usage

```tsx
<UptimeBar
  label="API uptime"
  caption="99.98% uptime"
  startLabel="90 days ago"
  endLabel="Today"
  periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : i === 78 ? { degraded: true } : {}))}
/>
```

## Variants

### Compact

```tsx
<UptimeBar
label="CDN uptime"
compact
periods={Array.from({ length: 60 }, (_, i) => (i === 40 ? { degraded: true } : {}))}
/>
```

### With unknown periods

```tsx
<UptimeBar
  label="Worker uptime"
  periods={Array.from({ length: 30 }, (_, i) => (i < 6 ? { unknown: true } : {}))}
/>
```

### Middle caption

`midLabel` captions the middle of the strip, centred between the edge captions.

```tsx
<UptimeBar
  label="API uptime"
  startLabel="90 days ago"
  midLabel="45 days"
  endLabel="Today"
  periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : {}))}
/>
```

### Detailed

A display header and taller marks for a status overview. A resting pointer expands its period; Reduced Motion keeps the marks still.

```tsx
<UptimeBar
  detailed
  label="API uptime"
  caption="99.94% uptime"
  startLabel="60 days ago"
  endLabel="Today"
  periods={Array.from({ length: 60 }, (_, i) => ({
    label: `Day ${i + 1}`,
    degraded: i === 17 || i === 41,
    down: i === 52,
    unknown: i === 3
  }))}
/>
```

## Do & Don't

### UptimeBar

**Do** - Let the strip carry the whole anatomy: pills, summary caption, and edge labels, with the status tally in its accessible name.

```tsx
<UptimeBar
label="API uptime"
caption="99.98% uptime"
startLabel="90 days ago"
endLabel="Today"
periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : {}))}
/>
```

**Don't** - A hand-rolled row of colored Views has no accessible tally and no edge-caption anatomy.

```tsx
<View style={{ flexDirection: "row", gap: 2, maxWidth: 480 }}>
  {Array.from({ length: 90 }, (_, i) => (
    <View key={i} style={{ flex: 1, height: 24, borderRadius: 2, backgroundColor: i === 61 ? "red" : "green" }} />
  ))}
</View>
```

## Supported props

### UptimeBarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| periods | UptimePeriod[] | yes |  | The periods to render, oldest first; each becomes one pill. |
| label | string \| undefined | no |  | What the strip measures (e.g. "API"); shown in the header and leading the accessible name. |
| caption | string \| undefined | no |  | A summary at the header's right (e.g. "99.98% uptime"). |
| startLabel | string \| undefined | no |  | Caption under the strip's left (oldest) edge (e.g. "90 days ago"). |
| endLabel | string \| undefined | no |  | Caption under the strip's right (latest) edge (e.g. "Today"). |
| midLabel | string \| undefined | no |  | Caption centred under the strip, between the edge captions (e.g. "1 incident · 2 degraded days"). |
| compact | boolean \| undefined | no | false | Density (omit for the default pill height). |
| detailed | boolean \| undefined | no | false | Display header and taller history marks for a status overview. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
