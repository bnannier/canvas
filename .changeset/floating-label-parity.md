---
"@bnannier/canvas": minor
---

Combobox, Select, and Textarea gain the platform-adaptive floating `label` for M3 parity with Input.

- **Shared floating-label helper.** The Material 3 in-container floating label
  (shipped for Input) is extracted into `src/style/floating-label.tsx`: a single
  `FloatingLabel` component + `FloatingLabelStyles` skin slice (`floatingLabel`,
  `labelAbove`/`labelRest`/`labelFloated`/`labelReserve`) + the split-driver
  animation. Input now consumes it (its inline copy is deleted, behavior
  byte-identical — its 16 label tests stay green), and Combobox, Select, and
  Textarea consume the same helper, so all four filled-field controls float their
  label identically and a fix lands once.
- **New behavior per control.** `label` names the field and its placement is
  platform-forward: **iOS and web render the label ABOVE the control**, while
  **Android floats the M3 in-container label** — centered like a placeholder at
  rest, floating to the top (body-small) once the control is active or filled.
  The float trigger is per control: Combobox/Select float on OPEN (their focus
  equivalent) or when a value is present; Textarea floats on focus or when filled,
  and (being multiline) rests the label on the first text line rather than the box
  middle. The native placeholder is gated so the resting label is the sole
  placeholder on the Android skin.
- **New `label` / `required` props on Textarea** (previously label-less); Combobox
  and Select keep their existing `label` and gain `required`. `required` adds a
  destructive "*" hidden from assistive tech and sets `aria-required`; the label
  is the control's programmatic name (`accessibilityLabel`/`aria-label`, plus
  `aria-labelledby` on Textarea, matching Input). Select's trigger is now named by
  its label on both channels (it previously rendered the label as unlinked text).
- The animation stays cross-platform-safe: `translateY` + `scale` on the transform
  driver (native off-thread on iOS/Android-Fabric, JS on react-native-web) and the
  label COLOR on a separate JS-driver value (muted -> brand `ring` -> `destructive`
  on error), never `fontSize`/`top`/`width` and never a color interpolated off the
  transform value. A flush Textarea always renders the label above (an in-container
  float makes no sense once its frame is dropped inside a toolbar Card).
- Backward-compatible: the new props are additive and optional; a label-less
  Combobox/Select/Textarea returns the identical control as before.
- **Follow-up (owed):** manual native verification on the iOS simulator and the
  Android emulator (the float geometry/tracking is code-reviewed but not
  device-checked here); the Select-with-leading-icon resting label uses the
  container's 16dp start inset (not indented past the icon), acceptable since the
  documented icon example carries a value and floats.
