# Spinner

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 10e4f5218789eb98502e14bf201af786b4dfc5252b2e04bd9a8ba05818c58bc8

Source: `src/atoms/spinner/spinner.md`
Human reference: https://canvas.nannier.com/components/spinner

## Public imports

```tsx
import { Spinner } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Animated loading spinner in three sizes.

## Usage

```tsx
<Spinner />
```

## Variants

### With label

```tsx
<Spinner>Loading…</Spinner>
```

### With description

```tsx
<Spinner description="About 20 seconds">Deploying…</Spinner>
```

### Stacked

```tsx
<Spinner stacked>Working…</Spinner>
```

### Small

```tsx
<Spinner small />
```

### Large

```tsx
<Spinner large />
```

### Primary

```tsx
<Spinner primary />
```

## Do & Don't

### Label

**Do** — Pair longer waits with a short label so the spinner has context.

```tsx
<Spinner small>Loading…</Spinner>
```

**Don't** — A bare spinner with no label leaves users guessing what is happening and for how long.

```tsx
<Spinner />
```

### sm

**Do** — Use the small size inline: inside a button or beside a line of text where its scale matches the type.

```tsx
<Button loading disabled>Saving…</Button>
```

**Don't** — The 4×4 spinner is too small to anchor a full panel; alone in open space it reads as a stray dot.

```tsx
<View style={{ height: 128, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: tokens.border }}>
  <Spinner small />
</View>
```

### default

**Do** — Keep the default square and centered with a label for small content panels and cards.

```tsx
<Card padded>
  <Spinner stacked>Loading…</Spinner>
</Card>
```

**Don't** — Don't stretch it with conflicting width and height; a spinner must stay a perfect circle to spin cleanly.

```tsx
<View style={{ borderRadius: 6, backgroundColor: tokens.muted, padding: 12 }}>
  <View style={{ width: 48, height: 20, borderRadius: 9999, borderWidth: 2, borderColor: tokens.muted, borderTopColor: tokens.foreground }} />
</View>
```

### lg

**Do** — Reserve the large size for section- or page-level loading, centered in the empty content area.

```tsx
<Card style={{ height: 160 }}>
  <Spinner large stacked>Loading dashboard…</Spinner>
</Card>
```

**Don't** — The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 32, borderRadius: 6, paddingHorizontal: 12, backgroundColor: tokens.primary, opacity: 0.5 }}>
  <Spinner large />
</Pressable>
```

## Supported props

### SpinnerProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | Optional label rendered beside (or below) the indicator in the spinner's 500 14 foreground type. Supplying it turns the bare indicator into a component-owned loading pairing, so the caller never hand-composes a Row/Column + Typography beside a <Spinner />. A bare <Spinner /> (no children) is unchanged. |
| description | ReactNode | no |  | Optional muted secondary line rendered under the label (a progress hint, an ETA). Stacks under the label inside the control. |
| stacked | boolean \| undefined | no | false | Layout axis for the label. Omitted/false: the label sits BESIDE the indicator in a snug row (the inline pairing). `stacked`: the indicator sits over a centered label column (the panel / section-loader form). |
| small | boolean \| undefined | no | false | Size (pick one; default sits between small and large). |
| large | boolean \| undefined | no | false | Size (pick one; default sits between small and large). |
| primary | boolean \| undefined | no | false | Tone (pick one; default is the accent). |
| muted | boolean \| undefined | no | false | Tone (pick one; default is the accent). |
| foreground | boolean \| undefined | no | false | Tone (pick one; default is the accent). |
| accessibilityLabel | string \| undefined | no |  | Accessible description of what is loading. When absent, a string label (children) becomes the accessible name; when neither is present it defaults to "Loading". |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
