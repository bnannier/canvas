# Dialog

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/organisms/dialog/dialog.md`
Human reference: https://canvas.nannier.com/components/dialog

## Public imports

```tsx
import { Dialog } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A modal dialog: a centered panel over a dimmed backdrop, which glass on the web also blurs, with a title, an optional description, a body for real content like a form, and right-aligned actions. Use it for a focused task that warrants interrupting the page; reach for the Alert Dialog for a terse yes/no confirmation.

On light glass, the description and currency prefix use the stronger foreground color. For custom body content, use the default `Typography` foreground for message copy over the dimmed background.

Browser Escape and iOS accessibility escape cancel the foremost open child
overlay before the dialog.
Cancelling the dialog calls `onCancel` and requests
`open=false`, including destructive dialogs and dialogs with custom children.
A controlled owner may keep it open; that request never confirms an action.

Pass `dismissible` to let a backdrop press follow the same cancel policy. It is
off by default, so existing dialogs and destructive confirmations keep their
current outside-press behavior. The scrim is excluded from keyboard navigation.

Use `form overlay dismissible` for the original Argus application dialog: a
persistent title and optional `description`, a close action, and scrolling body
and `footer` content. `panelWidth` bounds the form (560 pixels by default), and
the viewport keeps a twenty-pixel safe-area inset. The web treatment preserves
Argus’s 28-pixel content inset, 17-pixel title, rounded card, shadow, and lightly
frosted dim. A form with no trigger contributes no layout wrapper to its caller.
Nested menus receive Escape before the dialog; focus stays in the open modal.

For a conversation or other workspace with its own scroll region, use
`form workspace overlay`. The dialog measures a safe-area-bounded viewport
height; its header and optional `footer` stay fixed while `children` fill the
remaining space. Put the workspace's scrollable content inside `children` and
keep its composer or other controls as siblings of that scroll region. The
workspace body does not add an outer scrollport. `workspaceHeader` adds content
below the title and description in the fixed header, such as a step indicator.
This mode is intended for an overlay form; ordinary forms keep their existing
scrolling body.

Add `compact` to a workspace when short content should determine the panel's
height: `form workspace compact overlay`. The panel hugs the conversation and
composer, then grows up to the same safe-area-bounded viewport maximum. A long
conversation scrolls inside its own thread while the header, composer, and dialog
footer remain visible. The default workspace still fills its available height;
`compact` has no effect without `form workspace`.

Add `embedded` to show an open dialog in a page as a specimen, the way a catalogue
or a showcase does: it keeps its look, its dialog role and its labelling, but it is
not modal. It does not take focus when it opens, trap Tab, return focus, set
`aria-modal`, or cancel on Escape, native back or a backdrop press, so the page
around it keeps its scroll position and its keyboard order. `embedded` is ignored
with `trigger`, which always opens a live modal.

## Usage

```tsx
<Dialog
  trigger="Open dialog"
  title="Refund payment"
  description="The refund posts to the original card in 2 to 3 business days."
  withBody
/>
```

## Variants

### Application form

```tsx
<Dialog form trigger="Edit project" title="Project details" description="Update the project name." footer={<Button primary>Save changes</Button>}>
  <Input label="Name" defaultValue="Platform Core" />
</Dialog>
```


### Banded with an icon

`banded` draws a form dialog in three bands: the header (the `icon`, the title row with
the close and any `workspaceHeader`) over a rule, the body, and the footer under a rule.
`icon` draws its glyph in the accent's soft tile above the title.

```tsx
<Dialog form banded icon={<Icon arrowUpRight decorative />} trigger="Publish" title="Publish release" description="Ship the changes to everyone in the workspace." footer={<Button primary>Publish</Button>}>
  <Input label="Release name" defaultValue="Canvas 4.0" />
</Dialog>
```

### Dismissible

```tsx
<Dialog trigger="Open details" title="Workspace details" dismissible />
```

### Extra small

```tsx
<Dialog trigger="Open dialog" title="Refund payment" xs />
```

### Small

```tsx
<Dialog trigger="Open dialog" title="Refund payment" small />
```

### Medium

```tsx
<Dialog trigger="Open dialog" title="Refund payment" medium />
```

### Large

```tsx
<Dialog trigger="Open dialog" title="Refund payment" large />
```

### Wide

```tsx
<Dialog trigger="Open dialog" title="Refund payment" wide />
```

### Destructive action

```tsx
<Dialog trigger="Delete workspace" title="Delete workspace" destructive confirmLabel="Delete" />
```

## Do & Don't

### When to use

**Do** — Use the Dialog for a focused task with real content, like a short form.

```tsx
<Dialog open embedded large>
  <Column relaxed>
    <Column tight>
      <Typography lead semibold>Edit profile</Typography>
      <Typography>Update how your name and email appear to teammates.</Typography>
    </Column>
    <Column relaxed>
      <Input label="Name" defaultValue="Ada Lovelace" />
      <Input label="Email" defaultValue="ada@example.com" />
    </Column>
    <Row end snug alignCenter>
      <Button outline small>Cancel</Button>
      <Button primary small>Save changes</Button>
    </Row>
  </Column>
</Dialog>
```

**Don't** — A bare yes/no question does not need the roomier Dialog; that is what the Alert Dialog is for.

```tsx
<Dialog open embedded title="Delete file?" small destructive confirmLabel="Delete" cancelLabel="Cancel" />
```

### Description

**Do** — Keep the description to one supporting line; link out for the full policy.

```tsx
<Dialog open embedded title="Refund payment" description="The refund posts to the original card in 2 to 3 business days." medium confirmLabel="Refund" cancelLabel="Cancel" />
```

**Don't** — A multi-sentence policy dump in the description buries the task under reading.

```tsx
<Dialog open embedded title="Refund payment" description="Refunds are processed through the original payment method. Depending on the bank, the amount can take 2 to 3 business days to appear. Partial refunds are supported. Once submitted a refund cannot be cancelled, and the payout for this period will be adjusted on your next statement." medium confirmLabel="Refund" cancelLabel="Cancel" />
```

### Body form

**Do** — Keep the body to the few fields the task needs; send long forms to a full page.

```tsx
<Dialog open embedded large>
  <Column relaxed>
    <Typography lead semibold>Create project</Typography>
    <Column relaxed>
      <Input label="Name" placeholder="Acme website" />
      <Input label="Key" placeholder="ACME" />
    </Column>
    <Row end snug alignCenter>
      <Button outline small>Cancel</Button>
      <Button primary small>Create</Button>
    </Row>
  </Column>
</Dialog>
```

**Don't** — A seven-field form crammed into a small dialog feels like a page stuffed into a popup.

```tsx
<Dialog open embedded small>
  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] }}>Create project</Text>
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 }}>Name</Text>
    <Input accessibilityLabel="Name" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Key</Text>
    <Input accessibilityLabel="Key" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Description</Text>
    <Input accessibilityLabel="Description" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Lead</Text>
    <Input accessibilityLabel="Lead" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Team</Text>
    <Input accessibilityLabel="Team" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Visibility</Text>
    <Input accessibilityLabel="Visibility" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6, marginTop: 12 }}>Template</Text>
    <Input accessibilityLabel="Template" />
  </View>
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
    <Button outline small>Cancel</Button>
    <Button primary small>Create</Button>
  </View>
</Dialog>
```

### Actions

**Do** — One primary plus quieter secondaries, right-aligned and labeled with their verb.

```tsx
<Dialog open embedded medium>
  <Column relaxed>
    <Column tight>
      <Typography lead semibold>Unsaved changes</Typography>
      <Typography>You have edits that are not saved.</Typography>
    </Column>
    <Row end snug alignCenter wrap>
      <Button ghost small>Discard</Button>
      <Button outline small>Keep editing</Button>
      <Button primary small>Save</Button>
    </Row>
  </Column>
</Dialog>
```

**Don't** — Three look-alike primary buttons give no signal about the default, safe choice.

```tsx
<Dialog open embedded medium>
  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] }}>Unsaved changes</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"], marginTop: 8 }}>You have edits that are not saved.</Text>
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
    <Button primary small>Save</Button>
    <Button primary small>Discard</Button>
    <Button primary small>Keep editing</Button>
  </View>
</Dialog>
```

### Destructive action

**Do** — Reserve the destructive tone for the irreversible action it names.

```tsx
<Dialog open embedded title="Delete workspace" description="This removes all projects and cannot be undone." medium destructive confirmLabel="Delete" cancelLabel="Cancel" />
```

**Don't** — A red button on a routine Save trains users to ignore the colour that should mean danger.

```tsx
<Dialog open embedded title="Save changes" description="Update the profile with your edits." medium destructive confirmLabel="Save" cancelLabel="Cancel" />
```

### Size

**Do** — Size the dialog to its content: a single field belongs in xs or sm.

```tsx
<Dialog open embedded small>
  <Column relaxed>
    <Typography lead semibold>Rename</Typography>
    <Input label="Name" defaultValue="Untitled" />
    <Row end snug alignCenter>
      <Button outline small>Cancel</Button>
      <Button primary small>Save</Button>
    </Row>
  </Column>
</Dialog>
```

**Don't** — A 2xl panel around a single field leaves a vast empty expanse beside the input.

```tsx
<Dialog open embedded wide>
  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] }}>Rename</Text>
  <View style={{ marginTop: 20 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, marginBottom: 6 }}>Name</Text>
    <Input accessibilityLabel="Name" value="Untitled" />
  </View>
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
    <Button outline small>Cancel</Button>
    <Button primary small>Save</Button>
  </View>
</Dialog>
```

## Supported props

### DialogProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| form | boolean \| undefined | no | false | Structured form: a named header and close action above scrolling body/footer content. |
| workspace | boolean \| undefined | no | false | Give an overlay form a viewport-bounded body that fills between its fixed header and footer. |
| compact | boolean \| undefined | no | false | Let a workspace hug short content and grow only up to its viewport bound. |
| workspaceHeader | ReactNode | no |  | Extra content in the fixed header of a workspace form, below its title and description. |
| headerAccessory | ReactNode | no |  | Content beside the form title, such as a workflow's progress status. |
| workspaceSidebar | ReactNode | no |  | A fixed side rail beside a workspace's scrolling body. |
| footer | ReactNode | no |  | Custom actions after the form body; fixed below the body in workspace mode. |
| banded | boolean \| undefined | no | false | Draw the reference's shared workflow panel as three bands split by hairline rules: the header (title, `headerAccessory` and optional `workspaceHeader`), body, and footer. A `workspaceSidebar` stays beside the body. Embedded panels keep their opaque in-page surface without a veil or close action; live panels keep modal presentation. |
| icon | ReactNode | no |  | A leading glyph for the panel, drawn as the accent's soft tone tile (`Emblem primary soft`) above the title. Pass an `<Icon />`; the tile tints and sizes it. |
| panelWidth | number \| undefined | no |  | Maximum form panel width in pixels; defaults to 560. |
| children | ReactNode | no |  |  |
| title | string \| undefined | no |  | Content (strings, for the children-less / data-driven case). |
| description | string \| undefined | no |  | Content (strings, for the children-less / data-driven case). |
| withBody | boolean \| undefined | no | false | Body: render a short form (Amount + Reason fields) inside the panel for the data-driven case. |
| trigger | string \| undefined | no |  | Trigger button label. When set, the dialog renders the button and opens itself on press (uncontrolled). Omit when you drive `open` yourself. |
| confirmLabel | string \| undefined | no | "Confirm" | Action labels. |
| cancelLabel | string \| undefined | no | "Cancel" | Action labels. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the trigger opens it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (trigger press, confirm, cancel). |
| destructive | boolean \| undefined | no | false | Confirm intent (default is a primary confirm). |
| xs | boolean \| undefined | no | false | Width (pick one; default is the standard panel width). First-match precedence: xs, small, medium, large, wide. |
| small | boolean \| undefined | no | false | Width (pick one; default is the standard panel width). First-match precedence: xs, small, medium, large, wide. |
| medium | boolean \| undefined | no | false | Width (pick one; default is the standard panel width). First-match precedence: xs, small, medium, large, wide. |
| large | boolean \| undefined | no | false | Width (pick one; default is the standard panel width). First-match precedence: xs, small, medium, large, wide. |
| wide | boolean \| undefined | no | false | Width (pick one; default is the standard panel width). First-match precedence: xs, small, medium, large, wide. |
| onConfirm | (() => void) \| undefined | no |  | Action handlers. |
| onCancel | (() => void) \| undefined | no |  | Action handlers. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| overlay | boolean \| undefined | no | false | Presents the dialog OVER the page instead of inline where it is mounted. The default is a contained overlay: a scrim with its own height, sitting in normal flow, which is what the docs catalogue needs to show a dialog inside an example stage. An application confirming a destructive action needs the opposite, and the inline form is actively wrong there: it appends a scrim wherever the component happens to sit, leaves the page behind scrollable and clickable, and still claims `aria-modal`. With `overlay`, the dialog teleports into the nearest `OverlayProvider` and fills it, so `aria-modal` becomes true rather than aspirational. Mount an `OverlayProvider` at the app root for this to cover the screen. |
| dismissible | boolean \| undefined | no | false | Cancel when the backdrop is pressed. Off by default, including destructive dialogs. |
| embedded | boolean \| undefined | no | false | Show the open dialog as a non-modal specimen in the page, for a catalogue or a showcase: it keeps its look, its dialog role and its labelling, but does not take focus when it opens, trap Tab, return focus, claim `aria-modal`, or cancel on Escape, native back or a backdrop press. Ignored with `trigger`, which always opens a live modal. |
| accessibilityLabel | string \| undefined | no |  | The dialog's accessible name, for the case where `children` supply the panel body. Children REPLACE the built-in title/description, so there is no element left for `aria-labelledby` to point at, and the dialog would otherwise be announced with no name at all. That is merely poor for a `dialog` and invalid for the `alertdialog` a destructive confirm renders. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
