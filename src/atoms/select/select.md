# Select

Native select restyled to match Canvas inputs. Pass `label` (and `required`) to name the field: iOS and web render the label above the trigger, while Android floats the Material 3 in-container label once the menu opens or a value is selected.

## Usage

```tsx
<Select
  label="Country"
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

## Variants

### Required field

```tsx
<Select
  label="Country"
  required
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

### Size - sm

```tsx
<Select
  small
  label="Country"
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

### Size - lg

```tsx
<Select
  large
  label="Country"
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

### With leading icon

```tsx
<Select
  label="Country"
  icon
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

### Disabled

```tsx
<Select
  disabled
  label="Country"
  defaultValue="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
/>
```

## Do & Don't

**Do** — Use the placeholder prop for the prompt so it can never be submitted as a value.

```tsx
<Column style={{ minHeight: 220 }}>
  <Select defaultOpen label="Country" placeholder="Choose a country…" options={["United States", "Canada", "Mexico"]} />
</Column>
```

**Don't** — A placeholder as a normal option can be submitted as a real value.

```tsx
<View style={{ minHeight: 260 }}>
  <Select defaultOpen label="Country" defaultValue="Choose a country…" options={["Choose a country…", "United States", "Canada", "Mexico"]} style={{ maxWidth: 280 }} />
</View>
```

### When to use

**Do** — Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two.

```tsx
<Select label="Status" options={["Active", "Inactive", "Pending", "Archived"]} defaultValue="Active" />
```

**Don't** — A select for a single on/off choice buries a one-tap decision behind a dropdown.

```tsx
<Select label="Email notifications" options={["On", "Off"]} defaultValue="On" />
```

### sm

**Do** — Keep the small select inline with a short label so it stays compact inside toolbars and table footers.

```tsx
<Select small fit inline label="Rows" defaultValue="10" options={["10", "25", "50"]} />
```

**Don't** — A stacked block label towers over the small control and breaks the dense row it belongs in.

```tsx
<Select small narrow label="Rows per page" defaultValue="10" options={["10", "25", "50"]} />
```

### default

**Do** — Match the default select to sibling inputs at the same height so the form row lines up.

```tsx
<Row alignEnd cozy style={{ maxWidth: 420 }}>
  <Column fill>
    <Field label="City" value="Austin" />
  </Column>
  <Column fill>
    <Select label="State" defaultValue="Texas" options={["Texas", "Oregon"]} />
  </Column>
</Row>
```

**Don't** — A default select next to a taller lg input leaves the row baselines misaligned.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, maxWidth: 420 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>City</Text>
    <Input large value="Austin" />
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

### lg

**Do** — Scale the text up with the height so the large select reads as a deliberate, touch-friendly target.

```tsx
<Select large label="Plan" defaultValue="Starter" options={["Starter", "Pro", "Enterprise"]} />
```

**Don't** — Tiny option text inside a tall control wastes the height and looks like an accidental mismatch.

```tsx
<View style={{ maxWidth: 320 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Plan</Text>
  <Pressable style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }} accessibilityRole="button">
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens.foreground }}>Starter</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>▾</Text>
  </Pressable>
</View>
```
