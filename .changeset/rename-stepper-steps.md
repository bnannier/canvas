---
"@bnannier/canvas": major
---

Rename two components so their names match what they do.

- The ± numeric control (a minus button, an editable numeric field, and a plus
  button, clamped to a range) was `NumberInput`. It is renamed `Stepper`, the
  name Apple uses for exactly this control (`UIStepper`); "NumberInput" read like
  a plain numeric text box and hid the increment/decrement behavior.
- The multi-step progress indicator (numbered circles joined by connectors, with
  horizontal, vertical, and progress-bar layouts) was `Stepper`. It is renamed
  `Steps` (matching Ant Design's split) to free the `Stepper` name for the control
  above.

Breaking changes for consumers:

- `NumberInput` → `Stepper`; the `NumberInputProps` type → `StepperProps`.
- The old `Stepper` (multi-step progress) → `Steps`; `StepperProps` (its props)
  → `StepsProps`. The `Step` item type is unchanged.

To migrate: if you used the numeric ± control, rename `NumberInput` to `Stepper`
(props are identical). If you used the multi-step progress indicator, rename
`Stepper` to `Steps` (props are identical). The docs move from
`/components/number-input` to `/components/stepper` and from `/components/stepper`
to `/components/steps`; the old numeric-control URL redirects to the new one.
