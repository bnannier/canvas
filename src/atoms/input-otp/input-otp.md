# InputOTP

A segmented one-time-code field: `length` cells display the typed characters while one underlying text input captures the keystrokes, so native SMS autofill, the one-time-code keyboard suggestion, and paste all flow into a single value. Because that one input spans the whole row, the caret is pinned to the end of the code: tap any cell and the next character still lands in the first unfilled one, so a keystroke can never drop into the middle of a partly-entered code. It works controlled (`value` + `onChangeText`) or uncontrolled (`defaultValue`, or a bare `<InputOTP />` that is typeable out of the box); `onComplete` fires once the code reaches `length` characters. Style and shape it with semantic props: `groups` splits the run into dash-separated chunks, `alphanumeric` accepts letters as well as digits, and `small`, `large`, `masked`, `disabled` and `autoFocus` do what they say.

## Usage

```tsx
<InputOTP defaultValue="123" />
```

## Variants

### Length

```tsx
<Column relaxed>
  <InputOTP length={6} defaultValue="1234" />
  <InputOTP length={4} defaultValue="12" />
</Column>
```

### Grouped

```tsx
<Column relaxed>
  <InputOTP length={6} groups={3} defaultValue="123" />
  <InputOTP length={6} groups={2} small defaultValue="1234" />
</Column>
```

### Alphanumeric

```tsx
<InputOTP length={6} alphanumeric defaultValue="G7X" />
```

### Masked

```tsx
<InputOTP masked defaultValue="1234" />
```

### Sizes

```tsx
<Column relaxed>
  <InputOTP small defaultValue="123" />
  <InputOTP defaultValue="123" />
  <InputOTP large defaultValue="123" />
</Column>
```

### Disabled

```tsx
<InputOTP disabled defaultValue="1234" />
```

### Completion

```tsx
<Stateful initial="">
  {(code, setCode) => (
    <Column snug>
      <InputOTP length={4} onComplete={setCode} />
      <Typography muted>{code === "" ? "Waiting for the 4-digit code" : `Code ${code} received`}</Typography>
    </Column>
  )}
</Stateful>
```

## Do & Don't

**Do** — Size the field to the real code length with `length`, and split a long code with `groups` so the eye can chunk it the way the sender wrote it.

```tsx
<InputOTP length={6} groups={3} defaultValue="123" />
```

**Don't** — Use `masked` for a code the user is meant to read back from an SMS; the bullets hide whether they typed it correctly.

```tsx
<InputOTP masked defaultValue="123456" />
```
