# Inputs & Forms

The Input component is a React Native text field with semantic boolean props (`error`, `small`, `large`, `block`, `disabled`), plus prefix/suffix addons and overlaid icons; `multiline` turns it into a textarea. Select and the search field share its look, and Field and Form compose a label, the control, and helper text.

## Usage

```tsx
<Input placeholder="rachel.chen@example.com" style={{ maxWidth: 320 }} />
```

## Variants

### Control - number

```tsx
<Input placeholder="1024" style={{ maxWidth: 320 }} />
```

### Control - select

```tsx
<View style={{ maxWidth: 320, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Status</Text>
  <Select value="Active" options={["Active", "Inactive", "Pending"]} />
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>We'll use this for account recovery.</Text>
</View>
```

### Control - textarea

```tsx
<Input multiline placeholder="Describe the change" style={{ maxWidth: 320 }} />
```

### Addon - prefix

```tsx
<Input prefix="https://" placeholder="canvas.dev" style={{ maxWidth: 320 }} />
```

### Addon - action

```tsx
<Input suffix="Copy" action value="cnv_3f9a21b8e7" style={{ maxWidth: 320 }} />
```

### Addon - icon

```tsx
<Input leadingIcon icon="search" placeholder="Search" style={{ maxWidth: 320 }} />
```

### State - error

```tsx
<Input error placeholder="rachel.chen@example.com" style={{ maxWidth: 320 }} />
```

### State - disabled

```tsx
<Input disabled placeholder="rachel.chen@example.com" style={{ maxWidth: 320 }} />
```

### State - readonly

```tsx
<Input readOnly placeholder="rachel.chen@example.com" style={{ maxWidth: 320 }} />
```

## Do & Don't

### text

**Do** — Pair every field with a persistent .label above the control.

```tsx
<Field label="Email" placeholder="ada@acme.dev" style={{ maxWidth: 320 }} />
```

**Don't** — A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.

```tsx
<Input placeholder="Email" style={{ maxWidth: 320 }} />
```

### number

**Do** — Use type="number" with inputmode and park the unit in a .input-addon so the value stays purely numeric.

```tsx
<View style={{ maxWidth: 320 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Storage</Text>
  <Input value="1024" suffix="GB" />
</View>
```

**Don't** — A plain text field lets users type the unit into the value, breaking parsing and validation.

```tsx
<Field label="Storage" value="1024 GB" style={{ maxWidth: 320 }} />
```

### select

**Do** — Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two.

```tsx
<Select label="Status" options={["Active", "Inactive", "Pending", "Archived"]} value="Active" style={{ maxWidth: 320 }} />
```

**Don't** — A select for a single on/off choice buries a one-tap decision behind a dropdown.

```tsx
<Select label="Email notifications" options={["On", "Off"]} value="On" style={{ maxWidth: 320 }} />
```

### textarea

**Do** — Give a textarea a min-height for several lines and resize-y so it can grow with the content.

```tsx
<View style={{ maxWidth: 320 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Notes</Text>
  <Textarea rows={4} value="Describe the change in enough detail that a teammate could follow it…" />
</View>
```

**Don't** — A one-line, resize-none textarea clips multi-line input so users cannot review what they wrote.

```tsx
<View style={{ maxWidth: 320 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Notes</Text>
  <TextInput multiline value="Describe the change in enough detail that a teammate could follow it…" style={{ height: 36, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14, lineHeight: 20, color: tokens.foreground, overflow: "hidden" }} />
</View>
```
