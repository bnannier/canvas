# Fieldsets

Group related form controls under a legend. Each field pairs a label, control, optional help text, and an inline error, so a set of inputs reads as one labeled unit.

## Usage

```tsx
<Fieldset
  legend="Shipping details"
  description="Where should we send your order?"
  items={[
    { label: "Full name", placeholder: "Ada Lovelace" },
    { label: "Email", placeholder: "ada@example.com", value: "ada@", help: "We'll only use this for order updates." },
    { label: "Country", placeholder: "United States" }
  ]}
/>
```

## Variants

### Content - checkboxes

```tsx
<Fieldset
  legend="Email notifications"
  description="Choose what we email you about."
  checkboxes={[
    { label: "Product updates", checked: true },
    { label: "Security alerts", checked: true },
    { label: "Weekly digest", checked: false }
  ]}
/>
```

### Validation error

```tsx
<Fieldset
  legend="Shipping details"
  description="Where should we send your order?"
  items={[
    { label: "Full name", placeholder: "Ada Lovelace" },
    { label: "Email", placeholder: "ada@example.com", value: "ada@", help: "We'll only use this for order updates.", error: "Enter a valid email address" },
    { label: "Country", placeholder: "United States" }
  ]}
/>
```

### Disabled

```tsx
<Fieldset
  legend="Shipping details"
  description="Where should we send your order?"
  disabled
  items={[
    { label: "Full name", placeholder: "Ada Lovelace" },
    { label: "Email", placeholder: "ada@example.com", value: "ada@", help: "We'll only use this for order updates." },
    { label: "Country", placeholder: "United States" }
  ]}
/>
```

### Columns - 2

```tsx
<Fieldset
  legend="Shipping details"
  description="Where should we send your order?"
  twoColumn
  items={[
    { label: "Full name", placeholder: "Ada Lovelace" },
    { label: "Email", placeholder: "ada@example.com", value: "ada@", help: "We'll only use this for order updates." },
    { label: "Country", placeholder: "United States" }
  ]}
/>
```

## Do & Don't

### Text fields

**Do** — Give every field a persistent label; use the placeholder only for an example value or format hint.

```tsx
<Fieldset legend="Shipping details" items={[
    { label: "Full name", placeholder: "Ada Lovelace" },
    { label: "Email", placeholder: "ada@example.com", help: "We'll only use this for order updates." }
  ]} />
```

**Don't** — A placeholder is not a label: it vanishes on focus and is skipped by many screen readers, leaving the field unnamed.

```tsx
<Fieldset legend="Shipping details" items={[
    { label: "", placeholder: "Full name" },
    { label: "", placeholder: "Email" }
  ]} />
```

### Checkbox group

**Do** — A legend names the group so its checkboxes read as one labeled unit.

```tsx
<Fieldset legend="Notify me by" checkboxes={[
    { label: "Email" },
    { label: "SMS" },
    { label: "Push" }
  ]} />
```

**Don't** — Without a legend the relationship between the controls is implicit; screen readers announce them as unrelated.

```tsx
<Fieldset checkboxes={[
    { label: "Email" },
    { label: "SMS" },
    { label: "Push" }
  ]} />
```

### Two-column

**Do** — Pair only naturally adjacent, short fields side by side; the grid stacks to one column on small screens.

```tsx
<Fieldset legend="Card details" twoColumn items={[
    { label: "Expiry", placeholder: "MM / YY" },
    { label: "CVC", placeholder: "123" }
  ]} />
```

**Don't** — Splitting unrelated or full-width fields across two columns crams the form and breaks the reading order.

```tsx
<Fieldset legend="Account" twoColumn items={[
    { label: "Bio", value: "Engineering lead." },
    { label: "Country", value: "United States" }
  ]} />
```
