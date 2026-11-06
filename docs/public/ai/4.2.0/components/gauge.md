# Gauge

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 85d17357eddcab1909bcb59630a0c4a1f1513f08d3a6dcf5378eb84c847dee94

Source: `src/charts/gauge/gauge.md`
Human reference: https://canvas.nannier.com/components/gauge

## Public imports

```tsx
import { Gauge } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A semicircular dial: a 180 degree top arc (muted track plus a tone-colored value arc) for a 0-100 value, the percent readout in the open center of the semicircle, and an optional label below the graphic.

## Usage

```tsx
<Gauge value={72} label="Uptime" />
```

## Variants

### Success tone

```tsx
<Gauge value={92} success />
```

### Warning tone

```tsx
<Gauge value={81} warning />
```

### Wide dial

```tsx
<Gauge large value={72} label="of Q4 adoption goal" />
```

## Do & Don't

### Gauge

**Do** — Put a muted track behind the value arc, the percent readout in the semicircle's open center, and the label below the graphic.

```tsx
<Card padded>
  <Column alignCenter>
    <Gauge value={72} label="Uptime" />
  </Column>
</Card>

```

**Don't** — An arc with no track and no number: there is no baseline to read the fill against and no exact value.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 200, alignItems: "center" }}>
  <View style={{ borderRadius: 9999, borderWidth: 8, borderColor: tokens.primary, height: 120, width: 120 }} />
</View>

```

## Supported props

### GaugeProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | number | yes |  | The value to display, 0–100. |
| label | string \| undefined | no |  | A short caption beneath the number (e.g. "Uptime"). |
| primary | boolean \| undefined | no | false | Tone of the fill arc (pick one; default primary). Precedence when several are passed: success > warning > destructive (first match wins). |
| large | boolean \| undefined | no | false | Use the wider 250 px adoption dial. |
| success | boolean \| undefined | no | false |  |
| warning | boolean \| undefined | no | false |  |
| destructive | boolean \| undefined | no | false |  |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
