# ActionPanel

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/molecules/action-panels/action-panels.md`
Human reference: https://canvas.nannier.com/components/action-panels

## Public imports

```tsx
import { ActionPanel } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Section panel with headline, body text, and one action. Used to surface a single decision or call-to-action.

The panel is the v4 hand-off's on every platform (no platform ships an action panel): an 18 px inset at the card corner on a hairline over the card fill, a 600 15 title over a 13 px muted description. The action is an outline Button; `destructive` washes the panel in the danger tint, edges it in the destructive colour and makes the action destructive; `inline` pins the action beside the copy, wrapping it underneath when the panel is narrow. Embedded `children` sit under the copy, and the Button then closes the panel on the right as the primary action that commits them.

## Usage

The panel's single action fires `onAction`; wire it to your own handler and every
press runs it.

```tsx
<ActionPanel
  title="Export your data"
  description="Download everything in this workspace as a ZIP archive."
  actionLabel="Export"
/>
```

## Variants

### Destructive

```tsx
<ActionPanel
  title="Delete this project"
  description="Once you delete a project, there is no going back."
  actionLabel="Delete project"
  destructive
/>
```

### Inline

```tsx
<ActionPanel
  title="Weekly digest"
  description="A summary of workspace activity, sent every Monday."
  actionLabel="Subscribe"
  inline
/>
```

### Toggle

```tsx
<ActionPanel
  title="Two-factor authentication"
  description="Require a verification code on every login."
  toggle
/>
```

### Embedded fields

```tsx
<ActionPanel
  title="Workspace profile"
  description="These details appear on every invoice."
  actionLabel="Save changes"
>
  <Input label="Workspace name" defaultValue="Northwind" />
  <Input label="Billing email" defaultValue="billing@northwind.com" />
</ActionPanel>
```

### Fields under a pinned action

```tsx
<ActionPanel
  title="Two-factor authentication"
  description="Require a verification code on every login."
  toggle
>
  <Input label="Recovery phone" defaultValue="+1 555 0148" />
</ActionPanel>
```

### Confirm before delete

```tsx
<Stateful initial={false}>
  {(open, setOpen) => (
    <Container md>
      <ActionPanel
        title="Delete this project"
        description="Once you delete a project, there is no going back."
        actionLabel="Delete project"
        destructive
        onAction={() => setOpen(true)}
      />
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Delete this project?"
        description="This permanently removes the project and its data."
        confirmLabel="Delete"
      />
    </Container>
  )}
</Stateful>
```

## Do & Don't

### Simple

**Do** — Spell out the consequence above the button so the stakes are clear before the click.

```tsx
<ActionPanel title="Delete this project" description="Once you delete a project, there is no going back. Please be certain." actionLabel="Delete project" destructive />
```

**Don't** — A destructive action with no consequence copy invites accidental, irreversible clicks.

```tsx
<ActionPanel title="Delete this project" actionLabel="Delete project" destructive />
```

### With toggle

**Do** — Pair the switch with a one-line explanation of what turning it on or off does.

```tsx
<ActionPanel title="Two-factor authentication" description="Add an extra layer of security to your account by requiring a verification code on login." toggle defaultChecked />
```

**Don't** — A bare switch with no description leaves the user guessing what flipping it actually changes.

```tsx
<ActionPanel title="Two-factor authentication" toggle defaultChecked />
```

## Supported props

### ActionPanelProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | The headline: what the action acts on. |
| description | string \| undefined | no |  | The consequence copy beneath the title: what happens when the action fires. |
| actionLabel | string \| undefined | no |  | The action button label. |
| onAction | (() => void) \| undefined | no |  | Fired when the action button is pressed. |
| destructive | boolean \| undefined | no | false | Tone (omit for the neutral, primary-action default). |
| inline | boolean \| undefined | no | false | Layout (pick one; default stacks the action below the copy). |
| toggle | boolean \| undefined | no | false | Affordance: render the action as an on/off Switch instead of a Button. The panel always lays out inline in this mode. |
| checked | boolean \| undefined | no | false | The Switch on/off state when `toggle` is set (CONTROLLED). Omit for uncontrolled use. |
| defaultChecked | boolean \| undefined | no | false | Initial Switch state for uncontrolled use (the toggle flips itself on press). |
| onToggle | ((next: boolean) => void) \| undefined | no |  | Fired with the next checked value when the toggle Switch is flipped. |
| children | ReactNode | no |  | Content embedded in the panel under the copy (a block of field rows in a settings panel, say). The Button then closes the panel on the right, under a hairline, as the action that commits it; a toggle stays pinned beside the copy. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
