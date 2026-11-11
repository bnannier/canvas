# Input

Package: @nannier/canvas
Version: 4.4.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 35b0556b3cf4787d8b9cdf8a7e93b47c770a9726957905f5b8d3a812e5fea783

Source: `src/atoms/input/input.md`
Human reference: https://canvas.nannier.com/components/input

## Public imports

```tsx
import { Input } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The Input component is a React Native text field with semantic boolean props
(`error`, `small`, `large`, `compact`, `disabled`), plus prefix/suffix addons, overlaid
icons (`leadingIcon` / `trailingIcon` with any Canvas glyph as `icon`), a
`passwordToggle` eye for a `secureTextEntry` value, a `clearable` clear
button, and a `shortcut` keycap. Input is single-line; for multi-line entry use the
dedicated Textarea.

On the web the eye shows what pressing it does: the open eye while the value is masked,
the struck-through eye once it is revealed. A field held
focused by an `InteractionOverride` (a docs specimen) draws the web's 1.5px accent caret,
blinking once a second, just after its value, since no real caret shows there.

`shortcut` shows a keyboard shortcut hint at the field's end, the key that focuses a
search field: a compact flat keycap (`<Kbd small flat>`, the 22 px cap; `tiny`, the 20 px
cap, on a `small` field) after the value and any inline suffix and before the trailing
glyphs, 8 px from the field's end and 10 px from the value (8 on a small field). It takes
the keys as Kbd's `keys` does: `"⌘K"` is one cap, `"⌘ K"` two. It is a hint only; bind
the key yourself.

Pass `label` (and `required`) to name the field:
iOS and web render the label
above the control, while Android floats the Material 3 in-container label. On
Android the field grows with the user's text size so the floated label never
meets the value, and a label longer than the field truncates on one line inside
it while the field's accessible name stays the whole label.
The required star is
decorative: a screen reader hears the field as required,
from `aria-required` on
the web and from its name ("Full name, required") on iOS and Android.
A field fills the parent it is given; a step of its own (`xs`, `lg`, …, with
`start` to pin it to the leading edge) or a Container step sets its measure.
Select and the search field share its look, and Field and Form compose that
label with helper and error text.
On iOS the field is the native text field in
Canvas's colors: a card-colored box with a hairline, a muted title above, a glyph
that tints with focus and error, and in solid mode an error wash. Under glass a
wash would cost the field's ink its contrast over the material, so the iOS field
takes none (the web's field a trace in dark only), and the error border, the tinted
glyph and a Field's message carry the state.
A prefix or suffix addon's fill is held to
the same bar: under glass it is only as dense as keeps its text at 4.5:1 over the field,
so in the browser's light palettes and on the iOS field in dark it is a faint trace.

Inside an overlay, Escape follows the overlay's cancellation policy. A supplied
`onKeyPress` runs first and can call `preventDefault()` to handle Escape locally.
Cancelling an IME candidate keeps the overlay open.

On web, the field is a sunken well: 40 pixels tall (32 small, 48 large) at the
10-pixel field corner, a hairline edge, a 12-pixel inset, a regular 14-pixel value
(13 small) and a medium 13-pixel muted label above. The edge darkens under the
pointer, takes the accent with a soft accent halo on focus, and turns red with a
red halo for an error; a read-only field is a dashed edge on no fill, and a
disabled one dims. A prefix sits in a muted box behind a divider, a passive
suffix is inline monospace text before the clear button (a small raised disc with
an x), and an action suffix is a button box at the end.

On iOS the clear button is the system's gray disc with an x, inside the boxed
suffix segment, and the action suffix's label is a semibold 15-point brand label.
On Android the suffix is inline text before the circled-x clear glyph, an errored
field shows a red alert glyph at its end (in place of a clear or eye button), and
a read-only field drops its fill under a dashed frame with a subtle underline.

`eyebrow` uses the original dense uppercase web field label, preserving its
9.5/12.35 metrics and tracking. Other platform label treatments retain their skin.

`soft` uses the brand’s entry-well fill where the skin provides it.
`systemFocus` preserves the platform’s system focus outline. An explicit
`accessibilityLabel` takes precedence over the visible label’s accessible name.

Pass `search` for the toolbar search: a magnifier, a borderless editor, and a
uppercase prompt while empty on web. The prompt names the editor unless
`accessibilityLabel` or `label` supplies its purpose.
iOS draws its search field
(a 36-point muted well) and Android the Material 3 search bar (a 56-dp muted
stadium).
`systemFocus` preserves the system
focus outline for the borderless editor.

## Usage

```tsx
<Input placeholder="rachel.chen@example.com" />
```

## Variants

### Compact

`compact` is an outlined well with a 12px inset and the platform's field corner.
Its default is 40px high with a 14px value; `small` is 32px/13px and `large` is
48px/16px. Labels sit above the well on every platform.

```tsx
<Input compact placeholder="noor@nannier.com" accessibilityLabel="Teammate email" />
```

### Toolbar search

```tsx
<Input search systemFocus placeholder="Search work items" />
```


### Label

```tsx
<Input label="Email" placeholder="rachel.chen@example.com" />
```

### Required

```tsx
<Input label="Full name" required placeholder="Rachel Chen" />
```

### Prefix

```tsx
<Input prefix="https://" placeholder="canvas.dev" />
```

### Action

```tsx
<Input suffix="Copy" action defaultValue="cnv_3f9a21b8e7" />
```

### Icon

```tsx
<Input leadingIcon icon="search" placeholder="Search" />
```

### Email

```tsx
<Input label="Email address" leadingIcon icon="mail" placeholder="example@domain.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
```

### Password

```tsx
<Input label="Password" leadingIcon icon="lock" secureTextEntry passwordToggle placeholder="••••••••" autoComplete="password" />
```

### Username

```tsx
<Input label="Username" leadingIcon icon="user" placeholder="yourname" defaultValue="danello87" autoCapitalize="none" autoComplete="username" />
```

### Date of birth

```tsx
<Input label="Date of birth" leadingIcon icon="calendar" placeholder="MM/DD/YYYY" keyboardType="numbers-and-punctuation" autoComplete="birthdate-full" />
```

### Currency

```tsx
<Input label="Amount" prefix="$" placeholder="0.00" keyboardType="decimal-pad" />
```

### Search

```tsx
<Input leadingIcon icon="search" clearable placeholder="Search" defaultValue="example" />
```

### Shortcut

```tsx
<Column>
  <Input leadingIcon icon="search" shortcut="⌘K" placeholder="Search components…" />
  <Input small shortcut="⌘K" placeholder="Search…" />
</Column>
```

### Card number

```tsx
<Input label="Card Number" trailingIcon icon="creditCard" placeholder="•••• •••• •••• ••••" keyboardType="number-pad" autoComplete="cc-number" textContentType="creditCardNumber" />
```

### Error

```tsx
<Input error placeholder="rachel.chen@example.com" />
```

### Disabled

```tsx
<Input disabled placeholder="rachel.chen@example.com" />
```

### Read only

```tsx
<Input readOnly accessibilityLabel="Email" defaultValue="rachel.chen@example.com" />
```

### Measure

```tsx
<Column snug>
  <Input xs start placeholder="xs step, pinned to the start (320)" />
  <Input lg start placeholder="lg step, pinned to the start (512)" />
  <Container lg start><Input placeholder="Bare, in an lg Container: fills it (512)" /></Container>
</Column>
```

## Do & Don't

### text

**Do** — Pass `label` so every field carries a persistent, programmatically-linked name.

```tsx
<Input label="Email" placeholder="ada@acme.dev" />
```

**Don't** — A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.

```tsx
<Input placeholder="Email" />
```

### number

**Do** — Park the unit in a suffix addon so the value stays purely numeric.

```tsx
<Input label="Storage" defaultValue="1024" suffix="GB" />
```

**Don't** — A plain text field lets users type the unit into the value, breaking parsing and validation.

```tsx
<Input label="Storage" defaultValue="1024 GB" />
```

### Read only or disabled

**Do**: Pass `readOnly` for a value people still need to reach. On the web it stays in the tab order and its text stays selectable.
On iOS and Android, React Native maps a read-only field to a disabled native view, so VoiceOver and TalkBack announce it as dimmed and Android cannot select its text.

```tsx
<Input label="Workspace ID" readOnly defaultValue="ws_8f2k1" />
```

**Don't**: Disable a field whose value people must read or copy. `disabled` takes it out of the tab order and announces it as unavailable on every platform.

```tsx
<Input label="Workspace ID" disabled defaultValue="ws_8f2k1" />
```

## Supported props

### InputProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| undefined | no |  | Current text value (controlled). Omit and use `defaultValue` for uncontrolled use. |
| onChangeText | ((text: string) => void) \| undefined | no |  | Called with the new text on each keystroke. |
| placeholder | string \| undefined | no |  | Placeholder shown while the field is empty. |
| label | string \| undefined | no |  | The field's persistent label. Its placement is platform-adaptive: iOS and web render it ABOVE the field (the static title the Field/Form composers produce today); Android renders the Material 3 in-container FLOATING label (centered like a placeholder at rest, floating to the top once the field is focused or filled). The label is the field's programmatic name (wired via both accessibilityLabel and aria-labelledby), so a placeholder is no longer needed for the accessible name. |
| search | boolean \| undefined | no | false | A toolbar search field with a magnifier and a tracked uppercase empty prompt on web. |
| eyebrow | boolean \| undefined | no | false | Dense uppercase eyebrow label where the skin offers it. |
| systemFocus | boolean \| undefined | no | false | Preserve the system focus outline on a framed field. |
| soft | boolean \| undefined | no | false | Use the brand’s softer entry-well fill where the skin provides it. |
| required | boolean \| undefined | no | false | Marks the field as required: appends a destructive "*" to the label (decorative, never in the accessible name) and announces the field as required, through aria-required on the web and with the word in its name ("Full name, required") on iOS and Android. The star takes effect only alongside `label`. |
| error | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| invalid | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| disabled | boolean \| undefined | no | false | State (orthogonal). `error` (alias `invalid`) flags a validation problem. |
| readOnly | boolean \| undefined | no | false | Read-only: shows the value but blocks editing without the dimmed look. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium field). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium field). |
| compact | boolean \| undefined | no | false | A compact outlined well: 40 high with a 14px value by default; small is 32/13, large is 48/16. Keeps the platform's field corner and places labels above. |
| prefix | string \| undefined | no |  | Leading addon content (e.g. "https://", "$", an icon glyph). |
| suffix | string \| undefined | no |  | Trailing addon content (e.g. "@canvas.dev", "USD", "Copy"). |
| leadingIcon | boolean \| undefined | no |  | Render `icon` as a passive glyph inside the left of the field. |
| trailingIcon | boolean \| undefined | no | false | Render `icon` as a passive glyph inside the right of the field. |
| icon | keyof IconGlyphProps \| undefined | no |  | Glyph name for leadingIcon/trailingIcon: any Canvas glyph (e.g. "search", "mail", "lock", "phone", "calendar", "creditCard"). |
| action | boolean \| undefined | no | false | Render the suffix as a pressable action button rather than a passive label. |
| onActionPress | ((event: GestureResponderEvent) => void) \| undefined | no |  | Called when the action suffix is pressed (action only). |
| passwordToggle | boolean \| undefined | no | false | A trailing eye button that reveals and re-masks a `secureTextEntry` value (the password field's show/hide toggle). The field starts masked; the button is announced as "Show password" / "Hide password". Takes effect only with `secureTextEntry`. |
| clearable | boolean \| undefined | no | false | A trailing clear button (a circled x) that empties the field, shown while the field holds text (the search field's clear affordance). Works in both the controlled and the uncontrolled mode: it clears the native field and reports "" through `onChangeText`. |
| shortcut | string \| undefined | no |  | A keyboard shortcut hint at the field's end: a compact flat keycap (`<Kbd small flat>`, the 20 px `tiny` cap on a `small` field) after the value and any inline suffix, before the trailing glyphs, the hint a search field shows for the key that focuses it (`shortcut="⌘K"`). Pass the keys as Kbd's `keys` takes them: `"⌘K"` is one cap, `"⌘ K"` two. A hint only: bind the key yourself. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the field when there is no programmatically-associated visible label. Maps to accessibilityLabel + the aria-label web alias on the underlying TextInput, so a Form/Field control is announced with its name. |
| aria-labelledby | string \| undefined | no |  | ID of the visible label element that names this field (its `nativeID`). react-native-web forwards aria-labelledby to the DOM input; prefer this over accessibilityLabel when a visible <Text> label is present so the label and field are programmatically linked. |
| aria-describedby | string \| undefined | no |  | ID of the helper/error text that describes this field (its `nativeID`), so a screen reader reads the hint after the field name. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| textContentType | "none" \| "name" \| "URL" \| "addressCity" \| "addressCityAndState" \| "addressState" \| "countryName" \| "creditCardNumber" \| "creditCardExpiration" \| "creditCardExpirationMonth" \| "creditCardExpirationYear" \| "creditCardSecurityCode" \| "creditCardType" \| "creditCardName" \| "creditCardGivenName" \| "creditCardMiddleName" \| "creditCardFamilyName" \| "emailAddress" \| "familyName" \| "fullStreetAddress" \| "givenName" \| "jobTitle" \| "location" \| "middleName" \| "namePrefix" \| "nameSuffix" \| "nickname" \| "organizationName" \| "postalCode" \| "streetAddressLine1" \| "streetAddressLine2" \| "sublocality" \| "telephoneNumber" \| "username" \| "password" \| "newPassword" \| "oneTimeCode" \| "birthdate" \| "birthdateDay" \| "birthdateMonth" \| "birthdateYear" \| "cellularEID" \| "cellularIMEI" \| "dateTime" \| "flightNumber" \| "shipmentTrackingNumber" \| undefined | no |  | Give the keyboard and the system information about the expected semantic meaning for the content that users enter. To disable autofill, set textContentType to `none`. Possible values for `textContentType` are: - `'none'` - `'URL'` - `'addressCity'` - `'addressCityAndState'` - `'addressState'` - `'countryName'` - `'creditCardNumber'` - `'creditCardExpiration'` (iOS 17+) - `'creditCardExpirationMonth'` (iOS 17+) - `'creditCardExpirationYear'` (iOS 17+) - `'creditCardSecurityCode'` (iOS 17+) - `'creditCardType'` (iOS 17+) - `'creditCardName'` (iOS 17+) - `'creditCardGivenName'` (iOS 17+) - `'creditCardMiddleName'` (iOS 17+) - `'creditCardFamilyName'` (iOS 17+) - `'emailAddress'` - `'familyName'` - `'fullStreetAddress'` - `'givenName'` - `'jobTitle'` - `'location'` - `'middleName'` - `'name'` - `'namePrefix'` - `'nameSuffix'` - `'nickname'` - `'organizationName'` - `'postalCode'` - `'streetAddressLine1'` - `'streetAddressLine2'` - `'sublocality'` - `'telephoneNumber'` - `'username'` - `'password'` - `'newPassword'` - `'oneTimeCode'` - `'birthdate'` (iOS 17+) - `'birthdateDay'` (iOS 17+) - `'birthdateMonth'` (iOS 17+) - `'birthdateYear'` (iOS 17+) - `'cellularEID'` (iOS 17.4+) - `'cellularIMEI'` (iOS 17.4+) - `'dateTime'` (iOS 15+) - `'flightNumber'` (iOS 15+) - `'shipmentTrackingNumber'` (iOS 15+) |
| autoCapitalize | "none" \| "sentences" \| "words" \| "characters" \| undefined | no |  | Can tell TextInput to automatically capitalize certain characters. characters: all characters, words: first letter of each word sentences: first letter of each sentence (default) none: don't auto capitalize anything https://reactnative.dev/docs/textinput#autocapitalize |
| autoComplete | "country" \| "name" \| "off" \| "nickname" \| "username" \| "password" \| "2fa-app-otp" \| "additional-name" \| "address-line1" \| "address-line2" \| "birthdate-day" \| "birthdate-full" \| "birthdate-month" \| "birthdate-year" \| "cc-csc" \| "cc-exp" \| "cc-exp-day" \| "cc-exp-month" \| "cc-exp-year" \| "cc-number" \| "cc-name" \| "cc-given-name" \| "cc-middle-name" \| "cc-family-name" \| "cc-type" \| "current-password" \| "email" \| "email-otp" \| "flight-confirmation-code" \| "flight-number" \| "family-name" \| "gender" \| "gift-card-number" \| "gift-card-pin" \| "given-name" \| "honorific-prefix" \| "honorific-suffix" \| "loyalty-account-number" \| "name-family" \| "name-given" \| "name-middle" \| "name-middle-initial" \| "name-prefix" \| "name-suffix" \| "new-password" \| "one-time-code" \| "organization" \| "organization-title" \| "password-new" \| "postal-address" \| "postal-address-country" \| "postal-address-dependent-locality" \| "postal-address-extended" \| "postal-address-extended-postal-code" \| "postal-address-locality" \| "postal-address-region" \| "postal-address-unit" \| "postal-code" \| "promo-code" \| "street-address" \| "sms-otp" \| "tel" \| "tel-country-code" \| "tel-national" \| "tel-device" \| "upi-vpa" \| "url" \| "wifi-password" \| "username-new" \| undefined | no |  | Specifies autocomplete hints for the system, so it can provide autofill. On Android, the system will always attempt to offer autofill by using heuristics to identify the type of content. To disable autocomplete, set autoComplete to off. The following values work across platforms: - `additional-name` - `address-line1` - `address-line2` - `cc-number` - `country` - `current-password` - `email` - `family-name` - `given-name` - `honorific-prefix` - `honorific-suffix` - `name` - `new-password` - `off` - `one-time-code` - `postal-code` - `street-address` - `tel` - `username` The following values work on iOS only: - `nickname` - `organization` - `organization-title` - `url` The following values work on Android only: - `birthdate-day` - `birthdate-full` - `birthdate-month` - `birthdate-year` - `cc-csc` - `cc-exp` - `cc-exp-day` - `cc-exp-month` - `cc-exp-year` - `2fa-app-otp` - `email-otp` - `flight-confirmation-code` - `flight-number` - `gender` - `gift-card-number` - `gift-card-pin` - `loyalty-account-number` - `name-family` - `name-given` - `name-middle` - `name-middle-initial` - `name-prefix` - `name-suffix` - `password` - `password-new` - `postal-address` - `postal-address-country` - `postal-address-dependent-locality` - `postal-address-extended` - `postal-address-extended-postal-code` - `postal-address-locality` - `postal-address-region` - `postal-address-unit` - `promo-code` - `sms-otp` - `tel-country-code` - `tel-national` - `tel-device` - `upi-vpa` - `wifi-password` - `username-new` |
| autoCorrect | boolean \| undefined | no | false | If false, disables auto-correct. The default value is true. |
| autoFocus | boolean \| undefined | no | false | If true, focuses the input on componentDidMount. The default value is false. |
| defaultValue | string \| undefined | no |  | Provides an initial value that will change when the user starts typing. Useful for simple use-cases where you don't want to deal with listening to events and updating the value prop to keep the controlled state in sync. |
| keyboardType | KeyboardTypeOptions \| undefined | no |  | enum("default", 'numeric', 'email-address', "ascii-capable", 'numbers-and-punctuation', 'url', 'number-pad', 'phone-pad', 'name-phone-pad', 'decimal-pad', 'twitter', 'web-search', 'visible-password') Determines which keyboard to open, e.g.numeric. The following values work across platforms: - default - numeric - email-address - phone-pad The following values work on iOS: - ascii-capable - numbers-and-punctuation - url - number-pad - name-phone-pad - decimal-pad - twitter - web-search The following values work on Android: - visible-password |
| inputMode | InputModeOptions \| undefined | no |  | Works like the inputmode attribute in HTML, it determines which keyboard to open, e.g. numeric and has precedence over keyboardType. |
| maxLength | number \| undefined | no |  | Limits the maximum number of characters that can be entered. Use this instead of implementing the logic in JS to avoid flicker. |
| onBlur | ((e: BlurEvent) => void) \| undefined | no |  | Callback that is called when the text input is blurred Note: If you are trying to find the last value of TextInput, you can use the `onEndEditing` event, which is fired upon completion of editing. |
| onFocus | ((e: FocusEvent) => void) \| undefined | no |  | Callback that is called when the text input is focused |
| onSubmitEditing | ((e: TextInputSubmitEditingEvent) => void) \| undefined | no |  | Callback that is called when the text input's submit button is pressed. |
| onKeyPress | ((e: TextInputKeyPressEvent) => void) \| undefined | no |  | Callback that is called when a key is pressed. This will be called with `{ nativeEvent: { key: keyValue } }` where keyValue is 'Enter' or 'Backspace' for respective keys and the typed-in character otherwise including ' ' for space. Fires before onChange callbacks. Note: on Android only the inputs from soft keyboard are handled, not the hardware keyboard inputs. |
| returnKeyType | ReturnKeyTypeOptions \| undefined | no |  | enum('default', 'go', 'google', 'join', 'next', 'route', 'search', 'send', 'yahoo', 'done', 'emergency-call') Determines how the return key should look. |
| secureTextEntry | boolean \| undefined | no | false | If true, the text input obscures the text entered so that sensitive text like passwords stay secure. The default value is false. |
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

See [installation](https://canvas.nannier.com/ai/4.4.0/installation.md) for required peers and feature fallbacks.
