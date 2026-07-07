---
"@olympusoss/canvas": minor
---

API-completeness foundation. `Input` and `Textarea` forward the curated
text-entry slice of React Native's TextInput (`defaultValue`, `secureTextEntry`,
`keyboardType`, `inputMode`, `autoCapitalize`, `autoComplete`, `autoCorrect`,
`autoFocus`, `maxLength`, `returnKeyType`, `textContentType`,
`onSubmitEditing`, `onFocus`/`onBlur` (chained with internal focus styling),
`onKeyPress`, `testID`), so real forms (login, search, OTP) are buildable. New
`useControllableState` hook powers controlled + uncontrolled duality; `Switch`
adopts it (`defaultChecked`; a bare `<Switch />` is now interactive) and gains
`testID`.
