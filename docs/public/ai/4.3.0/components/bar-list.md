# BarList

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/charts/bar-list/bar-list.md`
Human reference: https://canvas.nannier.com/components/bar-list

## Public imports

```tsx
import { BarList } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Ranked label and value rows: each row is a proportional tone wash behind a truncating label, with a right-aligned mono value and an optional delta.

Bars size against the largest row by default (the ranking idiom); `share` sizes them against the sum of the rows and appends percent readouts (the composition idiom). Rows become drill-in buttons with `onPressItem`. For comparing magnitudes on a shared axis without deltas or shares, reach for the bar `Chart` and its `horizontal` mode instead.

## Usage

```tsx
<BarList
  title="Top pages"
  items={[
    { label: "/pricing", value: 18400, delta: "+12%" },
    { label: "/docs", value: 12100, delta: "+4%" },
    { label: "/blog/launch", value: 8700, delta: "-2%", down: true },
  ]}
/>
```

## Variants

### Share of total

```tsx
<BarList
  share
  items={[
    { label: "google", value: 412 },
    { label: "email", value: 318 },
    { label: "github", value: 142 },
  ]}
/>
```

### Drill-in rows

```tsx
<BarList
  onPressItem={() => {}}
  items={[
    { label: "news.ycombinator.com", value: 4210 },
    { label: "reddit.com", value: 2380 },
    { label: "linkedin.com", value: 1240 },
  ]}
/>
```

### Plain, inside a card

```tsx
<Card>
  <BarList
    plain
    items={[
      { label: "Deploys", value: 42 },
      { label: "Rollbacks", value: 3 },
      { label: "Incidents", value: 1 },
    ]}
  />
</Card>
```

## Do & Don't

### BarList

**Do** - Let the component own the whole row anatomy: label, value, delta, and the proportional wash.

```tsx
<BarList
title="Top pages"
items={[
  { label: "/pricing", value: 18400, delta: "+12%" },
  { label: "/docs", value: 12100, delta: "-4%", down: true },
]}
/>
```

**Don't** - A hand-rolled row of Text and colored Views splits the anatomy, drifts from the type scale, and hides its share from assistive tech.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 420, gap: 8 }}>
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <Text>/pricing</Text>
    <Text>18.4k</Text>
  </View>
  <View style={{ height: 3, backgroundColor: tokens.primary, width: "80%" }} />
</View>
```

## Supported props

### BarListProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | BreakdownRow[] | yes |  | The rows to render, in order. |
| title | string \| undefined | no |  | Optional heading shown above the rows. |
| share | boolean \| undefined | no | false | Bars proportional to the sum of all rows, with percent readouts, instead of relative to the largest row. |
| success | boolean \| undefined | no | false | Tone (single-hue lists; pick one; default is the ramp by index). Precedence: success > destructive; a row's chartN slot beats the tone. |
| destructive | boolean \| undefined | no | false | Tone (single-hue lists; pick one; default is the ramp by index). Precedence: success > destructive; a row's chartN slot beats the tone. |
| compact | boolean \| undefined | no | false | Density (omit for the default row spacing). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats row values (data formatting, not styling). |
| onPressItem | ((index: number) => void) \| undefined | no |  | Rows become tappable drill-in targets when set. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
