# PhoneInput

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 56e9acdcc5d59c74fa11ff4461bc2b20c5a6dee1cb6818caafd94ea390815be0

Source: `src/molecules/phone-input/phone-input.md`
Human reference: https://canvas.nannier.com/components/phone-input

## Public imports

```tsx
import { PHONE_COUNTRIES, PhoneInput, flagOf } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A phone number field: the Input's box with a country segment at its start (the
chosen country and a caret, which open a list of countries with their names and
dial codes) and that country's dial code inline before the number. On the web the
segment is a small chip inside the field naming the country by its ISO code, and
the dial code and the number are set in the mono face, and in the country list each
row is a 16px flag 10px from the name with the dial code a 12px mono note at its end;
on iOS and Android it is the
country's flag.

The number and the country are each controlled (`value` / `country`) or
self-managed (`defaultValue` / `defaultCountry`), the segment defaults to the
kit's curated `PHONE_COUNTRIES` list (pass `countries` for a full or localized
one), and the number field asks for the phone keypad. Pass `label` (and
`required`) to name it; `error` paints the whole box, segment included, and
Field delegates its label, required mark and error into it. The required star is
decorative: a screen reader hears the number field as required,
from
`aria-required` on the web and from its name ("Phone number, required") on iOS and
Android.
On iOS the field is
drawn to the iOS input-field reference: the white box, the flag and gray caret
segment with its state-coloured divider, the dial code in the placeholder gray.

In glass mode the country list is a dense-layer glass card under the box; the
box, its segment and its number stay in place. A pick commits the country and
returns focus to the number at once, and a field that becomes disabled or
read-only while the list is open closes it. Solid mode paints the skin's own list.

## Usage

```tsx
<PhoneInput label="Phone number" placeholder="Add your phone number" />
```

## Variants

### Pre-filled

```tsx
<PhoneInput label="Phone number" defaultCountry="US" defaultValue="(415) 728-3046" />
```

### Another country

```tsx
<PhoneInput label="Phone number" defaultCountry="GB" placeholder="Add your phone number" />
```

### Error

```tsx
<Field label="Phone number" error="Invalid phone number.">
  <PhoneInput defaultCountry="US" defaultValue="(415) 72" />
</Field>
```

### Required

```tsx
<PhoneInput label="Phone number" required placeholder="Add your phone number" />
```

### Controlled country

```tsx
<Stateful initial="CA">
  {(country, setCountry) => (
    <Column snug>
      <PhoneInput label="Phone number" country={country} onCountryChange={setCountry} placeholder="Add your phone number" />
      <Typography small muted>Selected: {country}</Typography>
    </Column>
  )}
</Stateful>
```

### Custom country list

```tsx
<PhoneInput
  label="Phone number"
  countries={[
    { code: "FR", name: "France", dialCode: "+33" },
    { code: "DE", name: "Germany", dialCode: "+49" },
    { code: "ES", name: "Spain", dialCode: "+34" },
  ]}
  defaultCountry="DE"
  placeholder="Add your phone number"
/>
```

### Disabled

```tsx
<PhoneInput label="Phone number" disabled defaultValue="(415) 728-3046" />
```

### Sizes

```tsx
<Column relaxed>
  <PhoneInput small label="Small" placeholder="Add your phone number" />
  <PhoneInput label="Default" placeholder="Add your phone number" />
  <PhoneInput large label="Large" placeholder="Add your phone number" />
</Column>
```

## Do & Don't

### The country segment

**Do** — Let the segment carry the country so the number stays national and the dial code is never typed twice.

```tsx
<PhoneInput label="Phone number" defaultCountry="US" defaultValue="(415) 728-3046" />
```

**Don't** — A plain Input makes the user type the prefix, and nothing tells the app which country the digits belong to.

```tsx
<Input label="Phone number" defaultValue="+1 (415) 728-3046" />
```

### Errors

**Do** — Wrap the field in a Field so the message sits under the box and the box, segment included, paints the error border.

```tsx
<Field label="Phone number" error="Invalid phone number.">
  <PhoneInput defaultCountry="US" defaultValue="(415) 72" />
</Field>
```

**Don't** — A loose red caption beside a neutral box reads as unfinished, and a screen reader never hears it with the field.

```tsx
<Column tight>
  <PhoneInput label="Phone number" defaultCountry="US" defaultValue="(415) 72" />
  <Typography tiny destructive>Invalid phone number.</Typography>
</Column>
```

## Supported props

### PhoneEntryProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| autoFocus | boolean \| undefined | no | false | If true, focuses the input on componentDidMount. The default value is false. |
| defaultValue | string \| undefined | no |  | Provides an initial value that will change when the user starts typing. Useful for simple use-cases where you don't want to deal with listening to events and updating the value prop to keep the controlled state in sync. |
| maxLength | number \| undefined | no |  | Limits the maximum number of characters that can be entered. Use this instead of implementing the logic in JS to avoid flicker. |
| onBlur | ((e: BlurEvent) => void) \| undefined | no |  | Callback that is called when the text input is blurred Note: If you are trying to find the last value of TextInput, you can use the `onEndEditing` event, which is fired upon completion of editing. |
| onFocus | ((e: FocusEvent) => void) \| undefined | no |  | Callback that is called when the text input is focused |
| onSubmitEditing | ((e: TextInputSubmitEditingEvent) => void) \| undefined | no |  | Callback that is called when the text input's submit button is pressed. |
| onKeyPress | ((e: TextInputKeyPressEvent) => void) \| undefined | no |  | Callback that is called when a key is pressed. This will be called with `{ nativeEvent: { key: keyValue } }` where keyValue is 'Enter' or 'Backspace' for respective keys and the typed-in character otherwise including ' ' for space. Fires before onChange callbacks. Note: on Android only the inputs from soft keyboard are handled, not the hardware keyboard inputs. |
| returnKeyType | ReturnKeyTypeOptions \| undefined | no |  | enum('default', 'go', 'google', 'join', 'next', 'route', 'search', 'send', 'yahoo', 'done', 'emergency-call') Determines how the return key should look. |
| testID | string \| undefined | no |  | Used to locate this view in end-to-end tests |

### PhoneInputProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| undefined | no |  | The national number typed so far (controlled). Omit and use `defaultValue` for uncontrolled use. |
| onChangeText | ((text: string) => void) \| undefined | no |  | Called with the new number on each keystroke. |
| countries | readonly PhoneCountry[] \| undefined | no |  | The countries the segment offers, in the order shown. Defaults to the kit's curated `PHONE_COUNTRIES` list; pass a full, localized, or reordered list. |
| country | string \| undefined | no |  | The selected country's ISO alpha-2 code (controlled). Omit and use `defaultCountry`. |
| defaultCountry | string \| undefined | no |  | Initial country code for uncontrolled use. Defaults to "US" when the list has it, else the first row. |
| onCountryChange | ((code: string) => void) \| undefined | no |  | Called with the chosen country's code when a row is picked (both modes). |
| placeholder | string \| undefined | no |  | Placeholder shown while the number is empty. |
| label | string \| undefined | no |  | The field's persistent label, rendered above the box on every platform (a grouped field never floats its label). It is the number field's programmatic name, and Field delegates its label into it. |
| required | boolean \| undefined | no | false | Marks the field as required: a destructive "*" after the label (decorative, never in the accessible name), and the number field announced as required, through aria-required on the web and with the word in its name ("Phone number, required") on iOS and Android. |
| error | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| invalid | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| disabled | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| readOnly | boolean \| undefined | no | false | Read-only: shows the number but blocks editing and the country list. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium field). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium field). |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the number field when there is no `label`. |
| aria-describedby | string \| undefined | no |  | ID of the helper/error text that describes the field (its `nativeID`). |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| autoFocus | boolean \| undefined | no | false | If true, focuses the input on componentDidMount. The default value is false. |
| defaultValue | string \| undefined | no |  | Provides an initial value that will change when the user starts typing. Useful for simple use-cases where you don't want to deal with listening to events and updating the value prop to keep the controlled state in sync. |
| maxLength | number \| undefined | no |  | Limits the maximum number of characters that can be entered. Use this instead of implementing the logic in JS to avoid flicker. |
| onBlur | ((e: BlurEvent) => void) \| undefined | no |  | Callback that is called when the text input is blurred Note: If you are trying to find the last value of TextInput, you can use the `onEndEditing` event, which is fired upon completion of editing. |
| onFocus | ((e: FocusEvent) => void) \| undefined | no |  | Callback that is called when the text input is focused |
| onSubmitEditing | ((e: TextInputSubmitEditingEvent) => void) \| undefined | no |  | Callback that is called when the text input's submit button is pressed. |
| onKeyPress | ((e: TextInputKeyPressEvent) => void) \| undefined | no |  | Callback that is called when a key is pressed. This will be called with `{ nativeEvent: { key: keyValue } }` where keyValue is 'Enter' or 'Backspace' for respective keys and the typed-in character otherwise including ' ' for space. Fires before onChange callbacks. Note: on Android only the inputs from soft keyboard are handled, not the hardware keyboard inputs. |
| returnKeyType | ReturnKeyTypeOptions \| undefined | no |  | enum('default', 'go', 'google', 'join', 'next', 'route', 'search', 'send', 'yahoo', 'done', 'emergency-call') Determines how the return key should look. |
| testID | string \| undefined | no |  | Used to locate this view in end-to-end tests |
| ref | React.Ref<RNTextInput> | no |  | Ref to the underlying React Native host. Supports object refs and callback refs; native methods follow the platform's behavior. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
