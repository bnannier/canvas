# ActionSheet

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 675fbe581e8b4ad6486d40d1b26a76d0ab3c2910cab444fa77edd63dd809f77b

Source: `src/organisms/action-sheet/action-sheet.md`
Human reference: https://canvas.nannier.com/components/action-sheet

## Public imports

```tsx
import { ActionSheet } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A modal sheet of contextual actions, the iOS action sheet idiom:
a bottom sheet
of choices summoned in response to a user action, over a dimmed scrim that glass
on the web also blurs.

It poses an optional title and message, lists a set of actions (any of which can
be destructive), and offers a Cancel. Selecting an action runs it and closes the
sheet; tapping the scrim or Cancel closes it without acting. Pass a `trigger`
label for a self-contained button that opens the sheet, or drive `open` /
`onOpenChange` yourself. For a small contextual menu anchored to a control,
reach for Dropdown or RowMenu instead.

On the web the sheet is two cards a little off the window's edges: a centered header
over full-width rows in the accent's ink (a destructive one in the error ink), each under
a hairline, and a separate Cancel card.
iOS keeps its Liquid Glass sheet with detached
capsules, and Android the Material 3 bottom sheet with a drag handle and list rows.

iOS accessibility escape and Android system back request cancellation without
running an action.
An open child overlay handles the request first. Disabled
actions do not disable cancellation, and a controlled owner can keep the sheet
open. The visible Cancel row remains available to assistive technology.

## Usage

```tsx
<ActionSheet
  trigger="Add photo"
  actions={[
    { label: "Take Photo", onPress: () => {} },
    { label: "Choose from Library", onPress: () => {} }
  ]}
/>
```

## Variants

### With a title and message

```tsx
<ActionSheet
  trigger="Discard draft…"
  title="Discard draft?"
  message="Your unsaved changes will be lost."
  actions={[
    { label: "Discard Changes", onPress: () => {} },
    { label: "Keep Editing", onPress: () => {} }
  ]}
/>
```

### Destructive action

```tsx
<ActionSheet
  trigger="File options"
  actions={[
    { label: "Move to Folder", onPress: () => {} },
    { label: "Delete File", destructive: true, onPress: () => {} }
  ]}
/>
```

### Disabled action

```tsx
<ActionSheet
  trigger="File options"
  actions={[
    { label: "Save", onPress: () => {} },
    { label: "Save As…", disabled: true, onPress: () => {} }
  ]}
/>
```

### Controlled

```tsx
<Stateful initial={false}>
  {(open, setOpen) => (
    <>
      <Button onPress={() => setOpen(true)}>Share…</Button>
      <ActionSheet
        open={open}
        onOpenChange={setOpen}
        actions={[
          { label: "Copy Link", onPress: () => {} },
          { label: "Send by Email", onPress: () => {} }
        ]}
      />
    </>
  )}
</Stateful>
```

### Open in place

`embedded` draws the sheet open at the foot of its parent over the parent's own dim, for a
specimen or a preview: no modal, no focus trap, no Escape or hardware back, and a dim that
passes touches through. A `trigger` always opens the live modal sheet instead.

```tsx
<ActionSheet
  embedded
  open
  title="Share photo"
  actions={[
    { label: "Copy Link", onPress: () => {} },
    { label: "Send by Email", onPress: () => {} },
    { label: "Print", onPress: () => {}, disabled: true }
  ]}
/>
```

## Do & Don't

### Right tool for the job

**Do** — Use an Action Sheet for a short list of choices triggered by a user action, with the dangerous option marked destructive.

```tsx
<ActionSheet
  trigger="Add photo"
  title="Photo"
  actions={[
    { label: "Take Photo", onPress: () => {} },
    { label: "Choose from Library", onPress: () => {} },
    { label: "Remove Photo", destructive: true, onPress: () => {} },
  ]}
/>
```

**Don't** — Use an Action Sheet for a single yes/no confirmation; an Alert Dialog is the focused tool for that.

```tsx
<ActionSheet
  trigger="Confirm"
  title="Are you sure?"
  actions={[{ label: "OK", onPress: () => {} }]}
/>
```

### Name the action, not a generic verb

**Do** — Label each row with the action it performs (Take Photo, Delete File, Move).

```tsx
<ActionSheet
  trigger="File options"
  actions={[
    { label: "Delete File", destructive: true, onPress: () => {} },
    { label: "Move to Folder", onPress: () => {} },
  ]}
/>
```

**Don't** — Generic labels force the user to re-read the title to know what each row does.

```tsx
<ActionSheet
  trigger="Delete file…"
  title="Delete file?"
  actions={[
    { label: "Yes", destructive: true, onPress: () => {} },
    { label: "No", onPress: () => {} },
  ]}
/>
```

## Supported props

### ActionSheetProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (a `trigger` opens it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (trigger press, scrim tap, Cancel, an action, back/escape). |
| trigger | string \| undefined | no |  | Label for an optional trigger button. When set, the sheet renders the button and opens itself on press (uncontrolled). Omit when you drive `open` yourself. |
| title | string \| undefined | no |  | Optional header title (a left-aligned primary-label heading on iOS, a short centered heading on web, left-aligned on Android). |
| message | string \| undefined | no |  | Optional header message under the title. |
| actions | ActionSheetAction[] | yes |  | The action rows. Each runs its `onPress` then closes the sheet. |
| cancelLabel | string \| undefined | no | "Cancel" | The Cancel row label (default "Cancel"). |
| embedded | boolean \| undefined | no | false | Show the open sheet as a non-modal specimen inside its parent, for a catalogue or a showcase: the stack rests against the parent's bottom edge (the parent gives it its height) over the dim, with no Modal, no rise, no focus trap and no close on Escape, native back or a tap on the dim. Its rows still run their actions. Ignored with `trigger`, which always opens a live sheet. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition for the bottom-anchored stack, composed onto the stack container; not a restyle hook. (The device's bottom safe-area inset is applied automatically, so it clears the home indicator without a manual `paddingBottom`.) |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
