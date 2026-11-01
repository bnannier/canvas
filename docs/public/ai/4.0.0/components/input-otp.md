# InputOTP

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/atoms/input-otp/input-otp.md`
Human reference: https://canvas.nannier.com/components/input-otp

## Public imports

```tsx
import { InputOTP } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A segmented one-time-code field: `length` cells display the typed characters while one underlying text input captures the keystrokes, so native SMS autofill, the one-time-code keyboard suggestion, and paste all flow into a single value.

Because that one input spans the whole row, the caret is pinned to the end of the code: tap any cell and the next character still lands in the first unfilled one, so a keystroke can never drop into the middle of a partly-entered code. It works controlled (`value` + `onChangeText`) or uncontrolled (`defaultValue`, or a bare `<InputOTP />` that is typeable out of the box); `onComplete` fires once the code reaches `length` characters. Style and shape it with semantic props: `groups` splits the run into dash-separated chunks, `alphanumeric` accepts letters as well as digits, and `small`, `large`, `masked`, `disabled` and `autoFocus` do what they say.

## Usage

```tsx
<InputOTP />
```

## Variants

### Length

```tsx
<InputOTP length={4} />
```

### Grouped

```tsx
<InputOTP groups={3} />
```

### Alphanumeric

```tsx
<InputOTP alphanumeric defaultValue="G" />
```

### Masked

```tsx
<InputOTP masked defaultValue="1234" />
```

### Sizes

```tsx
<Column relaxed>
  <InputOTP small />
  <InputOTP />
  <InputOTP large />
</Column>
```

### Disabled

```tsx
<InputOTP disabled defaultValue="1234" />
```

## Do & Don't

### Readable codes

**Do** — Size the field to the real code length with `length`, and split a long code with `groups` so the eye can chunk it the way the sender wrote it.

```tsx
<InputOTP length={6} groups={3} />
```

**Don't** — Use `masked` for a code the user is meant to read back from an SMS; the bullets hide whether they typed it correctly.

```tsx
<InputOTP masked defaultValue="123456" />
```

## Supported props

### InputOTPProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| length | number \| undefined | no | 6 | Number of segment cells (and the max code length). Default 6. |
| value | string \| undefined | no |  | Current code (controlled). Only the typed characters, e.g. "123". Omit for uncontrolled use; a bare <InputOTP /> is typeable out of the box. |
| defaultValue | string \| undefined | no | "" | Starting code for the uncontrolled field. Defaults to empty. |
| onChangeText | ((code: string) => void) \| undefined | no |  | Called with the new code (cleaned, sliced to `length`) on each change (both modes). |
| onComplete | ((code: string) => void) \| undefined | no |  | Fired once when the code reaches `length` digits. |
| groups | number \| undefined | no |  | Split the run into groups of this many cells, separated by a dash: `length={6}` with `groups={3}` reads 123-456. Omit for one unbroken run. |
| alphanumeric | boolean \| undefined | no | false | Accept letters as well as digits, and ask for the text keyboard instead of the number pad. Off by default: a one-time code is digits only. |
| autoFocus | boolean \| undefined | no | false | Focus the field on mount. |
| disabled | boolean \| undefined | no | false | Disable input and dim the cells. |
| masked | boolean \| undefined | no | false | Render a bullet (●) instead of the character, for passcode entry. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium cell). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium cell). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<RNTextInput> | no |  | Ref to the underlying React Native host. Supports object refs and callback refs; native methods follow the platform's behavior. |

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
