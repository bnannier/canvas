# TextInput

Single-line (or multiline) text entry. Control it with `value` + `onChangeText`, and style the box with the usual View style props. Common props: `placeholder`, `secureTextEntry` (passwords), `keyboardType`, and `multiline`.

## Usage

```tsx
<TextInput
  defaultValue="Ada Lovelace"
  placeholder="Your name"
  style={{ width: 240, height: 40, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.input, color: tokens.foreground, backgroundColor: tokens.background }}
/>
```

## Variants

### Placeholder

```tsx
<TextInput
  placeholder="Search components..."
  placeholderTextColor={alpha(tokens.foreground, 0.5)}
  style={{ width: 240, height: 40, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.input, color: tokens.foreground, backgroundColor: tokens.background }}
/>
```

### Multiline

```tsx
<TextInput
  defaultValue={"Multi-line text\nwraps and grows as you type."}
  multiline
  style={{ width: 240, height: 84, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.input, color: tokens.foreground, backgroundColor: tokens.background, textAlignVertical: "top" }}
/>
```
