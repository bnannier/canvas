# TextInput

Single-line (or multiline) text entry. Control it with `value` + `onChangeText`, and style the box with the usual View style props. Common props: `placeholder`, `secureTextEntry` (passwords), `keyboardType`, and `multiline`.

## Usage

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" />
```

## Variants

### Placeholder

```tsx
<TextInput placeholder="Search components..." />
```

### Multiline

```tsx
<TextInput accessibilityLabel="Notes" multiline defaultValue={"Multi-line text\nwraps and grows as you type."} />
```

## Do & Don't

### Labelled fields

**Do**: Reach for `Input` for a form field: its `label` stays in view, names the field for assistive tech, and the field box is drawn for each platform.

```tsx
<Input label="Email" placeholder="ada@example.com" />
```

**Don't**: Let a bare TextInput's placeholder stand in for the label; it vanishes as soon as the user types, taking the field's only name with it.

```tsx
<TextInput placeholder="Email" />
```
