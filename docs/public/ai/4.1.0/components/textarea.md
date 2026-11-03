# Textarea

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 56e9acdcc5d59c74fa11ff4461bc2b20c5a6dee1cb6818caafd94ea390815be0

Source: `src/atoms/textarea/textarea.md`
Human reference: https://canvas.nannier.com/components/textarea

## Public imports

```tsx
import { Textarea } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Multi-line input, with character count, with toolbar.

Pass `label` (and `required`) to name the field:
iOS and web render the label
above the control, while Android floats the Material 3 in-container label at the
top of the multiline box, making room for itself at the user's text size and
truncating on one line when it is longer than the box while the field's
accessible name stays the whole label.
The required star is decorative: a screen
reader hears the field as required,
from `aria-required` on the web and from its
name ("Bio, required") on iOS and Android.
The box fills the parent it is given; a step of its
own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or a Container
step sets its measure.

The box is the single-line Input's on each platform. On the web it is the sunken
well with a 1 px hairline that steps to the subtle ink on hover, takes the `ring`
edge and a 4 px accent halo on focus and the `destructive` edge on error, with a
400 value on a 1.55 line; the count is an 11 px mono caption ("12 / 280").
iOS keeps
its 8 pt `card` box with the error wash and a tabular count ("12/280").
Android uses
the same opaque muted surface as the other filled fields, and its count sits at the
end of the supporting-text row.
Its label uses `primary-text` when focused and
`destructive-text` on error. The over-limit character count also uses
`destructive-text` on every platform. Without `rows` the field starts four rows tall.

Inside an overlay, Escape follows the overlay's cancellation policy. A supplied
`onKeyPress` runs first and can call `preventDefault()` to handle Escape locally.
Cancelling an IME candidate keeps the overlay open.

`dense` preserves application paragraph fields with 13/19.5 semibold values,
the dense field inset and explicit visible rows. `eyebrow` supplies the matching
web label. `accessibilityLabel` overrides the visible label’s accessible name;
`readOnly` prevents edits without dimming or removing the field from focus.
`systemFocus` keeps the platform system focus outline.

`embedded` renders a bare editor inside a parent-owned field surface and focus frame, as used by Chat. It implies `flush` and removes the independent backing and focus outline; the parent must provide a visible focus treatment.

## Usage

```tsx
<Textarea placeholder="A few words about this project" />
```

## Variants

### With label

```tsx
<Textarea label="Description" placeholder="A few words about this project…" />
```

### Pre-filled

```tsx
<Textarea defaultValue="Renders natively on iOS and Android and on the web." />
```

### Required

```tsx
<Textarea label="Bio" required />
```

### Character counter

```tsx
<Textarea showCount maxLength={280} />
```

### Formatting toolbar

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row tight padTight>
    <Button ghost small>B</Button>
    <Button ghost small>I</Button>
  </Row>
  <Divider />
  <Textarea flush placeholder="Leave a comment…" />
</Card>
```

### Disabled

```tsx
<Textarea disabled placeholder="A few words about this project" />
```

### Measure

```tsx
<Column>
  <Textarea xs start rows={2} placeholder="xs step, pinned to the start (320)" />
  <Textarea lg start rows={2} placeholder="lg step, pinned to the start (512)" />
  <Container lg start><Textarea rows={2} placeholder="Bare, in an lg Container: fills it (512)" /></Container>
</Column>
```

## Do & Don't

### With label

**Do** — Set `rows` for a sensible starting height so users can see their text; the field grows with the content from there.

```tsx
<Textarea label="Description" rows={3} value="This is a longer description that runs past one line and stays readable." />
```

**Don't** — A locked, single-line textarea hides long content with no way to expand.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <TextInput numberOfLines={1} value="This is a longer description that runs past one line and gets clipped." style={{ height: 32, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14, lineHeight: 20, color: tokens.foreground }} />
</View>
```

### Character counter

**Do** — Show the live count against the cap and turn it destructive past the limit so the overage is precise. `showCount` treats `maxLength` as a soft cap and flips the count (and the field) destructive automatically once you run over.

```tsx
<Textarea label="Bio" showCount maxLength={120} rows={3} value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
```

**Don't** — A vague "over limit" message gives no number, so users cannot tell how much to trim.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Bio</Text>
  <Textarea rows={3} value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
  <View style={{ marginTop: 4, flexDirection: "row", justifyContent: "flex-end" }}>
    <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>over limit</Text>
  </View>
</View>
```

### Formatting toolbar

**Do** — Make each control a real focusable button that toggles an active state when pressed.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row alignCenter tight padTight>
    <Button ghost small>B</Button>
    <Button ghost small>I</Button>
    <Button ghost small>{"</>"}</Button>
  </Row>
  <Divider />
  <Textarea rows={4} flush placeholder="Leave a comment" />
</Card>
```

**Don't** — Static, unclickable glyphs look like a toolbar but cannot be pressed or focused.

```tsx
<View style={{ width: 400, maxWidth: "100%", overflow: "hidden", borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderBottomWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.3), paddingHorizontal: 12, paddingVertical: 8 }}>
    <Text style={{ paddingHorizontal: 8, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>B</Text>
    <Text style={{ paddingHorizontal: 8, fontSize: 14, lineHeight: 20, fontStyle: "italic" }}>I</Text>
    <Text style={{ paddingHorizontal: 8, fontFamily: "monospace", fontSize: 11 }}>{"</>"}</Text>
  </View>
  <Textarea rows={4} placeholder="Leave a comment" style={{ borderRadius: 0, borderWidth: 0, boxShadow: "none" }} />
</View>
```

### Disabled

**Do**: Pass `disabled` so the field blocks editing and focus, matching its dimmed look: the browser takes it out of the tab order, and VoiceOver and TalkBack announce it as dimmed.

```tsx
<Textarea label="Description" rows={3} disabled value="Read-only content the user must not change." />
```

**Don't** — Dimming a textarea while leaving it editable looks disabled but still accepts input.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <TextInput multiline editable textAlignVertical="top" value="Read-only content the user must not change." style={{ minHeight: 80, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, lineHeight: 20, color: tokens.foreground, opacity: 0.5 }} />
</View>
```

## Supported props

### TextareaProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| undefined | no |  | Controlled text value. Omit and use `defaultValue` for uncontrolled use. |
| onChangeText | ((next: string) => void) \| undefined | no |  | Fired with the next text value on each edit. |
| placeholder | string \| undefined | no |  | Placeholder shown while the field is empty. |
| label | string \| undefined | no |  | The field's persistent label. Its placement is platform-adaptive: iOS and web render it ABOVE the field; Android renders the Material 3 in-container FLOATING label — a MULTILINE float pinned to the first text line at rest, floating to the top once the field is focused or filled. The label names the field for a11y. |
| eyebrow | boolean \| undefined | no | false |  |
| systemFocus | boolean \| undefined | no | false | Preserve the platform system focus outline. |
| dense | boolean \| undefined | no | false | Dense paragraph-entry metrics matching the application field family. |
| accessibilityLabel | string \| undefined | no |  |  |
| readOnly | boolean \| undefined | no | false | Prevent edits while retaining focus and the resting appearance. |
| required | boolean \| undefined | no | false | Marks the field as required: appends a destructive "*" to the label (decorative, never in the accessible name) and announces the field as required, through aria-required on the web and with the word in its name ("Bio, required") on iOS and Android. The star and the spoken word take effect only alongside `label`. |
| rows | number \| undefined | no |  | Visible rows the field sizes to (4 when omitted). Sets the min height (rows times the skin's line plus the field's padding); the field still grows with content past this floor. |
| showCount | boolean \| undefined | no | false | Show a live character-count line inside the field's own anatomy: an end-aligned muted caption under the control reading "N / max" (just "N" when no `maxLength` is set), where N is the current text length. When on, `maxLength` becomes a SOFT cap rather than a hard one: it is NOT forwarded to the native TextInput (a hard cap silently drops the extra keystroke, so the overage could never be seen), the user can type past it, and once N exceeds `maxLength` the count turns destructive AND the field enters its error state automatically (red border/underline). Leave `showCount` off to keep `maxLength` as a hard input cap. |
| error | boolean \| undefined | no | false | Error/validation state: a destructive cue. `invalid` is an alias. |
| invalid | boolean \| undefined | no | false |  |
| small | boolean \| undefined | no | false | Size (pick one; default is the base text-sm field). |
| large | boolean \| undefined | no | false | Size (pick one; default is the base text-sm field). |
| disabled | boolean \| undefined | no | false | Blocks editing and focus, and dims the field. |
| flush | boolean \| undefined | no | false | Borderless: drop the field's own border and radius so it sits flush inside a framed container (e.g. a Card with a formatting toolbar above it). |
| embedded | boolean \| undefined | no | false | Bare editor inside a parent-owned field surface and focus frame. Implies flush. |
| style | StyleProp<Omit<TextStyle, SizingKey>> | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
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

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
