# Slider

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/atoms/slider/slider.md`
Human reference: https://canvas.nannier.com/components/slider

## Public imports

```tsx
import { Slider } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Drag (or tap) along a track to pick a value in a range; the keyboard and screen readers step it too. Controlled by `value`, bounded by `min` / `max`, and snapped to `step`.

Like the other input-like controls, a slider fills the parent it is given; a step of its own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or a Container step sets its measure.

Pass `ref` to access the interactive adjustable track, including when a header is shown. Use `useRef<ComponentRef<typeof Slider>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

Name the setting with string `children`, or pass `accessibilityLabel` when the visible title is omitted or contains rich content.

## Usage

```tsx
<Slider accessibilityLabel="Volume" defaultValue={60} />
```

In glass mode the handle is a control-layer glass knob whose position is the
authoritative value at every frame (a controlled value or a release can never
lag behind the rail). Tapping the track puts the handle on the tapped value at
once. The rail, the filled range, the value label and the hit target stay
fixed. A disabled slider is inert; solid mode keeps the skin's own handle.

On iOS 26 the handle is a real Apple Liquid Glass control, with the material's edge-lensing and specular showing on a physical device. This is automatic from the glass surface, the platform default there, so there is no prop to set; under a solid surface, Reduce Transparency, or Increase Contrast the handle falls back to a solid knob.
The Android and web handles keep their own look: on the web a 20 px white thumb (16 `small`, 26 `large`) on a 6 px rail (4, 8) whose accent range glows, ringed in the accent's soft wash while a pointer hovers or presses it, under a 13 px title with the value in the mono face; on Android Material 3 Expressive's split 16dp track (24dp `large`) and 4dp bar handle.

## Variants

### With label

```tsx
<Slider defaultValue={65}>Volume</Slider>
```

### With description

```tsx
<Slider defaultValue={40} description="Applies to alert sounds.">Volume</Slider>
```

### Small

```tsx
<Slider small accessibilityLabel="Volume" defaultValue={40} />
```

### Large

```tsx
<Slider large accessibilityLabel="Volume" defaultValue={75} />
```

### Stepped

```tsx
<Slider accessibilityLabel="Playback speed" defaultValue={6} max={10} step={2} />
```

### Percent and scale

`percent` reads the value as a percentage (the readout and the announced value), and `scale` draws the minimum, the midpoint and the maximum under the rail.

```tsx
<Slider percent scale showValue defaultValue={62}>Glass intensity</Slider>
```

### Disabled

```tsx
<Slider disabled accessibilityLabel="Volume" defaultValue={30} />
```

### Measure

```tsx
<Column>
  <Slider xs start defaultValue={40}>xs step, pinned to the start (320)</Slider>
  <Slider lg start defaultValue={40}>lg step, pinned to the start (512)</Slider>
  <Container lg start><Slider defaultValue={40}>Bare, in an lg Container: fills it (512)</Slider></Container>
</Column>
```

## Do & Don't

### Range

**Do**: Give the track room to breathe so the thumb has a clear travel path and the value reads at a glance. Pass the label as `children`; the slider owns the title above the rail.

```tsx
<Slider defaultValue={65} min={0} max={100}>Volume</Slider>
```

**Don't**: Cramming the slider into a tiny width leaves no travel, so the thumb can barely move and the value is hard to set.

```tsx
<View style={{ width: 64 }}>
  <Slider accessibilityLabel="Volume" defaultValue={65} min={0} max={100} />
</View>
```

### Bounds

**Do**: Pair the slider with its current value so the number is explicit, not just inferred from the thumb position. `showValue` renders the live readout above the track.

```tsx
<Slider showValue defaultValue={48} min={0} max={100}>Volume</Slider>
```

**Don't**: A slider with no readout and no visible label leaves users guessing what the value is and what it controls.

```tsx
<Slider accessibilityLabel="Volume" defaultValue={48} min={0} max={100} />
```

### State

**Do**: Use the disabled state for values the user cannot change yet; it dims clearly so it does not look interactive.

```tsx
<Slider disabled accessibilityLabel="Volume" defaultValue={20} min={0} max={100} />
```

**Don't**: Don't fake a disabled slider with a faint inline track; the real `disabled` prop also blocks the gesture and sets accessibility state.

```tsx
<View style={{ width: 320, maxWidth: "100%", height: 20, justifyContent: "center" }}>
  <View style={{ width: "100%", height: 4, borderRadius: 999, backgroundColor: tokens.muted }}>
    <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", borderRadius: 999, backgroundColor: alpha(tokens.primary, 0.4) }} />
  </View>
</View>
```

### Keyboard

**Do**: Name the slider and let it take keyboard focus. Tab lands on it and its thumb wears the kit's 2 px focus ring in the theme's `ring` colour, over the glass knob too; the arrows, Page Up, Page Down, Home and End then set the value. A click shows no ring.

```tsx
<Slider accessibilityLabel="Volume" defaultValue={48} min={0} max={100} />
```

**Don't**: Leave the slider unnamed. It still takes focus and shows the ring, but a screen reader announces a bare number with nothing to say what it sets.

```tsx
<Slider defaultValue={48} min={0} max={100} />
```

## Supported props

### SliderProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | number \| undefined | no |  | Controlled value; omit for uncontrolled use. The thumb sits at this value (clamped to [min, max]). |
| defaultValue | number \| undefined | no |  | Initial value for uncontrolled use (a bare <Slider/> drags out of the box). Default `min`. |
| min | number \| undefined | no | 0 | Lower bound of the range. Default 0. |
| max | number \| undefined | no | 100 | Upper bound of the range. Default 100. |
| step | number \| undefined | no | 1 | Snap increment. Default 1. Set to a fraction for finer control. |
| onChange | ((value: number) => void) \| undefined | no |  | Fired with the next (clamped, snapped) value as the thumb is dragged or the track tapped (both modes). |
| testID | string \| undefined | no |  | E2E hook forwarded to the slider container. |
| children | ReactNode | no |  | The title line, rendered ABOVE the track (a slider's label sits above the rail, not beside it). Supplying it builds the component-owned header so the caller never hand-composes a Column + Typography above a bare slider, and the visible title also names the control for assistive tech (see `accessibilityLabel`). |
| description | ReactNode | no |  | Optional muted secondary line rendered under the title, for a hint or unit note. |
| showValue | boolean \| undefined | no | false | Render the live current value (the same value the thumb sits at) as a trailing readout on the title line, right-aligned. With no title it still renders the value as a standalone trailing readout above the track. The number tracks the drag in real time and uses tabular figures so it does not jitter. |
| percent | boolean \| undefined | no | false | The value is a percentage: the `showValue` readout prints it with a percent sign ("62%") and assistive tech hears it so. Pair with the default 0 to 100 range. |
| scale | boolean \| undefined | no | false | A scale under the track: the minimum, the middle and the maximum, spread across the track's width in the small mono meta type, 8 px below the rail. |
| small | boolean \| undefined | no | false | Size (pick one; default is the standard track + thumb). |
| large | boolean \| undefined | no | false | Size (pick one; default is the standard track + thumb). |
| disabled | boolean \| undefined | no | false | State. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the slider (e.g. "Volume"). |
| style | LayoutStyle | no |  | Extra style on the slider container, applied last. |
| ref | React.Ref<View> | no |  | Ref to the interactive adjustable track, including when a header is shown. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |
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

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
