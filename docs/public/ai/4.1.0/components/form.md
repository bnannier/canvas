# Form

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 63292636c7ff2f224185aef7c96ac78124f9170a170b90ee11718addfa280643

Source: `src/molecules/form/form.md`
Human reference: https://canvas.nannier.com/components/form

## Public imports

```tsx
import { Form, FormSection } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Stitch your own fields inside it; Form adds the stacked or two-column rhythm, titled sections, the submit and cancel actions row, and Enter to submit.

The actions row sits under a hairline rule, a ghost cancel before the primary submit; each FormSection closes with the same rule. A `disabled` form dims as a whole and disables its actions.

`twoColumn` lays the rows out in exactly two equal columns 16px apart, however wide the form: the fields fill their columns left to right, an odd last field keeps its half, and a FormSection takes the whole row, after which the next field starts a new one. The form measures itself, and at 512px or narrower (the `lg` width step) the rows stack in one full-width column instead.

`FormSection aside` sets the section's heading in a rail beside its rows, the layout of a
settings page: the rail at the `xs` width step (320px), 48px from the rows, a 20px title
over a 14px description, the rows 18px apart, 28px above and below the rows and a rule
closing the section. The section measures itself, and at 512px or narrower (the `lg`
width step) the rail stacks over the rows. A form whose last row is an aside section
drops the actions row's rule (the section's closes the rows). `hints` puts leading
content in the actions row, before the buttons (the keyboard hints "↵ to save"), and the
row then spreads the two to its ends.

## Usage

On the web, Enter confirms an active Autocomplete suggestion before it can submit the form. A subsequent Enter submits after the list closes. Enter used to confirm an input-method candidate never submits, and holding Enter does not repeat submission. Multiline fields retain Enter for newlines. On native platforms, each field's `onSubmitEditing` owns the return-key action.

Form is a composition surface: you stitch the field atoms as children and keep their state; Form supplies the vertical rhythm, the actions row, and `onSubmit`, which fires from the submit button or from Enter in a single-line field on the web. 

On the web a Form is a form landmark. Name it with `accessibilityLabel`, a brief statement of its purpose such as "Sign in", so a screen reader's landmark list can tell it apart; a page that holds more than one form needs a distinct name on each.

```tsx
<Form submitLabel="Sign in">
  <Input label="Email" placeholder="you@example.com" />
  <Input label="Password" />
</Form>
```

## Variants

### Two-column

```tsx
<Form twoColumn submitLabel="Create">
  <Input label="First name" placeholder="Ada" />
  <Input label="Last name" placeholder="King" />
  <Input label="Email" placeholder="ada@example.com" />
</Form>
```

### Block actions

`block` gives both actions `block`, so the cancel and submit buttons split the actions row equally, the compact form's full-width buttons.

```tsx
<Form block submitLabel="Send invite" cancelLabel="Cancel">
  <Input label="Email" placeholder="kira@ionize.io" />
</Form>
```

### Measure

```tsx
<Form sm start submitLabel="Sign in">
  <Input label="Email" placeholder="sm step, pinned to the start (384)" />
  <Input label="Password" />
</Form>
```

### Sections

```tsx
<Form submitLabel="Save">
  <FormSection title="Personal info" description="This information will be displayed on your public profile.">
    <Input label="Full name" defaultValue="Rachel Chen" />
    <Input label="Email" defaultValue="rachel@example.com" />
  </FormSection>
  <FormSection title="Notifications" description="Choose how you'd like to be notified.">
    <Checkbox defaultChecked>Email notifications</Checkbox>
    <Checkbox>SMS alerts</Checkbox>
  </FormSection>
</Form>
```

### Aside sections

```tsx
<Form
  submitLabel="Save changes"
  cancelLabel="Cancel"
  hints={
    <Row snug alignCenter>
      <Kbd>↵</Kbd>
      <Typography small subtle>to save</Typography>
    </Row>
  }
>
  <FormSection aside title="Workspace" description="Shown to everyone you invite, on invoices and in the sidebar.">
    <Input label="Name" placeholder="Northwind" />
    <Input label="URL" prefix="canvas.app/" defaultValue="northwind" />
  </FormSection>
  <FormSection aside title="Members" description="Defaults for people who join from an invite link.">
    <Switch defaultChecked description="Guests see only the boards they are added to.">Allow guests</Switch>
  </FormSection>
</Form>
```

### Account details

```tsx
<Form submitLabel="Create account">
  <Input label="Email address" leadingIcon icon="mail" placeholder="example@domain.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
  <Input label="Password" leadingIcon icon="lock" secureTextEntry passwordToggle placeholder="••••••••" autoComplete="new-password" />
  <Input label="Username" leadingIcon icon="user" placeholder="yourname" autoCapitalize="none" autoComplete="username" />
  <PhoneInput label="Phone number" placeholder="Add your phone number" />
  <Input label="Date of birth" leadingIcon icon="calendar" placeholder="MM/DD/YYYY" keyboardType="numbers-and-punctuation" autoComplete="birthdate-full" />
</Form>
```

### Credit card

```tsx
<Form submitLabel="Pay">
  <Input label="Card Number" trailingIcon icon="creditCard" placeholder="•••• •••• •••• ••••" keyboardType="number-pad" autoComplete="cc-number" textContentType="creditCardNumber" />
  <Row relaxed>
    <Input label="Expiry Date" placeholder="MM/YY" keyboardType="number-pad" autoComplete="cc-exp" textContentType="creditCardExpiration" />
    <Input label="CVV" placeholder="•••" secureTextEntry keyboardType="number-pad" maxLength={4} autoComplete="cc-csc" textContentType="creditCardSecurityCode" />
  </Row>
  <Input label="Cardholder name" placeholder="Name on card" autoCapitalize="words" autoComplete="cc-name" textContentType="creditCardName" />
</Form>
```

### Credit card with errors

```tsx
<Form submitLabel="Pay">
  <Field label="Card Number" error="Invalid card number.">
    <Input trailingIcon icon="creditCard" defaultValue="•••• •••• 1478" keyboardType="number-pad" />
  </Field>
  <Row relaxed alignStart>
    <Field label="Expiry Date" error="Invalid expiration date.">
      <Input defaultValue="13/26" keyboardType="number-pad" />
    </Field>
    <Field label="CVV" error="CVV must be 3 digits.">
      <Input defaultValue="66" keyboardType="number-pad" maxLength={4} />
    </Field>
  </Row>
  <Field label="Cardholder name" error="Name can only contain letters.">
    <Input defaultValue="Daniel Smith 87" autoCapitalize="words" />
  </Field>
</Form>
```

### Address

```tsx
<Form submitLabel="Save address">
  <Input label="Street address" placeholder="123 Main Street" autoComplete="street-address" textContentType="streetAddressLine1" />
  <Input label="Apartment, suite, unit (optional)" placeholder="Apt 5B" textContentType="streetAddressLine2" />
  <Row relaxed>
    <Input label="City" placeholder="San Francisco" textContentType="addressCity" />
    <Input label="ZIP code" placeholder="94105" keyboardType="number-pad" autoComplete="postal-code" textContentType="postalCode" />
  </Row>
  <Select
    label="Country"
    defaultValue="US"
    options={[
      { value: "US", label: "United States", leading: "🇺🇸" },
      { value: "CA", label: "Canada", leading: "🇨🇦" },
      { value: "GB", label: "United Kingdom", leading: "🇬🇧" },
      { value: "DE", label: "Germany", leading: "🇩🇪" },
      { value: "JP", label: "Japan", leading: "🇯🇵" },
    ]}
  />
</Form>
```

### Address with errors

```tsx
<Form submitLabel="Save address">
  <Field label="Street address" error="Street address is required.">
    <Input placeholder="123 Main Street" />
  </Field>
  <Field label="Apartment, suite, unit (optional)" error="Street address is required.">
    <Input placeholder="Apt 5B" />
  </Field>
  <Row relaxed alignStart>
    <Field label="City" error="City is required.">
      <Input placeholder="San Francisco" />
    </Field>
    <Field label="ZIP code" error="Invalid postal code.">
      <Input defaultValue="101" keyboardType="number-pad" />
    </Field>
  </Row>
  <Select
    label="Country"
    defaultValue="US"
    options={[
      { value: "US", label: "United States", leading: "🇺🇸" },
      { value: "CA", label: "Canada", leading: "🇨🇦" },
      { value: "GB", label: "United Kingdom", leading: "🇬🇧" },
    ]}
  />
</Form>
```

### Select and switch controls

```tsx
<Form submitLabel="Save">
  <Select label="Role" options={["Admin", "Editor", "Viewer"]} defaultValue="Editor" />
  <Switch defaultChecked>Notifications</Switch>
</Form>
```

## Do & Don't

### Stacked

**Do** — Keep short forms one field per row so each label sits directly above its input and the eye flows straight down.

```tsx
<Form submitLabel="Sign in">
  <Input label="Email" placeholder="you@example.com" />
  <Input label="Password" />
</Form>
```

**Don't** — Pairing an email and password side by side cramps a sign-in form and breaks the natural top-to-bottom reading order.

```tsx
<Form twoColumn submitLabel="Sign in">
  <Input label="Email" placeholder="you@example.com" />
  <Input label="Password" />
</Form>
```

### Two-column

**Do** — Compose mixed rows inside the stacked form: give a full-width field like the street its own line and pair the similar-width city and ZIP in a Row.

```tsx
<Form submitLabel="Save">
  <Input label="Street address" placeholder="123 Market St" />
  <Row cozy>
    <Column fill>
      <Input label="City" placeholder="San Francisco" />
    </Column>
    <Column fill>
      <Input label="ZIP" placeholder="94103" />
    </Column>
  </Row>
</Form>
```

**Don't** — Putting a wide field next to a tiny one in the same two-column row leaves the short input awkwardly oversized.

```tsx
<Form twoColumn submitLabel="Save">
  <Input label="Street address" placeholder="123 Market St" />
  <Input label="ZIP" placeholder="94103" />
</Form>
```

### Sections

**Do** — Group related fields in a `FormSection` so each cluster carries its heading, its supporting line, and group semantics a screen reader announces.

```tsx
<Form submitLabel="Save">
  <FormSection title="Personal info" description="Displayed on your public profile.">
    <Input label="Full name" defaultValue="Rachel Chen" />
  </FormSection>
  <FormSection title="Billing" description="Used for invoices and receipts.">
    <Input label="Card number" defaultValue="•••• 4242" />
  </FormSection>
</Form>
```

**Don't** — Hand-rolled headings spliced between fields carry no grouping semantics, so assistive tech never hears which section a field belongs to.

```tsx
<View style={{ width: 560, maxWidth: "100%", gap: 16 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Personal info</Text>
  <Input label="Full name" defaultValue="Rachel Chen" />
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Billing</Text>
  <Input label="Card number" defaultValue="•••• 4242" />
</View>
```

### Inline form

**Do** — Keep the input and its submit button on one row so the input + action reads as one step.

```tsx
<Card padded>
  <Column relaxed>
    <Column tight>
      <Typography lead semibold>Subscribe to updates</Typography>
      <Typography small muted>We'll send you a weekly digest of what changed.</Typography>
    </Column>
    <Row alignCenter snug>
      <Column fill>
        <Input placeholder="you@example.com" />
      </Column>
      <Button primary>Subscribe</Button>
    </Row>
  </Column>
</Card>
```

**Don't** — Stacking the field above its button breaks the single-decision rhythm and adds a row of dead space.

```tsx
<Card padded style={{ gap: 16 }}>
  <View style={{ gap: 4 }}>
    <Text style={{ fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Subscribe to updates</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>We'll send you a weekly digest of what changed.</Text>
  </View>
  <Input placeholder="you@example.com" />
  <View style={{ alignItems: "flex-start" }}>
    <Button primary>Subscribe</Button>
  </View>
</Card>
```

## Supported props

### FormSectionProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | Section heading naming this group of controls. |
| description | ReactNode | no |  | Muted supporting line under the heading. |
| aside | boolean \| undefined | no | false | Sets the heading in a rail beside the section's rows (a settings page's layout): the rail at the `xs` width step, 48 from the rows, with a 20 px display title over a 14 px description, the rows 18 apart, and 28 above and below the rows closed by a rule. In a section 512 px wide or narrower (the `lg` step, measured on the section itself) the rail stacks over the rows. Omit for the stacked default. |
| children | ReactNode | no |  | The section's stitched controls. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

### FormProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | The form rows, stitched by the caller: Input, Select, Checkbox, a FormSection, any node. Each control keeps its own state (controlled or uncontrolled); Form never intercepts it. |
| twoColumn | boolean \| undefined | no | false | Two-column: rows flow into a grid of exactly two equal columns, 16 apart, where a FormSection takes the whole line; in a form 512 px wide or narrower (the `lg` width step, measured on the form itself) the rows stack in one full-width column instead. Omit for the stacked default. |
| hints | ReactNode | no |  | Leading content of the actions row, before the buttons (keyboard hints such as "↵ to save"). The row then spreads the hints and the buttons to its two ends. |
| submitLabel | string \| undefined | no |  | Label for the primary submit button. Passing it (or `cancelLabel`) renders the actions row. |
| cancelLabel | string \| undefined | no |  | Renders a ghost cancel button before the submit button. |
| block | boolean \| undefined | no | false | The actions take `block`: the cancel and submit buttons split the actions row equally (the Layout page's compact invite form, where the buttons go full width). |
| onSubmit | (() => void) \| undefined | no |  | Fired when the submit button is pressed, and on the web when Enter is pressed inside one of the form's single-line text fields. Form owns no field state, so the caller reads its own values (no payload). |
| onCancel | (() => void) \| undefined | no |  | Fired when the cancel button is pressed. |
| disabled | boolean \| undefined | no | false | Disables the actions row and Enter-to-submit, and dims the form. |
| accessibilityLabel | string \| undefined | no |  | The form's name for assistive tech, a brief statement of its purpose ("Sign in", "Invite a teammate"). Form is a form landmark on the web, and ARIA asks every form landmark for a name: it is how a landmark list tells two forms on one page apart. Omit it and the form stays unnamed, as before. |
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
