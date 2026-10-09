# Pressable

The touchable primitive: wraps content and fires onPress. Its style prop accepts a function of the press state, `({ pressed }) => style`, so you can show press feedback with no extra wrapper. Pass `focusable={false}` for a surface only a pointer should reach, such as a row whose keyboard path is a button inside it: it still presses, and it leaves the tab order on the web too, where react-native-web's own Pressable would keep it a tab stop.

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
