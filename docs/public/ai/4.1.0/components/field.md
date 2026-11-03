# Field

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/molecules/field/field.md`
Human reference: https://canvas.nannier.com/components/field

## Public imports

```tsx
import { Field } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A form row: a label, the control, and one message line under it. Field exists
for the part no control owns on its own: every field family already owns its
label, but nothing else in the kit renders helper or error text, so that message
is what Field adds.

When the row wraps a single field-family control that has no label of its own,
Field hands the label down to it rather than drawing one alongside,
so each
platform still places it its own way: a static title above on web and iOS, the
floating in-container label on Android, and `required` goes down with it.
Over
any other control (a Switch, a group) Field draws the label above with its star,
and on iOS and Android the label says "required" in its own name.
Set `error` and it replaces `helper` in
the same slot, so the row never changes height and nothing below it jumps; on the
web an error leads with a small alert glyph.

## Usage

```tsx
<Field label="Email" helper="We'll never share your email.">
  <Input placeholder="you@example.com" />
</Field>
```

## Variants

### Error

```tsx
<Field label="Email" error="Enter a valid email address.">
  <Input defaultValue="rachel.chen" />
</Field>
```

### Email address

```tsx
<Field label="Email address" error="Invalid email format.">
  <Input leadingIcon icon="mail" defaultValue="exampledomain.com" keyboardType="email-address" autoCapitalize="none" />
</Field>
```

### Password

```tsx
<Field label="Password" error="Password must be at least 8 characters.">
  <Input leadingIcon icon="lock" secureTextEntry passwordToggle defaultValue="12345" />
</Field>
```

### Username

```tsx
<Field label="Username" error="Username already taken.">
  <Input leadingIcon icon="user" defaultValue="danello" autoCapitalize="none" />
</Field>
```

### Phone number

```tsx
<Field label="Phone number" error="Invalid phone number.">
  <PhoneInput defaultCountry="US" defaultValue="(415) 72" />
</Field>
```

### Date of birth

```tsx
<Field label="Date of birth" error="You must be at least 18 years old.">
  <Input leadingIcon icon="calendar" defaultValue="10/30/2020" keyboardType="numbers-and-punctuation" />
</Field>
```

### Amount

```tsx
<Field label="Amount" error="Invalid amount format.">
  <Input prefix="$" defaultValue="128a" keyboardType="decimal-pad" />
</Field>
```

### Helper text

```tsx
<Column relaxed>
  <Field label="Email address" helper="We only use it to sign you in.">
    <Input leadingIcon icon="mail" placeholder="example@domain.com" keyboardType="email-address" autoCapitalize="none" />
  </Field>
  <Field label="Amount" helper="Up to two decimals.">
    <Input prefix="$" placeholder="0.00" keyboardType="decimal-pad" />
  </Field>
</Column>
```

### Wrapping a control that keeps its own label

```tsx
<Field label="Notifications">
  <Switch>Release activity</Switch>
</Field>
```

### In a form

```tsx
<Form>
  <Field label="Full name">
    <Input placeholder="Rachel Chen" />
  </Field>
  <Field label="Role">
    <Select options={["Admin", "Editor", "Viewer"]} placeholder="Pick a role" />
  </Field>
  <Field label="Notes">
    <Textarea rows={3} placeholder="Anything worth remembering" />
  </Field>
</Form>
```

### Measure

```tsx
<Column>
  <Field xs start label="ZIP code" helper="xs step, pinned to the start (320)">
    <Input placeholder="94103" />
  </Field>
  <Field lg start label="Street" helper="lg step, pinned to the start (512)">
    <Input placeholder="1 Market St" />
  </Field>
  <Container lg start>
    <Field label="City" helper="Bare, in an lg Container: fills it (512)">
      <Input placeholder="San Francisco" />
    </Field>
  </Container>
</Column>
```

## Do & Don't

### The message line

**Do** — Put helper and error text on the Field, so the row owns one message slot and the type and
color stay right in both states.

```tsx
<Field label="Email" error="Enter a valid email address." required>
  <Input value="rachel.chen" />
</Field>
```

**Don't** — Stack a raw Text under the control: it drifts from the caption scale, misses the
destructive tone, and is never announced as an error.

```tsx
<Column tight>
  <Input label="Email" required value="rachel.chen" />
  <Text style={{ fontSize: 12, color: "#e7000b" }}>Enter a valid email address.</Text>
</Column>
```

### The label

**Do** — Let Field hand the label to the control it wraps,
so Android can float it inside the box.

```tsx
<Field label="Email">
  <Input placeholder="you@example.com" />
</Field>
```

**Don't** — Label the control from outside with your own Text: the label can never float, and the
tap target no longer includes it.

```tsx
<Column tight>
  <Text style={{ fontSize: 14, fontWeight: "500" }}>Email</Text>
  <Input placeholder="you@example.com" />
</Column>
```

## Supported props

### FieldProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | string \| undefined | no |  | Row label. When the lone child is a field-family control (Input, Textarea, Select, Autocomplete) that carries no `label` of its own, the label and `required` are DELEGATED into that control so each platform places them per its own contract. Any other control keeps the static label above. |
| helper | string \| undefined | no |  | Muted hint under the control. Replaced by `error` when that is set. |
| error | string \| undefined | no |  | Error text. Setting it puts the row in the error state: the message turns destructive and replaces `helper` in place, so the row never changes height and nothing below it jumps. |
| required | boolean \| undefined | no | false | Marks the label with a destructive asterisk (decorative, never in an accessible name). A delegated control takes `required` and announces itself as required; over any other control, the label says it in its own name on iOS and Android ("Notifications, required"). |
| children | ReactNode | no |  | The control. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
