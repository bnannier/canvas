# AlertDialog

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/molecules/alert-dialog/alert-dialog.md`
Human reference: https://canvas.nannier.com/components/alert-dialog

## Public imports

```tsx
import { AlertDialog } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Catalyst-style confirmation dialog: a centered panel over a dimmed backdrop, which glass on the web also blurs, with a title, description, optional body, and action buttons. Reserve it for decisions that must block the rest of the app.

On the web and Android the panel leads with a tone tile (a trash glyph on the
destructive wash, otherwise an info glyph on the accent's), then a display title over
its description, and closes on two equal buttons: a secondary Cancel and the primary or
destructive confirm.
On iOS it is the system alert: centered text over a two-cell action
row under a hairline, the confirm in the error ink when destructive.

Browser Escape and iOS accessibility escape cancel the dialog,
clear its
confirmation field and request `open=false`. The confirmation text gates only
the confirm action; cancellation remains available while confirm is disabled.
An open child overlay handles dismissal first. A controlled owner can refuse
closure without passing that request to a parent or calling `onConfirm`.

Add `embedded` to show an open alert dialog in a page as a specimen, the way a
catalogue or a showcase does: it keeps its look, its alertdialog role and its
labelling, but it is not modal. It does not take focus when it opens, trap Tab,
return focus, set `aria-modal`, or cancel on Escape or native back, so the page
around it keeps its scroll position and its keyboard order. `embedded` is ignored
with `trigger`, which always opens a live modal.

## Usage

```tsx
<AlertDialog
  title="Delete this identity?"
  description="This permanently removes the identity and revokes any active sessions. This action cannot be undone."
  confirmLabel="Delete"
  destructive
  trigger="Delete identity…"
/>
```

## Variants

### Narrow

```tsx
<AlertDialog
  narrow
  title="Sign out?"
  confirmLabel="Sign out"
  trigger="Sign out…"
/>
```

### Small

```tsx
<AlertDialog
  small
  title="Transfer ownership?"
  description="You will lose admin access to this workspace."
  confirmLabel="Transfer"
  trigger="Transfer ownership…"
/>
```

### Large

```tsx
<AlertDialog
  large
  title="Transfer ownership?"
  description="You will lose admin access to this workspace, and the new owner can remove you from it. Billing, integrations, and the audit history move with the workspace."
  confirmLabel="Transfer"
  trigger="Transfer ownership…"
/>
```

### Body field

`withInput` renders a confirmation field that gates the confirm action: the user
must type the `confirmText` token (default `"DELETE"`) exactly before the confirm
button enables, so it is a real safety check rather than a decorative field. Pass
`confirmText` to require a different token.

```tsx
<AlertDialog
  title="Delete this identity?"
  description="This permanently removes the identity and revokes any active sessions. This action cannot be undone."
  confirmLabel="Delete"
  destructive
  withInput
  trigger="Delete identity…"
/>
```

### Controlled

Drive the open state from outside the dialog: omit `trigger`, own `open` yourself,
and pass `onOpenChange` so every way the dialog closes (confirm, cancel,
browser
Escape or iOS accessibility escape) reports back
and keeps your state in sync. (`Stateful` is a
docs-only state holder; in an app you would hold `open` with `useState`.)

```tsx
<Stateful initial={false}>
  {(open, setOpen) => (
    <Column relaxed>
      <Button onPress={() => setOpen(true)}>Transfer ownership…</Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Transfer ownership?"
        description="You will lose admin access to this workspace."
        confirmLabel="Transfer"
      />
    </Column>
  )}
</Stateful>
```

## Do & Don't

### Reserve the dialog for blocking decisions

**Do** — Use an inline banner or toast for passive feedback; reserve the dialog for decisions that must be confirmed.

```tsx
<Alert success title="Saved" description="Your changes have been saved." />
```

**Don't** — A blocking alert dialog for passive confirmation interrupts the user for no reason.

```tsx
<AlertDialog small title="Saved" description="Your changes have been saved." confirmLabel="OK" trigger="Save changes" />
```

### Name the action on the confirm button

**Do** — Label the confirm button with the verb it performs (Delete, Archive, Sign out).

```tsx
<AlertDialog small destructive title="Delete this identity?" cancelLabel="Cancel" confirmLabel="Delete" trigger="Delete identity…" />
```

**Don't** — Generic Yes / No forces the user to re-read the title to know what they are confirming.

```tsx
<AlertDialog small destructive title="Delete this identity?" cancelLabel="No" confirmLabel="Yes" trigger="Delete identity…" />
```

### xs

**Do** — Reserve xs for a terse one-line question with short button labels and no body content.

```tsx
<AlertDialog narrow destructive title="Remove device?" cancelLabel="Cancel" confirmLabel="Remove" trigger="Remove device…" />
```

**Don't** — A long title, multi-line description, and wordy buttons get cramped in the xs width and wrap awkwardly.

```tsx
<AlertDialog narrow destructive title="Remove this trusted device?" description="It will need to re-authenticate, and any pending background syncs from it will be cancelled the next time it connects." cancelLabel="Cancel" confirmLabel="Remove device" trigger="Remove device…" />
```

### sm

**Do** — Use sm for a single short confirmation with a one-line description; move real forms to a full dialog.

```tsx
<AlertDialog small title="Transfer ownership?" description="You will lose admin access to this workspace." cancelLabel="Cancel" confirmLabel="Transfer" trigger="Transfer ownership…" />
```

**Don't** — Packing a multi-field form into sm makes it feel like a form crammed into a confirmation popup.

```tsx
<View style={{ alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha("#000000", 0.5), padding: 32, minHeight: 200 }}>
  <View style={{ width: 384, maxWidth: "100%", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 24, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] }}>Transfer ownership</Text>
    <View style={{ marginTop: 16, gap: 16 }}>
      <View>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 }}>New owner email</Text>
        <Input placeholder="owner@example.com" />
      </View>
      <View>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 }}>Reason</Text>
        <Input placeholder="Optional note" />
      </View>
      <View>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 }}>Type TRANSFER to confirm</Text>
        <Input placeholder="TRANSFER" />
      </View>
    </View>
    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
      <Button outline small>Cancel</Button>
      <Button primary small>Transfer</Button>
    </View>
  </View>
</View>
```

### md

**Do** — md is the default home for a typical destructive confirm with a sentence or two of description.

```tsx
<AlertDialog destructive title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" trigger="Delete identity…" />
```

**Don't** — Squeezing a description-carrying confirm into a smaller width crowds the copy against the edges.

```tsx
<AlertDialog narrow destructive title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" trigger="Delete identity…" />
```

### lg

**Do** — Reserve lg for dialogs that earn the width: a body field or a longer explanation to read.

```tsx
<AlertDialog large destructive withInput title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" trigger="Delete identity…" />
```

**Don't** — A bare yes/no in lg leaves a wide, empty panel that reads as heavier than the trivial decision it asks for.

```tsx
<AlertDialog large title="Sign out?" cancelLabel="Cancel" confirmLabel="Sign out" trigger="Sign out…" />
```

## Supported props

### AlertDialogProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | Content (strings). |
| description | string \| undefined | no |  | Content (strings). |
| trigger | string \| undefined | no |  | Trigger button label. When set, the dialog renders the button and opens itself on press (uncontrolled). Omit when you drive `open` yourself. |
| confirmLabel | string \| undefined | no | "Continue" | Action labels. |
| cancelLabel | string \| undefined | no | "Cancel" | Action labels. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the trigger opens it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (trigger press, confirm, cancel). |
| narrow | boolean \| undefined | no | false | Width (pick one; default is the medium panel). |
| small | boolean \| undefined | no | false | Width (pick one; default is the medium panel). |
| large | boolean \| undefined | no | false | Width (pick one; default is the medium panel). |
| withInput | boolean \| undefined | no | false | Body: render a confirmation field that gates confirm. The user must type the `confirmText` token (default "DELETE") for the confirm action to enable; until it matches exactly, confirm is disabled and `handleConfirm` is a no-op. This is a real safety gate, not a decorative field. |
| confirmText | string \| undefined | no | "DELETE" | The token the confirmation field must match to enable confirm (default "DELETE"). Only used when `withInput` is set; drives the placeholder ("type DELETE to confirm"), the field's accessible name, and the gate. |
| destructive | boolean \| undefined | no | false | Confirm intent (default is a primary confirm). |
| onConfirm | (() => void) \| undefined | no |  | Action handlers. |
| onCancel | (() => void) \| undefined | no |  | Action handlers. |
| overlay | boolean \| undefined | no | false | Presents the confirm OVER the page instead of inline where it is mounted. The default is a contained overlay, which the docs catalogue needs to show one inside an example stage. An application asking to confirm a destructive action needs the opposite: inline, the scrim appears wherever the component happens to sit, the page behind stays scrollable and clickable, and the dialog still claims `aria-modal`. Teleports into the nearest `OverlayProvider`; with none in the tree it renders in place. |
| embedded | boolean \| undefined | no | false | Show the open dialog as a non-modal specimen in the page, for a catalogue or a showcase: it keeps its look, its alertdialog role and its labelling, but does not take focus when it opens, trap Tab, return focus, claim `aria-modal`, or cancel on Escape or native back. Ignored with `trigger`, which always opens a live modal. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
