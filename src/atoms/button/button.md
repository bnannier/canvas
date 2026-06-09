# Buttons

Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).

## Usage

```tsx
<Button primary>Save changes</Button>
```

## Do & Don't

### Default (primary)

**Do** — One clear primary action; everything else is supporting.

```tsx
<View className="flex-row items-center gap-2">
  <Button primary>Save</Button>
  <Button outline>Cancel</Button>
</View>
```

**Don't** — Multiple primaries compete; nothing stands out.

```tsx
<View className="flex-row items-center gap-2">
  <Button primary>Save</Button>
  <Button primary>Apply</Button>
  <Button primary>Continue</Button>
</View>
```

### Outline

**Do** — Promote the main action to default; keep the rest outline.

```tsx
<View className="flex-row items-center gap-2">
  <Button primary>Publish</Button>
  <Button outline>Save draft</Button>
  <Button outline>Schedule</Button>
</View>
```

**Don't** — All-outline leaves no signal which action is primary.

```tsx
<View className="flex-row items-center gap-2">
  <Button outline>Save</Button>
  <Button outline>Publish</Button>
  <Button outline>Schedule</Button>
</View>
```

### Secondary

**Do** — Default for the primary action; secondary for the next one down.

```tsx
<View className="flex-row items-center gap-2">
  <Button primary>Create account</Button>
  <Button secondary>Import instead</Button>
</View>
```

**Don't** — A secondary button as the main call to action under-sells it.

```tsx
<Button secondary>Create account</Button>
```

### Ghost

**Do** — Use ghost for tertiary and toolbar actions; keep the CTA filled.

```tsx
<View className="flex-row items-center gap-2">
  <Button ghost>Cancel</Button>
  <Button primary>Save changes</Button>
</View>
```

**Don't** — A ghost button is too quiet to carry the primary action.

```tsx
<Button ghost>Save changes</Button>
```

### Destructive

**Do** — Reserve the destructive variant for irreversible actions like delete.

```tsx
<View className="flex-row items-center gap-2">
  <Button primary>Save changes</Button>
  <Button destructive>Delete account</Button>
</View>
```

**Don't** — Red on a safe action cries wolf; users learn to ignore it.

```tsx
<Button destructive>Save changes</Button>
```

### Link

**Do** — Link variant for inline navigation; a filled button for the submit.

```tsx
<View className="flex-row items-center gap-3">
  <Button primary>Submit</Button>
  <Button link>Learn more</Button>
</View>
```

**Don't** — A link-styled submit doesn't look pressable and gets lost.

```tsx
<Button link>Submit form</Button>
```
