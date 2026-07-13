# Input

The Input component is a React Native text field with semantic boolean props (`error`, `small`, `large`, `block`, `disabled`), plus prefix/suffix addons and overlaid icons. Input is single-line; for multi-line entry use the dedicated Textarea. Select and the search field share its look, and Field and Form compose a label, the control, and helper text.

## Usage

```tsx
<Input placeholder="rachel.chen@example.com" />
```

## Variants

### Addon - prefix

```tsx
<Input prefix="https://" placeholder="canvas.dev" />
```

### Addon - action

```tsx
<Input suffix="Copy" action value="cnv_3f9a21b8e7" />
```

### Addon - icon

```tsx
<Input leadingIcon icon="search" placeholder="Search" />
```

### State - error

```tsx
<Input error placeholder="rachel.chen@example.com" />
```

### State - disabled

```tsx
<Input disabled placeholder="rachel.chen@example.com" />
```

### State - readonly

```tsx
<Input readOnly placeholder="rachel.chen@example.com" />
```

## Do & Don't

### text

**Do** — Pair every field with a persistent label above the control.

```tsx
<Field label="Email" placeholder="ada@acme.dev" />
```

**Don't** — A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.

```tsx
<Input placeholder="Email" style={{ maxWidth: 320 }} />
```

### number

**Do** — Park the unit in a suffix addon so the value stays purely numeric.

```tsx
<Column snug>
  <Typography small medium>Storage</Typography>
  <Input value="1024" suffix="GB" />
</Column>
```

**Don't** — A plain text field lets users type the unit into the value, breaking parsing and validation.

```tsx
<Field label="Storage" value="1024 GB" style={{ maxWidth: 320 }} />
```
