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

### Disabled

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} aria-disabled />
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

### Disabled

**Do**: Pair `editable={false}` with `aria-disabled`. The browser then disables the field and takes it out of the tab order, and VoiceOver and TalkBack announce it as dimmed.

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} aria-disabled />
```

**Don't**: Stop at `editable={false}`. On the web that is only read-only: the field stays a Tab stop and is announced as read-only, not unavailable.

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} />
```

### Focus ring

**Do**: Leave the keyboard focus ring to the primitive. It takes the theme's `ring` colour 2 px off the field, like every kit control, and the browser draws it on keyboard focus only.

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" />
```

**Don't**: Switch the outline off without painting a focus state of your own. A keyboard user then has no way to see which field takes their typing.

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" style={{ outlineWidth: 0, outlineStyle: "solid" }} />
```
