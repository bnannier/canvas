# ServiceHealthList

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: a6fbeb5731557d7d9a75c1ea15f26483ae43566809fb12c2a9add0ca4d3ff9e3

Source: `src/charts/service-health-list/service-health-list.md`
Human reference: https://canvas.nannier.com/components/service-health-list

## Public imports

```tsx
import { ServiceHealthList } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Per-service status rows: a status dot (down > degraded > operational), the service name, an optional right-aligned `detail` such as an uptime percentage, and, when the item carries `periods`, an inline strip of its latest 14 periods beside the detail.

It shares its strip renderer with UptimeBar, so the two never drift. `onPressItem` turns rows into drill-in buttons; `compact` tightens the rows; `plain` strips the card surface for nesting.

`detailed` places the services in one bordered panel, spells out each status and shows its complete history in a separate full-width strip.

## Usage

```tsx
<ServiceHealthList
  title="System status"
  items={[
    { label: "API", detail: "99.98%", periods: Array.from({ length: 45 }, () => ({})) },
    { label: "Dashboard", detail: "99.92%", periods: Array.from({ length: 45 }, (_, i) => (i === 30 ? { degraded: true } : {})), degraded: true },
    { label: "Webhooks", detail: "97.10%", periods: Array.from({ length: 45 }, (_, i) => (i > 40 ? { down: true } : {})), down: true }
  ]}
/>
```

## Variants

### Compact

```tsx
<ServiceHealthList
  compact
  items={[
    { label: "API", detail: "99.98%" },
    { label: "Dashboard", detail: "99.92%", degraded: true },
    { label: "Webhooks", detail: "97.10%", down: true }
  ]}
/>
```

### Drill-in rows

```tsx
<ServiceHealthList
  onPressItem={() => {}}
  items={[
    { label: "API", detail: "99.98%" },
    { label: "Search", detail: "99.95%" },
    { label: "Exports", detail: "99.80%", degraded: true }
  ]}
/>
```

### Plain, inside a card

```tsx
<Card>
  <ServiceHealthList
    plain
    items={[
      { label: "API", detail: "operational" },
      { label: "Dashboard", detail: "degraded", degraded: true }
    ]}
  />
</Card>
```

## Do & Don't

### ServiceHealthList

**Do** - One row per service, with the status carried by the dot, the composed accessible name, and the embedded strip.

```tsx
<ServiceHealthList
title="System status"
items={[
  { label: "API", detail: "99.98%" },
  { label: "Webhooks", detail: "97.10%", down: true },
]}
/>
```

**Don't** - A hand-rolled status row splits the tap target and loses the status from assistive tech.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 480, gap: 8 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: "green" }} />
    <Text>API</Text>
  </View>
</View>
```

## Supported props

### ServiceHealthListProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | ServiceHealthItem[] | yes |  | The services to render, in order. |
| title | string \| undefined | no |  | Optional heading shown above the rows. |
| compact | boolean \| undefined | no | false | Density (omit for the default row insets). |
| detailed | boolean \| undefined | no | false | Bordered status panel with full-width history strips and explicit status labels. |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| onPressItem | ((index: number) => void) \| undefined | no |  | Rows become tappable drill-in targets (open the service) when set. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
