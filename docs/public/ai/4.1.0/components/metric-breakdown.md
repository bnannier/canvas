# MetricBreakdown

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 56e9acdcc5d59c74fa11ff4461bc2b20c5a6dee1cb6818caafd94ea390815be0

Source: `src/charts/metric-breakdown/metric-breakdown.md`
Human reference: https://canvas.nannier.com/components/metric-breakdown

## Public imports

```tsx
import { MetricBreakdown } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The decomposed-metric dashboard card: headline value, tone-aware rate, Sparkline trend, per-category share rows, and a chip footer.

It holds a preformatted headline `value` with its caption, an optional secondary `rate` readout under the headline (toned by `rateSuccess`, `rateWarning`, or `rateDestructive`), an optional trend strip drawn by the kit Sparkline at the header's end with a latest-value caption above it, per-category `breakdown` rows with proportional share meters and Stats-style deltas, and a `chips` footer for recent notable codes. Every section is independently optional, so one layout backs OAuth token issuance, API request volume, sign-up sources, and any metric that needs decomposition plus trend in one card.

`detailed` emphasizes the value without repeating its caption, shows a trend arrow beside the rate and places the share rows under a divider. Its spark values are percentages from zero to one hundred; `rateLabel` supplies the period comparison.

## Usage

```tsx
<MetricBreakdown
  value="3,771"
  label="Tokens issued"
  breakdown={[
    { label: "authorization_code", value: 1842, delta: "+12%" },
    { label: "refresh_token", value: 1264, delta: "+4%" },
    { label: "client_credentials", value: 618, delta: "-3%", down: true },
  ]}
/>
```

## Variants

### Rate and trend

```tsx
<MetricBreakdown
  value="25,874"
  label="Requests"
  rate="0.74%"
  rateLabel="4xx + 5xx rate"
  rateSuccess
  spark={[180, 196, 188, 204, 210, 202, 214, 220]}
  sparkUnit="req/s"
/>
```

### Plain, inside a card

```tsx
<Card>
  <MetricBreakdown
    plain
    value="25,874"
    label="Requests"
    breakdown={[
      { label: "GET", value: 18248, delta: "+8%" },
      { label: "POST", value: 6104, delta: "+21%" },
      { label: "PATCH", value: 1212, delta: "-2%", down: true },
    ]}
  />
</Card>
```

### Trend strip without its tag

`hideSparkTag` drops the latest-value tag over the trend strip, when the headline already carries the figure.

```tsx
<MetricBreakdown
  value="$48,210"
  label="Revenue"
  spark={[31, 34, 33, 38, 41, 40, 46, 48]}
  hideSparkTag
/>
```

## Do & Don't

### MetricBreakdown

**Do** - Pass preformatted strings and semantic tone booleans; the card owns the header, trend, rows, and chip anatomy.

```tsx
<MetricBreakdown
value="12.4k"
label="Requests"
rate="0.74%"
rateLabel="Error rate"
rateSuccess
breakdown={[
  { label: "GET", value: 8, delta: "+8%" },
  { label: "POST", value: 4, delta: "+21%" },
]}
/>
```

**Don't** - Rebuilding the header and trend from Text and Sparkline at the call site splits the anatomy the card owns and loses the rows' accessible shares.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 420, gap: 8 }}>
  <Text style={{ fontSize: 22, fontWeight: "600" }}>12.4k</Text>
  <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>REQUESTS</Text>
  <Sparkline line values={[96, 104, 110, 108, 116]} />
</View>
```

## Supported props

### MetricBreakdownProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string | yes |  | The headline figure, preformatted (e.g. "3,771"). |
| label | string | yes |  | Small caption over the headline (e.g. "Tokens issued"). |
| rate | string \| undefined | no |  | Secondary metric, under the headline (e.g. "1.39%"). |
| rateLabel | string \| undefined | no |  | Caption after the rate (e.g. "Error rate"). |
| rateSuccess | boolean \| undefined | no | false | Rate tone (slot-scoped; pick one; default muted). Precedence: rateSuccess > rateWarning > rateDestructive (first match wins). |
| rateWarning | boolean \| undefined | no | false | Rate tone (slot-scoped; pick one; default muted). Precedence: rateSuccess > rateWarning > rateDestructive (first match wins). |
| rateDestructive | boolean \| undefined | no | false | Rate tone (slot-scoped; pick one; default muted). Precedence: rateSuccess > rateWarning > rateDestructive (first match wins). |
| spark | number[] \| undefined | no |  | Trend series rendered as a Sparkline bar strip beside the headline. Needs at least two points to draw. |
| sparkUnit | string \| undefined | no |  | Unit suffix on the latest-value caption (e.g. "req/s"). |
| hideSparkTag | boolean \| undefined | no | false | Hide the latest-value tag over the trend strip (the strip alone, when the headline already carries the figure). |
| breakdown | BreakdownRow[] \| undefined | no |  | Per-category rows with proportional share bars. |
| chips | MetricBreakdownChip[] \| undefined | no |  | Footer chips rendered with the kit Chip (e.g. top error codes). |
| chipsLabel | string \| undefined | no |  | Leading caption on the chip row (e.g. "Errors"). Omit to hide. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats row values and the spark tag (data formatting, not styling). |
| compact | boolean \| undefined | no | false | Density (omit for the default spacing). |
| detailed | boolean \| undefined | no | false | Expanded metric summary with a divided share breakdown and trend annotation. |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
