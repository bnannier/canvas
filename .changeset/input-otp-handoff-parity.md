---
"@nannier/canvas": minor
---

InputOTP matches the design hand-off's contract and pins its caret.

Minor because it adds four public capabilities to `InputOTP`:

- `groups`: split the run into dash-separated chunks (`length={6} groups={3}`
  reads 123-456). On the web skin, which connects cells within a run, each
  chunk now closes and rounds its own ends.
- `alphanumeric`: accept letters as well as digits and ask for the text
  keyboard. The hand-off spells this as `numeric` with a `true` default, which
  reads backwards against the semantic-prop rule that passing a prop turns it
  on, so Canvas names the inverse (the `hideLegend` / `hideGrid` precedent).
  The default is unchanged: digits only.
- `defaultValue`: seed the uncontrolled field, cleaned exactly as typed input
  is. Brings InputOTP in line with Input, Select, Autocomplete and Accordion.
- `autoFocus`: focus on mount, matching Input's `TextEntryProps`.

It also fixes a behaviour bug. One invisible text input spans the whole
segmented row, so a tap dropped the native caret wherever the pointer landed,
which on a partly-entered code is the middle of the string: typing 12, clicking
the first cell and typing 9 produced 912 rather than 129. The selection now
sits at the end of the code, so a keystroke always lands in the first unfilled
cell. A full-range select-all is left alone, so pasting still replaces a
complete code.
