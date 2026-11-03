# Pressable

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/atoms/pressable/pressable.md`
Human reference: https://canvas.nannier.com/components/pressable

## Public imports

```tsx
import { InteractionOverride, Pressable } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The touchable primitive: wraps content, fires `onPress`, and exposes the press state to its style for feedback.

The kit's interactive components (Button, plus the tappable Card, Stats, GridList, MediaObject, and StackedList rows) cover the common cases and keep branding consistent, so prefer them; Pressable stays for full flexibility when you need a custom interaction the kit doesn't provide. Its style prop accepts a function of the press state, `({ pressed }) => style`, so you can show press feedback with no extra wrapper; style it with tokens to stay on-brand.

Pass `focusable={false}` for a surface only a pointer should reach, such as a row whose keyboard path is a button inside it: it still presses, and it leaves the tab order on the web too, where react-native-web's own Pressable would keep it a tab stop. A Pressable with the `link` role presses on Enter (and not on Space), as a link does, on the web too: react-native-web's own Pressable leaves that key to the browser, which activates only a link that has an `href`.

## Usage

Wire `onPress` to your own handler. The background dims while the button is held, straight from the `({ pressed }) => style` function.

```tsx
<Pressable style={({ pressed }) => ({ padding: 12, borderRadius: 8, backgroundColor: pressed ? alpha(tokens.primary, 0.8) : tokens.primary })}>
  <Text style={{ color: tokens["primary-foreground"] }}>Press and hold</Text>
</Pressable>
```

## Variants

### Opacity

The style function dims the whole surface to 50% opacity while pressed.

```tsx
<Pressable style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
  <Text style={{ color: tokens.foreground }}>Press and hold</Text>
</Pressable>
```

### Disabled

A disabled Pressable ignores presses.

```tsx
<Pressable disabled style={{ padding: 12, borderRadius: 8, backgroundColor: tokens.muted, opacity: 0.5 }}>
  <Text style={{ color: tokens.foreground }}>Disabled</Text>
</Pressable>
```

## Do & Don't

### Press feedback

**Do**: Answer the press with a style function: `({ pressed }) => style` changes the surface while the finger is down, so the tap visibly lands.

```tsx
<Pressable accessibilityRole="button" style={({ pressed }) => ({ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: pressed ? tokens.accent : tokens.card })}>
  <Typography small>Open the weekly report</Typography>
</Pressable>
```

**Don't**: Give the surface a fixed style; nothing changes under the finger, so a tap feels dropped and a slow response reads as a missed press.

```tsx
<Pressable accessibilityRole="button" style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card }}>
  <Typography small>Open the weekly report</Typography>
</Pressable>
```

### Kit controls first

**Do**: Use the kit's control when one fits the job: a Button already carries the brand fill, press feedback, focus ring, role and disabled state on every platform.

```tsx
<Button primary onPress={() => {}}>Save changes</Button>
```

**Don't**: Rebuild a button from Pressable and a style object; it drifts from the brand the moment the kit's Button changes, and it misses every state the kit draws for you.

```tsx
<Pressable style={({ pressed }) => ({ alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: pressed ? alpha(tokens.primary, 0.8) : tokens.primary })}>
  <Text style={{ color: tokens["primary-foreground"], fontWeight: "600" }}>Save changes</Text>
</Pressable>
```

## Pinned states

`InteractionOverride` pins hover, keyboard focus or the pressed state for every kit control inside it, so a docs specimen or a visual test shows that state without a pointer or a key. Pass `hovered`, `focused` or `pressed` (its `InteractionOverrideProps`); they combine, and passing none gives the subtree back its real states. The kit's Pressable draws its focus ring and reports `pressed` to its style and children functions, the hover primitive reports a hover, and a field shows its focused look, so Button, Input, Checkbox, Switch, Pagination and every other kit control honour it without a prop of their own. It pins the look only: no handler fires, assistive technology hears the control as it is, a disabled control stays at rest, and natively a pinned focus draws no ring, as a real one draws none there. Portaled overlay content keeps its real states.

```tsx
<Row wrap alignCenter cozy>
  <Button outline>Rest</Button>
  <InteractionOverride hovered>
    <Button outline>Hover</Button>
  </InteractionOverride>
  <InteractionOverride focused>
    <Button outline>Focus</Button>
  </InteractionOverride>
  <InteractionOverride pressed>
    <Button outline>Pressed</Button>
  </InteractionOverride>
</Row>
```

## Supported props

### InteractionOverrideProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| hovered | boolean \| undefined | no |  | Every kit control in the subtree renders as if a pointer hovered it. |
| focused | boolean \| undefined | no |  | Every kit control in the subtree renders its keyboard focus (the focus ring, or the field's own focused look). |
| pressed | boolean \| undefined | no |  | Every kit control in the subtree renders as if it were held down. |
| children | ReactNode | no |  | The subtree that resolves the pinned states. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
