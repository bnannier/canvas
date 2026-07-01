# InputOTP

A segmented one-time-code field: `length` cells display the typed digits while one underlying text input captures the keystrokes, so native SMS autofill, the one-time-code keyboard suggestion, and paste all flow into a single value. Pass the code with `value` and update it from `onChange`; `onComplete` fires once when the code reaches `length` digits. Style it with semantic boolean props (`small`, `large`, `masked`, `disabled`).

## Usage

```tsx
<InputOTP value="123" onChange={() => {}} />
```

## Variants

### Length - six vs four digits

```tsx
<Column relaxed>
  <InputOTP length={6} value="1234" onChange={() => {}} />
  <InputOTP length={4} value="12" onChange={() => {}} />
</Column>
```

### Masked

```tsx
<InputOTP masked value="1234" onChange={() => {}} />
```

### Sizes

```tsx
<Column relaxed>
  <InputOTP small value="123" onChange={() => {}} />
  <InputOTP value="123" onChange={() => {}} />
  <InputOTP large value="123" onChange={() => {}} />
</Column>
```

### Disabled

```tsx
<InputOTP disabled value="1234" onChange={() => {}} />
```

## Do & Don't

**Do** — Size the field to the real code length with `length`, so every digit has its own cell and the user can see how many remain.

```tsx
<InputOTP length={6} value="123" onChange={() => {}} />
```

**Don't** — Use `masked` for a code the user is meant to read back from an SMS; the bullets hide whether they typed it correctly.

```tsx
<InputOTP masked value="123456" onChange={() => {}} />
```
