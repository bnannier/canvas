# InputOTP

A segmented one-time-code field: `length` cells display the typed digits while one underlying text input captures the keystrokes, so native SMS autofill, the one-time-code keyboard suggestion, and paste all flow into a single value. It works controlled (`value` + `onChangeText`) or uncontrolled (`defaultValue`, or nothing at all); `onComplete` fires once when the code reaches `length` digits. Style it with semantic boolean props (`small`, `large`, `masked`, `disabled`).

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

## Do & Don't

**Do** — Size the field to the real code length with `length`, so every digit has its own cell and the user can see how many remain.

```tsx
<InputOTP length={6} defaultValue="123" />
```

**Don't** — Use `masked` for a code the user is meant to read back from an SMS; the bullets hide whether they typed it correctly.

```tsx
<InputOTP masked defaultValue="123456" />
```
