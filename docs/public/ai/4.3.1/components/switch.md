# Switch

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 675fbe581e8b4ad6486d40d1b26a76d0ab3c2910cab444fa77edd63dd809f77b

Source: `src/atoms/switch/switch.md`
Human reference: https://canvas.nannier.com/components/switch

## Public imports

```tsx
import { Switch } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

On / off switch, isolated or grouped in a settings list.

In glass mode a switch keeps its solid look on every platform: it is a small
mark inside content, not a surface, so its track and knob draw as in solid mode,
with no pane and no rim, a checked track in its solid brand fill. The track, the
label, the description and the hit target never move, and the checked state flips
at once. A disabled switch is inert.

`small` and `large` scale the track on the web.
Pass `chip` for a compact toolbar setting: a 32 px bordered capsule with a 26×16 track, a 10 px knob and the label after the switch. The web thumb follows the reference spring and Reduce Motion; native skins keep their own switch.
On iOS and Android the switch is the
platform's own control, which comes in one size (51x31 on iOS, 52x32 on Android), so
the size props leave it unchanged there.

Pass `ref` to access the interactive switch row, including its label. Use `useRef<ComponentRef<typeof Switch>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

On the web, Space activates the focused control on key release, and Enter also activates it. Holding Space does not repeat the change. Moving focus away, disabling the control, or composing text cancels a pending Space press.

## Usage

```tsx
<Switch defaultChecked>Available to chat</Switch>
```

## Variants

### Off

```tsx
<Switch>Available to chat</Switch>
```

### With description

```tsx
<Switch description="Show your availability to teammates.">Available to chat</Switch>
```

### Disabled

```tsx
<Switch disabled>Available to chat</Switch>
```

### Controlled

```tsx
<Stateful initial={true}>
  {(on, setOn) => <Switch checked={on} onChange={setOn}>Notifications</Switch>}
</Stateful>
```

### Settings list

`listed` gives each row a settings list's 10 px above and below, and `divided` rules a hairline above every row after the first, so the stack reads as one list.

```tsx
<Column tight>
  <Switch listed defaultChecked description="Frosted material on panels and sheets">Glass surfaces</Switch>
  <Switch listed divided description="Zero every duration, keep spinners">Reduced motion</Switch>
  <Switch listed divided defaultChecked>Haptics</Switch>
</Column>
```

## Do & Don't

### Off

**Do** — Keep the standard off track, the raised fill inside its `input` edge, so off stays clearly interactive and distinct from a disabled control.

```tsx
<Switch>Two-factor auth</Switch>
```

**Don't** — A washed-out off track reads as disabled, so users can't tell the switch is simply off versus locked.

```tsx
<Pressable style={{ maxWidth: 280, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Two-factor auth</Text>
  <View style={{ position: "relative", flexShrink: 0, borderRadius: 9999, width: 36, height: 20, backgroundColor: alpha(tokens.muted, 0.3) }}>
    <View style={{ position: "absolute", top: 2, left: 2, borderRadius: 9999, width: 16, height: 16, backgroundColor: tokens.muted }} />
  </View>
</Pressable>
```

### On

**Do** — Reserve the on switch for instantly reversible settings; route irreversible actions through a button plus confirmation.

```tsx
<Column cozy alignStart>
  <Switch defaultChecked>Auto-save drafts</Switch>
  <Button destructive small>Delete account…</Button>
</Column>
```

**Don't** — A switch applies instantly; wiring an on toggle to an irreversible action invites accidental, unconfirmed data loss.

```tsx
<Pressable style={{ maxWidth: 280, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["destructive-text"] ?? tokens.destructive }}>Permanently delete account</Text>
  <View style={{ position: "relative", flexShrink: 0, borderRadius: 9999, width: 36, height: 20, backgroundColor: tokens.primary }}>
    <View style={{ position: "absolute", top: 2, right: 2, borderRadius: 9999, width: 16, height: 16, backgroundColor: tokens.background, boxShadow: "0px 20px 44px -24px rgba(121, 100, 214, 0.22)" }} />
  </View>
</Pressable>
```

### Label the setting

**Do** — Label the setting, not the state; the switch communicates on or off.

```tsx
<Switch defaultChecked>Notifications</Switch>
```

**Don't** — An On/Off label duplicates what the switch position already shows.

```tsx
<View style={{ maxWidth: 280, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
  <Text style={{ fontSize: 13 }}>Notifications</Text>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Off</Text>
    <Switch />
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>On</Text>
  </View>
</View>
```

## Supported props

### SwitchProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | boolean \| undefined | no | false | Controlled on/off state; omit for uncontrolled use. |
| defaultChecked | boolean \| undefined | no | false | Initial state for uncontrolled use (a bare <Switch /> is interactive). |
| onChange | ((next: boolean) => void) \| undefined | no |  | Fired with the next checked value when the switch is toggled (both modes). Web keyboard activation supports Space on release and Enter. |
| onValueChange | ((next: boolean) => void) \| undefined | no |  | Alias of onChange, for parity with RN's value-style callbacks. |
| testID | string \| undefined | no |  | E2E hook forwarded to the pressable row. |
| small | boolean \| undefined | no | false | Size (pick one; default is the standard track). The web track scales; iOS and Android draw their platform switch, which comes in one size. |
| large | boolean \| undefined | no | false | Size (pick one; default is the standard track). The web track scales; iOS and Android draw their platform switch, which comes in one size. |
| chip | boolean \| undefined | no | false | A compact bordered capsule with its label after the switch, for a toolbar setting. |
| listed | boolean \| undefined | no | false | A row of a settings list: 10 px above and below the row, so a stack of switches reads as a list rather than a form (stack them in a `Column tight`). Pair with `divided` on every row after the first. |
| divided | boolean \| undefined | no | false | A hairline above the row in the `border` ink: a settings list's separator from the row before. |
| disabled | boolean \| undefined | no | false | State. |
| children | ReactNode | no |  | Optional label, rendered to the left of the track. |
| description | ReactNode | no |  | Optional muted description line, rendered under the label. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the switch when no visible `children` label is rendered (e.g. a switch embedded in an Action Panel whose label sits in sibling Text). Without it, a label-less switch announces only "switch, on/off". |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<View> | no |  | Ref to the interactive switch row, including its label. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
