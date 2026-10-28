# Input

The Input component is a React Native text field with semantic boolean props
(`error`, `small`, `large`, `disabled`), plus prefix/suffix addons, overlaid
icons (`leadingIcon` / `trailingIcon` with any Canvas glyph as `icon`), a
`passwordToggle` eye for a `secureTextEntry` value, and a `clearable` clear
button. Input is single-line; for multi-line entry use the dedicated Textarea.

Pass `label` (and `required`) to name the field:
<!-- only: web -->
iOS and web render the label
above the control, while Android floats the Material 3 in-container label. On
Android the field grows with the user's text size so the floated label never
meets the value, and a label longer than the field truncates on one line inside
it while the field's accessible name stays the whole label.
<!-- /only -->
<!-- only: ios -->
iOS renders the label above the control.
<!-- /only -->
<!-- only: android -->
Android floats the Material 3 in-container label. The field grows with the user's text size so the floated label never meets the value, and a label longer than the field truncates on one line inside it while the field's accessible name stays the whole label.
<!-- /only -->
The required star is
decorative: a screen reader hears the field as required,
<!-- only: web -->
from `aria-required` on
the web and from its name ("Full name, required") on iOS and Android.
<!-- /only -->
<!-- only: ios android -->
from its name ("Full name, required").
<!-- /only -->
A field fills the parent it is given; a step of its own (`xs`, `lg`, …, with
`start` to pin it to the leading edge) or a Container step sets its measure.
Select and the search field share its look, and Field and Form compose that
label with helper and error text.
<!-- only: web ios -->
On iOS the field is the native text field in
Canvas's colors: a card-colored box with a hairline, a muted title above, a glyph
that tints with focus and error, and in solid mode an error wash. Under glass a
wash would cost the field's ink its contrast over the material, so the iOS field
takes none (the web's field a trace in dark only), and the error border, the tinted
glyph and a Field's message carry the state.
<!-- /only -->
A prefix or suffix addon's fill is held to
the same bar: under glass it is only as dense as keeps its text at 4.5:1 over the field,
<!-- only: web -->
so in the browser's light palettes and on the iOS field in dark it is a faint trace.
<!-- /only -->
<!-- only: ios -->
so on the iOS field in dark it is a faint trace.
<!-- /only -->
<!-- only: android -->
so in a light palette it is a faint trace.
<!-- /only -->

Inside an overlay, Escape follows the overlay's cancellation policy. A supplied
`onKeyPress` runs first and can call `preventDefault()` to handle Escape locally.
Cancelling an IME candidate keeps the overlay open.

On web, the field is a sunken well: 40 pixels tall (32 small, 48 large) at the
10-pixel field corner, a hairline edge, a 12-pixel inset, a regular 14-pixel value
(13 small) and a medium 13-pixel muted label above. The edge darkens under the
pointer, takes the accent with a soft accent halo on focus, and turns red with a
red halo for an error; a read-only field is a dashed edge on no fill, and a
disabled one dims. A prefix sits in a muted box behind a divider, a passive
suffix is inline monospace text before the clear button (a small raised disc with
an x), and an action suffix is a button box at the end.

<!-- only: web ios -->
On iOS the clear button is the system's gray disc with an x, inside the boxed
suffix segment, and the action suffix's label is a semibold 15-point brand label.
<!-- /only -->
<!-- only: web android -->
On Android the suffix is inline text before the circled-x clear glyph, an errored
field shows a red alert glyph at its end (in place of a clear or eye button), and
a read-only field drops its fill under a dashed frame with a subtle underline.
<!-- /only -->

`eyebrow` uses the original dense uppercase web field label, preserving its
9.5/12.35 metrics and tracking. Other platform label treatments retain their skin.

`soft` uses the brand’s entry-well fill where the skin provides it.
`systemFocus` preserves the platform’s system focus outline. An explicit
`accessibilityLabel` takes precedence over the visible label’s accessible name.

Pass `search` for the toolbar search: a magnifier, a borderless editor, and a
uppercase prompt while empty on web. The prompt names the editor unless
`accessibilityLabel` or `label` supplies its purpose.
<!-- only: web -->
iOS draws its search field
(a 36-point muted well) and Android the Material 3 search bar (a 56-dp muted
stadium).
<!-- /only -->
<!-- only: ios -->
iOS draws its search field (a 36-point muted well).
<!-- /only -->
<!-- only: android -->
Android draws the Material 3 search bar (a 56-dp muted stadium).
<!-- /only -->
`systemFocus` preserves the system
focus outline for the borderless editor.

## Usage

```tsx
<Input placeholder="rachel.chen@example.com" />
```

## Variants

### Toolbar search

```tsx
<Input search systemFocus placeholder="Search work items" />
```


### Label

```tsx
<Input label="Email" placeholder="rachel.chen@example.com" />
```

### Required

```tsx
<Input label="Full name" required placeholder="Rachel Chen" />
```

### Prefix

```tsx
<Input prefix="https://" placeholder="canvas.dev" />
```

### Action

```tsx
<Input suffix="Copy" action defaultValue="cnv_3f9a21b8e7" />
```

### Icon

```tsx
<Input leadingIcon icon="search" placeholder="Search" />
```

### Email

```tsx
<Input label="Email address" leadingIcon icon="mail" placeholder="example@domain.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
```

### Password

```tsx
<Input label="Password" leadingIcon icon="lock" secureTextEntry passwordToggle placeholder="••••••••" autoComplete="password" />
```

### Username

```tsx
<Input label="Username" leadingIcon icon="user" placeholder="yourname" defaultValue="danello87" autoCapitalize="none" autoComplete="username" />
```

### Date of birth

```tsx
<Input label="Date of birth" leadingIcon icon="calendar" placeholder="MM/DD/YYYY" keyboardType="numbers-and-punctuation" autoComplete="birthdate-full" />
```

### Currency

```tsx
<Input label="Amount" prefix="$" placeholder="0.00" keyboardType="decimal-pad" />
```

### Search

```tsx
<Input leadingIcon icon="search" clearable placeholder="Search" defaultValue="example" />
```

### Card number

```tsx
<Input label="Card Number" trailingIcon icon="creditCard" placeholder="•••• •••• •••• ••••" keyboardType="number-pad" autoComplete="cc-number" textContentType="creditCardNumber" />
```

### Error

```tsx
<Input error placeholder="rachel.chen@example.com" />
```

### Disabled

```tsx
<Input disabled placeholder="rachel.chen@example.com" />
```

### Read only

```tsx
<Input readOnly accessibilityLabel="Email" defaultValue="rachel.chen@example.com" />
```

### Measure

```tsx
<Column snug>
  <Input xs start placeholder="xs step, pinned to the start (320)" />
  <Input lg start placeholder="lg step, pinned to the start (512)" />
  <Container lg start><Input placeholder="Bare, in an lg Container: fills it (512)" /></Container>
</Column>
```

## Do & Don't

### text

**Do** — Pass `label` so every field carries a persistent, programmatically-linked name.

```tsx
<Input label="Email" placeholder="ada@acme.dev" />
```

**Don't** — A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.

```tsx
<Input placeholder="Email" />
```

### number

**Do** — Park the unit in a suffix addon so the value stays purely numeric.

```tsx
<Input label="Storage" defaultValue="1024" suffix="GB" />
```

**Don't** — A plain text field lets users type the unit into the value, breaking parsing and validation.

```tsx
<Input label="Storage" defaultValue="1024 GB" />
```

### Read only or disabled

**Do**: Pass `readOnly` for a value people still need to reach. On the web it stays in the tab order and its text stays selectable.
<!-- only: web -->
On iOS and Android, React Native maps a read-only field to a disabled native view, so VoiceOver and TalkBack announce it as dimmed and Android cannot select its text.
<!-- /only -->
<!-- only: ios -->
On iOS, React Native maps a read-only field to a disabled native view, so VoiceOver announces it as dimmed.
<!-- /only -->
<!-- only: android -->
On Android, React Native maps a read-only field to a disabled native view, so TalkBack announces it as dimmed and its text cannot be selected.
<!-- /only -->

```tsx
<Input label="Workspace ID" readOnly defaultValue="ws_8f2k1" />
```

**Don't**: Disable a field whose value people must read or copy. `disabled` takes it out of the tab order and announces it as unavailable on every platform.

```tsx
<Input label="Workspace ID" disabled defaultValue="ws_8f2k1" />
```
