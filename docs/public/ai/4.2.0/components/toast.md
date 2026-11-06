# Toast

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 85d17357eddcab1909bcb59630a0c4a1f1513f08d3a6dcf5378eb84c847dee94

Source: `src/organisms/toast/toast.md`
Human reference: https://canvas.nannier.com/components/toast

## Public imports

```tsx
import { Toast, ToastProvider, useToast } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A transient notification card. Render a `<Toast>` directly, or drive them imperatively: mount a `<ToastProvider>` near your app root and call `toast(...)` from the `useToast()` hook to enqueue auto-dismissing toasts that stack over the app.

On the web and iOS the toast is a floating card:
the overlay panel at the card corner, up to 380px wide, with the intent glyph in its status color (the accent's sparkle on a neutral toast), a medium message over a muted description, and the action in the accent. A `brief` toast hugs its one line.
Android keeps the Material 3 snackbar on the inverse fill.

For a single brief notification, use `<ToastProvider single brief safeArea duration={2800}
bottomInset={28} horizontalInset={20}>`. New messages replace the current toast and
restart its lifetime. `safeArea` includes the device safe area. `brief` retains a
single line without the dismiss
control; Android retains its snackbar skin.

Tab reaches a toast's action and its dismiss, and Escape dismisses the toast that holds
focus, then returns focus to where it came from. A toast the user is not in never takes
Escape, so the key still reaches the page or the Dialog under it. A provider toast always
answers it (a `brief` one too), a directly rendered `<Toast>` when it has `onDismiss`.
On
iOS the same dismiss answers the accessibility escape (the VoiceOver two-finger scrub,
and Escape under Full Keyboard Access).
Android delivers no Escape key to a view, and
its back gesture is never taken for a toast.

## Usage

Toast is usually driven imperatively: mount a `<ToastProvider>` near your app root, then call the `toast(...)` handle from `useToast()` to enqueue an auto-dismissing card that floats over the app. Press the button to fire one. (`AppScreen` is just this demo's stand-in for your app root, so the toast has a screen to float over.)

```tsx
<AppScreen>
  <ToastProvider>
    <WithToast hook={useToast}>
      {({ toast }) => <Button onPress={() => toast({ message: "Profile updated" })}>Show toast</Button>}
    </WithToast>
  </ToastProvider>
</AppScreen>
```

## Variants

### Rendered directly

```tsx
<Toast message="Your changes were saved" description="They are live for everyone." />
```

### Success

```tsx
<Toast success message="Profile updated" />
```

### Destructive

```tsx
<Toast destructive message="Upload failed" />
```

### Warning

```tsx
<Toast warning message="Storage almost full" />
```

### With an action

```tsx
<Toast message="Message archived" action={{ label: "Undo", onPress: () => {} }} />
```

### Dismissible, informational

```tsx
<Toast info message="A new version is available" onDismiss={() => {}} />
```

## Do & Don't

### One short message

**Do** — Keep a toast to one short, plain message (with an optional one-line description), and pair a destructive or success intent with the matching message.

```tsx
<Toast success message="Copied to clipboard" />
```

**Don't** — Don't crowd a toast with long paragraphs or more than one action; a toast is a glance, not a dialog.

```tsx
<Toast
  message="We were unable to complete your request because the server returned an unexpected error and the operation was rolled back"
/>
```

## Supported props

### ToastProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brief | boolean \| undefined | no | false | A single-line notification pill without extra chrome. |
| message | string | yes |  | The headline line (required). |
| description | string \| undefined | no |  | A secondary line under the message. |
| action | ToastAction \| undefined | no |  | A trailing action button (e.g. Undo). |
| success | boolean \| undefined | no | false | Green success intent (icon + tint). |
| destructive | boolean \| undefined | no | false | Red danger intent (icon + tint). This is the name the intent axis uses across the kit (Button, AlertDialog, and every chart) and the one the design hand-off uses. |
| warning | boolean \| undefined | no | false | Amber warning intent (icon + tint). |
| info | boolean \| undefined | no | false | Brand-tinted informational intent (icon + tint). |
| icon | ReactNode | no |  | Override the auto intent icon; pass any node, or omit to use the intent glyph. |
| onDismiss | (() => void) \| undefined | no |  | When provided, render a trailing dismiss (x) that calls this. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
