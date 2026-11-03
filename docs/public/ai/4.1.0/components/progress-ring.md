# ProgressRing

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Source: `src/charts/progress-ring/progress-ring.md`
Human reference: https://canvas.nannier.com/components/progress-ring

## Public imports

```tsx
import { ProgressRing } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A full-circle completion ring, the Gauge's sibling: a muted track ring, a tone-colored value arc revealed clockwise from 12 o'clock with rounded caps, the whole-percent readout centered inside, and an optional label below the graphic. The same 0-100 value contract, tone axis, and rounding rules as Gauge, in the circular anatomy that reads as "completion" rather than "level".

## Usage

```tsx
<ProgressRing value={72} label="Complete" />
```

## Variants

### Success tone

```tsx
<ProgressRing value={92} success />
```

### Warning tone

```tsx
<ProgressRing value={81} warning />
```

### Compact

```tsx
<ProgressRing value={72} compact />
```

### Stacked label

`stacked` sets the label under the ring, centred, for a row of rings each named underneath.

```tsx
<ProgressRing value={64} label="Storage" stacked />
```

## Do & Don't

### ProgressRing

**Do** - Put a muted track behind the value arc, the percent readout in the ring's center, and the label below the graphic.

```tsx
<Card padded>
  <Column alignCenter>
    <ProgressRing value={72} label="Complete" />
  </Column>
</Card>
```

**Don't** - A bordered circle with no track and no readout gives no baseline to read the fill against and no exact value.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 200, alignItems: "center" }}>
  <View style={{ borderRadius: 9999, borderWidth: 10, borderColor: tokens.primary, height: 120, width: 120 }} />
</View>
```

## Supported props

### ProgressRingProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | number | yes |  | The value to display, 0-100. |
| label | string \| undefined | no |  | A short caption beneath the number (e.g. "Complete"). |
| primary | boolean \| undefined | no | false | Tone of the value arc (pick one; default primary). Precedence when several are passed: success > warning > destructive (first match wins). |
| success | boolean \| undefined | no | false | Tone of the value arc (pick one; default primary). Precedence when several are passed: success > warning > destructive (first match wins). |
| warning | boolean \| undefined | no | false | Tone of the value arc (pick one; default primary). Precedence when several are passed: success > warning > destructive (first match wins). |
| destructive | boolean \| undefined | no | false | Tone of the value arc (pick one; default primary). Precedence when several are passed: success > warning > destructive (first match wins). |
| compact | boolean \| undefined | no | false | Density (omit for the default 168 ring; compact is 106). |
| stacked | boolean \| undefined | no | false | Set the label under the ring, centred, instead of beside it (a row of rings, each named underneath). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
