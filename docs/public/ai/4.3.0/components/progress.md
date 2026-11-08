# Progress

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/atoms/progress/progress.md`
Human reference: https://canvas.nannier.com/components/progress

## Public imports

```tsx
import { Progress } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Determinate and indeterminate progress bars: a rounded bar that reports how far a task has gotten, or that work is underway.

The bar fills the parent it is given; a step of its own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or a Container step sets its measure.

Name the task with string `children`, or pass `accessibilityLabel` when the visible title is omitted or contains rich content.

`segments` displays a fixed number of discrete 13×5 dashes with three pixels
between them. It uses the same 0–1 `value`, intent fill and accessible percentage.
Indeterminate wins over discrete segments; a labelled segmented meter retains its header.

## Usage

```tsx
<Progress accessibilityLabel="Uploading files" value={0.6} />
```

## Variants

### Labeled

```tsx
<Progress showValue description="3 of 5 files" value={0.6}>Uploading files</Progress>
```

### Status

`status` puts a short word on the title line, in the percent's place and type: what the
bar means now, where `description` is a sentence under the title. It shows while
indeterminate too, and wins the slot over `showValue`.

```tsx
<Progress indeterminate status="indexing">Indexing components</Progress>
```

### Indeterminate

```tsx
<Progress accessibilityLabel="Connecting" indeterminate />
```

### Small

```tsx
<Progress small accessibilityLabel="Uploading files" value={0.6} />
```

### Large

```tsx
<Progress large accessibilityLabel="Uploading files" value={0.6} />
```

### Warning

The tone axis recolors the fill when a metric crosses a soft threshold. Pass `warning` for an
amber bar; the track stays neutral.

```tsx
<Progress warning value={0.85}>Storage used</Progress>
```

### Danger

Pass `danger` for a red bar when a hard limit is exceeded, e.g. a work-in-progress cap. Reinforce
the state with copy, since the tone carries no new accessible value on its own.

```tsx
<Progress danger value={1}>Over the WIP limit</Progress>
```

### Live

The determinate fill eases to each new `value` instead of jumping, so a bar wired to real
progress fills smoothly. (Reduce Motion snaps instead.)

```tsx
<Ticker values={[0, 0.15, 0.4, 0.65, 0.85, 1]}>
  {(value) => (
    <Progress showValue value={value}>Uploading…</Progress>
  )}
</Ticker>
```

### Measure

```tsx
<Column snug>
  <Progress xs start value={0.6}>xs step, pinned to the start (320)</Progress>
  <Progress lg start value={0.6}>lg step, pinned to the start (512)</Progress>
  <Container lg start><Progress value={0.6}>Bare, in an lg Container: fills it (512)</Progress></Container>
</Column>
```

## Do & Don't

### Determinate

**Do** — Use a determinate bar when you know the share of work done, and pass `showValue` so the control renders the percent on the label line; the number and the bar always agree.

```tsx
<Progress showValue value={0.72}>Uploading…</Progress>
```

**Don't** — Don't park a determinate bar at a hard-coded value as a decorative divider; a frozen fill reads as a stalled task.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Section</Text>
  <Progress accessibilityLabel="Section progress" value={0.5} />
</View>
```

### Indeterminate

**Do** — Reach for `indeterminate` only when the duration is genuinely unknown. Pass the label as children;
on the web and Android a short bar sweeps the track; on iOS the control renders the kit Spinner, the platform's unknown-duration idiom (iOS has no linear indeterminate bar).

```tsx
<Progress indeterminate>Connecting…</Progress>
```

**Don't** — Don't fake indeterminate progress when you do have a measurable value;
hiding a known value behind a sweep (or a spinner on iOS) hides information you could show.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Step 3 of 4</Text>
  <Progress accessibilityLabel="Connecting" indeterminate />
</View>
```

### Context

**Do** — Give the bar a label through its own `children`; it fills the parent it is given, and a Container step sets its measure when the layout calls for it.

```tsx
<Progress value={0.35}>Importing contacts</Progress>
```

**Don't** — Don't hand-roll a bar from raw views; the kit's `Progress` already adapts its thickness, ends, and track anatomy per platform and stays themed.

```tsx
<View style={{ width: 320, maxWidth: "100%", height: 8, borderRadius: 4, backgroundColor: alpha(tokens.primary, 0.2), overflow: "hidden" }}>
  <View style={{ height: "100%", width: "35%", borderRadius: 4, backgroundColor: tokens.primary }} />
</View>
```

## Supported props

### ProgressProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | number \| undefined | no |  | Completion as a 0..1 fraction (clamped). Ignored when `indeterminate`. Defaults to 0. |
| segments | number \| undefined | no |  | A fixed number of discrete dashes, filled by the same fractional value. |
| indeterminate | boolean \| undefined | no | false | Indeterminate mode: ignore `value` and animate a sliding bar (a spinner on iOS). |
| children | ReactNode | no |  | Optional title line rendered ABOVE the bar. Supplying it (with or without a `description`/`showValue`) builds the stacked header inside the control, so the caller never hand-composes a Row/Column + Typography around the bar. This is the "components own their label anatomy" contract, mirroring Checkbox/Radio/Switch's `description` slot. |
| description | ReactNode | no |  | Optional muted secondary line rendered under the title. |
| showValue | boolean \| undefined | no | false | Render the percent (derived from `value`) as a right-aligned readout on the title line. Indeterminate has no measurable value, so this renders nothing then. |
| status | ReactNode | no |  | A short status word on the title line, in the percent readout's place and type ("indeterminate", "strong", "paused"): what the bar means right now, where `description` is a sentence under the title. It shows while indeterminate too, and when both are passed the status wins the readout slot over `showValue`. |
| warning | boolean \| undefined | no | false | Tone axis (the active fill color; pick one, default is the call-to-action fill). `warning` paints the bar in the warning color, `danger` in the destructive color, for a metric over a soft threshold or a hard limit (a WIP meter over its cap); the track stays neutral. Pair with copy: the tone adds no accessible value. |
| danger | boolean \| undefined | no | false | Tone axis (the active fill color; pick one, default is the call-to-action fill). `warning` paints the bar in the warning color, `danger` in the destructive color, for a metric over a soft threshold or a hard limit (a WIP meter over its cap); the track stays neutral. Pair with copy: the tone adds no accessible value. |
| small | boolean \| undefined | no | false | Size axis (track thickness; pick one, default is the medium track). |
| large | boolean \| undefined | no | false | Size axis (track thickness; pick one, default is the medium track). |
| accessibilityLabel | string \| undefined | no |  | Accessible description of what is progressing. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
