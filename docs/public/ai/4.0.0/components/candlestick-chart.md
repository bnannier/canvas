# CandlestickChart

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/charts/candlestick-chart/candlestick-chart.md`
Human reference: https://canvas.nannier.com/components/candlestick-chart

## Public imports

```tsx
import { CandlestickChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The trading instrument view: OHLC candles colored by direction from the success/destructive tokens, an optional docked volume pane, and optional overlay series (moving averages) in the series tokens. Press or scrub a candle to read its Open/High/Low/Close and volume.

## Usage

```tsx
<CandlestickChart
  title="OLY"
  labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"]}
  candles={[
    { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
    { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
    { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
    { open: 64.2, high: 64.4, low: 64.0, close: 64.2 },
    { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
    { open: 64.4, high: 65.4, low: 63.8, close: 64.4 },
    { open: 64.4, high: 64.5, low: 62.6, close: 63.8 },
    { open: 63.8, high: 65.8, low: 63.6, close: 64.7 },
    { open: 64.7, high: 65.1, low: 63.9, close: 64.6 }
  ]}
  volume={[31, 27, 35, 29, 18, 33, 26, 41, 38, 24]}
/>
```

## Variants

### Compact sessions

```tsx
<CandlestickChart
  compact
  labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"]}
  candles={[
    { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
    { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
    { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
    { open: 64.2, high: 64.4, low: 64.0, close: 64.2 },
    { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
    { open: 64.4, high: 65.4, low: 63.8, close: 64.4 },
    { open: 64.4, high: 64.5, low: 62.6, close: 63.8 },
    { open: 63.8, high: 65.8, low: 63.6, close: 64.7 },
    { open: 64.7, high: 65.1, low: 63.9, close: 64.6 }
  ]}
/>
```

### Dual moving averages

```tsx
<CandlestickChart
  labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"]}
  candles={[
    { open: 99.0, high: 99.3, low: 97.9, close: 98.5 },
    { open: 98.5, high: 99.6, low: 97.2, close: 98.0 },
    { open: 98.0, high: 99.1, low: 97.7, close: 98.6 },
    { open: 98.6, high: 98.6, low: 98.0, close: 98.4 },
    { open: 98.4, high: 99.6, low: 97.0, close: 98.3 },
    { open: 98.3, high: 99.5, low: 97.1, close: 97.9 },
    { open: 97.9, high: 98.3, low: 97.6, close: 97.8 },
    { open: 97.8, high: 98.8, low: 96.5, close: 98.7 },
    { open: 98.7, high: 99.9, low: 97.7, close: 99.3 },
    { open: 99.3, high: 99.5, low: 98.4, close: 99.1 }
  ]}
  overlays={[
    { label: "7-day average", values: [98.2, 98.3, 98.3, 98.5, 98.5, 98.4, 98.2, 98.2, 98.4, 98.5] },
    { label: "21-day average", values: [97.1, 97.2, 97.2, 97.3, 97.4, 97.4, 97.4, 97.5, 97.7, 97.9] }
  ]}
/>
```

### Press to inspect

```tsx
<CandlestickChart
  defaultSelected={5}
  labels={["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"]}
  candles={[
    { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
    { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
    { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
    { open: 64.2, high: 64.4, low: 64.0, close: 64.2 },
    { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
    { open: 64.4, high: 65.4, low: 63.8, close: 64.4 },
    { open: 64.4, high: 64.5, low: 62.6, close: 63.8 },
    { open: 63.8, high: 65.8, low: 63.6, close: 64.7 },
    { open: 64.7, high: 65.1, low: 63.9, close: 64.6 }
  ]}
/>
```

### Legend caption

The legend names Up and Down and each overlay; `legendCaption` adds a note at the end of its row, pushed to the right edge. An overlay marked `dashed` draws dashed.

```tsx
<CandlestickChart
  title="OLY"
  labels={["D1", "D2", "D3", "D4", "D5"]}
  candles={[
    { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
    { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
    { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
    { open: 64.2, high: 64.4, low: 64.0, close: 64.2 }
  ]}
  overlays={[{ label: "MA 3", values: [63.8, 63.7, 63.7, 63.9, 64.0], dashed: true }]}
  legendCaption="1D candles"
/>
```

## Do & Don't

### OHLC data

**Do**: Feed the candles real open, high, low and close prices; each body shows the session's move and each wick its range.

```tsx
<CandlestickChart
  compact
  labels={["D1", "D2", "D3", "D4", "D5", "D6"]}
  candles={[
    { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
    { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
    { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
    { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
    { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
    { open: 64.4, high: 65.4, low: 63.8, close: 65.1 }
  ]}
/>
```

**Don't**: Fill the candles from a close-only series by repeating the close as open, high and low; every candle collapses to a flat tick, and the chart shows less than a line of the closes would.

```tsx
<CandlestickChart
  compact
  labels={["D1", "D2", "D3", "D4", "D5", "D6"]}
  candles={[
    { open: 63.5, high: 63.5, low: 63.5, close: 63.5 },
    { open: 63.9, high: 63.9, low: 63.9, close: 63.9 },
    { open: 63.6, high: 63.6, low: 63.6, close: 63.6 },
    { open: 64.2, high: 64.2, low: 64.2, close: 64.2 },
    { open: 64.4, high: 64.4, low: 64.4, close: 64.4 },
    { open: 65.1, high: 65.1, low: 65.1, close: 65.1 }
  ]}
/>
```

## Supported props

### CandlestickChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| labels | string[] | yes |  | Period labels along the x axis, one per candle. |
| candles | Candle[] | yes |  | One OHLC candle per label. |
| volume | number[] \| undefined | no |  | Optional volume per candle, drawn as a docked pane under the price plot. |
| overlays | ChartSeries[] \| undefined | no |  | Optional overlay series (e.g. moving averages), colored from `chart-2` on (the candles own the status pair and the lead accent), or by an overlay's own `success`/`destructive` tone. A `dashed` overlay draws dashed. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| max | number \| undefined | no |  | Y-axis overrides. Defaults to nice bounds around the lows/highs (not zero-based). |
| min | number \| undefined | no |  |  |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Furniture visibility (the legend names the up and down candles, then the overlays). |
| legendCaption | string \| undefined | no |  | A note at the end of the legend's row, pushed to its right edge (what the colours mean, a data source). |
| hideGrid | boolean \| undefined | no | false |  |
| hideAxes | boolean \| undefined | no | false |  |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels and accessible values (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Scrub-to-inspect: the selected candle index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Scrub-to-inspect: the initially selected candle (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press/scrub selects a candle (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
