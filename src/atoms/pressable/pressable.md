# Pressable

The touchable primitive: wraps content and fires onPress. Its style prop accepts a function of the press state, `({ pressed }) => style`, so you can show press feedback with no extra wrapper.

## Usage

Wire `onPress` to your own handler; here it counts each tap. The background also dims while the button is held, straight from the `({ pressed }) => style` function.

```tsx
<Stateful initial={0}>
  {(count, setCount) => (
    <Pressable
      onPress={() => setCount(count + 1)}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "flex-start",
        backgroundColor: pressed ? alpha(tokens.primary, 0.8) : tokens.primary,
      })}
    >
      <Text style={{ color: tokens["primary-foreground"], fontWeight: "600" }}>
        Pressed {count} {count === 1 ? "time" : "times"}
      </Text>
    </Pressable>
  )}
</Stateful>
```

## Variants

### Feedback - opacity

The style function dims the whole surface to 50% opacity while pressed; `onPress` flips the label so each tap leaves a lasting result too.

```tsx
<Stateful initial={false}>
  {(on, setOn) => (
    <Pressable onPress={() => setOn(!on)} style={({ pressed }) => ({ alignSelf: "flex-start", opacity: pressed ? 0.5 : 1 })}>
      <View style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
        <Text style={{ color: tokens.foreground }}>{on ? "On - tap to turn off" : "Off - tap to turn on"}</Text>
      </View>
    </Pressable>
  )}
</Stateful>
```

### Disabled

A disabled Pressable ignores presses. Both buttons below share one counter, but only the enabled one moves it; the disabled one is inert.

```tsx
<Stateful initial={0}>
  {(count, setCount) => (
    <Row snug alignCenter>
      <Pressable onPress={() => setCount(count + 1)} style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: pressed ? alpha(tokens.primary, 0.8) : tokens.primary })}>
        <Text style={{ color: tokens["primary-foreground"], fontWeight: "600" }}>Enabled</Text>
      </Pressable>
      <Pressable disabled onPress={() => setCount(count + 1)} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: tokens.muted, opacity: 0.5 }}>
        <Text style={{ color: tokens.foreground }}>Disabled</Text>
      </Pressable>
      <Text style={{ color: tokens["muted-foreground"] }}>{count} {count === 1 ? "press" : "presses"}</Text>
    </Row>
  )}
</Stateful>
```
