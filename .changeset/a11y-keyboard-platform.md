---
"@bnannier/canvas": minor
---

Accessibility, keyboard, and platform correctness.

- **Slider is keyboard-operable on the web.** The handle is a tab stop and
  responds to Arrow keys (±step), PageUp/PageDown (±10 steps), and Home/End
  (min/max), all clamped, with `aria-valuenow` kept in sync. Disabled sliders
  leave the tab order and swallow keys.
- **Dialog & AlertDialog manage focus.** On open they move focus into the panel;
  Escape closes them; focus returns to the previously-focused element on close;
  Tab is trapped within the panel; and input-bearing dialogs avoid the iOS
  keyboard (`KeyboardAvoidingView`). All guarded so native/SSR never touch DOM
  globals.
- **Chip is accessible and native-feeling.** A toggle Chip exposes its active
  state (`accessibilityState.selected` + `aria-pressed`); a disabled interactive
  Chip keeps its button role; the remove button announces the specific chip
  ("Remove Draft") and has a ~44pt target; Android shows a press ripple.
- **Modal overlays respect the device.** `Drawer` and `ActionSheet` inset for
  safe areas (home indicator / notch) and avoid the keyboard on iOS.
