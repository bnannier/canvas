# Buttons

Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).

## Usage

```tsx
<Button primary>Save changes</Button>
```

## Variants

### Variant - outline

```tsx
<Button outline>Save changes</Button>
```

### Variant - secondary

```tsx
<Button secondary>Save changes</Button>
```

### Variant - ghost

```tsx
<Button ghost>Save changes</Button>
```

### Variant - destructive

```tsx
<Button destructive>Save changes</Button>
```

### Variant - link

```tsx
<Button link>Save changes</Button>
```

### Size - sm

```tsx
<Button primary small>Save changes</Button>
```

### Size - lg

```tsx
<Button primary large>Save changes</Button>
```

### Size - icon

```tsx
<Button primary icon>+</Button>
```

### Disabled

```tsx
<Button primary disabled>Save changes</Button>
```

### With icon

```tsx
<Button primary>+  Save changes</Button>
```

## Do & Don't

### Default (primary)

**Do** — One clear primary action; everything else is supporting.

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button outline>Cancel</Button>
</Row>
```

**Don't** — Multiple primaries compete; nothing stands out.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button primary>Save</Button>
  <Button primary>Apply</Button>
  <Button primary>Continue</Button>
</View>
```

### Outline

**Do** — Promote the main action to default; keep the rest outline.

```tsx
<Row alignCenter snug>
  <Button primary>Publish</Button>
  <Button outline>Save draft</Button>
  <Button outline>Schedule</Button>
</Row>
```

**Don't** — All-outline leaves no signal which action is primary.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button outline>Save</Button>
  <Button outline>Publish</Button>
  <Button outline>Schedule</Button>
</View>
```

### Secondary

**Do** — Default for the primary action; secondary for the next one down.

```tsx
<Row alignCenter snug>
  <Button primary>Create account</Button>
  <Button secondary>Import instead</Button>
</Row>
```

**Don't** — A secondary button as the main call to action under-sells it.

```tsx
<Button secondary>Create account</Button>
```

### Ghost

**Do** — Use ghost for tertiary and toolbar actions; keep the CTA filled.

```tsx
<Row alignCenter snug>
  <Button ghost>Cancel</Button>
  <Button primary>Save changes</Button>
</Row>
```

**Don't** — A ghost button is too quiet to carry the primary action.

```tsx
<Button ghost>Save changes</Button>
```

### Destructive

**Do** — Reserve the destructive variant for irreversible actions like delete.

```tsx
<Row alignCenter snug>
  <Button primary>Save changes</Button>
  <Button destructive>Delete account</Button>
</Row>
```

**Don't** — Red on a safe action cries wolf; users learn to ignore it.

```tsx
<Button destructive>Save changes</Button>
```

### Link

**Do** — Link variant for inline navigation; a filled button for the submit.

```tsx
<Row alignCenter cozy>
  <Button primary>Submit</Button>
  <Button link>Learn more</Button>
</Row>
```

**Don't** — A link-styled submit doesn't look pressable and gets lost.

```tsx
<Button link>Submit form</Button>
```
