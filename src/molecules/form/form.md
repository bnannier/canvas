# Form Layouts

Stacked, two-column, with sidebar description.

## Usage

```tsx
<Form
  stacked
  fields={[
    { label: "Email", placeholder: "you@example.com" },
    { label: "Password" }
  ]}
  submitLabel="Sign in"
  style={{ maxWidth: 360 }}
/>
```

## Variants

### Layout - two-column

```tsx
<Form
  twoColumn
  fields={[
    { label: "First name", placeholder: "Ada" },
    { label: "Last name", placeholder: "King" },
    { label: "Email", placeholder: "ada@example.com" }
  ]}
  submitLabel="Create"
  cancelLabel="Cancel"
  style={{ maxWidth: 560 }}
/>
```

### Layout - sidebar

```tsx
<Form
  sidebar
  sections={[
    { title: "Personal info", description: "This information will be displayed on your public profile.", fields: [
      { label: "Full name", value: "Rachel Chen" },
      { label: "Email", value: "rachel@example.com" }
    ] },
    { title: "Notifications", description: "Choose how you'd like to be notified.", checkboxes: [
      { label: "Email notifications", checked: true },
      { label: "SMS alerts" }
    ] }
  ]}
  submitLabel="Save"
  style={{ maxWidth: 720 }}
/>
```

## Do & Don't

### Stacked

**Do** — Keep short forms one field per row so each label sits directly above its input and the eye flows straight down.

```tsx
<Form stacked submitLabel="Sign in" style={{ maxWidth: 360 }} fields={[
    { label: "Email", placeholder: "you@example.com" },
    { label: "Password" }
  ]} />
```

**Don't** — Pairing an email and password side by side cramps a sign-in form and breaks the natural top-to-bottom reading order.

```tsx
<Form twoColumn submitLabel="Sign in" style={{ maxWidth: 360 }} fields={[
    { label: "Email", placeholder: "you@example.com" },
    { label: "Password" }
  ]} />
```

### Two-column

**Do** — Pair fields of similar width (city / ZIP) in a row and give a full-width field like the street its own line.

```tsx
<Column cozy style={{ maxWidth: 560 }}>
  <Field label="Street address" placeholder="123 Market St" />
  <Row cozy>
    <Column fill>
      <Field label="City" placeholder="San Francisco" />
    </Column>
    <Column fill>
      <Field label="ZIP" placeholder="94103" />
    </Column>
  </Row>
</Column>
```

**Don't** — Putting a wide field next to a tiny one in the same two-column row leaves the short input awkwardly oversized.

```tsx
<Form twoColumn submitLabel="Save" style={{ maxWidth: 560 }} fields={[
    { label: "Street address", placeholder: "123 Market St" },
    { label: "ZIP", placeholder: "94103" }
  ]} />
```

### Sidebar

**Do** — Pair each sidebar heading with a line of helper text so the left column explains what the section's fields are for.

```tsx
<Form sidebar submitLabel="Save" style={{ maxWidth: 720 }} sections={[
    { title: "Personal info", description: "Displayed on your public profile.", fields: [
      { label: "Full name", value: "Rachel Chen" }
    ] },
    { title: "Billing", description: "Used for invoices and receipts.", fields: [
      { label: "Card number", value: "•••• 4242" }
    ] }
  ]} />
```

**Don't** — A bare section heading with no helper text wastes the sidebar column and gives the user no context for the group.

```tsx
<Form sidebar submitLabel="Save" style={{ maxWidth: 720 }} sections={[
    { title: "Personal info", fields: [
      { label: "Full name", value: "Rachel Chen" }
    ] },
    { title: "Billing", fields: [
      { label: "Card number", value: "•••• 4242" }
    ] }
  ]} />
```
