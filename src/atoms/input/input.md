# Inputs & Forms

The Input component is a React Native text field with semantic boolean props (`error`, `small`, `large`, `block`, `disabled`), plus prefix/suffix addons and overlaid icons; `multiline` turns it into a textarea. Select and the search field share its look, and Field and Form compose a label, the control, and helper text.

## Usage

```tsx
<Input placeholder="rachel.chen@example.com" className="max-w-[320px]" />
```

## Variants

### Control - number

```tsx
<Input placeholder="1024" className="max-w-[320px]" />
```

### Control - select

```tsx
<View className="max-w-[320px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Status</Text>
  <Select value="Active" options={["Active", "Inactive", "Pending"]} />
  <Text className="text-xs text-muted-foreground">We'll use this for account recovery.</Text>
</View>
```

### Control - textarea

```tsx
<Input multiline placeholder="Describe the change" className="max-w-[320px]" />
```

### State - error

```tsx
<Input error placeholder="rachel.chen@example.com" className="max-w-[320px]" />
```

### State - disabled

```tsx
<Input disabled placeholder="rachel.chen@example.com" className="max-w-[320px]" />
```

### State - readonly

```tsx
<Input readOnly placeholder="rachel.chen@example.com" className="max-w-[320px]" />
```

## Do & Don't

### text

**Do** — Pair every field with a persistent .label above the control.

```tsx
<Field label="Email" placeholder="ada@acme.dev" className="max-w-[320px]" />
```

**Don't** — A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.

```tsx
<Input placeholder="Email" className="max-w-[320px]" />
```

### number

**Do** — Use type="number" with inputmode and park the unit in a .input-addon so the value stays purely numeric.

```tsx
<View className="max-w-[320px]">
  <Text className="mb-1.5 text-sm font-medium text-foreground">Storage</Text>
  <Input value="1024" suffix="GB" />
</View>
```

**Don't** — A plain text field lets users type the unit into the value, breaking parsing and validation.

```tsx
<Field label="Storage" value="1024 GB" className="max-w-[320px]" />
```

### select

**Do** — Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two.

```tsx
<Select label="Status" options={["Active", "Inactive", "Pending", "Archived"]} value="Active" className="max-w-[320px]" />
```

**Don't** — A select for a single on/off choice buries a one-tap decision behind a dropdown.

```tsx
<Select label="Email notifications" options={["On", "Off"]} value="On" className="max-w-[320px]" />
```

### textarea

**Do** — Give a textarea a min-height for several lines and resize-y so it can grow with the content.

```tsx
<View className="max-w-[320px]">
  <Text className="mb-1.5 text-sm font-medium text-foreground">Notes</Text>
  <Textarea rows={4} value="Describe the change in enough detail that a teammate could follow it…" />
</View>
```

**Don't** — A one-line, resize-none textarea clips multi-line input so users cannot review what they wrote.

```tsx
<View className="max-w-[320px]">
  <Text className="mb-1.5 text-sm font-medium text-foreground">Notes</Text>
  <TextInput multiline value="Describe the change in enough detail that a teammate could follow it…" className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground overflow-hidden" />
</View>
```
