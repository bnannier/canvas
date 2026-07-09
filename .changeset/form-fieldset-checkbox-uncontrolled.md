---
"@olympusoss/canvas": patch
---

Make the checkbox groups in Form and Fieldset toggle on press. Both rendered each data-row `<Checkbox checked={...}>` in controlled mode with no state, so the boxes were inert. They now pass the row's checked flag as `defaultChecked`, so each Checkbox self-manages (the toggle state lives in the Checkbox atom) and a bare Form/Fieldset checkbox row ticks on press.
