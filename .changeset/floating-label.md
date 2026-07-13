---
"@olympusoss/canvas": minor
---

Input gains a platform-adaptive `label` (and `required`).

- **New `label` / `required` props on Input.** `label` names the field and its
  placement is platform-forward: **iOS and web render the label ABOVE the
  control** (the static title the Field/Form composers produced before), while
  **Android floats the Material 3 in-container label** — centered like a
  placeholder at rest, floating to the top (body-small) once the field is
  focused OR filled. The float runs a split-driver animation: `translateY` +
  `scale` on the transform driver (native off-thread on iOS/Android-Fabric, JS
  on react-native-web) and the label COLOR on a separate JS-driver value
  (muted at rest -> brand `ring` on focus -> `destructive` on error), so it
  animates on all three platforms without the Fabric layout-stuck / RNW
  loop-freeze pitfalls. The placeholder is gated to the focused state on the
  floating skin (M3), and a prefilled `value`/`defaultValue` starts floated.
  `required` adds a destructive "*" that is hidden from assistive tech and sets
  `aria-required`; the label is the field's programmatic name on both channels
  (`accessibilityLabel` + `aria-labelledby` -> the label's `nativeID`).
- **Field, Fieldset, and Form now DELEGATE their label to Input.** They drop the
  external `<Text>` label (and the `accessibilityLabel`/`aria-labelledby` they
  wired by hand) and pass `label`/`required` through, so the Android rows get the
  real M3 floating label. Each composer keeps rendering the helper/error MESSAGE
  below the control and links it as the field description (`aria-describedby`).
- **EXCEPTION (intentional):** Form's `sidebar` layout keeps its label in the
  BESIDE column (label + helper on the left, input on the right) rather than
  delegating — that beside-column arrangement is the layout's whole point, not
  the flagged missing-label gap, so `SidebarField` still renders its own label.
- Backward-compatible: `label`/`required` are additive and optional; a
  label-less Input returns the identical bare field as before. Only Input
  implements the label placement.
- **Follow-up (owed):** manual native verification on the iOS simulator and the
  Android emulator (the float geometry/tracking is code-reviewed but not
  device-checked here), and extending the same `label` treatment to Combobox,
  Select, and Textarea (currently static-above / label-less, out of scope).
