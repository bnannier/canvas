# Stepper

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/atoms/stepper/stepper.md`
Human reference: https://canvas.nannier.com/components/stepper

## Public imports

```tsx
import { Stepper } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Increment, decrement, or type a number in a bounded range. A − button, an editable numeric center field, and a + button, controlled by `value` and clamped to `min` / `max` by `step`.
This is the ± numeric control (the iOS UIStepper idiom); for a multi-step progress indicator see Steps.

On the web the control is one 40 px box (32 `small`, 48 `large`) at the control corner with square ± cells and the value in the mono face; on iOS the capsule [ − | + ] pill with the value to its left; on Android Material 3's outlined circular icon buttons around the value.

Pass `label` to title the control from above, `description` for a secondary line under it, and `required` to mark it: the label takes a decorative destructive star, and a screen reader hears the control as required,
from `aria-required` on the web's numeric field and from its name ("Quantity, required") on iOS and Android.

## Usage

```tsx
<Stepper defaultValue={3} max={10} />
```

## Variants

### With label

```tsx
<Stepper label="Quantity" defaultValue={1} min={1} max={9} />
```

### With description

```tsx
<Stepper label="Quantity" description="Up to 10 per order." defaultValue={1} min={1} max={10} />
```

### With suffix

`suffix` sets a unit beside the control, in the subtle ink.

```tsx
<Stepper label="Spacing" suffix="× 4px" defaultValue={2} min={0} max={99} />
```

### Sizes

```tsx
<Row alignCenter relaxed>
  <Stepper small defaultValue={2} max={10} />
  <Stepper defaultValue={2} max={10} />
  <Stepper large defaultValue={2} max={10} />
</Row>
```

### With min / max

```tsx
<Row alignCenter relaxed>
  <Stepper defaultValue={0} min={0} max={5} />
  <Stepper defaultValue={5} min={0} max={5} />
</Row>
```

### Stepped

```tsx
<Stepper defaultValue={20} max={100} step={10} />
```

### Disabled

```tsx
<Stepper disabled defaultValue={4} max={10} />
```

## Do & Don't

### Bounds

**Do**: Set `min` and `max` so the buttons disable at the edges and the value can never leave the valid range.

```tsx
<Stepper label="Quantity" defaultValue={1} min={1} max={9} onChange={() => {}} />
```

**Don't**: Leaving the range unbounded lets the user push the count below zero or past what the form can accept.

```tsx
<Stepper defaultValue={1} onChange={() => {}} />
```

### Step

**Do**: Match `step` to the real increment, so each tap moves the value by an amount that makes sense for the field.

```tsx
<Stepper defaultValue={30} min={0} max={120} step={5} onChange={() => {}} />
```

**Don't**: A step of 1 on a field that only takes round numbers makes the user tap many times to reach a usable value.

```tsx
<Stepper defaultValue={30} min={0} max={120} step={1} onChange={() => {}} />
```

## Supported props

### StepperProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | number \| undefined | no |  | Controlled numeric value (clamped to [min, max] for display); omit for uncontrolled use. |
| defaultValue | number \| undefined | no |  | Initial value for uncontrolled use (a bare <Stepper /> steps out of the box). Default `min`. |
| onChange | ((next: number) => void) \| undefined | no |  | Fired with the next clamped value when buttons, adjustment keys, or direct entry change it (both modes). |
| testID | string \| undefined | no |  | E2E hook forwarded to the group container. |
| min | number \| undefined | no | 0 | Lower bound. Default 0. The − button disables when value <= min. |
| max | number \| undefined | no |  | Upper bound. Default Number.MAX_SAFE_INTEGER. The + button disables when value >= max. |
| step | number \| undefined | no | 1 | Increment/decrement amount for the ± buttons and adjustment keys. Default 1. |
| label | string \| undefined | no |  | The control's persistent, component-owned label. When set it renders as a VISIBLE title ABOVE the ± control (mirroring Input's above-field placement, per-OS type from the skin) and becomes the group's programmatic name (wired via accessibilityLabel + aria-labelledby). When omitted, the control keeps the invisible "Number" accessible-name fallback and renders no visible label, so a bare `<Stepper />` looks exactly as before. |
| description | ReactNode | no |  | Optional muted secondary line rendered under the label (parity with Input). Takes effect only alongside `label`. |
| required | boolean \| undefined | no | false | Marks the control required: appends a destructive "*" to the label (decorative, never in the accessible name) and announces the control as required, through aria-required on the web's numeric field and with the word in its name ("Quantity, required") on iOS and Android. The star takes effect only alongside `label`. |
| suffix | ReactNode | no |  | A unit or note beside the control, 16 px after it on the same line ("× 4px", "items"): a string is set in the 400 13 px subtle ink, a node as it is. Unlike `description`, it reads as part of the value's line. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium control). Precedence: large > small. |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium control). Precedence: large > small. |
| disabled | boolean \| undefined | no | false | State. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<RNTextInput> | no |  | Ref to the underlying React Native host. Supports object refs and callback refs; native methods follow the platform's behavior. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
