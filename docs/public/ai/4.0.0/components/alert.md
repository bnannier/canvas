# Alert

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/molecules/alert/alert.md`
Human reference: https://canvas.nannier.com/components/alert

## Public imports

```tsx
import { Alert } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Inline notification banners: info, success, warning, and destructive, plus a full-width announcement bar. For a blocking confirmation prompt, see Alert Dialog.

A banner fills the parent it is given, so a column of alerts is the same measure top to bottom and a banner over a form lines up with the fields; a Container step sets the measure when the layout calls for one.

A banner is a soft callout: the tone's wash under a 1px edge of the tone's color, the tone's own glyph in that color, a foreground title and a muted body, from `statusColors` (the helper Badge and every toned surface read). The neutral banner is the quiet muted surface with an info glyph in the muted ink. Pass `icon` to draw another glyph (an `<Icon />` takes the tone's color and the banner's 18px size), or `icon={null}` to draw none.

## Usage

Pressing the trailing "×" (`dismissible`) hides the banner out of the box; `onDismiss` reports it, and a controlled `dismissed` prop hands that state to the parent instead. Action buttons are real Buttons: wire each one's `onPress`.

```tsx
<Alert
  info
  title="Heads up"
  description="Maintenance window scheduled for Sunday 2:00 UTC."
/>
```

## Variants

### Success

```tsx
<Alert
  success
  title="All set"
  description="Your changes have been saved successfully."
/>
```

### Warning

```tsx
<Alert
  warning
  title="Action required"
  description="Your trial expires in 3 days."
/>
```

### Destructive

```tsx
<Alert
  destructive
  title="Something went wrong"
  description="Could not save your changes. Please try again."
/>
```

### Neutral

```tsx
<Alert
  icon={<Icon bell />}
  title="Scheduled maintenance"
  description="The dashboard may be briefly unavailable on Sunday between 2:00 and 3:00 UTC."
/>
```

### Dismissible

```tsx
<Alert
  info
  title="Heads up"
  description="Maintenance window scheduled for Sunday 2:00 UTC."
  dismissible
/>
```

### Actions

```tsx
<Alert
  warning
  title="Action required"
  description="Your trial expires in 3 days."
  actions={<Button primary small>Upgrade plan</Button>}
/>
```

### Inline action

`action` is one quiet link in the banner's actions, for the single next step a notice offers.

```tsx
<Alert
  info
  title="New sign-in"
  description="A browser in Lisbon signed in to your account."
  action={{ label: "Review activity" }}
/>
```

### Announcement

`announcement` is the full-width product bar: the accent's gradient under its own ink, a
sparkles glyph, the message, an inline `action` link and the dismiss box. It has its own
look, so the tone booleans do not apply to it.

```tsx
<Alert
  announcement
  dismissible
  title="Canvas 4.0 is live: every component on lit glass."
  action={{ label: "See what moved" }}
/>
```

### Measures come from the parent

```tsx
<Column snug>
  <Container xs start>
    <Alert title="In an xs Container" description="The banner fills the 320px step, the measure of a short form." />
  </Container>
  <Alert title="Bare" description="No container of its own: the banner fills whatever parent it sits in." />
</Column>
```

### Rich body

```tsx
<Alert title="Design token renamed">
  <Typography small muted>
    The field underline now reads from <Typography code>--p-field-underline</Typography> instead of a raw hex value; update any local overrides before upgrading.
  </Typography>
</Alert>
```

## Do & Don't

### info

**Do**: Reserve info for passive, non-urgent context (notices, tips); escalate to warning or destructive when action is required.

```tsx
<Alert info title="Heads up" description="Maintenance window scheduled for Sunday 2:00 UTC." />
```

**Don't**: Dressing an act-now message in the neutral info tone hides the urgency; users skim past it like an FYI.

```tsx
<Alert info title="Trial expires today" description="Upgrade now or you'll lose access to your projects." />
```

### success

**Do**: Make confirmations transient: auto-dismiss or give a Dismiss control so the success state clears once acknowledged.

```tsx
<Alert
  success
  title="Saved"
  description="Your changes have been saved successfully."
  dismissible
/>
```

**Don't**: A success banner pinned with no way to dismiss it lingers as visual noise long after the action is done.

```tsx
<Alert success title="Saved" description="Your changes have been saved successfully." />
```

### warning

**Do**: State the consequence, the deadline, and the action: name what's wrong and give a button to resolve it.

```tsx
<Alert
  warning
  title="Action required"
  description="Your trial expires in 3 days. Upgrade to keep your projects."
  actions={<Button primary small>Upgrade plan</Button>}
/>
```

**Don't**: A warning with no specifics or next step leaves the user guessing what to fix and by when.

```tsx
<Alert warning title="Action required" description="Something needs your attention." />
```

### destructive

**Do**: Match the variant to the severity: reserve destructive for genuine failures, success for confirmations.

```tsx
<Alert destructive title="Something went wrong" description="Could not save your changes. Please try again." />
```

**Don't**: Using the destructive variant for non-errors cries wolf; users learn to tune out red and miss real failures.

```tsx
<Alert destructive title="Saved" description="Your changes have been saved successfully." />
```

## Supported props

### AlertProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | Content. |
| description | string \| undefined | no |  | Content. |
| icon | ReactNode | no |  | The leading glyph: an element (an `<Icon />`, tinted to the tone's color unless it sets its own, and sized to the banner's glyph) or a single text character. Omitted, the banner draws its tone's own glyph (an info circle on info and neutral, a check on success, an alert circle on warning, a cross on destructive); `null` draws none. |
| info | boolean \| undefined | no | false | Tone (pick one; omit for the neutral default). |
| success | boolean \| undefined | no | false | Tone (pick one; omit for the neutral default). |
| warning | boolean \| undefined | no | false | Tone (pick one; omit for the neutral default). |
| destructive | boolean \| undefined | no | false | The danger tone. This is the name the intent axis uses across the kit (Button, AlertDialog, and every chart) and the one the design hand-off uses here too. |
| announcement | boolean \| undefined | no | false | The announcement bar: one line on the accent gradient (the accent running into the cyan series hue) in the accent's own ink, under its glow, with its `action` inline at the end. For page-wide news ("v4 is live"), not for a status. It is its own look, so it ignores the tone axis. |
| action | { label: string; onPress?: () => void; } \| undefined | no |  | One action, as a label and a handler. On the announcement bar it sits inline at the end of the line, in the bar's ink; on the other looks it is a link Button in the actions region, before any `actions`. |
| dismissible | boolean \| undefined | no | false | Shows a trailing dismiss control. Pressing it hides the banner out of the box (uncontrolled); pass `dismissed` to own that state instead. |
| dismissed | boolean \| undefined | no | false | Controlled dismissal: `true` hides the banner. Omit to let the Alert manage it. |
| defaultDismissed | boolean \| undefined | no | false | Uncontrolled seed: start hidden. Rarely useful; defaults to false. |
| onDismiss | (() => void) \| undefined | no |  | Fired when the dismiss control is pressed (both modes). |
| children | ReactNode | no |  |  |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| actions | ReactNode | no |  | A footer action region rendered under the body. The Alert owns the layout: it separates the actions from the description above and lays the buttons out in a row, so a call site passes the buttons directly (`actions={<Button primary small>Upgrade plan</Button>}`) with no wrapper. Pass a fragment for more than one action. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
