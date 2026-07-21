# Listbox

A custom (non-native) select: single or multi-select, an optional detail line under each option, and a checkmark on the chosen items. Reach for it when a native select can't show rich options; prefer a native select for simple short lists.

## Usage

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  bordered
/>
```

## Variants

### Multi

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: true },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  multi
  bordered
/>
```

### Small

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  bordered
  small
/>
```

### Large

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  bordered
  large
/>
```

### Narrow

```tsx
<Listbox
  narrow
  bordered
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
/>
```

### Wide

```tsx
<Listbox
  wide
  bordered
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
/>
```

### Detail line

```tsx
<Listbox
  items={[
    { label: "Rachel Chen", detail: "rachel@acme.io", selected: true },
    { label: "Ada Lovelace", detail: "ada@acme.io", selected: false },
    { label: "Kevin Turner", detail: "kevin@acme.io", selected: false },
    { label: "Linus Berg", detail: "linus@acme.io", selected: false }
  ]}
  bordered
/>
```

### Disabled

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  bordered
  disabled
/>
```

## Do & Don't

### Prefer a native select for simple lists

**Do** — For short, plain lists a native select is lighter, accessible, and uses the platform picker on mobile.

```tsx
<Select narrow open defaultValue="Yes" options={["Yes", "No"]} />
```

**Don't** — A custom listbox for two short options is heavier than it needs to be and worse on mobile.

```tsx
<Listbox narrow bordered items={[
    { label: "Yes", selected: true },
    { label: "No" }
  ]} />
```

### single

**Do** — Show exactly one checkmark, mirror it in the trigger value, and close the panel on pick.

```tsx
<Listbox narrow bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

**Don't** — Single-select with two checkmarks lies about state: only one option can be the value.

```tsx
<Listbox narrow bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

### multi

**Do** — Keep the panel open, toggle each option's own checkmark, and summarize the count in the trigger.

```tsx
<Column tight>
  <Select narrow defaultValue="3 selected" />
  <Listbox narrow multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</Column>
```

**Don't** — Don't close on each pick or echo only the last choice: multi-select needs to keep all selections visible.

```tsx
<View style={{ width: 224, gap: 4 }}>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, height: 36 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Backend</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>▾</Text>
  </View>
  <Listbox multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</View>
```
